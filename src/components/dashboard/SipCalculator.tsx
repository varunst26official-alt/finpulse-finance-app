import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, CURRENCY_CONFIGS } from '@/utils/formatters';
import { Calculator, ShieldAlert } from 'lucide-react';

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
    <div className="rounded-2xl border border-[#e8dfcf] bg-white p-6 shadow-xs space-y-6">
      <div>
        <h3 className="text-lg font-bold text-[#2b2823] flex items-center gap-2">
          <Calculator className="h-5 w-5 text-[#9c783e]" />
          SIP & Compound Wealth Projection Calculator
        </h3>
        <p className="text-xs text-[#786e5e] font-mono mt-0.5">
          Simulate long-term capital accumulation with automated rupee-cost averaging
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        {/* Sliders Input Controls */}
        <div className="space-y-5 font-mono text-xs">
          {/* Monthly Investment Slider */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[#443f36]">
              <span className="font-semibold">Monthly Contribution</span>
              <span className="text-[#9c783e] font-bold text-sm">
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
              className="w-full accent-[#9c783e] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#786e5e] mt-0.5">
              <span>{formatCurrency(1000 / config.rateFromUSD, currency)}</span>
              <span>{formatCurrency(200000 / config.rateFromUSD, currency)}</span>
            </div>
          </div>

          {/* Expected Return Rate */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[#443f36]">
              <span className="font-semibold">Expected Annual Return</span>
              <span className="text-[#9c783e] font-bold text-sm">{expectedReturnRate}% p.a.</span>
            </div>
            <input
              type="range"
              min={6}
              max={25}
              step={0.5}
              value={expectedReturnRate}
              onChange={(e) => setExpectedReturnRate(Number(e.target.value))}
              className="w-full accent-[#9c783e] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#786e5e] mt-0.5">
              <span>6% (Conservative)</span>
              <span>15% (Aggressive)</span>
              <span>25%</span>
            </div>
          </div>

          {/* Time Horizon */}
          <div>
            <div className="flex justify-between items-center mb-1 text-[#443f36]">
              <span className="font-semibold">Investment Horizon</span>
              <span className="text-[#9c783e] font-bold text-sm">{timePeriodYears} Years</span>
            </div>
            <input
              type="range"
              min={1}
              max={30}
              step={1}
              value={timePeriodYears}
              onChange={(e) => setTimePeriodYears(Number(e.target.value))}
              className="w-full accent-[#9c783e] cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-[#786e5e] mt-0.5">
              <span>1 Year</span>
              <span>15 Years</span>
              <span>30 Years</span>
            </div>
          </div>
        </div>

        {/* Projection Results Card */}
        <div className="rounded-2xl border border-[#ded3bf] bg-gradient-to-br from-[#f8f5ee] via-[#faf7f2] to-[#f4eee4] p-6 space-y-4">
          <div className="text-[#786e5e] font-mono text-[11px] uppercase tracking-wider font-semibold">
            Projected Corpus at Year {timePeriodYears}
          </div>

          <div className="text-3xl sm:text-4xl font-heading font-extrabold text-[#2b2823] tracking-tight">
            {formatCurrency(calculation.futureValueUSD, currency)}
          </div>

          <div className="space-y-2.5 pt-4 border-t border-[#e2d8c5] font-mono text-xs">
            <div className="flex justify-between">
              <span className="text-[#6e6657]">Total Capital Invested:</span>
              <span className="text-[#2b2823] font-bold">
                {formatCurrency(calculation.totalInvestedUSD, currency)}
              </span>
            </div>

            <div className="flex justify-between">
              <span className="text-[#6e6657]">Estimated Wealth Gain:</span>
              <span className="text-[#2d6a4f] font-bold">
                +{formatCurrency(calculation.wealthGainUSD, currency)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 rounded-xl bg-white p-2.5 text-[11px] text-[#786e5e] font-mono border border-[#e8dfcf]">
            <ShieldAlert className="h-4 w-4 text-[#9c783e] shrink-0" />
            <span>Compound growth accelerates exponentially past Year 5.</span>
          </div>
        </div>
      </div>
    </div>
  );
};
