import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { Asset } from '@/types/finance';
import { formatCurrency, formatPercentage, CATEGORY_COLORS, CATEGORY_LABELS } from '@/utils/formatters';
import { Layers } from 'lucide-react';

export const HoldingsTable: React.FC = () => {
  const { assets, currency } = useFinanceStore();

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <Layers className="h-4 w-4 text-emerald-400" />
            Asset Portfolio & Holdings
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Real-time positions, entry price, and unrealized profit & loss
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
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
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {assets.map((asset: Asset) => {
              const currentValue = asset.quantity * asset.currentMarketPrice;
              const investedValue = asset.quantity * asset.averageBuyPrice;
              const pnl = currentValue - investedValue;
              const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
              const isProfit = pnl >= 0;

              return (
                <tr key={asset.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-white">{asset.symbol}</div>
                    <div className="text-[10px] text-slate-400">{asset.name}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[asset.category]}20`,
                        color: CATEGORY_COLORS[asset.category],
                      }}
                    >
                      {CATEGORY_LABELS[asset.category]}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold">{asset.quantity}</td>
                  <td className="py-3 text-right text-slate-400">
                    {formatCurrency(asset.averageBuyPrice, currency)}
                  </td>
                  <td className="py-3 text-right font-medium text-white">
                    {formatCurrency(asset.currentMarketPrice, currency)}
                  </td>
                  <td className="py-3 text-right font-bold text-white">
                    {formatCurrency(currentValue, currency)}
                  </td>
                  <td className={`py-3 text-right font-bold ${isProfit ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {formatPercentage(pnlPercent)}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
