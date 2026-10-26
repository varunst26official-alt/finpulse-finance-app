import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  LayoutDashboard,
  PieChart,
  ArrowLeftRight,
  Calculator,
  ShieldCheck,
  TrendingUp,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useFinanceStore();

  const navItems = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'investments', label: 'Holdings & Allocation', icon: PieChart },
    { id: 'transactions', label: 'Transactions Ledger', icon: ArrowLeftRight },
    { id: 'goals', label: 'SIP & Wealth Calculator', icon: Calculator },
  ] as const;

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between hidden md:flex shrink-0">
      <div className="space-y-6">
        {/* Navigation Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Portfolio Navigation
          </div>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-emerald-400' : 'text-slate-500'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Index Tickers (Simulated Market Pulse) */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3.5 space-y-2.5">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-semibold">
            <span>Market Benchmark</span>
            <span className="flex items-center text-emerald-400 gap-0.5">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">NIFTY 50</span>
            <span className="font-mono text-emerald-400 font-bold">24,850 (+0.84%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">S&P 500</span>
            <span className="font-mono text-emerald-400 font-bold">5,820 (+0.42%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Gold (USD/oz)</span>
            <span className="font-mono text-emerald-400 font-bold">$2,735 (+1.10%)</span>
          </div>
        </div>
      </div>

      {/* Security & Health Rating Badge */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-3.5 text-center">
        <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
          <ShieldCheck className="h-4 w-4" />
          <span>Balanced Allocation</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Diversified across 6 asset classes. Inflation risk mitigated.
        </p>
      </div>
    </aside>
  );
};
