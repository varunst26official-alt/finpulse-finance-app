import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { formatCurrency } from '@/utils/formatters';
import { DebtRepaymentManager } from '@/components/debts/DebtRepaymentManager';
import { InsuranceManager } from '@/components/insurance/InsuranceManager';
import { EmergencyVaultHealthScore } from '@/components/health/EmergencyVaultHealthScore';
import {
  Landmark,
  ShieldCheck,
  Activity,
  CalendarDays,
  ArrowRight,
  HeartPulse,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type CommitmentsSubTab = 'debts' | 'insurance' | 'health';

interface CommitmentsVaultManagerProps {
  initialSubTab?: CommitmentsSubTab;
}

export const CommitmentsVaultManager: React.FC<CommitmentsVaultManagerProps> = ({
  initialSubTab = 'debts',
}) => {
  const [activeTab, setActiveTab] = useState<CommitmentsSubTab>(initialSubTab);
  const { debts, policies, currency, getPortfolioSummary } = useFinanceStore();
  const { setFinanceSubTab } = useLifeOSStore();
  const summary = getPortfolioSummary();

  // Metrics
  const totalDebt = debts.reduce((sum, d) => sum + d.currentOutstanding, 0);
  const totalMonthlyEmi = debts.reduce((sum, d) => sum + d.monthlyEmi, 0);
  const totalSumAssured = policies.reduce((sum, p) => sum + p.sumAssured, 0);
  const activePoliciesCount = policies.filter((p) => p.status === 'ACTIVE' || p.status === 'DUE_SOON').length;

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Combined Metrics Overview */}
      <div className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5 mb-1.5">
              <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500/15 via-rose-500/15 to-emerald-500/15 text-slate-800 border border-[#e8e0d1]">
                <ShieldCheck className="h-6 w-6 text-[#9e783e]" />
              </div>
              <div>
                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                  Debts, Protection & Financial Vault
                </h2>
                <span className="text-xs font-semibold text-[#866632] bg-[#f4efe4] px-2.5 py-0.5 rounded-md border border-[#ded3bf]">
                  Unified Liability, Insurance & Resilience Suite
                </span>
              </div>
            </div>
            <p className="text-xs text-slate-600 mt-2 max-w-2xl font-medium leading-relaxed">
              Consolidated center to manage credit obligations, insurance policies, and emergency safety nets.
              Scheduled loan EMIs and policy renewals automatically sync to your Financial Calendar.
            </p>
          </div>

          <button
            onClick={() => setFinanceSubTab('calendar')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#faf8f5] hover:bg-[#f2ece1] border border-[#ded3bf] text-slate-800 text-xs font-bold transition-all cursor-pointer shrink-0"
          >
            <CalendarDays className="h-4 w-4 text-[#9e783e]" />
            <span>View Due Dates in Calendar</span>
            <ArrowRight className="h-3.5 w-3.5 text-slate-500" />
          </button>
        </div>

        {/* 3 Summary Pillar Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 pt-2 border-t border-[#f2ece1]">
          {/* Card 1: Debts & EMIs */}
          <div
            onClick={() => setActiveTab('debts')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'debts'
                ? 'bg-rose-50/50 border-rose-300 ring-2 ring-rose-500/20'
                : 'bg-[#faf8f5] border-[#e8e0d1] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold">
              <span className="flex items-center gap-1.5 text-rose-700">
                <Landmark className="h-3.5 w-3.5" /> Debts & EMIs
              </span>
              <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-rose-200">
                {debts.length} active loans
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
              {formatCurrency(totalDebt, currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Monthly EMI: <span className="font-bold text-rose-600">{formatCurrency(totalMonthlyEmi, currency)}</span>
            </div>
          </div>

          {/* Card 2: Protection & Insurance */}
          <div
            onClick={() => setActiveTab('insurance')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'insurance'
                ? 'bg-sky-50/50 border-sky-300 ring-2 ring-sky-500/20'
                : 'bg-[#faf8f5] border-[#e8e0d1] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold">
              <span className="flex items-center gap-1.5 text-sky-700">
                <HeartPulse className="h-3.5 w-3.5" /> Total Coverage
              </span>
              <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-sky-200">
                {activePoliciesCount} policies
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
              {formatCurrency(totalSumAssured, currency)}
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Life & health protection coverage
            </div>
          </div>

          {/* Card 3: Health Score & Vault */}
          <div
            onClick={() => setActiveTab('health')}
            className={`p-4 rounded-2xl border transition-all cursor-pointer ${
              activeTab === 'health'
                ? 'bg-emerald-50/50 border-emerald-300 ring-2 ring-emerald-500/20'
                : 'bg-[#faf8f5] border-[#e8e0d1] hover:border-slate-300'
            }`}
          >
            <div className="flex items-center justify-between text-xs text-slate-500 mb-1 font-semibold">
              <span className="flex items-center gap-1.5 text-emerald-700">
                <Activity className="h-3.5 w-3.5" /> Health & Vault
              </span>
              <span className="font-mono text-[11px] bg-white px-1.5 py-0.5 rounded border border-emerald-200">
                Resilience
              </span>
            </div>
            <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 flex items-center gap-2">
              <span>{summary.liquidRunwayMonths.toFixed(1)} Mo Runway</span>
              <span className="text-xs px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold">
                Healthy
              </span>
            </div>
            <div className="text-[11px] text-slate-500 mt-0.5">
              Emergency survival liquid reserve
            </div>
          </div>
        </div>

        {/* 2. Sub-tab Navigation Switcher */}
        <div className="flex items-center gap-2 pt-2 border-t border-[#f2ece1]">
          {[
            { id: 'debts' as const, label: 'Debts & Repayments', icon: Landmark, badge: `${debts.length}` },
            { id: 'insurance' as const, label: 'Protection & Insurance', icon: HeartPulse, badge: `${policies.length}` },
            { id: 'health' as const, label: 'Health Score & Vault', icon: Activity, badge: 'Score' },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#9e783e] text-white shadow-xs'
                    : 'bg-[#faf8f5] text-slate-600 hover:text-slate-900 hover:bg-[#f2ece1] border border-[#e8e0d1]'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                <span
                  className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                    isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                  }`}
                >
                  {tab.badge}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Sub-View Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
        >
          {activeTab === 'debts' && <DebtRepaymentManager />}
          {activeTab === 'insurance' && <InsuranceManager />}
          {activeTab === 'health' && <EmergencyVaultHealthScore />}
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
