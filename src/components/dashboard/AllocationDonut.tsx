import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { AssetCategory } from '@/types/finance';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_LABELS } from '@/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';

interface AllocationItem {
  name: string;
  category: AssetCategory;
  value: number;
  percentage: number;
  color: string;
}

export const AllocationDonut: React.FC = () => {
  const { getPortfolioSummary, currency } = useFinanceStore();
  const summary = getPortfolioSummary();

  const data: AllocationItem[] = summary.allocationBreakdown.map((item) => ({
    name: CATEGORY_LABELS[item.category] || item.category,
    category: item.category,
    value: item.currentValue,
    percentage: item.percentage,
    color: CATEGORY_COLORS[item.category] || '#6366f1',
  }));

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs flex flex-col justify-between shadow-xs">
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base font-bold text-white flex items-center gap-2">
          <PieIcon className="h-4 w-4 text-indigo-400" />
          Asset Class Allocation
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Portfolio risk distribution & diversification
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
        {/* Donut Chart */}
        <div className="h-48 w-full relative">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={50}
                outerRadius={75}
                paddingAngle={3}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                ))}
              </Pie>
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const item = payload[0].payload;
                    return (
                      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-2.5 shadow-xl font-mono text-xs">
                        <div className="font-bold text-white">{item.name}</div>
                        <div className="text-emerald-400">{formatCurrency(item.value, currency)}</div>
                        <div className="text-slate-400 text-[11px]">{item.percentage.toFixed(1)}% of portfolio</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
          <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
            <span className="text-[10px] font-mono text-slate-400 font-semibold uppercase">Assets</span>
            <span className="text-sm font-bold text-white">{data.length} Classes</span>
          </div>
        </div>

        {/* Legend List */}
        <div className="space-y-2">
          {data.map((item, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }}></span>
                <span className="text-slate-300 truncate max-w-[110px]">{item.name}</span>
              </div>
              <div className="text-right">
                <span className="font-bold text-white">{item.percentage.toFixed(1)}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
