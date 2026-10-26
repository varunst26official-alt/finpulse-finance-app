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
      badgeColor: 'bg-[#9c783e]/15 text-[#866632] border-[#ded3bf]',
    },
    {
      id: 'predictions',
      label: 'AI Stock Forecaster',
      icon: Sparkles,
      badge: 'Monte Carlo',
      badgeColor: 'bg-[#9c783e]/15 text-[#866632] border-[#ded3bf]',
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
      badgeColor: 'bg-amber-100 text-amber-800 border-amber-300',
    },
  ];

  return (
    <aside className="w-64 border-r border-[#e8dfcf] bg-white/70 p-4 flex flex-col justify-between hidden md:flex shrink-0 overflow-y-auto">
      <div className="space-y-6">
        {/* Core Portfolio Navigation */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#786e5e]">
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
                      ? 'bg-[#f4efe4] text-[#866632] border border-[#ded3bf] font-bold shadow-xs'
                      : 'text-[#5e574c] hover:text-[#2b2823] hover:bg-[#f7f4ee]'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-[#866632]' : 'text-[#8d8373]'}`} />
                  {item.label}
                </button>
              );
            })}
          </nav>
        </div>

        {/* AI & Market Intelligence Section */}
        <div>
          <div className="px-3 mb-2 text-[10px] font-mono font-bold uppercase tracking-wider text-[#786e5e] flex items-center justify-between">
            <span>AI & Market Intel</span>
            <span className="text-[9px] px-1.5 py-0.2 rounded bg-[#f4efe4] text-[#866632] font-bold border border-[#ded3bf]">
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
                      ? 'bg-[#f4efe4] text-[#866632] border border-[#ded3bf] font-bold shadow-xs'
                      : 'text-[#5e574c] hover:text-[#2b2823] hover:bg-[#f7f4ee]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`h-4 w-4 ${isActive ? 'text-[#866632]' : 'text-[#8d8373]'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-mono font-bold px-1.5 py-0.5 rounded border ${
                        item.badgeColor || 'bg-[#f5efe4] text-[#786e5e]'
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

        {/* Live Market Benchmark */}
        <div className="rounded-2xl border border-[#e8dfcf] bg-[#faf8f5] p-3 space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-[#786e5e] font-semibold">
            <span>Market Benchmark</span>
            <span className="flex items-center text-[#2d6a4f] gap-0.5 font-bold">
              <TrendingUp className="h-3 w-3" /> Live
            </span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#443f36] font-medium">NIFTY 50</span>
            <span className="font-mono text-[#2d6a4f] font-bold">24,850 (+0.8%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#443f36] font-medium">Gold (oz)</span>
            <span className="font-mono text-[#2d6a4f] font-bold">$2,735 (+1.1%)</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-[#443f36] font-medium">Bitcoin</span>
            <span className="font-mono text-[#2d6a4f] font-bold">$68,400 (+2.4%)</span>
          </div>
        </div>
      </div>

      {/* Security Rating Badge */}
      <div className="rounded-2xl border border-[#e8dfcf] bg-[#fdfbf7] p-3 text-center mt-4">
        <div className="flex items-center justify-center gap-1.5 text-[#866632] text-xs font-bold mb-1">
          <ShieldCheck className="h-4 w-4" />
          <span>One-Stop Financial OS</span>
        </div>
        <p className="text-[10px] text-[#786e5e] leading-relaxed font-mono">
          Private, simplified & encrypted portfolio management.
        </p>
      </div>
    </aside>
  );
};
