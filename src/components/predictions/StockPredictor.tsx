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
import {
  TrendingUp,
  Target,
  Sparkles,
  ShieldAlert,
  Activity,
  Layers,
} from 'lucide-react';
import { StockPrediction } from '@/types/finance';

export const StockPredictor: React.FC = () => {
  const { predictions, currency } = useFinanceStore();
  const config = CURRENCY_CONFIGS[currency];
  const [selectedSymbol, setSelectedSymbol] = useState(predictions[0]?.symbol || 'RELIANCE');

  const selectedPrediction: StockPrediction =
    predictions.find((p) => p.symbol === selectedSymbol) || predictions[0];

  // Scale forecast path to display currency
  const chartData = selectedPrediction.forecastPath.map((pt) => ({
    day: pt.day,
    actualPrice: pt.actualPrice ? Math.round(pt.actualPrice * config.rateFromUSD) : null,
    predictedPrice: Math.round(pt.predictedPrice * config.rateFromUSD),
    upperBand: Math.round(pt.upperBand * config.rateFromUSD),
    lowerBand: Math.round(pt.lowerBand * config.rateFromUSD),
  }));

  const sentimentColor =
    selectedPrediction.sentiment === 'STRONG_BUY'
      ? 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30'
      : selectedPrediction.sentiment === 'BUY'
      ? 'text-teal-400 bg-teal-500/10 border-teal-500/30'
      : 'text-amber-400 bg-amber-500/10 border-amber-500/30';

  return (
    <div className="space-y-6">
      {/* Header & Asset Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs shadow-xs">
        <div>
          <h3 className="text-base font-bold text-white flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-400" />
            AI Asset Forecaster & Price Predictor
          </h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Statistical Monte Carlo trajectory modeling with technical RSI & 200-DMA analysis
          </p>
        </div>

        {/* Asset Selector Tabs */}
        <div className="flex flex-wrap gap-2">
          {predictions.map((p) => (
            <button
              key={p.symbol}
              onClick={() => setSelectedSymbol(p.symbol)}
              className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all cursor-pointer ${
                selectedSymbol === p.symbol
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/20'
                  : 'bg-slate-950/60 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
            >
              {p.symbol}
            </button>
          ))}
        </div>
      </div>

      {/* Target Metrics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Current Price */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4">
          <span className="text-[10px] font-mono uppercase text-slate-500 block mb-1">
            Current Price
          </span>
          <div className="text-xl sm:text-2xl font-heading font-bold text-white">
            {formatCurrency(selectedPrediction.currentPrice, currency)}
          </div>
          <span className="text-[11px] font-mono text-slate-400 mt-1 block">Live spot value</span>
        </div>

        {/* 30-Day Target */}
        <div className="rounded-2xl border border-indigo-500/30 bg-gradient-to-b from-indigo-500/10 to-transparent p-4">
          <span className="text-[10px] font-mono uppercase text-indigo-300 block mb-1 flex items-center gap-1">
            <Target className="h-3 w-3" /> 30-Day Target
          </span>
          <div className="text-xl sm:text-2xl font-heading font-bold text-indigo-200">
            {formatCurrency(selectedPrediction.target30d, currency)}
          </div>
          <span className="text-[11px] font-mono text-emerald-400 font-bold mt-1 block">
            {formatPercentage(selectedPrediction.changePercentage30d)} Expected
          </span>
        </div>

        {/* 90-Day Target */}
        <div className="rounded-2xl border border-purple-500/30 bg-gradient-to-b from-purple-500/10 to-transparent p-4">
          <span className="text-[10px] font-mono uppercase text-purple-300 block mb-1">
            90-Day Target
          </span>
          <div className="text-xl sm:text-2xl font-heading font-bold text-purple-200">
            {formatCurrency(selectedPrediction.target90d, currency)}
          </div>
          <span className="text-[11px] font-mono text-purple-400 font-bold mt-1 block">
            Long-term horizon
          </span>
        </div>

        {/* AI Confidence Gauge */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-mono uppercase text-slate-500">AI Confidence</span>
            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${sentimentColor}`}>
              {selectedPrediction.sentiment}
            </span>
          </div>
          <div className="text-xl sm:text-2xl font-heading font-bold text-white mt-1">
            {selectedPrediction.confidenceScore}% Probability
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
            <div
              className="bg-gradient-to-r from-emerald-500 to-indigo-500 h-full rounded-full"
              style={{ width: `${selectedPrediction.confidenceScore}%` }}
            ></div>
          </div>
        </div>
      </div>

      {/* Forecast Chart Container */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              30-Day Monte Carlo Trajectory & Confidence Envelope
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Shaded region represents 90% confidence distribution interval
            </p>
          </div>
          <div className="flex items-center gap-3 text-xs font-mono">
            <div className="flex items-center gap-1.5 text-indigo-400">
              <span className="h-2 w-2 rounded-full bg-indigo-400"></span>
              <span>Predicted Path</span>
            </div>
            <div className="flex items-center gap-1.5 text-slate-500">
              <span className="h-2 w-2 rounded-full bg-slate-600"></span>
              <span>Confidence Bands</span>
            </div>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="bandGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.05} />
                </linearGradient>
              </defs>

              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />

              <XAxis
                dataKey="day"
                stroke="#64748b"
                fontSize={11}
                fontFamily="monospace"
                tickLine={false}
                axisLine={false}
              />

              <YAxis
                stroke="#64748b"
                fontSize={11}
                fontFamily="monospace"
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
                      <div className="rounded-xl border border-slate-700 bg-slate-900/95 p-3 shadow-xl backdrop-blur-md font-mono text-xs space-y-1">
                        <div className="text-slate-400 font-semibold mb-1">{label}</div>
                        <div className="flex justify-between gap-4 text-indigo-400 font-bold">
                          <span>Forecast:</span>
                          <span>{formatCurrency((payload.find((p) => p.dataKey === 'predictedPrice')?.value as number) / config.rateFromUSD, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-emerald-400 text-[11px]">
                          <span>Upper Band:</span>
                          <span>{formatCurrency((payload.find((p) => p.dataKey === 'upperBand')?.value as number) / config.rateFromUSD, currency)}</span>
                        </div>
                        <div className="flex justify-between gap-4 text-rose-400 text-[11px]">
                          <span>Support Floor:</span>
                          <span>{formatCurrency((payload.find((p) => p.dataKey === 'lowerBand')?.value as number) / config.rateFromUSD, currency)}</span>
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Upper & Lower Envelope */}
              <Area
                type="monotone"
                dataKey="upperBand"
                stroke="#6366f1"
                strokeDasharray="3 3"
                strokeWidth={1}
                fillOpacity={1}
                fill="url(#bandGrad)"
              />
              <Area
                type="monotone"
                dataKey="predictedPrice"
                stroke="#818cf8"
                strokeWidth={2.5}
                fillOpacity={0}
              />
              <Area
                type="monotone"
                dataKey="lowerBand"
                stroke="#475569"
                strokeDasharray="3 3"
                strokeWidth={1}
                fillOpacity={0}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Technicals Strip & Investment Thesis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Technical Indicators */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs space-y-3 font-mono text-xs">
          <h4 className="text-sm font-bold text-white flex items-center gap-2">
            <Activity className="h-4 w-4 text-emerald-400" />
            Technical Indicators
          </h4>
          <div className="space-y-2 pt-1">
            <div className="flex justify-between">
              <span className="text-slate-400">14-Day RSI:</span>
              <span className="font-bold text-white">{selectedPrediction.technicals.rsi} (Neutral)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">200-Day DMA:</span>
              <span className="font-bold text-white">
                {formatCurrency(selectedPrediction.technicals.movingAvg200d, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Volatility Index:</span>
              <span className="font-bold text-indigo-400">
                {selectedPrediction.technicals.volatility}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Support Level:</span>
              <span className="font-bold text-emerald-400">
                {formatCurrency(selectedPrediction.technicals.supportLevel, currency)}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Resistance Target:</span>
              <span className="font-bold text-rose-400">
                {formatCurrency(selectedPrediction.technicals.resistanceLevel, currency)}
              </span>
            </div>
          </div>
        </div>

        {/* AI Fundamental Thesis */}
        <div className="lg:col-span-2 rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs flex flex-col justify-between">
          <div>
            <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
              <Layers className="h-4 w-4 text-indigo-400" />
              AI Investment Thesis & Catalyst Analysis
            </h4>
            <p className="text-xs text-slate-300 leading-relaxed font-sans">
              {selectedPrediction.thesis}
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-xl bg-slate-950/60 border border-slate-800/80 p-3 text-[11px] font-mono text-slate-400 mt-4">
            <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
            <span>
              Projections run on historical variance and statistical regressions. Not financial advice.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
