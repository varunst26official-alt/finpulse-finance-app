import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/formatters';
import {
  ReceiptText,
  ShieldCheck,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TaxHoldingAnalysis } from '@/types/finance';

export const TaxOptimizer: React.FC = () => {
  const { taxReport, currency } = useFinanceStore();

  const totalTaxLiabilityUSD = taxReport.stcgEstimatedTax + taxReport.ltcgEstimatedTax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e8dfcf] bg-white p-5 shadow-xs">
        <div>
          <h3 className="text-base font-bold text-[#2b2823] flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-[#9c783e]" />
            Capital Gains & Tax Harvesting Optimizer
          </h3>
          <p className="text-xs text-[#786e5e] font-mono mt-0.5">
            FY 2026-27 Indian Tax Rules & Global Benchmarking (LTCG 12.5% above ₹1.25L, STCG 20%)
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#f4efe4] border border-[#ded3bf] text-[#866632] text-xs font-mono font-bold">
          <ShieldCheck className="h-4 w-4" />
          <span>Active Tax Year: FY 2026-27</span>
        </div>
      </div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Liability */}
        <div className="rounded-2xl border border-[#e8dfcf] bg-white p-4">
          <span className="text-[10px] font-mono uppercase text-[#786e5e] block mb-1">
            Total Estimated Tax
          </span>
          <div className="text-xl sm:text-2xl font-heading font-bold text-[#2b2823]">
            {formatCurrency(totalTaxLiabilityUSD, currency)}
          </div>
          <span className="text-[11px] font-mono text-[#786e5e] mt-1 block">
            Combined STCG + LTCG liability
          </span>
        </div>

        {/* Long-Term Gains (LTCG) */}
        <div className="rounded-2xl border border-[#ded3bf] bg-gradient-to-b from-[#f8f5ee] to-white p-4">
          <span className="text-[10px] font-mono uppercase text-[#866632] block mb-1 font-bold">
            Unrealized LTCG Gains
          </span>
          <div className="text-xl sm:text-2xl font-heading font-bold text-[#2b2823]">
            {formatCurrency(taxReport.ltcgTotalGains, currency)}
          </div>
          <span className="text-[11px] font-mono text-[#866632] mt-1 block">
            Est. Tax: {formatCurrency(taxReport.ltcgEstimatedTax, currency)} (12.5%)
          </span>
        </div>

        {/* Short-Term Gains (STCG) */}
        <div className="rounded-2xl border border-[#e8dfcf] bg-white p-4">
          <span className="text-[10px] font-mono uppercase text-[#786e5e] block mb-1">
            Unrealized STCG Gains
          </span>
          <div className="text-xl sm:text-2xl font-heading font-bold text-[#2b2823]">
            {formatCurrency(taxReport.stcgTotalGains, currency)}
          </div>
          <span className="text-[11px] font-mono text-rose-600 mt-1 block">
            Est. Tax: {formatCurrency(taxReport.stcgEstimatedTax, currency)} (20%)
          </span>
        </div>

        {/* Exemption Limit Utilized */}
        <div className="rounded-2xl border border-[#c6e4d2] bg-gradient-to-b from-[#f0f8f4] to-white p-4">
          <span className="text-[10px] font-mono uppercase text-[#2d6a4f] block mb-1 flex items-center justify-between font-bold">
            <span>₹1.25L Exemption</span>
            <span className="text-[10px] font-bold text-[#2d6a4f]">Available</span>
          </span>
          <div className="text-xl sm:text-2xl font-heading font-bold text-[#2d6a4f]">
            {formatCurrency(taxReport.ltcgExemptionLimit, currency)}
          </div>
          <span className="text-[11px] font-mono text-[#2d6a4f] mt-1 block">
            100% Tax-Free Allowance
          </span>
        </div>
      </div>

      {/* Actionable Tax-Loss / Tax-Gain Harvesting Banner */}
      <div className="rounded-2xl border border-[#c6e4d2] bg-gradient-to-r from-[#f0f8f4] via-white to-[#faf7f2] p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start gap-3">
          <div className="p-2.5 rounded-xl bg-[#eef7f2] text-[#2d6a4f] shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-[#2b2823] flex items-center gap-2">
              Tax Harvesting Strategy Recommendation
            </h4>
            <p className="text-xs text-[#544e43] leading-relaxed font-sans mt-1 max-w-2xl">
              {taxReport.harvestingRecommendation}
            </p>
          </div>
        </div>

        <button
          onClick={() => alert('Tax-harvesting simulation applied to cost basis!')}
          className="shrink-0 flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#2d6a4f] text-white font-mono font-bold text-xs hover:bg-[#24543e] active:scale-95 transition-all shadow-md shadow-[#2d6a4f]/20 cursor-pointer"
        >
          <span>Harvest ₹1.25L Exemption</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Holdings Tax Status Ledger Table */}
      <div className="rounded-2xl border border-[#e8dfcf] bg-white p-5 shadow-xs space-y-4">
        <div>
          <h4 className="text-sm font-bold text-[#2b2823]">
            Holding Period & Tax Status Classification
          </h4>
          <p className="text-xs text-[#786e5e] font-mono mt-0.5">
            Equity held &gt; 365 days qualifies for Long-Term Capital Gains rate
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead className="border-b border-[#e8dfcf] text-[#786e5e] uppercase text-[10px] tracking-wider">
              <tr>
                <th className="pb-3 pt-1">Instrument</th>
                <th className="pb-3 pt-1 text-center">Holding Period</th>
                <th className="pb-3 pt-1 text-center">Gain Classification</th>
                <th className="pb-3 pt-1 text-right">Unrealized Gain</th>
                <th className="pb-3 pt-1 text-right">Est. Tax Liability</th>
                <th className="pb-3 pt-1 text-center">Harvest Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2ece1] text-[#443f36]">
              {taxReport.holdings.map((h: TaxHoldingAnalysis, i: number) => (
                <tr key={i} className="hover:bg-[#faf7f2] transition-colors">
                  <td className="py-3 font-bold text-[#2b2823]">{h.assetSymbol}</td>
                  <td className="py-3 text-center text-[#786e5e]">{h.holdingPeriodDays} Days</td>
                  <td className="py-3 text-center">
                    <span
                      className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                        h.gainType === 'LTCG'
                          ? 'bg-[#f4efe4] text-[#866632] border border-[#ded3bf]'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {h.gainType}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-[#2d6a4f]">
                    +{formatCurrency(h.unrealizedGain, currency)}
                  </td>
                  <td className="py-3 text-right font-medium text-[#443f36]">
                    {formatCurrency(h.estimatedTaxLiability, currency)}
                  </td>
                  <td className="py-3 text-center">
                    {h.isTaxHarvestable ? (
                      <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#2d6a4f] bg-[#eef7f2] px-2 py-0.5 rounded-full border border-[#c6e4d2]">
                        Eligible for Zero-Tax Harvest
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#8c8273]">Hold Position</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
