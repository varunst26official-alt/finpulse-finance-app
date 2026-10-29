import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  formatCurrency,
  CATEGORY_LABELS,
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/utils/formatters';
import {
  Search,
  ArrowDownLeft,
  ArrowUpRight,
  DollarSign,
  Trash2,
  TrendingUp,
  Receipt,
  Wallet,
  Building2,
  CreditCard,
  Calendar,
  ChevronLeft,
  ChevronRight,
  Filter,
  ArrowUpDown,
  RotateCcw,
} from 'lucide-react';
import {
  Transaction,
  TransactionType,
  ExpenseItem,
  IncomeItem,
  Asset,
  ExpenseCategory,
  IncomeCategory,
} from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';
import { CashFlowVisualizationCard } from '@/components/finance/CashFlowVisualizationCard';

type LedgerTab = 'TRADES' | 'EXPENSES' | 'INCOME' | 'FIXED_ASSETS';
type SortOption = 'DATE_DESC' | 'DATE_ASC' | 'AMOUNT_DESC' | 'AMOUNT_ASC';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

export const TransactionTable: React.FC = () => {
  const {
    transactions,
    expenses,
    incomes,
    assets,
    currency,
    deleteTransaction,
    deleteExpense,
    deleteIncome,
    deleteAsset,
  } = useFinanceStore();

  const [activeLedgerTab, setActiveLedgerTab] = useState<LedgerTab>('TRADES');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');
  const [filterPaymentMode, setFilterPaymentMode] = useState<string>('ALL');
  const [sortBy, setSortBy] = useState<SortOption>('DATE_DESC');

  // Extract all distinct months (YYYY-MM) from expenses and incomes
  const availableMonths = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => e.date && set.add(e.date.slice(0, 7)));
    incomes.forEach((i) => i.date && set.add(i.date.slice(0, 7)));
    // Sort descending (latest month first)
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [expenses, incomes]);

  // Determine smart default month (current month if has data, else latest month with data)
  const defaultMonth = useMemo(() => {
    const nowMonth = '2026-10'; // or current system month
    if (availableMonths.includes(nowMonth)) return nowMonth;
    return availableMonths[0] || 'ALL';
  }, [availableMonths]);

  const [selectedMonth, setSelectedMonth] = useState<string>(defaultMonth);

  // Keep selectedMonth updated if defaultMonth changes and current selected is invalid
  React.useEffect(() => {
    if (selectedMonth !== 'ALL' && !availableMonths.includes(selectedMonth) && availableMonths.length > 0) {
      setSelectedMonth(availableMonths[0]);
    }
  }, [availableMonths, selectedMonth]);

  // Month navigation handlers
  const handlePrevMonth = () => {
    if (availableMonths.length === 0) return;
    const currentIdx = availableMonths.indexOf(selectedMonth);
    if (currentIdx === -1) {
      setSelectedMonth(availableMonths[0]);
    } else if (currentIdx < availableMonths.length - 1) {
      setSelectedMonth(availableMonths[currentIdx + 1]);
    }
  };

  const handleNextMonth = () => {
    if (availableMonths.length === 0) return;
    const currentIdx = availableMonths.indexOf(selectedMonth);
    if (currentIdx > 0) {
      setSelectedMonth(availableMonths[currentIdx - 1]);
    }
  };

  // Monthly stats calculated strictly for the selected month (or all if ALL)
  const monthlyMetrics = useMemo(() => {
    const isAll = selectedMonth === 'ALL';
    const monthExpenses = isAll
      ? expenses
      : expenses.filter((e) => e.date && e.date.startsWith(selectedMonth));
    const monthIncomes = isAll
      ? incomes
      : incomes.filter((i) => i.date && i.date.startsWith(selectedMonth));

    const totalInflowUSD = monthIncomes.reduce((sum, i) => sum + i.amount, 0);
    const totalOutflowUSD = monthExpenses.reduce((sum, e) => sum + e.amount, 0);
    const netSurplusUSD = totalInflowUSD - totalOutflowUSD;

    const savingsRate =
      totalInflowUSD > 0
        ? Math.max(0, ((totalInflowUSD - totalOutflowUSD) / totalInflowUSD) * 100)
        : 0;

    const liquidReserve =
      assets
        .filter((a) => a.category === 'LIQUID_CASH')
        .reduce((sum, a) => sum + a.quantity * a.currentMarketPrice, 0) || 2000;
    const runwayMonths = totalOutflowUSD > 0 ? liquidReserve / totalOutflowUSD : 6;

    return {
      totalInflowUSD,
      totalOutflowUSD,
      netSurplusUSD,
      savingsRate,
      runwayMonths,
      expenseCount: monthExpenses.length,
      incomeCount: monthIncomes.length,
    };
  }, [selectedMonth, expenses, incomes, assets]);

  // Unique payment methods / accounts found in expenses/incomes
  const availablePaymentModes = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.paymentMethod) set.add(e.paymentMethod);
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

  // Unique categories for active ledger tab
  const activeTabCategories = useMemo(() => {
    if (activeLedgerTab === 'EXPENSES') {
      const set = new Set<string>();
      expenses.forEach((e) => set.add(e.category));
      return Array.from(set);
    }
    if (activeLedgerTab === 'INCOME') {
      const set = new Set<string>();
      incomes.forEach((i) => set.add(i.category));
      return Array.from(set);
    }
    return [];
  }, [activeLedgerTab, expenses, incomes]);

  // Reset all filters helper
  const handleResetFilters = () => {
    setSearch('');
    setFilterCategory('ALL');
    setFilterPaymentMode('ALL');
    setFilterType('ALL');
    setSortBy('DATE_DESC');
  };

  const hasActiveFilters =
    search.trim() !== '' ||
    filterCategory !== 'ALL' ||
    filterPaymentMode !== 'ALL' ||
    filterType !== 'ALL' ||
    sortBy !== 'DATE_DESC';

  // 1. Filtered Trades (Sorted descending by date)
  const filteredTransactions = useMemo(() => {
    let list = transactions.filter((tx: Transaction) => {
      const matchesSearch =
        tx.assetSymbol.toLowerCase().includes(search.toLowerCase()) ||
        tx.assetName.toLowerCase().includes(search.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesType = filterType === 'ALL' || tx.type === filterType;
      return matchesSearch && matchesType;
    });

    return list.sort((a, b) => {
      if (sortBy === 'DATE_DESC') return b.date.localeCompare(a.date);
      if (sortBy === 'DATE_ASC') return a.date.localeCompare(b.date);
      if (sortBy === 'AMOUNT_DESC') return b.totalAmount - a.totalAmount;
      if (sortBy === 'AMOUNT_ASC') return a.totalAmount - b.totalAmount;
      return b.date.localeCompare(a.date);
    });
  }, [transactions, search, filterType, sortBy]);

  // 2. Filtered Expenses (Sorted descending by date with month, category, payment mode filters)
  const filteredExpenses = useMemo(() => {
    let list = expenses.filter((exp: ExpenseItem) => {
      // Month filter
      if (selectedMonth !== 'ALL' && exp.date && !exp.date.startsWith(selectedMonth)) {
        return false;
      }
      // Category filter
      if (filterCategory !== 'ALL' && exp.category !== filterCategory) {
        return false;
      }
      // Payment mode / Account filter
      if (filterPaymentMode !== 'ALL') {
        const matchesMethod = exp.paymentMethod === filterPaymentMode;
        const matchesInNotes =
          exp.notes && exp.notes.toLowerCase().includes(filterPaymentMode.toLowerCase());
        if (!matchesMethod && !matchesInNotes) return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesTitle = exp.title.toLowerCase().includes(q);
        const matchesCat = (
          EXPENSE_CATEGORY_LABELS[exp.category] || exp.category
        ).toLowerCase().includes(q);
        const matchesNotes = exp.notes ? exp.notes.toLowerCase().includes(q) : false;
        const matchesAmount = exp.amount.toString().includes(q);
        if (!matchesTitle && !matchesCat && !matchesNotes && !matchesAmount) return false;
      }
      return true;
    });

    // Default sorting: Newest first (Descending)
    return list.sort((a, b) => {
      if (sortBy === 'DATE_DESC') return b.date.localeCompare(a.date);
      if (sortBy === 'DATE_ASC') return a.date.localeCompare(b.date);
      if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount;
      if (sortBy === 'AMOUNT_ASC') return a.amount - b.amount;
      return b.date.localeCompare(a.date);
    });
  }, [expenses, selectedMonth, filterCategory, filterPaymentMode, search, sortBy]);

  // 3. Filtered Incomes (Sorted descending by date with month, category, account filters)
  const filteredIncomes = useMemo(() => {
    let list = incomes.filter((inc: IncomeItem) => {
      // Month filter
      if (selectedMonth !== 'ALL' && inc.date && !inc.date.startsWith(selectedMonth)) {
        return false;
      }
      // Category filter
      if (filterCategory !== 'ALL' && inc.category !== filterCategory) {
        return false;
      }
      // Account / Mode filter
      if (filterPaymentMode !== 'ALL') {
        const matchesAcc =
          inc.account && inc.account.toLowerCase().includes(filterPaymentMode.toLowerCase());
        const matchesNotes =
          inc.notes && inc.notes.toLowerCase().includes(filterPaymentMode.toLowerCase());
        if (!matchesAcc && !matchesNotes) return false;
      }
      // Search
      if (search.trim()) {
        const q = search.toLowerCase();
        const matchesSource = inc.source.toLowerCase().includes(q);
        const matchesCat = (
          INCOME_CATEGORY_LABELS[inc.category] || inc.category
        ).toLowerCase().includes(q);
        const matchesNotes = inc.notes ? inc.notes.toLowerCase().includes(q) : false;
        const matchesAmount = inc.amount.toString().includes(q);
        if (!matchesSource && !matchesCat && !matchesNotes && !matchesAmount) return false;
      }
      return true;
    });

    // Default sorting: Newest first (Descending)
    return list.sort((a, b) => {
      if (sortBy === 'DATE_DESC') return b.date.localeCompare(a.date);
      if (sortBy === 'DATE_ASC') return a.date.localeCompare(b.date);
      if (sortBy === 'AMOUNT_DESC') return b.amount - a.amount;
      if (sortBy === 'AMOUNT_ASC') return a.amount - b.amount;
      return b.date.localeCompare(a.date);
    });
  }, [incomes, selectedMonth, filterCategory, filterPaymentMode, search, sortBy]);

  // 4. Filtered Fixed Assets
  const filteredAssets = useMemo(() => {
    return assets
      .filter((a: Asset) => a.category !== 'EQUITY' && a.category !== 'CRYPTO')
      .filter((a: Asset) => {
        return (
          a.name.toLowerCase().includes(search.toLowerCase()) ||
          a.symbol.toLowerCase().includes(search.toLowerCase()) ||
          (a.institution && a.institution.toLowerCase().includes(search.toLowerCase()))
        );
      });
  }, [assets, search]);

  const typePill = (type: TransactionType) => {
    switch (type) {
      case 'BUY':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-800 border border-emerald-200">
            <ArrowDownLeft className="h-3 w-3" /> BUY
          </span>
        );
      case 'SELL':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-50 px-2.5 py-1 text-xs font-bold text-rose-800 border border-rose-200">
            <ArrowUpRight className="h-3 w-3" /> SELL
          </span>
        );
      case 'SIP':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-800 border border-sky-200">
            <Calendar className="h-3 w-3" /> SIP
          </span>
        );
      case 'DIVIDEND':
      case 'INTEREST':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-800 border border-amber-200">
            <DollarSign className="h-3 w-3" /> {type}
          </span>
        );
    }
  };

  // Month label formatter (e.g. "September 2026")
  const formatMonthLabel = (m: string) => {
    if (m === 'ALL') return 'All Time (All Months)';
    const [y, mon] = m.split('-');
    const name = MONTH_NAMES[parseInt(mon, 10) - 1] || mon;
    return `${name} ${y}`;
  };

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs hover:shadow-md transition-all space-y-6"
    >
      {/* 1. Month Switcher Control Strip */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl bg-white border border-[#e8e0d1] text-[#9e783e]">
            <Calendar className="h-4 w-4" />
          </div>
          <div>
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
              Active Financial Period
            </span>
            <span className="text-sm font-extrabold text-slate-900">
              {formatMonthLabel(selectedMonth)}
            </span>
          </div>
        </div>

        {/* Month Selector Controls */}
        <div className="flex flex-wrap items-center gap-1.5">
          <button
            onClick={handlePrevMonth}
            disabled={
              availableMonths.length === 0 ||
              availableMonths.indexOf(selectedMonth) === availableMonths.length - 1
            }
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 border border-[#e8e0d1] text-slate-700 transition-all cursor-pointer"
            title="Previous Month"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <select
            value={selectedMonth}
            onChange={(e) => setSelectedMonth(e.target.value)}
            className="rounded-xl bg-white border border-[#e8e0d1] px-3 py-1.5 text-xs font-bold text-slate-800 shadow-2xs focus:outline-hidden cursor-pointer"
          >
            <option value="ALL">All Time / All Months</option>
            {availableMonths.map((m) => (
              <option key={m} value={m}>
                {formatMonthLabel(m)}
              </option>
            ))}
          </select>

          <button
            onClick={handleNextMonth}
            disabled={
              availableMonths.length === 0 || availableMonths.indexOf(selectedMonth) <= 0
            }
            className="p-1.5 rounded-xl bg-white hover:bg-slate-100 disabled:opacity-40 border border-[#e8e0d1] text-slate-700 transition-all cursor-pointer"
            title="Next Month"
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          {selectedMonth !== 'ALL' && (
            <button
              onClick={() => setSelectedMonth('ALL')}
              className="px-2.5 py-1.5 rounded-xl bg-white hover:bg-[#f4efe4] border border-[#e8e0d1] text-[11px] font-bold text-slate-700 transition-all cursor-pointer"
            >
              View All
            </button>
          )}

          <span className="ml-1 text-[11px] font-semibold text-slate-500 hidden md:inline">
            ({monthlyMetrics.expenseCount} debits • {monthlyMetrics.incomeCount} credits)
          </span>
        </div>
      </div>

      {/* 2. Top Cash Flow & Wealth Metrics Strip (Calculated for Selected Month) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Monthly Inflow
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-700">
            +{formatCurrency(monthlyMetrics.totalInflowUSD, currency)}
          </div>
          <span className="text-[10px] text-slate-500">
            {selectedMonth === 'ALL' ? 'Total all-time credits' : `${formatMonthLabel(selectedMonth)} income`}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Monthly Outflows
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-700">
            -{formatCurrency(monthlyMetrics.totalOutflowUSD, currency)}
          </div>
          <span className="text-[10px] text-slate-500">
            {selectedMonth === 'ALL' ? 'Total all-time debits' : `${formatMonthLabel(selectedMonth)} expenses`}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Net Savings Rate
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 flex items-center gap-1">
            <span>{monthlyMetrics.savingsRate.toFixed(1)}%</span>
            <span
              className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                monthlyMetrics.netSurplusUSD >= 0
                  ? 'text-emerald-700 bg-emerald-100'
                  : 'text-rose-700 bg-rose-100'
              }`}
            >
              {monthlyMetrics.netSurplusUSD >= 0 ? 'Surplus' : 'Deficit'}
            </span>
          </div>
          <span className="text-[10px] text-slate-500">
            Net: {formatCurrency(monthlyMetrics.netSurplusUSD, currency)}
          </span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Emergency Runway
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#9e783e]">
            {monthlyMetrics.runwayMonths.toFixed(1)} Months
          </div>
          <span className="text-[10px] text-slate-500">Based on monthly burn</span>
        </div>
      </div>

      {/* 3. Cash Flow & Category Data Visualization (Switchable Graph & Pie Chart) */}
      <CashFlowVisualizationCard
        title="Ledger Cash Flow Analytics"
        subtitle={`Switchable timeline graph and category pie chart for ${formatMonthLabel(selectedMonth)}`}
        defaultFlow={activeLedgerTab === 'INCOME' ? 'INFLOW' : 'OUTFLOW'}
        defaultFormat="GRAPH"
        selectedMonth={selectedMonth}
        onMonthChange={setSelectedMonth}
      />

      {/* 4. Table Controls, Ledger Tabs & Filter Suite */}
      <div className="space-y-3 border-b border-[#e8e0d1] pb-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Ledger Sub-tabs */}
          <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs font-bold">
            {[
              {
                id: 'TRADES',
                label: 'Stock & Trade Ledger',
                icon: TrendingUp,
                count: transactions.length,
              },
              {
                id: 'EXPENSES',
                label: 'Spent Expenses',
                icon: Receipt,
                count: filteredExpenses.length,
              },
              {
                id: 'INCOME',
                label: 'Income Inflows',
                icon: Wallet,
                count: filteredIncomes.length,
              },
              {
                id: 'FIXED_ASSETS',
                label: 'Real Estate & Fixed Wealth',
                icon: Building2,
                count: filteredAssets.length,
              },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeLedgerTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveLedgerTab(tab.id as LedgerTab);
                    setFilterCategory('ALL');
                  }}
                  className={`flex items-center gap-1.5 py-2 px-3 rounded-xl transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#9e783e] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#f4efe4]'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span>{tab.label}</span>
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-mono ${
                      isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {tab.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search in ${activeLedgerTab.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-full sm:w-64 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
            />
          </div>
        </div>

        {/* Rich Filter Bar: Category, Payment Mode, Sort By */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1">
            <Filter className="w-3 h-3 text-[#9e783e]" /> Filters:
          </span>

          {/* Trade Type Filter (Only for TRADES tab) */}
          {activeLedgerTab === 'TRADES' && (
            <div className="flex rounded-xl bg-[#faf8f5] p-0.5 border border-[#e8e0d1] text-xs font-bold">
              {['ALL', 'BUY', 'SELL', 'DIVIDEND'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilterType(type)}
                  className={`px-2 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === type
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          )}

          {/* Category Dropdown (For Expenses and Incomes) */}
          {activeTabCategories.length > 0 && (
            <div className="flex items-center gap-1 bg-[#faf8f5] px-2.5 py-1 rounded-xl border border-[#e8e0d1] text-xs font-semibold">
              <span className="text-slate-400 text-[11px]">Category:</span>
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value)}
                className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
              >
                <option value="ALL">All Categories</option>
                {activeTabCategories.map((cat) => {
                  const label =
                    activeLedgerTab === 'EXPENSES'
                      ? EXPENSE_CATEGORY_LABELS[cat as ExpenseCategory] || cat
                      : INCOME_CATEGORY_LABELS[cat as IncomeCategory] || cat;
                  return (
                    <option key={cat} value={cat}>
                      {label}
                    </option>
                  );
                })}
              </select>
            </div>
          )}

          {/* Payment Mode / Account Dropdown */}
          {(activeLedgerTab === 'EXPENSES' || activeLedgerTab === 'INCOME') &&
            availablePaymentModes.length > 0 && (
              <div className="flex items-center gap-1 bg-[#faf8f5] px-2.5 py-1 rounded-xl border border-[#e8e0d1] text-xs font-semibold">
                <span className="text-slate-400 text-[11px]">Payment/Account:</span>
                <select
                  value={filterPaymentMode}
                  onChange={(e) => setFilterPaymentMode(e.target.value)}
                  className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer max-w-[150px] truncate"
                >
                  <option value="ALL">All Modes / Accounts</option>
                  {availablePaymentModes.map((mode) => (
                    <option key={mode} value={mode}>
                      {PAYMENT_METHOD_LABELS[mode as keyof typeof PAYMENT_METHOD_LABELS] || mode}
                    </option>
                  ))}
                </select>
              </div>
            )}

          {/* Sort Order Selector (Descending Default) */}
          <div className="flex items-center gap-1 bg-[#faf8f5] px-2.5 py-1 rounded-xl border border-[#e8e0d1] text-xs font-semibold">
            <ArrowUpDown className="w-3 h-3 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="bg-transparent text-slate-800 font-bold focus:outline-hidden cursor-pointer"
            >
              <option value="DATE_DESC">Date (Newest First) ↓</option>
              <option value="DATE_ASC">Date (Oldest First) ↑</option>
              <option value="AMOUNT_DESC">Amount (Highest First) ↓</option>
              <option value="AMOUNT_ASC">Amount (Lowest First) ↑</option>
            </select>
          </div>

          {/* Reset Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={handleResetFilters}
              className="flex items-center gap-1 px-2.5 py-1 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer"
              title="Reset all filters"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>

      {/* 5. Dynamic Tab Tables */}
      <AnimatePresence mode="wait">
        {/* ============================================================== */}
        {/* TAB 1: TRADES LEDGER */}
        {/* ============================================================== */}
        {activeLedgerTab === 'TRADES' && (
          <motion.div
            key="trades-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e8e0d1] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="pb-3 pt-1">Date</th>
                  <th className="pb-3 pt-1">Type</th>
                  <th className="pb-3 pt-1">Instrument</th>
                  <th className="pb-3 pt-1 text-right">Quantity</th>
                  <th className="pb-3 pt-1 text-right">Price/Unit</th>
                  <th className="pb-3 pt-1 text-right">Total Amount</th>
                  <th className="pb-3 pt-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ece1] text-slate-700">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No matching trade transactions found.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx: Transaction) => (
                    <tr key={tx.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3 text-slate-600 font-mono font-medium">{tx.date}</td>
                      <td className="py-3">{typePill(tx.type)}</td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{tx.assetName}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          {tx.assetSymbol}
                        </div>
                      </td>
                      <td className="py-3 text-right text-slate-900 font-mono font-bold">
                        {tx.quantity}
                      </td>
                      <td className="py-3 text-right text-slate-600 font-mono font-medium">
                        {formatCurrency(tx.pricePerUnit, currency)}
                      </td>
                      <td className="py-3 text-right font-extrabold font-mono text-slate-900">
                        {formatCurrency(tx.totalAmount, currency)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => deleteTransaction(tx.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete trade"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* TAB 2: SPENT EXPENSES (Sorted Descending with Detailed Info) */}
        {/* ============================================================== */}
        {activeLedgerTab === 'EXPENSES' && (
          <motion.div
            key="expenses-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e8e0d1] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="pb-3 pt-1">Date</th>
                  <th className="pb-3 pt-1">Expense Title / Payee</th>
                  <th className="pb-3 pt-1">Category</th>
                  <th className="pb-3 pt-1">Payment Mode / Account</th>
                  <th className="pb-3 pt-1 text-center">Frequency</th>
                  <th className="pb-3 pt-1 text-right">Amount</th>
                  <th className="pb-3 pt-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ece1] text-slate-700">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No expenses matching the filters for {formatMonthLabel(selectedMonth)}.
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp: ExpenseItem) => (
                    <tr key={exp.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3 text-slate-600 font-mono font-medium whitespace-nowrap">
                        {exp.date}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold whitespace-nowrap">
                          {EXPENSE_CATEGORY_LABELS[exp.category] || exp.category}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium whitespace-nowrap">
                          <CreditCard className="h-3 w-3 text-slate-400" />
                          {PAYMENT_METHOD_LABELS[exp.paymentMethod] || exp.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            exp.frequency === 'MONTHLY_RECURRING'
                              ? 'bg-amber-50 text-amber-800 border border-amber-200'
                              : 'bg-slate-100 text-slate-700'
                          }`}
                        >
                          {exp.frequency === 'MONTHLY_RECURRING' ? 'Monthly' : 'One-time'}
                        </span>
                      </td>
                      <td className="py-3 text-right font-extrabold font-mono text-rose-700 whitespace-nowrap">
                        -{formatCurrency(exp.amount, currency)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => deleteExpense(exp.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete expense"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* TAB 3: INCOME INFLOWS (Sorted Descending with Inflow Indicator) */}
        {/* ============================================================== */}
        {activeLedgerTab === 'INCOME' && (
          <motion.div
            key="income-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e8e0d1] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="pb-3 pt-1">Date</th>
                  <th className="pb-3 pt-1">Income Stream / Received From</th>
                  <th className="pb-3 pt-1">Category</th>
                  <th className="pb-3 pt-1">Credited Account</th>
                  <th className="pb-3 pt-1 text-center">Frequency</th>
                  <th className="pb-3 pt-1 text-right">Inflow Amount</th>
                  <th className="pb-3 pt-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ece1] text-slate-700">
                {filteredIncomes.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No income streams matching the filters for {formatMonthLabel(selectedMonth)}.
                    </td>
                  </tr>
                ) : (
                  filteredIncomes.map((inc: IncomeItem) => (
                    <tr key={inc.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3 text-slate-600 font-mono font-medium whitespace-nowrap">
                        {inc.date}
                      </td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{inc.source}</div>
                        {inc.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {inc.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200 whitespace-nowrap">
                          {INCOME_CATEGORY_LABELS[inc.category] || inc.category}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium whitespace-nowrap">
                          <Wallet className="h-3 w-3 text-slate-400" />
                          {inc.account || 'Primary Bank'}
                        </span>
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {inc.frequency}
                        </span>
                      </td>
                      <td className="py-3 text-right font-extrabold font-mono text-emerald-700 whitespace-nowrap">
                        +{formatCurrency(inc.amount, currency)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => deleteIncome(inc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete income entry"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </motion.div>
        )}

        {/* ============================================================== */}
        {/* TAB 4: REAL ESTATE & FIXED ASSETS */}
        {/* ============================================================== */}
        {activeLedgerTab === 'FIXED_ASSETS' && (
          <motion.div
            key="fixed-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e8e0d1] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="pb-3 pt-1">Asset Name</th>
                  <th className="pb-3 pt-1">Category</th>
                  <th className="pb-3 pt-1">Institution</th>
                  <th className="pb-3 pt-1 text-right">Acquisition Cost</th>
                  <th className="pb-3 pt-1 text-right">Current Valuation</th>
                  <th className="pb-3 pt-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ece1] text-slate-700">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-medium">
                      No real estate, fixed deposits, or gold recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((asset: Asset) => {
                    const cost = asset.quantity * asset.averageBuyPrice;
                    const valuation = asset.quantity * asset.currentMarketPrice;
                    return (
                      <tr key={asset.id} className="hover:bg-[#faf8f5] transition-colors">
                        <td className="py-3">
                          <div className="font-bold text-slate-900">{asset.name}</div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {asset.symbol}
                          </div>
                        </td>
                        <td className="py-3">
                          <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                            {CATEGORY_LABELS[asset.category] || asset.category}
                          </span>
                        </td>
                        <td className="py-3 text-slate-600 font-medium">
                          {asset.institution || 'Direct Holding'}
                        </td>
                        <td className="py-3 text-right text-slate-600 font-mono font-medium">
                          {formatCurrency(cost, currency)}
                        </td>
                        <td className="py-3 text-right font-extrabold font-mono text-slate-900">
                          {formatCurrency(valuation, currency)}
                        </td>
                        <td className="py-3 text-center">
                          <button
                            onClick={() => deleteAsset(asset.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Delete fixed asset"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
