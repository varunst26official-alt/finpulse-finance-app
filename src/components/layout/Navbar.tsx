import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { Currency } from '@/types/finance';
import { Plus, Wallet, Globe, LogOut } from 'lucide-react';

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { currency, setCurrency } = useFinanceStore();
  const { user, logout } = useAuthStore();

  const currencies: Currency[] = ['INR', 'AED', 'USD'];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e8dfcf] bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#9c783e] text-white shadow-md shadow-[#9c783e]/20">
          <Wallet className="h-5 w-5" />
        </div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-lg font-bold tracking-tight text-[#2b2823]">
              FinPulse
            </span>
            <span className="rounded-full bg-[#f4efe4] px-2 py-0.5 text-[10px] font-mono font-semibold text-[#826435] border border-[#e4d9c7]">
              Wealth OS
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-mono text-[#786e5e]">
            <span className="inline-block h-1.5 w-1.5 rounded-full bg-[#2d6a4f] animate-pulse"></span>
            Markets Live • Real-time Valuation
          </div>
        </div>
      </div>

      {/* Actions: Currency Switcher, Add Button & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multi-Currency Toggle */}
        <div className="flex items-center gap-1 rounded-xl bg-[#f5efe4] p-1 border border-[#e4d9c7]">
          <div className="hidden sm:flex items-center px-1.5 text-[#786e5e]">
            <Globe className="h-3.5 w-3.5" />
          </div>
          {currencies.map((curr) => {
            const isActive = currency === curr;
            return (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-2.5 py-1 text-xs font-mono font-bold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-[#2b2823] shadow-xs border border-[#ded3bf]'
                    : 'text-[#786e5e] hover:text-[#2b2823] hover:bg-[#eae2d2]'
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
          className="flex items-center gap-1.5 rounded-xl bg-[#9c783e] px-3.5 py-2 text-xs font-mono font-bold text-white shadow-md shadow-[#9c783e]/20 hover:bg-[#866632] active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Trade</span>
          <span className="sm:hidden">Add</span>
        </button>

        {/* User Profile & Logout */}
        {user && (
          <div className="flex items-center gap-2 pl-2 border-l border-[#e8dfcf]">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-[#2b2823] leading-tight">
                {user.fullName}
              </span>
              <span className="text-[10px] font-mono text-[#826435]">
                {user.investorType} Investor
              </span>
            </div>
            <button
              onClick={logout}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#f4efe4] border border-[#e4d9c7] text-[#786e5e] hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
