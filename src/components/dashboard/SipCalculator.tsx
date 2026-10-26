import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, CURRENCY_CONFIGS } from '@/utils/formatters';
import { Calculator, ShieldAlert } from 'lucide-react';
import { motion } from 'framer-motion';

export const SipCalculator: React.FC = () => {
  const { currency } = useFinanceStore();
  const config = CURRENCY_CONFIGS[currency];

  const [monthlyInvestment, setMonthlyInvestment] = useState(25000);
  const [expectedReturnRate, setExpectedReturnRate] = useState(12.5);
  const [timePeriodYears, setTimePeriodYears] = useState(10);

  const calculation = useMemo(() => {
    const P = monthlyInvestment / config.rateFromUSD;
    const i = expectedReturnRate / 12 / 100;
    const n = timePeriodYears * 12;

    const futureValueUSD = P * (((Math.pow(1 + i, n) - 1) / i) * (1 + i));
    const totalInvestedUSD = P * n;
    const wealthGainUSD = futureValueUSD - totalInvestedUSD;

    return {
      totalInvestedUSD,
      wealthGainUSD,
      futureValueUSD,
    };
  }, [monthlyInvestment, expectedReturnRate, timePeriodYears, config.rateFromUSD]);

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-2xl border border-[#e8e0d1] bg-white p-7 shadow-xs hover:shadow-md transition-all space-y-6"
    >
      <div>
        <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Calculator className="h-5 w-5 text-[#9e783e]" />
          SIP & Compound Wealth Projection Calculator
        </h3>
        <p className="text-xs text-slate-600 mt-0.5 font-medium">
          Simulate long-term capital accumulation with automated rupee-cost averaging
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Sliders Input Controls */}
        <div className="space-y-6 text-xs">
          {/* Monthly Investment Slider */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-slate-800">
              <span className="font-bold text-sm">Monthly Contribution</span>
              <span className="text-[#9e783e] font-extrabold text-base">
                {formatCurrency(monthlyInvestment / config.rateFromUSD, currency)}/mo
              </span>
            </div>
            <input
              type="range"
              min={1000}
              max={200000}
              step={1000}
              value={monthlyInvestment}
              onChange={(e) => setMonthlyInvestment(Number(e.target.value))}
              className="w-full accent-[#9e783e] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-slate-500 font-medium mt-1">
              <span>{formatCurrency(1000 / config.rateFromUSD, currency)}</span>
              <span>{formatCurrency(200000 / config.rateFromUSD, currency)}</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-slate-800">
              <span className="font-bold text-sm">Expected Annual Return</span>
              <span className="text-[#9e783e] font-extrabold text-base">{expectedReturnRate}% p.a.</span>
            </div>
            <input
              type="range"
              min={6}
              max={25}
              step={0.5}
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full accent-[#9e783e] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-slate-500 font-medium mt-1">
              <span>6% (Conservative)</span>
              <span>15% (Aggressive)</span>
              <span>25%</span>
            </div>
          </div>

          {/* Time Horizon */}
          <div>
            <div className="flex justify-between items-center mb-1.5 text-slate-800">
              <span className="font-bold text-sm">Investment Horizon</span>
              <span className="text-[#9e783e] font-extrabold text-base">{timePeriodYears} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={timePeriodYears}
              onChange={(e) => setTimePeriodYears(Number(e.target.value))}
              className="w-full accent-[#9e783e] cursor-pointer h-2 bg-slate-200 rounded-lg"
            />
            <div className="flex justify-between text-xs text-slate-500 font-medium mt-1">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        {/* Projection Results Card */}
        <div className="rounded-2xl border border-[#ded3bf] bg-gradient-to-br from-[#f8f5ee] via-[#faf7f2] to-[#f4eee4] p-7 space-y-4 shadow-xs">
          <div className="text-slate-600 text-xs uppercase tracking-wider font-bold">
            Projected Corpus at Year {timePeriodYears}
          </div>

          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-slate-900 tracking-tight">
            {formatCurrency(calculation.futureValueUSD, currency)}
          </div>

          <div className="space-y-3 pt-4 border-t border-[#e2d8c5] text-xs font-semibold">
            <div className="flex justify-between">
              <span className="text-slate-600">Total Capital Invested:</span>
              <span className="text-slate-900 font-extrabold text-sm">
                {formatCurrency(calculation.totalInvestedUSD, currency)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-600">Estimated Wealth Gain:</span>
              <span className="text-emerald-700 font-extrabold text-sm">
                +{formatCurrency(calculation.wealthGainUSD, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-white p-3 text-xs text-slate-700 font-medium border border-[#e8e0d1]">
            <ShieldAlert className="h-4 w-4 text-[#9e783e] shrink-0" />
            <span>Compound growth accelerates exponentially past Year 5.</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};
