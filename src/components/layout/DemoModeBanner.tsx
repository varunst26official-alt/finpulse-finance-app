import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Sparkles, ArrowRight, Eye } from 'lucide-react';

export const DemoModeBanner: React.FC = () => {
  const { isDemoMode, openAuthModal } = useAuthStore();

  if (!isDemoMode) return null;

  return (
    <div className="bg-gradient-to-r from-amber-700 via-[#9e783e] to-[#7f5c2b] text-white px-3 sm:px-4 py-1.5 sm:py-2 text-xs font-medium shadow-md shadow-amber-900/10 flex items-center justify-between gap-2 z-30 select-none">
      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
        <span className="flex h-2 w-2 rounded-full bg-amber-300 animate-pulse shrink-0" />
        <span className="flex items-center gap-1 font-bold tracking-wide uppercase text-[10px] sm:text-xs bg-black/20 px-2 py-0.5 rounded-full shrink-0">
          <Eye className="h-3 w-3" />
          <span>Demo Preview</span>
        </span>
        <span className="hidden sm:inline text-amber-100/90 text-xs truncate">
          You are exploring Quantra Life OS with preloaded sample data. Everything is read-only.
        </span>
      </div>

      <div className="flex items-center gap-2 shrink-0">
        <button
          onClick={() => openAuthModal('unlock full Quantra Life OS account')}
          className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-slate-900 hover:bg-amber-50 font-bold text-[11px] shadow-xs transition-all cursor-pointer active:scale-95"
        >
          <Sparkles className="h-3 w-3 text-[#9e783e]" />
          <span>Sign In / Register</span>
          <ArrowRight className="h-3 w-3" />
        </button>
      </div>
    </div>
  );
};
