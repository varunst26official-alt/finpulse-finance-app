import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { CURRENCY_CONFIGS } from '@/utils/formatters';
import {
  Flame,
  TrendingUp,
  Calendar,
  Sparkles,
  Sliders,
  CheckCircle2,
  RefreshCw,
  Award,
  Zap,
} from 'lucide-react';
import { motion } from 'framer-motion';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ReferenceLine,
  CartesianGrid,
} from 'recharts';

export const FireCalculatorWidget: React.FC = () => {
  const {
    assets,
    expenses,
    incomes,
    currency,
  } = useFinanceStore();

  const rate = CURRENCY_CONFIGS[currency]?.rateFromUSD || 84.5;
  const isINR = currency === 'INR';

  // 1. Calculate Real Portfolio Net Worth from Ledger
  const ledgerTotalInvested = useMemo(() => {
    return assets.reduce((sum, a) => sum + (a.currentMarketPrice * a.quantity), 0) * (isINR ? rate : 1);
  }, [assets, isINR, rate]);

  // 2. Calculate Actual Monthly Expenses from Ledger
  const ledgerMonthlyExpenses = useMemo(() => {
    if (!expenses || expenses.length === 0) return isINR ? 50000 : 2500;
    const totalExp = expenses.reduce((sum, e) => sum + e.amount, 0) * (isINR ? rate : 1);
    return Math.max(isINR ? 25000 : 1500, Math.round(totalExp / Math.max(1, Math.min(6, expenses.length / 5))));
  }, [expenses, isINR, rate]);

  // 3. Calculate Actual Monthly Inflow Surplus from Ledger
  const ledgerMonthlySurplus = useMemo(() => {
    const monthlyIncome = incomes.reduce((sum, i) => sum + (i.frequency === 'MONTHLY' ? i.amount : i.amount / 12), 0) * (isINR ? rate : 1);
    const surplus = monthlyIncome - ledgerMonthlyExpenses;
    return Math.max(isINR ? 15000 : 800, Math.round(surplus > 0 ? surplus : (isINR ? 35000 : 1500)));
  }, [incomes, ledgerMonthlyExpenses, isINR, rate]);

  // Form & Simulator State
  const [currentAge, setCurrentAge] = useState<number>(29);

  const [monthlyExpenses, setMonthlyExpenses] = useState<number>(() => {
    return ledgerMonthlyExpenses > 0 ? ledgerMonthlyExpenses : (isINR ? 50000 : 2500);
  });

  const [currentCorpus, setCurrentCorpus] = useState<number>(() => {
    return ledgerTotalInvested > 0 ? Math.round(ledgerTotalInvested) : (isINR ? 1500000 : 50000);
  });

  const [monthlyInvestment, setMonthlyInvestment] = useState<number>(() => {
    return ledgerMonthlySurplus > 0 ? ledgerMonthlySurplus : (isINR ? 35000 : 1500);
  });

  const [annualStepUpPercent, setAnnualStepUpPercent] = useState<number>(10); // 10% annual increase in investment capacity
  const [expectedReturnRate, setExpectedReturnRate] = useState<number>(12.0); // 12% CAGR equity
  const [inflationRate, setInflationRate] = useState<number>(6.0); // 6% annual inflation
  const [safeWithdrawalRate, setSafeWithdrawalRate] = useState<number>(4.0); // 4% SWR (25x)
  const [selectedFireType, setSelectedFireType] = useState<'LEAN' | 'STANDARD' | 'FAT'>('STANDARD');

  // Format local currency helper
  const formatVal = (val: number): string => {
    if (isINR) {
      if (val >= 10000000) return `₹${(val / 10000000).toFixed(2)} Cr`;
      if (val >= 100000) return `₹${(val / 100000).toFixed(1)} L`;
      return `₹${Math.round(val).toLocaleString('en-IN')}`;
    }
    if (val >= 1000000) return `$${(val / 1000000).toFixed(2)}M`;
    if (val >= 1000) return `$${(val / 1000).toFixed(0)}k`;
    return `$${Math.round(val).toLocaleString('en-US')}`;
  };

  // 1. FIRE Targets Computation
  const fireTargets = useMemo(() => {
    const annualExpenses = monthlyExpenses * 12;
    const swrDecimal = safeWithdrawalRate / 100;

    // Standard FIRE = Annual Expenses / SWR (e.g. 25x at 4%)
    const standardFire = Math.round(annualExpenses / swrDecimal);
    const leanFire = Math.round(standardFire * 0.75); // 75% expenses
    const fatFire = Math.round(standardFire * 1.5); // 150% expenses
    const baristaFire = Math.round(standardFire * 0.5); // 50% expenses

    // Coast FIRE: Corpus needed today that will grow to Standard FIRE with 0 further additions
    const yearsTo60 = Math.max(1, 60 - currentAge);
    const realReturnRate = Math.max(0.01, (expectedReturnRate - inflationRate) / 100);
    const coastFire = Math.round(standardFire / Math.pow(1 + realReturnRate, yearsTo60));

    const activeTarget =
      selectedFireType === 'LEAN'
        ? leanFire
        : selectedFireType === 'FAT'
        ? fatFire
        : standardFire;

    // Progress percentage
    const progressPercent = Math.min(100, Math.max(0, (currentCorpus / activeTarget) * 100));

    return {
      annualExpenses,
      leanFire,
      standardFire,
      fatFire,
      baristaFire,
      coastFire,
      activeTarget,
      progressPercent,
    };
  }, [
    monthlyExpenses,
    safeWithdrawalRate,
    currentAge,
    expectedReturnRate,
    inflationRate,
    selectedFireType,
    currentCorpus,
  ]);

  // 2. Year-by-Year Compounding Simulation with Annual Step-Up
  const simulation = useMemo(() => {
    const monthlyReturn = expectedReturnRate / 100 / 12;
    const monthlyInflation = inflationRate / 100 / 12;
    const currentYear = new Date().getFullYear();
    const maxYears = 35;

    let runningCorpus = currentCorpus;
    let runningInvested = currentCorpus;
    let currentMonthlyCap = monthlyInvestment;
    let fireMonthIndex = -1;

    const chartData: Array<{
      year: number;
      age: number;
      corpus: number;
      totalInvested: number;
      wealthGain: number;
      targetFire: number;
      monthlyCapacity: number;
      isFireAchieved: boolean;
    }> = [];

    // Initial Year 0
    chartData.push({
      year: currentYear,
      age: currentAge,
      corpus: Math.round(runningCorpus),
      totalInvested: Math.round(runningInvested),
      wealthGain: 0,
      targetFire: Math.round(fireTargets.activeTarget),
      monthlyCapacity: Math.round(currentMonthlyCap),
      isFireAchieved: runningCorpus >= fireTargets.activeTarget,
    });

    if (runningCorpus >= fireTargets.activeTarget && fireMonthIndex === -1) {
      fireMonthIndex = 0;
    }

    // Simulate month by month
    for (let yr = 1; yr <= maxYears; yr++) {
      for (let m = 1; m <= 12; m++) {
        const monthNum = (yr - 1) * 12 + m;
        runningInvested += currentMonthlyCap;
        runningCorpus = (runningCorpus + currentMonthlyCap) * (1 + monthlyReturn);

        // Inflation adjusted target at this point in time
        const inflatedTarget = fireTargets.activeTarget * Math.pow(1 + monthlyInflation, monthNum);

        if (runningCorpus >= inflatedTarget && fireMonthIndex === -1) {
          fireMonthIndex = monthNum;
        }
      }

      // Record year-end data point
      const yrInflatedTarget = fireTargets.activeTarget * Math.pow(1 + inflationRate / 100, yr);
      const isFire = runningCorpus >= yrInflatedTarget;

      chartData.push({
        year: currentYear + yr,
        age: currentAge + yr,
        corpus: Math.round(runningCorpus),
        totalInvested: Math.round(runningInvested),
        wealthGain: Math.max(0, Math.round(runningCorpus - runningInvested)),
        targetFire: Math.round(yrInflatedTarget),
        monthlyCapacity: Math.round(currentMonthlyCap),
        isFireAchieved: isFire,
      });

      // Annual step-up in monthly investment capacity
      currentMonthlyCap = currentMonthlyCap * (1 + annualStepUpPercent / 100);

      // Once FIRE achieved + 5 buffer years, stop charting to keep chart crisp
      if (fireMonthIndex !== -1 && (yr * 12) >= (fireMonthIndex + 60)) {
        break;
      }
    }

    // Compute exact Timeline string
    let yearsToFire = 0;
    let monthsToFire = 0;
    let projectedFireYear = currentYear;
    let projectedFireMonth = 'Jan';

    if (fireMonthIndex === 0) {
      yearsToFire = 0;
      monthsToFire = 0;
    } else if (fireMonthIndex > 0) {
      yearsToFire = Math.floor(fireMonthIndex / 12);
      monthsToFire = fireMonthIndex % 12;

      const dateObj = new Date();
      dateObj.setMonth(dateObj.getMonth() + fireMonthIndex);
      projectedFireYear = dateObj.getFullYear();
      projectedFireMonth = dateObj.toLocaleString('default', { month: 'short' });
    } else {
      yearsToFire = maxYears;
      monthsToFire = 0;
      projectedFireYear = currentYear + maxYears;
    }

    // Milestone roadmaps (Year 1, 3, 5, 10, Fire Year)
    const milestones = [
      { label: 'Coast FIRE', targetAmount: fireTargets.coastFire, icon: '🛡️' },
      { label: 'Barista (50%)', targetAmount: fireTargets.baristaFire, icon: '☕' },
      { label: 'Lean FIRE', targetAmount: fireTargets.leanFire, icon: '🌿' },
      { label: 'Standard FIRE', targetAmount: fireTargets.standardFire, icon: '🔥' },
      { label: 'Fat FIRE', targetAmount: fireTargets.fatFire, icon: '💎' },
    ].map((m) => {
      const isAchieved = currentCorpus >= m.targetAmount;
      const pct = Math.min(100, Math.max(0, (currentCorpus / m.targetAmount) * 100));
      return { ...m, isAchieved, pct };
    });

    return {
      chartData,
      fireMonthIndex,
      yearsToFire,
      monthsToFire,
      projectedFireYear,
      projectedFireMonth,
      fireAge: currentAge + yearsToFire,
      milestones,
      finalCorpus: chartData[chartData.length - 1]?.corpus || 0,
    };
  }, [
    currentCorpus,
    monthlyInvestment,
    annualStepUpPercent,
    expectedReturnRate,
    inflationRate,
    currentAge,
    fireTargets.activeTarget,
    fireTargets.coastFire,
    fireTargets.baristaFire,
    fireTargets.leanFire,
    fireTargets.standardFire,
    fireTargets.fatFire,
  ]);

  return (
    <div className="space-y-6">
      {/* 1. Header Card */}
      <div className="p-5 sm:p-6 rounded-3xl bg-linear-to-br from-amber-500/10 via-white to-emerald-500/10 border border-amber-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25 shrink-0">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 tracking-tight">
                FIRE Freedom & Wealth Independence Calculator
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-amber-800 bg-amber-100 px-2.5 py-0.5 rounded-full border border-amber-300">
                <Sparkles className="w-3 h-3" /> Step-Up Compounding Engine
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
              Calculate your exact Financial Independence Number, model your investment capacity with annual step-up hikes, and track your visual timeline to complete freedom.
            </p>
          </div>
        </div>

        {/* Sync with Ledger Button */}
        <button
          onClick={() => {
            setMonthlyExpenses(ledgerMonthlyExpenses);
            setCurrentCorpus(Math.round(ledgerTotalInvested));
            setMonthlyInvestment(ledgerMonthlySurplus);
          }}
          className="self-start md:self-auto px-3.5 py-2 rounded-xl bg-white hover:bg-slate-50 text-slate-700 text-xs font-bold border border-slate-200 shadow-2xs transition-all cursor-pointer flex items-center gap-1.5 shrink-0"
          title="Auto-fill numbers using your actual ledger portfolio & expense history"
        >
          <RefreshCw className="w-3.5 h-3.5 text-amber-600" />
          <span>Sync from Ledger Data</span>
        </button>
      </div>

      {/* 2. Top Metric Cards: Target, Current, and Timeline */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Target FIRE Number */}
        <div className="p-4 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Target FIRE Number</span>
            <span className="w-7 h-7 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center font-bold text-xs">
              {Math.round(100 / safeWithdrawalRate)}x
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {formatVal(fireTargets.activeTarget)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-medium text-slate-500">
            <span>SWR {safeWithdrawalRate}%</span>
            <span>•</span>
            <span>{formatVal(monthlyExpenses)}/mo</span>
          </div>
        </div>

        {/* Card 2: Current Invested Net Worth */}
        <div className="p-4 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Current Portfolio</span>
            <span className="w-7 h-7 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <TrendingUp className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-emerald-700">
            {formatVal(currentCorpus)}
          </div>
          <div className="flex items-center gap-1.5 mt-2 text-xs font-bold text-emerald-700">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>{fireTargets.progressPercent.toFixed(1)}% Freedom Achieved</span>
          </div>
        </div>

        {/* Card 3: Monthly Capacity with Step-Up */}
        <div className="p-4 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Monthly Investment</span>
            <span className="w-7 h-7 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold text-xs">
              +{annualStepUpPercent}%
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-indigo-700">
            {formatVal(monthlyInvestment)}
          </div>
          <div className="flex items-center gap-1 mt-2 text-xs text-slate-500 font-medium">
            <span>Annual Step-up: <strong>+{annualStepUpPercent}% / yr</strong></span>
          </div>
        </div>

        {/* Card 4: Exact Calculated Timeline */}
        <div className="p-4 rounded-3xl bg-linear-to-br from-emerald-600 to-teal-700 text-white shadow-md shadow-emerald-700/20">
          <div className="flex items-center justify-between text-emerald-100 mb-2">
            <span className="text-xs font-bold uppercase tracking-wider">Time to Full Freedom</span>
            <span className="w-7 h-7 rounded-lg bg-white/20 text-white flex items-center justify-center">
              <Calendar className="w-4 h-4" />
            </span>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            {simulation.yearsToFire === 0
              ? 'FIRE Reached!'
              : `${simulation.yearsToFire}y ${simulation.monthsToFire}m`}
          </div>
          <div className="mt-2 text-xs font-medium text-emerald-100 flex items-center gap-1">
            <span>Target Date: <strong>{simulation.projectedFireMonth} {simulation.projectedFireYear}</strong> (Age {simulation.fireAge})</span>
          </div>
        </div>
      </div>

      {/* 3. Multi-Stage Visual Freedom Progress Bar */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="font-heading font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              <span>Financial Freedom Progress & Milestones</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Live progression from Coast FIRE to Lean FIRE and complete wealth independence
            </p>
          </div>
          <div className="text-xs font-mono font-bold px-3 py-1 rounded-xl bg-amber-50 text-amber-800 border border-amber-200 self-start sm:self-auto">
            {fireTargets.progressPercent.toFixed(1)}% of {selectedFireType} FIRE
          </div>
        </div>

        {/* Progress Track */}
        <div className="relative pt-3 pb-1">
          <div className="w-full h-4 rounded-full bg-slate-100 overflow-hidden relative border border-slate-200">
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fireTargets.progressPercent}%` }}
              transition={{ duration: 1, ease: 'easeOut' }}
              className="h-full rounded-full bg-gradient-to-r from-amber-500 via-emerald-500 to-teal-500 shadow-sm"
            />
          </div>

          {/* Marker Labels */}
          <div className="grid grid-cols-5 text-[10px] sm:text-xs font-semibold text-slate-500 mt-2.5 gap-1 text-center">
            <div className="text-left">
              <span className="block text-slate-800 font-bold">0%</span>
              <span className="text-[10px] text-slate-400">Start</span>
            </div>
            <div>
              <span className="block text-slate-800 font-bold">Coast</span>
              <span className="text-[10px] text-slate-400">{formatVal(fireTargets.coastFire)}</span>
            </div>
            <div>
              <span className="block text-slate-800 font-bold">50% Barista</span>
              <span className="text-[10px] text-slate-400">{formatVal(fireTargets.baristaFire)}</span>
            </div>
            <div>
              <span className="block text-slate-800 font-bold">75% Lean</span>
              <span className="text-[10px] text-slate-400">{formatVal(fireTargets.leanFire)}</span>
            </div>
            <div className="text-right">
              <span className="block text-emerald-700 font-bold">100% Freedom</span>
              <span className="text-[10px] text-emerald-600">{formatVal(fireTargets.activeTarget)}</span>
            </div>
          </div>
        </div>

        {/* Milestone Badges Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 pt-2">
          {simulation.milestones.map((m, idx) => (
            <div
              key={idx}
              className={`p-2.5 rounded-2xl border transition-all text-center ${
                m.isAchieved
                  ? 'bg-emerald-50 border-emerald-200 text-emerald-900 shadow-2xs'
                  : 'bg-slate-50/70 border-slate-200 text-slate-600'
              }`}
            >
              <div className="text-base mb-0.5">{m.icon}</div>
              <div className="text-xs font-bold leading-tight">{m.label}</div>
              <div className="text-[11px] font-mono mt-0.5 text-slate-500">{formatVal(m.targetAmount)}</div>
              <div className="mt-1 text-[10px] font-extrabold uppercase">
                {m.isAchieved ? (
                  <span className="text-emerald-700">✓ Achieved</span>
                ) : (
                  <span className="text-slate-400">{m.pct.toFixed(0)}% Funded</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. Interactive Data Visualization: Year-by-Year Growth Trajectory */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="font-heading font-extrabold text-slate-900 text-sm sm:text-base flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span>Wealth Trajectory & FIRE Crossover Curve</span>
            </h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Compounded portfolio growth with {annualStepUpPercent}% annual capacity increase vs FIRE freedom threshold
            </p>
          </div>

          {/* FIRE Type Selector Pill */}
          <div className="flex items-center gap-1 p-1 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs font-bold self-start sm:self-auto shadow-2xs">
            <button
              onClick={() => setSelectedFireType('LEAN')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedFireType === 'LEAN'
                  ? 'bg-[#16836b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
              }`}
            >
              Lean FIRE ({formatVal(fireTargets.leanFire)})
            </button>
            <button
              onClick={() => setSelectedFireType('STANDARD')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedFireType === 'STANDARD'
                  ? 'bg-[#16836b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
              }`}
            >
              Standard ({formatVal(fireTargets.standardFire)})
            </button>
            <button
              onClick={() => setSelectedFireType('FAT')}
              className={`px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                selectedFireType === 'FAT'
                  ? 'bg-[#16836b] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
              }`}
            >
              Fat FIRE ({formatVal(fireTargets.fatFire)})
            </button>
          </div>
        </div>

        {/* Recharts Area Chart */}
        <div className="w-full h-72 sm:h-80 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart
              data={simulation.chartData}
              margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
            >
              <defs>
                <linearGradient id="wealthGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.02} />
                </linearGradient>
                <linearGradient id="investedGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.35} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.02} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis
                dataKey="year"
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tick={{ fill: '#64748b', fontSize: 11, fontWeight: 600 }}
                tickFormatter={(val) => formatVal(val)}
                domain={['auto', 'auto']}
              />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="rounded-2xl border border-slate-200 bg-white/95 p-3.5 shadow-xl backdrop-blur-md text-xs space-y-1.5 min-w-[200px]">
                      <div className="flex items-center justify-between border-b border-slate-100 pb-1.5 font-bold text-slate-800">
                        <span>Year {item.year} (Age {item.age})</span>
                        {item.isFireAchieved ? (
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                            FIRE Achieved!
                          </span>
                        ) : (
                          <span className="text-[10px] text-slate-400">
                            {((item.corpus / item.targetFire) * 100).toFixed(0)}% of goal
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-emerald-600 font-bold">
                        <span>Portfolio Corpus:</span>
                        <span>{formatVal(item.corpus)}</span>
                      </div>
                      <div className="flex items-center justify-between text-indigo-600 font-medium">
                        <span>Total Invested:</span>
                        <span>{formatVal(item.totalInvested)}</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 font-medium">
                        <span>Compound Growth:</span>
                        <span>{formatVal(item.wealthGain)}</span>
                      </div>
                      <div className="flex items-center justify-between text-amber-600 font-semibold border-t border-slate-100 pt-1 text-[11px]">
                        <span>FIRE Threshold:</span>
                        <span>{formatVal(item.targetFire)}</span>
                      </div>
                    </div>
                  );
                }}
              />
              <ReferenceLine
                y={fireTargets.activeTarget}
                stroke="#d97706"
                strokeDasharray="4 4"
                strokeWidth={2}
                label={{
                  value: `Target: ${formatVal(fireTargets.activeTarget)}`,
                  fill: '#d97706',
                  fontSize: 11,
                  fontWeight: 700,
                  position: 'insideTopLeft',
                }}
              />
              <Area
                type="monotone"
                dataKey="totalInvested"
                name="Principal Invested"
                stroke="#6366f1"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#investedGradient)"
              />
              <Area
                type="monotone"
                dataKey="corpus"
                name="Compounded Wealth"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#wealthGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Legend Strip */}
        <div className="flex flex-wrap items-center justify-center gap-4 text-xs font-semibold text-slate-600 pt-1 border-t border-slate-100">
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-indigo-500"></span>
            <span>Your Out-of-Pocket Contributions</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-3 rounded-md bg-emerald-500"></span>
            <span>Compounded Wealth Growth ({expectedReturnRate}% CAGR)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-4 h-0.5 bg-amber-600 border-t border-dashed border-amber-600"></span>
            <span>FIRE Independence Threshold</span>
          </div>
        </div>
      </div>

      {/* 5. Interactive Parameter Controls & Sliders */}
      <div className="p-5 sm:p-6 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs space-y-5">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-3">
          <Sliders className="w-4 h-4 text-amber-600" />
          <h4 className="font-heading font-extrabold text-slate-900 text-sm sm:text-base">
            Adjust Capacity, Step-Up & Compounding Assumptions
          </h4>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {/* Slider 1: Monthly Living Expenses */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Monthly Expenses</span>
              <span className="font-mono font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                {formatVal(monthlyExpenses)}
              </span>
            </div>
            <input
              type="range"
              min={isINR ? 15000 : 800}
              max={isINR ? 250000 : 15000}
              step={isINR ? 5000 : 100}
              value={monthlyExpenses}
              onChange={(e) => setMonthlyExpenses(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{isINR ? '₹15k' : '$800'}</span>
              <span>Annual: {formatVal(monthlyExpenses * 12)}</span>
              <span>{isINR ? '₹2.5L' : '$15k'}</span>
            </div>
          </div>

          {/* Slider 2: Current Portfolio Corpus */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Current Portfolio</span>
              <span className="font-mono font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                {formatVal(currentCorpus)}
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={isINR ? 10000000 : 500000}
              step={isINR ? 50000 : 2500}
              value={currentCorpus}
              onChange={(e) => setCurrentCorpus(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{formatVal(0)}</span>
              <span>Invested Seed</span>
              <span>{formatVal(isINR ? 10000000 : 500000)}</span>
            </div>
          </div>

          {/* Slider 3: Monthly Investment Capacity */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Monthly Capacity (SIP)</span>
              <span className="font-mono font-extrabold text-indigo-700 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                {formatVal(monthlyInvestment)}/mo
              </span>
            </div>
            <input
              type="range"
              min={isINR ? 5000 : 200}
              max={isINR ? 200000 : 10000}
              step={isINR ? 2500 : 100}
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>{isINR ? '₹5k' : '$200'}</span>
              <span>1st Year: {formatVal(monthlyInvestment * 12)}</span>
              <span>{isINR ? '₹2L' : '$10k'}</span>
            </div>
          </div>

          {/* Slider 4: Annual Increase in Capacity (Step-Up %) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-indigo-50/60 border border-indigo-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-indigo-900 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-indigo-600" />
                Annual Step-Up Capacity
              </span>
              <span className="font-mono font-extrabold text-indigo-700 px-2 py-0.5 rounded-md bg-white border border-indigo-200">
                +{annualStepUpPercent}% / yr
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={25}
              step={1}
              value={annualStepUpPercent}
              onChange={(e) => setAnnualStepUpPercent(Number(e.target.value))}
              className="w-full accent-indigo-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-indigo-500 font-mono">
              <span>0% (Flat SIP)</span>
              <span>Hike / Salary Growth</span>
              <span>+25% / yr</span>
            </div>
          </div>

          {/* Slider 5: Expected Return Rate (CAGR) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-emerald-900">Expected Return (CAGR)</span>
              <span className="font-mono font-extrabold text-emerald-700 px-2 py-0.5 rounded-md bg-white border border-emerald-200">
                {expectedReturnRate}%
              </span>
            </div>
            <input
              type="range"
              min={6}
              max={18}
              step={0.5}
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full accent-emerald-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-emerald-600 font-mono">
              <span>6% (Debt)</span>
              <span>12% (Equity Index)</span>
              <span>18% (Aggressive)</span>
            </div>
          </div>

          {/* Slider 6: Safe Withdrawal Rate (SWR) */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-900">Safe Withdrawal Rate (SWR)</span>
              <span className="font-mono font-extrabold text-amber-800 px-2 py-0.5 rounded-md bg-white border border-amber-200">
                {safeWithdrawalRate}% ({(100 / safeWithdrawalRate).toFixed(0)}x)
              </span>
            </div>
            <input
              type="range"
              min={3.0}
              max={5.0}
              step={0.1}
              value={safeWithdrawalRate}
              onChange={(e) => setSafeWithdrawalRate(Number(e.target.value))}
              className="w-full accent-amber-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-amber-700 font-mono">
              <span>3.0% (33x Safe)</span>
              <span>4.0% (Trinity 25x)</span>
              <span>5.0% (20x)</span>
            </div>
          </div>

          {/* Slider 7: Current Age */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-slate-800">Current Age</span>
              <span className="font-mono font-extrabold text-slate-900 px-2 py-0.5 rounded-md bg-white border border-slate-200">
                {currentAge} Years Old
              </span>
            </div>
            <input
              type="range"
              min={18}
              max={60}
              step={1}
              value={currentAge}
              onChange={(e) => setCurrentAge(Number(e.target.value))}
              className="w-full accent-slate-700 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-mono">
              <span>18 yrs</span>
              <span>Coast Baseline</span>
              <span>60 yrs</span>
            </div>
          </div>

          {/* Slider 8: Long-Term Inflation */}
          <div className="space-y-2 p-3.5 rounded-2xl bg-rose-50/60 border border-rose-200/80">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-rose-950">Long-Term Inflation Rate</span>
              <span className="font-mono font-extrabold text-rose-800 px-2 py-0.5 rounded-md bg-white border border-rose-200">
                {inflationRate}% / yr
              </span>
            </div>
            <input
              type="range"
              min={3.0}
              max={10.0}
              step={0.5}
              value={inflationRate}
              onChange={(e) => setInflationRate(Number(e.target.value))}
              className="w-full accent-rose-600 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-rose-600 font-mono">
              <span>3% (Mild)</span>
              <span>6% (Historical Avg)</span>
              <span>10% (High)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
