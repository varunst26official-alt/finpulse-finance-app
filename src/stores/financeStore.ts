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
  Subscription,
  Bill,
} from '@/types/finance';
import {
  STOCK_PREDICTIONS,
  MARKET_NEWS_ITEMS,
  TAX_REPORT_MOCK,
  INITIAL_DEBTS,
  INITIAL_POLICIES,
  INITIAL_GOALS,
  INITIAL_CALENDAR_EVENTS,
} from '@/data/mockData';
import { CATEGORY_COLORS, formatCurrency } from '@/utils/formatters';
import { processQuantrixQuery } from '@/services/quantrixEngine';
import { api, hasAuthToken } from '@/services/apiClient';
import { useMasteryStore } from './masteryStore';
import { useAuthStore } from './authStore';

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
  subscriptions: Subscription[];
  bills: Bill[];

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
  addExpensesBatch: (expenses: Omit<ExpenseItem, 'id'>[]) => number;
  deleteExpense: (id: string) => void;
  addIncome: (income: Omit<IncomeItem, 'id'>) => void;
  addIncomesBatch: (incomes: Omit<IncomeItem, 'id'>[]) => number;
  deleteIncome: (id: string) => void;
  addCalendarEvent: (event: Omit<CalendarEvent, 'id'>) => void;
  addCalendarEventsBatch: (events: Omit<CalendarEvent, 'id'>[]) => number;
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
  // Subscription Management
  addSubscription: (sub: Omit<Subscription, 'id'>) => void;
  deleteSubscription: (id: string) => void;
  updateSubscription: (id: string, updates: Partial<Subscription>) => void;
  markSubscriptionPaid: (id: string, paidDate?: string) => void;
  detectRecurringExpenses: () => void;
  // Bill Management
  addBill: (bill: Omit<Bill, 'id'>) => void;
  deleteBill: (id: string) => void;
  updateBill: (id: string, updates: Partial<Bill>) => void;
  markBillPaid: (id: string, paidDate?: string) => void;
  getUpcomingBills: (days?: number) => Bill[];
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
      debts: [],
      policies: [],
      goals: [],
      emergencyTargetMonths: 6,
      history: [],
      subscriptions: [],
      bills: [],

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

        // Quantrix AI Live Context Engine
        setTimeout(() => {
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
              get().executeChatTradeAction(pendingMsg.id, pendingMsg.tradeAction);
              set({ isAiTyping: false });
              return;
            }
          }

          // 2. Fresh Portfolio Reset Request
          if (
            lower.includes('start fresh') ||
            lower.includes('clean slate') ||
            lower.includes('reset') ||
            lower.includes('clear data') ||
            lower.includes('empty portfolio')
          ) {
            get().resetToFreshPortfolio();
          }

          // 3. Process with Quantrix Real-time Context Engine
          const response = processQuantrixQuery(prompt);

          const assistantMsg: AiChatMessage = {
            id: `msg_ai_${Date.now()}`,
            role: 'assistant',
            content: response.content,
            timestamp: 'Just now',
            suggestedPrompts: response.suggestedPrompts,
            tradeAction: response.tradeAction,
          };

          set((state) => ({
            aiMessages: [...state.aiMessages, assistantMsg],
            isAiTyping: false,
          }));
        }, 350);
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
          content: `âœ… **Trade Order Successfully Executed & Recorded!**- **Order:** ${actionPayload.tradeType} ${actionPayload.quantity} ${actionPayload.symbol || actionPayload.name}- **Total Booked:** **${formatCurrency(actionPayload.totalAmount, currency)}**- **Platform:** ${actionPayload.platform || 'Zerodha Kite'}Your Portfolio Net Worth, Holdings Table, and Transaction Ledger have been updated in real-time.`,
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
        if (!useAuthStore.getState().requireAuth('add transactions & trades')) return;
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

          useMasteryStore.getState().awardPoints('FINANCE', 25, 'Investment transaction recorded');
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
        if (!useAuthStore.getState().requireAuth('add assets to portfolio')) return;
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
        if (!useAuthStore.getState().requireAuth('record expenses')) return;
        const newExpense: ExpenseItem = {
          ...newExpenseData,
          id: `exp_${Date.now()}`,
        };

        useMasteryStore.getState().awardPoints('FINANCE', 15, 'Expense entry recorded');

        set((state) => ({
          expenses: [newExpense, ...state.expenses],
        }));
      },

      addExpensesBatch: (newExpensesData) => {
        if (!useAuthStore.getState().requireAuth('batch import statement expenses')) return 0;
        let addedCount = 0;
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

          addedCount = uniqueItems.length;
          return {
            expenses: [...uniqueItems, ...state.expenses],
          };
        });
        return addedCount;
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
        let addedCount = 0;
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

          addedCount = uniqueItems.length;
          return {
            incomes: [...uniqueItems, ...state.incomes],
          };
        });
        return addedCount;
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
        let addedCount = 0;
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

          addedCount = uniqueItems.length;
          return {
            calendarEvents: [...state.calendarEvents, ...uniqueItems],
          };
        });
        return addedCount;
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
        if (!useAuthStore.getState().requireAuth('add liability')) return;
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
        if (!useAuthStore.getState().requireAuth('add insurance policy')) return;
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

      // Subscription Management
      addSubscription: (subData) => {
        if (!useAuthStore.getState().requireAuth('add subscription')) return;
        const newSub: Subscription = {
          ...subData,
          id: `sub_${Date.now()}`,
          createdAt: new Date().toISOString(),
        };
        set((state) => ({
          subscriptions: [newSub, ...state.subscriptions],
        }));
      },

      deleteSubscription: (id) => {
        set((state) => ({
          subscriptions: state.subscriptions.filter((s) => s.id !== id),
        }));
      },

      updateSubscription: (id, updates) => {
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id ? { ...s, ...updates } : s
          ),
        }));
      },

      markSubscriptionPaid: (id, paidDate) => {
        const sub = get().subscriptions.find((s) => s.id === id);
        if (!sub) return;
        const today = paidDate || new Date().toISOString().split('T')[0];
        let nextDue = today;
        if (sub.billingCycle === 'MONTHLY') {
          const d = new Date(today);
          d.setMonth(d.getMonth() + 1);
          nextDue = d.toISOString().split('T')[0];
        } else if (sub.billingCycle === 'QUARTERLY') {
          const d = new Date(today);
          d.setMonth(d.getMonth() + 3);
          nextDue = d.toISOString().split('T')[0];
        } else if (sub.billingCycle === 'YEARLY') {
          const d = new Date(today);
          d.setFullYear(d.getFullYear() + 1);
          nextDue = d.toISOString().split('T')[0];
        } else if (sub.billingCycle === 'WEEKLY') {
          const d = new Date(today);
          d.setDate(d.getDate() + 7);
          nextDue = d.toISOString().split('T')[0];
        }
        set((state) => ({
          subscriptions: state.subscriptions.map((s) =>
            s.id === id
              ? { ...s, lastPaidDate: today, nextDueDate: nextDue }
              : s
          ),
        }));
      },
      // Bill Management
      addBill: (billData) => {
        if (!useAuthStore.getState().requireAuth('add bill')) return;
        const newBill: Bill = {
          ...billData,
          id: `bill_${Date.now()}`,
          createdAt: new Date().toISOString(),
          status: billData.status || 'UPCOMING',
        };
        set((state) => ({
          bills: [newBill, ...state.bills],
        }));
      },

      deleteBill: (id) => {
        set((state) => ({
          bills: state.bills.filter((b) => b.id !== id),
        }));
      },

      updateBill: (id, updates) => {
        set((state) => ({
          bills: state.bills.map((b) =>
            b.id === id ? { ...b, ...updates } : b
          ),
        }));
      },

      markBillPaid: (id, paidDate) => {
        set((state) => {
          const today = paidDate || new Date().toISOString().split('T')[0];
          const updatedBills = state.bills.map((b) => {
            if (b.id === id) {
              // Advance nextDueDate based on billingCycle
              const currentDue = new Date(b.nextDueDate);
              let nextDue = new Date(currentDue);
              switch (b.billingCycle) {
                case 'WEEKLY':
                  nextDue.setDate(nextDue.getDate() + 7);
                  break;
                case 'MONTHLY':
                  nextDue.setMonth(nextDue.getMonth() + 1);
                  break;
                case 'QUARTERLY':
                  nextDue.setMonth(nextDue.getMonth() + 3);
                  break;
                case 'YEARLY':
                  nextDue.setFullYear(nextDue.getFullYear() + 1);
                  break;
              }
              return {
                ...b,
                status: 'PAID' as const,
                lastPaidDate: today,
                nextDueDate: nextDue.toISOString().split('T')[0],
              };
            }
            return b;
          });
          return { bills: updatedBills };
        });
      },

      getUpcomingBills: (days = 7) => {
        const { bills } = get();
        const now = new Date();
        const future = new Date(now);
        future.setDate(future.getDate() + days);
        return bills.filter((b) => {
          if (b.status === 'PAID' || b.status === 'CANCELLED') return false;
          const dueDate = new Date(b.nextDueDate);
          return dueDate >= now && dueDate <= future;
        });
      },
      detectRecurringExpenses: () => {
        const state = get();
        const existingNames = new Set(
          state.subscriptions.map((s) => s.name.toLowerCase())
        );

        const recurringMerchants = [
          { name: 'NETFLIX', category: 'ENTERTAINMENT_SUBS', cycle: 'MONTHLY', amount: 6.99 },
          { name: 'SPOTIFY', category: 'ENTERTAINMENT_SUBS', cycle: 'MONTHLY', amount: 3.99 },
          { name: 'AMAZON PRIME', category: 'ENTERTAINMENT_SUBS', cycle: 'MONTHLY', amount: 4.99 },
          { name: 'GOOGLE ONE', category: 'ENTERTAINMENT_SUBS', cycle: 'MONTHLY', amount: 2.99 },
          { name: 'APPLE', category: 'ENTERTAINMENT_SUBS', cycle: 'MONTHLY', amount: 9.99 },
          { name: 'GYM', category: 'HEALTHCARE_INSURANCE', cycle: 'MONTHLY', amount: 25.00 },
          { name: 'ZOMATO', category: 'FOOD_DINING', cycle: 'MONTHLY', amount: 15.00 },
          { name: 'SWIGGY', category: 'FOOD_DINING', cycle: 'MONTHLY', amount: 15.00 },
          { name: 'UBER', category: 'TRAVEL_COMMUTE', cycle: 'MONTHLY', amount: 20.00 },
          { name: 'OLA', category: 'TRAVEL_COMMUTE', cycle: 'MONTHLY', amount: 20.00 },
          { name: 'AWS', category: 'OTHER_EXPENSE', cycle: 'MONTHLY', amount: 10.00 },
          { name: 'MICROSOFT', category: 'OTHER_EXPENSE', cycle: 'MONTHLY', amount: 7.99 },
          { name: 'ADOBE', category: 'OTHER_EXPENSE', cycle: 'MONTHLY', amount: 20.99 },
        ];

        state.expenses.forEach((exp) => {
          const upperNotes = (exp.notes || '').toUpperCase();
          const upperTitle = exp.title.toUpperCase();

          recurringMerchants.forEach((m) => {
            if (
              upperNotes.includes(m.name) ||
              upperTitle.includes(m.name) ||
              exp.title.toLowerCase().includes(m.name.toLowerCase())
            ) {
              if (!existingNames.has(m.name.toLowerCase())) {
                const nextDue = new Date();
                nextDue.setDate(nextDue.getDate() + 7);
                const newSub = {
                  id: `sub_auto_${Date.now()}_${Math.random().toString(36).slice(2)}`,
                  name: m.name,
                  category: m.category as any,
                  amount: m.amount > 0 ? m.amount : exp.amount,
                  currency: state.currency,
                  billingCycle: 'MONTHLY' as any,
                  nextDueDate: nextDue.toISOString().split('T')[0],
                  paymentMethod: 'UPI' as any,
                  status: 'ACTIVE' as any,
                  platform: m.name,
                  notes: 'Auto-detected from expense history',
                  autoDetected: true,
                  createdAt: new Date().toISOString(),
                };
                set((state) => ({
                  subscriptions: [newSub, ...state.subscriptions],
                }));
                existingNames.add(m.name.toLowerCase());
              }
            }
          });
        });

        console.log('[Subscription Detection] Scanned expenses for recurring patterns');
      },

      addGoal: (goalData) => {
        if (!useAuthStore.getState().requireAuth('create financial goal')) return;
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
        useMasteryStore.getState().awardPoints('FINANCE', 30, 'Funded life goal milestone');
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
        if (hasAuthToken()) {
          api.portfolio.resetToFresh().catch((err) => console.debug('[SQLite Sync] Reset portfolio:', err));
        }
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
           subscriptions: [],
           bills: [],
          aiMessages: [
            {
              id: `msg_welcome_${Date.now()}`,
              role: 'assistant',
              content: `ðŸ‘‹ **Welcome to LifeOS, ${userName || 'User'}!**Your personal command centre is initialized and ready. Your records are securely isolated to your account.ðŸ’¡ **Quick Ways to Start:**- Log an asset or trade via **'+ Add Trade'** in the top navigation.- Schedule upcoming expenses or routines in **Productivity & Agenda**.- Ask me any questions or track expenses directly via this AI Copilot!`,
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
        set({
          debts: INITIAL_DEBTS,
          policies: INITIAL_POLICIES,
          goals: INITIAL_GOALS,
          calendarEvents: INITIAL_CALENDAR_EVENTS,
        });
      },

      syncWithBackend: async () => {
        if (!hasAuthToken() || useAuthStore.getState().isDemoMode) return;
        try {
          const res = await api.portfolio.fetchData();
          if (res && res.success && res.data) {
            const current = get();

            const mergedAssets =
              res.data.assets && res.data.assets.length > 0
                ? res.data.assets
                : current.assets;

            const mergedTxns =
              res.data.transactions && res.data.transactions.length > 0
                ? res.data.transactions
                : current.transactions;

            const mergedDebts =
              res.data.debts && res.data.debts.length > 0
                ? res.data.debts
                : current.debts;

            const mergedPolicies =
              res.data.policies && res.data.policies.length > 0
                ? res.data.policies
                : current.policies;

            let mergedGoals = current.goals;
            if (res.data.goals && res.data.goals.length > 0) {
              const remoteIds = new Set(res.data.goals.map((g: GoalItem) => g.id));
              const remoteTitles = new Set(res.data.goals.map((g: GoalItem) => g.title.toLowerCase().trim()));
              const localUnique = current.goals.filter(
                (g) => !remoteIds.has(g.id) && !remoteTitles.has(g.title.toLowerCase().trim())
              );
              mergedGoals = [...res.data.goals, ...localUnique];
            }

            let mergedCalendar = current.calendarEvents;
            if (res.data.calendarEvents && res.data.calendarEvents.length > 0) {
              const remoteIds = new Set(res.data.calendarEvents.map((e: CalendarEvent) => e.id));
              const localUnique = current.calendarEvents.filter((e) => !remoteIds.has(e.id));
              mergedCalendar = [...res.data.calendarEvents, ...localUnique];
            }

            set({
              assets: mergedAssets,
              transactions: mergedTxns,
              debts: mergedDebts,
              policies: mergedPolicies,
              goals: mergedGoals,
              calendarEvents: mergedCalendar,
              emergencyTargetMonths: res.data.emergencyTargetMonths || current.emergencyTargetMonths,
            });
          }
        } catch (err: any) {
          if (import.meta.env.DEV) console.debug('[SQLite Sync] Local mode active:', err?.message);
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
            'Secure a comprehensive family health insurance floater (minimum â‚¹15-25 Lakhs) to shield your portfolio against hospital bills.'
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
        subscriptions: state.subscriptions,
        bills: state.bills,
        aiMessages: state.aiMessages,
      }),
    }
  )
);



