import React from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { Currency } from '@/types/finance';
import { Plus, Wallet, Globe, LogOut, Compass } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTourStore } from '@/stores/tourStore';

interface NavbarProps {
  onOpenAddModal: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenAddModal }) => {
  const { currency, setCurrency } = useFinanceStore();
  const { user, logout } = useAuthStore();
  const { startTour } = useTourStore();

  const currencies: Currency[] = ['INR', 'AED', 'USD'];

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-[#e8e0d1] bg-white/95 px-4 sm:px-6 backdrop-blur-md shadow-xs">
      {/* Brand & Market Status */}
      <div className="flex items-center gap-3">
        <motion.div
          whileHover={{ scale: 1.05, rotate: 2 }}
          whileTap={{ scale: 0.95 }}
          className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#9e783e] text-white shadow-md shadow-[#9e783e]/25 cursor-pointer"
        >
          <Wallet className="h-5 w-5" />
        </motion.div>
        <div>
          <div className="flex items-center gap-2">
            <span className="font-heading text-xl font-bold tracking-tight text-slate-900">
              FinPulse
            </span>
            <span className="rounded-full bg-[#f4efe4] px-2 py-0.5 text-[10px] font-bold text-[#866632] border border-[#ded3bf]">
              Wealth OS
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-600 font-medium">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-600 animate-pulse"></span>
            Markets Live • Real-time Valuation
          </div>
        </div>
      </div>

      {/* Actions: Currency Switcher, Add Button & User Profile */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Multi-Currency Toggle */}
        <div id="tour-currency-switcher" className="flex items-center gap-1 rounded-xl bg-[#f4efe4] p-1 border border-[#ded3bf]">
          <div className="hidden sm:flex items-center px-1.5 text-slate-600">
            <Globe className="h-3.5 w-3.5" />
          </div>
          {currencies.map((curr) => {
            const isActive = currency === curr;
            return (
              <button
                key={curr}
                onClick={() => setCurrency(curr)}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  isActive
                    ? 'bg-white text-slate-900 shadow-xs border border-[#ded3bf]'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#eae2d2]'
                }`}
                title={`Switch display currency to ${curr}`}
              >
                {curr === 'INR' ? '₹ INR' : curr === 'AED' ? 'د.إ AED' : '$ USD'}
              </button>
            );
          })}
        </div>

        {/* Demo Tour Guide Button */}
        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={startTour}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs font-bold text-[#866632] hover:bg-[#f4efe4] hover:text-slate-900 transition-all cursor-pointer shadow-xs"
          title="Start interactive onboarding demo tour"
        >
          <Compass className="h-3.5 w-3.5 text-[#9e783e]" />
          <span className="hidden md:inline">Demo Tour</span>
        </motion.button>

        {/* Add Transaction Button with Tactile Animation */}
        <motion.button
          id="tour-add-trade"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.96 }}
          onClick={onOpenAddModal}
          className="flex items-center gap-1.5 rounded-xl bg-[#9e783e] px-4 py-2 text-xs font-bold text-white shadow-md shadow-[#9e783e]/25 hover:bg-[#88642e] transition-all cursor-pointer"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Add Trade</span>
          <span className="sm:hidden">Add</span>
        </motion.button>

        {/* User Profile & Logout */}
        {user && (
          <div className="flex items-center gap-2.5 pl-2 border-l border-[#e8e0d1]">
            <div className="hidden lg:flex flex-col text-right">
              <span className="text-xs font-bold text-slate-900 leading-tight">
                {user.fullName}
              </span>
              <span className="text-[10px] font-semibold text-[#866632]">
                {user.investorType} Investor
              </span>
            </div>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={logout}
              className="flex items-center justify-center h-9 w-9 rounded-xl bg-[#f4efe4] border border-[#ded3bf] text-slate-600 hover:text-rose-600 hover:bg-rose-50 hover:border-rose-200 transition-colors cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="h-4 w-4" />
            </motion.button>
          </div>
        )}
      </div>
    </header>
  );
};
