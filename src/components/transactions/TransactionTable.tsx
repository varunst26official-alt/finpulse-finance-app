import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import {
  formatCurrency,
  CATEGORY_COLORS,
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
} from 'lucide-react';
import { Transaction, TransactionType, ExpenseItem, IncomeItem, Asset } from '@/types/finance';
import { motion, AnimatePresence } from 'framer-motion';

type LedgerTab = 'TRADES' | 'EXPENSES' | 'INCOME' | 'FIXED_ASSETS';

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
    getPortfolioSummary,
  } = useFinanceStore();

  const [activeLedgerTab, setActiveLedgerTab] = useState<LedgerTab>('TRADES');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const summary = getPortfolioSummary();

  // Filtered Trades
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx: Transaction) => {
      const matchesSearch =
        tx.assetSymbol.toLowerCase().includes(search.toLowerCase()) ||
        tx.assetName.toLowerCase().includes(search.toLowerCase()) ||
        (tx.notes && tx.notes.toLowerCase().includes(search.toLowerCase()));

      const matchesType = filterType === 'ALL' || tx.type === filterType;
      return matchesSearch && matchesType;
    });
  }, [transactions, search, filterType]);

  // Filtered Expenses
  const filteredExpenses = useMemo(() => {
    return expenses.filter((exp: ExpenseItem) => {
      return (
        exp.title.toLowerCase().includes(search.toLowerCase()) ||
        EXPENSE_CATEGORY_LABELS[exp.category].toLowerCase().includes(search.toLowerCase()) ||
        (exp.notes && exp.notes.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [expenses, search]);

  // Filtered Incomes
  const filteredIncomes = useMemo(() => {
    return incomes.filter((inc: IncomeItem) => {
      return (
        inc.source.toLowerCase().includes(search.toLowerCase()) ||
        INCOME_CATEGORY_LABELS[inc.category].toLowerCase().includes(search.toLowerCase()) ||
        (inc.notes && inc.notes.toLowerCase().includes(search.toLowerCase()))
      );
    });
  }, [incomes, search]);

  // Filtered Fixed Assets (Excluding plain equities to focus on real estate, FDs, gold, PPF)
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

  return (
    <motion.div
      whileHover={{ y: -2, transition: { duration: 0.2 } }}
      className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs hover:shadow-md transition-all space-y-6"
    >
      {/* Top Cash Flow & Wealth Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 p-4 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1]">
        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Monthly Inflow
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-emerald-700">
            +{formatCurrency(summary.totalMonthlyIncome, currency)}
          </div>
          <span className="text-[10px] text-slate-500">Salary, rental & freelance</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Monthly Outflows
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-rose-700">
            -{formatCurrency(summary.totalMonthlyExpenses, currency)}
          </div>
          <span className="text-[10px] text-slate-500">Rent, EMI & spending</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Net Savings Rate
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 flex items-center gap-1">
            <span>{summary.monthlySavingsRate.toFixed(1)}%</span>
            <span className="text-[10px] font-normal text-emerald-700 bg-emerald-100 px-1 rounded">
              Healthy
            </span>
          </div>
          <span className="text-[10px] text-slate-500">Surplus invested monthly</span>
        </div>

        <div>
          <span className="text-[11px] font-bold uppercase text-slate-500 block mb-0.5">
            Emergency Runway
          </span>
          <div className="text-lg sm:text-xl font-bold font-mono text-[#9e783e]">
            {summary.liquidRunwayMonths.toFixed(1)} Months
          </div>
          <span className="text-[10px] text-slate-500">Liquid reserve duration</span>
        </div>
      </div>

      {/* Table Controls & Sub-Tab Switcher */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-[#e8e0d1] pb-4">
        {/* Ledger Sub-tabs */}
        <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] text-xs font-bold">
          {[
            { id: 'TRADES', label: 'Stock & Trade Ledger', icon: TrendingUp, count: transactions.length },
            { id: 'EXPENSES', label: 'Spent Expenses', icon: Receipt, count: expenses.length },
            { id: 'INCOME', label: 'Income Inflows', icon: Wallet, count: incomes.length },
            { id: 'FIXED_ASSETS', label: 'Real Estate & Fixed Wealth', icon: Building2, count: filteredAssets.length },
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeLedgerTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveLedgerTab(tab.id as LedgerTab);
                  setSearch('');
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

        {/* Search & Filter Controls */}
        <div className="flex items-center gap-2.5">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder={`Search ${activeLedgerTab.toLowerCase()}...`}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 sm:w-64 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
            />
          </div>

          {activeLedgerTab === 'TRADES' && (
            <div className="flex rounded-xl bg-[#faf8f5] p-1 border border-[#e8e0d1] text-xs font-bold">
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
        </div>
      </div>

      {/* Dynamic Tab Tables */}
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
                      No trades match your search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx: Transaction) => (
                    <tr key={tx.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3 text-slate-600 font-medium font-mono">{tx.date}</td>
                      <td className="py-3">{typePill(tx.type)}</td>
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <span
                            className="h-2.5 w-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#9e783e' }}
                          ></span>
                          <div>
                            <div className="font-bold text-slate-900">{tx.assetSymbol}</div>
                            <div className="text-[11px] text-slate-500 truncate max-w-[200px]">
                              {tx.notes || tx.assetName}
                            </div>
                          </div>
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
        {/* TAB 2: SPENT EXPENSES */}
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
                  <th className="pb-3 pt-1">Expense Title</th>
                  <th className="pb-3 pt-1">Category</th>
                  <th className="pb-3 pt-1">Payment Mode</th>
                  <th className="pb-3 pt-1 text-center">Frequency</th>
                  <th className="pb-3 pt-1 text-right">Amount</th>
                  <th className="pb-3 pt-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ece1] text-slate-700">
                {filteredExpenses.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No expenses recorded yet. Click "+ Add Trade" above to log an expense!
                    </td>
                  </tr>
                ) : (
                  filteredExpenses.map((exp: ExpenseItem) => (
                    <tr key={exp.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3 text-slate-600 font-mono font-medium">{exp.date}</td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{exp.title}</div>
                        {exp.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {exp.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {EXPENSE_CATEGORY_LABELS[exp.category]}
                        </span>
                      </td>
                      <td className="py-3">
                        <span className="inline-flex items-center gap-1 text-slate-600 font-medium">
                          <CreditCard className="h-3 w-3 text-slate-400" />
                          {PAYMENT_METHOD_LABELS[exp.paymentMethod]}
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
                      <td className="py-3 text-right font-extrabold font-mono text-rose-700">
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
        {/* TAB 3: INCOME INFLOWS */}
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
                  <th className="pb-3 pt-1">Income Stream</th>
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
                      No income streams recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredIncomes.map((inc: IncomeItem) => (
                    <tr key={inc.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3 text-slate-600 font-mono font-medium">{inc.date}</td>
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{inc.source}</div>
                        {inc.notes && (
                          <div className="text-[11px] text-slate-500 truncate max-w-xs">
                            {inc.notes}
                          </div>
                        )}
                      </td>
                      <td className="py-3">
                        <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-semibold border border-emerald-200">
                          {INCOME_CATEGORY_LABELS[inc.category]}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">
                        {inc.account || 'Primary Bank'}
                      </td>
                      <td className="py-3 text-center">
                        <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700">
                          {inc.frequency}
                        </span>
                      </td>
                      <td className="py-3 text-right font-extrabold font-mono text-emerald-700">
                        +{formatCurrency(inc.amount, currency)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => deleteIncome(inc.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete income"
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
        {/* TAB 4: REAL ESTATE & FIXED WEALTH */}
        {/* ============================================================== */}
        {activeLedgerTab === 'FIXED_ASSETS' && (
          <motion.div
            key="assets-tab"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
            className="overflow-x-auto"
          >
            <table className="w-full text-left text-xs">
              <thead className="border-b border-[#e8e0d1] text-slate-500 uppercase text-[11px] font-bold tracking-wider">
                <tr>
                  <th className="pb-3 pt-1">Asset Name</th>
                  <th className="pb-3 pt-1">Class</th>
                  <th className="pb-3 pt-1">Institution / Registry</th>
                  <th className="pb-3 pt-1 text-center">Expected Yield</th>
                  <th className="pb-3 pt-1 text-right">Invested Basis</th>
                  <th className="pb-3 pt-1 text-right">Current Valuation</th>
                  <th className="pb-3 pt-1 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f2ece1] text-slate-700">
                {filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="py-8 text-center text-slate-500 font-medium">
                      No fixed assets or real estate recorded yet.
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((a: Asset) => (
                    <tr key={a.id} className="hover:bg-[#faf8f5] transition-colors">
                      <td className="py-3">
                        <div className="font-bold text-slate-900">{a.name}</div>
                        <div className="text-[11px] font-mono text-slate-500">{a.symbol}</div>
                      </td>
                      <td className="py-3">
                        <span
                          className="px-2.5 py-1 rounded-md text-[11px] font-semibold text-white"
                          style={{ backgroundColor: CATEGORY_COLORS[a.category] || '#9e783e' }}
                        >
                          {CATEGORY_LABELS[a.category]}
                        </span>
                      </td>
                      <td className="py-3 text-slate-600 font-medium">
                        {a.institution || 'Direct Ownership'}
                      </td>
                      <td className="py-3 text-center font-mono font-bold text-emerald-700">
                        {a.expectedReturnRate ? `${a.expectedReturnRate}% p.a.` : '—'}
                      </td>
                      <td className="py-3 text-right font-mono font-medium text-slate-600">
                        {formatCurrency(a.averageBuyPrice * a.quantity, currency)}
                      </td>
                      <td className="py-3 text-right font-extrabold font-mono text-slate-900">
                        {formatCurrency(a.currentMarketPrice * a.quantity, currency)}
                      </td>
                      <td className="py-3 text-center">
                        <button
                          onClick={() => deleteAsset(a.id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete asset"
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
      </AnimatePresence>
    </motion.div>
  );
};
