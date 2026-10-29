import React from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { LifeOSSection } from '@/types/lifeos';
import {
  LayoutDashboard,
  Landmark,
  HeartPulse,
  CheckSquare,
  GraduationCap,
  ShieldCheck,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import { motion } from 'framer-motion';

export interface SectionConfig {
  label: string;
  icon: LucideIcon;
  symbol: string;
  heroGradient: string;
  heroColor1: string;
  heroColor2: string;
  accent: string;
  soft: string;
  eyebrow: string;
  title: string;
  description: string;
  action: string;
  secondary: string;
}

export const SECTION_CONFIGS: Record<LifeOSSection, SectionConfig> = {
  overview: {
    label: 'Life Overview',
    icon: LayoutDashboard,
    symbol: '⌂',
    heroGradient: 'linear-gradient(120deg, #17365d, #2c527e)',
    heroColor1: '#17365d',
    heroColor2: '#2c527e',
    accent: '#a47b3c',
    soft: '#f5eee3',
    eyebrow: 'PERSONAL COMMAND CENTRE',
    title: 'Your life, in one clear view',
    description:
      'See your priorities, goals, finances, and wellness at a glance. Switch sections to enter a focused workspace designed for that part of your life.',
    action: "Review today's plan",
    secondary: 'Explore your goals',
  },
  finance: {
    label: 'Finance',
    icon: Landmark,
    symbol: '▤',
    heroGradient: 'linear-gradient(120deg, #075e54, #16836b)',
    heroColor1: '#075e54',
    heroColor2: '#16836b',
    accent: '#16836b',
    soft: '#e5f5ef',
    eyebrow: 'FINANCIAL PORTFOLIO',
    title: 'Take control of your finances',
    description:
      'Track your net worth, investment holdings, debts, insurance, and financial commitments from one focused workspace.',
    action: 'Add transaction',
    secondary: 'View financial calendar',
  },
  wellness: {
    label: 'Fitness & Wellness',
    icon: HeartPulse,
    symbol: '♡',
    heroGradient: 'linear-gradient(120deg, #7f2844, #d45b73)',
    heroColor1: '#7f2844',
    heroColor2: '#d45b73',
    accent: '#d45b73',
    soft: '#fdebf0',
    eyebrow: 'FITNESS, NUTRITION & RECOVERY',
    title: 'Build healthier daily habits',
    description:
      'Bring workouts, meal planning, body metrics, activity, and recovery into one personal wellness workspace.',
    action: 'Create my wellness plan',
    secondary: "Log today's activity",
  },
  productivity: {
    label: 'Productivity',
    icon: CheckSquare,
    symbol: '☑',
    heroGradient: 'linear-gradient(120deg, #263c8b, #5574d9)',
    heroColor1: '#263c8b',
    heroColor2: '#5574d9',
    accent: '#5574d9',
    soft: '#edf0ff',
    eyebrow: 'TASKS, CALENDAR & ROUTINES',
    title: 'Make space for what matters',
    description:
      'Turn goals into manageable actions, organize your day, and keep deadlines and recurring responsibilities visible.',
    action: 'Add a task',
    secondary: 'Open calendar',
  },
  learning: {
    label: 'Learning & Career',
    icon: GraduationCap,
    symbol: '▧',
    heroGradient: 'linear-gradient(120deg, #4b267f, #8a5bd6)',
    heroColor1: '#4b267f',
    heroColor2: '#8a5bd6',
    accent: '#8a5bd6',
    soft: '#f1eaff',
    eyebrow: 'LEARNING & CAREER',
    title: 'Invest in your next chapter',
    description:
      'Organize learning paths, skills, projects, certifications, and career milestones in one place.',
    action: 'Add learning goal',
    secondary: 'View milestones',
  },
  lifeadmin: {
    label: 'Life Administration',
    icon: ShieldCheck,
    symbol: '◇',
    heroGradient: 'linear-gradient(120deg, #70431b, #b27635)',
    heroColor1: '#70431b',
    heroColor2: '#b27635',
    accent: '#b27635',
    soft: '#fff0df',
    eyebrow: 'LIFE ADMINISTRATION',
    title: "Keep life's essentials organized",
    description:
      'Keep important documents, renewals, appointments, household responsibilities, and personal records easy to find.',
    action: 'Add a reminder',
    secondary: 'Open document vault',
  },
  community: {
    label: 'Community & Ranks',
    icon: Trophy,
    symbol: '🏆',
    heroGradient: 'linear-gradient(120deg, #b45309, #d97706)',
    heroColor1: '#b45309',
    heroColor2: '#d97706',
    accent: '#d97706',
    soft: '#fef3c7',
    eyebrow: 'LEAGUES, RANKS & MASTERY',
    title: 'Grow together, stay accountable',
    description:
      'Track section-wise points, rise through weekly leagues, unlock badges, and benchmark your life discipline with the community.',
    action: 'View My League',
    secondary: 'Customize Alias',
  },
};

export const SectionSwitcher: React.FC = () => {
  const { currentSection, setCurrentSection } = useLifeOSStore();

  const sections: LifeOSSection[] = [
    'overview',
    'finance',
    'wellness',
    'productivity',
    'learning',
    'lifeadmin',
    'community',
  ];

  return (
    <nav
      id="tour-section-switcher"
      className="bg-white border-b border-[#e4e9f1] px-3 sm:px-7 py-2 sm:py-2.5 sticky top-[68px] sm:top-[72px] z-20 select-none overflow-x-auto scrollbar-none w-full max-w-full min-w-0 scroll-smooth snap-x snap-mandatory"
      aria-label="Application sections"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 min-w-max">
        {sections.map((key) => {
          const config = SECTION_CONFIGS[key];
          const isActive = currentSection === key;
          const Icon = config.icon;

          return (
            <motion.button
              key={key}
              onClick={() => setCurrentSection(key)}
              whileHover="hover"
              whileTap={{ scale: 0.96 }}
              className="group relative flex items-center gap-2 px-3.5 py-2 sm:py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer whitespace-nowrap snap-start select-none"
            >
              {/* Fluid Sliding Active Indicator with Spring Motion */}
              {isActive && (
                <motion.div
                  layoutId="activeSectionIndicator"
                  className="absolute inset-0 rounded-xl shadow-xs"
                  style={{
                    backgroundColor: config.soft,
                    border: `1.5px solid ${config.accent}40`,
                  }}
                  transition={{ type: 'spring', stiffness: 500, damping: 36 }}
                />
              )}

              {/* Icon with Animated Micro-Interaction */}
              <motion.div
                variants={{
                  hover: { scale: 1.2, rotate: [0, -7, 7, 0] },
                }}
                transition={{ duration: 0.3, ease: 'easeInOut' }}
                className="relative z-10 flex items-center justify-center shrink-0"
              >
                <Icon
                  className="w-4 h-4 transition-colors duration-200"
                  style={{
                    color: isActive ? config.accent : '#64748b',
                    strokeWidth: isActive ? 2.5 : 2,
                  }}
                />
              </motion.div>

              {/* Section Label */}
              <span
                className="relative z-10 tracking-tight transition-colors duration-200"
                style={{
                  color: isActive ? config.accent : '#5e6b80',
                  fontWeight: isActive ? 800 : 600,
                }}
              >
                {config.label}
              </span>

              {/* Dynamic Beacon Animation for Community */}
              {key === 'community' && (
                <span className="relative z-10 flex h-2 w-2 ml-0.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500 shadow-xs shadow-amber-500/50" />
                </span>
              )}
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
