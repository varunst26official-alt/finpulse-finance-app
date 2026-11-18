import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { saveUserScopedData } from '@/services/userStorage';
import { useModalDismiss } from '@/hooks/useModalDismiss';
import { CURRENCY_CONFIGS, formatExactAmountText, cleanNumericInputString } from '@/utils/formatters';
import { IncomeCategory, ExpenseCategory } from '@/types/finance';
import {
  Wallet,
  Home,
  CreditCard,
  Target,
  Sparkles,
  AlertTriangle,
  CheckCircle2,
  X,
  Plus,
  Trash2,
  Calendar,
  Layers,
  Check,
  RefreshCw,
} from 'lucide-react';

interface MonthlyInflowAllocationModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'inflow' | 'living' | 'commitments';
}

interface OtherIncomeEntry {
  id: string;
  source: string;
  category: IncomeCategory;
  amount: number;
}

interface QuickBillEntry {
  id: string;
  name: string;
  category: ExpenseCategory;
  amount: number;
  dueDate: number; // Day of month 1-31
}

export const MonthlyInflowAllocationModal: React.FC<MonthlyInflowAllocationModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'inflow',
}) => {
  const { overlayProps, contentProps } = useModalDismiss(isOpen, onClose);

  const {
    monthlyNetIncome,
    setMonthlyNetIncome,
    monthlyLivingAllocation,
    setMonthlyLivingAllocation,
    incomes,
    addIncome,
    bills,
    addBill,
    debts,
    updateDebt,
    goals,
    updateGoal,
    addCalendarEvent,
    currency,
  } = useFinanceStore();

  const rate = CURRENCY_CONFIGS[currency]?.rateFromUSD || 84.5;
  const isINR = currency === 'INR';
  const currencySymbol = isINR ? '₹' : currency === 'AED' ? 'د.إ' : '$';

  const [activeTab, setActiveTab] = useState<'inflow' | 'living' | 'commitments'>(initialTab);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // --------------------------------------------------------------------------
  // TAB 1: INFLOW STATE
  // --------------------------------------------------------------------------
  const existingSalary = useMemo(() => {
    const s = (incomes || []).find((i) => i.category === 'SALARY' && i.frequency === 'MONTHLY');
    return s ? Math.round(s.amount * (isINR ? rate : 1)) : Math.round(monthlyNetIncome * (isINR ? rate : 1));
  }, [incomes, monthlyNetIncome, isINR, rate]);

  const [salaryInput, setSalaryInput] = useState<number>(existingSalary || 0);
  const [salaryDay, setSalaryDay] = useState<number>(1);

  const existingOtherIncomes = useMemo(() => {
    const others = (incomes || []).filter((i) => i.category !== 'SALARY' && i.frequency === 'MONTHLY');
    if (others.length > 0) {
      return others.map((o) => ({
        id: o.id,
        source: o.source,
        category: o.category,
        amount: Math.round(o.amount * (isINR ? rate : 1)),
      }));
    }
    return [];
  }, [incomes, isINR, rate]);

  const [otherIncomes, setOtherIncomes] = useState<OtherIncomeEntry[]>(existingOtherIncomes);
  const [syncToLedger, setSyncToLedger] = useState<boolean>(true);

  // --------------------------------------------------------------------------
  // TAB 2: ESSENTIAL LIVING & BILLS STATE
  // --------------------------------------------------------------------------
  const initialBills = useMemo(() => {
    if (bills && bills.length > 0) {
      return bills.map((b) => ({
        id: b.id,
        name: b.name,
        category: b.category,
        amount: Math.round(b.amount * (isINR ? rate : 1)),
        dueDate: 5,
      }));
    }
    return [];
  }, [bills, isINR, rate]);

  const [editableBills, setEditableBills] = useState<QuickBillEntry[]>(initialBills);

  // Variable essentials buckets - Starts at 0 until user allocates
  const [groceriesInput, setGroceriesInput] = useState<number>(() => {
    const alloc = monthlyLivingAllocation ? monthlyLivingAllocation * (isINR ? rate : 1) : 0;
    return Math.round(alloc * 0.45);
  });
  const [transitInput, setTransitInput] = useState<number>(() => {
    const alloc = monthlyLivingAllocation ? monthlyLivingAllocation * (isINR ? rate : 1) : 0;
    return Math.round(alloc * 0.2);
  });
  const [medicalInput, setMedicalInput] = useState<number>(() => {
    const alloc = monthlyLivingAllocation ? monthlyLivingAllocation * (isINR ? rate : 1) : 0;
    return Math.round(alloc * 0.15);
  });
  const [bufferInput, setBufferInput] = useState<number>(() => {
    const alloc = monthlyLivingAllocation ? monthlyLivingAllocation * (isINR ? rate : 1) : 0;
    return Math.round(alloc * 0.2);
  });

  // --------------------------------------------------------------------------
  // TAB 3: COMMITMENTS STATE (DEBTS & GOALS)
  // --------------------------------------------------------------------------
  const [editableDebts, setEditableDebts] = useState(() =>
    (debts || []).map((d) => ({
      id: d.id,
      title: d.title,
      category: d.category,
      monthlyEmi: Math.round(d.monthlyEmi * (isINR ? rate : 1)),
      outstanding: Math.round(d.currentOutstanding * (isINR ? rate : 1)),
    }))
  );

  const [editableGoals, setEditableGoals] = useState(() =>
    (goals || []).map((g) => ({
      id: g.id,
      title: g.title,
      category: g.category,
      monthlyContribution: Math.round(g.monthlyContribution * (isINR ? rate : 1)),
      targetAmount: Math.round(g.targetAmount * (isINR ? rate : 1)),
    }))
  );

  // --------------------------------------------------------------------------
  // REAL-TIME RECONCILIATION CALCULATIONS
  // --------------------------------------------------------------------------
  const totalOtherIncome = useMemo(
    () => otherIncomes.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [otherIncomes]
  );
  const totalInflow = Number(salaryInput || 0) + totalOtherIncome;

  const totalBills = useMemo(
    () => editableBills.reduce((sum, item) => sum + (Number(item.amount) || 0), 0),
    [editableBills]
  );
  const totalVariableLiving =
    Number(groceriesInput || 0) +
    Number(transitInput || 0) +
    Number(medicalInput || 0) +
    Number(bufferInput || 0);

  const totalLivingAndBills = totalBills + totalVariableLiving;

  const totalDebtsEmi = useMemo(
    () => editableDebts.reduce((sum, d) => sum + (Number(d.monthlyEmi) || 0), 0),
    [editableDebts]
  );

  const totalGoalsSip = useMemo(
    () => editableGoals.reduce((sum, g) => sum + (Number(g.monthlyContribution) || 0), 0),
    [editableGoals]
  );

  const totalOutflows = totalDebtsEmi + totalGoalsSip + totalLivingAndBills;
  const netBalance = totalInflow - totalOutflows;
  const isShortfall = netBalance < 0;
  const allocationPercent = totalInflow > 0 ? (totalOutflows / totalInflow) * 100 : 0;

  // --------------------------------------------------------------------------
  // 1-CLICK QUICK PRESETS (50/30/20 & BALANCED)
  // --------------------------------------------------------------------------
  const applyPreset503020 = () => {
    if (totalInflow <= 0) return;
    const targetNeeds = Math.round(totalInflow * 0.5); // 50% for Needs (Bills + Living + Debts)
    const targetLivingBudget = Math.max(5000, targetNeeds - totalBills - totalDebtsEmi);

    setGroceriesInput(Math.round(targetLivingBudget * 0.45));
    setTransitInput(Math.round(targetLivingBudget * 0.2));
    setMedicalInput(Math.round(targetLivingBudget * 0.15));
    setBufferInput(Math.round(targetLivingBudget * 0.2));
  };

  const autoBalanceZeroDeficit = () => {
    if (netBalance >= 0) return;
    const deficit = Math.abs(netBalance);
    // Scale down variable living buffers first
    const currentVariable = totalVariableLiving;
    if (currentVariable > deficit) {
      const remaining = currentVariable - deficit;
      const ratio = remaining / currentVariable;
      setGroceriesInput(Math.round(groceriesInput * ratio));
      setTransitInput(Math.round(transitInput * ratio));
      setMedicalInput(Math.round(medicalInput * ratio));
      setBufferInput(Math.round(bufferInput * ratio));
    } else {
      setBufferInput(0);
      setMedicalInput(Math.round(medicalInput * 0.8));
      setTransitInput(Math.round(transitInput * 0.8));
      setGroceriesInput(Math.round(groceriesInput * 0.8));
    }
  };

  // --------------------------------------------------------------------------
  // ATOMIC APPLY & CROSS-MODULE SYNC
  // --------------------------------------------------------------------------
  const handleApplySync = () => {
    // 1. Update Core Allocation Engine Metrics
    const totalInflowUSD = isINR ? totalInflow / rate : totalInflow;
    const totalVariableLivingUSD = isINR ? totalVariableLiving / rate : totalVariableLiving;

    setMonthlyNetIncome(totalInflowUSD);
    setMonthlyLivingAllocation(totalVariableLivingUSD);

    // 2. Synchronize to Incomes Ledger
    if (syncToLedger && totalInflow > 0) {
      const today = new Date().toISOString().split('T')[0];
      const salaryUSD = isINR ? salaryInput / rate : salaryInput;

      // Add/sync primary salary
      addIncome({
        source: 'Primary Monthly Salary',
        category: 'SALARY',
        amount: Number(salaryUSD.toFixed(2)),
        frequency: 'MONTHLY',
        date: today,
        account: 'Primary Salary Bank Account',
        notes: `Synchronized from Inflow Allocation Engine (Credit Day: ${salaryDay})`,
      });

      // Add other income streams with non-zero amounts
      otherIncomes.forEach((other) => {
        if (other.amount > 0) {
          const amtUSD = isINR ? other.amount / rate : other.amount;
          addIncome({
            source: other.source,
            category: other.category,
            amount: Number(amtUSD.toFixed(2)),
            frequency: 'MONTHLY',
            date: today,
            notes: 'Recurring side inflow from Inflow Allocation Studio',
          });
        }
      });

      // Calendar sync: Salary Expected Inflow
      const currentYear = new Date().getFullYear();
      const currentMonth = String(new Date().getMonth() + 1).padStart(2, '0');
      const salaryDateISO = `${currentYear}-${currentMonth}-${String(salaryDay).padStart(2, '0')}`;

      addCalendarEvent({
        title: 'Monthly Salary Credit',
        date: salaryDateISO,
        type: 'EXPECTED_INCOME',
        amount: Number(salaryUSD.toFixed(2)),
        categoryName: 'Salary Credit',
        isCompleted: false,
        notes: 'Monthly salary inflow scheduled by Allocation Engine',
      });
    }

    // 3. Synchronize Bills
    editableBills.forEach((b) => {
      const existing = (bills || []).find((eb) => eb.id === b.id || eb.name.toLowerCase() === b.name.toLowerCase());
      const amtUSD = isINR ? b.amount / rate : b.amount;
      if (!existing && b.amount > 0) {
        addBill({
          name: b.name,
          category: b.category,
          amount: Number(amtUSD.toFixed(2)),
          currency,
          billingCycle: 'MONTHLY',
          nextDueDate: new Date(Date.now() + b.dueDate * 86400000).toISOString().split('T')[0],
          paymentMethod: 'NET_BANKING',
          status: 'UPCOMING',
          autoDetected: false,
          createdAt: new Date().toISOString(),
          notes: 'Configured via Inflow & Allocation Studio',
        });
      }
    });

    // 4. Synchronize Debts EMIs
    editableDebts.forEach((ed) => {
      const original = (debts || []).find((d) => d.id === ed.id);
      if (original) {
        const newEmiUSD = isINR ? ed.monthlyEmi / rate : ed.monthlyEmi;
        if (Math.abs(original.monthlyEmi - newEmiUSD) > 0.5) {
          updateDebt(ed.id, { monthlyEmi: Number(newEmiUSD.toFixed(2)) });
        }
      }
    });

    // 5. Synchronize Goals SIPs
    editableGoals.forEach((eg) => {
      const original = (goals || []).find((g) => g.id === eg.id);
      if (original) {
        const newSipUSD = isINR ? eg.monthlyContribution / rate : eg.monthlyContribution;
        if (Math.abs(original.monthlyContribution - newSipUSD) > 0.5) {
          updateGoal(eg.id, { monthlyContribution: Number(newSipUSD.toFixed(2)) });
        }
      }
    });

    try {
      saveUserScopedData(useAuthStore.getState().user);
    } catch (_) {}

    setSuccessToast('🎉 Inflow & Allocations synchronized across All Workspaces!');
    setTimeout(() => {
      onClose();
    }, 900);
  };

  if (!isOpen) return null;

  return createPortal(
    <div
      {...overlayProps}
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[9999] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-slate-950/45 backdrop-blur-xs cursor-pointer overflow-y-auto overscroll-contain"
    >
      <motion.div
        {...contentProps}
        initial={{ opacity: 0, y: 35, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 35, scale: 0.98 }}
        transition={{ type: 'spring', damping: 28, stiffness: 340 }}
        className="w-full max-w-3xl max-h-[min(90vh,calc(100dvh-1rem))] sm:max-h-[92vh] flex flex-col rounded-t-3xl sm:rounded-3xl border border-[#e8e0d1] bg-white shadow-2xl overflow-hidden cursor-default"
      >
        {/* Mobile Drawer Top Drag Handle */}
        <div className="shrink-0 pt-3 pb-0 bg-[#faf8f5] sm:hidden flex justify-center">
          <div className="w-12 h-1.5 bg-slate-300 rounded-full shrink-0" />
        </div>

        {/* Modal Header */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex items-center justify-between gap-4 bg-[#faf8f5]">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-[#9e783e]/15 text-[#9e783e]">
              <Wallet className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900 flex items-center gap-2">
                <span>Monthly Inflow & Allocation Studio</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#9e783e]/10 text-[#9e783e] font-bold">
                  CROSS-SYNC
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Configure your net salary, side incomes, essential bills & living allocation with live cross-section sync.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation Strip */}
        <div className="flex border-b border-slate-100 bg-slate-50/50 p-2 gap-2 text-xs font-bold overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('inflow')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'inflow'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Wallet className="w-4 h-4 text-[#9e783e]" />
            <span>1. Monthly Inflow ({currencySymbol}{totalInflow.toLocaleString()})</span>
          </button>

          <button
            onClick={() => setActiveTab('living')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'living'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Home className="w-4 h-4 text-sky-600" />
            <span>2. Essential Living & Bills ({currencySymbol}{totalLivingAndBills.toLocaleString()})</span>
          </button>

          <button
            onClick={() => setActiveTab('commitments')}
            className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-2 shrink-0 ${
              activeTab === 'commitments'
                ? 'bg-white text-slate-900 shadow-xs border border-slate-200/80'
                : 'text-slate-500 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>3. Debts & Goals ({currencySymbol}{(totalDebtsEmi + totalGoalsSip).toLocaleString()})</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-5 flex-1">
          {/* TAB 1: MONTHLY INFLOW ENGINE */}
          {activeTab === 'inflow' && (
            <div className="space-y-5">
              {/* Primary Salary Box */}
              <div className="p-4 sm:p-5 rounded-2xl bg-amber-50/50 border border-amber-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <span className="p-2 rounded-xl bg-amber-500 text-white font-bold text-xs">💼</span>
                    <div>
                      <h4 className="text-sm font-extrabold text-slate-900">Primary Take-Home Salary</h4>
                      <p className="text-xs text-slate-500">Monthly bank credit after tax, EPF & deductions</p>
                    </div>
                  </div>
                  <span className="text-[11px] font-mono font-bold text-amber-800 bg-amber-100/70 px-2.5 py-1 rounded-lg">
                    PRIMARY BASELINE
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1">
                  <div className="sm:col-span-2 relative">
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Monthly Take-Home Pay ({currencySymbol})
                    </label>
                    <div className="relative">
                      <span className="absolute left-3.5 top-1/2 -translate-y-1/2 font-mono font-bold text-slate-400">
                        {currencySymbol}
                      </span>
                      <input
                        type="text"
                        inputMode="decimal"
                        value={salaryInput || ''}
                        onChange={(e) => setSalaryInput(Number(cleanNumericInputString(e.target.value)) || 0)}
                        onFocus={(e) => {
                          if (e.target.value === '0') e.target.select();
                        }}
                        className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:outline-hidden focus:border-amber-500"
                        placeholder="e.g. 100000"
                      />
                    </div>
                    <span className="text-[11px] font-mono font-bold text-[#9e783e] mt-1 block">
                      {formatExactAmountText(salaryInput || 0, currency)}
                    </span>
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase block mb-1">
                      Credit Day of Month
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        type="number"
                        min="1"
                        max="31"
                        value={salaryDay}
                        onChange={(e) => setSalaryDay(Math.min(31, Math.max(1, Number(e.target.value) || 1)))}
                        className="w-full h-11 pl-9 pr-3 rounded-xl bg-white border border-slate-300 font-mono font-bold text-sm text-slate-900 focus:outline-hidden focus:border-amber-500"
                        placeholder="Day (1-31)"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Other Incomes Breakdown */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Other Incomes & Side Streams</h4>
                    <p className="text-xs text-slate-500">Freelance, rental yield, dividends, consulting or side-business</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setOtherIncomes([
                        ...otherIncomes,
                        {
                          id: `inc_${Date.now()}`,
                          source: 'Additional Income Stream',
                          category: 'OTHER_INCOME',
                          amount: 5000,
                        },
                      ])
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Income Stream</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {otherIncomes.map((item, index) => (
                    <div
                      key={item.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="text"
                          value={item.source}
                          onChange={(e) => {
                            const next = [...otherIncomes];
                            next[index].source = e.target.value;
                            setOtherIncomes(next);
                          }}
                          className="w-full text-xs font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-hidden py-1"
                          placeholder="Income source title"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="flex flex-col items-end">
                          <div className="relative w-36">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                              {currencySymbol}
                            </span>
                            <input
                              type="text"
                              inputMode="decimal"
                              value={item.amount || ''}
                              onChange={(e) => {
                                const next = [...otherIncomes];
                                next[index].amount = Number(cleanNumericInputString(e.target.value)) || 0;
                                setOtherIncomes(next);
                              }}
                              onFocus={(e) => {
                                if (e.target.value === '0') e.target.select();
                              }}
                              className="w-full h-8 pl-7 pr-2 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-hidden"
                              placeholder="0"
                            />
                          </div>
                          {item.amount > 0 && (
                            <span className="text-[9px] font-mono font-bold text-[#9e783e] pr-1">
                              {formatExactAmountText(item.amount, currency)}
                            </span>
                          )}
                        </div>

                        <button
                          type="button"
                          onClick={() => setOtherIncomes(otherIncomes.filter((_, i) => i !== index))}
                          className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Cross-sync toggle */}
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <RefreshCw className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-bold text-slate-800">
                    Sync recurring entries to Income Cashflow Ledger & Master Calendar
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={syncToLedger}
                  onChange={(e) => setSyncToLedger(e.target.checked)}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
              </div>
            </div>
          )}

          {/* TAB 2: ESSENTIAL LIVING & BILLS */}
          {activeTab === 'living' && (
            <div className="space-y-5">
              {/* Presets Strip */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200">
                <div>
                  <h4 className="text-xs font-extrabold text-indigo-950 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-indigo-600" />
                    <span>Quick Allocation Presets</span>
                  </h4>
                  <p className="text-[11px] text-indigo-700">Auto-proportion essential living based on total inflow</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={applyPreset503020}
                    className="px-3 py-1.5 rounded-xl bg-white hover:bg-indigo-100 text-indigo-800 text-xs font-bold shadow-2xs border border-indigo-200 transition-all cursor-pointer"
                  >
                    50/30/20 Rule
                  </button>
                  {isShortfall && (
                    <button
                      type="button"
                      onClick={autoBalanceZeroDeficit}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all cursor-pointer flex items-center gap-1"
                    >
                      <span>Auto-Balance Deficit</span>
                    </button>
                  )}
                </div>
              </div>

              {/* Section A: Monthly Recurring Bills */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-extrabold text-slate-900">Monthly Essential Bills & Utilities</h4>
                    <p className="text-xs text-slate-500">Rent, electricity, Wi-Fi, insurance & society dues</p>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      setEditableBills([
                        ...editableBills,
                        {
                          id: `bill_${Date.now()}`,
                          name: 'Utility / Service Bill',
                          category: 'UTILITIES_BILLS',
                          amount: 2000,
                          dueDate: 10,
                        },
                      ])
                    }
                    className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Bill</span>
                  </button>
                </div>

                <div className="space-y-2">
                  {editableBills.map((bill, index) => (
                    <div
                      key={bill.id}
                      className="p-3 rounded-xl border border-slate-200 bg-white flex flex-col sm:flex-row items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex-1 w-full sm:w-auto">
                        <input
                          type="text"
                          value={bill.name}
                          onChange={(e) => {
                            const next = [...editableBills];
                            next[index].name = e.target.value;
                            setEditableBills(next);
                          }}
                          className="w-full text-xs font-bold text-slate-800 bg-transparent border-b border-transparent focus:border-slate-300 focus:outline-hidden py-1"
                          placeholder="Bill name"
                        />
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <div className="relative w-36">
                          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                            {currencySymbol}
                          </span>
                          <input
                            type="number"
                            min="0"
                            value={bill.amount || ''}
                            onChange={(e) => {
                              const next = [...editableBills];
                              next[index].amount = Number(e.target.value) || 0;
                              setEditableBills(next);
                            }}
                            className="w-full h-8 pl-7 pr-2 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-hidden"
                            placeholder="0"
                          />
                        </div>

                        <button
                          type="button"
                          onClick={() => setEditableBills(editableBills.filter((_, i) => i !== index))}
                          className="p-1.5 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Section B: Variable Essentials Allocation */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div>
                  <h4 className="text-sm font-extrabold text-slate-900">Variable Daily Living Expenses</h4>
                  <p className="text-xs text-slate-500">Groceries, transportation, medical needs & flexible buffer</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>🛒 Groceries & Household Provisions</span>
                      <span className="font-mono text-slate-900">{currencySymbol}{groceriesInput.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="2000"
                      max={Math.max(50000, totalInflow * 0.4)}
                      step="500"
                      value={groceriesInput}
                      onChange={(e) => setGroceriesInput(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>🚗 Commute, Transit & Fuel</span>
                      <span className="font-mono text-slate-900">{currencySymbol}{transitInput.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="1000"
                      max={Math.max(25000, totalInflow * 0.2)}
                      step="500"
                      value={transitInput}
                      onChange={(e) => setTransitInput(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>🏥 Health, Pharmacy & Family Care</span>
                      <span className="font-mono text-slate-900">{currencySymbol}{medicalInput.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="500"
                      max={Math.max(20000, totalInflow * 0.15)}
                      step="500"
                      value={medicalInput}
                      onChange={(e) => setMedicalInput(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>

                  <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-1">
                    <label className="text-[11px] font-bold text-slate-600 flex items-center justify-between">
                      <span>🍿 Discretionary Dining & Buffer</span>
                      <span className="font-mono text-slate-900">{currencySymbol}{bufferInput.toLocaleString()}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max={Math.max(25000, totalInflow * 0.2)}
                      step="500"
                      value={bufferInput}
                      onChange={(e) => setBufferInput(Number(e.target.value))}
                      className="w-full accent-sky-600 cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMMITMENTS (DEBTS & GOALS) */}
          {activeTab === 'commitments' && (
            <div className="space-y-5">
              {/* Active Debts EMIs */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CreditCard className="w-4 h-4 text-amber-600" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Loan EMIs & Debt Commitments ({currencySymbol}{totalDebtsEmi.toLocaleString()})
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-md font-bold">
                    DEBT REPAYMENT SYNC
                  </span>
                </div>

                {editableDebts.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No active loan obligations in your portfolio. You have 0 debt overhang!
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editableDebts.map((debt, index) => (
                      <div
                        key={debt.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{debt.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Outstanding: {currencySymbol}{debt.outstanding.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">EMI:</label>
                          <div className="relative w-32">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={debt.monthlyEmi}
                              onChange={(e) => {
                                const next = [...editableDebts];
                                next[index].monthlyEmi = Number(e.target.value) || 0;
                                setEditableDebts(next);
                              }}
                              className="w-full h-8 pl-7 pr-2 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Active Goals SIPs */}
              <div className="space-y-3 pt-2 border-t border-slate-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Target className="w-4 h-4 text-indigo-600" />
                    <h4 className="text-sm font-extrabold text-slate-900">
                      Goal SIP Commitments ({currencySymbol}{totalGoalsSip.toLocaleString()})
                    </h4>
                  </div>
                  <span className="text-[10px] font-mono text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-md font-bold">
                    GOAL MANAGER SYNC
                  </span>
                </div>

                {editableGoals.length === 0 ? (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-center text-xs text-slate-500">
                    No active life goals recorded yet. You can initialize goals in Goal Manager.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {editableGoals.map((goal, index) => (
                      <div
                        key={goal.id}
                        className="p-3.5 rounded-xl border border-slate-200 bg-white flex items-center justify-between gap-3 shadow-2xs"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-900">{goal.title}</div>
                          <div className="text-[10px] text-slate-400 font-mono">
                            Target: {currencySymbol}{goal.targetAmount.toLocaleString()}
                          </div>
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase">Monthly SIP:</label>
                          <div className="relative w-32">
                            <span className="absolute left-2.5 top-1/2 -translate-y-1/2 font-mono font-bold text-xs text-slate-400">
                              {currencySymbol}
                            </span>
                            <input
                              type="number"
                              min="0"
                              value={goal.monthlyContribution}
                              onChange={(e) => {
                                const next = [...editableGoals];
                                next[index].monthlyContribution = Number(e.target.value) || 0;
                                setEditableGoals(next);
                              }}
                              className="w-full h-8 pl-7 pr-2 rounded-lg bg-slate-50 border border-slate-200 font-mono font-bold text-xs text-slate-900 focus:outline-hidden"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Live Reconciliation Pre-Commit Bar */}
        <div className="p-4 sm:p-5 pb-safe-bottom bg-slate-50 border-t border-slate-200 space-y-3 shrink-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {isShortfall ? (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-rose-700 bg-rose-100 px-2.5 py-1 rounded-lg">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                    <span>Shortfall Warning: -{currencySymbol}{Math.abs(netBalance).toLocaleString()} / month</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-100 px-2.5 py-1 rounded-lg">
                    <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Investable Surplus: +{currencySymbol}{netBalance.toLocaleString()} / month</span>
                  </div>
                )}
                <span className="text-[11px] font-mono text-slate-500">
                  ({allocationPercent.toFixed(1)}% allocated)
                </span>
              </div>
              <p className="text-[11px] text-slate-500">
                Inflow: {currencySymbol}{totalInflow.toLocaleString()} • Outflows: {currencySymbol}{totalOutflows.toLocaleString()} (EMIs: {currencySymbol}{totalDebtsEmi.toLocaleString()} + SIPs: {currencySymbol}{totalGoalsSip.toLocaleString()} + Living/Bills: {currencySymbol}{totalLivingAndBills.toLocaleString()})
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 rounded-xl bg-white hover:bg-slate-200/80 text-slate-700 text-xs font-bold border border-slate-300 transition-all cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleApplySync}
                className="px-5 py-2.5 rounded-xl bg-[#9e783e] hover:bg-[#88642e] text-white text-xs font-bold shadow-md shadow-[#9e783e]/20 transition-all cursor-pointer flex items-center gap-2"
              >
                <Check className="w-4 h-4" />
                <span>Apply & Synchronize LifeOS</span>
              </button>
            </div>
          </div>

          {/* Success Banner */}
          <AnimatePresence>
            {successToast && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
                className="p-3 rounded-xl bg-emerald-600 text-white font-bold text-xs flex items-center gap-2 shadow-md"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{successToast}</span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </div>,
    document.body
  );
};
