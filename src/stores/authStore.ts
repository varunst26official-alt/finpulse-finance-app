import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { useFinanceStore } from './financeStore';
import { useTourStore } from './tourStore';

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
  login: (email: string, password: string) => { success: boolean; error?: string };
  register: (data: {
    fullName: string;
    email: string;
    password: string;
    phoneNumber?: string;
  }) => { success: boolean; error?: string };
  loginAsDemo: () => void;
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

      login: (email, password) => {
        if (!email || !password) {
          return { success: false, error: 'Email and password are required' };
        }
        if (password.length < 4) {
          return { success: false, error: 'Password must be at least 4 characters' };
        }

        const loggedInUser: UserProfile = {
          id: `usr_${Date.now()}`,
          fullName: email.split('@')[0].toUpperCase(),
          email,
          investorType: 'RETAIL',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };

        set({ user: loggedInUser, isAuthenticated: true });
        return { success: true };
      },

      register: ({ fullName, email, password, phoneNumber }) => {
        if (!fullName || !email || !password) {
          return { success: false, error: 'Name, email, and password are required' };
        }
        if (password.length < 6) {
          return { success: false, error: 'Password must be at least 6 characters' };
        }

        const newUser: UserProfile = {
          id: `usr_${Date.now()}`,
          fullName,
          email,
          phoneNumber,
          investorType: 'RETAIL',
          joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        };

        set({ user: newUser, isAuthenticated: true });

        // Clean slate for brand-new users: 0 Net Worth, 0 Holdings, 0 Balances
        useFinanceStore.getState().resetToFreshPortfolio(fullName);
        useTourStore.getState().resetTour();

        return { success: true };
      },

      loginAsDemo: () => {
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
        });

        // Load sample demonstration data for demo review
        useFinanceStore.getState().loadDemoSampleData();
      },

      logout: () => {
        set({ user: null, isAuthenticated: false });
      },
    }),
    {
      name: 'finpulse-auth-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
);
