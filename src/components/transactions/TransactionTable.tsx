import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, CATEGORY_COLORS } from '@/utils/formatters';
import { Search, ArrowDownLeft, ArrowUpRight, DollarSign, Trash2 } from 'lucide-react';
import { Transaction, TransactionType } from '@/types/finance';
import { motion } from 'framer-motion';

export const TransactionTable: React.FC = () => {
  const { transactions, currency, deleteTransaction } = useFinanceStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

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
      className="rounded-2xl border border-[#e8e0d1] bg-white p-6 shadow-xs hover:shadow-md transition-all space-y-4"
    >
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-900">Transactions Ledger</h3>
          <p className="text-xs text-slate-600 mt-0.5">
            Audit trail of all portfolio buy, sell, and yield events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-3 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search symbol or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 sm:w-64 rounded-xl bg-[#faf8f5] border border-[#e2d8c7] pl-8 pr-3 text-xs text-slate-900 placeholder-slate-400 focus:border-[#9e783e] focus:bg-white focus:outline-hidden font-medium"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex rounded-xl bg-[#f4efe4] p-1 border border-[#ded3bf] text-xs font-bold">
            {['ALL', 'BUY', 'SELL', 'DIVIDEND'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Responsive Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="border-b border-[#e8e0d1] text-slate-600 uppercase text-[11px] font-bold tracking-wider">
            <tr>
              <th className="pb-3 pt-1">Date</th>
              <th className="pb-3 pt-1">Type</th>
              <th className="pb-3 pt-1">Asset</th>
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
                  No transactions match your current search criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx: Transaction) => (
                <tr key={tx.id} className="hover:bg-[#faf8f5] transition-colors">
                  <td className="py-3 text-slate-600 font-medium">{tx.date}</td>
                  <td className="py-3">{typePill(tx.type)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2.5">
                      <span
                        className="h-2.5 w-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#9e783e' }}
                      ></span>
                      <div>
                        <div className="font-bold text-slate-900">{tx.assetSymbol}</div>
                        <div className="text-[11px] text-slate-500 truncate max-w-[160px]">
                          {tx.notes || tx.assetName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right text-slate-900 font-semibold">{tx.quantity}</td>
                  <td className="py-3 text-right text-slate-600 font-medium">
                    {formatCurrency(tx.pricePerUnit, currency)}
                  </td>
                  <td className="py-3 text-right font-extrabold text-slate-900">
                    {formatCurrency(tx.totalAmount, currency)}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
};
