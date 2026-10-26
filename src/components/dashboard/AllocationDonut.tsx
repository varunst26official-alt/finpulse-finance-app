import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { AssetCategory } from '@/types/finance';
import { formatCurrency, CATEGORY_COLORS, CATEGORY_LABELS } from '@/utils/formatters';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { PieChart as PieIcon } from 'lucide-react';
import { motion } from 'framer-motion';

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
    color: CATEGORY_COLORS[item.category] || '#9e783e',
  }));

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-[#e8e0d1] bg-white p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
    >
      {/* Header */}
      <div className="mb-4">
        <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
          <PieIcon className="h-5 w-5 text-[#9e783e]" />
          Asset Class Allocation
        </h3>
        <p className="text-xs text-slate-600 mt-0.5">
          Portfolio risk distribution & diversification
        </p>
      </div>

      {data.length === 0 ? (
        <div className="h-52 w-full flex flex-col items-center justify-center text-center p-4 bg-[#faf8f5]/60 rounded-2xl border border-dashed border-[#e8e0d1]">
          <div className="p-3 rounded-2xl bg-white border border-[#e8e0d1] text-[#9e783e] mb-2 shadow-xs">
            <PieIcon className="h-5 w-5" />
          </div>
          <h4 className="text-xs font-bold text-slate-900 mb-0.5">Asset Diversification</h4>
          <p className="text-[11px] text-slate-500 max-w-[200px] leading-snug mb-2 font-medium">
            Log stocks, mutual funds, gold, or real estate to visualize your allocation.
          </p>
          <span className="text-[10px] font-bold text-[#866632] bg-[#f4efe4] px-2.5 py-0.5 rounded-md border border-[#ded3bf]">
            0 Asset Classes
          </span>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
          {/* Donut Chart */}
          <div className="h-52 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#ffffff" strokeWidth={2.5} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const item = payload[0].payload;
                      return (
                        <div className="rounded-xl border border-[#e2d8c7] bg-white p-3 shadow-xl text-xs space-y-1">
                          <div className="font-extrabold text-slate-900">{item.name}</div>
                          <div className="text-emerald-800 font-bold text-sm">
                            {formatCurrency(item.value, currency)}
                          </div>
                          <div className="text-slate-500 font-semibold">
                            {item.percentage.toFixed(1)}% of total portfolio
                          </div>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Classes
              </span>
              <span className="text-base font-extrabold text-slate-900">{data.length} Types</span>
            </div>
          </div>

          {/* Legend List */}
          <div className="space-y-2.5">
            {data.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2.5">
                  <span
                    className="h-3 w-3 rounded-full shrink-0 shadow-xs"
                    style={{ backgroundColor: item.color }}
                  ></span>
                  <span className="font-semibold text-slate-800 truncate max-w-[120px]">
                    {item.name}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-slate-900">{item.percentage.toFixed(1)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};
