import React from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { LifeOSSection } from '@/types/lifeos';
import { motion } from 'framer-motion';

export const SECTION_CONFIGS: Record<
  LifeOSSection,
  {
    label: string;
    icon: string;
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
> = {
  overview: {
    label: 'Life Overview',
    icon: '⌂',
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
    icon: '▤',
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
    icon: '♡',
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
    icon: '☑',
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
    icon: '▧',
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
    icon: '◇',
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
  ];

  return (
    <nav
      id="tour-section-switcher"
      className="bg-white border-b border-[#e4e9f1] px-3 sm:px-7 py-2.5 sm:py-3 sticky top-[68px] sm:top-[72px] z-20 select-none overflow-x-auto scrollbar-none w-full max-w-full min-w-0"
      aria-label="Application sections"
    >
      <div className="flex items-center gap-2 min-w-max">
        {sections.map((key) => {
          const config = SECTION_CONFIGS[key];
          const isActive = currentSection === key;

          return (
            <motion.button
              whileTap={{ scale: 0.97 }}
              key={key}
              onClick={() => setCurrentSection(key)}
              className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer border whitespace-nowrap ${
                isActive
                  ? 'border-transparent font-extrabold shadow-xs'
                  : 'text-[#5e6b80] border-transparent hover:bg-[#f5f7fb] hover:text-[#243047]'
              }`}
              style={
                isActive
                  ? {
                      backgroundColor: config.soft,
                      color: config.accent,
                      borderColor: `${config.accent}30`,
                    }
                  : undefined
              }
            >
              <span className="text-sm">{config.icon}</span>
              <span>{config.label}</span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};
