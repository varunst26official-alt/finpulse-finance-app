import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { Currency } from '@/types/finance';
import { Plus, Wallet, Globe } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { currency, setCurrency } = useFinanceStore();

  const currencies: Currency[] = ['INR', 'AED', 'USD'];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 sm:px-6 backdrop-blur-md">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-emerald-500 to-indigo-600 text-white shadow-lg shadow-emerald-500/20">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight text-white">
              FinPulse
            </span>
            <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-mono font-semibold text-emerald-400 border border-emerald-500/20">
              Pro v1.0
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-slate-400">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Markets Open • Real-time Valuation
          </div>
        </div>
      </div>

      {/* Actions: Currency Switcher & Add Button */}
      <div className="flex items-center gap-3">
        {/* Multi-Currency Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-slate-800/80 p-1 border border-slate-700/60 shadow-xs">
          <div className="hidden sm:flex items-center px-2 text-slate-400">
            <Globe className="h-3.5 w-3.5" />
          </div>
          {currencies.map((curr) => {
            const isActive = currency === curr;
            return (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all ${
                  isActive
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/50'
                }`}
                title={`Switch display currency to ${curr}`}
              >
                {curr === 'INR' ? '₹ INR' : curr === 'AED' ? 'د.إ AED' : '$ USD'}
              </button>
            );
          })}
        </div>

        {/* Add Transaction Button */}
        <button
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 px-3.5 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Transaction</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
};
