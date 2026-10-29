import React, { useEffect } from 'react';
import { useMasteryStore } from '@/stores/masteryStore';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, X } from 'lucide-react';

const CATEGORY_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  FINANCE: { bg: 'bg-emerald-500/10', text: 'text-emerald-600', border: 'border-emerald-500/30' },
  WELLNESS: { bg: 'bg-rose-500/10', text: 'text-rose-600', border: 'border-rose-500/30' },
  PRODUCTIVITY: { bg: 'bg-blue-500/10', text: 'text-blue-600', border: 'border-blue-500/30' },
  LEARNING: { bg: 'bg-purple-500/10', text: 'text-purple-600', border: 'border-purple-500/30' },
  LIFEADMIN: { bg: 'bg-amber-500/10', text: 'text-amber-600', border: 'border-amber-500/30' },
};

export const MasteryXpToast: React.FC = () => {
  const { activeNotification, dismissNotification } = useMasteryStore();

  useEffect(() => {
    if (activeNotification) {
      const timer = setTimeout(() => {
        dismissNotification();
      }, 3800);
      return () => clearTimeout(timer);
    }
  }, [activeNotification, dismissNotification]);

  if (!activeNotification) return null;

  const style = CATEGORY_COLORS[activeNotification.category] || CATEGORY_COLORS.FINANCE;

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 sm:right-6 z-50 pointer-events-none select-none max-w-sm">
      <AnimatePresence>
        <motion.div
          key={activeNotification.id}
          initial={{ opacity: 0, y: 30, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -20, scale: 0.9 }}
          transition={{ type: 'spring', damping: 20, stiffness: 300 }}
          className="pointer-events-auto flex items-center gap-3 p-3.5 bg-slate-900/95 text-white rounded-2xl shadow-2xl border border-amber-500/30 backdrop-blur-md"
        >
          {/* Animated XP Pill */}
          <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 text-white font-black text-sm shrink-0 shadow-md shadow-amber-500/30">
            <Trophy className="w-5 h-5" />
            <span className="absolute -top-1 -right-1 flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
          </div>

          <div className="flex-1 min-w-0 pr-1">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black text-amber-400 tracking-wide">
                +{activeNotification.points} MASTERY XP
              </span>
              <span
                className={`text-[9px] px-1.5 py-0.2 font-extrabold uppercase rounded-md border ${style.bg} ${style.text} ${style.border}`}
              >
                {activeNotification.category}
              </span>
            </div>
            <p className="text-xs text-slate-200 font-medium truncate mt-0.5">
              {activeNotification.reason}
            </p>
          </div>

          <button
            onClick={dismissNotification}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};
