import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFinanceStore } from './financeStore';
import { useTourStore } from './tourStore';
import { api } from '@/services/apiClient';

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
  loginAsDemo: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: {
        id: 'usr_demo',
        fullName: 'Varun S T',
        email: 'varunst26official@gmail.com',
        phoneNumber: '+91 98765 43210',
        investorType: 'HNI',
        joinedDate: 'March 2024',
      },
      isAuthenticated: true, // Default to demo session for instant review, full logout available
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
          // Synchronize store with persistent backend SQLite database
          await useFinanceStore.getState().syncWithBackend();
          return { success: true };
        } catch (err: any) {
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

          // Reset frontend store to clean ₹0 slate
          useFinanceStore.getState().resetToFreshPortfolio(fullName);
          useTourStore.getState().resetTour();
          await useFinanceStore.getState().syncWithBackend();

          return { success: true };
        } catch (err: any) {
          set({ isLoading: false });
          return { success: false, error: err.message || 'Registration failed' };
        }
      },

      loginAsDemo: async () => {
        set({ isLoading: true });
        try {
          const res = await api.auth.demo();
          set({ user: res.user, isAuthenticated: true, isLoading: false });
          await useFinanceStore.getState().syncWithBackend();
        } catch (err) {
          console.warn('Backend offline, using local demo fallback:', err);
          set({
            user: {
              id: 'usr_demo',
              fullName: 'Varun S T',
              email: 'varunst26official@gmail.com',
              phoneNumber: '+91 98765 43210',
              investorType: 'HNI',
              joinedDate: 'March 2024',
            },
            isAuthenticated: true,
            isLoading: false,
          });
          useFinanceStore.getState().loadDemoSampleData();
        }
      },

      logout: () => {
        api.auth.logout();
        set({ user: null, isAuthenticated: false, isLoading: false });
      },
    }),
    {
      name: 'finpulse-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
