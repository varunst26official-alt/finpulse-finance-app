import { useState } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { StatCards } from '@/components/dashboard/StatCards';
import { PortfolioChart } from '@/components/dashboard/PortfolioChart';
import { AllocationDonut } from '@/components/dashboard/AllocationDonut';
import { HoldingsTable } from '@/components/dashboard/HoldingsTable';
import { SipCalculator } from '@/components/dashboard/SipCalculator';
import { TransactionTable } from '@/components/transactions/TransactionTable';
import { AddTransactionModal } from '@/components/transactions/AddTransactionModal';
import {
  LayoutDashboard,
  PieChart,
  ArrowLeftRight,
  Calculator,
} from 'lucide-react';

export function App() {
  const { activeTab, setActiveTab } = useFinanceStore();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar onOpenAddModal={() => setIsAddModalOpen(true)} />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Desktop Sidebar */}
        <Sidebar />

        {/* Dynamic Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 pb-20 md:pb-8">
          {/* Mobile Tab Bar */}
          <div className="flex md:hidden rounded-xl bg-slate-900 border border-slate-800 p-1 text-xs font-mono">
            {[
              { id: 'dashboard', label: 'Overview', icon: LayoutDashboard },
              { id: 'investments', label: 'Holdings', icon: PieChart },
              { id: 'transactions', label: 'Ledger', icon: ArrowLeftRight },
              { id: 'goals', label: 'Planner', icon: Calculator },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg font-bold transition-all ${
                    isActive
                      ? 'bg-emerald-500 text-white shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab 1: Overview Dashboard */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
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
            </div>
          )}

          {/* Tab 2: Holdings & Asset Allocation */}
          {activeTab === 'investments' && (
            <div className="space-y-6">
              <StatCards />
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2">
                  <HoldingsTable />
                </div>
                <div>
                  <AllocationDonut />
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Transactions Ledger */}
          {activeTab === 'transactions' && (
            <div className="space-y-6">
              <TransactionTable />
            </div>
          )}

          {/* Tab 4: SIP & Wealth Projection Calculator */}
          {activeTab === 'goals' && (
            <div className="space-y-6">
              <SipCalculator />
            </div>
          )}
        </main>
      </div>

      {/* Record Transaction Modal */}
      <AddTransactionModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />
    </div>
  );
}

export default App;
