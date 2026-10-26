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
import { motion } from 'framer-motion';

export const TaxOptimizer: React.FC = () => {
  const { taxReport, currency } = useFinanceStore();

  const totalTaxLiabilityUSD = taxReport.stcgEstimatedTax + taxReport.ltcgEstimatedTax;

  return (
    <div className="space-y-6">
      {/* Header */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e8e0d1] bg-white p-6 shadow-xs"
      >
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <ReceiptText className="h-5 w-5 text-[#9e783e]" />
            Capital Gains & Tax Harvesting Optimizer
          </h3>
          <p className="text-xs text-slate-600 mt-1">
            FY 2026-27 Indian Tax Rules & Global Benchmarking (LTCG 12.5% above ₹1.25L, STCG 20%)
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-[#9e783e] text-xs font-semibold">
          <ShieldCheck className="h-4 w-4" />
          <span>Active Tax Year: FY 2026-27</span>
        </div>
      </motion.div>

      {/* Tax Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Estimated Liability */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs hover:shadow-md transition-all"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Total Estimated Tax
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(totalTaxLiabilityUSD, currency)}
          </div>
          <span className="text-xs text-slate-600 mt-1 block">
            Combined STCG + LTCG liability
          </span>
        </motion.div>

        {/* Long-Term Gains (LTCG) */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e8e0d1] bg-gradient-to-b from-[#faf8f5] to-white p-5 shadow-xs hover:shadow-md transition-all"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-[#9e783e] block mb-1">
            Unrealized LTCG Gains
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(taxReport.ltcgTotalGains, currency)}
          </div>
          <span className="text-xs text-[#9e783e] font-medium mt-1 block">
            Est. Tax: {formatCurrency(taxReport.ltcgEstimatedTax, currency)} (12.5%)
          </span>
        </motion.div>

        {/* Short-Term Gains (STCG) */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs hover:shadow-md transition-all"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 block mb-1">
            Unrealized STCG Gains
          </span>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {formatCurrency(taxReport.stcgTotalGains, currency)}
          </div>
          <span className="text-xs text-rose-600 font-medium mt-1 block">
            Est. Tax: {formatCurrency(taxReport.stcgEstimatedTax, currency)} (20%)
          </span>
        </motion.div>

        {/* Exemption Limit Utilized */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 to-white p-5 shadow-xs hover:shadow-md transition-all"
        >
          <span className="text-[11px] font-semibold uppercase tracking-wider text-emerald-800 block mb-1 flex items-center justify-between">
            <span>₹1.25L Exemption</span>
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-1.5 py-0.5 rounded">Available</span>
          </span>
          <div className="text-2xl font-bold font-mono text-emerald-700">
            {formatCurrency(taxReport.ltcgExemptionLimit, currency)}
          </div>
          <span className="text-xs text-emerald-800 font-medium mt-1 block">
            100% Tax-Free Annual Allowance
          </span>
        </motion.div>
      </div>

      {/* Actionable Tax-Loss / Tax-Gain Harvesting Banner */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="rounded-2xl border border-emerald-300 bg-gradient-to-r from-emerald-50/50 via-white to-[#faf8f5] p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-xs"
      >
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-xl bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-2">
              Tax Harvesting Strategy Recommendation
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed mt-1 max-w-2xl">
              {taxReport.harvestingRecommendation}
            </p>
          </div>
        </div>

        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          onClick={() => alert('Tax-harvesting simulation applied to cost basis!')}
          className="shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-700 text-white font-semibold text-xs hover:bg-emerald-800 active:scale-95 transition-all shadow-md shadow-emerald-700/20 cursor-pointer"
        >
          <span>Harvest ₹1.25L Exemption</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </motion.button>
      </motion.div>

      {/* Holdings Tax Status Ledger Table */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="rounded-2xl border border-[#e8e0d1] bg-white p-6 shadow-xs space-y-4"
      >
        <div>
          <h4 className="text-base font-bold text-slate-900">
            Holding Period & Tax Status Classification
          </h4>
          <p className="text-xs text-slate-600 mt-0.5">
            Equity held &gt; 365 days qualifies for preferential Long-Term Capital Gains rate
          </p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-[#e8e0d1] text-slate-500 uppercase text-[11px] font-semibold tracking-wider">
              <tr>
                <th className="pb-3 pt-1">Instrument</th>
                <th className="pb-3 pt-1 text-center">Holding Period</th>
                <th className="pb-3 pt-1 text-center">Gain Classification</th>
                <th className="pb-3 pt-1 text-right">Unrealized Gain</th>
                <th className="pb-3 pt-1 text-right">Est. Tax Liability</th>
                <th className="pb-3 pt-1 text-center">Harvest Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {taxReport.holdings.map((h: TaxHoldingAnalysis, i: number) => (
                <tr key={i} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3.5 font-bold text-slate-900">{h.assetSymbol}</td>
                  <td className="py-3.5 text-center text-slate-600 font-mono">{h.holdingPeriodDays} Days</td>
                  <td className="py-3.5 text-center">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-md text-[10px] font-bold ${
                        h.gainType === 'LTCG'
                          ? 'bg-[#faf8f5] text-[#9e783e] border border-[#e8e0d1]'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {h.gainType}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-bold font-mono text-emerald-700">
                    +{formatCurrency(h.unrealizedGain, currency)}
                  </td>
                  <td className="py-3.5 text-right font-semibold font-mono text-slate-900">
                    {formatCurrency(h.estimatedTaxLiability, currency)}
                  </td>
                  <td className="py-3.5 text-center">
                    {h.isTaxHarvestable ? (
                      <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                        Eligible for Zero-Tax Harvest
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500">Hold Position</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
};
