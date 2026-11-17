import React, { useState, useEffect } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { ProductivityWorkspace } from '@/components/productivity/ProductivityWorkspace';
import { LearningWorkspace } from '@/components/learning/LearningWorkspace';
import { LifeAdminWorkspace } from '@/components/lifeadmin/LifeAdminWorkspace';
import { CheckSquare, GraduationCap, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export type OperationsSubTab = 'tasks' | 'career' | 'admin';

interface UnifiedOperationsWorkspaceProps {
  initialSubTab?: OperationsSubTab;
}

export const UnifiedOperationsWorkspace: React.FC<UnifiedOperationsWorkspaceProps> = ({
  initialSubTab = 'tasks',
}) => {
  const { currentSection } = useLifeOSStore();
  const [activeSubTab, setActiveSubTab] = useState<OperationsSubTab>(() => {
    if (currentSection === 'learning') return 'career';
    if (currentSection === 'lifeadmin') return 'admin';
    return initialSubTab;
  });

  useEffect(() => {
    if (currentSection === 'learning') setActiveSubTab('career');
    else if (currentSection === 'lifeadmin') setActiveSubTab('admin');
    else if (currentSection === 'productivity') setActiveSubTab('tasks');
  }, [currentSection]);

  const SUB_TABS: {
    id: OperationsSubTab;
    label: string;
    shortLabel: string;
    icon: React.ElementType;
    activeBg: string;
  }[] = [
    {
      id: 'tasks',
      label: 'Tasks, Routines & Calendar',
      shortLabel: 'Tasks & Routines',
      icon: CheckSquare,
      activeBg: 'bg-[#263c8b] text-white shadow-xs font-extrabold',
    },
    {
      id: 'career',
      label: 'Learning & Career Mastery',
      shortLabel: 'Career & Skills',
      icon: GraduationCap,
      activeBg: 'bg-[#4b267f] text-white shadow-xs font-extrabold',
    },
    {
      id: 'admin',
      label: 'Life Administration & Vault',
      shortLabel: 'Life Admin Vault',
      icon: ShieldCheck,
      activeBg: 'bg-[#70431b] text-white shadow-xs font-extrabold',
    },
  ];

  return (
    <div className="space-y-4">
      {/* Unified Executive Navigation Bar */}
      <nav aria-label="Operations Navigation" className="p-1 sm:p-1.5 bg-slate-100/90 rounded-2xl border border-slate-200/80">
        <div className="grid grid-cols-3 gap-1 sm:gap-1.5">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                data-testid={`op-subtab-${tab.id}`}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center justify-center gap-1.5 sm:gap-2 py-2 sm:py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                  isActive
                    ? tab.activeBg
                    : 'text-slate-600 hover:text-slate-900 hover:bg-white/80'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-[11px] leading-tight">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Dynamic Module Content */}
      <AnimatePresence mode="wait">
        {activeSubTab === 'tasks' && (
          <motion.div
            key="ops-tasks"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <ProductivityWorkspace />
          </motion.div>
        )}

        {activeSubTab === 'career' && (
          <motion.div
            key="ops-career"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <LearningWorkspace />
          </motion.div>
        )}

        {activeSubTab === 'admin' && (
          <motion.div
            key="ops-admin"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <LifeAdminWorkspace />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
