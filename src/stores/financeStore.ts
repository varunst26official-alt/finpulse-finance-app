import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import {
  Currency,
  Transaction,
  Asset,
  PortfolioSummary,
  AiChatMessage,
  StockPrediction,
  MarketNewsItem,
  TaxReport,
} from '@/types/finance';
import {
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  INITIAL_HISTORY,
  INITIAL_AI_MESSAGES,
  STOCK_PREDICTIONS,
  MARKET_NEWS_ITEMS,
  TAX_REPORT_MOCK,
} from '@/data/mockData';

export type NavigationTab =
  | 'dashboard'
  | 'investments'
  | 'transactions'
  | 'goals'
  | 'ai-chat'
  | 'predictions'
  | 'news'
  | 'tax';

interface FinanceState {
  // Preferences
  currency: Currency;
  setCurrency: (currency: Currency) => void;
  activeTab: NavigationTab;
  setActiveTab: (tab: NavigationTab) => void;

  // Portfolio Data
  assets: Asset[];
  transactions: Transaction[];
  history: typeof INITIAL_HISTORY;

  // AI Wealth Copilot State
  aiMessages: AiChatMessage[];
  isAiTyping: boolean;
  sendAiMessage: (prompt: string) => void;
  clearAiChat: () => void;

  // Intelligence & Analytics Data
  predictions: StockPrediction[];
  newsItems: MarketNewsItem[];
  taxReport: TaxReport;

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

      aiMessages: INITIAL_AI_MESSAGES,
      isAiTyping: false,

      predictions: STOCK_PREDICTIONS,
      newsItems: MARKET_NEWS_ITEMS,
      taxReport: TAX_REPORT_MOCK,

      sendAiMessage: (prompt: string) => {
        const userMsg: AiChatMessage = {
          id: `msg_${Date.now()}`,
          role: 'user',
          content: prompt,
          timestamp: 'Just now',
        };

        set((state) => ({
          aiMessages: [...state.aiMessages, userMsg],
          isAiTyping: true,
        }));

        // AI Logic Engine with context injection
        setTimeout(() => {
          const { assets, getPortfolioSummary } = get();
          const summary = getPortfolioSummary();
          const lower = prompt.toLowerCase();

          let aiResponse = '';
          let suggested: string[] = [];

          if (lower.includes('risk') || lower.includes('audit') || lower.includes('allocation')) {
            aiResponse = `📊 **Portfolio Risk & Allocation Audit:**\n\n- **Net Worth Analyzed:** $${Math.round(summary.totalNetWorth).toLocaleString()} (₹${Math.round(summary.totalNetWorth * 84.5).toLocaleString()})\n- **Equity Concentration:** ~47% across Bluechips (Reliance, TCS) and Mutual Funds.\n- **Defensive Buffer:** 16% in Sovereign Gold Bonds (SGB) and 15% in Bank FDs.\n- **Liquid Cash Reserve:** $2,000 (~₹1.69 Lakhs) providing **4.8 months of emergency runway**.\n\n💡 **Copilot Recommendation:** Your Sharpe Ratio is an optimal **1.84**. Allocation is well-hedged against inflation. Consider adding international index exposure (Nasdaq 100) on pullbacks.`;
            suggested = ['Show me Tax Harvesting tips', 'What is Reliance 30-day forecast?'];
          } else if (lower.includes('tax') || lower.includes('ltcg') || lower.includes('capital gain')) {
            aiResponse = `🧾 **Capital Gains Tax Optimization (FY 2026-27):**\n\n- **Unrealized Long-Term Gains (LTCG):** ~$3,490 (₹2.95 Lakhs)\n- **Standard Tax-Free Exemption:** ₹1,25,000 per financial year.\n- **Tax Harvest Opportunity:** You have **$1,480 (₹1.25 Lakhs)** in tax-free exemption that resets on March 31!\n\n💡 **Action Item:** Sell partial shares of Reliance and TCS before March 31 and re-enter immediately to step up your cost basis. You will pocket zero tax on ₹1.25 Lakhs.`;
            suggested = ['View full Tax Optimizer tab', 'Simulate selling 20 shares of Reliance'];
          } else if (lower.includes('predict') || lower.includes('forecast') || lower.includes('reliance') || lower.includes('btc') || lower.includes('bitcoin')) {
            aiResponse = `🔮 **AI Asset Projections (Next 30-90 Days):**\n\n- **Reliance Industries:** Target **$38.20** (+9.8%) with an **88% Bullish Confidence Score**. Support at $32.80.\n- **Bitcoin (Cold Storage):** Target **$76,500** (+11.8%) with institutional ETF volume driving supply squeeze.\n- **Sovereign Gold (SGB):** Strong Buy rating (91% confidence) with central bank purchases acting as a geopolitical floor.\n\nCheck the **AI Forecaster** tab for Monte Carlo upper/lower prediction bands!`;
            suggested = ['Go to AI Stock Predictor', 'Audit my portfolio risk'];
          } else {
            aiResponse = `🤖 I've analyzed your question against your active portfolio of **${assets.length} instruments**.\n\nYour portfolio is currently yielding an annualized return of **+${summary.pnlPercentage.toFixed(1)}%**. Would you like me to run a deep risk audit, simulate capital gains tax, or check live news impacting your holdings?`;
            suggested = [
              'Audit my asset allocation risk',
              'How much LTCG tax do I owe?',
              'Show latest market news affecting my stocks',
            ];
          }

          const assistantMsg: AiChatMessage = {
            id: `msg_ai_${Date.now()}`,
            role: 'assistant',
            content: aiResponse,
            timestamp: 'Just now',
            suggestedPrompts: suggested,
          };

          set((state) => ({
            aiMessages: [...state.aiMessages, assistantMsg],
            isAiTyping: false,
          }));
        }, 750);
      },

      clearAiChat: () => {
        set({ aiMessages: INITIAL_AI_MESSAGES });
      },

      addTransaction: (newTxData) => {
        const id = `tx_${Date.now()}`;
        const newTransaction: Transaction = {
          ...newTxData,
          id,
        };

        set((state) => {
          const updatedTransactions = [newTransaction, ...state.transactions];

          // Recompute asset positions
          const existingAsset = state.assets.find((a: Asset) => a.id === newTxData.assetId);
          let updatedAssets = [...state.assets];

          if (existingAsset) {
            const quantityChange = newTxData.type === 'BUY' ? newTxData.quantity : -newTxData.quantity;
            const newQty = Math.max(0, existingAsset.quantity + quantityChange);

            updatedAssets = state.assets.map((a: Asset) =>
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
          transactions: state.transactions.filter((tx: Transaction) => tx.id !== id),
        }));
      },

      getPortfolioSummary: () => {
        const { assets } = get();

        let totalNetWorth = 0;
        let totalInvested = 0;

        const categoryTotals: Record<string, number> = {};

        assets.forEach((asset: Asset) => {
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
        aiMessages: state.aiMessages,
      }),
    }
  )
);
