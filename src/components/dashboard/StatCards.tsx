import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { Wallet, TrendingUp, ArrowUpRight, DollarSign } from 'lucide-react';

export const StatCards: React.FC = () => {
  const { currency, getPortfolioSummary } = useFinanceStore();
  const summary = getPortfolioSummary();

  const isProfit = summary.totalUnrealizedPnL >= 0;

  const cards = [
    {
      title: 'Total Net Worth',
      value: formatCurrency(summary.totalNetWorth, currency),
      subtext: `${formatPercentage(summary.todaysChangePercentage)} today (${formatCurrency(summary.todaysChange, currency)})`,
      isPositive: true,
      icon: Wallet,
      gradient: 'from-emerald-500/10 to-teal-500/5',
      borderColor: 'border-emerald-500/30',
      iconBg: 'bg-emerald-500/20 text-emerald-400',
    },
    {
      title: 'Total Invested Capital',
      value: formatCurrency(summary.totalInvested, currency),
      subtext: 'Principal cost across all 8 assets',
      isPositive: null,
      icon: DollarSign,
      gradient: 'from-indigo-500/10 to-blue-500/5',
      borderColor: 'border-indigo-500/30',
      iconBg: 'bg-indigo-500/20 text-indigo-400',
    },
    {
      title: 'Unrealized Returns (P&L)',
      value: formatCurrency(summary.totalUnrealizedPnL, currency),
      subtext: `${formatPercentage(summary.pnlPercentage)} overall return on capital`,
      isPositive: isProfit,
      icon: TrendingUp,
      gradient: isProfit ? 'from-emerald-500/10 to-emerald-600/5' : 'from-rose-500/10 to-rose-600/5',
      borderColor: isProfit ? 'border-emerald-500/30' : 'border-rose-500/30',
      iconBg: isProfit ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`rounded-2xl border ${card.borderColor} bg-gradient-to-b ${card.gradient} bg-slate-900/60 p-5 backdrop-blur-xs flex flex-col justify-between shadow-xs transition-all hover:border-slate-600`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider font-mono">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-white tracking-tight">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                {card.isPositive !== null && (
                  <span
                    className={`inline-flex items-center text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                      card.isPositive
                        ? 'bg-emerald-500/20 text-emerald-400'
                        : 'bg-rose-500/20 text-rose-400'
                    }`}
                  >
                    <ArrowUpRight className={`h-3 w-3 ${card.isPositive ? '' : 'rotate-90'}`} />
                  </span>
                )}
                <span className="text-slate-400 font-mono text-[11px]">{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
