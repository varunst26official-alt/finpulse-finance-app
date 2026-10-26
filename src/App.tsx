import { useState } from 'react';
import { useFinanceStore, NavigationTab } from '@/stores/financeStore';
import { useAuthStore } from '@/stores/authStore';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatCards } from '@/components/dashboard/StatCards';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { AllocationDonut } from '@/components/dashboard/AllocationDonut';
import { HoldingsTable } from '@/components/dashboard/HoldingsTable';
import { SipCalculator } from '@/components/dashboard/SipCalculator';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import { AiWealthCopilot } from '@/components/ai/AiWealthCopilot';
import { FloatingAiChatWidget } from '@/components/ai/FloatingAiChatWidget';
import { StockPredictor } from '@/components/predictions/StockPredictor';
import { MarketIntelligenceFeed } from '@/components/news/MarketIntelligenceFeed';
import { TaxOptimizer } from '@/components/tax/TaxOptimizer';
import { FinancialCalendarWidget } from '@/components/calendar/FinancialCalendarWidget';
import { DemoTourGuide } from '@/components/tour/DemoTourGuide';
import { AuthScreen } from '@/components/auth/AuthScreen';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard,
  PieChart,
  ArrowLeftRight,
  Calculator,
  CalendarDays,
  Bot,
  Sparkles,
  Newspaper,
  ReceiptText,
} from 'lucide-react';

export function App() {
  const { activeTab, setActiveTab } = useFinanceStore();
  const { isAuthenticated } = useAuthStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // If user is not authenticated, show the customer Login / Register screen
  if (!isAuthenticated) {
    return <AuthScreen />;
  }

  const mobileTabs: {
    id: NavigationTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
  }[] = [
    { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
    { id: 'investments', label: 'Holdings', icon: PieChart },
    { id: 'ai-chat', label: 'AI Copilot', icon: Bot },
    { id: 'predictions', label: 'Forecaster', icon: Sparkles },
    { id: 'news', label: 'News', icon: Newspaper },
    { id: 'tax', label: 'Tax', icon: ReceiptText },
    { id: 'calendar', label: 'Calendar', icon: CalendarDays },
    { id: 'transactions', label: 'Ledger', icon: ArrowLeftRight },
    { id: 'goals', label: 'SIP', icon: Calculator },
  ];

  return (
    <div className="min-h-screen bg-[#fbf9f5] text-slate-900 flex flex-col font-sans selection:bg-[#9e783e] selection:text-white">
      {/* Top Navbar */}
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Main View Area with Smooth Transitions */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 md:pb-8">
          {/* Mobile Tab Bar (Scrollable on small viewports) */}
          <div className="flex md:hidden overflow-x-auto rounded-2xl bg-white border border-[#e8e0d1] p-1.5 text-xs font-semibold scrollbar-none gap-1.5 shadow-xs">
            {mobileTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-none flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl font-bold transition-all whitespace-nowrap cursor-pointer ${
                    isActive
                      ? 'bg-[#9e783e] text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-[#f5efe4]'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Smooth Animated Tab Content Crossfade */}
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.22, ease: 'easeOut' }}
              className="space-y-6"
            >
              {/* Tab 1: Overview Dashboard */}
              {activeTab === 'dashboard' && (
                <>
                  <StatCards />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <PortfolioChart />
                    </div>
                    <div>
                      <AllocationDonut />
                    </div>
                  </div>
                  <TransactionTable />
                  <FinancialCalendarWidget />
                </>
              )}

              {/* Tab 2: Holdings & Asset Allocation */}
              {activeTab === 'investments' && (
                <>
                  <StatCards />
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2">
                      <HoldingsTable />
                    </div>
                    <div>
                      <AllocationDonut />
                    </div>
                  </div>
                </>
              )}

              {/* Tab 3: Transactions Ledger */}
              {activeTab === 'transactions' && <TransactionTable />}

              {/* Tab: Financial Calendar & Events Planner */}
              {activeTab === 'calendar' && <FinancialCalendarWidget />}

              {/* Tab 4: SIP & Wealth Projection Calculator */}
              {activeTab === 'goals' && <SipCalculator />}

              {/* Tab 5: AI Wealth Copilot (Chatbot) */}
              {activeTab === 'ai-chat' && <AiWealthCopilot />}

              {/* Tab 6: AI Stock & Asset Price Predictor */}
              {activeTab === 'predictions' && <StockPredictor />}

              {/* Tab 7: Live Market Intelligence & Macro News */}
              {activeTab === 'news' && <MarketIntelligenceFeed />}

              {/* Tab 8: Capital Gains & Tax Harvesting Optimizer */}
              {activeTab === 'tax' && <TaxOptimizer />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating AI Copilot & Conversational Trade Execution Widget */}
      <FloatingAiChatWidget />

      {/* Interactive First-Time User Onboarding Demo Tour */}
      <DemoTourGuide />

      {/* Record Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

export default App;
