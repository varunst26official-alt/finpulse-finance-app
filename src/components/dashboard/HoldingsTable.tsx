import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { Asset } from '@/types/finance';
import {
  formatCurrency,
  formatPercentage,
  CATEGORY_COLORS,
  CATEGORY_LABELS,
} from '@/utils/formatters';
import { Layers } from 'lucide-react';

export const HoldingsTable: React.FC = () => {
  const { assets, currency } = useFinanceStore();

  return (
    <div className="rounded-2xl border border-[#e8dfcf] bg-white p-5 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-base font-bold text-[#2b2823] flex items-center gap-2">
            <Layers className="h-4 w-4 text-[#9c783e]" />
            Asset Portfolio & Holdings
          </h3>
          <p className="text-xs text-[#786e5e] font-mono mt-0.5">
            Real-time positions, entry price, and unrealized profit & loss
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-[#e8dfcf] text-[#786e5e] uppercase text-[10px] tracking-wider">
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
          <tbody className="divide-y divide-[#f2ece1] text-[#443f36]">
            {assets.map((asset: Asset) => {
              const currentValue = asset.quantity * asset.currentMarketPrice;
              const investedValue = asset.quantity * asset.averageBuyPrice;
              const pnl = currentValue - investedValue;
              const pnlPercent = investedValue > 0 ? (pnl / investedValue) * 100 : 0;
              const isProfit = pnl >= 0;

              return (
                <tr key={asset.id} className="hover:bg-[#faf7f2] transition-colors">
                  <td className="py-3">
                    <div className="font-bold text-[#2b2823]">{asset.symbol}</div>
                    <div className="text-[10px] text-[#786e5e]">{asset.name}</div>
                  </td>
                  <td className="py-3">
                    <span
                      className="inline-block px-2 py-0.5 rounded text-[10px] font-bold"
                      style={{
                        backgroundColor: `${CATEGORY_COLORS[asset.category]}18`,
                        color: CATEGORY_COLORS[asset.category],
                      }}
                    >
                      {CATEGORY_LABELS[asset.category]}
                    </span>
                  </td>
                  <td className="py-3 text-right font-semibold text-[#2b2823]">{asset.quantity}</td>
                  <td className="py-3 text-right text-[#786e5e]">
                    {formatCurrency(asset.averageBuyPrice, currency)}
                  </td>
                  <td className="py-3 text-right font-medium text-[#2b2823]">
                    {formatCurrency(asset.currentMarketPrice, currency)}
                  </td>
                  <td className="py-3 text-right font-bold text-[#2b2823]">
                    {formatCurrency(currentValue, currency)}
                  </td>
                  <td
                    className={`py-3 text-right font-bold ${
                      isProfit ? 'text-[#2d6a4f]' : 'text-rose-600'
                    }`}
                  >
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
