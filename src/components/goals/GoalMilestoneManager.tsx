import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { GoalCategory, GoalItem, GoalPriority } from '@/types/finance';
import {
  formatCurrency,
  CURRENCY_CONFIGS,
  GOAL_CATEGORY_LABELS,
  GOAL_CATEGORY_COLORS,
} from '@/utils/formatters';
import {
  Target,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  TrendingUp,
  Clock,
  X,
  Compass,
  Calculator,
  Award,
  Flame,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { FireCalculatorWidget } from './FireCalculatorWidget';

export const GoalMilestoneManager: React.FC = () => {
  const {
    goals,
    currency,
    addGoal,
    deleteGoal,
    contributeToGoal,
  } = useFinanceStore();

  const currentRate = CURRENCY_CONFIGS[currency].rateFromUSD;

  // Active view toggle: 'BUCKETS' vs 'FIRE_CALCULATOR' vs 'SIP_SIMULATOR'
  const [activeView, setActiveView] = useState<'BUCKETS' | 'FIRE_CALCULATOR' | 'SIP_SIMULATOR'>('BUCKETS');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [topUpGoal, setTopUpGoal] = useState<GoalItem | null>(null);
  const [topUpAmount, setTopUpAmount] = useState<number>(25000);

  // New Goal Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<GoalCategory>('CHILD_EDUCATION');
  const [newTargetToday, setNewTargetToday] = useState<number>(5000000); // ₹50 Lakhs
  const [newTargetDate, setNewTargetDate] = useState('2034-06-30');
  const [newCurrentSaved, setNewCurrentSaved] = useState<number>(1000000);
  const [newMonthlySip, setNewMonthlySip] = useState<number>(20000);
  const [newPriority, setNewPriority] = useState<GoalPriority>('HIGH');
  const [newInflation, setNewInflation] = useState<number>(7.0);
  const [newReturns, setNewReturns] = useState<number>(12.0);
  const [newNotes, setNewNotes] = useState('');

  // Standalone SIP Simulator State
  const [simMonthly, setSimMonthly] = useState<number>(25000);
  const [simReturns, setSimReturns] = useState<number>(12.5);
  const [simYears, setSimYears] = useState<number>(10);
  const [simStepUp, setSimStepUp] = useState<number>(10); // 10% annual step-up

  // Aggregate Metrics Across All Goals
  const metrics = useMemo(() => {
    let totalTargetUSD = 0;
    let totalSavedUSD = 0;
    let totalMonthlySipUSD = 0;
    let goalsOnTrackCount = 0;

    goals.forEach((goal) => {
      totalTargetUSD += goal.targetAmount;
      totalSavedUSD += goal.currentSaved;
      totalMonthlySipUSD += goal.monthlyContribution;

      // Check if on track: Required SIP calculation
      const now = new Date();
      const target = new Date(goal.targetDate);
      const diffMonths = Math.max(
        1,
        (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
      );
      const diffYears = diffMonths / 12;

      // Future value adjusted for inflation
      const futureTargetUSD = goal.targetAmount * Math.pow(1 + goal.inflationRate / 100, diffYears);
      const remainingDeficitUSD = Math.max(
        0,
        futureTargetUSD - goal.currentSaved * Math.pow(1 + goal.expectedReturnRate / 100, diffYears)
      );

      // Monthly rate i
      const i = goal.expectedReturnRate / 100 / 12;
      const requiredMonthlySipUSD =
        remainingDeficitUSD > 0 && i > 0
          ? (remainingDeficitUSD * i) / (Math.pow(1 + i, diffMonths) - 1)
          : 0;

      if (goal.monthlyContribution >= requiredMonthlySipUSD * 0.9) {
        goalsOnTrackCount++;
      }
    });

    const overallProgressPercent =
      totalTargetUSD > 0 ? Math.min(100, (totalSavedUSD / totalTargetUSD) * 100) : 0;

    return {
      totalTargetUSD,
      totalSavedUSD,
      totalMonthlySipUSD,
      overallProgressPercent,
      goalsOnTrackCount,
    };
  }, [goals]);

  // Filtered Goals
  const filteredGoals = useMemo(() => {
    if (filterCategory === 'ALL') return goals;
    return goals.filter((g) => g.category === filterCategory);
  }, [goals, filterCategory]);

  // Handle Create Goal
  const handleCreateGoal = (e: React.FormEvent) => {
    e.preventDefault();
    const targetUSD = currency === 'INR' ? newTargetToday / currentRate : newTargetToday;
    const savedUSD = currency === 'INR' ? newCurrentSaved / currentRate : newCurrentSaved;
    const sipUSD = currency === 'INR' ? newMonthlySip / currentRate : newMonthlySip;

    addGoal({
      title: newTitle || 'Personal Financial Goal',
      category: newCategory,
      targetAmount: targetUSD,
      targetDate: newTargetDate,
      currentSaved: savedUSD,
      monthlyContribution: sipUSD,
      priority: newPriority,
      inflationRate: newInflation || 6.0,
      expectedReturnRate: newReturns || 12.0,
      notes: newNotes,
    });

    setIsAddModalOpen(false);
    setNewTitle('');
    setNewNotes('');
  };

  // Handle Top-up Contribution
  const handleTopUpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!topUpGoal) return;
    const amountUSD = currency === 'INR' ? topUpAmount / currentRate : topUpAmount;
    contributeToGoal(topUpGoal.id, amountUSD);
    setTopUpGoal(null);
  };

  // Helper calculation for individual Goal Card
  const calculateGoalAnalytics = (goal: GoalItem) => {
    const now = new Date();
    const target = new Date(goal.targetDate);
    const diffMonths = Math.max(
      1,
      (target.getFullYear() - now.getFullYear()) * 12 + (target.getMonth() - now.getMonth())
    );
    const diffYears = diffMonths / 12;

    // Inflation Adjusted Future Value
    const futureTargetUSD = goal.targetAmount * Math.pow(1 + goal.inflationRate / 100, diffYears);

    // Compounded growth of existing savings
    const projectedExistingSavingsUSD =
      goal.currentSaved * Math.pow(1 + goal.expectedReturnRate / 100, diffYears);

    // Remaining corpus needed from ongoing SIPs
    const netFutureShortfallUSD = Math.max(0, futureTargetUSD - projectedExistingSavingsUSD);

    // Required monthly SIP
    const i = goal.expectedReturnRate / 100 / 12;
    const requiredSipUSD =
      netFutureShortfallUSD > 0 && i > 0
        ? (netFutureShortfallUSD * i) / (Math.pow(1 + i, diffMonths) - 1)
        : 0;

    const sipDeficitUSD = Math.max(0, requiredSipUSD - goal.monthlyContribution);
    const isOnTrack = goal.monthlyContribution >= requiredSipUSD * 0.95;
    const fundedPercent = Math.min(100, (goal.currentSaved / goal.targetAmount) * 100);

    return {
      diffMonths,
      diffYears,
      futureTargetUSD,
      requiredSipUSD,
      sipDeficitUSD,
      isOnTrack,
      fundedPercent,
    };
  };

  // Standalone SIP Simulator Calculation (With Step-up SIP)
  const simResults = useMemo(() => {
    const monthlyRate = simReturns / 100 / 12;
    let totalInvested = 0;
    let futureValue = 0;
    let currentSip = simMonthly;

    for (let yr = 1; yr <= simYears; yr++) {
      for (let m = 1; m <= 12; m++) {
        totalInvested += currentSip;
        futureValue = (futureValue + currentSip) * (1 + monthlyRate);
      }
      // Step-up by percentage annually
      currentSip = currentSip * (1 + simStepUp / 100);
    }

    const wealthGain = Math.max(0, futureValue - totalInvested);

    return {
      totalInvestedUSD: currency === 'INR' ? totalInvested / currentRate : totalInvested,
      wealthGainUSD: currency === 'INR' ? wealthGain / currentRate : wealthGain,
      futureValueUSD: currency === 'INR' ? futureValue / currentRate : futureValue,
    };
  }, [simMonthly, simReturns, simYears, simStepUp, currency, currentRate]);

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2.5 rounded-2xl bg-[#9e783e]/15 text-[#9e783e]">
              <Target className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Goal-Based Investing & Milestones
              </h2>
              <span className="text-xs font-semibold text-[#866632] bg-[#f4efe4] px-2.5 py-0.5 rounded-md border border-[#ded3bf]">
                Milestone Buckets, Inflation Protection & SIP Alignment
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 max-w-2xl font-medium leading-relaxed">
            Attach your investments to real life aspirations. Calculate inflation-adjusted future targets, evaluate
            monthly SIP adequacy, and bridge wealth shortfalls.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0 w-full md:w-auto">
          {/* View Toggle (3 Views) */}
          <div className="grid grid-cols-3 sm:flex items-center rounded-2xl bg-[#faf8f5] p-1 border border-[#e8e0d1] w-full sm:w-auto shadow-2xs">
            <button
              onClick={() => setActiveView('BUCKETS')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'BUCKETS'
                  ? 'bg-[#9e783e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
              }`}
            >
              <Compass className="h-3.5 w-3.5 shrink-0" />
              <span className="sm:hidden text-[11px]">Goals</span>
              <span className="hidden sm:inline">Life Goals</span>
            </button>

            <button
              onClick={() => setActiveView('FIRE_CALCULATOR')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'FIRE_CALCULATOR'
                  ? 'bg-gradient-to-r from-amber-600 to-orange-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
              }`}
            >
              <Flame className="h-3.5 w-3.5 text-amber-300 shrink-0" />
              <span className="sm:hidden text-[11px]">FIRE Calc</span>
              <span className="hidden sm:inline">FIRE Calculator</span>
            </button>

            <button
              onClick={() => setActiveView('SIP_SIMULATOR')}
              className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeView === 'SIP_SIMULATOR'
                  ? 'bg-[#9e783e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
              }`}
            >
              <Calculator className="h-3.5 w-3.5 shrink-0" />
              <span className="sm:hidden text-[11px]">SIP</span>
              <span className="hidden sm:inline">SIP Simulator</span>
            </button>
          </div>

          {activeView === 'BUCKETS' && (
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => {
                if (currency === 'INR') {
                  setNewTargetToday(5000000);
                  setNewCurrentSaved(1000000);
                  setNewMonthlySip(20000);
                } else {
                  setNewTargetToday(60000);
                  setNewCurrentSaved(12000);
                  setNewMonthlySip(250);
                }
                setIsAddModalOpen(true);
              }}
              className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] shadow-md shadow-[#9e783e]/20 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Plus className="h-4 w-4" />
              <span>Create Goal</span>
            </motion.button>
          )}
        </div>
      </div>

      {/* Top 4 KPI Metrics (Goal Buckets Only) */}
      {activeView === 'BUCKETS' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Total Goals Target Corpus */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">
                Total Goals Target Value
              </span>
              <div className="p-2 rounded-xl bg-[#faf7f0] text-[#9e783e]">
                <Target className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {formatCurrency(metrics.totalTargetUSD, currency)}
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1.5 block">
              Across {goals.length} tracked life milestones
            </span>
          </motion.div>

          {/* Current Accumulated Savings */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 via-white to-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-emerald-900 uppercase text-[11px] tracking-wider">
                Accumulated Capital Saved
              </span>
              <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-emerald-950">
              {formatCurrency(metrics.totalSavedUSD, currency)}
            </div>
            <div className="mt-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-600 font-semibold mb-1">
                <span>Funded So Far</span>
                <span>{metrics.overallProgressPercent.toFixed(1)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full transition-all duration-700"
                  style={{ width: `${metrics.overallProgressPercent}%` }}
                />
              </div>
            </div>
          </motion.div>

          {/* Active Monthly SIP Allocated */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">
                Allocated Monthly SIP
              </span>
              <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
                <TrendingUp className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-slate-900">
              {formatCurrency(metrics.totalMonthlySipUSD, currency)}
              <span className="text-xs font-normal text-slate-400 ml-1">/mo</span>
            </div>
            <span className="text-xs text-slate-500 font-medium mt-1.5 block">
              Systematic monthly wealth accumulation
            </span>
          </motion.div>

          {/* Goals on Track */}
          <motion.div
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className="rounded-2xl border border-sky-200 bg-gradient-to-b from-sky-50/40 via-white to-white p-5 shadow-xs"
          >
            <div className="flex items-center justify-between text-xs mb-2">
              <span className="font-bold text-sky-900 uppercase text-[11px] tracking-wider">
                Milestones on Track
              </span>
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                <Award className="h-4 w-4" />
              </div>
            </div>
            <div className="text-2xl font-extrabold font-mono text-sky-950">
              {metrics.goalsOnTrackCount} / {goals.length}
            </div>
            <span className="text-xs text-sky-700 font-semibold mt-1.5 block">
              {metrics.goalsOnTrackCount === goals.length
                ? 'All milestones fully aligned!'
                : `${goals.length - metrics.goalsOnTrackCount} goals need SIP adjustment`}
            </span>
          </motion.div>
        </div>
      )}

      {/* VIEW 1: LIFE GOAL BUCKETS */}
      {activeView === 'BUCKETS' && (
        <div className="space-y-4">
          {/* Category Filter Pills */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-base sm:text-lg font-bold text-slate-900">
                Your Life Goal Buckets ({filteredGoals.length})
              </h3>
              <p className="text-xs text-slate-600">
                Inflation-adjusted projections, target dates, and monthly SIP requirements
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white p-1 border border-[#e8e0d1] text-xs font-bold shadow-xs">
              {[
                'ALL',
                'RETIREMENT_FIRE',
                'CHILD_EDUCATION',
                'HOME_PURCHASE',
                'LUXURY_VACATION',
              ].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilterCategory(cat)}
                  className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    filterCategory === cat
                      ? 'bg-[#9e783e] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5]'
                  }`}
                >
                  {cat === 'ALL'
                    ? 'All Milestones'
                    : cat === 'RETIREMENT_FIRE'
                    ? 'FIRE & Retirement'
                    : cat === 'CHILD_EDUCATION'
                    ? 'Education'
                    : cat === 'HOME_PURCHASE'
                    ? 'Home'
                    : 'Vacation'}
                </button>
              ))}
            </div>
          </div>

          {/* Goals Cards Grid */}
          {filteredGoals.length === 0 ? (
            <div className="p-12 text-center bg-white rounded-3xl border border-[#e8e0d1] shadow-xs">
              <div className="p-4 rounded-2xl bg-[#faf7f0] text-[#9e783e] w-fit mx-auto mb-3 border border-[#ded3bf]">
                <Target className="h-8 w-8" />
              </div>
              <h4 className="text-base font-extrabold text-slate-900 mb-1">No Goals Recorded Yet</h4>
              <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 font-medium leading-relaxed">
                Connect your investments to real life aspirations like child education, home purchase, or early retirement.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-all cursor-pointer shadow-xs"
              >
                + Create First Goal
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {filteredGoals.map((goal) => {
                const colorConfig = GOAL_CATEGORY_COLORS[goal.category];
                const analytics = calculateGoalAnalytics(goal);

                return (
                  <motion.div
                    key={goal.id}
                    whileHover={{ y: -3, transition: { duration: 0.2 } }}
                    className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                  >
                    <div>
                      {/* Header Badge & Priority */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="flex items-center gap-1.5">
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorConfig.badge} ${colorConfig.border}`}
                          >
                            {GOAL_CATEGORY_LABELS[goal.category]}
                          </span>

                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                              goal.priority === 'HIGH'
                                ? 'bg-rose-50 text-rose-700 border border-rose-200'
                                : goal.priority === 'MEDIUM'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-slate-100 text-slate-700'
                            }`}
                          >
                            {goal.priority} Priority
                          </span>
                        </div>

                        <button
                          onClick={() => {
                            if (window.confirm(`Delete goal "${goal.title}"?`)) {
                              deleteGoal(goal.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete goal"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>

                      <h4 className="text-base font-extrabold text-slate-900 leading-snug">
                        {goal.title}
                      </h4>
                      {goal.notes && (
                        <p className="text-xs text-slate-500 mt-1 line-clamp-2 font-medium">
                          {goal.notes}
                        </p>
                      )}
                    </div>

                    {/* Progress Bar & Corpus Stats */}
                    <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-3">
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Saved So Far
                          </span>
                          <span className="text-lg font-extrabold font-mono text-emerald-800">
                            {formatCurrency(goal.currentSaved, currency)}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] font-bold text-slate-500 uppercase block">
                            Target (Today Value)
                          </span>
                          <span className="text-base font-extrabold font-mono text-slate-900">
                            {formatCurrency(goal.targetAmount, currency)}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div>
                        <div className="flex justify-between text-[11px] font-semibold text-slate-600 mb-1">
                          <span>{analytics.fundedPercent.toFixed(1)}% Funded</span>
                          <span>
                            Deficit: {formatCurrency(Math.max(0, goal.targetAmount - goal.currentSaved), currency)}
                          </span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                          <div
                            className="h-full bg-[#9e783e] rounded-full transition-all duration-500"
                            style={{ width: `${analytics.fundedPercent}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Inflation & SIP Adequacy Metrics */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      {/* Inflation Future Target */}
                      <div className="p-3 rounded-xl bg-white border border-[#e8e0d1]">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">
                          Future Cost (+{goal.inflationRate}% Inf.)
                        </span>
                        <span className="font-extrabold font-mono text-amber-900 text-sm">
                          {formatCurrency(analytics.futureTargetUSD, currency)}
                        </span>
                      </div>

                      {/* Required SIP */}
                      <div className="p-3 rounded-xl bg-white border border-[#e8e0d1]">
                        <span className="text-[10px] font-bold text-slate-500 block uppercase">
                          Required Monthly SIP
                        </span>
                        <span className="font-extrabold font-mono text-indigo-900 text-sm">
                          {formatCurrency(analytics.requiredSipUSD, currency)}/mo
                        </span>
                      </div>
                    </div>

                    {/* Target Timeline Countdown & Status Badge */}
                    <div className="flex items-center justify-between text-xs pt-1">
                      <span className="flex items-center gap-1.5 text-slate-600 font-medium">
                        <Clock className="h-3.5 w-3.5 text-[#9e783e]" />
                        {Math.floor(analytics.diffYears)}y {analytics.diffMonths % 12}m left ({goal.targetDate})
                      </span>

                      <span
                        className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${
                          analytics.isOnTrack
                            ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                            : 'bg-amber-50 text-amber-800 border border-amber-200'
                        }`}
                      >
                        {analytics.isOnTrack
                          ? 'SIP on Track ⭐'
                          : `Shortfall: ${formatCurrency(analytics.sipDeficitUSD, currency)}/mo`}
                      </span>
                    </div>

                    {/* Card Actions */}
                    <div className="flex items-center gap-2 pt-2 border-t border-[#f2ece1]">
                      <button
                        onClick={() => {
                          setTopUpGoal(goal);
                          setTopUpAmount(currency === 'INR' ? 25000 : 300);
                        }}
                        className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-colors cursor-pointer shadow-xs"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        <span>Add Contribution</span>
                      </button>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: FIRE NUMBER CALCULATOR & TIMELINE VISUALIZATION */}
      {activeView === 'FIRE_CALCULATOR' && (
        <motion.div
          key="fire-calculator-view"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          <FireCalculatorWidget />
        </motion.div>
      )}

      {/* VIEW 3: COMPOUND SIP & STEP-UP SIMULATOR */}
      {activeView === 'SIP_SIMULATOR' && (
        <motion.div
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-3xl border border-[#e8e0d1] bg-white p-6 sm:p-8 shadow-xs space-y-6"
        >
          <div className="pb-4 border-b border-[#e8e0d1]">
            <div className="flex items-center gap-2">
              <Calculator className="h-5 w-5 text-[#9e783e]" />
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Step-up SIP & Compound Wealth Simulator
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Simulate compounding returns with an annual Step-up percentage to bridge goal shortfalls
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Left Column: Sliders (6 cols) */}
            <div className="lg:col-span-6 space-y-5 text-xs font-semibold text-slate-700">
              {/* Monthly Investment Slider */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2">
                <div className="flex justify-between items-center">
                  <span>Initial Monthly SIP:</span>
                  <span className="font-extrabold font-mono text-[#9e783e] text-base">
                    {formatCurrency(currency === 'INR' ? simMonthly / currentRate : simMonthly, currency)}/mo
                  </span>
                </div>
                <input
                  type="range"
                  min={currency === 'INR' ? 1000 : 25}
                  max={currency === 'INR' ? 200000 : 2500}
                  step={currency === 'INR' ? 1000 : 25}
                  value={simMonthly}
                  onChange={(e) => setSimMonthly(Number(e.target.value))}
                  className="w-full accent-[#9e783e] cursor-pointer"
                />
              </div>

              {/* Annual Step-up Slider */}
              <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2">
                <div className="flex justify-between items-center">
                  <span>Annual Step-up Percentage (+% per year):</span>
                  <span className="font-extrabold font-mono text-emerald-800 text-base">
                    +{simStepUp}% annually
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="25"
                  step="1"
                  value={simStepUp}
                  onChange={(e) => setSimStepUp(Number(e.target.value))}
                  className="w-full accent-emerald-700 cursor-pointer"
                />
                <span className="text-[10px] text-slate-400 block">
                  Increasing SIP by 10% each year as your salary grows creates exponentially larger wealth.
                </span>
              </div>

              {/* Expected Returns & Time Horizon */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Expected Returns:</span>
                    <span className="font-extrabold font-mono text-slate-900">{simReturns}% p.a.</span>
                  </div>
                  <input
                    type="range"
                    min="6"
                    max="18"
                    step="0.5"
                    value={simReturns}
                    onChange={(e) => setSimReturns(Number(e.target.value))}
                    className="w-full accent-[#9e783e] cursor-pointer"
                  />
                </div>

                <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2">
                  <div className="flex justify-between items-center">
                    <span>Time Horizon:</span>
                    <span className="font-extrabold font-mono text-slate-900">{simYears} Years</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="30"
                    step="1"
                    value={simYears}
                    onChange={(e) => setSimYears(Number(e.target.value))}
                    className="w-full accent-[#9e783e] cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Visual Result Card (6 cols) */}
            <div className="lg:col-span-6 p-6 rounded-3xl bg-gradient-to-br from-[#faf7f0] via-[#f7f2e6] to-[#faf8f5] border border-[#ded3bf] space-y-5">
              <div>
                <span className="text-[11px] font-bold text-[#866632] uppercase tracking-wider block">
                  Projected Maturity Corpus
                </span>
                <div className="text-3xl sm:text-4xl font-extrabold font-mono text-slate-900 mt-1">
                  {formatCurrency(simResults.futureValueUSD, currency)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-4 rounded-2xl bg-white border border-[#ded3bf]">
                  <span className="text-slate-500 font-semibold block text-[11px]">Total Capital Invested</span>
                  <span className="text-base font-extrabold font-mono text-slate-900 mt-1 block">
                    {formatCurrency(simResults.totalInvestedUSD, currency)}
                  </span>
                </div>

                <div className="p-4 rounded-2xl bg-white border border-[#ded3bf]">
                  <span className="text-slate-500 font-semibold block text-[11px]">Estimated Wealth Gain</span>
                  <span className="text-base font-extrabold font-mono text-emerald-700 mt-1 block">
                    +{formatCurrency(simResults.wealthGainUSD, currency)}
                  </span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-white/80 border border-[#ded3bf] text-xs space-y-1">
                <span className="font-extrabold text-[#866632] flex items-center gap-1">
                  <Sparkles className="h-4 w-4" /> Compounding Advantage
                </span>
                <p className="text-slate-600 font-medium leading-relaxed text-[11px]">
                  Wealth returns represent{' '}
                  <strong className="text-emerald-800">
                    {simResults.totalInvestedUSD > 0
                      ? ((simResults.wealthGainUSD / simResults.totalInvestedUSD) * 100).toFixed(0)
                      : 0}
                    % gain
                  </strong>{' '}
                  above your total deposited principal basis!
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* ============================================================== */}
      {/* MODAL 1: CREATE LIFE GOAL                                      */}
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
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Create New Life Goal</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Plan milestone targets with automatic inflation adjustment
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

              <form onSubmit={handleCreateGoal} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Goal Title *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Emergency Fund, Home Downpayment, Vacation"
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Milestone Category *</label>
                    <select
                      value={newCategory}
                      onChange={(e) => setNewCategory(e.target.value as GoalCategory)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="CHILD_EDUCATION">Child's Education</option>
                      <option value="RETIREMENT_FIRE">FIRE & Retirement Corpus</option>
                      <option value="HOME_PURCHASE">Home / Real Estate Purchase</option>
                      <option value="DREAM_CAR">Vehicle / Car Purchase</option>
                      <option value="LUXURY_VACATION">Travel & Sabbatical</option>
                      <option value="WEDDING_FAMILY">Family & Marriage Milestone</option>
                      <option value="WEALTH_CORPUS">Wealth Milestone</option>
                      <option value="CUSTOM_GOAL">Custom Life Milestone</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">
                      Target Amount in Today's Value ({currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="1000"
                      value={newTargetToday}
                      onChange={(e) => setNewTargetToday(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Target Completion Date *</label>
                    <input
                      type="date"
                      required
                      value={newTargetDate}
                      onChange={(e) => setNewTargetDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">
                      Current Saved ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newCurrentSaved}
                      onChange={(e) => setNewCurrentSaved(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">
                      Monthly SIP ({currency})
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={newMonthlySip}
                      onChange={(e) => setNewMonthlySip(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Priority</label>
                    <select
                      value={newPriority}
                      onChange={(e) => setNewPriority(e.target.value as GoalPriority)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="HIGH">High Priority</option>
                      <option value="MEDIUM">Medium Priority</option>
                      <option value="LOW">Low Priority</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Inflation Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="0"
                      max="20"
                      value={newInflation}
                      onChange={(e) => setNewInflation(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400">Standard 6-7% | Education 9-10%</span>
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Expected Return Rate (% p.a.)</label>
                    <input
                      type="number"
                      step="0.5"
                      min="1"
                      max="25"
                      value={newReturns}
                      onChange={(e) => setNewReturns(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                    <span className="text-[10px] text-slate-400">Equity 12% | Balanced 10% | Debt 7%</span>
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Notes & Milestones Strategy</label>
                  <textarea
                    rows={2}
                    placeholder="e.g. Savings plan, monthly targets, milestone notes"
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
                    Save Life Goal
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ============================================================== */}
      {/* MODAL 2: ADD GOAL TOP-UP CONTRIBUTION                          */}
      {/* ============================================================== */}
      <AnimatePresence>
        {topUpGoal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-md rounded-3xl bg-white border border-[#e8e0d1] p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e0d1]">
                <div>
                  <h3 className="text-base font-extrabold text-slate-900">Add Goal Contribution</h3>
                  <p className="text-[11px] text-slate-500 font-medium">
                    Credit funds directly towards {topUpGoal.title}
                  </p>
                </div>
                <button
                  onClick={() => setTopUpGoal(null)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleTopUpSubmit} className="space-y-4 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-600">Contribution Amount ({currency}) *</label>
                  <input
                    type="number"
                    required
                    min="1"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(Number(e.target.value))}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Current saved: {formatCurrency(topUpGoal.currentSaved, currency)} / Target:{' '}
                    {formatCurrency(topUpGoal.targetAmount, currency)}
                  </span>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8e0d1]">
                  <button
                    type="button"
                    onClick={() => setTopUpGoal(null)}
                    className="px-4 py-2 rounded-xl border border-[#e8e0d1] text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] shadow-md shadow-[#9e783e]/20 cursor-pointer"
                  >
                    Record Contribution
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
