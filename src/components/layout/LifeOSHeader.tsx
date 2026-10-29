import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useFinanceStore } from '@/stores/financeStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useTourStore } from '@/stores/tourStore';
import { Currency } from '@/types/finance';
import { CURRENCY_CONFIGS } from '@/utils/formatters';
import { QuantraLogo } from '@/components/ui/QuantraLogo';
import {
  Bell,
  ChevronDown,
  LogOut,
  Sparkles,
  Trash2,
  DollarSign,
  ShieldCheck,
  Compass,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LifeOSHeader: React.FC = () => {
  const { user, logout } = useAuthStore();
  const { currency, setCurrency, resetToFreshPortfolio } = useFinanceStore();
  const { setIsAiModalOpen } = useLifeOSStore();
  const { startTour, resetTour } = useTourStore();
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
    <header className="h-[68px] sm:h-[72px] bg-white border-b border-[#e4e9f1] px-3 sm:px-7 flex items-center justify-between sticky top-0 z-30 select-none w-full max-w-full min-w-0">
      {/* Brand Identity - Quantra */}
      <QuantraLogo size="md" variant="horizontal" animated={true} />

      {/* Header Actions */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
        {/* Adaptive AI Life Blueprint Generator Button */}
        <button
          id="tour-adaptive-blueprint"
          onClick={() => setIsAiModalOpen(true)}
          className="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl bg-gradient-to-r from-[#17365d] to-[#2c527e] text-white hover:from-[#132c4d] hover:to-[#24456b] text-xs font-extrabold transition-all shadow-sm shadow-[#17365d]/20 cursor-pointer shrink-0"
          title="Adaptive LifeOS Blueprint Engine"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#a47b3c]" />
          <span className="hidden sm:inline">AI Blueprint</span>
        </button>

        {/* Guided Walkthrough Tour Button */}
        <button
          onClick={startTour}
          className="flex items-center gap-1 px-2.5 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#a47b3c]/35 bg-[#faf6ef] text-[#866632] hover:bg-[#f5eee3] hover:border-[#a47b3c] text-xs font-bold transition-all shadow-xs cursor-pointer group shrink-0"
          title="Take an Interactive Guided Tour of LifeOS"
        >
          <Compass className="w-3.5 h-3.5 text-[#a47b3c] group-hover:rotate-45 transition-transform duration-300 shrink-0" />
          <span className="font-extrabold text-[11px] sm:text-xs">Tour</span>
        </button>

        {/* Currency Switcher */}
        <div className="relative shrink-0" id="tour-currency-switcher">
          <button
            onClick={() => {
              setIsCurrencyOpen(!isCurrencyOpen);
              setIsProfileOpen(false);
            }}
            className="flex items-center gap-1 px-2 sm:px-3 py-1.5 sm:py-2 rounded-xl border border-[#e4e9f1] bg-white hover:bg-[#f5f7fb] text-xs font-bold text-[#243047] transition-all cursor-pointer"
          >
            <DollarSign className="w-3.5 h-3.5 text-[#a47b3c]" />
            <span className="text-[11px] sm:text-xs">{currency}</span>
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

        {/* Notifications Button (Visible on tablet & desktop) */}
        <button
          onClick={() => alert('No new notifications. All schedules are on track.')}
          className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl border border-[#e4e9f1] bg-white hover:bg-[#f5f7fb] text-xs font-bold text-[#243047] transition-all cursor-pointer shrink-0"
          title="Notifications"
        >
          <Bell className="w-3.5 h-3.5 text-[#6f7c91]" />
          <span className="hidden lg:inline">Notifications</span>
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
        </button>

        {/* User Profile Dropdown Button */}
        <div className="relative shrink-0">
          <button
            onClick={() => {
              setIsProfileOpen(!isProfileOpen);
              setIsCurrencyOpen(false);
            }}
            data-testid="user-profile-button"
            title="User Profile & Synchronization"
            className="flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-xl border border-[#e4e9f1] bg-white hover:bg-[#f5f7fb] text-xs font-bold text-[#243047] transition-all cursor-pointer"
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
                  <div className="mt-1.5 flex items-center justify-between gap-2">
                    <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#e5f5ef] text-[#16836b] text-[10px] font-bold">
                      <ShieldCheck className="w-3 h-3" />
                      <span>{user?.investorType || 'RETAIL'} Tier</span>
                    </div>
                    {/* Mobile Notification Status Pill */}
                    <div className="md:hidden inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                      <span>Schedules active</span>
                    </div>
                  </div>
                </div>

                <div className="py-1">
                  <button
                    onClick={() => {
                      setIsProfileOpen(false);
                      resetTour();
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-slate-700 hover:bg-[#f5f7fb] transition-all cursor-pointer flex items-center gap-2"
                  >
                    <Compass className="w-3.5 h-3.5 text-[#a47b3c]" />
                    <span>Restart LifeOS Tour</span>
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
