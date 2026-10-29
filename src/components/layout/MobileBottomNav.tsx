import React from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { LifeOSSection } from '@/types/lifeos';

interface TabItem {
  id: LifeOSSection;
  icon: string;
  label: string;
  accent: string;
}

const TABS: TabItem[] = [
  { id: 'overview', icon: '⌂', label: 'Overview', accent: '#17365d' },
  { id: 'finance', icon: '▤', label: 'Finance', accent: '#16836b' },
  { id: 'wellness', icon: '♡', label: 'Fitness', accent: '#d45b73' },
  { id: 'productivity', icon: '☑', label: 'Tasks', accent: '#5574d9' },
  { id: 'learning', icon: '▧', label: 'Career', accent: '#8a5bd6' },
  { id: 'lifeadmin', icon: '◇', label: 'Admin', accent: '#b27635' },
];

export const MobileBottomNav: React.FC = () => {
  const { currentSection, setCurrentSection } = useLifeOSStore();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="sm:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-t border-[#e4e9f1] px-1 py-1.5 shadow-lg flex items-center justify-around"
    >
      {TABS.map((tab) => {
        const isActive = currentSection === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setCurrentSection(tab.id)}
            className={`flex flex-col items-center justify-center py-1 px-1 rounded-xl transition-all cursor-pointer flex-1 ${
              isActive
                ? 'font-extrabold shadow-2xs'
                : 'text-slate-400 hover:text-slate-700'
            }`}
            style={
              isActive
                ? {
                    color: tab.accent,
                    backgroundColor: `${tab.accent}12`,
                  }
                : undefined
            }
          >
            <span className="text-base leading-none">{tab.icon}</span>
            <span className="text-[10px] tracking-tight mt-0.5 leading-none font-semibold">
              {tab.label}
            </span>
          </button>
        );
      })}
    </nav>
  );
};
