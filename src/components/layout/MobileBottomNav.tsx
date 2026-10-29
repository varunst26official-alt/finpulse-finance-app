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

interface TabItem {
  id: LifeOSSection;
  icon: LucideIcon;
  label: string;
  accent: string;
}

const TABS: TabItem[] = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview', accent: '#17365d' },
  { id: 'finance', icon: Landmark, label: 'Finance', accent: '#16836b' },
  { id: 'wellness', icon: HeartPulse, label: 'Fitness', accent: '#d45b73' },
  { id: 'productivity', icon: CheckSquare, label: 'Tasks', accent: '#5574d9' },
  { id: 'learning', icon: GraduationCap, label: 'Career', accent: '#8a5bd6' },
  { id: 'lifeadmin', icon: ShieldCheck, label: 'Admin', accent: '#b27635' },
  { id: 'community', icon: Trophy, label: 'Ranks', accent: '#d97706' },
];

export const MobileBottomNav: React.FC = () => {
  const { currentSection, setCurrentSection } = useLifeOSStore();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e4e9f1] px-1 py-1.5 shadow-lg flex items-center justify-around select-none"
    >
      {TABS.map((tab) => {
        const isActive = currentSection === tab.id;
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.88 }}
            onClick={() => setCurrentSection(tab.id)}
            className={`relative flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer flex-1 ${
              isActive ? 'font-extrabold shadow-2xs' : 'text-slate-400 hover:text-slate-700'
            }`}
            style={
              isActive
                ? {
                    color: tab.accent,
                    backgroundColor: `${tab.accent}14`,
                  }
                : undefined
            }
          >
            <motion.div
              animate={isActive ? { scale: [1, 1.25, 1], rotate: [0, -6, 6, 0] } : { scale: 1 }}
              transition={{ duration: 0.3 }}
            >
              <Icon className="w-4 h-4" strokeWidth={isActive ? 2.5 : 2} />
            </motion.div>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none font-semibold">
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
};
