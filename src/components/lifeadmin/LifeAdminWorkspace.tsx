import React, { useState } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { SectionHero } from '@/components/layout/SectionHero';
import {
  FileText,
  AlertTriangle,
  Plus,
  Trash2,
  ShieldCheck,
  Calendar,
  HeartHandshake,
  Phone,
  Copy,
  Check,
  CheckCircle2,
  Circle,
  X,
  FileCheck,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LifeAdminWorkspace: React.FC = () => {
  const {
    documents,
    addDocument,
    deleteDocument,
    emergencyInfo,
    saveEmergencyInfo,
    adminChecklists,
    addChecklist,
    toggleChecklist,
    deleteChecklist,
  } = useLifeOSStore();

  // Active Sub-Tab: 'VAULT' | 'EMERGENCY' | 'CHECKLISTS'
  const [activeTab, setActiveTab] = useState<'VAULT' | 'EMERGENCY' | 'CHECKLISTS'>('VAULT');

  // Modals & Forms
  const [isDocModalOpen, setIsDocModalOpen] = useState(false);
  const [isChecklistModalOpen, setIsChecklistModalOpen] = useState(false);
  const [isEmergencyEditOpen, setIsEmergencyEditOpen] = useState(false);
  const [filterDocCategory, setFilterDocCategory] = useState<string>('ALL');

  // Document Form
  const [docTitle, setDocTitle] = useState('');
  const [docCategory, setDocCategory] = useState<'ID_CARD' | 'INSURANCE' | 'PROPERTY' | 'VEHICLE' | 'TAX_RECORD'>('ID_CARD');
  const [docNumber, setDocNumber] = useState('');
  const [docExpiry, setDocExpiry] = useState('2030-01-01');
  const [docAuthority, setDocAuthority] = useState('');
  const [docNotes, setDocNotes] = useState('');

  // Checklist Form
  const [chkTitle, setChkTitle] = useState('');
  const [chkFreq, setChkFreq] = useState<'ANNUAL' | 'BIANNUAL' | 'QUARTERLY' | 'MONTHLY'>('ANNUAL');
  const [chkDueDate, setChkDueDate] = useState('2027-03-31');
  const [chkCat, setChkCat] = useState('TAX');

  // Emergency Form State
  const [emBlood, setEmBlood] = useState(emergencyInfo?.bloodGroup || 'O+ Positive');
  const [emAllergies, setEmAllergies] = useState(emergencyInfo?.allergies || 'None reported');
  const [emConditions, setEmConditions] = useState(emergencyInfo?.medicalConditions || 'None reported');
  const [emPrimName, setEmPrimName] = useState(emergencyInfo?.primaryContactName || 'Jane S T');
  const [emPrimPhone, setEmPrimPhone] = useState(emergencyInfo?.primaryContactPhone || '+91 98765 11223');
  const [emPrimRel, setEmPrimRel] = useState(emergencyInfo?.primaryContactRelation || 'Spouse');
  const [emSecName, setEmSecName] = useState(emergencyInfo?.secondaryContactName || 'Senior Varun');
  const [emSecPhone, setEmSecPhone] = useState(emergencyInfo?.secondaryContactPhone || '+91 98765 44332');
  const [emPhysician, setEmPhysician] = useState(emergencyInfo?.physicianName || 'Dr. Arvind Sharma (MD)');
  const [emPhysicianPhone, setEmPhysicianPhone] = useState(emergencyInfo?.physicianPhone || '+91 80 4123 4567');
  const [emTpa, setEmTpa] = useState(emergencyInfo?.tpaHelpline || '1800-102-4477 (HDFC ERGO Cashless)');
  const [emNotes, setEmNotes] = useState(emergencyInfo?.notes || 'Emergency card in wallet');

  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const expiringSoonCount = documents.filter((d) => d.status === 'EXPIRING_SOON').length;

  const filteredDocs = documents.filter(
    (d) => filterDocCategory === 'ALL' || d.category === filterDocCategory
  );

  const handleCreateDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!docTitle.trim() || !docNumber.trim()) return;

    addDocument({
      title: docTitle.trim(),
      category: docCategory,
      documentNumber: docNumber.trim(),
      expiryDate: docExpiry || undefined,
      status: 'ACTIVE',
      authority: docAuthority.trim() || 'Official Issuing Authority',
      notes: docNotes.trim() || undefined,
    });

    setDocTitle('');
    setDocNumber('');
    setDocNotes('');
    setIsDocModalOpen(false);
    showToast(`Document "${docTitle.trim()}" vaulted securely!`);
  };

  const handleCreateChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chkTitle.trim() || !chkDueDate) return;

    addChecklist({
      title: chkTitle.trim(),
      frequency: chkFreq,
      dueDate: chkDueDate,
      category: chkCat,
    });

    setChkTitle('');
    setIsChecklistModalOpen(false);
    showToast(`Recurring item "${chkTitle.trim()}" added to administrative tracker!`);
  };

  const handleSaveEmergency = (e: React.FormEvent) => {
    e.preventDefault();
    saveEmergencyInfo({
      bloodGroup: emBlood,
      allergies: emAllergies,
      medicalConditions: emConditions,
      primaryContactName: emPrimName,
      primaryContactPhone: emPrimPhone,
      primaryContactRelation: emPrimRel,
      secondaryContactName: emSecName,
      secondaryContactPhone: emSecPhone,
      physicianName: emPhysician,
      physicianPhone: emPhysicianPhone,
      tpaHelpline: emTpa,
      notes: emNotes,
    });
    setIsEmergencyEditOpen(false);
    showToast('Emergency medical profile updated and saved to database!');
  };

  const handleCopyEmergencySummary = () => {
    const summary = `🚨 EMERGENCY MEDICAL SUMMARY 🚨
Name: Varun S T
Blood Group: ${emBlood}
Allergies: ${emAllergies}
Medical Conditions: ${emConditions}
Primary Contact: ${emPrimName} (${emPrimRel}) - ${emPrimPhone}
Secondary Contact: ${emSecName} - ${emSecPhone}
Physician: ${emPhysician} - ${emPhysicianPhone}
24x7 TPA Helpline: ${emTpa}
Notes: ${emNotes}`;

    navigator.clipboard.writeText(summary);
    showToast('Emergency summary copied to clipboard! 📋');
  };

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      <AnimatePresence>
        {toastMsg && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="fixed top-5 right-5 z-50 bg-[#17365d] text-white px-4 py-2.5 rounded-xl shadow-lg border border-slate-700 flex items-center gap-2 text-xs font-bold"
          >
            <Check className="w-4 h-4 text-emerald-400" />
            <span>{toastMsg}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 1. Amber Hero Banner */}
      <SectionHero
        section="lifeadmin"
        onPrimaryAction={() => setIsDocModalOpen(true)}
        primaryActionLabel="+ Add a Document"
        onSecondaryAction={() => setActiveTab('EMERGENCY')}
        secondaryActionLabel="View Emergency Card"
      />

      {/* 2. Top 4 Life Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Vaulted Documents</span>
            <div className="w-9 h-9 rounded-xl bg-[#fff0df] text-[#b27635] flex items-center justify-center font-bold text-sm">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {documents.length}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Secured in encrypted SQLite vault</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Renewals coming up</span>
            <div className="w-9 h-9 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center font-bold text-sm">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {expiringSoonCount}
          </div>
          <div className="text-[11px] text-rose-600 mt-1 font-bold">Action required within 60 days</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Emergency Readiness</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <ShieldCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            100%
          </div>
          <div className="text-[11px] text-emerald-600 mt-1 font-bold">Contacts & TPA Hotline active</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Admin Checklists</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-sm">
              <FileCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {adminChecklists.length}
          </div>
          <div className="text-[11px] text-blue-600 mt-1 font-bold">Annual recurring legal & taxes</div>
        </article>
      </div>

      {/* 3. Sub-Tab Navigation */}
      <div className="flex items-center gap-2 border-b border-[#e4e9f1] pb-2 text-xs font-bold">
        <button
          onClick={() => setActiveTab('VAULT')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'VAULT'
              ? 'bg-[#b27635] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Encrypted Document Vault ({documents.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('EMERGENCY')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'EMERGENCY'
              ? 'bg-[#b27635] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <HeartHandshake className="w-3.5 h-3.5" />
          <span>Emergency Medical & Contact Card</span>
        </button>
        <button
          onClick={() => setActiveTab('CHECKLISTS')}
          className={`px-4 py-2 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
            activeTab === 'CHECKLISTS'
              ? 'bg-[#b27635] text-white shadow-xs'
              : 'text-[#6f7c91] hover:text-[#243047] hover:bg-white'
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Annual Recurring Checklists ({adminChecklists.length})</span>
        </button>
      </div>

      {/* ======================================================== */}
      {/* SUBTAB 1: ENCRYPTED DOCUMENT VAULT                       */}
      {/* ======================================================== */}
      {activeTab === 'VAULT' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4e9f1] gap-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                Document Vault & Expiry Reminders
              </h3>
              <p className="text-xs text-[#6f7c91]">
                Passports, vehicle titles, property agreements, and insurance policies with expiry tracking
              </p>
            </div>
            <button
              onClick={() => setIsDocModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#b27635] hover:bg-[#976025] text-white text-xs font-bold transition-all shadow-md shadow-[#b27635]/20 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Vault Document</span>
            </button>
          </div>

          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-[11px] font-bold scrollbar-none">
            {['ALL', 'ID_CARD', 'INSURANCE', 'PROPERTY', 'VEHICLE', 'TAX_RECORD'].map((cat) => (
              <button
                key={cat}
                onClick={() => setFilterDocCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all cursor-pointer ${
                  filterDocCategory === cat
                    ? 'bg-[#17365d] text-white'
                    : 'bg-slate-100 text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat === 'ALL' ? 'All Documents' : cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredDocs.map((doc) => (
              <div
                key={doc.id}
                className="p-5 rounded-2xl border border-slate-200 bg-slate-50/50 space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-[#fff0df] text-[#b27635] uppercase">
                      {doc.category.replace('_', ' ')}
                    </span>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="text-slate-300 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Delete document"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <h4 className="text-sm font-extrabold text-slate-800 mt-2">{doc.title}</h4>
                  <div className="text-xs font-mono text-slate-600 mt-1">
                    Doc #: {doc.documentNumber}
                  </div>
                  <div className="text-[11px] text-slate-500 font-medium">Issued by: {doc.authority}</div>
                  {doc.notes && (
                    <p className="text-[11px] text-slate-500 italic mt-1">{doc.notes}</p>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-600">
                    Expiry: {doc.expiryDate ? doc.expiryDate : 'No expiry'}
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] uppercase font-extrabold ${
                      doc.status === 'EXPIRING_SOON'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                    }`}
                  >
                    {doc.status.replace('_', ' ')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 2: EMERGENCY MEDICAL & CONTACT CARD               */}
      {/* ======================================================== */}
      {activeTab === 'EMERGENCY' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#e4e9f1] gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-rose-600 font-black text-sm">🚨</span>
                <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
                  Emergency Medical & Hospital Readiness Profile
                </h3>
              </div>
              <p className="text-xs text-[#6f7c91]">
                Critical information accessible for immediate first-responder and hospital admission use
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyEmergencySummary}
                className="px-3.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Summary</span>
              </button>
              <button
                onClick={() => setIsEmergencyEditOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-[#b27635] hover:bg-[#976025] text-white text-xs font-bold transition-all cursor-pointer"
              >
                Edit Emergency Details
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* Medical Vital Strip */}
            <div className="p-5 rounded-2xl bg-rose-50/60 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-700 text-xs font-extrabold uppercase">
                <ShieldCheck className="w-4 h-4" />
                <span>Medical Vitals</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Blood Group:</span>
                <div className="text-xl font-extrabold text-rose-900">{emBlood}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Known Drug/Food Allergies:</span>
                <div className="text-xs font-bold text-slate-800">{emAllergies}</div>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Chronic Medical Conditions:</span>
                <div className="text-xs font-bold text-slate-800">{emConditions}</div>
              </div>
            </div>

            {/* Primary & Secondary Contacts */}
            <div className="p-5 rounded-2xl bg-amber-50/60 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-800 text-xs font-extrabold uppercase">
                <Phone className="w-4 h-4" />
                <span>Emergency Contacts</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Primary Contact:</span>
                <div className="text-sm font-extrabold text-slate-800">
                  {emPrimName} ({emPrimRel})
                </div>
                <div className="text-xs font-mono font-bold text-amber-900">{emPrimPhone}</div>
              </div>
              <div className="pt-2 border-t border-amber-200">
                <span className="text-[11px] text-slate-500 font-medium">Secondary Contact:</span>
                <div className="text-sm font-extrabold text-slate-800">{emSecName}</div>
                <div className="text-xs font-mono font-bold text-amber-900">{emSecPhone}</div>
              </div>
            </div>

            {/* Hospital & Insurance Hotline */}
            <div className="p-5 rounded-2xl bg-blue-50/60 border border-blue-200 space-y-3">
              <div className="flex items-center gap-2 text-blue-800 text-xs font-extrabold uppercase">
                <HeartHandshake className="w-4 h-4" />
                <span>Physician & Cashless TPA</span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 font-medium">Primary Physician:</span>
                <div className="text-sm font-extrabold text-slate-800">{emPhysician}</div>
                <div className="text-xs font-mono font-bold text-blue-900">{emPhysicianPhone}</div>
              </div>
              <div className="pt-2 border-t border-blue-200">
                <span className="text-[11px] text-slate-500 font-medium">24x7 Cashless Hospital TPA Helpline:</span>
                <div className="text-sm font-extrabold text-blue-900 font-mono">{emTpa}</div>
                <p className="text-[10px] text-slate-600 mt-0.5">{emNotes}</p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ======================================================== */}
      {/* SUBTAB 3: RECURRING LIFE ADMIN CHECKLISTS                */}
      {/* ======================================================== */}
      {activeTab === 'CHECKLISTS' && (
        <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-4 border-b border-[#e4e9f1]">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-[#243047] flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#b27635]" />
                <span>Annual & Periodic Administrative Checklists</span>
              </h3>
              <p className="text-xs text-[#6f7c91]">
                Never miss an income tax filing, pollution check, vehicle insurance renewal, or annual health screening
              </p>
            </div>
            <button
              onClick={() => setIsChecklistModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#b27635] hover:bg-[#976025] text-white text-xs font-bold transition-all shadow-md shadow-[#b27635]/20 cursor-pointer flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" />
              <span>Add Checklist Item</span>
            </button>
          </div>

          <div className="divide-y divide-slate-100">
            {adminChecklists.map((chk) => (
              <div
                key={chk.id}
                className="py-3.5 flex items-center justify-between gap-3 text-xs group"
              >
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => {
                      toggleChecklist(chk.id);
                      showToast(chk.isCompleted ? 'Checklist reset' : 'Marked as completed! 🎉');
                    }}
                    className="shrink-0 text-slate-400 hover:text-emerald-600 transition-colors cursor-pointer"
                  >
                    {chk.isCompleted ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                    ) : (
                      <Circle className="w-5 h-5 hover:text-[#b27635]" />
                    )}
                  </button>

                  <div>
                    <div
                      className={`font-bold ${
                        chk.isCompleted ? 'line-through text-slate-400' : 'text-slate-800'
                      }`}
                    >
                      {chk.title}
                    </div>
                    <div className="text-[11px] text-slate-500 font-medium">
                      Due: {chk.dueDate} · Category: {chk.category}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 text-[10px] font-extrabold uppercase">
                    {chk.frequency}
                  </span>
                  <button
                    onClick={() => deleteChecklist(chk.id)}
                    className="opacity-0 group-hover:opacity-100 text-slate-300 hover:text-rose-600 transition-colors cursor-pointer p-1"
                    title="Delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Vault Document Modal */}
      <AnimatePresence>
        {isDocModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-base text-[#243047]">Vault Official Document</h3>
                <button
                  onClick={() => setIsDocModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateDocument} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Passport (Republic of India)"
                    value={docTitle}
                    onChange={(e) => setDocTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Category</label>
                    <select
                      value={docCategory}
                      onChange={(e) => setDocCategory(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="ID_CARD">ID Card / Passport</option>
                      <option value="INSURANCE">Insurance Policy</option>
                      <option value="PROPERTY">Property Deed / Khata</option>
                      <option value="VEHICLE">Vehicle Title / RC</option>
                      <option value="TAX_RECORD">Tax Filing / PAN</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Document / Reg # *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Z9874521"
                      value={docNumber}
                      onChange={(e) => setDocNumber(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Expiry Date</label>
                    <input
                      type="date"
                      value={docExpiry}
                      onChange={(e) => setDocExpiry(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Issuing Authority</label>
                    <input
                      type="text"
                      placeholder="e.g., MEA, Govt of India"
                      value={docAuthority}
                      onChange={(e) => setDocAuthority(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Storage Location / Safe Notes</label>
                  <textarea
                    rows={2}
                    placeholder="e.g., Physical original in home locker drawer 2"
                    value={docNotes}
                    onChange={(e) => setDocNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsDocModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#b27635] text-white font-bold"
                  >
                    Save to Vault
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Edit Emergency Profile Modal */}
      <AnimatePresence>
        {isEmergencyEditOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-[#e4e9f1] space-y-4 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-base text-[#243047]">
                  Edit Emergency Medical & Contacts
                </h3>
                <button
                  onClick={() => setIsEmergencyEditOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveEmergency} className="space-y-3 text-xs font-semibold">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Blood Group</label>
                    <input
                      type="text"
                      value={emBlood}
                      onChange={(e) => setEmBlood(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Allergies</label>
                    <input
                      type="text"
                      value={emAllergies}
                      onChange={(e) => setEmAllergies(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Medical Conditions</label>
                  <input
                    type="text"
                    value={emConditions}
                    onChange={(e) => setEmConditions(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div>
                    <label className="block text-slate-700 mb-1">Primary Contact</label>
                    <input
                      type="text"
                      value={emPrimName}
                      onChange={(e) => setEmPrimName(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Phone</label>
                    <input
                      type="text"
                      value={emPrimPhone}
                      onChange={(e) => setEmPrimPhone(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Relation</label>
                    <input
                      type="text"
                      value={emPrimRel}
                      onChange={(e) => setEmPrimRel(e.target.value)}
                      className="w-full px-2.5 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Secondary Contact Name</label>
                    <input
                      type="text"
                      value={emSecName}
                      onChange={(e) => setEmSecName(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Secondary Phone</label>
                    <input
                      type="text"
                      value={emSecPhone}
                      onChange={(e) => setEmSecPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Physician Name</label>
                    <input
                      type="text"
                      value={emPhysician}
                      onChange={(e) => setEmPhysician(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Physician Phone</label>
                    <input
                      type="text"
                      value={emPhysicianPhone}
                      onChange={(e) => setEmPhysicianPhone(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">24x7 TPA Emergency Helpline</label>
                  <input
                    type="text"
                    value={emTpa}
                    onChange={(e) => setEmTpa(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Emergency Card Notes</label>
                  <input
                    type="text"
                    value={emNotes}
                    onChange={(e) => setEmNotes(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsEmergencyEditOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#b27635] text-white font-bold"
                  >
                    Save Emergency Profile
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Add Checklist Modal */}
      <AnimatePresence>
        {isChecklistModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="font-extrabold text-base text-[#243047]">
                  Add Recurring Administrative Item
                </h3>
                <button
                  onClick={() => setIsChecklistModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateChecklist} className="space-y-4 text-xs font-semibold">
                <div>
                  <label className="block text-slate-700 mb-1">Checklist Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Annual Municipal Property Tax Payment"
                    value={chkTitle}
                    onChange={(e) => setChkTitle(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-700 mb-1">Frequency</label>
                    <select
                      value={chkFreq}
                      onChange={(e) => setChkFreq(e.target.value as any)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="ANNUAL">Annual</option>
                      <option value="BIANNUAL">Biannual</option>
                      <option value="QUARTERLY">Quarterly</option>
                      <option value="MONTHLY">Monthly</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-slate-700 mb-1">Category</label>
                    <select
                      value={chkCat}
                      onChange={(e) => setChkCat(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-slate-200 bg-white"
                    >
                      <option value="TAX">Tax Filing</option>
                      <option value="VEHICLE">Vehicle & Transport</option>
                      <option value="FINANCE">Finance & Legal</option>
                      <option value="HEALTH">Health & Medical</option>
                      <option value="HOME">Home & Property</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={chkDueDate}
                    onChange={(e) => setChkDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsChecklistModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#b27635] text-white font-bold"
                  >
                    Add Checklist
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
