import { useState, useEffect } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { LifeOSHeader } from '@/components/layout/LifeOSHeader';
import { SectionSwitcher } from '@/components/layout/SectionSwitcher';
import { LifeOverviewWorkspace } from '@/components/overview/LifeOverviewWorkspace';
import { FinanceWorkspace } from '@/components/finance/FinanceWorkspace';
import { WellnessWorkspace } from '@/components/wellness/WellnessWorkspace';
import { ProductivityWorkspace } from '@/components/productivity/ProductivityWorkspace';
import { LearningWorkspace } from '@/components/learning/LearningWorkspace';
import { LifeAdminWorkspace } from '@/components/lifeadmin/LifeAdminWorkspace';
import { AdaptiveBlueprintModal } from '@/components/adaptive/AdaptiveBlueprintModal';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { DemoTourGuide } from '@/components/tour/DemoTourGuide';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { motion, AnimatePresence } from 'framer-motion';

export function App() {
  const { syncWithBackend } = useFinanceStore();
  const { isAuthenticated } = useAuthStore();
  const { currentSection } = useLifeOSStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      syncWithBackend();
    }
  }, [isAuthenticated, syncWithBackend]);

  // If user is not authenticated, show the customer Login / Register screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  return (
    <div className="min-h-screen bg-[#f4f6fa] text-[#243047] flex flex-col font-sans selection:bg-[#a47b3c] selection:text-white">
      {/* 1. LifeOS Sticky Command Header (72px) */}
      <LifeOSHeader />

      {/* 2. Sticky Section Switcher (6 Focused Workspaces) */}
      <SectionSwitcher />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 w-full max-w-[1500px] mx-auto p-4 sm:p-7 space-y-6">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSection}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
          >
            {/* Workspace 1: Life Overview */}
            {currentSection === 'overview' && <LifeOverviewWorkspace />}

            {/* Workspace 2: Financial Portfolio (Holdings, Debts, Insurance, Ledger, Goals) */}
            {currentSection === 'finance' && (
              <FinanceWorkspace
                onOpenAddTradeModal={() => setIsAddModalOpen(true)}
              />
            )}

            {/* Workspace 3: Fitness & Wellness (BMI Calculator, Workouts, Food, Water) */}
            {currentSection === 'wellness' && <WellnessWorkspace />}

            {/* Workspace 4: Productivity & Tasks (Agenda, Checklist, Unified Calendar) */}
            {currentSection === 'productivity' && <ProductivityWorkspace />}

            {/* Workspace 5: Learning & Career (Skills Roadmap, Certifications) */}
            {currentSection === 'learning' && <LearningWorkspace />}

            {/* Workspace 6: Life Administration (Document Vault, Renewals, Household) */}
            {currentSection === 'lifeadmin' && <LifeAdminWorkspace />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* 4. Footer */}
      <footer className="text-center text-[#6f7c91] text-xs py-8 border-t border-[#e4e9f1] bg-white/50">
        <p>
          LifeOS · Personal Life Command Centre. Connected cross-module workspaces backed by persistent SQLite engine.
        </p>
      </footer>

      {/* 5. Modals & Onboarding Tour */}
      <DemoTourGuide />
      <AdaptiveBlueprintModal />
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

export default App;
