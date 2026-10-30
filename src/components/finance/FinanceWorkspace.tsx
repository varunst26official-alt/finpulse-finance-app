import React from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { FinanceSubTab } from '@/types/lifeos';
import { SectionHero } from '@/components/layout/SectionHero';
import { StatCards } from '@/components/dashboard/StatCards';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { AllocationDonut } from '@/components/dashboard/AllocationDonut';
import { HoldingsTable } from '@/components/dashboard/HoldingsTable';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { GoalMilestoneManager } from '@/components/goals/GoalMilestoneManager';
import { SmartIngestionHubModal } from '@/components/finance/SmartIngestionHubModal';
import { BankStatementManager } from '@/components/finance/BankStatementManager';
import { CommitmentsVaultManager } from '@/components/finance/CommitmentsVaultManager';
import { CalendarLedgerManager } from '@/components/finance/CalendarLedgerManager';
import { BillReminder } from '@/components/finance/BillReminder';
import {
  PieChart,
  Landmark,
  ShieldCheck,
  CalendarDays,
  Target,
  LayoutDashboard,
  Plus,
  Zap,
  Bell,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface FinanceWorkspaceProps {
  onOpenAddTradeModal: () => void;
}

export const FinanceWorkspace: React.FC<FinanceWorkspaceProps> = ({
  onOpenAddTradeModal,
}) => {
  const { financeSubTab, setFinanceSubTab } = useLifeOSStore();
  const [isIngestionOpen, setIsIngestionOpen] = React.useState(false);
  const [isBillReminderOpen, setIsBillReminderOpen] = React.useState(false);

  const subTabs: {
    id: FinanceSubTab;
    label: string;
    shortLabel: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'summary', label: 'Overview', shortLabel: 'Overview', icon: LayoutDashboard },
    { id: 'bank-statements', label: 'Bank & UPI Statements', shortLabel: 'Statements', icon: Landmark },
    { id: 'calendar', label: 'Calendar & Ledger', shortLabel: 'Calendar', icon: CalendarDays },
    { id: 'holdings', label: 'Holdings & Allocation', shortLabel: 'Holdings', icon: PieChart },
    { id: 'commitments', label: 'Debts, Protection & Vault', shortLabel: 'Vault', icon: ShieldCheck },
    { id: 'goals', label: 'Goals & Milestones', shortLabel: 'Goals', icon: Target },
  ];

  return (
    <div className="space-y-4 sm:space-y-6 pb-6 sm:pb-8 [padding-bottom:calc(var(--tab-bar-height,56px)+env(safe-area-inset-bottom))]">
      {/* 1. Emerald Hero Banner */}
      <SectionHero
        section="finance"
        onPrimaryAction={onOpenAddTradeModal}
        primaryActionLabel="+ Add Trade"
        onSecondaryAction={() => setFinanceSubTab('calendar')}
        secondaryActionLabel="Open Financial Calendar"
      />

      {/* 2. In-Workspace Sub-module Navigation Pills with Mobile 3x2 Grid */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Mobile Navigation Grid: ALL 6 Sub-Modules Visible Simultaneously */}
        <div className="grid grid-cols-3 gap-1.5 p-1.5 bg-white border border-[#e4e9f1] rounded-2xl shadow-xs sm:hidden w-full">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              financeSubTab === tab.id ||
              (tab.id === 'calendar' && financeSubTab === 'ledger') ||
              (tab.id === 'commitments' &&
                (financeSubTab === 'debts' ||
                  financeSubTab === 'insurance' ||
                  financeSubTab === 'health'));

            return (
              <button
                key={tab.id}
                onClick={() => setFinanceSubTab(tab.id)}
                className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl text-center transition-all cursor-pointer ${
                  isActive
                    ? 'bg-[#16836b] text-white shadow-xs font-bold'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f5f7fb] font-semibold'
                }`}
              >
                <Icon className={`w-4 h-4 mb-1 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="text-[11px] leading-tight tracking-tight">
                  {tab.shortLabel}
                </span>
              </button>
            );
          })}
        </div>

        {/* Desktop Navigation Pills (Full row with scroll if needed) */}
        <div className="hidden sm:flex items-center gap-1.5 overflow-x-auto p-1.5 bg-white border border-[#e4e9f1] rounded-2xl shadow-xs scrollbar-none w-full sm:w-auto min-w-0 max-w-full scroll-smooth">
          {subTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive =
              financeSubTab === tab.id ||
              (tab.id === 'calendar' && financeSubTab === 'ledger') ||
              (tab.id === 'commitments' &&
                (financeSubTab === 'debts' ||
                  financeSubTab === 'insurance' ||
                  financeSubTab === 'health'));

            return (
              <button
                key={tab.id}
                onClick={() => setFinanceSubTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                  isActive
                    ? 'bg-[#16836b] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f5f7fb]'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
          <button
            onClick={() => setIsIngestionOpen(true)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white text-xs font-extrabold shadow-sm shadow-indigo-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300 shrink-0" />
            <span className="hidden sm:inline">⚡ Auto-Import (Demat & UPI)</span>
            <span className="sm:hidden">⚡ Statement Hub</span>
          </button>

          <button
            onClick={() => setIsBillReminderOpen(true)}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 shadow-sm shadow-amber-600/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Bell className="w-3.5 h-3.5 shrink-0" />
            <span>Bills</span>
          </button>

          <button
            onClick={onOpenAddTradeModal}
            className="w-full sm:w-auto px-3 sm:px-4 py-2.5 rounded-xl bg-[#16836b] text-white text-xs font-bold hover:bg-[#0f6753] shadow-sm shadow-[#16836b]/20 transition-all cursor-pointer flex items-center justify-center gap-1.5 shrink-0"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>{financeSubTab === 'holdings' ? 'Add Holding' : '+ Record Trade'}</span>
          </button>
        </div>
      </div>

      {/* 3. Sub-module Active View Container with Crossfade */}
      <AnimatePresence mode="wait">
        <motion.div
          key={financeSubTab}
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="space-y-6"
        >
          {/* Sub-tab 1: Summary Overview */}
          {financeSubTab === 'summary' && (
            <>
              <StatCards />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <PortfolioChart />
                </div>
                <div>
                  <AllocationDonut />
                </div>
              </div>
              <TransactionTable />
            </>
          )}

          {/* Sub-tab: Bank & UPI Statements */}
          {financeSubTab === 'bank-statements' && (
            <BankStatementManager onOpenIngestion={() => setIsIngestionOpen(true)} />
          )}

          {/* Sub-tab 3: Combined Financial Calendar & Transactions Ledger */}
          {(financeSubTab === 'calendar' || financeSubTab === 'ledger') && (
            <CalendarLedgerManager
              initialView={financeSubTab === 'ledger' ? 'ledger' : 'calendar'}
            />
          )}

          {/* Sub-tab 4: Holdings & Asset Allocation */}
          {financeSubTab === 'holdings' && (
            <>
              <StatCards />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <HoldingsTable onAddHolding={onOpenAddTradeModal} />
                </div>
                <div>
                  <AllocationDonut />
                </div>
              </div>
            </>
          )}

          {/* Sub-tab 5: Combined Debts, Protection & Vault */}
          {(financeSubTab === 'commitments' ||
            financeSubTab === 'debts' ||
            financeSubTab === 'insurance' ||
            financeSubTab === 'health') && (
            <CommitmentsVaultManager
              initialSubTab={
                financeSubTab === 'insurance'
                  ? 'insurance'
                  : financeSubTab === 'health'
                  ? 'health'
                  : 'debts'
              }
            />
          )}

          {/* Sub-tab 6: Goals & Milestones */}
          {financeSubTab === 'goals' && <GoalMilestoneManager />}
        </motion.div>
      </AnimatePresence>

      {/* Bill Reminder Modal */}
      <BillReminder
        isOpen={isBillReminderOpen}
        onClose={() => setIsBillReminderOpen(false)}
      />

      {/* Quantra Smart Ingestion Hub Modal (Demat CAS, Bank Statement & SMS) */}
      <SmartIngestionHubModal
        isOpen={isIngestionOpen}
        onClose={() => setIsIngestionOpen(false)}
      />
    </div>
  );
};
