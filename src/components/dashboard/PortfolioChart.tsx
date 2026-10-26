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

export const PortfolioChart: React.FC = () => {
  const { history, currency } = useFinanceStore();
  const config = CURRENCY_CONFIGS[currency];

  // Convert USD history data points to current selected display currency
  const chartData = history.map((pt: HistoricalDataPoint) => ({
    date: pt.date,
    netWorth: Math.round(pt.netWorth * config.rateFromUSD),
    invested: Math.round(pt.invested * config.rateFromUSD),
  }));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs flex flex-col justify-between shadow-xs">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-400" />
            12-Month Net Worth Trajectory
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Compound growth vs cumulative invested capital
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
            <span>Net Worth</span>
          </div>
          <div className="flex items-center gap-1.5 text-indigo-400">
            <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
            <span>Invested</span>
          </div>
        </div>
      </div>

      {/* Recharts Area Container */}
      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="netWorthGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#6366f1" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#64748b"
              fontSize={11}
              fontFamily="monospace"
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
                    <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md font-mono text-xs space-y-1">
                      <div className="text-slate-400 font-semibold mb-1">{label}</div>
                      <div className="flex justify-between gap-4 text-emerald-400 font-bold">
                        <span>Net Worth:</span>
                        <span>{formatCurrency(payload[0].value as number / config.rateFromUSD, currency)}</span>
                      </div>
                      <div className="flex justify-between gap-4 text-indigo-400">
                        <span>Invested:</span>
                        <span>{formatCurrency(payload[1].value as number / config.rateFromUSD, currency)}</span>
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
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#netWorthGrad)"
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#6366f1"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#investedGrad)"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
