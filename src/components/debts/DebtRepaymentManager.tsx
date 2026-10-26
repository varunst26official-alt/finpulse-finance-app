import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { DebtCategory, DebtItem } from '@/types/finance';
import {
  formatCurrency,
  CURRENCY_CONFIGS,
  DEBT_CATEGORY_LABELS,
  DEBT_CATEGORY_COLORS,
} from '@/utils/formatters';
import {
  Landmark,
  Plus,
  Trash2,
  Calendar,
  Sparkles,
  TrendingDown,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Zap,
  Snowflake,
  History,
  X,
  Percent,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

type PayoffStrategy = 'AVALANCHE' | 'SNOWBALL';

export const DebtRepaymentManager: React.FC = () => {
  const { debts, currency, addDebt, deleteDebt, recordDebtRepayment } = useFinanceStore();
  const currentRate = CURRENCY_CONFIGS[currency].rateFromUSD;

  // Modals & UI States
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [repayModalDebt, setRepayModalDebt] = useState<DebtItem | null>(null);
  const [historyModalDebt, setHistoryModalDebt] = useState<DebtItem | null>(null);
  const [selectedStrategy, setSelectedStrategy] = useState<PayoffStrategy>('AVALANCHE');
  const [extraPaymentMonthly, setExtraPaymentMonthly] = useState<number>(0);

  // Add Debt Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<DebtCategory>('HOME_LOAN');
  const [newLender, setNewLender] = useState('');
  const [newPrincipal, setNewPrincipal] = useState<number>(1000000);
  const [newOutstanding, setNewOutstanding] = useState<number>(850000);
  const [newInterestRate, setNewInterestRate] = useState<number>(8.5);
  const [newMonthlyEmi, setNewMonthlyEmi] = useState<number>(15000);
  const [newDueDay, setNewDueDay] = useState<number>(5);
  const [newTenureMonths, setNewTenureMonths] = useState<number>(120);
  const [newNotes, setNewNotes] = useState('');

  // Repayment Form State
  const [repayAmount, setRepayAmount] = useState<number>(15000);
  const [repayType, setRepayType] = useState<'REGULAR_EMI' | 'LUMP_SUM_PREPAYMENT'>('REGULAR_EMI');
  const [repayDate, setRepayDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [repayNotes, setRepayNotes] = useState('');

  // Aggregated KPIs
  const kpiData = useMemo(() => {
    let totalDebtUSD = 0;
    let totalOriginalUSD = 0;
    let totalMonthlyEmiUSD = 0;
    let weightedInterestSum = 0;

    debts.forEach((debt) => {
      totalDebtUSD += debt.currentOutstanding;
      totalOriginalUSD += debt.originalPrincipal;
      totalMonthlyEmiUSD += debt.monthlyEmi;
      weightedInterestSum += debt.interestRate * debt.currentOutstanding;
    });

    const blendedInterestRate = totalDebtUSD > 0 ? weightedInterestSum / totalDebtUSD : 0;
    const paidOffPercentage =
      totalOriginalUSD > 0 ? Math.max(0, ((totalOriginalUSD - totalDebtUSD) / totalOriginalUSD) * 100) : 0;

    // Estimate debt-free years based on principal & monthly EMI
    const avgMonthlyRate = blendedInterestRate / 100 / 12;
    let estimatedMonthsToFreedom = 0;
    if (totalMonthlyEmiUSD > 0 && totalDebtUSD > 0) {
      if (avgMonthlyRate > 0) {
        // N = -ln(1 - (P * r) / EMI) / ln(1 + r)
        const factor = (totalDebtUSD * avgMonthlyRate) / totalMonthlyEmiUSD;
        if (factor < 1) {
          estimatedMonthsToFreedom = Math.ceil(-Math.log(1 - factor) / Math.log(1 + avgMonthlyRate));
        } else {
          estimatedMonthsToFreedom = Math.ceil(totalDebtUSD / totalMonthlyEmiUSD);
        }
      } else {
        estimatedMonthsToFreedom = Math.ceil(totalDebtUSD / totalMonthlyEmiUSD);
      }
    }

    const estimatedFreedomDate = new Date();
    estimatedFreedomDate.setMonth(estimatedFreedomDate.getMonth() + estimatedMonthsToFreedom);

    return {
      totalDebtUSD,
      totalOriginalUSD,
      totalMonthlyEmiUSD,
      blendedInterestRate,
      paidOffPercentage,
      estimatedMonthsToFreedom,
      estimatedFreedomDateString:
        totalDebtUSD > 0
          ? estimatedFreedomDate.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
          : 'Debt Free Today!',
    };
  }, [debts]);

  // Strategy Ordering: Avalanche (Highest APR first) vs Snowball (Lowest balance first)
  const prioritizedDebts = useMemo(() => {
    const list = [...debts];
    if (selectedStrategy === 'AVALANCHE') {
      return list.sort((a, b) => b.interestRate - a.interestRate);
    } else {
      return list.sort((a, b) => a.currentOutstanding - b.currentOutstanding);
    }
  }, [debts, selectedStrategy]);

  // Prepayment Simulator Calculations
  const simulationResults = useMemo(() => {
    if (kpiData.totalDebtUSD === 0 || kpiData.totalMonthlyEmiUSD === 0) {
      return { interestSavedUSD: 0, monthsSaved: 0, newMonths: 0 };
    }

    const extraUSD = currency === 'INR' ? extraPaymentMonthly / currentRate : extraPaymentMonthly;
    const effectiveEmi = kpiData.totalMonthlyEmiUSD + extraUSD;
    const monthlyRate = kpiData.blendedInterestRate / 100 / 12;

    let newMonths = kpiData.estimatedMonthsToFreedom;
    if (effectiveEmi > 0 && monthlyRate > 0) {
      const factor = (kpiData.totalDebtUSD * monthlyRate) / effectiveEmi;
      if (factor < 1) {
        newMonths = Math.ceil(-Math.log(1 - factor) / Math.log(1 + monthlyRate));
      }
    }

    const monthsSaved = Math.max(0, kpiData.estimatedMonthsToFreedom - newMonths);
    const regularTotalInterest = kpiData.totalMonthlyEmiUSD * kpiData.estimatedMonthsToFreedom - kpiData.totalDebtUSD;
    const simulatedTotalInterest = effectiveEmi * newMonths - kpiData.totalDebtUSD;
    const interestSavedUSD = Math.max(0, regularTotalInterest - simulatedTotalInterest);

    return {
      interestSavedUSD,
      monthsSaved,
      newMonths,
    };
  }, [kpiData, extraPaymentMonthly, currency, currentRate]);

  // Handlers
  const handleOpenAddModal = () => {
    if (currency === 'INR') {
      setNewPrincipal(1000000);
      setNewOutstanding(850000);
      setNewMonthlyEmi(15000);
    } else {
      setNewPrincipal(15000);
      setNewOutstanding(12000);
      setNewMonthlyEmi(250);
    }
    setIsAddModalOpen(true);
  };

  const handleCreateDebt = (e: React.FormEvent) => {
    e.preventDefault();
    const principalUSD = currency === 'INR' ? newPrincipal / currentRate : newPrincipal;
    const outstandingUSD = currency === 'INR' ? newOutstanding / currentRate : newOutstanding;
    const emiUSD = currency === 'INR' ? newMonthlyEmi / currentRate : newMonthlyEmi;

    addDebt({
      title: newTitle || 'Personal Liability',
      category: newCategory,
      lender: newLender || 'Financial Institution',
      originalPrincipal: principalUSD,
      currentOutstanding: outstandingUSD,
      interestRate: newInterestRate || 8.5,
      monthlyEmi: emiUSD,
      emiDueDay: newDueDay,
      startDate: new Date().toISOString().split('T')[0],
      tenureMonths: newTenureMonths,
      notes: newNotes,
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewLender('');
    setNewNotes('');
  };

  const handleOpenRepayModal = (debt: DebtItem) => {
    setRepayModalDebt(debt);
    const defaultAmt = currency === 'INR' ? Math.round(debt.monthlyEmi * currentRate) : Math.round(debt.monthlyEmi);
    setRepayAmount(defaultAmt);
    setRepayNotes('');
  };

  const handleRecordRepayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repayModalDebt) return;

    const amountUSD = currency === 'INR' ? repayAmount / currentRate : repayAmount;
    recordDebtRepayment(repayModalDebt.id, amountUSD, repayType, repayDate, repayNotes);

    setRepayModalDebt(null);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2.5 rounded-2xl bg-[#9e783e]/15 text-[#9e783e]">
              <Landmark className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Debt & Repayment Engine
              </h2>
              <span className="text-xs font-semibold text-[#866632] bg-[#f4efe4] px-2.5 py-0.5 rounded-md border border-[#ded3bf]">
                Liability Management & Payoff Acceleration
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 max-w-2xl font-medium leading-relaxed">
            Track mortgages, auto loans, and credit card dues. Leverage mathematical Avalanche and psychological
            Snowball payoff strategies to become completely debt-free years ahead of schedule.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleOpenAddModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] shadow-md shadow-[#9e783e]/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Loan / Debt</span>
          </motion.button>
        </div>
      </div>

      {/* Top 4 Metric KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Outstanding Debt */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-rose-200 bg-gradient-to-b from-rose-50/40 via-white to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-rose-800 uppercase text-[11px] tracking-wider">
              Total Outstanding Debt
            </span>
            <div className="p-2 rounded-xl bg-rose-100 text-rose-700">
              <TrendingDown className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-rose-950">
            {formatCurrency(kpiData.totalDebtUSD, currency)}
          </div>
          <div className="mt-2.5">
            <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
              <span>Principal Paid Off</span>
              <span>{kpiData.paidOffPercentage.toFixed(1)}%</span>
            </div>
            <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
              <div
                className="h-full bg-emerald-600 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(100, kpiData.paidOffPercentage)}%` }}
              />
            </div>
          </div>
        </motion.div>

        {/* Monthly EMI Commitment */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">
              Monthly Debt Service (EMI)
            </span>
            <div className="p-2 rounded-xl bg-[#faf7f0] text-[#9e783e]">
              <Calendar className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {formatCurrency(kpiData.totalMonthlyEmiUSD, currency)}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1.5 block">
            Across {debts.length} active loan accounts
          </span>
        </motion.div>

        {/* Blended Weighted APR */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">
              Blended Interest Rate
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Percent className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {kpiData.blendedInterestRate.toFixed(2)}%
            <span className="text-xs font-normal text-slate-500 ml-1">p.a.</span>
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1.5 block">
            Weighted annual cost of borrowing
          </span>
        </motion.div>

        {/* Debt-Free Freedom Date */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 via-white to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-emerald-800 uppercase text-[11px] tracking-wider">
              Projected Debt Freedom
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-800">
              <CheckCircle2 className="h-4 w-4" />
            </div>
          </div>
          <div className="text-xl sm:text-2xl font-extrabold font-mono text-emerald-950 truncate">
            {kpiData.estimatedFreedomDateString}
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-1.5 block">
            {kpiData.totalDebtUSD > 0
              ? `~${Math.ceil(kpiData.estimatedMonthsToFreedom / 12)} years remaining at current pace`
              : 'Zero active debt balances'}
          </span>
        </motion.div>
      </div>

      {/* Payoff Strategy Engine: Avalanche vs Snowball & Prepayment Accelerator */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Strategy Optimizer & Priorities (7 cols) */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="lg:col-span-7 rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs space-y-5"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-[#e8e0d1]">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-[#9e783e]" />
                Payoff Acceleration Strategy
              </h3>
              <p className="text-xs text-slate-600 mt-0.5">
                Compare debt payoff ladders to eliminate interest or gain quick psychological momentum
              </p>
            </div>

            {/* Strategy Switcher */}
            <div className="flex items-center rounded-xl bg-[#faf8f5] p-1 border border-[#e8e0d1]">
              <button
                onClick={() => setSelectedStrategy('AVALANCHE')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStrategy === 'AVALANCHE'
                    ? 'bg-[#9e783e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Zap className="h-3.5 w-3.5" />
                <span>Avalanche (Highest APR)</span>
              </button>
              <button
                onClick={() => setSelectedStrategy('SNOWBALL')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  selectedStrategy === 'SNOWBALL'
                    ? 'bg-[#9e783e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Snowflake className="h-3.5 w-3.5" />
                <span>Snowball (Lowest Balance)</span>
              </button>
            </div>
          </div>

          {/* Strategy Explainer Box */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs space-y-1">
            <span className="font-extrabold text-[#866632]">
              {selectedStrategy === 'AVALANCHE'
                ? '⚡ Debt Avalanche Mode (Mathematically Optimal)'
                : '❄️ Debt Snowball Mode (Behavioral & Quick Wins)'}
            </span>
            <p className="text-slate-600 leading-relaxed font-medium">
              {selectedStrategy === 'AVALANCHE'
                ? 'Focuses all extra repayments on your highest interest rate debt first. Saves the absolute maximum amount of interest and accelerates your mathematical net worth growth.'
                : 'Focuses all extra repayments on your smallest remaining balance first. Gives you immediate psychological satisfaction and eliminates entire monthly payments fast to free up cash flow.'}
            </p>
          </div>

          {/* Prioritized Payoff Ladder */}
          <div className="space-y-3">
            <div className="text-xs font-bold text-slate-500 uppercase tracking-wider">
              Recommended Payoff Order:
            </div>

            {prioritizedDebts.length === 0 ? (
              <div className="p-8 text-center bg-[#faf8f5]/60 rounded-2xl border border-dashed border-[#e8e0d1]">
                <ShieldCheck className="h-8 w-8 text-emerald-600 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-900">Zero Outstanding Debt</p>
                <p className="text-xs text-slate-500 mt-1">
                  You are completely debt free. Any loans added will appear in this prioritized payoff ladder.
                </p>
              </div>
            ) : (
              prioritizedDebts.map((debt, index) => {
                const colorConfig = DEBT_CATEGORY_COLORS[debt.category];
                return (
                  <div
                    key={debt.id}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-[#e8e0d1] bg-white hover:border-[#9e783e] transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-7 w-7 items-center justify-center rounded-xl bg-[#f4efe4] text-[#866632] font-mono font-extrabold text-xs">
                        #{index + 1}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900 text-xs sm:text-sm">{debt.title}</span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorConfig.badge} ${colorConfig.border}`}
                          >
                            {DEBT_CATEGORY_LABELS[debt.category]}
                          </span>
                        </div>
                        <span className="text-[11px] text-slate-500 font-medium">
                          {debt.lender} • Due on the {debt.emiDueDay}th
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 text-right">
                      <div>
                        <div className="font-bold font-mono text-slate-900 text-xs">
                          {formatCurrency(debt.currentOutstanding, currency)}
                        </div>
                        <div className="text-[11px] font-bold text-rose-700">
                          {debt.interestRate}% APR
                        </div>
                      </div>
                      <button
                        onClick={() => handleOpenRepayModal(debt)}
                        className="px-3 py-1.5 rounded-xl bg-[#faf8f5] hover:bg-[#f4efe4] border border-[#e8e0d1] text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                      >
                        Repay
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </motion.div>

        {/* Right Column: Prepayment Freedom Simulator (5 cols) */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="lg:col-span-5 rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs flex flex-col justify-between space-y-5"
        >
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Clock className="h-5 w-5 text-[#9e783e]" />
              <h3 className="text-base font-extrabold text-slate-900">Prepayment Simulator</h3>
            </div>
            <p className="text-xs text-slate-600">
              See what happens if you contribute extra monthly cash towards your loans
            </p>
          </div>

          {/* Extra Payment Slider */}
          <div className="space-y-3 p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-700">Extra Monthly Payment:</span>
              <span className="font-extrabold font-mono text-emerald-800 text-sm">
                +{formatCurrency(currency === 'INR' ? extraPaymentMonthly / currentRate : extraPaymentMonthly, currency)}
              </span>
            </div>

            <input
              type="range"
              min="0"
              max={currency === 'INR' ? 50000 : 600}
              step={currency === 'INR' ? 1000 : 25}
              value={extraPaymentMonthly}
              onChange={(e) => setExtraPaymentMonthly(Number(e.target.value))}
              className="w-full accent-[#9e783e] cursor-pointer"
            />

            <div className="flex justify-between text-[10px] text-slate-400 font-bold">
              <span>₹0 / $0</span>
              <span>{currency === 'INR' ? '₹25,000' : '$300'}</span>
              <span>{currency === 'INR' ? '₹50,000' : '$600'}</span>
            </div>
          </div>

          {/* Live Impact Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-br from-[#faf7f0] to-[#f4efe4] border border-[#ded3bf] space-y-3">
            <div className="text-[11px] font-bold text-[#866632] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-[#9e783e]" />
              Accelerated Payoff Benefit
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="bg-white/80 p-3 rounded-xl border border-[#ded3bf]">
                <span className="text-slate-500 text-[11px] font-semibold block">Interest Saved</span>
                <span className="text-sm sm:text-base font-extrabold font-mono text-emerald-700">
                  {formatCurrency(simulationResults.interestSavedUSD, currency)}
                </span>
              </div>
              <div className="bg-white/80 p-3 rounded-xl border border-[#ded3bf]">
                <span className="text-slate-500 text-[11px] font-semibold block">Time Saved</span>
                <span className="text-sm sm:text-base font-extrabold font-mono text-slate-900">
                  {simulationResults.monthsSaved > 0
                    ? `${Math.floor(simulationResults.monthsSaved / 12)}y ${simulationResults.monthsSaved % 12}m`
                    : '0 months'}
                </span>
              </div>
            </div>

            <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
              Applying just{' '}
              <strong className="text-slate-900 font-bold">
                {formatCurrency(currency === 'INR' ? extraPaymentMonthly / currentRate : extraPaymentMonthly, currency)}
              </strong>{' '}
              extra every month shaves off{' '}
              <strong className="text-emerald-800 font-bold">
                {simulationResults.monthsSaved} months
              </strong>{' '}
              of debt payments!
            </p>
          </div>

          <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
            <ShieldCheck className="h-4 w-4 text-[#9e783e] shrink-0" />
            <span>Prepayments apply directly to the principal balance.</span>
          </div>
        </motion.div>
      </div>

      {/* Active Debts & Loans Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Active Loans & Liabilities
            </h3>
            <p className="text-xs text-slate-600">
              Detailed tracking of principal, outstanding balance, interest, and payment history
            </p>
          </div>
          <span className="text-xs font-bold text-slate-500">
            {debts.length} Accounts Registered
          </span>
        </div>

        {debts.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#e8e0d1] shadow-xs">
            <div className="p-4 rounded-2xl bg-emerald-50 text-emerald-700 w-fit mx-auto mb-3 border border-emerald-200">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">You Are 100% Debt Free!</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 font-medium leading-relaxed">
              You have no active loans, mortgages, or credit card dues recorded. If you take on a mortgage, vehicle
              loan, or education loan in the future, you can track it here.
            </p>
            <button
              onClick={handleOpenAddModal}
              className="px-4 py-2 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-all cursor-pointer shadow-xs"
            >
              + Add Loan / Debt Record
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {debts.map((debt) => {
              const colorConfig = DEBT_CATEGORY_COLORS[debt.category];
              const paidAmount = Math.max(0, debt.originalPrincipal - debt.currentOutstanding);
              const paidPercent =
                debt.originalPrincipal > 0 ? (paidAmount / debt.originalPrincipal) * 100 : 0;

              return (
                <motion.div
                  key={debt.id}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="rounded-3xl border border-[#e8e0d1] bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  {/* Card Header */}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorConfig.badge} ${colorConfig.border}`}
                      >
                        {DEBT_CATEGORY_LABELS[debt.category]}
                      </span>
                      <button
                        onClick={() => {
                          if (window.confirm(`Delete ${debt.title} from your records?`)) {
                            deleteDebt(debt.id);
                          }
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete debt"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{debt.title}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold">{debt.lender}</p>
                  </div>

                  {/* Balance & Progress */}
                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Outstanding</span>
                      <span className="text-base font-extrabold font-mono text-rose-900">
                        {formatCurrency(debt.currentOutstanding, currency)}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    <div>
                      <div className="flex justify-between text-[10px] text-slate-600 font-semibold mb-1">
                        <span>Original: {formatCurrency(debt.originalPrincipal, currency)}</span>
                        <span>{paidPercent.toFixed(0)}% Paid</span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-slate-200 overflow-hidden">
                        <div
                          className="h-full bg-[#9e783e] rounded-full"
                          style={{ width: `${Math.min(100, paidPercent)}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Loan Parameters Details */}
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-xl bg-white border border-[#e8e0d1]">
                      <span className="text-slate-500 block text-[10px] font-semibold">Interest Rate</span>
                      <span className="font-extrabold font-mono text-slate-900">{debt.interestRate}% p.a.</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-white border border-[#e8e0d1]">
                      <span className="text-slate-500 block text-[10px] font-semibold">Monthly EMI</span>
                      <span className="font-extrabold font-mono text-slate-900">
                        {formatCurrency(debt.monthlyEmi, currency)}
                      </span>
                    </div>
                  </div>

                  {/* Due Day Badge */}
                  <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold pt-1">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-[#9e783e]" />
                      EMI Due: {debt.emiDueDay}th of month
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {debt.repayments.length} Payments
                    </span>
                  </div>

                  {/* Card Action Buttons */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#f2ece1]">
                    <button
                      onClick={() => handleOpenRepayModal(debt)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-colors cursor-pointer shadow-xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Record Payment</span>
                    </button>
                    <button
                      onClick={() => setHistoryModalDebt(debt)}
                      className="flex items-center justify-center py-2 px-3 rounded-xl border border-[#e8e0d1] bg-white text-xs font-bold text-slate-700 hover:text-slate-900 hover:bg-[#faf8f5] transition-colors cursor-pointer"
                      title="View repayment ledger"
                    >
                      <History className="h-3.5 w-3.5 text-[#9e783e]" />
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* MODAL 1: ADD DEBT / LOAN                                       */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-[#e8e0d1] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e0d1]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#9e783e]/15 text-[#9e783e]">
                    <Landmark className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Add New Loan or Liability</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Enter loan details to track outstanding balance and payoff schedule
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDebt} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Loan / Debt Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC Home Loan, Car EMI"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as DebtCategory)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="HOME_LOAN">Home Loan / Mortgage</option>
                      <option value="AUTO_LOAN">Car & Auto Loan</option>
                      <option value="PERSONAL_LOAN">Personal Loan</option>
                      <option value="EDUCATION_LOAN">Education Loan</option>
                      <option value="CREDIT_CARD">Credit Card Outstanding</option>
                      <option value="BUSINESS_LOAN">Business & Commercial</option>
                      <option value="PEER_OR_FAMILY">Family & Peer Borrowing</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Lender / Institution Name</label>
                    <input
                      type="text"
                      placeholder="e.g. HDFC Bank, SBI, ICICI"
                      value={newLender}
                      onChange={(e) => setNewLender(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">
                      Original Borrowed Amount ({currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newPrincipal}
                      onChange={(e) => setNewPrincipal(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">
                      Current Outstanding ({currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newOutstanding}
                      onChange={(e) => setNewOutstanding(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Interest Rate (% p.a.) *</label>
                    <input
                      type="number"
                      step="0.05"
                      required
                      min="0"
                      max="100"
                      value={newInterestRate}
                      onChange={(e) => setNewInterestRate(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Monthly EMI ({currency}) *</label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newMonthlyEmi}
                      onChange={(e) => setNewMonthlyEmi(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Monthly Due Day (1 - 31)</label>
                    <input
                      type="number"
                      min="1"
                      max="31"
                      value={newDueDay}
                      onChange={(e) => setNewDueDay(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Total Tenure (in Months)</label>
                    <input
                      type="number"
                      min="1"
                      value={newTenureMonths}
                      onChange={(e) => setNewTenureMonths(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Notes / Prepayment Terms</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Fixed rate for 2 years, zero prepayment penalty"
                    value={newNotes}
                    onChange={(e) => setNewNotes(e.target.value)}
                    className="w-full p-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8e0d1]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#e8e0d1] text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] shadow-md shadow-[#9e783e]/20 cursor-pointer"
                  >
                    Save Loan Record
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: RECORD PAYMENT / PREPAYMENT                           */}
      {/* ============================================================== */}
      <AnimatePresence>
        {repayModalDebt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-3xl bg-white border border-[#e8e0d1] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e0d1]">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Record Debt Repayment</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {repayModalDebt.title} ({repayModalDebt.lender})
                  </p>
                </div>
                <button
                  onClick={() => setRepayModalDebt(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleRecordRepayment} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-600">Repayment Type</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setRepayType('REGULAR_EMI')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        repayType === 'REGULAR_EMI'
                          ? 'bg-[#9e783e] text-white border-[#9e783e] shadow-xs'
                          : 'bg-[#faf8f5] border-[#e8e0d1] text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Regular EMI
                    </button>
                    <button
                      type="button"
                      onClick={() => setRepayType('LUMP_SUM_PREPAYMENT')}
                      className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                        repayType === 'LUMP_SUM_PREPAYMENT'
                          ? 'bg-emerald-700 text-white border-emerald-700 shadow-xs'
                          : 'bg-[#faf8f5] border-[#e8e0d1] text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Principal Prepayment
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Payment Amount ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={repayAmount}
                    onChange={(e) => setRepayAmount(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Current balance: {formatCurrency(repayModalDebt.currentOutstanding, currency)}
                  </span>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Payment Date *</label>
                  <input
                    type="date"
                    required
                    value={repayDate}
                    onChange={(e) => setRepayDate(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Notes (Optional)</label>
                  <input
                    type="text"
                    placeholder="e.g. October monthly installment, Diwali bonus"
                    value={repayNotes}
                    onChange={(e) => setRepayNotes(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8e0d1]">
                  <button
                    type="button"
                    onClick={() => setRepayModalDebt(null)}
                    className="px-4 py-2 rounded-xl border border-[#e8e0d1] text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] shadow-md shadow-[#9e783e]/20 cursor-pointer"
                  >
                    Record Payment
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 3: REPAYMENT HISTORY LEDGER                              */}
      {/* ============================================================== */}
      <AnimatePresence>
        {historyModalDebt && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-[#e8e0d1] p-6 shadow-2xl space-y-4 max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e0d1]">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Repayment Ledger</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    {historyModalDebt.title} • {historyModalDebt.repayments.length} Payments Recorded
                  </p>
                </div>
                <button
                  onClick={() => setHistoryModalDebt(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {historyModalDebt.repayments.length === 0 ? (
                <div className="p-8 text-center bg-[#faf8f5] rounded-2xl border border-dashed border-[#e8e0d1]">
                  <p className="text-xs text-slate-500 font-medium">No repayments recorded for this debt yet.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="border-b border-[#e8e0d1] text-slate-500 uppercase text-[10px] font-bold tracking-wider">
                      <tr>
                        <th className="pb-2 pt-1">Date</th>
                        <th className="pb-2 pt-1">Type</th>
                        <th className="pb-2 pt-1">Notes</th>
                        <th className="pb-2 pt-1 text-right">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#f2ece1] text-slate-700">
                      {historyModalDebt.repayments.map((rep) => (
                        <tr key={rep.id} className="hover:bg-[#faf8f5]">
                          <td className="py-2.5 font-mono text-slate-600">{rep.date}</td>
                          <td className="py-2.5">
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                                rep.type === 'LUMP_SUM_PREPAYMENT'
                                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {rep.type === 'LUMP_SUM_PREPAYMENT' ? 'Prepayment' : 'Monthly EMI'}
                            </span>
                          </td>
                          <td className="py-2.5 text-slate-500 max-w-[140px] truncate">
                            {rep.notes || '—'}
                          </td>
                          <td className="py-2.5 text-right font-extrabold font-mono text-emerald-800">
                            {formatCurrency(rep.amount, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex justify-end pt-2 border-t border-[#e8e0d1]">
                <button
                  onClick={() => setHistoryModalDebt(null)}
                  className="px-4 py-2 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs font-bold text-slate-700 hover:text-slate-900 cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
