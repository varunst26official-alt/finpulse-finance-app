import * as React from 'react';
import { cn } from '@/utils/cn';

export interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  shimmerColor?: string;
  shimmerSize?: string;
  borderRadius?: string;
  shimmerDuration?: string;
  background?: string;
}

export const ShimmerButton = React.forwardRef<HTMLButtonElement, ShimmerButtonProps>(
  (
    {
      shimmerColor = '#ffffff',
      shimmerSize = '0.05em',
      shimmerDuration = '3s',
      borderRadius = '1rem',
      background = 'linear-gradient(135deg, #17365d 0%, #16836b 100%)',
      className,
      children,
      ...props
    },
    ref
  ) => {
    return (
      <button
        ref={ref}
        style={
          {
            '--spread': '90deg',
            '--shimmer-color': shimmerColor,
            '--radius': borderRadius,
            '--speed': shimmerDuration,
            '--cut': shimmerSize,
            '--bg': background,
            ...props.style,
          } as React.CSSProperties
        }
        className={cn(
          'group relative z-0 flex cursor-pointer items-center justify-center overflow-hidden whitespace-nowrap px-4 py-2 text-xs font-extrabold text-white [background:var(--bg)] [border-radius:var(--radius)] transition-transform duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#9e783e] focus-visible:ring-offset-2 touch-manipulation shadow-md shadow-[#17365d]/20',
          className
        )}
        {...props}
      >
        {/* Shimmer light element */}
        <div className="absolute inset-0 -z-30 overflow-visible [container-type:size]">
          <div className="absolute inset-0 h-[100cqh] animate-spin [aspect-ratio:1] [border-radius:0] [mask:none]">
            <div className="animate-spin-around absolute inset-[-100%] w-auto rotate-0 [background:conic-gradient(from_calc(270deg-(var(--spread)*0.5)),transparent_0,var(--shimmer-color)_var(--spread),transparent_var(--spread))] [translate:0_0]" />
          </div>
        </div>

        {/* Backdrop container */}
        <div className="absolute inset-[1px] -z-20 rounded-[calc(var(--radius)-1px)] [background:var(--bg)] transition-colors" />

        {/* Content */}
        <div className="relative z-10 flex items-center gap-1.5">{children}</div>
      </button>
    );
  }
);

ShimmerButton.displayName = 'ShimmerButton';
