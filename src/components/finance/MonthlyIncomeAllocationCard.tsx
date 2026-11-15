import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, CURRENCY_CONFIGS } from '@/utils/formatters';
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
    getIncomeAllocation,
    currency,
  } = useFinanceStore();

  const rate = CURRENCY_CONFIGS[currency]?.rateFromUSD || 84.5;
  const isINR = currency === 'INR';

  const [isEditing, setIsEditing] = useState(false);
  const [incomeInput, setIncomeInput] = useState<string>(() =>
    Math.round(monthlyNetIncome * (isINR ? rate : 1)).toString()
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
    if (!isNaN(parsed) && parsed > 0) {
      const usdValue = isINR ? parsed / rate : parsed;
      setMonthlyNetIncome(usdValue);
      setIsEditing(false);
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
                onClick={() => {
                  setIncomeInput(Math.round(displayIncome).toString());
                  setIsEditing(true);
                }}
                className="p-1.5 rounded-xl hover:bg-[#e8e0d1]/60 text-slate-600 transition-colors cursor-pointer"
                title="Edit Monthly Income"
              >
                <Edit3 className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <form onSubmit={handleSaveIncome} className="flex items-center gap-1.5">
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-400">
                  {currency === 'INR' ? '₹' : '$'}
                </span>
                <input
                  type="number"
                  required
                  min="100"
                  step="500"
                  autoFocus
                  value={incomeInput}
                  onChange={(e) => setIncomeInput(e.target.value)}
                  className="w-36 sm:w-44 h-10 pl-7 pr-3 rounded-xl bg-white border-2 border-[#9e783e] text-xs font-mono font-bold text-slate-900 focus:outline-hidden"
                  placeholder="Monthly Inflow"
                />
              </div>
              <button
                type="submit"
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
            </form>
          )}
        </div>
      </div>

      {/* Prominent Shortfall vs Surplus Notification Banner */}
      <AnimatePresence mode="wait">
        {allocation.isShortfall ? (
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
            className="p-4 sm:p-5 rounded-2xl bg-emerald-50 border border-emerald-300 text-emerald-950 space-y-2"
          >
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-sm sm:text-base font-extrabold text-emerald-900 flex items-center gap-2">
                    <span>✨ Investable Surplus Buffer:</span>
                    <span className="font-mono text-emerald-700 bg-emerald-200/80 px-2 py-0.5 rounded-lg">
                      +{formatCurrency(allocation.surplusAmountUSD, currency)} / month
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-800 font-medium mt-0.5">
                    Your commitments consume <strong>{allocation.allocationPercent.toFixed(1)}%</strong> of your income. You are safely within your budget!
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="text-[10px] uppercase font-bold text-emerald-600 block">Surplus Cashflow Share</span>
                <span className="text-sm font-extrabold font-mono text-emerald-800">
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

        {/* Living Expenses */}
        <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1">
          <div className="flex items-center justify-between text-slate-500 text-xs">
            <span className="font-semibold text-[11px]">Living & Bills</span>
            <Home className="w-4 h-4 text-sky-600" />
          </div>
          <div className="text-base sm:text-lg font-extrabold font-mono text-slate-900">
            {formatCurrency(allocation.livingExpensesMonthlyUSD, currency)}
          </div>
          <span className="text-[10px] font-semibold text-sky-700 block">
            {expPct.toFixed(1)}% of income
          </span>
        </div>
      </div>
    </motion.div>
  );
};
