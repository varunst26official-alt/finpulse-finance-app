import React from 'react';
import { useFinanceStore, NavigationTab } from '@/stores/financeStore';
import {
  LayoutDashboard,
  PieChart,
  ArrowLeftRight,
  Calculator,
  ShieldCheck,
  TrendingUp,
  Bot,
  Sparkles,
  Newspaper,
  ReceiptText,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab } = useFinanceStore();

  const primaryNavItems: { id: NavigationTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'investments', label: 'Holdings & Allocation', icon: PieChart },
    { id: 'transactions', label: 'Transactions Ledger', icon: ArrowLeftRight },
    { id: 'goals', label: 'SIP & Wealth Planner', icon: Calculator },
  ];

  const intelligenceNavItems: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: string;
    badgeColor?: string;
  }[] = [
    {
      id: 'ai-chat',
      label: 'AI Wealth Copilot',
      icon: Bot,
      badge: 'GPT-4o',
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30',
    },
    {
      id: 'predictions',
      label: 'AI Stock Forecaster',
      icon: Sparkles,
      badge: 'ML 30d',
      badgeColor: 'bg-purple-500/20 text-purple-300 border-purple-500/30',
    },
    {
      id: 'news',
      label: 'Market Intelligence',
      icon: Newspaper,
    },
    {
      id: 'tax',
      label: 'Tax & Capital Gains',
      icon: ReceiptText,
      badge: 'FY 26-27',
      badgeColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
    },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-slate-900/50 p-4 flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto">
      <div className="space-y-6">
        {/* Core Portfolio Navigation */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
            Portfolio Management
          </div>
          <nav className="space-y-1">
            {primaryNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
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

        {/* AI & Market Intelligence Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 flex items-center justify-between">
            <span>AI & Market Intel</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-400 font-bold border border-indigo-500/30">
              PRO
            </span>
          </div>
          <nav className="space-y-1">
            {intelligenceNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-bold shadow-xs'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        item.badgeColor || 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Live Market Pulse Benchmark */}
        <div className="rounded-2xl border border-slate-800 bg-slate-950/40 p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 font-semibold">
            <span>Market Benchmark</span>
            <span className="flex items-center text-emerald-400 gap-0.5">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">NIFTY 50</span>
            <span className="font-mono text-emerald-400 font-bold">24,850 (+0.8%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Gold (oz)</span>
            <span className="font-mono text-emerald-400 font-bold">$2,735 (+1.1%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-300 font-medium">Bitcoin</span>
            <span className="font-mono text-emerald-400 font-bold">$68,400 (+2.4%)</span>
          </div>
        </div>
      </div>

      {/* Security Rating Badge */}
      <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-b from-emerald-500/5 to-transparent p-3 text-center mt-4">
        <div className="flex items-center justify-center gap-1.5 text-emerald-400 text-xs font-bold mb-1">
          <ShieldCheck className="h-4 w-4" />
          <span>One-Stop Financial OS</span>
        </div>
        <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
          All-in-one wealth tracking, AI intelligence & tax optimization.
        </p>
      </div>
    </aside>
  );
};
