import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { Asset } from '@/types/finance';
import {
  formatCurrency,
  formatPercentage,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '@/utils/formatters';
import { Layers, Sparkles, Plus } from 'lucide-react';
import { motion } from 'framer-motion';

interface HoldingsTableProps {
  onAddHolding?: () => void;
}

export const HoldingsTable: React.FC<HoldingsTableProps> = ({ onAddHolding }) => {
  const { assets, currency } = useFinanceStore();

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-[#e8e0d1] bg-white p-4 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-4"
    >
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="h-5 w-5 text-[#9e783e]" />
            Asset Portfolio & Holdings
          </h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Real-time positions, entry price, and unrealized profit & loss
          </p>
        </div>

        {onAddHolding && (
          <button
            onClick={onAddHolding}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9e783e] hover:bg-[#866632] text-white text-xs font-bold transition-all shadow-md shadow-[#9e783e]/20 cursor-pointer hover:scale-[1.02] self-start sm:self-auto shrink-0"
            title="Add a new stock, mutual fund, gold, or investment holding"
          >
            <Plus className="h-4 w-4" />
            <span>+ Add Holding</span>
          </button>
        )}
      </div>

      <div className="overflow-x-auto scrollbar-none">
        <table className="w-full min-w-[620px] text-left text-xs">
          <thead className="border-b border-[#e8e0d1] text-slate-600 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="pb-3 pt-1">Instrument</th>
              <th className="pb-3 pt-1">Asset Class</th>
              <th className="pb-3 pt-1 text-right">Holdings</th>
              <th className="pb-3 pt-1 text-right">Avg Cost</th>
              <th className="pb-3 pt-1 text-right">Current Price</th>
              <th className="pb-3 pt-1 text-right">Total Value</th>
              <th className="pb-3 pt-1 text-right">P&L (%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#f2ece1] text-slate-700">
            {assets.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-12 text-center">
                  <div className="flex flex-col items-center justify-center max-w-sm mx-auto space-y-2.5">
                    <div className="p-3.5 rounded-2xl bg-[#faf7f0] border border-[#e8e0d1] text-[#9e783e] shadow-xs">
                      <Layers className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-bold text-slate-900">Your Portfolio is Fresh & Clean</p>
                    <p className="text-xs text-slate-500 leading-relaxed font-medium">
                      You do not have any recorded assets yet. Add your first stock, mutual fund, gold, or property to start tracking your net worth and portfolio performance.
                    </p>
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5">
                      {onAddHolding && (
                        <button
                          onClick={onAddHolding}
                          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#9e783e] hover:bg-[#866632] text-white text-xs font-bold transition-all shadow-md shadow-[#9e783e]/20 cursor-pointer hover:scale-[1.02]"
                        >
                          <Plus className="h-4 w-4" />
                          <span>+ Add Holding</span>
                        </button>
                      )}
                      <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4efe4] border border-[#ded3bf] text-[11px] font-bold text-[#866632]">
                        <Sparkles className="h-3 w-3" /> 0 Risk Active
                      </span>
                    </div>
                  </div>
                </td>
              </tr>
            ) : (
              assets.map((asset: Asset) => {
                const currentValue = asset.quantity * asset.currentMarketPrice;
                const investedValue = asset.quantity * asset.averageBuyPrice;
                const pnl = currentValue - investedValue;
                const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
                const isProfit = pnl >= 0;

                return (
                  <tr key={asset.id} className="hover:bg-[#faf8f5] transition-colors">
                    <td className="py-3.5">
                      <div className="font-extrabold text-slate-900 text-sm">{asset.symbol}</div>
                      <div className="text-xs text-slate-500 font-medium">{asset.name}</div>
                    </td>
                    <td className="py-3.5">
                      <span
                        className="inline-block px-2.5 py-1 rounded-md text-xs font-bold"
                        style={{
                          backgroundColor: `${CATEGORY_COLORS[asset.category]}18`,
                          color: CATEGORY_COLORS[asset.category],
                        }}
                      >
                        {CATEGORY_LABELS[asset.category]}
                      </span>
                    </td>
                    <td className="py-3.5 text-right font-bold text-slate-900">{asset.quantity}</td>
                    <td className="py-3.5 text-right text-slate-600 font-medium">
                      {formatCurrency(asset.averageBuyPrice, currency)}
                    </td>
                    <td className="py-3.5 text-right font-semibold text-slate-900">
                      {formatCurrency(asset.currentMarketPrice, currency)}
                    </td>
                    <td className="py-3.5 text-right font-extrabold text-slate-900">
                      {formatCurrency(currentValue, currency)}
                    </td>
                    <td
                      className={`py-3.5 text-right font-extrabold ${
                        isProfit ? 'text-emerald-700' : 'text-rose-700'
                      }`}
                    >
                      {formatPercentage(pnlPercent)}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
