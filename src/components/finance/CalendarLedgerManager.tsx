import React, { useState } from 'react';
import { FinancialCalendarWidget } from '@/components/calendar/FinancialCalendarWidget';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import {
  CalendarDays,
  ArrowLeftRight,
  Sparkles,
  Columns,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type CalendarLedgerView = 'CALENDAR' | 'LEDGER' | 'UNIFIED';

interface CalendarLedgerManagerProps {
  initialView?: 'calendar' | 'ledger' | 'unified';
}

export const CalendarLedgerManager: React.FC<CalendarLedgerManagerProps> = ({
  initialView = 'calendar',
}) => {
  const [activeView, setActiveView] = useState<CalendarLedgerView>(() => {
    if (initialView === 'ledger') return 'LEDGER';
    if (initialView === 'unified') return 'UNIFIED';
    return 'CALENDAR';
  });

  return (
    <div className="space-y-6">
      {/* Top Combined View Switcher Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#16836b] text-white shadow-md shadow-[#16836b]/20">
            <CalendarDays className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
                Financial Calendar & Transactions Ledger
              </h3>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-bold text-[#16836b] bg-[#e5f5ef] px-2 py-0.5 rounded-full border border-[#16836b]/20">
                <Sparkles className="w-3 h-3" /> Unified Hub
              </span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              Scheduled payment obligations, SIPs, EMIs, and historical transaction ledgers combined
            </p>
          </div>
        </div>

        {/* View Switcher Controls */}
        <div className="flex items-center gap-1.5 p-1 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs font-bold self-start sm:self-auto shadow-2xs">
          <button
            onClick={() => setActiveView('CALENDAR')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'CALENDAR'
                ? 'bg-[#16836b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Calendar Planner</span>
          </button>

          <button
            onClick={() => setActiveView('LEDGER')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'LEDGER'
                ? 'bg-[#16836b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
            }`}
          >
            <ArrowLeftRight className="w-3.5 h-3.5" />
            <span>Transactions & Ledger</span>
          </button>

          <button
            onClick={() => setActiveView('UNIFIED')}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl transition-all cursor-pointer ${
              activeView === 'UNIFIED'
                ? 'bg-[#16836b] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-[#f0ebe1]'
            }`}
            title="View both Calendar obligations and Transactions Ledger together"
          >
            <Columns className="w-3.5 h-3.5" />
            <span>Combined View</span>
          </button>
        </div>
      </div>

      {/* Render Active View with smooth animations */}
      <AnimatePresence mode="wait">
        {activeView === 'CALENDAR' && (
          <motion.div
            key="calendar-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <FinancialCalendarWidget />
          </motion.div>
        )}

        {activeView === 'LEDGER' && (
          <motion.div
            key="ledger-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
          >
            <TransactionTable />
          </motion.div>
        )}

        {activeView === 'UNIFIED' && (
          <motion.div
            key="unified-view"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            transition={{ duration: 0.2 }}
            className="space-y-8"
          >
            <FinancialCalendarWidget />
            <div className="pt-2 border-t border-[#e8e0d1]">
              <TransactionTable />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
