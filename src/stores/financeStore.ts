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
  GoalItem,
  HistoricalDataPoint,
} from '@/types/finance';
import {
  STOCK_PREDICTIONS,
  MARKET_NEWS_ITEMS,
  TAX_REPORT_MOCK,
  INITIAL_DEBTS,
  INITIAL_POLICIES,
  INITIAL_GOALS,
} from '@/data/mockData';
import { CATEGORY_COLORS, formatCurrency } from '@/utils/formatters';
import { parseTradeIntent } from '@/services/aiTradeParser';
import { api } from '@/services/apiClient';
import { useLifeOSStore } from './lifeosStore';

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
  goals: GoalItem[];
  emergencyTargetMonths: number;
  history: HistoricalDataPoint[];

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
  addExpensesBatch: (expenses: Omit<ExpenseItem, 'id'>[]) => void;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<IncomeItem, 'id'>) => void;
  addIncomesBatch: (incomes: Omit<IncomeItem, 'id'>[]) => void;
  deleteIncome: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  addCalendarEventsBatch: (events: Omit<CalendarEvent, 'id'>[]) => void;
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
  addGoal: (goal: Omit<GoalItem, 'id'>) => void;
  deleteGoal: (id: string) => void;
  contributeToGoal: (id: string, amount: number) => void;
  updateGoal: (id: string, updates: Partial<GoalItem>) => void;
  setEmergencyTargetMonths: (months: number) => void;
  resetToFreshPortfolio: (userName?: string) => void;
  loadDemoSampleData: () => void;
  syncWithBackend: () => Promise<void>;

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

      assets: [],
      transactions: [],
      expenses: [],
      incomes: [],
      calendarEvents: [],
      debts: INITIAL_DEBTS,
      policies: INITIAL_POLICIES,
      goals: INITIAL_GOALS,
      emergencyTargetMonths: 6,
      history: [],

      aiMessages: [],
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
          const { assets, debts, currency, getPortfolioSummary, executeChatTradeAction } = get();
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
          } else if (lower.includes('start fresh') || lower.includes('clean slate') || lower.includes('reset') || lower.includes('clear data') || lower.includes('empty portfolio')) {
            get().resetToFreshPortfolio();
            aiResponse = `🧹 **Portfolio Successfully Cleared!**\n\nYour portfolio is now completely reset to **₹0.00 balance** with 0 holdings and 0 transactions. You're ready to log your real investments.\n\nClick **'+ Add Trade'** or tell me what you own (e.g. *"Bought 15 shares of Apple at 180"*).`;
            suggested = ['How do I add my first trade?', 'Search 120+ listed stocks', 'View my portfolio summary'];
          } else if (lower.includes('predict') || lower.includes('forecast') || lower.includes('reliance') || lower.includes('btc') || lower.includes('bitcoin')) {
            aiResponse = `🔮 **AI Asset Projections (Next 30-90 Days):**\n\n- **Reliance Industries:** Target **$38.20** (+9.8%) with an **88% Bullish Confidence Score**. Support at $32.80.\n- **Bitcoin (Cold Storage):** Target **$76,500** (+11.8%) with institutional ETF volume driving supply squeeze.\n- **Sovereign Gold (SGB):** Strong Buy rating (91% confidence) with central bank purchases acting as a geopolitical floor.\n\nCheck the **AI Forecaster** tab for Monte Carlo upper/lower prediction bands!`;
            suggested = ['Buy 10 Reliance', 'Go to AI Stock Predictor', 'Audit my portfolio risk'];
          } else if (lower.includes('workout') || lower.includes('gym') || lower.includes('fitness') || lower.includes('split') || lower.includes('exercise')) {
            const life = useLifeOSStore.getState();
            aiResponse = `💪 **LifeOS Fitness & Workout Blueprint:**\n\n- **Active Split:** **${life.activeBlueprint.workoutSplitName}**\n- **Weekly Logged:** **${life.wellness.workoutMinutesLogged} mins** (Target: 150m weekly)\n- **Body Mass Index:** **${Math.round((life.wellness.weightKg / Math.pow(life.wellness.heightCm / 100, 2)) * 10) / 10}** (${life.wellness.weightKg} kg · Target: ${life.wellness.targetWeightKg} kg)\n- **Workout Sessions Logged:** **${life.workoutSessions.length} sessions** with total tonnage tracked.\n\n💡 *Tip: Head over to the Fitness & Wellness workspace to record your set-by-set weight, reps, and RPE.*`;
            suggested = ['What is my daily calorie target?', 'Show my today priorities', 'Audit my asset allocation risk'];
          } else if (lower.includes('diet') || lower.includes('food') || lower.includes('calorie') || lower.includes('nutrition') || lower.includes('water') || lower.includes('hydration')) {
            const life = useLifeOSStore.getState();
            aiResponse = `🥗 **LifeOS Nutrition & Hydration Blueprint:**\n\n- **Energy Target:** **${life.activeBlueprint.targetCalories} kcal** (Current Logged: ${life.wellness.caloriesLogged} kcal)\n- **Macro Split:** Protein: **${life.activeBlueprint.macros.proteinGrams}g** · Carbs: **${life.activeBlueprint.macros.carbsGrams}g** · Fat: **${life.activeBlueprint.macros.fatGrams}g**\n- **Daily Water Target:** **${life.activeBlueprint.dailyWaterTargetLiters} L** (Logged: ${life.wellness.waterLitersLogged} L)\n- **Meals Logged Today:** **${life.mealLogs.length} entries**.\n\n💡 *Tip: Remember clinical guidelines recommend 35ml water per kg body weight plus workout adjustments.*`;
            suggested = ['What workout should I do?', 'Log 250ml water', 'Analyze my monthly cash flow'];
          } else if (lower.includes('habit') || lower.includes('streak') || lower.includes('priority') || lower.includes('task') || lower.includes('productivity')) {
            const life = useLifeOSStore.getState();
            const completed = life.tasks.filter((t) => t.status === 'COMPLETED').length;
            aiResponse = `⚡ **LifeOS Productivity & Habit Command:**\n\n- **Today's Priorities:** **${completed} / ${life.tasks.length} tasks completed** (${life.tasks.length - completed} remaining).\n- **Active Daily Routines:** **${life.habits.length} habits** tracked.\n- **Top Streak:** **${Math.max(0, ...life.habits.map((h) => h.streakCount))} consecutive days** 🔥\n- **Deep Work Focus Blocks:** **${life.focusSessions.length} sessions** recorded.\n\n💡 *Tip: Use the Pomodoro stopwatch in the Productivity workspace to lock in 50-minute deep work blocks.*`;
            suggested = ['Show my reading progress', 'What is my workout split?', 'Buy 10 Reliance'];
          } else if (lower.includes('learning') || lower.includes('book') || lower.includes('study') || lower.includes('skill')) {
            const life = useLifeOSStore.getState();
            const totalHours = life.learningItems.reduce((acc, l) => acc + l.hoursSpent, 0);
            aiResponse = `📚 **LifeOS Knowledge & Learning Track:**\n\n- **Active Skills in Progression:** **${life.learningItems.length} roadmaps**.\n- **Study Hours Compounded:** **${totalHours} verified hours** logged.\n- **Books in Vault:** **${life.learningBooks.length} titles** (Current book: *${life.learningBooks[0]?.title || 'None'}* on page ${life.learningBooks[0]?.currentPage || 0}).\n\n💡 *Tip: Compounding 1 hour of study daily yields 365 hours of competitive mastery every year.*`;
            suggested = ['Show my vaulted documents', 'What is my net worth?', 'Audit my portfolio risk'];
          } else if (lower.includes('vault') || lower.includes('document') || lower.includes('emergency') || lower.includes('passport')) {
            const life = useLifeOSStore.getState();
            const expiring = life.documents.filter((d) => d.status === 'EXPIRING_SOON').length;
            aiResponse = `🛡️ **LifeOS Administration & Vault Readiness:**\n\n- **Encrypted Documents:** **${life.documents.length} official documents** secured.\n- **Expiring Soon Alert:** **${expiring} items** requiring renewal within 60 days.\n- **Blood Group:** **${life.emergencyInfo?.bloodGroup || 'O+'}** · Primary Contact: **${life.emergencyInfo?.primaryContactName || 'Configured'}**\n- **24x7 TPA Helpline:** **${life.emergencyInfo?.tpaHelpline || '1800-102-4477'}**\n\n💡 *Tip: You can 1-click copy your emergency medical sheet from the Life Administration workspace.*`;
            suggested = ['Show full LifeOS summary', 'What are my priorities today?', 'Analyze my cash flow'];
          } else if (lower.includes('lifeos') || lower.includes('summary') || lower.includes('life summary') || lower.includes('overview') || lower.includes('balance')) {
            const life = useLifeOSStore.getState();
            aiResponse = `🌐 **LifeOS Personal Executive Briefing:**\n\n- 💰 **Finance:** Net Worth **${formatCurrency(summary.totalNetWorth, currency)}** with ${summary.pnlPercentage.toFixed(1)}% growth and ${summary.liquidRunwayMonths.toFixed(1)} mo runway.\n- 🏋️ **Physical Vitality:** Split **${life.activeBlueprint.workoutSplitName}**, Daily **${life.activeBlueprint.targetCalories} kcal**, BMI **${Math.round((life.wellness.weightKg / Math.pow(life.wellness.heightCm / 100, 2)) * 10) / 10}**.\n- ⚡ **Daily Execution:** **${life.tasks.filter((t) => t.status === 'COMPLETED').length} / ${life.tasks.length} tasks completed**, **${life.habits.length} habits** active.\n- 📚 **Intellect:** **${life.learningItems.length} skills**, **${life.learningBooks.length} books** in vault.\n- 🛡️ **Life Admin:** **${life.documents.length} documents**, Emergency profile active.\n\nAll 6 workspaces are synchronized with persistent SQLite engine.`;
            suggested = ['Buy 10 Reliance', 'Show my workout split', 'Check my reading progress'];
          } else {
            const life = useLifeOSStore.getState();
            aiResponse = `🤖 **LifeOS AI Intelligence Copilot:**\n\nI have complete real-time awareness across your entire life platform:\n- **Wealth:** ${formatCurrency(summary.totalNetWorth, currency)} net worth across ${assets.length} assets & ${debts.length} liabilities.\n- **Vitality:** ${life.activeBlueprint.workoutSplitName} · ${life.activeBlueprint.targetCalories} kcal · ${life.wellness.weightKg} kg.\n- **Productivity:** ${life.tasks.length} tasks · ${life.habits.length} habits · ${life.workoutSessions.length} workouts logged.\n\nAsk me anything: *"What should I do today?"*, *"Buy 10 Reliance"*, *"What is my calorie target?"*, or *"Who is my emergency contact?"*`;
            suggested = [
              'Give me a full LifeOS summary',
              'Buy 10 Reliance',
              'What is my daily calorie target?',
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
        set({ aiMessages: [] });
      },

      addTransaction: (newTxData) => {
        const id = `tx_${Date.now()}`;
        const newTransaction: Transaction = {
          ...newTxData,
          id,
        };

        // Fire background persistence to SQLite database
        api.transactions.create(newTransaction).catch((err) => {
          console.warn('[SQLite Sync] Transaction save fallback:', err);
        });

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
        api.transactions.delete(id).catch((err) => console.warn('[SQLite Sync] Delete tx:', err));
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

        api.portfolio.addAsset(newAsset).catch((err) => console.warn('[SQLite Sync] Add asset:', err));

        set((state) => ({
          assets: [newAsset, ...state.assets],
        }));
      },

      deleteAsset: (id) => {
        api.portfolio.deleteAsset(id).catch((err) => console.warn('[SQLite Sync] Delete asset:', err));
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

      addExpensesBatch: (newExpensesData) => {
        set((state) => {
          // Deduplication key: date + title + amount + (UPI ID if present)
          const existingKeys = new Set(
            state.expenses.map((e) => {
              const upiMatch = e.notes ? e.notes.match(/UPI:([0-9]+)/i) : null;
              return upiMatch
                ? `upi_${upiMatch[1]}`
                : `${e.date}_${e.title.trim().toLowerCase()}_${e.amount.toFixed(2)}`;
            })
          );

          const timestamp = Date.now();
          const uniqueItems: ExpenseItem[] = [];

          newExpensesData.forEach((exp, idx) => {
            const upiMatch = exp.notes ? exp.notes.match(/UPI:([0-9]+)/i) : null;
            const key = upiMatch
              ? `upi_${upiMatch[1]}`
              : `${exp.date}_${exp.title.trim().toLowerCase()}_${exp.amount.toFixed(2)}`;

            if (!existingKeys.has(key)) {
              existingKeys.add(key);
              uniqueItems.push({
                ...exp,
                id: `exp_${timestamp}_${idx}`,
              });
            }
          });

          return {
            expenses: [...uniqueItems, ...state.expenses],
          };
        });
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

      addIncomesBatch: (newIncomesData) => {
        set((state) => {
          const existingKeys = new Set(
            state.incomes.map((i) => {
              const upiMatch = i.notes ? i.notes.match(/UPI:([0-9]+)/i) : null;
              return upiMatch
                ? `upi_${upiMatch[1]}`
                : `${i.date}_${i.source.trim().toLowerCase()}_${i.amount.toFixed(2)}`;
            })
          );

          const timestamp = Date.now();
          const uniqueItems: IncomeItem[] = [];

          newIncomesData.forEach((inc, idx) => {
            const upiMatch = inc.notes ? inc.notes.match(/UPI:([0-9]+)/i) : null;
            const key = upiMatch
              ? `upi_${upiMatch[1]}`
              : `${inc.date}_${inc.source.trim().toLowerCase()}_${inc.amount.toFixed(2)}`;

            if (!existingKeys.has(key)) {
              existingKeys.add(key);
              uniqueItems.push({
                ...inc,
                id: `inc_${timestamp}_${idx}`,
              });
            }
          });

          return {
            incomes: [...uniqueItems, ...state.incomes],
          };
        });
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

        api.calendar.create(newEvent).catch((err) => console.warn('[SQLite Sync] Add event:', err));

        set((state) => ({
          calendarEvents: [...state.calendarEvents, newEvent],
        }));
      },

      addCalendarEventsBatch: (newEventsData) => {
        set((state) => {
          const existingKeys = new Set(
            state.calendarEvents.map((ev) => {
              const upiMatch = ev.notes ? ev.notes.match(/UPI:([0-9]+)/i) : null;
              return upiMatch
                ? `upi_${upiMatch[1]}`
                : `${ev.date}_${ev.title.trim().toLowerCase()}_${ev.amount.toFixed(2)}`;
            })
          );

          const timestamp = Date.now();
          const uniqueItems: CalendarEvent[] = [];

          newEventsData.forEach((ev, idx) => {
            const upiMatch = ev.notes ? ev.notes.match(/UPI:([0-9]+)/i) : null;
            const key = upiMatch
              ? `upi_${upiMatch[1]}`
              : `${ev.date}_${ev.title.trim().toLowerCase()}_${ev.amount.toFixed(2)}`;

            if (!existingKeys.has(key)) {
              existingKeys.add(key);
              uniqueItems.push({
                ...ev,
                id: `cal_${timestamp}_${idx}`,
                isCompleted: ev.isCompleted ?? false,
              });
            }
          });

          return {
            calendarEvents: [...state.calendarEvents, ...uniqueItems],
          };
        });
      },

      deleteCalendarEvent: (id) => {
        api.calendar.delete(id).catch((err) => console.warn('[SQLite Sync] Delete event:', err));
        set((state) => ({
          calendarEvents: state.calendarEvents.filter((e) => e.id !== id),
        }));
      },

      toggleEventCompleted: (id) => {
        api.calendar.toggle(id).catch((err) => console.warn('[SQLite Sync] Toggle event:', err));
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
        api.debts.create(newDebt).catch((err) => console.warn('[SQLite Sync] Add debt:', err));
        set((state) => ({
          debts: [newDebt, ...state.debts],
        }));
      },

      deleteDebt: (id) => {
        api.debts.delete(id).catch((err) => console.warn('[SQLite Sync] Delete debt:', err));
        set((state) => ({
          debts: state.debts.filter((d) => d.id !== id),
        }));
      },

      recordDebtRepayment: (debtId, amount, type, date, notes) => {
        api.debts.repay(debtId, { amount, type, date, notes }).catch((err) => console.warn('[SQLite Sync] Repay debt:', err));
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
        api.policies.create(newPolicy).catch((err) => console.warn('[SQLite Sync] Add policy:', err));
        set((state) => ({
          policies: [newPolicy, ...state.policies],
        }));
      },

      deletePolicy: (id) => {
        api.policies.delete(id).catch((err) => console.warn('[SQLite Sync] Delete policy:', err));
        set((state) => ({
          policies: state.policies.filter((p) => p.id !== id),
        }));
      },

      updatePolicyStatus: (id, status) => {
        api.policies.update(id, { status }).catch((err) => console.warn('[SQLite Sync] Update policy status:', err));
        set((state) => ({
          policies: state.policies.map((p) => (p.id === id ? { ...p, status } : p)),
        }));
      },

      setEmergencyTargetMonths: (emergencyTargetMonths) => {
        set({ emergencyTargetMonths });
      },

      addGoal: (goalData) => {
        const newGoal: GoalItem = {
          ...goalData,
          id: `goal_${Date.now()}`,
          isAchieved: false,
        };
        api.goals.create(newGoal).catch((err) => console.warn('[SQLite Sync] Add goal:', err));
        set((state) => ({
          goals: [newGoal, ...state.goals],
        }));
      },

      deleteGoal: (id) => {
        api.goals.delete(id).catch((err) => console.warn('[SQLite Sync] Delete goal:', err));
        set((state) => ({
          goals: state.goals.filter((g) => g.id !== id),
        }));
      },

      contributeToGoal: (id, amount) => {
        api.goals.contribute(id, amount).catch((err) => console.warn('[SQLite Sync] Contribute goal:', err));
        set((state) => ({
          goals: state.goals.map((g) => {
            if (g.id === id) {
              const newSaved = g.currentSaved + amount;
              return {
                ...g,
                currentSaved: newSaved,
                isAchieved: newSaved >= g.targetAmount,
              };
            }
            return g;
          }),
        }));
      },

      updateGoal: (id, updates) => {
        set((state) => ({
          goals: state.goals.map((g) => (g.id === id ? { ...g, ...updates } : g)),
        }));
      },

      resetToFreshPortfolio: (userName = 'User') => {
        api.portfolio.resetToFresh().catch((err) => console.warn('[SQLite Sync] Reset portfolio:', err));
        set({
          assets: [],
          transactions: [],
          expenses: [],
          incomes: [],
          calendarEvents: [],
          debts: [],
          policies: [],
          goals: [],
          emergencyTargetMonths: 6,
          history: [],
          aiMessages: [
            {
              id: `msg_welcome_${Date.now()}`,
              role: 'assistant',
              content: `👋 **Welcome to LifeOS, ${userName || 'User'}!**\n\nYour personal command centre is initialized and ready. Your records are securely isolated to your account.\n\n💡 **Quick Ways to Start:**\n- Log an asset or trade via **'+ Add Trade'** in the top navigation.\n- Schedule upcoming expenses or routines in **Productivity & Agenda**.\n- Ask me any questions or track expenses directly via this AI Copilot!`,
              timestamp: 'Just now',
              suggestedPrompts: [
                'How do I add my first asset?',
                'Help me set up my monthly budget',
                'What features are available in LifeOS?',
              ],
            },
          ],
        });
      },

      loadDemoSampleData: () => {
        // Demo sample data removed per production policy
      },

      syncWithBackend: async () => {
        try {
          const res = await api.portfolio.fetchData();
          if (res.success && res.data) {
            set({
              assets: res.data.assets,
              transactions: res.data.transactions,
              debts: res.data.debts,
              policies: res.data.policies,
              goals: res.data.goals,
              calendarEvents: res.data.calendarEvents,
              emergencyTargetMonths: res.data.emergencyTargetMonths || get().emergencyTargetMonths,
            });
          }
        } catch (err) {
          console.warn('[SQLite Sync] Backend unreachable (offline mode):', err);
        }
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
        goals: state.goals,
        emergencyTargetMonths: state.emergencyTargetMonths,
        aiMessages: state.aiMessages,
      }),
    }
  )
);
