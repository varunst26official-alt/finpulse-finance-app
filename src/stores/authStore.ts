import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFinanceStore } from './financeStore';
import { useTourStore } from './tourStore';
import { api } from '@/services/apiClient';
import { loadUserScopedData, clearActiveUserStores, saveUserScopedData } from '@/services/userStorage';

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
  isLoading: boolean;
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
      isLoading: false,

      login: async (email, password) => {
        if (!email || !password) {
          return { success: false, error: 'Email and password are required' };
        }
        if (password.length < 4) {
          return { success: false, error: 'Password must be at least 4 characters' };
        }

        set({ isLoading: true });
        try {
          const res = await api.auth.login(email, password);
          set({ user: res.user, isAuthenticated: true, isLoading: false });
          // Load this specific user's isolated storage
          loadUserScopedData(res.user);
          await useFinanceStore.getState().syncWithBackend();
          return { success: true };
        } catch (err: any) {
          // If server is offline or unreachable, allow client-side authentication
          if (
            err.message?.includes('fetch') ||
            err.message?.includes('status 404') ||
            err.message?.includes('Network') ||
            err.message?.includes('Failed')
          ) {
            const fallbackUser: UserProfile = {
              id: 'usr_' + Date.now(),
              fullName: email.split('@')[0],
              email: email,
              investorType: 'RETAIL',
              joinedDate: 'Today',
            };
            set({ user: fallbackUser, isAuthenticated: true, isLoading: false });
            loadUserScopedData(fallbackUser);
            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, error: err.message || 'Login failed' };
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
        try {
          const res = await api.auth.register({ fullName, email, password, phoneNumber });
          set({ user: res.user, isAuthenticated: true, isLoading: false });

          // Reset frontend store to clean ₹0 slate for new user
          useFinanceStore.getState().resetToFreshPortfolio(fullName);
          useTourStore.getState().resetTour();
          saveUserScopedData(res.user);
          await useFinanceStore.getState().syncWithBackend();

          return { success: true };
        } catch (err: any) {
          if (
            err.message?.includes('fetch') ||
            err.message?.includes('status 404') ||
            err.message?.includes('Network') ||
            err.message?.includes('Failed')
          ) {
            const fallbackUser: UserProfile = {
              id: 'usr_' + Date.now(),
              fullName,
              email,
              phoneNumber,
              investorType: 'RETAIL',
              joinedDate: 'Today',
            };
            set({ user: fallbackUser, isAuthenticated: true, isLoading: false });
            useFinanceStore.getState().resetToFreshPortfolio(fullName);
            useTourStore.getState().resetTour();
            saveUserScopedData(fallbackUser);
            return { success: true };
          }
          set({ isLoading: false });
          return { success: false, error: err.message || 'Registration failed' };
        }
      },

      logout: () => {
        const currentUser = get().user;
        if (currentUser) {
          saveUserScopedData(currentUser);
        }
        api.auth.logout();
        clearActiveUserStores();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'lifeos-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
