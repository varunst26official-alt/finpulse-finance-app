import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useFinanceStore } from '@/stores/financeStore';
import { Currency } from '@/types/finance';
import { CURRENCY_CONFIGS } from '@/utils/formatters';
import {
  Bell,
  ChevronDown,
  LogOut,
  Sparkles,
  Trash2,
  DollarSign,
  ShieldCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LifeOSHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { currency, setCurrency, resetToFreshPortfolio, loadDemoSampleData } = useFinanceStore();
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isCurrencyOpen, setIsCurrencyOpen] = useState(false);

  const userInitials = user?.fullName
    ? user.fullName
        .split(' ')
        .map((n) => n[0])
        .slice(0, 2)
        .join('')
        .toUpperCase()
    : 'LO';

  return (
    <header className="h-[72px] bg-white border-b border-[#e4e9f1] px-4 sm:px-7 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Brand Identity */}
      <div className="flex items-center gap-3">
        <div className="w-[38px] h-[38px] rounded-xl bg-[#17365d] text-white font-extrabold flex items-center justify-center text-lg shadow-sm shadow-[#17365d]/30">
          L
        </div>
        <div>
          <div className="text-xl font-extrabold text-[#243047] tracking-tight leading-tight">
            LifeOS
          </div>
          <div className="text-[11px] font-semibold text-[#6f7c91]">
            Your personal command centre
          </div>
        </div>
      </div>

      {/* Header Actions */}
      <div className="flex items-center gap-2.5 sm:gap-3">
        {/* Currency Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setIsCurrencyOpen(!isCurrencyOpen);
              setIsProfileOpen(false);
            }}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e9f1] bg-white hover:bg-[#f5f7fb] text-xs font-bold text-[#243047] transition-all cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#a47b3c]" />
            <span>{currency}</span>
            <ChevronDown className="w-3 h-3 text-[#6f7c91]" />
          </button>

          <AnimatePresence>
            {isCurrencyOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                className="absolute right-0 mt-2 w-36 rounded-2xl bg-white border border-[#e4e9f1] shadow-xl p-1.5 z-50 text-xs font-semibold"
              >
                {(['INR', 'USD', 'AED'] as Currency[]).map((c) => (
                  <button
                    key={c}
                    onClick={() => {
                      setCurrency(c);
                      setIsCurrencyOpen(false);
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all cursor-pointer flex items-center justify-between ${
                      currency === c
                        ? 'bg-[#f5eee3] text-[#a47b3c] font-bold'
                        : 'text-[#243047] hover:bg-[#f5f7fb]'
                    }`}
                  >
                    <span>{c}</span>
                    <span className="text-[11px] font-mono text-[#6f7c91]">
                      {CURRENCY_CONFIGS[c].symbol}
                    </span>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Notifications Pill Button */}
        <button
          onClick={() => alert('No new notifications. All schedules are on track.')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e9f1] bg-white hover:bg-[#f5f7fb] text-xs font-bold text-[#243047] transition-all cursor-pointer"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5 text-[#6f7c91]" />
          <span className="hidden sm:inline">Notifications</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>

        {/* User Profile Dropdown Button */}
        <div className="relative">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsCurrencyOpen(false);
            }}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-[#e4e9f1] bg-white hover:bg-[#f5f7fb] text-xs font-bold text-[#243047] transition-all cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-[#e9eef6] text-[#17365d] flex items-center justify-center font-extrabold text-xs">
              {userInitials}
            </div>
            <span className="hidden md:inline font-bold text-[#243047]">
              {user?.fullName?.split(' ')[0] || 'My Profile'}
            </span>
            <ChevronDown className="w-3 h-3 text-[#6f7c91]" />
          </button>

          <AnimatePresence>
            {isProfileOpen && (
              <motion.div
                initial={{ opacity: 0, y: 6, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: 6, scale: 0.96 }}
                className="absolute right-0 mt-2 w-64 rounded-2xl bg-white border border-[#e4e9f1] shadow-xl p-2 z-50 text-xs font-semibold"
              >
                <div className="p-3 border-b border-[#e4e9f1]">
                  <div className="font-extrabold text-[#243047] text-sm">
                    {user?.fullName || 'Investor'}
                  </div>
                  <div className="text-[11px] text-[#6f7c91] truncate font-medium">
                    {user?.email || 'user@lifeos.app'}
                  </div>
                  <div className="mt-1.5 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e5f5ef] text-[#16836b] text-[10px] font-bold">
                    <ShieldCheck className="w-3 h-3" />
                    <span>{user?.investorType || 'RETAIL'} Tier</span>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      loadDemoSampleData();
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-[#f5f7fb] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-[#a47b3c]" />
                    <span>Load Sample Demo Data</span>
                  </button>

                  <button
                    onClick={() => {
                      resetToFreshPortfolio(user?.fullName);
                      setIsProfileOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-[#f5f7fb] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-500" />
                    <span>Reset to Fresh (₹0 Portfolio)</span>
                  </button>
                </div>

                <div className="pt-1 border-t border-[#e4e9f1]">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 transition-all cursor-pointer flex items-center gap-2 font-bold"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </header>
  );
};
