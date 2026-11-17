import React from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { useAuthStore } from '@/stores/authStore';
import { LifeOSSection } from '@/types/lifeos';
import {
  LayoutDashboard,
  Landmark,
  HeartPulse,
  CheckSquare,
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
  { id: 'wellness', icon: HeartPulse, label: 'Wellness', accent: '#d45b73' },
  { id: 'productivity', icon: CheckSquare, label: 'Operations', accent: '#5574d9' },
];

export const MobileBottomNav: React.FC = () => {
  const { currentSection, setCurrentSection } = useLifeOSStore();
  const { user } = useAuthStore();
  const isSuperAdmin = user?.email?.toLowerCase().trim() === 'admin@quantra.io';

  // Super Admin does not use retail navigation tabs
  if (isSuperAdmin) {
    return null;
  }

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#e4e9f1] px-2 pt-1.5 pb-[max(8px,env(safe-area-inset-bottom,0px))] shadow-lg flex items-center justify-around select-none touch-manipulation"
    >
      {TABS.map((tab) => {
        const isActive =
          currentSection === tab.id ||
          (tab.id === 'productivity' &&
            (currentSection === 'learning' || currentSection === 'lifeadmin'));
        const Icon = tab.icon;

        return (
          <motion.button
            key={tab.id}
            whileTap={{ scale: 0.92 }}
            onClick={() => setCurrentSection(tab.id)}
            aria-label={`Navigate to ${tab.label}`}
            className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-colors cursor-pointer flex-1 touch-manipulation focus-visible:ring-2 focus-visible:ring-[#9e783e] focus-visible:outline-none ${
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
              <Icon className="w-5 h-5" strokeWidth={isActive ? 2.5 : 2} aria-hidden="true" />
            </motion.div>
            <span className="text-[11px] tracking-tight mt-1 leading-none font-bold">
              {tab.label}
            </span>
          </motion.button>
        );
      })}
    </nav>
  );
};
