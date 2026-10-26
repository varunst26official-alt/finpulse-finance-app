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

  const chartData = history.map((pt: HistoricalDataPoint) => ({
    date: pt.date,
    netWorth: Math.round(pt.netWorth * config.rateFromUSD),
    invested: Math.round(pt.invested * config.rateFromUSD),
  }));

  return (
    <div className="rounded-2xl border border-[#e8dfcf] bg-white p-5 shadow-xs flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-base font-bold text-[#2b2823] flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-[#2d6a4f]" />
            12-Month Net Worth Trajectory
          </h3>
          <p className="text-xs text-[#786e5e] font-mono mt-0.5">
            Compound growth vs cumulative invested capital
          </p>
        </div>
        <div className="flex items-center gap-3 text-xs font-mono">
          <div className="flex items-center gap-1.5 text-[#2d6a4f] font-bold">
            <span className="h-2 w-2 rounded-full bg-[#2d6a4f]"></span>
            <span>Net Worth</span>
          </div>
          <div className="flex items-center gap-1.5 text-[#9c783e]">
            <span className="h-2 w-2 rounded-full bg-[#9c783e]"></span>
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
                <stop offset="5%" stopColor="#2d6a4f" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#2d6a4f" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="investedGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#9c783e" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#9c783e" stopOpacity={0.0} />
              </linearGradient>
            </defs>

            <CartesianGrid strokeDasharray="3 3" stroke="#f0ebe1" vertical={false} />

            <XAxis
              dataKey="date"
              stroke="#8c8273"
              fontSize={11}
              fontFamily="monospace"
              tickLine={false}
              axisLine={false}
            />

            <YAxis
              stroke="#8c8273"
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
                    <div className="rounded-xl border border-[#ded3bf] bg-white p-3 shadow-lg font-mono text-xs space-y-1">
                      <div className="text-[#786e5e] font-semibold mb-1">{label}</div>
                      <div className="flex justify-between gap-4 text-[#2d6a4f] font-bold">
                        <span>Net Worth:</span>
                        <span>
                          {formatCurrency(
                            (payload[0].value as number) / config.rateFromUSD,
                            currency
                          )}
                        </span>
                      </div>
                      <div className="flex justify-between gap-4 text-[#9c783e]">
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
              stroke="#2d6a4f"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#netWorthGrad)"
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#9c783e"
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
