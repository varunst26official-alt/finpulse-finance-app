import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import {
  formatCurrency,
  EXPENSE_CATEGORY_LABELS,
  INCOME_CATEGORY_LABELS,
  PAYMENT_METHOD_LABELS,
} from '@/utils/formatters';
import {
  Landmark,
  Zap,
  Calendar,
  Search,
  ArrowUpRight,
  ArrowDownLeft,
  FileSpreadsheet,
  Sparkles,
  CreditCard,
  Building2,
  Trash2,
  Receipt,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { CashFlowVisualizationCard } from '@/components/finance/CashFlowVisualizationCard';

interface BankStatementManagerProps {
  onOpenIngestion: () => void;
}

export const BankStatementManager: React.FC<BankStatementManagerProps> = ({
  onOpenIngestion,
}) => {
  const { expenses, incomes, currency, deleteExpense, deleteIncome } = useFinanceStore();
  const { setFinanceSubTab } = useLifeOSStore();

  const [selectedAccount, setSelectedAccount] = useState<string>('ALL');
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'DEBIT' | 'CREDIT'>('ALL');
  const [filterCategory, setFilterCategory] = useState<string>('ALL');

  // Identify all bank and UPI accounts from imported items
  const accountOptions = useMemo(() => {
    const set = new Set<string>();
    expenses.forEach((e) => {
      if (e.notes) {
        const match = e.notes.match(/\((.*?)\)/);
        if (match) set.add(match[1]);
      }
    });
    incomes.forEach((i) => {
      if (i.account) set.add(i.account);
    });
    // Add common accounts if empty
    if (set.size === 0) {
      set.add('ICICI RuPay Card XX03');
      set.add('Union Bank 6504');
      set.add('ICICI Bank 0781');
      set.add('IndusInd Bank 6245');
    }
    return Array.from(set);
  }, [expenses, incomes]);

  // Unified statement item model
  interface UnifiedTxn {
    id: string;
    originalId: string;
    type: 'DEBIT' | 'CREDIT';
    title: string;
    category: string;
    categoryLabel: string;
    amountUSD: number;
    date: string;
    accountRef: string;
    paymentMethod: string;
    notes?: string;
  }

  const allTransactions = useMemo<UnifiedTxn[]>(() => {
    const list: UnifiedTxn[] = [];

    expenses.forEach((e) => {
      let acc = 'UPI / Bank';
      if (e.notes && e.notes.includes('(')) {
        const m = e.notes.match(/\((.*?)\)/);
        if (m) acc = m[1];
      }
      list.push({
        id: `exp-${e.id}`,
        originalId: e.id,
        type: 'DEBIT',
        title: e.title,
        category: e.category,
        categoryLabel: EXPENSE_CATEGORY_LABELS[e.category] || e.category,
        amountUSD: e.amount,
        date: e.date,
        accountRef: acc,
        paymentMethod: PAYMENT_METHOD_LABELS[e.paymentMethod] || e.paymentMethod,
        notes: e.notes,
      });
    });

    incomes.forEach((i) => {
      list.push({
        id: `inc-${i.id}`,
        originalId: i.id,
        type: 'CREDIT',
        title: i.source,
        category: i.category,
        categoryLabel: INCOME_CATEGORY_LABELS[i.category] || i.category,
        amountUSD: i.amount,
        date: i.date,
        accountRef: i.account || 'Bank Deposit',
        paymentMethod: 'NET_BANKING',
        notes: i.notes,
      });
    });

    // Sort descending by date
    return list.sort((a, b) => b.date.localeCompare(a.date));
  }, [expenses, incomes]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return allTransactions.filter((txn) => {
      if (selectedAccount !== 'ALL') {
        const matchesAcc = txn.accountRef.toLowerCase().includes(selectedAccount.toLowerCase());
        const inNotes = txn.notes && txn.notes.toLowerCase().includes(selectedAccount.toLowerCase());
        if (!matchesAcc && !inNotes) return false;
      }

      if (filterType !== 'ALL' && txn.type !== filterType) return false;

      if (filterCategory !== 'ALL' && txn.category !== filterCategory) return false;

      if (search.trim()) {
        const query = search.toLowerCase();
        const matchesTitle = txn.title.toLowerCase().includes(query);
        const matchesCat = txn.categoryLabel.toLowerCase().includes(query);
        const matchesAcc = txn.accountRef.toLowerCase().includes(query);
        const matchesNotes = txn.notes ? txn.notes.toLowerCase().includes(query) : false;
        if (!matchesTitle && !matchesCat && !matchesAcc && !matchesNotes) return false;
      }

      return true;
    });
  }, [allTransactions, selectedAccount, filterType, filterCategory, search]);

  // Aggregated totals
  const totals = useMemo(() => {
    let debitsUSD = 0;
    let creditsUSD = 0;
    filteredTransactions.forEach((t) => {
      if (t.type === 'DEBIT') debitsUSD += t.amountUSD;
      else creditsUSD += t.amountUSD;
    });
    return {
      debitsUSD,
      creditsUSD,
      netUSD: creditsUSD - debitsUSD,
      count: filteredTransactions.length,
    };
  }, [filteredTransactions]);

  // CSV Export Engine
  const handleExportCSV = () => {
    const headers = ['Date', 'Entity / Description', 'Type', 'Category', `Amount (${currency})`, 'Account Reference', 'Notes'];
    const rows = filteredTransactions.map((t) => [
      t.date,
      `"${t.title.replace(/"/g, '""')}"`,
      t.type,
      `"${t.categoryLabel}"`,
      t.type === 'CREDIT' ? `+${t.amountUSD}` : `-${t.amountUSD}`,
      `"${t.accountRef}"`,
      `"${(t.notes || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Quantra_Bank_Statement_${selectedAccount}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Actions */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-500 to-emerald-600 text-white shadow-md shadow-indigo-500/20">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-heading font-extrabold text-slate-900 tracking-tight">
              Bank & UPI Statement Hub
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Reconciled accounts, multi-bank statements, UPI passes & automated classification
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={onOpenIngestion}
            className="px-4 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-emerald-600 hover:from-indigo-700 hover:to-emerald-700 text-white text-xs font-extrabold shadow-md shadow-indigo-600/20 hover:scale-[1.02] transition-all cursor-pointer flex items-center gap-1.5"
          >
            <Zap className="w-3.5 h-3.5 text-cyan-300" />
            <span>⚡ Import Statement (PDF / CSV / GPay)</span>
          </button>

          <button
            onClick={() => setFinanceSubTab('calendar')}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#e8e0d1] text-slate-700 hover:text-slate-900 hover:bg-[#faf8f5] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Calendar className="w-3.5 h-3.5 text-[#9e783e]" />
            <span>View in Calendar</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="px-3.5 py-2 rounded-xl bg-white border border-[#e8e0d1] text-slate-700 hover:text-slate-900 hover:bg-[#faf8f5] text-xs font-bold transition-all shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Export CSV</span>
          </button>
        </div>
      </motion.div>

      {/* 2. Account Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        <button
          onClick={() => setSelectedAccount('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
            selectedAccount === 'ALL'
              ? 'bg-[#17365d] text-white shadow-xs'
              : 'bg-white text-slate-600 hover:bg-[#faf8f5] border border-[#e8e0d1]'
          }`}
        >
          All Accounts ({allTransactions.length})
        </button>
        {accountOptions.map((acc) => (
          <button
            key={acc}
            onClick={() => setSelectedAccount(acc)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shrink-0 ${
              selectedAccount === acc
                ? 'bg-[#16836b] text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-[#faf8f5] border border-[#e8e0d1]'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 inline mr-1 opacity-70" />
            <span>{acc}</span>
          </button>
        ))}
      </div>

      {/* 3. Account High-Level KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-rose-200 bg-gradient-to-br from-rose-50/50 to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-rose-800 font-bold mb-1">
            <span className="uppercase text-[11px]">Total Debits (Outflows)</span>
            <ArrowUpRight className="w-4 h-4 text-rose-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-rose-700">
            -{formatCurrency(totals.debitsUSD, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-medium">
            Purchases, EMIs, Bills & Transfers
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50/50 to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-emerald-800 font-bold mb-1">
            <span className="uppercase text-[11px]">Total Credits (Inflows)</span>
            <ArrowDownLeft className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-emerald-700">
            +{formatCurrency(totals.creditsUSD, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-medium">
            Deposits, Inward transfers & Salary
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold mb-1">
            <span className="uppercase text-[11px]">Net Cash Flow</span>
            <Sparkles className="w-4 h-4 text-[#9e783e]" />
          </div>
          <div
            className={`text-xl sm:text-2xl font-bold font-mono ${
              totals.netUSD >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            {totals.netUSD >= 0 ? '+' : ''}
            {formatCurrency(totals.netUSD, currency)}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block font-medium">
            Account net liquidity trajectory
          </span>
        </motion.div>

        <motion.div
          whileHover={{ y: -2 }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs text-slate-600 font-bold mb-1">
            <span className="uppercase text-[11px]">Reconciled Entries</span>
            <Receipt className="w-4 h-4 text-[#17365d]" />
          </div>
          <div className="text-xl sm:text-2xl font-bold font-mono text-slate-900">
            {totals.count} Txns
          </div>
          <span className="text-[11px] text-emerald-600 mt-1 block font-bold">
            100% On-device client verified
          </span>
        </motion.div>
      </div>

      {/* 4. Switchable Visualization Card (Graph vs Pie Chart for Income & Outflows) */}
      <CashFlowVisualizationCard
        title="Bank Statement Cash Flow Analytics"
        subtitle="Toggle dynamically between Timeline Graph and Category Pie Charts for debits & credits"
        accountFilter={selectedAccount}
        showAccountFilter={false}
      />

      {/* 5. Statement Transactions Ledger Table */}
      <motion.div
        whileHover={{ y: -2 }}
        className="rounded-3xl border border-[#e8e0d1] bg-white p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-[#e8e0d1] pb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-[#9e783e]" />
              <span>Statement Transactions Ledger</span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Parsed bank narration, UPI references, and categorized payees
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search payees, UPI, narration..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="h-9 w-48 sm:w-60 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
              />
            </div>

            {/* Type Filter */}
            <div className="flex rounded-xl bg-[#faf8f5] p-1 border border-[#e8e0d1] text-xs font-bold">
              {[
                { id: 'ALL', label: 'All' },
                { id: 'DEBIT', label: 'Debits' },
                { id: 'CREDIT', label: 'Credits' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => setFilterType(t.id as any)}
                  className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                    filterType === t.id
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            {/* Category Filter */}
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="h-9 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] px-2.5 text-xs text-slate-700 font-semibold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
            >
              <option value="ALL">All Categories</option>
              <option value="FOOD_DINING">Food & Dining</option>
              <option value="HEALTHCARE_INSURANCE">Healthcare & Medical</option>
              <option value="SHOPPING_LIFESTYLE">Shopping & Lifestyle</option>
              <option value="TRAVEL_COMMUTE">Travel & Commute</option>
              <option value="UTILITIES_BILLS">Utilities & Bills</option>
              <option value="EMI_LOANS">Loans & EMI</option>
              <option value="ENTERTAINMENT_SUBS">Entertainment</option>
              <option value="OTHER_EXPENSE">Other Expenses</option>
            </select>
          </div>
        </div>

        {/* Table Content */}
        {filteredTransactions.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-xs">
            No statement transactions found matching your search.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-[#e8e0d1] text-slate-400 uppercase tracking-wider font-bold text-[10px]">
                  <th className="py-3 px-3">Date</th>
                  <th className="py-3 px-3">Payee / Description</th>
                  <th className="py-3 px-3">Category</th>
                  <th className="py-3 px-3">Account / Card</th>
                  <th className="py-3 px-3 text-right">Amount</th>
                  <th className="py-3 px-3 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#f4efe4]">
                {filteredTransactions.slice(0, 100).map((txn) => (
                  <tr key={txn.id} className="hover:bg-[#faf8f5]/60 transition-colors">
                    <td className="py-3 px-3 font-mono text-slate-600 whitespace-nowrap">
                      {txn.date}
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{txn.title}</div>
                      {txn.notes && (
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">
                          {txn.notes}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="inline-block px-2 py-0.5 rounded-md text-[10px] font-bold bg-[#faf8f5] text-slate-700 border border-[#e8e0d1]">
                        {txn.categoryLabel}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 whitespace-nowrap font-medium">
                      <CreditCard className="w-3 h-3 inline mr-1 text-slate-400" />
                      {txn.accountRef}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold whitespace-nowrap">
                      <span
                        className={
                          txn.type === 'CREDIT' ? 'text-emerald-700' : 'text-rose-700'
                        }
                      >
                        {txn.type === 'CREDIT' ? '+' : '-'}
                        {formatCurrency(txn.amountUSD, currency)}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-center">
                      <button
                        onClick={() => {
                          if (txn.type === 'DEBIT') deleteExpense(txn.originalId);
                          else deleteIncome(txn.originalId);
                        }}
                        className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Delete entry"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTransactions.length > 100 && (
              <div className="py-3 text-center text-xs text-slate-500 font-medium border-t border-[#e8e0d1]">
                Showing first 100 of {filteredTransactions.length} transactions. Filter to narrow down.
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
};
