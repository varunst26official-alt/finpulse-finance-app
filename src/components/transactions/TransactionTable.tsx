import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency, CATEGORY_COLORS } from '@/utils/formatters';
import { Search, ArrowDownLeft, ArrowUpRight, DollarSign, Trash2 } from 'lucide-react';
import { Transaction, TransactionType } from '@/types/finance';

export const TransactionTable: React.FC = () => {
  const { transactions, currency, deleteTransaction } = useFinanceStore();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  // Filter & sort transactions using useMemo for performance
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
          <span className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-emerald-400 border border-emerald-500/20">
            <ArrowDownLeft className="h-3 w-3" /> BUY
          </span>
        );
      case 'SELL':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-rose-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-rose-400 border border-rose-500/20">
            <ArrowUpRight className="h-3 w-3" /> SELL
          </span>
        );
      case 'DIVIDEND':
      case 'INTEREST':
        return (
          <span className="inline-flex items-center gap-1 rounded-md bg-indigo-500/10 px-2 py-0.5 text-[11px] font-mono font-bold text-indigo-400 border border-indigo-500/20">
            <DollarSign className="h-3 w-3" /> {type}
          </span>
        );
    }
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-5 backdrop-blur-xs shadow-xs space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base font-bold text-white">Transactions Ledger</h3>
          <p className="text-xs text-slate-400 font-mono mt-0.5">
            Audit trail of all portfolio buy, sell, and yield events
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              placeholder="Filter by symbol or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="h-9 w-48 sm:w-60 rounded-xl bg-slate-950/60 border border-slate-800 pl-8 pr-3 text-xs text-white placeholder-slate-500 focus:border-emerald-500 focus:outline-hidden font-mono"
            />
          </div>

          {/* Type Filter Buttons */}
          <div className="flex rounded-xl bg-slate-950/60 p-1 border border-slate-800 text-[11px] font-mono font-bold">
            {['ALL', 'BUY', 'SELL', 'DIVIDEND'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-2 py-1 rounded-lg transition-all ${
                  filterType === type
                    ? 'bg-emerald-500 text-white'
                    : 'text-slate-400 hover:text-white'
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
        <table className="w-full text-left text-xs font-mono">
          <thead className="border-b border-slate-800 text-slate-400 uppercase text-[10px] tracking-wider">
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
          <tbody className="divide-y divide-slate-800/60 text-slate-300">
            {filteredTransactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="py-8 text-center text-slate-500">
                  No transactions match your current search criteria.
                </td>
              </tr>
            ) : (
              filteredTransactions.map((tx: Transaction) => (
                <tr key={tx.id} className="hover:bg-slate-800/30 transition-colors">
                  <td className="py-3 text-slate-400">{tx.date}</td>
                  <td className="py-3">{typePill(tx.type)}</td>
                  <td className="py-3">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-2 w-2 rounded-full shrink-0"
                        style={{ backgroundColor: CATEGORY_COLORS[tx.category] || '#6366f1' }}
                      ></span>
                      <div>
                        <div className="font-bold text-white">{tx.assetSymbol}</div>
                        <div className="text-[10px] text-slate-400 truncate max-w-[150px]">
                          {tx.notes || tx.assetName}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 text-right text-slate-300 font-semibold">{tx.quantity}</td>
                  <td className="py-3 text-right text-slate-400">
                    {formatCurrency(tx.pricePerUnit, currency)}
                  </td>
                  <td className="py-3 text-right font-bold text-white">
                    {formatCurrency(tx.totalAmount, currency)}
                  </td>
                  <td className="py-3 text-center">
                    <button
                      onClick={() => deleteTransaction(tx.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
