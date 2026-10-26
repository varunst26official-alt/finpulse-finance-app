import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { Currency, Transaction, Asset, PortfolioSummary } from '@/types/finance';
import { INITIAL_ASSETS, INITIAL_TRANSACTIONS, INITIAL_HISTORY } from '@/data/mockData';

interface FinanceState {
  // Preferences
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  activeTab: 'dashboard' | 'investments' | 'transactions' | 'goals';
  setActiveTab: (tab: 'dashboard' | 'investments' | 'transactions' | 'goals') => void;

  // Data
  assets: Asset[];
  transactions: Transaction[];
  history: typeof INITIAL_HISTORY;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;

  // Computed Selectors
  getPortfolioSummary: () => PortfolioSummary;
}

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      currency: 'INR',
      setCurrency: (currency) => set({ currency }),

      activeTab: 'dashboard',
      setActiveTab: (activeTab) => set({ activeTab }),

      assets: INITIAL_ASSETS,
      transactions: INITIAL_TRANSACTIONS,
      history: INITIAL_HISTORY,

      addTransaction: (newTxData) => {
        const id = `tx_${Date.now()}`;
        const newTransaction: Transaction = {
          ...newTxData,
          id,
        };

        set((state) => {
          const updatedTransactions = [newTransaction, ...state.transactions];

          // Recompute asset positions
          const existingAsset = state.assets.find((a) => a.id === newTxData.assetId);
          let updatedAssets = [...state.assets];

          if (existingAsset) {
            const quantityChange = newTxData.type === 'BUY' ? newTxData.quantity : -newTxData.quantity;
            const newQty = Math.max(0, existingAsset.quantity + quantityChange);

            updatedAssets = state.assets.map((a) =>
              a.id === newTxData.assetId
                ? {
                    ...a,
                    quantity: newQty,
                  }
                : a
            );
          }

          return {
            transactions: updatedTransactions,
            assets: updatedAssets,
          };
        });
      },

      deleteTransaction: (id) => {
        set((state) => ({
          transactions: state.transactions.filter((tx) => tx.id !== id),
        }));
      },

      getPortfolioSummary: () => {
        const { assets } = get();

        let totalNetWorth = 0;
        let totalInvested = 0;

        const categoryTotals: Record<string, number> = {};

        assets.forEach((asset) => {
          const currentValue = asset.quantity * asset.currentMarketPrice;
          const investedValue = asset.quantity * asset.averageBuyPrice;

          totalNetWorth += currentValue;
          totalInvested += investedValue;

          categoryTotals[asset.category] = (categoryTotals[asset.category] || 0) + currentValue;
        });

        const totalUnrealizedPnL = totalNetWorth - totalInvested;
        const pnlPercentage = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

        // Allocation breakdown with percentages
        const allocationBreakdown = Object.entries(categoryTotals).map(([cat, val]) => ({
          category: cat as any,
          currentValue: val,
          percentage: totalNetWorth > 0 ? (val / totalNetWorth) * 100 : 0,
          color: '#6366f1',
        }));

        return {
          totalNetWorth,
          totalInvested,
          totalUnrealizedPnL,
          pnlPercentage,
          todaysChange: totalNetWorth * 0.0124, // Simulated +1.24% today
          todaysChangePercentage: 1.24,
          allocationBreakdown,
        };
      },
    }),
    {
      name: 'finpulse-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        currency: state.currency,
        transactions: state.transactions,
        assets: state.assets,
      }),
    }
  )
);
