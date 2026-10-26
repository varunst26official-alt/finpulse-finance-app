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
  CalendarEvent,
  DebtItem,
  DebtRepayment,
  InsurancePolicy,
  PolicyStatus,
  FinancialHealthScore,
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
  INITIAL_CALENDAR_EVENTS,
  INITIAL_DEBTS,
  INITIAL_POLICIES,
} from '@/data/mockData';
import { CATEGORY_COLORS, formatCurrency } from '@/utils/formatters';
import { parseTradeIntent } from '@/services/aiTradeParser';

export type NavigationTab =
  | 'dashboard'
  | 'investments'
  | 'debts'
  | 'protection'
  | 'health'
  | 'transactions'
  | 'goals'
  | 'calendar';

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
  calendarEvents: CalendarEvent[];
  debts: DebtItem[];
  policies: InsurancePolicy[];
  emergencyTargetMonths: number;
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
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  deleteCalendarEvent: (id: string) => void;
  toggleEventCompleted: (id: string) => void;
  addDebt: (debt: Omit<DebtItem, 'id' | 'repayments'>) => void;
  deleteDebt: (id: string) => void;
  recordDebtRepayment: (
    debtId: string,
    amount: number,
    type: 'REGULAR_EMI' | 'LUMP_SUM_PREPAYMENT',
    date: string,
    notes?: string
  ) => void;
  addPolicy: (policy: Omit<InsurancePolicy, 'id'>) => void;
  deletePolicy: (id: string) => void;
  updatePolicyStatus: (id: string, status: PolicyStatus) => void;
  setEmergencyTargetMonths: (months: number) => void;
  resetToFreshPortfolio: (userName?: string) => void;
  loadDemoSampleData: () => void;

  // Computed Selectors
  getPortfolioSummary: () => PortfolioSummary;
  getFinancialHealthScore: () => FinancialHealthScore;
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
      calendarEvents: INITIAL_CALENDAR_EVENTS,
      debts: INITIAL_DEBTS,
      policies: INITIAL_POLICIES,
      emergencyTargetMonths: 6,
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
          } else if (lower.includes('load sample') || lower.includes('demo data') || lower.includes('populate demo')) {
            get().loadDemoSampleData();
            aiResponse = `📦 **Sample Demo Portfolio Loaded!**\n\nI have loaded demonstration holdings (Reliance, TCS, HDFC, Sovereign Gold Bonds, Real Estate), cash flow ledgers, and calendar events so you can test all features.\n\nTo wipe this sample data and start your real 0-balance portfolio anytime, simply type *"Start fresh"* or click the button in the top navbar!`;
            suggested = ['Show my updated Net Worth', 'Audit my asset allocation risk', 'Start fresh with 0 balance'];
          } else if (lower.includes('start fresh') || lower.includes('clean slate') || lower.includes('reset') || lower.includes('clear data') || lower.includes('empty portfolio')) {
            get().resetToFreshPortfolio();
            aiResponse = `🧹 **Portfolio Successfully Cleared!**\n\nYour portfolio is now completely reset to **₹0.00 balance** with 0 holdings and 0 transactions. You're ready to log your real investments.\n\nClick **'+ Add Trade'** or tell me what you own (e.g. *"Bought 15 TCS at 3800"*).`;
            suggested = ['How do I add my first trade?', 'Search 120+ listed stocks', 'Load Sample Demo Data'];
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

      addCalendarEvent: (eventData) => {
        const newEvent: CalendarEvent = {
          ...eventData,
          id: `cal_${Date.now()}`,
          isCompleted: false,
        };

        set((state) => ({
          calendarEvents: [...state.calendarEvents, newEvent],
        }));
      },

      deleteCalendarEvent: (id) => {
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
        }));
      },

      toggleEventCompleted: (id) => {
        set((state) => ({
          calendarEvents: state.calendarEvents.map((e) =>
            e.id === id ? { ...e, isCompleted: !e.isCompleted } : e
          ),
        }));
      },

      addDebt: (debtData) => {
        const newDebt: DebtItem = {
          ...debtData,
          id: `debt_${Date.now()}`,
          repayments: [],
        };
        set((state) => ({
          debts: [newDebt, ...state.debts],
        }));
      },

      deleteDebt: (id) => {
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        }));
      },

      recordDebtRepayment: (debtId, amount, type, date, notes) => {
        set((state) => {
          const repayment: DebtRepayment = {
            id: `rep_${Date.now()}`,
            debtId,
            amount,
            date,
            type,
            notes,
          };

          const updatedDebts = state.debts.map((d) => {
            if (d.id === debtId) {
              const newOutstanding = Math.max(0, d.currentOutstanding - amount);
              return {
                ...d,
                currentOutstanding: newOutstanding,
                repayments: [repayment, ...d.repayments],
              };
            }
            return d;
          });

          return { debts: updatedDebts };
        });
      },

      addPolicy: (policyData) => {
        const newPolicy: InsurancePolicy = {
          ...policyData,
          id: `pol_${Date.now()}`,
        };
        set((state) => ({
          policies: [newPolicy, ...state.policies],
        }));
      },

      deletePolicy: (id) => {
        set((state) => ({
          policies: state.policies.filter((p) => p.id !== id),
        }));
      },

      updatePolicyStatus: (id, status) => {
        set((state) => ({
          policies: state.policies.map((p) => (p.id === id ? { ...p, status } : p)),
        }));
      },

      setEmergencyTargetMonths: (emergencyTargetMonths) => {
        set({ emergencyTargetMonths });
      },

      resetToFreshPortfolio: (userName = 'Investor') => {
        set({
          assets: [],
          transactions: [],
          expenses: [],
          incomes: [],
          calendarEvents: [],
          debts: [],
          policies: [],
          emergencyTargetMonths: 6,
          history: [],
          aiMessages: [
            {
              id: `msg_welcome_${Date.now()}`,
              role: 'assistant',
              content: `👋 **Welcome to FinPulse, ${userName}!**\n\nYour portfolio is starting completely **fresh and clean** with 0 balances. You can now build your real investment portfolio from scratch.\n\n💡 **Quick Ways to Start:**\n- Click **'+ Add Trade'** in the navbar to log your stocks, mutual funds, gold, or property.\n- Switch to **Financial Calendar** to schedule your upcoming expenses and SIP dates.\n\n*(If you ever want to preview sample test data, click 'Load Sample Demo' in the top navbar anytime!)*`,
              timestamp: 'Just now',
              suggestedPrompts: [
                'How do I add my first trade?',
                'Search 120+ listed stocks',
                'Load Sample Demo Data',
              ],
            },
          ],
        });
      },

      loadDemoSampleData: () => {
        set({
          assets: INITIAL_ASSETS,
          transactions: INITIAL_TRANSACTIONS,
          expenses: INITIAL_EXPENSES,
          incomes: INITIAL_INCOMES,
          calendarEvents: INITIAL_CALENDAR_EVENTS,
          debts: INITIAL_DEBTS,
          policies: INITIAL_POLICIES,
          emergencyTargetMonths: 6,
          history: INITIAL_HISTORY,
          aiMessages: INITIAL_AI_MESSAGES,
        });
      },

      getPortfolioSummary: () => {
        const { assets, expenses, incomes, debts } = get();

        let grossAssets = 0;
        let totalInvested = 0;
        let liquidCash = 0;

        const categoryTotals: Record<string, number> = {};

        assets.forEach((asset: Asset) => {
          const currentValue = asset.quantity * asset.currentMarketPrice;
          const investedValue = asset.quantity * asset.averageBuyPrice;

          grossAssets += currentValue;
          totalInvested += investedValue;

          if (asset.category === 'LIQUID_CASH') {
            liquidCash += currentValue;
          }

          categoryTotals[asset.category] = (categoryTotals[asset.category] || 0) + currentValue;
        });

        const totalDebt = (debts || []).reduce((sum, d) => sum + d.currentOutstanding, 0);
        const totalMonthlyDebtCommitment = (debts || []).reduce((sum, d) => sum + d.monthlyEmi, 0);
        const totalNetWorth = grossAssets - totalDebt;

        const totalUnrealizedPnL = grossAssets - totalInvested;
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
          percentage: grossAssets > 0 ? (val / grossAssets) * 100 : 0,
          color: CATEGORY_COLORS[cat as AssetCategory] || '#9e783e',
        }));

        return {
          totalNetWorth,
          grossAssets,
          totalDebt,
          totalMonthlyDebtCommitment,
          totalInvested,
          totalUnrealizedPnL,
          pnlPercentage,
          todaysChange: grossAssets * 0.0124, // Simulated +1.24% today
          todaysChangePercentage: 1.24,
          totalMonthlyIncome,
          totalMonthlyExpenses,
          monthlySavingsRate,
          liquidRunwayMonths,
          allocationBreakdown,
        };
      },

      getFinancialHealthScore: () => {
        const { policies, getPortfolioSummary } = get();
        const summary = getPortfolioSummary();

        // 1. Savings Rate Score (Max 25 pts)
        let savingsScore = 0;
        let savingsDetail = '';
        if (summary.monthlySavingsRate >= 40) {
          savingsScore = 25;
          savingsDetail = `Superb ${summary.monthlySavingsRate.toFixed(1)}% savings rate (Benchmark: >40%)`;
        } else if (summary.monthlySavingsRate >= 25) {
          savingsScore = 20;
          savingsDetail = `Healthy ${summary.monthlySavingsRate.toFixed(1)}% savings rate (Benchmark: >25%)`;
        } else if (summary.monthlySavingsRate >= 15) {
          savingsScore = 15;
          savingsDetail = `Moderate ${summary.monthlySavingsRate.toFixed(1)}% savings rate (Target: 30%)`;
        } else if (summary.monthlySavingsRate > 0) {
          savingsScore = 10;
          savingsDetail = `Low ${summary.monthlySavingsRate.toFixed(1)}% savings rate`;
        } else {
          savingsScore = 5;
          savingsDetail = 'Expenses equal or exceed monthly income';
        }

        // 2. Emergency Runway Score (Max 25 pts)
        let runwayScore = 0;
        let runwayDetail = '';
        if (summary.liquidRunwayMonths >= 6) {
          runwayScore = 25;
          runwayDetail = `${summary.liquidRunwayMonths.toFixed(1)} months of emergency cash buffer (Target: 6m)`;
        } else if (summary.liquidRunwayMonths >= 4) {
          runwayScore = 20;
          runwayDetail = `${summary.liquidRunwayMonths.toFixed(1)} months buffer (Almost at 6-month target)`;
        } else if (summary.liquidRunwayMonths >= 2) {
          runwayScore = 12;
          runwayDetail = `${summary.liquidRunwayMonths.toFixed(1)} months runway (Consider building to 6m)`;
        } else {
          runwayScore = 5;
          runwayDetail = 'Under 2 months of emergency cash reserves';
        }

        // 3. Debt-to-Income / Leverage Score (Max 20 pts)
        let debtScore = 0;
        let debtDetail = '';
        const dti = summary.totalMonthlyIncome > 0
          ? (summary.totalMonthlyDebtCommitment / summary.totalMonthlyIncome) * 100
          : summary.totalMonthlyDebtCommitment > 0 ? 100 : 0;

        if (summary.totalDebt === 0) {
          debtScore = 20;
          debtDetail = '100% Debt Free with zero loan liabilities';
        } else if (dti <= 20) {
          debtScore = 20;
          debtDetail = `Conservative debt-to-income of ${dti.toFixed(1)}% (Well under 30% ceiling)`;
        } else if (dti <= 35) {
          debtScore = 15;
          debtDetail = `Manageable debt-to-income of ${dti.toFixed(1)}%`;
        } else if (dti <= 50) {
          debtScore = 8;
          debtDetail = `High debt-to-income of ${dti.toFixed(1)}% (Exceeds 35% safe limit)`;
        } else {
          debtScore = 3;
          debtDetail = `Critical debt burden: ${dti.toFixed(1)}% of income going to debt service`;
        }

        // 4. Asset Diversification Score (Max 15 pts)
        const activeCategories = summary.allocationBreakdown.filter((a) => a.percentage >= 5).length;
        let divScore = 0;
        let divDetail = '';
        if (activeCategories >= 4) {
          divScore = 15;
          divDetail = `Well diversified across ${activeCategories} distinct asset classes`;
        } else if (activeCategories === 3) {
          divScore = 12;
          divDetail = `Good spread across ${activeCategories} asset classes`;
        } else if (activeCategories === 2) {
          divScore = 8;
          divDetail = 'Concentrated in 2 asset classes; consider adding gold or debt funds';
        } else if (activeCategories === 1) {
          divScore = 4;
          divDetail = 'Single asset concentration risk';
        } else {
          divScore = 0;
          divDetail = 'No active asset classes recorded';
        }

        // 5. Insurance & Protection Score (Max 15 pts)
        const hasLife = (policies || []).some((p) => p.type === 'TERM_LIFE' && p.status !== 'LAPSED');
        const hasHealth = (policies || []).some((p) => p.type === 'HEALTH_FLOATER' && p.status !== 'LAPSED');
        let insScore = 0;
        let insDetail = '';
        if (hasLife && hasHealth) {
          insScore = 15;
          insDetail = 'Comprehensive protection: Term Life and Family Health Floater active';
        } else if (hasHealth) {
          insScore = 8;
          insDetail = 'Health insurance active; Term life insurance recommended to protect dependents';
        } else if (hasLife) {
          insScore = 7;
          insDetail = 'Term life active; Family health insurance strongly recommended';
        } else {
          insScore = 0;
          insDetail = 'No active health or life insurance recorded (High vulnerability)';
        }

        const totalScore = savingsScore + runwayScore + debtScore + divScore + insScore;
        const rating =
          totalScore >= 85
            ? 'EXCELLENT'
            : totalScore >= 70
            ? 'GOOD'
            : totalScore >= 50
            ? 'FAIR'
            : 'NEEDS_ATTENTION';

        const recommendations: string[] = [];
        if (summary.liquidRunwayMonths < 6) {
          recommendations.push(
            'Build your emergency fund to 6 months of living expenses in an auto-sweep bank account or liquid mutual fund.'
          );
        }
        if (!hasHealth) {
          recommendations.push(
            'Secure a comprehensive family health insurance floater (minimum ₹15-25 Lakhs) to shield your portfolio against hospital bills.'
          );
        }
        if (!hasLife && summary.totalMonthlyIncome > 0) {
          recommendations.push(
            'Consider a pure term life insurance policy covering 10-15x your annual income.'
          );
        }
        if (dti > 35) {
          recommendations.push(
            'Accelerate high-APR debt payments using the Avalanche strategy to bring your debt service below 30% of income.'
          );
        }
        if (activeCategories < 3 && summary.grossAssets > 0) {
          recommendations.push(
            'Diversify across non-correlated asset classes like Sovereign Gold Bonds (SGB) or short-term fixed deposits.'
          );
        }
        if (recommendations.length === 0) {
          recommendations.push(
            'Outstanding financial discipline! Continue automating your regular monthly SIPs and review policy renewals annually.'
          );
        }

        return {
          totalScore,
          rating,
          pillarScores: {
            savingsRate: { score: savingsScore, maxScore: 25, detail: savingsDetail },
            emergencyRunway: { score: runwayScore, maxScore: 25, detail: runwayDetail },
            debtLoad: { score: debtScore, maxScore: 20, detail: debtDetail },
            diversification: { score: divScore, maxScore: 15, detail: divDetail },
            insuranceProtection: { score: insScore, maxScore: 15, detail: insDetail },
          },
          keyRecommendations: recommendations,
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
        calendarEvents: state.calendarEvents,
        debts: state.debts,
        policies: state.policies,
        emergencyTargetMonths: state.emergencyTargetMonths,
        aiMessages: state.aiMessages,
      }),
    }
  )
);
