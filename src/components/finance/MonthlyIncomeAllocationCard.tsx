import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { saveUserScopedData } from '@/services/userStorage';
import { formatCurrency, CURRENCY_CONFIGS, formatExactAmountText, cleanNumericInputString } from '@/utils/formatters';
import { MonthlyInflowAllocationModal } from './MonthlyInflowAllocationModal';
import {
  Wallet,
  AlertTriangle,
  Sparkles,
  Target,
  CreditCard,
  Home,
  Edit3,
  Check,
  X,
  ShieldAlert,
} from 'lucide-react';

export const MonthlyIncomeAllocationCard: React.FC = () => {
  const {
    monthlyNetIncome,
    setMonthlyNetIncome,
    monthlyLivingAllocation,
    setMonthlyLivingAllocation,
    getIncomeAllocation,
    bills,
    currency,
  } = useFinanceStore();

  const rate = CURRENCY_CONFIGS[currency]?.rateFromUSD || 84.5;
  const isINR = currency === 'INR';

  const [isStudioOpen, setIsStudioOpen] = useState(false);
  const [studioTab, setStudioTab] = useState<'inflow' | 'living' | 'commitments'>('inflow');

  const [isEditing, setIsEditing] = useState(false);
  const [incomeInput, setIncomeInput] = useState<string>(() =>
    Math.round(monthlyNetIncome * (isINR ? rate : 1)).toString()
  );

  const [isEditingLiving, setIsEditingLiving] = useState(false);
  const [livingInput, setLivingInput] = useState<string>(() =>
    Math.round((monthlyLivingAllocation || 0) * (isINR ? rate : 1)).toString()
  );

  const allocation = getIncomeAllocation();

  // Converted display values
  const displayIncome = allocation.monthlyIncomeUSD * (isINR ? rate : 1);
  const displayDebts = allocation.debtsMonthlyEmiUSD * (isINR ? rate : 1);
  const displayGoals = allocation.goalsMonthlySipUSD * (isINR ? rate : 1);
  const displayExpenses = allocation.livingExpensesMonthlyUSD * (isINR ? rate : 1);
  const displayTotalAllocated = allocation.totalAllocatedUSD * (isINR ? rate : 1);

  // Percentages relative to monthly income
  const debtPct = displayIncome > 0 ? (displayDebts / displayIncome) * 100 : 0;
  const goalsPct = displayIncome > 0 ? (displayGoals / displayIncome) * 100 : 0;
  const expPct = displayIncome > 0 ? (displayExpenses / displayIncome) * 100 : 0;
  const surplusPct = displayIncome > 0 ? Math.max(0, 100 - (debtPct + goalsPct + expPct)) : 0;
  const overflowPct = displayIncome > 0 && allocation.isShortfall ? allocation.allocationPercent - 100 : 0;

  const handleSaveIncome = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(incomeInput.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed >= 0) {
      const usdValue = isINR ? parsed / rate : parsed;
      setMonthlyNetIncome(usdValue);
      try {
        saveUserScopedData(useAuthStore.getState().user);
      } catch (_) {}
      setIsEditing(false);
    }
  };

  const handleSaveLiving = (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = parseFloat(livingInput.replace(/[^0-9.]/g, ''));
    if (!isNaN(parsed) && parsed >= 0) {
      const usdValue = isINR ? parsed / rate : parsed;
      setMonthlyLivingAllocation(usdValue);
      try {
        saveUserScopedData(useAuthStore.getState().user);
      } catch (_) {}
      setIsEditingLiving(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-[#e8e0d1] bg-white p-5 sm:p-6 shadow-xs space-y-5"
    >
      {/* Top Strip: Header & Income Display / Inline Edit */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#f0eae1]">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-[#9e783e]/15 text-[#9e783e]">
            <Wallet className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
              Monthly Income & Allocation Engine
            </h3>
            <p className="text-xs text-slate-500 font-medium">
              Real-time commitment allocation across Debts, Goals & Living Expenses
            </p>
          </div>
        </div>

        {/* Income Editor */}
        <div className="flex items-center gap-2">
          {!isEditing ? (
            <div className="flex items-center gap-3 bg-[#faf8f5] border border-[#e8e0d1] px-4 py-2 rounded-2xl">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  Monthly Net Inflow
                </span>
                <span className="text-base sm:text-lg font-extrabold font-mono text-slate-900">
                  {formatCurrency(allocation.monthlyIncomeUSD, currency)}
                </span>
              </div>
              <button
                onClick={() => setIsEditing(true)}
                data-testid="edit-income-btn"
                className="p-1.5 rounded-xl hover:bg-[#e8e0d1]/60 text-slate-600 transition-colors cursor-pointer"
                title="Edit Monthly Income"
                aria-label="Edit Monthly Income"
              >
                <Edit3 className="w-4 h-4" />
              </button>
              <button
                onClick={() => {
                  setStudioTab('inflow');
                  setIsStudioOpen(true);
                }}
                data-testid="studio-modal-btn"
                className="hidden sm:flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-[#9e783e]/10 hover:bg-[#9e783e]/20 text-[#9e783e] text-xs font-bold transition-colors cursor-pointer"
                title="Configure Monthly Inflow & Allocation Studio"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Studio</span>
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveIncome} className="flex flex-col items-end gap-1">
              <div className="flex items-center gap-1.5">
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    required
                    autoFocus
                    data-testid="income-input"
                    value={incomeInput}
                    onChange={(e) => setIncomeInput(cleanNumericInputString(e.target.value))}
                    onFocus={(e) => {
                      if (e.target.value === '0') e.target.select();
                    }}
                    className="w-36 sm:w-44 h-10 pl-7 pr-3 rounded-xl bg-white border-2 border-[#9e783e] text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                    placeholder="Monthly Inflow"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="save-income-btn"
                  title="Save Monthly Income"
                  className="h-10 px-3 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-colors cursor-pointer flex items-center justify-center"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="h-10 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs font-bold hover:bg-slate-200 transition-colors cursor-pointer flex items-center justify-center"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[11px] font-mono font-bold text-[#9e783e] pr-1">
                {formatExactAmountText(parseFloat(incomeInput) || 0, currency)}
              </span>
            </form>
          )}
        </div>
      </div>

      {/* Prominent Shortfall vs Surplus Notification Banner */}
      <AnimatePresence mode="wait">
        {allocation.monthlyIncomeUSD === 0 ? (
          <motion.div
            key="zero-income-banner"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-amber-50/80 via-white to-amber-50/40 border border-amber-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3"
          >
            <div className="flex items-start sm:items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-sm shadow-amber-500/20 mt-0.5 sm:mt-0">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 tracking-tight">Set Monthly Net Inflow</h4>
                <p className="text-xs text-slate-600 font-medium mt-0.5">
                  Enter your monthly take-home salary or net income to activate real-time commitment allocation and surplus buffer tracking.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(true)}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 active:scale-95 text-white font-bold text-xs transition-all shadow-xs shrink-0 cursor-pointer text-center"
            >
              + Enter Monthly Income
            </button>
          </motion.div>
        ) : allocation.isShortfall ? (
          <motion.div
            key="shortfall-alert"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-4 sm:p-5 rounded-2xl bg-rose-50 border-2 border-rose-300 text-rose-950 space-y-2.5 shadow-xs"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-rose-600 text-white shrink-0">
                  <AlertTriangle className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-rose-900 flex items-center gap-2">
                    <span>⚠️ Shortfall Alert:</span>
                    <span className="font-mono text-rose-700 bg-rose-200/80 px-2 py-0.5 rounded-lg">
                      -{formatCurrency(allocation.shortfallAmountUSD, currency)} / month
                    </span>
                  </h4>
                  <p className="text-xs text-rose-800 font-medium mt-0.5">
                    Your commitments exceed your income by{' '}
                    <strong>{overflowPct.toFixed(1)}%</strong> ({allocation.allocationPercent.toFixed(1)}% total allocated).
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-rose-600 block">Total Outflows Required</span>
                <span className="text-sm font-extrabold font-mono text-rose-900">
                  {formatCurrency(allocation.totalAllocatedUSD, currency)}
                </span>
              </div>
            </div>

            <div className="pt-2 border-t border-rose-200/70 text-xs text-rose-800 flex items-start gap-2">
              <ShieldAlert className="w-4 h-4 shrink-0 text-rose-600 mt-0.5" />
              <span>
                <strong>Actionable Correction:</strong> To close this shortfall, reduce discretionary living expenses by{' '}
                <strong className="underline">{formatCurrency(allocation.shortfallAmountUSD, currency)}</strong> or extend your goal completion targets to lower monthly SIP requirements.
              </span>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="surplus-banner"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-emerald-50/90 via-white to-emerald-50/50 border border-emerald-200/80 shadow-xs space-y-3"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-start sm:items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-sm shadow-emerald-600/20 mt-0.5 sm:mt-0">
                  <Sparkles className="w-5 h-5 text-emerald-100" />
                </div>
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-extrabold text-slate-900 tracking-tight">Investable Surplus Buffer</span>
                    <span className="font-mono text-xs font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200 px-2 py-0.5 rounded-lg shadow-2xs">
                      +{formatCurrency(allocation.surplusAmountUSD, currency)} / month
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 font-medium mt-1">
                    Your commitments consume <strong className="text-slate-900">{allocation.allocationPercent.toFixed(1)}%</strong> of income. You are safely within your monthly capacity.
                  </p>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between border-t border-emerald-100 sm:border-t-0 pt-2 sm:pt-0 shrink-0">
                <span className="text-[10px] uppercase font-bold tracking-wider text-emerald-700">Surplus Share</span>
                <span className="text-xs sm:text-sm font-extrabold font-mono text-emerald-800 bg-emerald-100/70 px-2 py-0.5 rounded-md mt-0.5">
                  {surplusPct.toFixed(1)}% free buffer
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Multi-Segment Capacity Allocation Bar */}
      <div className="space-y-2">
        <div className="flex justify-between items-center text-xs font-bold text-slate-700">
          <span>Income Capacity Allocation</span>
          <span className="font-mono">
            {displayIncome > 0
              ? `${Math.round(displayTotalAllocated).toLocaleString()} / ${Math.round(displayIncome).toLocaleString()} (${allocation.allocationPercent.toFixed(1)}%)`
              : '0%'}
          </span>
        </div>

        <div className="w-full h-5 rounded-full bg-slate-100 overflow-hidden flex p-0.5 border border-[#e8e0d1]">
          {/* Debts EMIs */}
          {debtPct > 0 && (
            <div
              style={{ width: `${Math.min(debtPct, 100)}%` }}
              className="h-full bg-amber-500 rounded-l-full relative group transition-all"
              title={`Debts: ${debtPct.toFixed(1)}%`}
            />
          )}
          {/* Goals SIPs */}
          {goalsPct > 0 && (
            <div
              style={{ width: `${Math.min(goalsPct, 100 - Math.min(debtPct, 100))}%` }}
              className="h-full bg-indigo-600 relative group transition-all"
              title={`Goals: ${goalsPct.toFixed(1)}%`}
            />
          )}
          {/* Living Expenses */}
          {expPct > 0 && (
            <div
              style={{
                width: `${Math.min(
                  expPct,
                  Math.max(0, 100 - Math.min(debtPct + goalsPct, 100))
                )}%`,
              }}
              className="h-full bg-sky-500 relative group transition-all"
              title={`Living Expenses: ${expPct.toFixed(1)}%`}
            />
          )}
          {/* Surplus Buffer */}
          {!allocation.isShortfall && surplusPct > 0 && (
            <div
              style={{ width: `${surplusPct}%` }}
              className="h-full bg-emerald-500 rounded-r-full relative group transition-all"
              title={`Free Surplus: ${surplusPct.toFixed(1)}%`}
            />
          )}
          {/* Shortfall Overhang */}
          {allocation.isShortfall && (
            <div
              style={{ width: `${Math.min(overflowPct, 30)}%` }}
              className="h-full bg-rose-500 rounded-r-full animate-pulse"
              title={`Deficit: ${overflowPct.toFixed(1)}%`}
            />
          )}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-[11px] font-semibold text-slate-600">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
            <span>Debts & EMIs ({debtPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-600" />
            <span>Goals SIPs ({goalsPct.toFixed(1)}%)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-sky-500" />
            <span>Living & Bills ({expPct.toFixed(1)}%)</span>
          </div>
          {!allocation.isShortfall ? (
            <div className="flex items-center gap-1.5 text-emerald-700">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span>Surplus Buffer ({surplusPct.toFixed(1)}%)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-rose-700">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span>Shortfall Overhang (+{overflowPct.toFixed(1)}%)</span>
            </div>
          )}
        </div>
      </div>

      {/* 4 Detail Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Income Card */}
        <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px]">Monthly Net Income</span>
            <Wallet className="w-4 h-4 text-[#9e783e]" />
          </div>
          <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900">
            {formatCurrency(allocation.monthlyIncomeUSD, currency)}
          </div>
          <span className="text-[10px] text-slate-500 block">Baseline capacity</span>
        </div>

        {/* Debts EMIs */}
        <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px]">Debt EMIs</span>
            <CreditCard className="w-4 h-4 text-amber-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900">
            {formatCurrency(allocation.debtsMonthlyEmiUSD, currency)}
          </div>
          <span className="text-[10px] font-semibold text-amber-700 block">
            {debtPct.toFixed(1)}% of income
          </span>
        </div>

        {/* Goals SIPs */}
        <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px]">Goals SIPs</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900">
            {formatCurrency(allocation.goalsMonthlySipUSD, currency)}
          </div>
          <span className="text-[10px] font-semibold text-indigo-700 block">
            {goalsPct.toFixed(1)}% of income
          </span>
        </div>

        {/* Living Expenses & User Bills */}
        <div data-testid="living-bills-card" className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2 relative group">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px]">Living & Bills</span>
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setIsEditingLiving(true)}
                data-testid="edit-living-btn"
                className="p-1 rounded-lg hover:bg-[#e8e0d1]/60 text-slate-500 hover:text-slate-900 transition-colors cursor-pointer"
                title="Edit Living Budget"
                aria-label="Edit Living Budget"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setStudioTab('living');
                  setIsStudioOpen(true);
                }}
                data-testid="open-living-studio-btn"
                className="p-1 rounded-lg hover:bg-[#e8e0d1]/60 text-[#9e783e] hover:text-[#88642e] transition-colors cursor-pointer"
                title="Open Inflow & Allocation Studio"
                aria-label="Open Inflow & Allocation Studio"
              >
                <Sparkles className="w-3.5 h-3.5" />
              </button>
              <Home className="w-4 h-4 text-sky-600" />
            </div>
          </div>

          {!isEditingLiving ? (
            <div>
              <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900">
                {formatCurrency(allocation.livingExpensesMonthlyUSD, currency)}
              </div>
              <div className="text-[10px] text-slate-500 font-medium space-y-0.5 mt-1">
                <div className="flex justify-between">
                  <span>Entered Bills ({bills?.length || 0}):</span>
                  <span className="font-mono font-bold text-slate-700">
                    {formatCurrency(allocation.monthlyBillsUSD, currency)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Living Allocation:</span>
                  <span className="font-mono font-bold text-sky-700">
                    {formatCurrency(allocation.monthlyLivingAllocationUSD, currency)}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSaveLiving} className="space-y-1.5 pt-0.5">
              <label className="text-[10px] font-bold text-sky-700 block">
                Edit Living Allocation:
              </label>
              <div className="flex items-center gap-1">
                <div className="relative flex-1">
                  <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] font-bold text-slate-400">
                    {currency === 'INR' ? '₹' : '$'}
                  </span>
                  <input
                    type="text"
                    inputMode="decimal"
                    autoFocus
                    data-testid="living-input"
                    value={livingInput}
                    onChange={(e) => setLivingInput(cleanNumericInputString(e.target.value))}
                    onFocus={(e) => {
                      if (e.target.value === '0') e.target.select();
                    }}
                    className="w-full h-8 pl-6 pr-2 rounded-lg bg-white border-2 border-sky-500 text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                    placeholder="0"
                  />
                </div>
                <button
                  type="submit"
                  data-testid="save-living-btn"
                  className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center hover:bg-sky-700 transition-colors cursor-pointer shrink-0"
                  title="Save"
                >
                  <Check className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditingLiving(false)}
                  className="w-8 h-8 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center hover:bg-slate-300 transition-colors cursor-pointer shrink-0"
                  title="Cancel"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <span className="text-[10px] font-mono font-bold text-sky-700 block px-0.5">
                {formatExactAmountText(parseFloat(livingInput) || 0, currency)}
              </span>
            </form>
          )}

          <span className="text-[10px] font-semibold text-sky-700 block pt-1 border-t border-[#f0eae1]">
            {expPct.toFixed(1)}% of income
          </span>
        </div>
      </div>

      {isStudioOpen && (
        <MonthlyInflowAllocationModal
          isOpen={isStudioOpen}
          onClose={() => setIsStudioOpen(false)}
          initialTab={studioTab}
        />
      )}
    </motion.div>
  );
};
