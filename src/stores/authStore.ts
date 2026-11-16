import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFinanceStore } from './financeStore';
import { useLifeOSStore } from './lifeosStore';
import { useTourStore } from './tourStore';
import { api, ApiError } from '@/services/apiClient';
import { loadUserScopedData, saveUserScopedData, clearActiveUserStores } from '@/services/userStorage';

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string;
  investorType: 'RETAIL' | 'HNI' | 'INSTITUTIONAL';
  joinedDate: string;
}

interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isDemoMode: boolean;
  authModalOpen: boolean;
  authModalFeatureName: string;
  isLoading: boolean;
  openAuthModal: (featureName?: string) => void;
  closeAuthModal: () => void;
  requireAuth: (featureName?: string) => boolean;
  loginAsDemo: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false, // Default to false so first-time visitors must sign in or register
      isDemoMode: false,
      authModalOpen: false,
      authModalFeatureName: 'this feature',
      isLoading: false,

      openAuthModal: (featureName = 'this feature') => {
        set({ authModalOpen: true, authModalFeatureName: featureName });
      },

      closeAuthModal: () => {
        set({ authModalOpen: false });
      },

      requireAuth: (featureName = 'this feature') => {
        if (get().isDemoMode) {
          set({ authModalOpen: true, authModalFeatureName: featureName });
          return false;
        }
        return true;
      },

      loginAsDemo: async () => {
        set({ isLoading: true });
        clearActiveUserStores();
        api.auth.logout();
        const demoUser: UserProfile = {
          id: 'demo_varun_senthil_kumar',
          fullName: 'Varun Senthil kumar',
          email: 'varun@quantra.io',
          investorType: 'HNI',
          joinedDate: 'Verified Pro Member',
        };
        set({
          user: demoUser,
          isAuthenticated: true,
          isDemoMode: true,
          isLoading: false,
          authModalOpen: false,
        });
        loadUserScopedData(demoUser);
      },

      login: async (email, password) => {
        if (!email || !password) {
          return { success: false, error: 'Email and password are required' };
        }
        if (password.length < 4) {
          return { success: false, error: 'Password must be at least 4 characters' };
        }

        set({ isLoading: true });
        const normalizedEmail = email.toLowerCase().trim();

        // Wipe any prior in-memory stores before authenticating incoming user
        clearActiveUserStores();

        try {
          const res = await api.auth.login(normalizedEmail, password);
          if (!res || !res.success || !res.user || !res.user.email) {
            set({ isLoading: false });
            return { success: false, error: 'Invalid email or password.' };
          }
          set({ user: res.user, isAuthenticated: true, isDemoMode: false, authModalOpen: false, isLoading: false });
          // Store successful credentials locally for offline continuity
          localStorage.setItem(
            `lifeos_creds_${normalizedEmail}`,
            JSON.stringify({ ...res.user, password })
          );
          loadUserScopedData(res.user);
          await useFinanceStore.getState().syncWithBackend();
          return { success: true };
        } catch (err: any) {
          // If server explicitly responded with an authentication rejection (401, 400, 403, 404)
          if (
            err instanceof ApiError &&
            (err.status === 401 || err.status === 400 || err.status === 403 || err.status === 404)
          ) {
            set({ isLoading: false });
            return { success: false, error: err.message || 'Invalid email or password.' };
          }
          if (
            err?.message &&
            (err.message.includes('Invalid') ||
              err.message.includes('password') ||
              err.message.includes('401') ||
              err.message.includes('not found'))
          ) {
            set({ isLoading: false });
            return { success: false, error: err.message || 'Invalid email or password.' };
          }

          // ONLY if server is truly unreachable (network offline or mobile standalone):
          console.warn('[LifeOS Auth] Server auth network unreachable, checking local credentials:', err?.message);

          // Seed default accounts for local offline validation
          const defaultAccounts: Record<string, { id: string; fullName: string; password: string; investorType: 'RETAIL' | 'HNI' | 'INSTITUTIONAL'; joinedDate: string }> = {
            'admin@quantra.io': {
              id: 'usr_superadmin',
              fullName: 'Super Administrator',
              password: 'admin123',
              investorType: 'INSTITUTIONAL',
              joinedDate: 'Jan 2026',
            },
            'investor@quantra.io': {
              id: 'usr_investor',
              fullName: 'Quantra Investor',
              password: 'password123',
              investorType: 'HNI',
              joinedDate: 'Jan 2026',
            },
          };

          const storedCredsRaw = localStorage.getItem(`lifeos_creds_${normalizedEmail}`);
          let creds: any = null;

          if (storedCredsRaw) {
            try {
              creds = JSON.parse(storedCredsRaw);
            } catch (e) {
              console.warn('[LifeOS Auth] Error parsing credentials:', e);
            }
          } else if (defaultAccounts[normalizedEmail]) {
            creds = defaultAccounts[normalizedEmail];
          }

          // STRICT CHECK 1: Account existence
          if (!creds) {
            set({ isLoading: false });
            return {
              success: false,
              error: 'Account not found. Please verify your email and password, or register a new account.',
            };
          }

          // STRICT CHECK 2: Password matching (strictly non-empty and exact match)
          if (!creds.password || creds.password !== password) {
            set({ isLoading: false });
            return {
              success: false,
              error: 'Incorrect password. Please try again.',
            };
          }

          const loggedUser: UserProfile = {
            id: creds.id || 'usr_' + Date.now(),
            fullName: creds.fullName || normalizedEmail.split('@')[0],
            email: normalizedEmail,
            phoneNumber: creds.phoneNumber,
            investorType: creds.investorType || 'RETAIL',
            joinedDate: creds.joinedDate || 'Member',
          };

          set({
            user: loggedUser,
            isAuthenticated: true,
            isDemoMode: false,
            authModalOpen: false,
            isLoading: false,
          });

          // Ensure credentials remain saved for future offline sign-ins
          localStorage.setItem(
            `lifeos_creds_${normalizedEmail}`,
            JSON.stringify({ ...loggedUser, password })
          );

          loadUserScopedData(loggedUser);
          return { success: true };
        }
      },

      register: async ({ fullName, email, password, phoneNumber }) => {
        if (!fullName || !email || !password) {
          return { success: false, error: 'Name, email, and password are required' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        set({ isLoading: true });
        const normalizedEmail = email.toLowerCase().trim();

        // Wipe prior in-memory stores before registering new account
        clearActiveUserStores();

        try {
          const res = await api.auth.register({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password,
            phoneNumber: phoneNumber?.trim(),
          });
          if (!res || !res.success || !res.user || !res.user.email) {
            set({ isLoading: false });
            return { success: false, error: 'Registration failed. Please try again.' };
          }
          set({ user: res.user, isAuthenticated: true, isDemoMode: false, authModalOpen: false, isLoading: false });

          // Cache credentials locally for offline support
          localStorage.setItem(
            `lifeos_creds_${normalizedEmail}`,
            JSON.stringify({ ...res.user, password })
          );

          useFinanceStore.getState().resetToFreshPortfolio(fullName.trim());
          useLifeOSStore.getState().resetToFreshState();
          useTourStore.getState().resetTour();
          saveUserScopedData(res.user);
          await useFinanceStore.getState().syncWithBackend();

          return { success: true };
        } catch (err: any) {
          // If server explicitly returned 409 Conflict (User exists) or 400 Bad Request, propagate error
          if (err instanceof ApiError && (err.status === 409 || err.status === 400)) {
            set({ isLoading: false });
            return { success: false, error: err.message || 'An account with this email already exists.' };
          }
          if (err?.message && (err.message.includes('already exists') || err.message.includes('409'))) {
            set({ isLoading: false });
            return { success: false, error: err.message || 'An account with this email already exists.' };
          }

          // If offline and email already stored locally:
          const existingLocal = localStorage.getItem(`lifeos_creds_${normalizedEmail}`);
          if (existingLocal) {
            set({ isLoading: false });
            return { success: false, error: 'An account with this email already exists.' };
          }

          console.warn('[LifeOS Auth] Server registration unavailable, completing locally:', err?.message);

          const newUser: UserProfile = {
            id: 'usr_' + Date.now(),
            fullName: fullName.trim(),
            email: normalizedEmail,
            phoneNumber: phoneNumber?.trim(),
            investorType: 'RETAIL',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          };

          // Store credentials locally for future sign-ins
          localStorage.setItem(
            `lifeos_creds_${normalizedEmail}`,
            JSON.stringify({ ...newUser, password })
          );

          set({ user: newUser, isAuthenticated: true, isDemoMode: false, authModalOpen: false, isLoading: false });
          useFinanceStore.getState().resetToFreshPortfolio(fullName.trim());
          useLifeOSStore.getState().resetToFreshState();
          useTourStore.getState().resetTour();
          saveUserScopedData(newUser);

          return { success: true };
        }
      },

      logout: () => {
        const currentUser = get().user;
        if (currentUser) {
          saveUserScopedData(currentUser);
        }
        api.auth.logout();
        set({ user: null, isAuthenticated: false, isDemoMode: false, authModalOpen: false, isLoading: false });
        clearActiveUserStores();
      },
    }),
    {
      name: 'lifeos-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
