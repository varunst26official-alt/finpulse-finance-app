import React from 'react';
import { SECTION_CONFIGS } from './SectionSwitcher';
import { LifeOSSection } from '@/types/lifeos';
import { useAuthStore } from '@/stores/authStore';

interface SectionHeroProps {
  section: LifeOSSection;
  onPrimaryAction?: () => void;
  onSecondaryAction?: () => void;
  primaryActionLabel?: string;
  secondaryActionLabel?: string;
}

export const SectionHero: React.FC<SectionHeroProps> = ({
  section,
  onPrimaryAction,
  onSecondaryAction,
  primaryActionLabel,
  secondaryActionLabel,
}) => {
  const config = SECTION_CONFIGS[section];
  const { requireAuth } = useAuthStore();

  const handlePrimaryClick = () => {
    const label = primaryActionLabel || config.action || '';
    if (label.includes('Add') || label.includes('Upload') || label.includes('Log') || label.includes('Blueprint')) {
      if (!requireAuth(label)) return;
    }
    onPrimaryAction?.();
  };

  const handleSecondaryClick = () => {
    const label = secondaryActionLabel || config.secondary || '';
    if (label.includes('Add') || label.includes('Log')) {
      if (!requireAuth(label)) return;
    }
    onSecondaryAction?.();
  };

  return (
    <section
      className="relative text-white rounded-3xl p-3 sm:p-6 lg:p-8 shadow-xl overflow-hidden flex flex-col md:flex-row justify-between items-start md:items-center gap-2 sm:gap-4 w-full max-w-full min-w-0"
      style={{
        background: config.heroGradient,
      }}
    >
      {/* Concentric Circle Decorative Watermark */}
      <div
        className="pointer-events-none absolute -right-16 -top-24 w-80 h-80 rounded-full border border-white/10 hidden md:block"
        style={{
          boxShadow:
            '0 0 0 35px rgba(255,255,255,0.035), 0 0 0 70px rgba(255,255,255,0.025), 0 0 0 105px rgba(255,255,255,0.015)',
        }}
      />

      {/* Hero Content */}
      <div className="relative z-10 max-w-2xl space-y-1.5 sm:space-y-2.5 w-full min-w-0">
        <div className="text-[9px] sm:text-[10px] font-extrabold uppercase tracking-widest text-white/75">
          {config.eyebrow}
        </div>
        <h1 className="text-base sm:text-2xl lg:text-3xl font-extrabold tracking-tight text-white leading-tight">
          {config.title}
        </h1>
        <p className="hidden sm:block text-xs sm:text-sm text-white/80 leading-relaxed max-w-xl">
          {config.description}
        </p>

        {/* Action Buttons (2-column compact row on mobile, inline on desktop) */}
        <div className="grid grid-cols-2 sm:flex sm:flex-row items-stretch sm:items-center gap-2 sm:gap-2.5 pt-1 sm:pt-2 w-full sm:w-auto">
          <button
            onClick={handlePrimaryClick}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white text-slate-900 text-xs font-bold shadow-md hover:bg-slate-50 transition-all cursor-pointer flex items-center justify-center gap-1"
            style={{ color: config.heroColor1 }}
          >
            <span>{primaryActionLabel || config.action}</span>
            <span className="text-sm">↗</span>
          </button>

          <button
            onClick={handleSecondaryClick}
            className="w-full sm:w-auto px-3 py-2 sm:px-4 sm:py-2.5 rounded-xl bg-white/15 text-white border border-white/25 text-xs font-bold hover:bg-white/20 transition-all cursor-pointer flex items-center justify-center text-center"
          >
            <span>{secondaryActionLabel || config.secondary}</span>
          </button>
        </div>
      </div>

      {/* Right Giant Symbol Glyph */}
      <div
        className="relative z-10 select-none opacity-80 hidden md:flex items-center justify-center p-4 pointer-events-none"
        aria-hidden="true"
      >
        {typeof config.icon === 'string' ? (
          <span className="text-6xl sm:text-7xl lg:text-8xl">{config.icon}</span>
        ) : (
          <config.icon className="w-20 h-20 sm:w-28 sm:h-28 text-white/25 stroke-[1.2]" />
        )}
      </div>
    </section>
  );
};
