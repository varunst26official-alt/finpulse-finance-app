import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface AppPreferences {
  autoDetectionEnabled: boolean;
  setAutoDetectionEnabled: (enabled: boolean) => void;
}

export const usePreferencesStore = create<AppPreferences>()(
  persist(
    (set) => ({
      autoDetectionEnabled: false,
      setAutoDetectionEnabled: (enabled: boolean) => set({ autoDetectionEnabled: enabled }),
    }),
    {
      name: 'quantra-lifeos-preferences',
      storage: createJSONStorage(() => localStorage),
    }
  )
);