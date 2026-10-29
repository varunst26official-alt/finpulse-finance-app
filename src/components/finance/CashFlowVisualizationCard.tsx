import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  ExpenseCategory,
  IncomeCategory,
} from '@/types/finance';
import {
  formatCurrency,
  CURRENCY_CONFIGS,
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
} from '@/utils/formatters';
import {
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';
import {
  TrendingDown,
  TrendingUp,
  PieChart as PieIcon,
  BarChart3,
  Sparkles,
  Filter,
} from 'lucide-react';
import { motion } from 'framer-motion';

// Palette for visual categories
const CATEGORY_PALETTE: Record<string, string> = {
  FOOD_DINING: '#f97316', // Orange
  SHOPPING_LIFESTYLE: '#ec4899', // Pink
  HEALTHCARE_INSURANCE: '#06b6d4', // Cyan
  TRAVEL_COMMUTE: '#8b5cf6', // Violet
  UTILITIES_BILLS: '#eab308', // Amber
  EMI_LOANS: '#ef4444', // Red
  ENTERTAINMENT_SUBS: '#a855f7', // Purple
  HOUSING_RENT: '#3b82f6', // Blue
  EDUCATION: '#14b8a6', // Teal
  OTHER_EXPENSE: '#64748b', // Slate
  // Income categories
  SALARY: '#10b981', // Emerald
  BUSINESS: '#0284c7', // Sky
  FREELANCE: '#6366f1', // Indigo
  RENTAL: '#84cc16', // Lime
  DIVIDEND_INTEREST: '#eab308', // Amber
  CAPITAL_GAINS: '#14b8a6', // Teal
  OTHER_INCOME: '#64748b', // Slate
};

interface CashFlowVisualizationCardProps {
  title?: string;
  subtitle?: string;
  defaultFlow?: 'OUTFLOW' | 'INFLOW';
  defaultFormat?: 'GRAPH' | 'PIE';
  accountFilter?: string; // e.g. "ICICI RuPay Card XX03" or "ALL"
  className?: string;
  showAccountFilter?: boolean;
}

export const CashFlowVisualizationCard: React.FC<CashFlowVisualizationCardProps> = ({
  title = 'Cash Flow & Spend Intelligence',
  subtitle = 'Switchable dynamic analytics with graph and category pie chart visualizations',
  defaultFlow = 'OUTFLOW',
  defaultFormat = 'GRAPH',
  accountFilter: initialAccountFilter = 'ALL',
  className = '',
  showAccountFilter = false,
}) => {
  const { expenses, incomes, currency } = useFinanceStore();
  const config = CURRENCY_CONFIGS[currency];
  const rate = config.rateFromUSD;

  const [flowType, setFlowType] = useState<'OUTFLOW' | 'INFLOW'>(defaultFlow);
  const [chartFormat, setChartFormat] = useState<'GRAPH' | 'PIE'>(defaultFormat);
  const [timeRange, setTimeRange] = useState<'ALL' | '30D' | '6M'>('ALL');
  const [selectedAccount, setSelectedAccount] = useState<string>(initialAccountFilter);
  const [activeCategoryFilter, setActiveCategoryFilter] = useState<string | null>(null);

  // Extract all unique accounts found in notes or account field
  const availableAccounts = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.notes && e.notes.includes('(')) {
        const match = e.notes.match(/\((.*?)\)/);
        if (match) set.add(match[1]);
      }
    });
    incomes.forEach((i) => {
      if (i.account) set.add(i.account);
    });
    return Array.from(set);
  }, [expenses, incomes]);

  // Filtered Expense Items
  const filteredExpenses = useMemo(() => {
    return expenses.filter((e) => {
      if (timeRange === '30D' && e.date < '2026-10-01') return false;
      if (timeRange === '6M' && e.date < '2026-05-01') return false;

      if (selectedAccount !== 'ALL') {
        const inNotes = e.notes && e.notes.toLowerCase().includes(selectedAccount.toLowerCase());
        if (!inNotes) return false;
      }
      if (activeCategoryFilter && e.category !== activeCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [expenses, timeRange, selectedAccount, activeCategoryFilter]);

  // Filtered Income Items
  const filteredIncomes = useMemo(() => {
    return incomes.filter((i) => {
      if (timeRange === '30D' && i.date < '2026-10-01') return false;
      if (timeRange === '6M' && i.date < '2026-05-01') return false;

      if (selectedAccount !== 'ALL') {
        const matchesAcc = i.account && i.account.toLowerCase().includes(selectedAccount.toLowerCase());
        const inNotes = i.notes && i.notes.toLowerCase().includes(selectedAccount.toLowerCase());
        if (!matchesAcc && !inNotes) return false;
      }
      if (activeCategoryFilter && i.category !== activeCategoryFilter) {
        return false;
      }
      return true;
    });
  }, [incomes, timeRange, selectedAccount, activeCategoryFilter]);

  // Metrics summary
  const totalOutflowUSD = useMemo(() => {
    return filteredExpenses.reduce((sum, e) => sum + e.amount, 0);
  }, [filteredExpenses]);

  const totalInflowUSD = useMemo(() => {
    return filteredIncomes.reduce((sum, i) => sum + i.amount, 0);
  }, [filteredIncomes]);

  const currentTotalUSD = flowType === 'OUTFLOW' ? totalOutflowUSD : totalInflowUSD;
  const currentTotalDisplay = currentTotalUSD * rate;
  const transactionCount = flowType === 'OUTFLOW' ? filteredExpenses.length : filteredIncomes.length;
  const averageTxnDisplay = transactionCount > 0 ? currentTotalDisplay / transactionCount : 0;

  // Pie chart data: Grouped by Category
  const pieData = useMemo(() => {
    if (flowType === 'OUTFLOW') {
      const map: Record<string, { name: string; category: string; valueUSD: number; count: number }> = {};
      filteredExpenses.forEach((e) => {
        const catKey = e.category;
        const catName = EXPENSE_CATEGORY_LABELS[catKey as ExpenseCategory] || catKey;
        if (!map[catKey]) {
          map[catKey] = { name: catName, category: catKey, valueUSD: 0, count: 0 };
        }
        map[catKey].valueUSD += e.amount;
        map[catKey].count += 1;
      });

      const total = Object.values(map).reduce((acc, c) => acc + c.valueUSD, 0);

      return Object.values(map)
        .map((c) => ({
          name: c.name,
          category: c.category,
          valueUSD: c.valueUSD,
          value: Math.round(c.valueUSD * rate),
          percentage: total > 0 ? (c.valueUSD / total) * 100 : 0,
          count: c.count,
          color: CATEGORY_PALETTE[c.category] || '#9e783e',
        }))
        .sort((a, b) => b.value - a.value);
    } else {
      const map: Record<string, { name: string; category: string; valueUSD: number; count: number }> = {};
      filteredIncomes.forEach((i) => {
        const catKey = i.category;
        const catName = INCOME_CATEGORY_LABELS[catKey as IncomeCategory] || catKey;
        if (!map[catKey]) {
          map[catKey] = { name: catName, category: catKey, valueUSD: 0, count: 0 };
        }
        map[catKey].valueUSD += i.amount;
        map[catKey].count += 1;
      });

      const total = Object.values(map).reduce((acc, c) => acc + c.valueUSD, 0);

      return Object.values(map)
        .map((c) => ({
          name: c.name,
          category: c.category,
          valueUSD: c.valueUSD,
          value: Math.round(c.valueUSD * rate),
          percentage: total > 0 ? (c.valueUSD / total) * 100 : 0,
          count: c.count,
          color: CATEGORY_PALETTE[c.category] || '#10b981',
        }))
        .sort((a, b) => b.value - a.value);
    }
  }, [flowType, filteredExpenses, filteredIncomes, rate]);

  // Graph data: Grouped by Timeline Date
  const graphData = useMemo(() => {
    const dateMap: Record<string, { date: string; amountUSD: number; count: number; items: string[] }> = {};

    if (flowType === 'OUTFLOW') {
      filteredExpenses.forEach((e) => {
        const d = e.date || 'Unknown';
        if (!dateMap[d]) {
          dateMap[d] = { date: d, amountUSD: 0, count: 0, items: [] };
        }
        dateMap[d].amountUSD += e.amount;
        dateMap[d].count += 1;
        if (dateMap[d].items.length < 3) {
          dateMap[d].items.push(e.title);
        }
      });
    } else {
      filteredIncomes.forEach((i) => {
        const d = i.date || 'Unknown';
        if (!dateMap[d]) {
          dateMap[d] = { date: d, amountUSD: 0, count: 0, items: [] };
        }
        dateMap[d].amountUSD += i.amount;
        dateMap[d].count += 1;
        if (dateMap[d].items.length < 3) {
          dateMap[d].items.push(i.source);
        }
      });
    }

    // Sort chronologically
    const sorted = Object.values(dateMap).sort((a, b) => a.date.localeCompare(b.date));

    // Convert amount to user currency
    return sorted.map((item) => {
      // Short label for display e.g. "01 Apr" or "18 Oct"
      let shortLabel = item.date;
      if (/^\d{4}-\d{2}-\d{2}$/.test(item.date)) {
        const [, m, d] = item.date.split('-');
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        shortLabel = `${d} ${monthNames[parseInt(m, 10) - 1] || m}`;
      }

      return {
        date: item.date,
        label: shortLabel,
        amount: Math.round(item.amountUSD * rate),
        amountUSD: item.amountUSD,
        count: item.count,
        items: item.items,
      };
    });
  }, [flowType, filteredExpenses, filteredIncomes, rate]);

  const topCategory = pieData.length > 0 ? pieData[0] : null;

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className={`rounded-3xl border border-[#e8e0d1] bg-white p-5 sm:p-6 shadow-xs hover:shadow-md transition-all space-y-5 w-full min-w-0 max-w-full overflow-hidden ${className}`}
    >
      {/* 1. Header with Flow Switcher & Format Toggle Buttons */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e8e0d1] pb-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-1.5 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-[#9e783e]">
              <Sparkles className="w-4 h-4" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              {title}
            </h3>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            {subtitle}
          </p>
        </div>

        {/* Dual Control Switchers */}
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Income vs Outflow Flow Switcher */}
          <div className="flex rounded-2xl bg-[#faf8f5] p-1 border border-[#e8e0d1] text-xs font-bold shadow-2xs">
            <button
              onClick={() => {
                setFlowType('OUTFLOW');
                setActiveCategoryFilter(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                flowType === 'OUTFLOW'
                  ? 'bg-rose-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingDown className="w-3.5 h-3.5" />
              <span>Outflows (Expenses)</span>
            </button>
            <button
              onClick={() => {
                setFlowType('INFLOW');
                setActiveCategoryFilter(null);
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                flowType === 'INFLOW'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Inflows (Income)</span>
            </button>
          </div>

          {/* Graph vs Pie Chart Format Switcher */}
          <div className="flex rounded-2xl bg-[#faf8f5] p-1 border border-[#e8e0d1] text-xs font-bold shadow-2xs">
            <button
              onClick={() => setChartFormat('GRAPH')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartFormat === 'GRAPH'
                  ? 'bg-[#17365d] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Timeline Graph"
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Graph</span>
            </button>
            <button
              onClick={() => setChartFormat('PIE')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all cursor-pointer ${
                chartFormat === 'PIE'
                  ? 'bg-[#9e783e] text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
              title="Switch to Category Pie Chart"
            >
              <PieIcon className="w-3.5 h-3.5" />
              <span>Pie Chart</span>
            </button>
          </div>

          {/* Time Range Filter */}
          <div className="flex rounded-2xl bg-[#faf8f5] p-1 border border-[#e8e0d1] text-xs font-bold shadow-2xs">
            {(['ALL', '30D', '6M'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setTimeRange(r)}
                className={`px-2.5 py-1 rounded-xl transition-all cursor-pointer ${
                  timeRange === r
                    ? 'bg-slate-800 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {r === 'ALL' ? 'All' : r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 2. Optional Account Filter Bar (if available) */}
      {(showAccountFilter || availableAccounts.length > 0) && (
        <div className="flex flex-wrap items-center gap-2 pt-0.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3" /> Account Filter:
          </span>
          <button
            onClick={() => setSelectedAccount('ALL')}
            className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedAccount === 'ALL'
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-[#faf8f5] text-slate-600 hover:bg-[#f4efe4] border border-[#e8e0d1]'
            }`}
          >
            All Accounts
          </button>
          {availableAccounts.map((acc) => (
            <button
              key={acc}
              onClick={() => setSelectedAccount(acc)}
              className={`px-2.5 py-1 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                selectedAccount === acc
                  ? 'bg-[#16836b] text-white shadow-xs'
                  : 'bg-[#faf8f5] text-slate-600 hover:bg-[#f4efe4] border border-[#e8e0d1]'
              }`}
            >
              {acc}
            </button>
          ))}
          {activeCategoryFilter && (
            <button
              onClick={() => setActiveCategoryFilter(null)}
              className="px-2.5 py-1 rounded-xl text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1 cursor-pointer"
            >
              <span>Category: {activeCategoryFilter}</span>
              <span className="font-extrabold">✕</span>
            </button>
          )}
        </div>
      )}

      {/* 3. High-Level Summary Stat Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Total {flowType === 'OUTFLOW' ? 'Spent' : 'Received'}
          </span>
          <div
            className={`text-lg sm:text-xl font-bold font-mono ${
              flowType === 'OUTFLOW' ? 'text-rose-700' : 'text-emerald-700'
            }`}
          >
            {flowType === 'OUTFLOW' ? '-' : '+'}
            {formatCurrency(currentTotalUSD, currency)}
          </div>
          <span className="text-[10px] text-slate-500">
            Across {transactionCount} logged entries
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Avg Transaction
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900">
            {formatCurrency(averageTxnDisplay / rate, currency)}
          </div>
          <span className="text-[10px] text-slate-500">Per transaction mean</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Top Category
          </span>
          <div className="text-sm sm:text-base font-extrabold text-slate-800 truncate">
            {topCategory ? topCategory.name : 'N/A'}
          </div>
          <span className="text-[10px] text-[#9e783e] font-semibold">
            {topCategory ? `${topCategory.percentage.toFixed(1)}% of total` : '--'}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Visualization Mode
          </span>
          <div className="text-sm sm:text-base font-bold text-slate-900 flex items-center gap-1.5">
            {chartFormat === 'GRAPH' ? (
              <>
                <BarChart3 className="w-4 h-4 text-[#17365d]" />
                <span>Timeline Trend</span>
              </>
            ) : (
              <>
                <PieIcon className="w-4 h-4 text-[#9e783e]" />
                <span>Category Donut</span>
              </>
            )}
          </div>
          <span className="text-[10px] text-slate-500">Interactive switcher</span>
        </div>
      </div>

      {/* 4. Chart Display Area (Graph vs Pie) */}
      <div className="w-full min-h-[300px]">
        {transactionCount === 0 ? (
          <div className="h-64 w-full flex flex-col items-center justify-center text-center p-6 bg-[#faf8f5]/60 rounded-2xl border border-dashed border-[#e8e0d1]">
            <div className="p-3 rounded-2xl bg-white border border-[#e8e0d1] text-[#9e783e] mb-2 shadow-xs">
              <PieIcon className="h-5 w-5" />
            </div>
            <h5 className="text-xs font-bold text-slate-900 mb-0.5">No {flowType.toLowerCase()} records</h5>
            <p className="text-[11px] text-slate-500 max-w-[260px] leading-snug font-medium">
              Import a bank statement or Google Pay export to unveil deep visualizations.
            </p>
          </div>
        ) : chartFormat === 'GRAPH' ? (
          /* Graph View: Area Chart Timeline */
          <div className="space-y-3">
            <div className="flex items-center justify-between text-xs text-slate-500 font-semibold px-1">
              <span className="flex items-center gap-1.5">
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    flowType === 'OUTFLOW' ? 'bg-rose-500' : 'bg-emerald-500'
                  }`}
                />
                {flowType === 'OUTFLOW' ? 'Daily Outflow Pattern' : 'Daily Inflow Pattern'}
              </span>
              <span>{graphData.length} active dates</span>
            </div>

            <div className="h-72 w-full min-w-0">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={graphData}
                  margin={{ top: 10, right: 10, left: -15, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="flowGradientRose" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#e11d48" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#e11d48" stopOpacity={0.0} />
                    </linearGradient>
                    <linearGradient id="flowGradientEmerald" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1ece1" />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#64748b', fontSize: 10, fontWeight: 600 }}
                  />
                  <YAxis
                    tick={{ fill: '#64748b', fontSize: 10 }}
                    tickFormatter={(v) => (v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v)}
                  />
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-[#e2d8c7] bg-white p-3 shadow-xl text-xs space-y-1.5 min-w-[160px]">
                            <div className="font-extrabold text-slate-900 flex items-center justify-between">
                              <span>{item.date}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 font-mono">
                                {item.count} txns
                              </span>
                            </div>
                            <div
                              className={`font-mono font-bold text-sm ${
                                flowType === 'OUTFLOW' ? 'text-rose-700' : 'text-emerald-700'
                              }`}
                            >
                              {flowType === 'OUTFLOW' ? '-' : '+'}
                              {formatCurrency(item.amountUSD, currency)}
                            </div>
                            {item.items && item.items.length > 0 && (
                              <div className="pt-1 border-t border-slate-100 text-[10px] text-slate-500 space-y-0.5">
                                <span className="font-semibold block text-slate-600">Sample entities:</span>
                                {item.items.map((ent: string, idx: number) => (
                                  <div key={idx} className="truncate max-w-[180px]">
                                    • {ent}
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke={flowType === 'OUTFLOW' ? '#e11d48' : '#10b981'}
                    strokeWidth={2.5}
                    fill={flowType === 'OUTFLOW' ? 'url(#flowGradientRose)' : 'url(#flowGradientEmerald)'}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        ) : (
          /* Pie Chart View: Donut + Category Breakdown List */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            {/* Donut graphic */}
            <div className="lg:col-span-5 h-64 w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={88}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        stroke="#ffffff"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const item = payload[0].payload;
                        return (
                          <div className="rounded-xl border border-[#e2d8c7] bg-white p-3 shadow-xl text-xs space-y-1">
                            <div className="font-extrabold text-slate-900">{item.name}</div>
                            <div
                              className={`font-mono font-bold text-sm ${
                                flowType === 'OUTFLOW' ? 'text-rose-700' : 'text-emerald-700'
                              }`}
                            >
                              {flowType === 'OUTFLOW' ? '-' : '+'}
                              {formatCurrency(item.valueUSD, currency)}
                            </div>
                            <div className="text-slate-500 font-semibold">
                              {item.percentage.toFixed(1)}% of total ({item.count} transactions)
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Total {flowType === 'OUTFLOW' ? 'Spend' : 'Inflow'}
                </span>
                <span className="text-sm font-extrabold font-mono text-slate-900">
                  {formatCurrency(currentTotalUSD, currency)}
                </span>
                <span className="text-[10px] text-slate-500 font-semibold">
                  {pieData.length} Categories
                </span>
              </div>
            </div>

            {/* Category ranking and breakdown */}
            <div className="lg:col-span-7 space-y-2.5 max-h-72 overflow-y-auto pr-1">
              {pieData.map((item) => (
                <div
                  key={item.category}
                  onClick={() =>
                    setActiveCategoryFilter(
                      activeCategoryFilter === item.category ? null : item.category
                    )
                  }
                  className={`p-2.5 rounded-xl border transition-all cursor-pointer flex flex-col gap-1.5 ${
                    activeCategoryFilter === item.category
                      ? 'border-[#9e783e] bg-[#faf8f5] shadow-xs'
                      : 'border-slate-100 bg-[#faf8f5]/50 hover:bg-[#faf8f5] hover:border-[#e8e0d1]'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-bold text-slate-800">{item.name}</span>
                      <span className="text-[10px] text-slate-500 font-semibold">
                        ({item.count} txns)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900">
                        {formatCurrency(item.valueUSD, currency)}
                      </span>
                      <span className="text-[11px] font-bold text-slate-600 w-10 text-right">
                        {item.percentage.toFixed(1)}%
                      </span>
                    </div>
                  </div>

                  {/* Progress bar */}
                  <div className="h-1.5 w-full rounded-full bg-slate-200 overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${item.percentage}%`,
                        backgroundColor: item.color,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </motion.div>
  );
};
