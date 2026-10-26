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
      gradient: 'from-[#fcfbfa] to-[#f7f3ea]',
      borderColor: 'border-[#e4d9c7]',
      iconBg: 'bg-[#9c783e]/15 text-[#866632]',
    },
    {
      title: 'Total Invested Capital',
      value: formatCurrency(summary.totalInvested, currency),
      subtext: 'Principal cost across all 8 assets',
      isPositive: null,
      icon: DollarSign,
      gradient: 'from-[#fcfbfa] to-[#f4f2ee]',
      borderColor: 'border-[#e4d9c7]',
      iconBg: 'bg-[#6b6455]/15 text-[#544e43]',
    },
    {
      title: 'Unrealized Returns (P&L)',
      value: formatCurrency(summary.totalUnrealizedPnL, currency),
      subtext: `${formatPercentage(summary.pnlPercentage)} overall return on capital`,
      isPositive: isProfit,
      icon: TrendingUp,
      gradient: isProfit ? 'from-[#fcfbfa] to-[#f0f7f3]' : 'from-[#fcfbfa] to-[#fdf2f2]',
      borderColor: isProfit ? 'border-[#c6e4d2]' : 'border-[#fcd4d4]',
      iconBg: isProfit ? 'bg-[#2d6a4f]/15 text-[#2d6a4f]' : 'bg-rose-100 text-rose-700',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <div
            key={i}
            className={`rounded-2xl border ${card.borderColor} bg-gradient-to-b ${card.gradient} p-5 shadow-xs flex flex-col justify-between transition-all hover:shadow-md hover:border-[#d9cbaf]`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-[#786e5e] uppercase tracking-wider font-mono">
                {card.title}
              </span>
              <div className={`p-2 rounded-xl ${card.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-[#2b2823] tracking-tight">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-medium">
                {card.isPositive !== null && (
                  <span
                    className={`inline-flex items-center text-[11px] font-bold font-mono px-1.5 py-0.5 rounded-md ${
                      card.isPositive
                        ? 'bg-[#2d6a4f]/10 text-[#2d6a4f]'
                        : 'bg-rose-100 text-rose-700'
                    }`}
                  >
                    <ArrowUpRight className={`h-3 w-3 ${card.isPositive ? '' : 'rotate-90'}`} />
                  </span>
                )}
                <span className="text-[#6b6455] font-mono text-[11px]">{card.subtext}</span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
