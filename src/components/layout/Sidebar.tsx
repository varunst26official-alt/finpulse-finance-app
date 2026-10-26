import React from 'react';
import { useFinanceStore, NavigationTab } from '@/stores/financeStore';
import {
  LayoutDashboard,
  PieChart,
  ArrowLeftRight,
  Calculator,
  ShieldCheck,
  TrendingUp,
  CalendarDays,
} from 'lucide-react';
import { motion } from 'framer-motion';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useFinanceStore();

  const primaryNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'investments', label: 'Holdings & Allocation', icon: PieChart },
    { id: 'transactions', label: 'Transactions Ledger', icon: ArrowLeftRight },
    { id: 'calendar', label: 'Financial Calendar', icon: CalendarDays },
    { id: 'goals', label: 'SIP & Wealth Planner', icon: Calculator },
  ];

  return (
    <aside className="w-64 border-r border-[#e8e0d1] bg-white/70 p-4 flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto">
      <div className="space-y-6">
        {/* Core Portfolio Navigation */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Portfolio Management
          </div>
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <motion.button
                  whileTap={{ scale: 0.98 }}
                  key={item.id}
                  id={item.id === 'calendar' ? 'tour-calendar-nav' : undefined}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#9e783e] text-white shadow-xs'
                      : 'text-slate-700 hover:text-slate-900 hover:bg-[#f5efe4]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                  <span>{item.label}</span>
                </motion.button>
              );
            })}
          </nav>
        </div>

        {/* Live Market Benchmark */}
        <div className="rounded-2xl border border-[#e8e0d1] bg-[#faf8f5] p-3.5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold">
            <span>Market Benchmark</span>
            <span className="flex items-center text-emerald-700 gap-1 font-extrabold">
              <TrendingUp className="h-3.5 w-3.5" /> Live
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium">NIFTY 50</span>
            <span className="text-emerald-700 font-bold">24,850 (+0.8%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium">Gold (oz)</span>
            <span className="text-emerald-700 font-bold">$2,735 (+1.1%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-700 font-medium">Bitcoin</span>
            <span className="text-emerald-700 font-bold">$68,400 (+2.4%)</span>
          </div>
        </div>
      </div>

      {/* Security Rating Badge */}
      <div className="rounded-2xl border border-[#e8e0d1] bg-[#fbf9f5] p-3 text-center mt-4">
        <div className="flex items-center justify-center gap-1.5 text-[#866632] text-xs font-bold mb-1">
          <ShieldCheck className="h-4 w-4" />
          <span>One-Stop Financial OS</span>
        </div>
        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">
          Simplified, responsive & encrypted portfolio tracker.
        </p>
      </div>
    </aside>
  );
};
