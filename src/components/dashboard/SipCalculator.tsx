import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, CURRENCY_CONFIGS } from '@/utils/formatters';
import { Calculator, ShieldAlert } from 'lucide-react';

export const SipCalculator: React.FC = () => {
  const { currency } = useFinanceStore();
  const config = CURRENCY_CONFIGS[currency];

  // Default values anchored in INR, converted to active currency
  const [monthlyInvestment, setMonthlyInvestment] = useState(25000); // in INR equivalent
  const [expectedReturnRate, setExpectedReturnRate] = useState(12.5); // 12.5% p.a.
  const [timePeriodYears, setTimePeriodYears] = useState(10); // 10 years

  const calculation = useMemo(() => {
    const P = monthlyInvestment / config.rateFromUSD; // Convert to base USD
    const i = expectedReturnRate / 12 / 100; // Monthly interest rate
    const n = timePeriodYears * 12; // Total number of months

    // Future Value of Monthly SIP formula: FV = P * [((1 + i)^n - 1) / i] * (1 + i)
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
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-xs shadow-xs space-y-6">
      <div>
        <h3 className="text-lg font-bold text-white flex items-center gap-2">
          <Calculator className="h-5 w-5 text-emerald-400" />
          SIP & Compound Wealth Projection Calculator
        </h3>
        <p className="text-xs text-slate-400 font-mono mt-0.5">
          Simulate long-term capital accumulation with automated rupee-cost averaging
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Sliders Input Controls */}
        <div className="space-y-5 font-mono text-xs">
          {/* Monthly Investment Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-slate-300">
              <span className="font-semibold">Monthly Contribution</span>
              <span className="text-emerald-400 font-bold text-sm">
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
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>{formatCurrency(1000 / config.rateFromUSD, currency)}</span>
              <span>{formatCurrency(200000 / config.rateFromUSD, currency)}</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div>
            <div className="flex justify-between items-center mb-1 text-slate-300">
              <span className="font-semibold">Expected Annual Return</span>
              <span className="text-emerald-400 font-bold text-sm">{expectedReturnRate}% p.a.</span>
            </div>
            <input
              type="range"
              min={6}
              max={25}
              step={0.5}
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>6% (Conservative Debt)</span>
              <span>15% (Aggressive Equity)</span>
              <span>25%</span>
            </div>
          </div>

          {/* Time Horizon */}
          <div>
            <div className="flex justify-between items-center mb-1 text-slate-300">
              <span className="font-semibold">Investment Horizon</span>
              <span className="text-emerald-400 font-bold text-sm">{timePeriodYears} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={timePeriodYears}
              onChange={(e) => setTimePeriodYears(Number(e.target.value))}
              className="w-full accent-emerald-500 cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-500 mt-0.5">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        {/* Projection Results Card */}
        <div className="rounded-2xl border border-emerald-500/20 bg-gradient-to-br from-emerald-500/10 via-slate-950 to-indigo-500/5 p-6 space-y-4">
          <div className="text-slate-400 font-mono text-[11px] uppercase tracking-wider font-semibold">
            Projected Corpus at Year {timePeriodYears}
          </div>

          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-white tracking-tight">
            {formatCurrency(calculation.futureValueUSD, currency)}
          </div>

          <div className="space-y-2.5 pt-4 border-t border-slate-800/80 font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-slate-400">Total Capital Invested:</span>
              <span className="text-indigo-300 font-bold">
                {formatCurrency(calculation.totalInvestedUSD, currency)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-slate-400">Estimated Wealth Gain:</span>
              <span className="text-emerald-400 font-bold">
                +{formatCurrency(calculation.wealthGainUSD, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/60 p-2.5 text-[11px] text-slate-400 font-mono border border-slate-800">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>Compound growth accelerates past Year 5 due to reinvested earnings.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
