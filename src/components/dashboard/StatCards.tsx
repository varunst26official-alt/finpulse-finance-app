import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, formatPercentage } from '@/utils/formatters';
import { Wallet, TrendingUp, ArrowUpRight, DollarSign, PiggyBank } from 'lucide-react';
import { motion } from 'framer-motion';

export const StatCards: React.FC = () => {
  const { currency, assets, getPortfolioSummary } = useFinanceStore();
  const summary = getPortfolioSummary();

  const isProfit = summary.totalUnrealizedPnL >= 0;
  const monthlySurplus = summary.totalMonthlyIncome - summary.totalMonthlyExpenses;

  const cards = [
    {
      title: 'Total Net Worth',
      value: formatCurrency(summary.totalNetWorth, currency),
      subtext: assets.length > 0
        ? `${formatPercentage(summary.todaysChangePercentage)} today (${formatCurrency(summary.todaysChange, currency)})`
        : 'Fresh 0-balance portfolio • Ready for entries',
      isPositive: assets.length > 0 ? true : null,
      icon: Wallet,
      gradient: 'from-[#ffffff] to-[#faf7f0]',
      borderColor: 'border-[#e8e0d1]',
      iconBg: 'bg-[#9e783e]/15 text-[#866632]',
    },
    {
      title: 'Total Invested Capital',
      value: formatCurrency(summary.totalInvested, currency),
      subtext: assets.length > 0
        ? `Principal cost basis across ${assets.length} multi-asset holdings`
        : '0 holdings recorded • Click + Add Trade',
      isPositive: null,
      icon: DollarSign,
      gradient: 'from-[#ffffff] to-[#f8f6f0]',
      borderColor: 'border-[#e8e0d1]',
      iconBg: 'bg-slate-100 text-slate-700',
    },
    {
      title: 'Unrealized Returns (P&L)',
      value: formatCurrency(summary.totalUnrealizedPnL, currency),
      subtext: assets.length > 0
        ? `${formatPercentage(summary.pnlPercentage)} overall return on capital`
        : '0.00% capital growth • No active risk',
      isPositive: assets.length > 0 ? isProfit : null,
      icon: TrendingUp,
      gradient: isProfit ? 'from-[#ffffff] to-[#f2faf5]' : 'from-[#ffffff] to-[#fdf2f2]',
      borderColor: isProfit ? 'border-[#bbf7d0]' : 'border-[#fecaca]',
      iconBg: isProfit ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800',
    },
    {
      title: 'Monthly Savings Rate',
      value: `${summary.monthlySavingsRate.toFixed(1)}%`,
      subtext: `${formatCurrency(monthlySurplus, currency)} net monthly surplus`,
      isPositive: monthlySurplus >= 0,
      icon: PiggyBank,
      gradient: 'from-[#ffffff] to-[#f5fbf7]',
      borderColor: 'border-[#bbf7d0]',
      iconBg: 'bg-emerald-100 text-emerald-800',
    },
  ];

  return (
    <div id="tour-kpi-cards" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={i}
            whileHover={{ y: -3, transition: { duration: 0.2 } }}
            className={`rounded-2xl border ${card.borderColor} bg-gradient-to-b ${card.gradient} p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between`}
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                {card.title}
              </span>
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <Icon className="h-4 w-4" />
              </div>
            </div>

            <div>
              <div className="text-2xl sm:text-3xl font-heading font-extrabold text-slate-900 tracking-tight font-mono">
                {card.value}
              </div>
              <div className="flex items-center gap-1.5 mt-2 text-xs font-semibold">
                {card.isPositive !== null && (
                  <span
                    className={`inline-flex items-center text-[10px] font-bold px-1.5 py-0.5 rounded-md ${
                      card.isPositive
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    <ArrowUpRight className={`h-3 w-3 ${card.isPositive ? '' : 'rotate-90'}`} />
                  </span>
                )}
                <span className="text-slate-600 truncate">{card.subtext}</span>
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};
