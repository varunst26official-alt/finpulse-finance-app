import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, CURRENCY_CONFIGS, formatPercentage } from '@/utils/formatters';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import { TrendingUp, Target, Sparkles, ShieldAlert, Activity, Layers } from 'lucide-react';
import { StockPrediction } from '@/types/finance';
import { motion } from 'framer-motion';

export const StockPredictor: React.FC = () => {
  const { predictions, currency } = useFinanceStore();
  const config = CURRENCY_CONFIGS[currency];
  const [selectedSymbol, setSelectedSymbol] = useState(predictions[0]?.symbol || 'RELIANCE');

  const selectedPrediction: StockPrediction =
    predictions.find((p) => p.symbol === selectedSymbol) || predictions[0];

  const chartData = selectedPrediction.forecastPath.map((pt) => ({
    day: pt.day,
    actualPrice: pt.actualPrice ? Math.round(pt.actualPrice * config.rateFromUSD) : null,
    predictedPrice: Math.round(pt.predictedPrice * config.rateFromUSD),
    upperBand: Math.round(pt.upperBand * config.rateFromUSD),
    lowerBand: Math.round(pt.lowerBand * config.rateFromUSD),
  }));

  const sentimentColor =
    selectedPrediction.sentiment === 'STRONG_BUY'
      ? 'text-emerald-800 bg-emerald-50 border-emerald-200'
      : selectedPrediction.sentiment === 'BUY'
      ? 'text-[#866632] bg-[#f8f4ec] border-[#ded3bf]'
      : 'text-amber-800 bg-amber-50 border-amber-200';

  return (
    <div className="space-y-6">
      {/* Header & Asset Switcher */}
      <motion.div
        whileHover={{ y: -2 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-[#e8e0d1] bg-white p-6 shadow-xs"
      >
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-[#9e783e]" />
            AI Asset Forecaster & Price Predictor
          </h3>
          <p className="text-xs text-slate-600 mt-0.5 font-medium">
            Statistical Monte Carlo trajectory modeling with technical RSI & 200-DMA analysis
          </p>
        </div>

        {/* Asset Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {predictions.map((p) => (
            <button
              key={p.symbol}
              onClick={() => setSelectedSymbol(p.symbol)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedSymbol === p.symbol
                  ? 'bg-[#9e783e] text-white shadow-xs'
                  : 'bg-[#faf8f5] border border-[#e4d9c7] text-slate-700 hover:text-slate-900 hover:bg-[#f4efe4]'
              }`}
            >
              {p.symbol}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Target Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Price */}
        <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            Current Price
          </span>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {formatCurrency(selectedPrediction.currentPrice, currency)}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1 block">Live spot value</span>
        </motion.div>

        {/* 30-Day Target */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-[#ded3bf] bg-gradient-to-b from-[#f8f5ee] to-white p-5 shadow-xs"
        >
          <span className="text-xs uppercase text-[#866632] block mb-1 flex items-center gap-1 font-bold">
            <Target className="h-3.5 w-3.5" /> 30-Day Target
          </span>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {formatCurrency(selectedPrediction.target30d, currency)}
          </div>
          <span className="text-xs text-emerald-700 font-extrabold mt-1 block">
            {formatPercentage(selectedPrediction.changePercentage30d)} Expected
          </span>
        </motion.div>

        {/* 90-Day Target */}
        <motion.div whileHover={{ y: -2 }} className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs">
          <span className="text-xs font-bold uppercase text-slate-500 block mb-1">
            90-Day Target
          </span>
          <div className="text-2xl font-heading font-extrabold text-slate-900">
            {formatCurrency(selectedPrediction.target90d, currency)}
          </div>
          <span className="text-xs text-[#866632] font-extrabold mt-1 block">
            Long-term horizon
          </span>
        </motion.div>

        {/* AI Confidence Gauge */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs flex flex-col justify-between"
        >
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase text-slate-500">AI Confidence</span>
            <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${sentimentColor}`}>
              {selectedPrediction.sentiment}
            </span>
          </div>
          <div className="text-2xl font-heading font-extrabold text-slate-900 mt-1">
            {selectedPrediction.confidenceScore}% Probability
          </div>
          <div className="w-full bg-[#f4efe4] h-2 rounded-full overflow-hidden mt-2">
            <div
              className="bg-[#9e783e] h-full rounded-full"
              style={{ width: `${selectedPrediction.confidenceScore}%` }}
            ></div>
          </div>
        </motion.div>
      </div>

      {/* Forecast Chart Container */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-2xl border border-[#e8e0d1] bg-white p-5 sm:p-6 shadow-xs space-y-4 w-full min-w-0 max-w-full overflow-hidden"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#9e783e]" />
              30-Day Monte Carlo Trajectory & Confidence Envelope
            </h4>
            <p className="text-xs text-slate-600 mt-0.5 font-medium">
              Shaded region represents 90% confidence distribution interval
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs font-semibold">
            <div className="flex items-center gap-1.5 text-[#9e783e] font-bold">
              <span className="h-2.5 w-2.5 rounded-full bg-[#9e783e]"></span>
              <span>Predicted Path</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500 font-medium">
              <span className="h-2.5 w-2.5 rounded-full bg-[#cfc5b4]"></span>
              <span>Confidence Bands</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full min-w-0 pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#9e783e" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#9e783e" stopOpacity={0.03} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />

              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={12}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#64748b"
                fontSize={12}
                fontWeight={600}
                tickLine={false}
                axisLine={false}
                domain={['auto', 'auto']}
                tickFormatter={(val) => {
                  if (val >= 1000) return `${(val / 1000).toFixed(0)}k`;
                  return `${val}`;
                }}
              />

              <Tooltip
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="rounded-xl border border-[#ded3bf] bg-white p-3.5 shadow-xl text-xs space-y-1.5">
                        <div className="text-slate-500 font-bold mb-1">{label}</div>
                        <div className="flex justify-between gap-6 text-[#9e783e] font-extrabold text-sm">
                          <span>Forecast:</span>
                          <span>
                            {formatCurrency(
                              (payload.find((p) => p.dataKey === 'predictedPrice')
                                ?.value as number) / config.rateFromUSD,
                              currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between gap-6 text-emerald-800 text-xs font-semibold">
                          <span>Upper Band:</span>
                          <span>
                            {formatCurrency(
                              (payload.find((p) => p.dataKey === 'upperBand')?.value as number) /
                                config.rateFromUSD,
                              currency
                            )}
                          </span>
                        </div>
                        <div className="flex justify-between gap-6 text-rose-800 text-xs font-semibold">
                          <span>Support Floor:</span>
                          <span>
                            {formatCurrency(
                              (payload.find((p) => p.dataKey === 'lowerBand')?.value as number) /
                                config.rateFromUSD,
                              currency
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              <Area
                type="monotone"
                dataKey="upperBand"
                stroke="#9e783e"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                fillOpacity={1}
                fill="url(#bandGrad)"
              />
              <Area
                type="monotone"
                dataKey="predictedPrice"
                stroke="#88642e"
                strokeWidth={3}
                fillOpacity={0}
              />
              <Area
                type="monotone"
                dataKey="lowerBand"
                stroke="#a89a85"
                strokeDasharray="3 3"
                strokeWidth={1.5}
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Technicals Strip & Investment Thesis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technical Indicators */}
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-6 space-y-3.5 text-xs shadow-xs"
        >
          <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-700" />
            Technical Indicators
          </h4>
          <div className="space-y-2.5 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">14-Day RSI:</span>
              <span className="font-extrabold text-slate-900">
                {selectedPrediction.technicals.rsi} (Neutral)
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">200-Day DMA:</span>
              <span className="font-extrabold text-slate-900">
                {formatCurrency(selectedPrediction.technicals.movingAvg200d, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Volatility:</span>
              <span className="font-extrabold text-[#866632]">
                {selectedPrediction.technicals.volatility}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Support Level:</span>
              <span className="font-extrabold text-emerald-700">
                {formatCurrency(selectedPrediction.technicals.supportLevel, currency)}
              </span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-slate-600 font-medium">Resistance Target:</span>
              <span className="font-extrabold text-rose-700">
                {formatCurrency(selectedPrediction.technicals.resistanceLevel, currency)}
              </span>
            </div>
          </div>
        </motion.div>

        {/* AI Fundamental Thesis */}
        <motion.div
          whileHover={{ y: -2 }}
          className="lg:col-span-2 rounded-2xl border border-[#e8e0d1] bg-white p-6 flex flex-col justify-between shadow-xs"
        >
          <div>
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2 mb-2.5">
              <Layers className="h-4 w-4 text-[#9e783e]" />
              AI Investment Thesis & Catalyst Analysis
            </h4>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-medium">
              {selectedPrediction.thesis}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] p-3 text-xs text-slate-600 font-medium mt-4">
            <ShieldAlert className="h-4 w-4 text-[#9e783e] shrink-0" />
            <span>
              Projections run on historical variance and statistical regressions. Not financial advice.
            </span>
          </div>
        </motion.div>
      </div>
    </div>
  );
};
