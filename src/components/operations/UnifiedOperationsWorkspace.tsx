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

  const SUB_TABS: { id: OperationsSubTab; label: string; shortLabel: string; icon: React.ElementType; badge?: string }[] = [
    { id: 'tasks', label: 'Tasks, Routines & Calendar', shortLabel: 'Tasks & Routines', icon: CheckSquare },
    { id: 'career', label: 'Learning & Career Mastery', shortLabel: 'Career & Skills', icon: GraduationCap },
    { id: 'admin', label: 'Life Administration & Vault', shortLabel: 'Life Admin Vault', icon: ShieldCheck },
  ];

  return (
    <div className="space-y-6">
      {/* Unified Executive Navigation Bar */}
      <section className="bg-white border border-[#e4e9f1] rounded-2xl p-2 sm:p-2.5 shadow-xs sticky top-[118px] sm:top-[128px] z-10 backdrop-blur-md">
        <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
          {SUB_TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeSubTab === tab.id;

            return (
              <button
                key={tab.id}
                data-testid={`op-subtab-${tab.id}`}
                onClick={() => setActiveSubTab(tab.id)}
                className={`flex items-center justify-center gap-2 py-2.5 px-2 sm:px-4 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer text-center ${
                  isActive
                    ? 'bg-[#17365d] text-white shadow-sm'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#f5f7fb]'
                }`}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-cyan-300' : 'text-slate-500'}`} />
                <span className="hidden sm:inline">{tab.label}</span>
                <span className="sm:hidden text-xs">{tab.shortLabel}</span>
              </button>
            );
          })}
        </div>
      </section>

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
