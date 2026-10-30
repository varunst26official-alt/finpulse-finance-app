import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFinanceStore } from './financeStore';
import { useLifeOSStore } from './lifeosStore';
import { useTourStore } from './tourStore';
import { api } from '@/services/apiClient';
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

        try {
          const res = await api.auth.login(normalizedEmail, password);
          set({ user: res.user, isAuthenticated: true, isDemoMode: false, authModalOpen: false, isLoading: false });
          loadUserScopedData(res.user);
          await useFinanceStore.getState().syncWithBackend();
          return { success: true };
        } catch (err: any) {
          // If server is offline, on static Vercel (405/404), or network fails, use client-side authentication
          console.warn('[LifeOS Auth] Server auth unavailable, using localized auth:', err?.message);

          const storedCredsRaw = localStorage.getItem(`lifeos_creds_${normalizedEmail}`);
          if (storedCredsRaw) {
            try {
              const creds = JSON.parse(storedCredsRaw);
              if (creds.password && creds.password !== password) {
                set({ isLoading: false });
                return { success: false, error: 'Incorrect password. Please try again.' };
              }
              const loggedUser: UserProfile = {
                id: creds.id || 'usr_' + Date.now(),
                fullName: creds.fullName || normalizedEmail.split('@')[0],
                email: normalizedEmail,
                phoneNumber: creds.phoneNumber,
                investorType: 'RETAIL',
                joinedDate: creds.joinedDate || 'Member',
              };
              set({ user: loggedUser, isAuthenticated: true, isDemoMode: false, authModalOpen: false, isLoading: false });
              loadUserScopedData(loggedUser);
              return { success: true };
            } catch (e) {
              console.warn('[LifeOS Auth] Error parsing credentials:', e);
            }
          }

          // If no previous stored password exists on this device, allow initial entry
          const fallbackUser: UserProfile = {
            id: 'usr_' + Date.now(),
            fullName: normalizedEmail.split('@')[0],
            email: normalizedEmail,
            investorType: 'RETAIL',
            joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          };

          localStorage.setItem(
            `lifeos_creds_${normalizedEmail}`,
            JSON.stringify({ ...fallbackUser, password })
          );

          set({ user: fallbackUser, isAuthenticated: true, isDemoMode: false, authModalOpen: false, isLoading: false });
          loadUserScopedData(fallbackUser);
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

        try {
          const res = await api.auth.register({
            fullName: fullName.trim(),
            email: normalizedEmail,
            password,
            phoneNumber: phoneNumber?.trim(),
          });
          set({ user: res.user, isAuthenticated: true, isDemoMode: false, authModalOpen: false, isLoading: false });

          useFinanceStore.getState().resetToFreshPortfolio(fullName);
          useLifeOSStore.getState().resetToFreshState();
          useTourStore.getState().resetTour();
          saveUserScopedData(res.user);
          await useFinanceStore.getState().syncWithBackend();

          return { success: true };
        } catch (err: any) {
          // If server is on static Vercel (405/404) or offline, complete registration locally
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
