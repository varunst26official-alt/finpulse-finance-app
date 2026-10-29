import React from 'react';
import { motion } from 'framer-motion';

interface QuantraLogoProps {
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'icon' | 'full' | 'horizontal';
  animated?: boolean;
  className?: string;
}

export const QuantraLogo: React.FC<QuantraLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  animated = true,
  className = '',
}) => {
  // Dimensions
  const dim = {
    sm: { icon: 28, text: 'text-base', sub: 'text-[9px]' },
    md: { icon: 38, text: 'text-xl', sub: 'text-[11px]' },
    lg: { icon: 48, text: 'text-2xl', sub: 'text-xs' },
    xl: { icon: 64, text: 'text-3xl', sub: 'text-sm' },
  }[size];

  const IconSvg = (
    <div
      className={`relative flex items-center justify-center shrink-0 select-none ${className}`}
      style={{ width: dim.icon, height: dim.icon }}
    >
      <svg
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full filter drop-shadow-sm"
      >
        <defs>
          {/* Futuristic Gradient 1: Deep Tech Indigo to Electric Cyan */}
          <linearGradient id="quantraRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#4338ca" />
            <stop offset="50%" stopColor="#2563eb" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Core Telemetry Node Gradient: Emerald Growth */}
          <linearGradient id="quantraCoreGrad" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#06b6d4" />
          </linearGradient>

          {/* Glowing Vector Arrow Gradient */}
          <linearGradient id="quantraArrowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#06b6d4" />
            <stop offset="100%" stopColor="#10b981" />
          </linearGradient>

          {/* Subtle Ambient Drop Glow */}
          <filter id="quantraGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feDropShadow dx="0" dy="2" stdDeviation="3" floodColor="#2563eb" floodOpacity="0.35" />
          </filter>
        </defs>

        {/* Outer Hex-Circular Precision Telemetry Orbit */}
        <circle
          cx="48"
          cy="48"
          r="38"
          stroke="url(#quantraRingGrad)"
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray="180 50"
          filter="url(#quantraGlow)"
        />

        {/* Concentric Calibration Ring */}
        <circle
          cx="48"
          cy="48"
          r="26"
          stroke="#e2e8f0"
          strokeWidth="2"
          strokeDasharray="4 6"
          opacity="0.85"
        />

        {/* Inner Quantitative Core Pulse (Center Node) */}
        <circle cx="48" cy="48" r="9" fill="url(#quantraCoreGrad)" />
        <circle cx="48" cy="48" r="4.5" fill="#ffffff" />

        {/* Dynamic Trajectory Vector Arrow (Tail of the 'Q' surging up-right) */}
        <path
          d="M62 62 L88 88"
          stroke="url(#quantraArrowGrad)"
          strokeWidth="8"
          strokeLinecap="round"
        />
        {/* Vector Arrowhead */}
        <path
          d="M74 88 L88 88 L88 74"
          fill="none"
          stroke="url(#quantraArrowGrad)"
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>

      {/* Optional Pulsing Telemetry Dot */}
      {animated && (
        <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
      )}
    </div>
  );

  if (variant === 'icon') {
    return animated ? (
      <motion.div
        whileHover={{ scale: 1.05, rotate: 2 }}
        whileTap={{ scale: 0.95 }}
        className="inline-flex cursor-pointer"
      >
        {IconSvg}
      </motion.div>
    ) : (
      IconSvg
    );
  }

  return (
    <div className={`flex items-center gap-2.5 sm:gap-3 shrink-0 ${className}`}>
      {animated ? (
        <motion.div
          whileHover={{ scale: 1.06, rotate: 1.5 }}
          whileTap={{ scale: 0.96 }}
          className="cursor-pointer"
        >
          {IconSvg}
        </motion.div>
      ) : (
        IconSvg
      )}

      <div className="flex flex-col">
        <div className="flex items-center gap-1.5 leading-none">
          <span className={`font-heading font-extrabold tracking-tight text-[#0f172a] ${dim.text}`}>
            QUANTRA
          </span>
          <span className="px-1.5 py-0.5 rounded-full text-[9px] font-mono font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
            PRO
          </span>
        </div>
        <span className={`font-semibold text-slate-500 tracking-tight mt-0.5 ${dim.sub}`}>
          Quantitative Wealth & Life Engine
        </span>
      </div>
    </div>
  );
};
