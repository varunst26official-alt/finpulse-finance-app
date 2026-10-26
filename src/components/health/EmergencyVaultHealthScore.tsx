import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/formatters';
import {
  Activity,
  ShieldCheck,
  PiggyBank,
  CheckCircle2,
  TrendingUp,
  Layers,
  HeartPulse,
  Sparkles,
  Lock,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const EmergencyVaultHealthScore: React.FC = () => {
  const {
    currency,
    emergencyTargetMonths,
    setEmergencyTargetMonths,
    getPortfolioSummary,
    getFinancialHealthScore,
  } = useFinanceStore();

  const summary = getPortfolioSummary();
  const healthScore = getFinancialHealthScore();

  // Emergency Vault Calculations
  const monthlyExpenses = summary.totalMonthlyExpenses > 0 ? summary.totalMonthlyExpenses : 1000;
  const targetRequiredUSD = monthlyExpenses * emergencyTargetMonths;
  const currentLiquidUSD =
    summary.allocationBreakdown.find((a) => a.category === 'LIQUID_CASH')?.currentValue || 0;
  const fundedPercentage =
    targetRequiredUSD > 0 ? Math.min(100, (currentLiquidUSD / targetRequiredUSD) * 100) : 0;
  const deficitUSD = Math.max(0, targetRequiredUSD - currentLiquidUSD);
  const isFullyFunded = currentLiquidUSD >= targetRequiredUSD;

  // Monthly top-up to bridge deficit in 6 months
  const monthlyTopUpUSD = deficitUSD > 0 ? deficitUSD / 6 : 0;

  // Score color badge
  const ratingColors = {
    EXCELLENT: { text: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', stroke: '#10b981' },
    GOOD: { text: 'text-sky-700', bg: 'bg-sky-50 border-sky-200', stroke: '#0284c7' },
    FAIR: { text: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', stroke: '#d97706' },
    NEEDS_ATTENTION: { text: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', stroke: '#e11d48' },
  }[healthScore.rating];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2.5 rounded-2xl bg-[#9e783e]/15 text-[#9e783e]">
              <Activity className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Financial Health Scorecard & Emergency Vault
              </h2>
              <span className="text-xs font-semibold text-[#866632] bg-[#f4efe4] px-2.5 py-0.5 rounded-md border border-[#ded3bf]">
                Holistic Wealth Health Diagnostics & Liquid Runway
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 max-w-2xl font-medium leading-relaxed">
            Diagnose your total financial resilience across savings rate, liquid runway, debt obligations, asset
            diversification, and insurance protection.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-400 block uppercase">Liquid Reserves</span>
            <span className="text-base font-extrabold font-mono text-emerald-800">
              {formatCurrency(currentLiquidUSD, currency)}
            </span>
          </div>
        </div>
      </div>

      {/* Top Section: Health Scorecard & 5 Pillars */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Overall Health Score Gauge (5 cols) */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="lg:col-span-5 rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs flex flex-col justify-between space-y-5"
        >
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Financial Health Diagnostic
              </span>
              <span className={`text-[10px] font-extrabold px-2.5 py-1 rounded-md border ${ratingColors.bg} ${ratingColors.text}`}>
                {healthScore.rating.replace('_', ' ')}
              </span>
            </div>
            <h3 className="text-base font-extrabold text-slate-900 mt-1">Holistic Resilience Score</h3>
          </div>

          {/* Central Radial Score Display */}
          <div className="flex flex-col items-center justify-center py-4">
            <div className="relative flex items-center justify-center">
              <svg className="w-44 h-44 -rotate-90">
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  stroke="#f1ece1"
                  strokeWidth="12"
                  fill="transparent"
                />
                <circle
                  cx="88"
                  cy="88"
                  r="70"
                  stroke={ratingColors.stroke}
                  strokeWidth="12"
                  strokeDasharray="440"
                  strokeDashoffset={440 - (440 * healthScore.totalScore) / 100}
                  strokeLinecap="round"
                  fill="transparent"
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                <span className="text-4xl font-extrabold font-mono text-slate-900">
                  {healthScore.totalScore}
                </span>
                <span className="text-xs font-bold text-slate-400">OUT OF 100</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 font-medium text-center mt-3 max-w-xs leading-relaxed">
              Calculated across 5 institutional wealth benchmarks: Savings, Emergency Cash, Debt Ratio, Allocation, and Insurance.
            </p>
          </div>

          {/* Actionable Recommendations */}
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2">
            <div className="text-[11px] font-bold text-[#866632] uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-[#9e783e]" />
              Priority Action Items
            </div>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {healthScore.keyRecommendations.slice(0, 3).map((rec, idx) => (
                <li key={idx} className="flex items-start gap-2">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span className="leading-snug font-medium">{rec}</span>
                </li>
              ))}
            </ul>
          </div>
        </motion.div>

        {/* Right: 5 Pillars Detailed Breakdown (7 cols) */}
        <motion.div
          whileHover={{ y: -2, transition: { duration: 0.2 } }}
          className="lg:col-span-7 rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs flex flex-col justify-between space-y-4"
        >
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Health Pillars Breakdown</h3>
            <p className="text-xs text-slate-600">
              Each metric contributes to your personal financial stability and crisis preparedness
            </p>
          </div>

          <div className="space-y-4">
            {/* Pillar 1: Savings Rate */}
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <PiggyBank className="h-4 w-4 text-emerald-600" /> Monthly Savings Rate
                </span>
                <span className="font-extrabold font-mono text-slate-900">
                  {healthScore.pillarScores.savingsRate.score} / {healthScore.pillarScores.savingsRate.maxScore} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-emerald-600 rounded-full"
                  style={{ width: `${(healthScore.pillarScores.savingsRate.score / 25) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {healthScore.pillarScores.savingsRate.detail}
              </span>
            </div>

            {/* Pillar 2: Emergency Runway */}
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4 text-sky-600" /> Emergency Cash Runway
                </span>
                <span className="font-extrabold font-mono text-slate-900">
                  {healthScore.pillarScores.emergencyRunway.score} / {healthScore.pillarScores.emergencyRunway.maxScore} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-sky-600 rounded-full"
                  style={{ width: `${(healthScore.pillarScores.emergencyRunway.score / 25) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {healthScore.pillarScores.emergencyRunway.detail}
              </span>
            </div>

            {/* Pillar 3: Debt Load / DTI */}
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <TrendingUp className="h-4 w-4 text-indigo-600" /> Debt-to-Income / Leverage
                </span>
                <span className="font-extrabold font-mono text-slate-900">
                  {healthScore.pillarScores.debtLoad.score} / {healthScore.pillarScores.debtLoad.maxScore} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${(healthScore.pillarScores.debtLoad.score / 20) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {healthScore.pillarScores.debtLoad.detail}
              </span>
            </div>

            {/* Pillar 4: Diversification */}
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <Layers className="h-4 w-4 text-purple-600" /> Multi-Asset Diversification
                </span>
                <span className="font-extrabold font-mono text-slate-900">
                  {healthScore.pillarScores.diversification.score} / {healthScore.pillarScores.diversification.maxScore} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-purple-600 rounded-full"
                  style={{ width: `${(healthScore.pillarScores.diversification.score / 15) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {healthScore.pillarScores.diversification.detail}
              </span>
            </div>

            {/* Pillar 5: Insurance Protection */}
            <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 flex items-center gap-1.5">
                  <HeartPulse className="h-4 w-4 text-rose-600" /> Insurance & Downside Protection
                </span>
                <span className="font-extrabold font-mono text-slate-900">
                  {healthScore.pillarScores.insuranceProtection.score} / {healthScore.pillarScores.insuranceProtection.maxScore} pts
                </span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div
                  className="h-full bg-rose-600 rounded-full"
                  style={{ width: `${(healthScore.pillarScores.insuranceProtection.score / 15) * 100}%` }}
                />
              </div>
              <span className="text-[11px] text-slate-500 font-medium block">
                {healthScore.pillarScores.insuranceProtection.detail}
              </span>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Section: Emergency Fund Vault Calculator */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="rounded-3xl border border-[#e8e0d1] bg-white p-6 sm:p-8 shadow-xs space-y-6"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#e8e0d1]">
          <div>
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-[#9e783e]" />
              <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
                Emergency Runway Vault Planner
              </h3>
            </div>
            <p className="text-xs text-slate-600 mt-0.5">
              Calculate your safety moat so you never have to sell investments prematurely in a crisis
            </p>
          </div>

          {/* Target Months Switcher */}
          <div className="flex items-center gap-1.5 rounded-xl bg-[#faf8f5] p-1 border border-[#e8e0d1] text-xs font-bold">
            <span className="text-[11px] text-slate-400 px-2 uppercase">Target:</span>
            {[3, 6, 9, 12].map((m) => (
              <button
                key={m}
                onClick={() => setEmergencyTargetMonths(m)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  emergencyTargetMonths === m
                    ? 'bg-[#9e783e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f4efe4]'
                }`}
              >
                {m} Months {m === 6 ? '⭐' : ''}
              </button>
            ))}
          </div>
        </div>

        {/* Vault Status Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Monthly Essential Expenses
            </span>
            <div className="text-xl font-extrabold font-mono text-slate-900">
              {formatCurrency(monthlyExpenses, currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Based on active monthly outflow tracking
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
            <span className="text-[11px] font-bold text-slate-500 uppercase block mb-1">
              Required Vault Target ({emergencyTargetMonths} Mo)
            </span>
            <div className="text-xl font-extrabold font-mono text-slate-900">
              {formatCurrency(targetRequiredUSD, currency)}
            </div>
            <span className="text-[11px] text-slate-500 font-medium mt-1 block">
              Safety cushion to survive zero-income period
            </span>
          </div>

          <div className="p-4 rounded-2xl bg-gradient-to-b from-white to-[#faf7f0] border border-[#ded3bf]">
            <span className="text-[11px] font-bold text-[#866632] uppercase block mb-1">
              {isFullyFunded ? 'Vault Surplus Available' : 'Fund Deficit to Bridge'}
            </span>
            <div
              className={`text-xl font-extrabold font-mono ${
                isFullyFunded ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {isFullyFunded
                ? `+${formatCurrency(currentLiquidUSD - targetRequiredUSD, currency)}`
                : `-${formatCurrency(deficitUSD, currency)}`}
            </div>
            <span className="text-[11px] text-slate-600 font-medium mt-1 block">
              {isFullyFunded ? 'Your runway is fully funded!' : `Save ${formatCurrency(monthlyTopUpUSD, currency)}/mo for 6 months`}
            </span>
          </div>
        </div>

        {/* Big Vault Progress Bar */}
        <div className="p-5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-3">
          <div className="flex items-center justify-between text-xs font-bold">
            <span className="text-slate-800">
              Vault Funded: {formatCurrency(currentLiquidUSD, currency)} / {formatCurrency(targetRequiredUSD, currency)}
            </span>
            <span className={isFullyFunded ? 'text-emerald-700' : 'text-[#866632]'}>
              {fundedPercentage.toFixed(1)}% Complete
            </span>
          </div>

          <div className="w-full h-3 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                isFullyFunded ? 'bg-emerald-600' : 'bg-[#9e783e]'
              }`}
              style={{ width: `${fundedPercentage}%` }}
            />
          </div>
        </div>

        {/* 3-Bucket Placement Framework */}
        <div className="space-y-3 pt-2">
          <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Where to Park Your Emergency Vault: The 3-Bucket Strategy
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
            <div className="p-4 rounded-2xl border border-[#e8e0d1] bg-white space-y-1.5">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f4efe4] text-[#866632] text-[10px] font-bold">
                  1
                </span>
                Bucket 1: 1 Month Living Cash
              </span>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Park inside your primary Savings Bank Account with active Debit Card / UPI for instantaneous medical or midnight emergency access.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[#e8e0d1] bg-white space-y-1.5">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f4efe4] text-[#866632] text-[10px] font-bold">
                  2
                </span>
                Bucket 2: 2–3 Months Auto-Sweep FD
              </span>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Set up Bank Auto-Sweep Fixed Deposits yielding 7.0–7.5% interest that automatically break and credit to your account without penalties.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-[#e8e0d1] bg-white space-y-1.5">
              <span className="font-extrabold text-slate-900 flex items-center gap-1.5">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#f4efe4] text-[#866632] text-[10px] font-bold">
                  3
                </span>
                Bucket 3: 2–3 Months Liquid Fund
              </span>
              <p className="text-[11px] text-slate-600 font-medium leading-relaxed">
                Invest in Institutional Liquid Mutual Funds with instant redemption up to ₹50,000 within 30 minutes, keeping your money beating inflation.
              </p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
