import React, { useState, useMemo } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { InsurancePolicy, InsuranceType } from '@/types/finance';
import {
  formatCurrency,
  CURRENCY_CONFIGS,
  INSURANCE_TYPE_LABELS,
  INSURANCE_TYPE_COLORS,
} from '@/utils/formatters';
import {
  HeartPulse,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  PhoneCall,
  Sparkles,
  X,
  CreditCard,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const InsuranceManager: React.FC = () => {
  const {
    policies,
    currency,
    addPolicy,
    deletePolicy,
    updatePolicyStatus,
    addCalendarEvent,
    getPortfolioSummary,
  } = useFinanceStore();

  const currentRate = CURRENCY_CONFIGS[currency].rateFromUSD;
  const summary = getPortfolioSummary();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filterType, setFilterType] = useState<string>('ALL');

  // New Policy Form State
  const [newName, setNewName] = useState('');
  const [newType, setNewType] = useState<InsuranceType>('TERM_LIFE');
  const [newProvider, setNewProvider] = useState('');
  const [newNumber, setNewNumber] = useState('');
  const [newSumAssured, setNewSumAssured] = useState<number>(10000000); // ₹1 Cr default
  const [newPremium, setNewPremium] = useState<number>(20000);
  const [newRenewalDate, setNewRenewalDate] = useState('2027-03-31');
  const [newMembers, setNewMembers] = useState('Self');
  const [newHelpline, setNewHelpline] = useState('');
  const [newNotes, setNewNotes] = useState('');

  // Top Metrics Aggregates
  const metrics = useMemo(() => {
    let totalLifeCoverUSD = 0;
    let totalHealthCoverUSD = 0;
    let totalAnnualPremiumUSD = 0;
    let upcomingRenewalsCount = 0;

    const now = new Date();
    const next45Days = new Date();
    next45Days.setDate(now.getDate() + 45);

    policies.forEach((pol) => {
      totalAnnualPremiumUSD += pol.annualPremium;

      if (pol.type === 'TERM_LIFE') {
        totalLifeCoverUSD += pol.sumAssured;
      }
      if (pol.type === 'HEALTH_FLOATER' || pol.type === 'CRITICAL_ILLNESS') {
        totalHealthCoverUSD += pol.sumAssured;
      }

      const renewal = new Date(pol.renewalDueDate);
      if (renewal >= now && renewal <= next45Days) {
        upcomingRenewalsCount++;
      }
    });

    // 15x Rule for Life Insurance Benchmark
    const estimatedAnnualIncomeUSD = summary.totalMonthlyIncome * 12;
    const targetLifeCoverUSD = estimatedAnnualIncomeUSD > 0 ? estimatedAnnualIncomeUSD * 15 : 150000;
    const lifeCoverageGapUSD = Math.max(0, targetLifeCoverUSD - totalLifeCoverUSD);
    const lifeCoveragePercent =
      targetLifeCoverUSD > 0 ? Math.min(100, (totalLifeCoverUSD / targetLifeCoverUSD) * 100) : 0;

    return {
      totalLifeCoverUSD,
      totalHealthCoverUSD,
      totalAnnualPremiumUSD,
      upcomingRenewalsCount,
      targetLifeCoverUSD,
      lifeCoverageGapUSD,
      lifeCoveragePercent,
    };
  }, [policies, summary.totalMonthlyIncome]);

  // Filtered Policies
  const filteredPolicies = useMemo(() => {
    if (filterType === 'ALL') return policies;
    return policies.filter((p) => p.type === filterType);
  }, [policies, filterType]);

  // Handle Create Policy
  const handleCreatePolicy = (e: React.FormEvent) => {
    e.preventDefault();
    const sumUSD = currency === 'INR' ? newSumAssured / currentRate : newSumAssured;
    const premiumUSD = currency === 'INR' ? newPremium / currentRate : newPremium;

    addPolicy({
      policyName: newName || 'Insurance Protection Policy',
      type: newType,
      provider: newProvider || 'Insurance Corporation',
      policyNumber: newNumber || `POL-${Date.now().toString().slice(-6)}`,
      sumAssured: sumUSD,
      annualPremium: premiumUSD,
      renewalDueDate: newRenewalDate,
      coveredMembers: newMembers || 'Self',
      status: 'ACTIVE',
      tpaHelpline: newHelpline,
      notes: newNotes,
    });

    setIsAddModalOpen(false);
    setNewName('');
    setNewProvider('');
    setNewNumber('');
    setNewNotes('');
  };

  // Sync Single Policy Renewal to Calendar
  const handleSyncToCalendar = (policy: InsurancePolicy) => {
    addCalendarEvent({
      title: `${policy.policyName} Premium Due`,
      date: policy.renewalDueDate,
      type: 'PLANNED_EXPENSE',
      amount: policy.annualPremium,
      categoryName: 'Insurance Premium',
      notes: `Policy #${policy.policyNumber} (${policy.provider}). Helpline: ${policy.tpaHelpline || 'N/A'}`,
    });
    alert(`Added "${policy.policyName} Premium Due" to your Financial Calendar on ${policy.renewalDueDate}!`);
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-3xl bg-white border border-[#e8e0d1] shadow-xs">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <div className="p-2.5 rounded-2xl bg-[#9e783e]/15 text-[#9e783e]">
              <HeartPulse className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">
                Protection & Insurance Portfolio
              </h2>
              <span className="text-xs font-semibold text-[#866632] bg-[#f4efe4] px-2.5 py-0.5 rounded-md border border-[#ded3bf]">
                Life, Health & Property Shield
              </span>
            </div>
          </div>
          <p className="text-xs text-slate-600 mt-2 max-w-2xl font-medium leading-relaxed">
            Monitor active term life, health floaters, and motor insurance policies. Ensure your family has adequate
            coverage ($15\times$ income rule) against unforeseen medical or life contingencies.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => {
              if (currency === 'INR') {
                setNewSumAssured(10000000);
                setNewPremium(22000);
              } else {
                setNewSumAssured(120000);
                setNewPremium(250);
              }
              setIsAddModalOpen(true);
            }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] shadow-md shadow-[#9e783e]/20 transition-all cursor-pointer"
          >
            <Plus className="h-4 w-4" />
            <span>Add Insurance Policy</span>
          </motion.button>
        </div>
      </div>

      {/* Top 4 KPI Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Life Coverage */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-indigo-200 bg-gradient-to-b from-indigo-50/40 via-white to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-indigo-900 uppercase text-[11px] tracking-wider">
              Total Life Coverage
            </span>
            <div className="p-2 rounded-xl bg-indigo-100 text-indigo-700">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-indigo-950">
            {formatCurrency(metrics.totalLifeCoverUSD, currency)}
          </div>
          <span className="text-xs text-indigo-700 font-semibold mt-1.5 block">
            Pure term life protection for dependents
          </span>
        </motion.div>

        {/* Total Health Protection */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-emerald-200 bg-gradient-to-b from-emerald-50/40 via-white to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-emerald-900 uppercase text-[11px] tracking-wider">
              Health Floater Cover
            </span>
            <div className="p-2 rounded-xl bg-emerald-100 text-emerald-700">
              <HeartPulse className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-emerald-950">
            {formatCurrency(metrics.totalHealthCoverUSD, currency)}
          </div>
          <span className="text-xs text-emerald-700 font-semibold mt-1.5 block">
            Hospitalisation & critical illness shield
          </span>
        </motion.div>

        {/* Annual Premium Outflow */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-[#e8e0d1] bg-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-slate-600 uppercase text-[11px] tracking-wider">
              Annual Premium Outflow
            </span>
            <div className="p-2 rounded-xl bg-[#faf7f0] text-[#9e783e]">
              <CreditCard className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-slate-900">
            {formatCurrency(metrics.totalAnnualPremiumUSD, currency)}
          </div>
          <span className="text-xs text-slate-500 font-medium mt-1.5 block">
            Combined protection cost across {policies.length} policies
          </span>
        </motion.div>

        {/* Upcoming Renewals */}
        <motion.div
          whileHover={{ y: -3, transition: { duration: 0.2 } }}
          className="rounded-2xl border border-amber-200 bg-gradient-to-b from-amber-50/40 via-white to-white p-5 shadow-xs"
        >
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-bold text-amber-900 uppercase text-[11px] tracking-wider">
              Renewals (Next 45 Days)
            </span>
            <div className="p-2 rounded-xl bg-amber-100 text-amber-800">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-extrabold font-mono text-amber-950">
            {metrics.upcomingRenewalsCount} Policies Due
          </div>
          <span className="text-xs text-amber-700 font-semibold mt-1.5 block">
            {metrics.upcomingRenewalsCount > 0 ? 'Action required to prevent lapse' : 'All policies up to date'}
          </span>
        </motion.div>
      </div>

      {/* 15x Rule Life Insurance Adequacy Gap Card */}
      <motion.div
        whileHover={{ y: -2, transition: { duration: 0.2 } }}
        className="rounded-3xl border border-[#ded3bf] bg-gradient-to-br from-[#faf7f0] via-[#f7f2e6] to-[#faf8f5] p-6 shadow-xs space-y-4"
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-[#9e783e]/15 text-[#9e783e]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Life Insurance Adequacy Audit (15x Rule)
              </h3>
              <p className="text-xs text-slate-600 font-medium">
                Standard actuarial benchmark recommends term coverage equal to 10–15x your annual gross income
              </p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[11px] font-bold text-slate-500 uppercase block">Adequacy Level</span>
            <span
              className={`text-sm font-extrabold font-mono ${
                metrics.lifeCoveragePercent >= 100 ? 'text-emerald-700' : 'text-amber-800'
              }`}
            >
              {metrics.lifeCoveragePercent.toFixed(1)}% of Target Cover
            </span>
          </div>
        </div>

        {/* Progress Bar & Target Comparison */}
        <div className="space-y-2 bg-white/80 p-4 rounded-2xl border border-[#ded3bf]">
          <div className="flex justify-between text-xs font-semibold text-slate-700">
            <span>
              Active Term Life: <strong>{formatCurrency(metrics.totalLifeCoverUSD, currency)}</strong>
            </span>
            <span>
              Recommended Target (15x): <strong>{formatCurrency(metrics.targetLifeCoverUSD, currency)}</strong>
            </span>
          </div>

          <div className="w-full h-2.5 rounded-full bg-slate-200 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                metrics.lifeCoveragePercent >= 100 ? 'bg-emerald-600' : 'bg-[#9e783e]'
              }`}
              style={{ width: `${metrics.lifeCoveragePercent}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] pt-1">
            <span className="text-slate-500">
              {metrics.lifeCoverageGapUSD > 0
                ? `Coverage deficit of ${formatCurrency(metrics.lifeCoverageGapUSD, currency)} to reach full 15x security.`
                : 'Your family is 100% shielded with the recommended 15x term cover.'}
            </span>
            {metrics.lifeCoverageGapUSD > 0 && (
              <span className="text-[#866632] font-bold">
                Low-cost pure term cover recommended
              </span>
            )}
          </div>
        </div>
      </motion.div>

      {/* Filter Tabs & Active Policies Registry */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900">
              Active Protection Policies ({filteredPolicies.length})
            </h3>
            <p className="text-xs text-slate-600">
              Manage sum assured, policy numbers, claim helplines, and premium renewals
            </p>
          </div>

          {/* Type Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 rounded-xl bg-white p-1 border border-[#e8e0d1] text-xs font-bold shadow-xs">
            {['ALL', 'TERM_LIFE', 'HEALTH_FLOATER', 'MOTOR_VEHICLE'].map((type) => (
              <button
                key={type}
                onClick={() => setFilterType(type)}
                className={`px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                  filterType === type
                    ? 'bg-[#9e783e] text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5]'
                }`}
              >
                {type === 'ALL'
                  ? 'All Policies'
                  : type === 'TERM_LIFE'
                  ? 'Term Life'
                  : type === 'HEALTH_FLOATER'
                  ? 'Health Floater'
                  : 'Motor Auto'}
              </button>
            ))}
          </div>
        </div>

        {/* Policies Grid */}
        {filteredPolicies.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-[#e8e0d1] shadow-xs">
            <div className="p-4 rounded-2xl bg-[#faf7f0] text-[#9e783e] w-fit mx-auto mb-3 border border-[#ded3bf]">
              <HeartPulse className="h-8 w-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 mb-1">No Insurance Policies Recorded</h4>
            <p className="text-xs text-slate-600 max-w-md mx-auto mb-4 font-medium leading-relaxed">
              Recording your health, life, and motor insurance policies ensures you never miss a renewal deadline and
              maintain complete downside protection.
            </p>
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-all cursor-pointer shadow-xs"
            >
              + Add First Policy
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPolicies.map((policy) => {
              const colorConfig = INSURANCE_TYPE_COLORS[policy.type];
              const isDueSoon = policy.status === 'DUE_SOON';

              return (
                <motion.div
                  key={policy.id}
                  whileHover={{ y: -3, transition: { duration: 0.2 } }}
                  className="rounded-3xl border border-[#e8e0d1] bg-white p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div>
                    {/* Badge & Delete */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-md border ${colorConfig.badge} ${colorConfig.border}`}
                      >
                        {INSURANCE_TYPE_LABELS[policy.type]}
                      </span>

                      <div className="flex items-center gap-1">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${
                            isDueSoon
                              ? 'bg-amber-100 text-amber-900 border border-amber-300'
                              : 'bg-emerald-50 text-emerald-800 border border-emerald-200'
                          }`}
                        >
                          {isDueSoon ? 'Renewal Due Soon' : 'Active Policy'}
                        </span>
                        <button
                          onClick={() => {
                            if (window.confirm(`Delete policy "${policy.policyName}"?`)) {
                              deletePolicy(policy.id);
                            }
                          }}
                          className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                          title="Delete policy"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>

                    <h4 className="text-sm font-bold text-slate-900 leading-snug">{policy.policyName}</h4>
                    <p className="text-[11px] text-slate-500 font-semibold">{policy.provider}</p>
                    <span className="text-[10px] font-mono text-slate-400 block mt-0.5">
                      Policy #{policy.policyNumber}
                    </span>
                  </div>

                  {/* Coverage Details */}
                  <div className="p-3.5 rounded-2xl bg-[#faf8f5] border border-[#e8e0d1] space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-[11px] font-bold text-slate-500 uppercase">Sum Assured</span>
                      <span className="text-base font-extrabold font-mono text-emerald-800">
                        {formatCurrency(policy.sumAssured, currency)}
                      </span>
                    </div>

                    <div className="flex items-baseline justify-between pt-1 border-t border-[#f2ece1] text-[11px]">
                      <span className="font-semibold text-slate-600">Annual Premium</span>
                      <span className="font-extrabold font-mono text-slate-900">
                        {formatCurrency(policy.annualPremium, currency)} / yr
                      </span>
                    </div>
                  </div>

                  {/* Meta Specs */}
                  <div className="space-y-1.5 text-[11px] text-slate-600 font-medium">
                    <div className="flex items-center justify-between">
                      <span>Covered Members:</span>
                      <strong className="text-slate-900">{policy.coveredMembers}</strong>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3 text-[#9e783e]" /> Renewal Due:
                      </span>
                      <strong className="font-mono text-slate-900">{policy.renewalDueDate}</strong>
                    </div>

                    {policy.tpaHelpline && (
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <PhoneCall className="h-3 w-3 text-slate-400" /> Claim Helpline:
                        </span>
                        <span className="font-mono text-slate-700">{policy.tpaHelpline}</span>
                      </div>
                    )}
                  </div>

                  {/* Card Actions */}
                  <div className="flex items-center gap-2 pt-2 border-t border-[#f2ece1]">
                    <button
                      onClick={() => handleSyncToCalendar(policy)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 rounded-xl bg-[#faf8f5] hover:bg-[#f4efe4] border border-[#e8e0d1] text-xs font-bold text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
                    >
                      <Calendar className="h-3.5 w-3.5 text-[#9e783e]" />
                      <span>Sync Calendar</span>
                    </button>
                    <button
                      onClick={() => {
                        const nextYear = new Date(policy.renewalDueDate);
                        nextYear.setFullYear(nextYear.getFullYear() + 1);
                        updatePolicyStatus(policy.id, 'ACTIVE');
                        alert(`Premium marked as paid! Renewal date rolled to ${nextYear.toISOString().split('T')[0]}.`);
                      }}
                      className="flex items-center justify-center gap-1 py-2 px-3 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] transition-colors cursor-pointer shadow-xs"
                      title="Mark current year premium paid"
                    >
                      <CheckCircle2 className="h-3.5 w-3.5" />
                      <span>Paid</span>
                    </button>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* ============================================================== */}
      {/* ADD POLICY MODAL                                               */}
      {/* ============================================================== */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-lg rounded-3xl bg-white border border-[#e8e0d1] p-6 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e8e0d1]">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-[#9e783e]/15 text-[#9e783e]">
                    <HeartPulse className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">Add Insurance Policy</h3>
                    <p className="text-[11px] text-slate-500 font-medium">
                      Record life, health floater, or motor insurance protection
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAddModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePolicy} className="space-y-4 text-xs font-semibold text-slate-700">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Policy Plan Name *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC Life Click 2 Protect, Star Health"
                      value={newName}
                      onChange={(e) => setNewName(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Insurance Type *</label>
                    <select
                      value={newType}
                      onChange={(e) => setNewType(e.target.value as InsuranceType)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    >
                      <option value="TERM_LIFE">Term Life Insurance</option>
                      <option value="HEALTH_FLOATER">Family Health Floater</option>
                      <option value="CRITICAL_ILLNESS">Critical Illness Rider</option>
                      <option value="MOTOR_VEHICLE">Motor Vehicle Comprehensive</option>
                      <option value="HOME_PROPERTY">Home & Property Protection</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Insurance Provider *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. HDFC Life, Tata AIG, Star Health"
                      value={newProvider}
                      onChange={(e) => setNewProvider(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Policy Number / ID</label>
                    <input
                      type="text"
                      placeholder="e.g. HD-982144-TL"
                      value={newNumber}
                      onChange={(e) => setNewNumber(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">
                      Sum Assured / Coverage ({currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="100"
                      value={newSumAssured}
                      onChange={(e) => setNewSumAssured(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">
                      Annual Premium ({currency}) *
                    </label>
                    <input
                      type="number"
                      required
                      min="0"
                      value={newPremium}
                      onChange={(e) => setNewPremium(Number(e.target.value))}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono font-bold focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Next Renewal Due Date *</label>
                    <input
                      type="date"
                      required
                      value={newRenewalDate}
                      onChange={(e) => setNewRenewalDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Covered Members / Vehicle</label>
                    <input
                      type="text"
                      placeholder="e.g. Self, Spouse & 1 Child"
                      value={newMembers}
                      onChange={(e) => setNewMembers(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Claims / TPA Helpline</label>
                    <input
                      type="text"
                      placeholder="e.g. 1800-266-9777"
                      value={newHelpline}
                      onChange={(e) => setNewHelpline(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-mono focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Notes / Riders</label>
                    <input
                      type="text"
                      placeholder="e.g. Critical illness rider, zero room rent cap"
                      value={newNotes}
                      onChange={(e) => setNewNotes(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e8e0d1] text-xs text-slate-900 font-medium focus:border-[#9e783e] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e8e0d1]">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#e8e0d1] text-xs font-semibold text-slate-600 hover:text-slate-900 hover:bg-[#faf8f5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#9e783e] text-white text-xs font-bold hover:bg-[#88642e] shadow-md shadow-[#9e783e]/20 cursor-pointer"
                  >
                    Save Policy
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
