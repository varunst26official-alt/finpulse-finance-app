import * as React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'secondary' | 'outline' | 'destructive' | 'gold' | 'emerald' | 'navy';
}

function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  const variantStyles = {
    default: 'bg-[#17365d] text-white border-transparent shadow-2xs',
    secondary: 'bg-[#f4eee3] text-[#866632] border-transparent font-bold',
    outline: 'border-[#e4e9f1] text-slate-700 bg-white',
    destructive: 'bg-rose-50 text-rose-700 border-rose-200/80 font-bold',
    gold: 'bg-gradient-to-r from-amber-500/15 via-orange-500/15 to-amber-500/10 border-amber-400/40 text-amber-900 font-extrabold',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-bold',
    navy: 'bg-slate-900 text-amber-300 border-slate-700 font-extrabold',
  }[variant];

  return (
    <div
      className={cn(
        'inline-flex items-center gap-1 rounded-lg border px-2 py-0.5 text-[10px] sm:text-xs font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9e783e] focus-visible:ring-offset-2 tabular-nums',
        variantStyles,
        className
      )}
      {...props}
    />
  );
}

export { Badge };
