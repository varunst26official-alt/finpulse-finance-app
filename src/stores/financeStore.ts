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
  ExpenseItem,
  IncomeItem,
  AssetCategory,
  TradeActionPayload,
} from '@/types/finance';
import {
  INITIAL_ASSETS,
  INITIAL_TRANSACTIONS,
  INITIAL_HISTORY,
  INITIAL_AI_MESSAGES,
  STOCK_PREDICTIONS,
  MARKET_NEWS_ITEMS,
  TAX_REPORT_MOCK,
  INITIAL_EXPENSES,
  INITIAL_INCOMES,
} from '@/data/mockData';
import { CATEGORY_COLORS, formatCurrency } from '@/utils/formatters';
import { parseTradeIntent } from '@/services/aiTradeParser';

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

  // Floating Chat Widget visibility
  isFloatingChatOpen: boolean;
  setIsFloatingChatOpen: (isOpen: boolean) => void;
  toggleFloatingChat: () => void;

  // Portfolio & Wealth Data
  assets: Asset[];
  transactions: Transaction[];
  expenses: ExpenseItem[];
  incomes: IncomeItem[];
  history: typeof INITIAL_HISTORY;

  // AI Wealth Copilot State
  aiMessages: AiChatMessage[];
  isAiTyping: boolean;
  sendAiMessage: (prompt: string) => void;
  executeChatTradeAction: (messageId: string, actionPayload: TradeActionPayload) => void;
  clearAiChat: () => void;

  // Intelligence & Analytics Data
  predictions: StockPrediction[];
  newsItems: MarketNewsItem[];
  taxReport: TaxReport;

  // Actions
  addTransaction: (tx: Omit<Transaction, 'id'>) => void;
  deleteTransaction: (id: string) => void;
  addAsset: (asset: Omit<Asset, 'id' | 'lastUpdated'>) => void;
  deleteAsset: (id: string) => void;
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<IncomeItem, 'id'>) => void;
  deleteIncome: (id: string) => void;

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

      isFloatingChatOpen: false,
      setIsFloatingChatOpen: (isFloatingChatOpen) => set({ isFloatingChatOpen }),
      toggleFloatingChat: () => set((state) => ({ isFloatingChatOpen: !state.isFloatingChatOpen })),

      assets: INITIAL_ASSETS,
      transactions: INITIAL_TRANSACTIONS,
      expenses: INITIAL_EXPENSES,
      incomes: INITIAL_INCOMES,
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

        // AI Engine with Trade Intent Detection and Context Injection
        setTimeout(() => {
          const { assets, expenses, incomes, currency, getPortfolioSummary, executeChatTradeAction } = get();
          const summary = getPortfolioSummary();
          const lower = prompt.toLowerCase();

          // 1. Check if user is confirming a pending trade from conversation
          if (
            lower.includes('confirm') ||
            lower.includes('execute') ||
            lower.includes('yes proceed') ||
            lower.includes('yes buy') ||
            lower.includes('yes sell')
          ) {
            const pendingMsg = [...get().aiMessages]
              .reverse()
              .find((m) => m.tradeAction && m.tradeAction.status === 'PENDING');

            if (pendingMsg && pendingMsg.tradeAction) {
              executeChatTradeAction(pendingMsg.id, pendingMsg.tradeAction);
              set({ isAiTyping: false });
              return;
            }
          }

          // 2. Check for Natural Language Trade / Outflow Intent
          const tradeIntent = parseTradeIntent(prompt, currency);

          let aiResponse = '';
          let suggested: string[] = [];
          let tradeActionPayload: TradeActionPayload | undefined = undefined;

          if (tradeIntent) {
            tradeActionPayload = tradeIntent;

            if (tradeIntent.actionType === 'TRADE') {
              const formattedPrice = formatCurrency(tradeIntent.pricePerUnit, currency);
              const formattedTotal = formatCurrency(tradeIntent.totalAmount, currency);

              aiResponse = `⚡ **Trade Order Prepared for Execution:**\n\n- **Order Type:** ${tradeIntent.tradeType} ${tradeIntent.category}\n- **Instrument:** ${tradeIntent.symbol} (${tradeIntent.name})\n- **Quantity:** ${tradeIntent.quantity} shares / units\n- **Execution Price:** ${formattedPrice} / unit\n- **Total Order Value:** **${formattedTotal}**\n- **Broker Platform:** ${tradeIntent.platform || 'Zerodha Kite'}\n\nReview order specs below and click **Execute Trade Now** or reply *"Confirm trade"* to book it into your portfolio.`;
              suggested = ['Execute Trade Now', 'Show Reliance 30-day target', 'Cancel Order'];
            } else if (tradeIntent.actionType === 'EXPENSE') {
              const formattedAmt = formatCurrency(tradeIntent.totalAmount, currency);
              aiResponse = `💳 **Expense Entry Log Prepared:**\n\n- **Outflow Title:** ${tradeIntent.name}\n- **Amount:** **${formattedAmt}**\n- **Category:** General Outflows\n\nClick **Record Expense** below to update your monthly cash flow tracking.`;
              suggested = ['Record Expense', 'View my monthly cash flow'];
            } else if (tradeIntent.actionType === 'INCOME') {
              const formattedAmt = formatCurrency(tradeIntent.totalAmount, currency);
              aiResponse = `💵 **Income Inflow Prepared:**\n\n- **Source:** ${tradeIntent.name}\n- **Amount:** **+${formattedAmt}**\n\nClick **Confirm Inflow** below to credit this into your monthly savings rate.`;
              suggested = ['Confirm Inflow', 'Audit my portfolio risk'];
            }
          } else if (lower.includes('cash flow') || lower.includes('expense') || lower.includes('spend') || lower.includes('savings')) {
            aiResponse = `💰 **Cash Flow & Expense Health Analysis:**\n\n- **Monthly Inflow:** $${Math.round(summary.totalMonthlyIncome).toLocaleString()} (~₹${Math.round(summary.totalMonthlyIncome * 84.5).toLocaleString()})\n- **Monthly Outflows/Expenses:** $${Math.round(summary.totalMonthlyExpenses).toLocaleString()} (~₹${Math.round(summary.totalMonthlyExpenses * 84.5).toLocaleString()})\n- **Net Savings Rate:** **${summary.monthlySavingsRate.toFixed(1)}%** (Target: > 40%)\n- **Liquid Cash Runway:** **${summary.liquidRunwayMonths.toFixed(1)} months** of emergency survival buffer.\n\n💡 **Copilot Recommendation:** Your savings rate allows you to automate an extra SIP into diversified equity without straining liquidity.`;
            suggested = ['Buy 10 Reliance', 'Show me Tax Harvesting tips', 'Audit my asset allocation risk'];
          } else if (lower.includes('risk') || lower.includes('audit') || lower.includes('allocation')) {
            aiResponse = `📊 **Portfolio Risk & Allocation Audit:**\n\n- **Comprehensive Net Worth:** $${Math.round(summary.totalNetWorth).toLocaleString()} (₹${Math.round(summary.totalNetWorth * 84.5).toLocaleString()})\n- **Equity & Growth Assets:** ~44% across Listed Stocks, Mutual Funds & Crypto.\n- **Defensive & Real Assets:** ~56% distributed in Real Estate, Bank FDs, Sovereign Gold Bonds (SGB), and PPF.\n- **Emergency Runway:** **${summary.liquidRunwayMonths.toFixed(1)} months** of cash.\n\n💡 **Copilot Recommendation:** Your allocation exhibits balanced inflation-hedging with steady physical and liquid assets.`;
            suggested = ['Buy 10 Reliance', 'Show me Tax Harvesting tips', 'What is Reliance 30-day forecast?'];
          } else if (lower.includes('tax') || lower.includes('ltcg') || lower.includes('capital gain')) {
            aiResponse = `🧾 **Capital Gains Tax Optimization (FY 2026-27):**\n\n- **Unrealized Long-Term Gains (LTCG):** ~$3,490 (₹2.95 Lakhs)\n- **Standard Tax-Free Exemption:** ₹1,25,000 per financial year.\n- **Tax Harvest Opportunity:** You have **$1,480 (₹1.25 Lakhs)** in tax-free exemption that resets on March 31!\n\n💡 **Action Item:** Sell partial shares of Reliance and TCS before March 31 and re-enter immediately to step up your cost basis.`;
            suggested = ['View full Tax Optimizer tab', 'Simulate selling 20 shares of Reliance'];
          } else if (lower.includes('predict') || lower.includes('forecast') || lower.includes('reliance') || lower.includes('btc') || lower.includes('bitcoin')) {
            aiResponse = `🔮 **AI Asset Projections (Next 30-90 Days):**\n\n- **Reliance Industries:** Target **$38.20** (+9.8%) with an **88% Bullish Confidence Score**. Support at $32.80.\n- **Bitcoin (Cold Storage):** Target **$76,500** (+11.8%) with institutional ETF volume driving supply squeeze.\n- **Sovereign Gold (SGB):** Strong Buy rating (91% confidence) with central bank purchases acting as a geopolitical floor.\n\nCheck the **AI Forecaster** tab for Monte Carlo upper/lower prediction bands!`;
            suggested = ['Buy 10 Reliance', 'Go to AI Stock Predictor', 'Audit my portfolio risk'];
          } else {
            aiResponse = `🤖 I've analyzed your question across your **${assets.length} portfolio assets**, **${expenses.length} tracked expenses**, and **${incomes.length} income streams**.\n\nYour portfolio is generating a **${summary.monthlySavingsRate.toFixed(1)}% savings rate** and annualized return of **+${summary.pnlPercentage.toFixed(1)}%**.\n\n💡 *Tip: You can trade directly through me! Try typing **"Buy 10 Reliance"** or **"Spent 25000 rent"**.*`;
            suggested = [
              'Buy 10 Reliance',
              'Analyze my monthly cash flow and expenses',
              'Audit my asset allocation risk',
            ];
          }

          const assistantMsg: AiChatMessage = {
            id: `msg_ai_${Date.now()}`,
            role: 'assistant',
            content: aiResponse,
            timestamp: 'Just now',
            suggestedPrompts: suggested,
            tradeAction: tradeActionPayload,
          };

          set((state) => ({
            aiMessages: [...state.aiMessages, assistantMsg],
            isAiTyping: false,
          }));
        }, 700);
      },

      executeChatTradeAction: (messageId, actionPayload) => {
        const { addTransaction, addExpense, addIncome, currency } = get();

        // 1. Dispatch to corresponding financial ledger
        if (actionPayload.actionType === 'TRADE') {
          addTransaction({
            assetId: `ast_${(actionPayload.symbol || 'ASSET').toLowerCase()}`,
            assetSymbol: actionPayload.symbol || 'ASSET',
            assetName: actionPayload.name,
            category: actionPayload.category,
            type: actionPayload.tradeType,
            quantity: actionPayload.quantity,
            pricePerUnit: actionPayload.pricePerUnit,
            totalAmount: actionPayload.totalAmount,
            date: actionPayload.date,
            platform: actionPayload.platform || 'Zerodha Kite',
            notes: actionPayload.notes || 'Executed via FinPulse AI Copilot',
          });
        } else if (actionPayload.actionType === 'EXPENSE') {
          addExpense({
            title: actionPayload.name,
            category: 'OTHER_EXPENSE',
            amount: actionPayload.totalAmount,
            paymentMethod: 'UPI',
            frequency: 'ONE_TIME',
            date: actionPayload.date,
            notes: 'Logged via AI Copilot',
          });
        } else if (actionPayload.actionType === 'INCOME') {
          addIncome({
            source: actionPayload.name,
            category: 'OTHER_INCOME',
            amount: actionPayload.totalAmount,
            frequency: 'ONE_TIME',
            date: actionPayload.date,
            notes: 'Logged via AI Copilot',
          });
        }

        // 2. Mark action status as EXECUTED in the message
        set((state) => ({
          aiMessages: state.aiMessages.map((m) =>
            m.id === messageId && m.tradeAction
              ? {
                  ...m,
                  tradeAction: {
                    ...m.tradeAction,
                    status: 'EXECUTED',
                  },
                }
              : m
          ),
        }));

        // 3. Append confirmation response from the Copilot
        const confirmationMsg: AiChatMessage = {
          id: `msg_exec_${Date.now()}`,
          role: 'assistant',
          content: `✅ **Trade Order Successfully Executed & Recorded!**\n\n- **Order:** ${actionPayload.tradeType} ${actionPayload.quantity} ${actionPayload.symbol || actionPayload.name}\n- **Total Booked:** **${formatCurrency(actionPayload.totalAmount, currency)}**\n- **Platform:** ${actionPayload.platform || 'Zerodha Kite'}\n\nYour Portfolio Net Worth, Holdings Table, and Transaction Ledger have been updated in real-time.`,
          timestamp: 'Just now',
          suggestedPrompts: [
            'Audit updated asset allocation',
            'Show my updated Net Worth',
            'Buy 5 Apple',
          ],
        };

        set((state) => ({
          aiMessages: [...state.aiMessages, confirmationMsg],
        }));
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

          // Check if asset already exists
          const existingAsset = state.assets.find(
            (a: Asset) => a.id === newTxData.assetId || a.symbol === newTxData.assetSymbol
          );
          let updatedAssets = [...state.assets];

          if (existingAsset) {
            const quantityChange =
              newTxData.type === 'BUY' || newTxData.type === 'SIP'
                ? newTxData.quantity
                : newTxData.type === 'SELL'
                ? -newTxData.quantity
                : 0;
            const newQty = Math.max(0, existingAsset.quantity + quantityChange);

            // Recompute average buy price if BUY
            let newAvgPrice = existingAsset.averageBuyPrice;
            if (newTxData.type === 'BUY' || newTxData.type === 'SIP') {
              const oldCost = existingAsset.quantity * existingAsset.averageBuyPrice;
              const newCost = newTxData.quantity * newTxData.pricePerUnit;
              newAvgPrice = newQty > 0 ? (oldCost + newCost) / newQty : newTxData.pricePerUnit;
            }

            updatedAssets = state.assets.map((a: Asset) =>
              a.id === existingAsset.id
                ? {
                    ...a,
                    quantity: newQty,
                    averageBuyPrice: newAvgPrice,
                    currentMarketPrice: newTxData.pricePerUnit,
                    lastUpdated: new Date().toISOString(),
                  }
                : a
            );
          } else {
            // Automatically register new asset into portfolio!
            const newAsset: Asset = {
              id: newTxData.assetId || `ast_${Date.now()}`,
              symbol: newTxData.assetSymbol,
              name: newTxData.assetName,
              category: newTxData.category,
              quantity: newTxData.quantity,
              averageBuyPrice: newTxData.pricePerUnit,
              currentMarketPrice: newTxData.pricePerUnit,
              currency: 'USD',
              institution: newTxData.platform || 'Direct Demat',
              lastUpdated: new Date().toISOString(),
            };
            updatedAssets = [newAsset, ...updatedAssets];
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

      addAsset: (newAssetData) => {
        const newAsset: Asset = {
          ...newAssetData,
          id: `ast_${Date.now()}`,
          lastUpdated: new Date().toISOString(),
        };

        set((state) => ({
          assets: [newAsset, ...state.assets],
        }));
      },

      deleteAsset: (id) => {
        set((state) => ({
          assets: state.assets.filter((a: Asset) => a.id !== id),
        }));
      },

      addExpense: (newExpenseData) => {
        const newExpense: ExpenseItem = {
          ...newExpenseData,
          id: `exp_${Date.now()}`,
        };

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      deleteExpense: (id) => {
        set((state) => ({
          expenses: state.expenses.filter((e) => e.id !== id),
        }));
      },

      addIncome: (newIncomeData) => {
        const newIncome: IncomeItem = {
          ...newIncomeData,
          id: `inc_${Date.now()}`,
        };

        set((state) => ({
          incomes: [newIncome, ...state.incomes],
        }));
      },

      deleteIncome: (id) => {
        set((state) => ({
          incomes: state.incomes.filter((i) => i.id !== id),
        }));
      },

      getPortfolioSummary: () => {
        const { assets, expenses, incomes } = get();

        let totalNetWorth = 0;
        let totalInvested = 0;
        let liquidCash = 0;

        const categoryTotals: Record<string, number> = {};

        assets.forEach((asset: Asset) => {
          const currentValue = asset.quantity * asset.currentMarketPrice;
          const investedValue = asset.quantity * asset.averageBuyPrice;

          totalNetWorth += currentValue;
          totalInvested += investedValue;

          if (asset.category === 'LIQUID_CASH') {
            liquidCash += currentValue;
          }

          categoryTotals[asset.category] = (categoryTotals[asset.category] || 0) + currentValue;
        });

        const totalUnrealizedPnL = totalNetWorth - totalInvested;
        const pnlPercentage = totalInvested > 0 ? (totalUnrealizedPnL / totalInvested) * 100 : 0;

        // Calculate Monthly Cash Flow
        const totalMonthlyIncome = incomes.reduce((acc, inc) => {
          if (inc.frequency === 'MONTHLY') return acc + inc.amount;
          if (inc.frequency === 'ANNUAL') return acc + inc.amount / 12;
          return acc + inc.amount; // One-time recorded in current month
        }, 0);

        const totalMonthlyExpenses = expenses.reduce((acc, exp) => {
          return acc + exp.amount;
        }, 0);

        const monthlySavingsRate =
          totalMonthlyIncome > 0
            ? Math.max(0, ((totalMonthlyIncome - totalMonthlyExpenses) / totalMonthlyIncome) * 100)
            : 0;

        const liquidRunwayMonths =
          totalMonthlyExpenses > 0 ? (liquidCash || 2000) / totalMonthlyExpenses : 6;

        // Allocation breakdown with mapped colors
        const allocationBreakdown = Object.entries(categoryTotals).map(([cat, val]) => ({
          category: cat as AssetCategory,
          currentValue: val,
          percentage: totalNetWorth > 0 ? (val / totalNetWorth) * 100 : 0,
          color: CATEGORY_COLORS[cat as AssetCategory] || '#9e783e',
        }));

        return {
          totalNetWorth,
          totalInvested,
          totalUnrealizedPnL,
          pnlPercentage,
          todaysChange: totalNetWorth * 0.0124, // Simulated +1.24% today
          todaysChangePercentage: 1.24,
          totalMonthlyIncome,
          totalMonthlyExpenses,
          monthlySavingsRate,
          liquidRunwayMonths,
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
        expenses: state.expenses,
        incomes: state.incomes,
        aiMessages: state.aiMessages,
      }),
    }
  )
);
