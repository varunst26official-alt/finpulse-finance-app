import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { HistoricalDataPoint } from '@/types/finance';
import { formatCurrency, CURRENCY_CONFIGS } from '@/utils/formatters';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp } from 'lucide-react';
import { motion } from 'framer-motion';

export const PortfolioChart: React.FC = () => {
  const { history, currency } = useFinanceStore();
  const config = CURRENCY_CONFIGS[currency];

  const chartData = history.map((pt: HistoricalDataPoint) => ({
    date: pt.date,
    netWorth: Math.round(pt.netWorth * config.rateFromUSD),
    invested: Math.round(pt.invested * config.rateFromUSD),
  }));

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-[#e8e0d1] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
    >
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-700" />
            12-Month Net Worth Trajectory
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Historical compound growth versus cumulative invested capital
          </p>
        </div>
        <div className="flex items-center gap-4 text-xs font-semibold">
          <div className="flex items-center gap-1.5 text-emerald-700">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-600"></span>
            <span>Net Worth</span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-800">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-600"></span>
            <span>Invested</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-72 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#15803d" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#15803d" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#b45309" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#b45309" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#64748b"
              fontSize={12}
              fontWeight={600}
              tickLine={false}
              axisLine={false}
              tickFormatter={(value) => {
                if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                if (value >= 1000) return `${(value / 1000).toFixed(0)}k`;
                return `${value}`;
              }}
            />

            <Tooltip
              content={({ active, payload, label }) => {
                if (active && payload && payload.length) {
                  return (
                    <div className="rounded-xl border border-[#e2d8c7] bg-white p-3.5 shadow-xl text-xs space-y-1.5">
                      <div className="text-slate-500 font-bold mb-1">{label}</div>
                      <div className="flex justify-between gap-6 text-emerald-800 font-extrabold text-sm">
                        <span>Net Worth:</span>
                        <span>
                          {formatCurrency(
                            (payload[0].value as number) / config.rateFromUSD,
                            currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-6 text-amber-900 font-semibold">
                        <span>Invested:</span>
                        <span>
                          {formatCurrency(
                            (payload[1].value as number) / config.rateFromUSD,
                            currency
                          )}
                        </span>
                      </div>
                    </div>
                  );
                }
                return null;
              }}
            />

            <Area
              type="monotone"
              dataKey="netWorth"
              stroke="#15803d"
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#netWorthGrad)"
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#b45309"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#investedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
};
