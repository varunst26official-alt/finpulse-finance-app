import React, { useState } from 'react';
import { useLifeOSStore } from '@/stores/lifeosStore';
import { SectionHero } from '@/components/layout/SectionHero';
import {
  FileText,
  AlertTriangle,
  Home,
  Plus,
  Trash2,
  ShieldCheck,
  Calendar,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export const LifeAdminWorkspace: React.FC = () => {
  const { documents, addDocument, deleteDocument } = useLifeOSStore();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'ID_CARD' | 'INSURANCE' | 'PROPERTY' | 'VEHICLE' | 'TAX_RECORD'>('ID_CARD');
  const [documentNumber, setDocumentNumber] = useState('');
  const [expiryDate, setExpiryDate] = useState('2030-01-01');
  const [authority, setAuthority] = useState('');

  const expiringSoonCount = documents.filter((d) => d.status === 'EXPIRING_SOON').length;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !documentNumber.trim()) return;

    addDocument({
      title: title.trim(),
      category,
      documentNumber: documentNumber.trim(),
      expiryDate: expiryDate || undefined,
      status: 'ACTIVE',
      authority: authority.trim() || 'Official Issuing Authority',
    });

    setTitle('');
    setDocumentNumber('');
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* 1. Amber Hero Banner */}
      <SectionHero
        section="lifeadmin"
        onPrimaryAction={() => setIsModalOpen(true)}
        primaryActionLabel="+ Add a Document"
        onSecondaryAction={() => alert('All renewal reminders are synced to your notifications.')}
        secondaryActionLabel="Check Renewal Reminders"
      />

      {/* 2. Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Documents</span>
            <div className="w-9 h-9 rounded-xl bg-[#fff0df] text-[#b27635] flex items-center justify-center font-bold text-sm">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            {documents.length}
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Secured in encrypted vault</div>
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
            <span className="text-xs font-bold text-[#6f7c91]">Household items</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-sm">
              <Home className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            4
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Maintenance schedules on track</div>
        </article>

        <article className="bg-white border border-[#e4e9f1] rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#6f7c91]">Appointments</span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm">
              <Calendar className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-[#243047] tracking-tight mt-3">
            2
          </div>
          <div className="text-[11px] text-[#6f7c91] mt-1 font-medium">Scheduled this month</div>
        </article>
      </div>

      {/* 3. Document Vault Table */}
      <section className="bg-white border border-[#e4e9f1] rounded-3xl p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
          <div>
            <h3 className="font-extrabold text-sm sm:text-base text-[#243047]">
              Secure Document Vault & Renewal Dates
            </h3>
            <p className="text-[11px] text-[#6f7c91]">
              Encrypted catalog of government IDs, insurance numbers, and vehicle certificates
            </p>
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className="px-3.5 py-1.5 rounded-xl bg-[#b27635] text-white text-xs font-bold hover:bg-[#9a642a] shadow-xs cursor-pointer flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>+ Add Document</span>
          </button>
        </div>

        <div className="divide-y divide-[#e4e9f1]">
          {documents.map((doc) => (
            <div
              key={doc.id}
              className="py-3.5 flex items-center justify-between gap-4 group hover:bg-[#fafcfe] px-2 rounded-xl transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-[#fff0df] text-[#b27635] font-bold text-sm flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="text-xs sm:text-sm font-bold text-[#243047] truncate">
                    {doc.title}
                  </div>
                  <div className="text-[11px] text-[#6f7c91] font-mono mt-0.5 truncate">
                    ID: {doc.documentNumber} · {doc.authority}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                {doc.expiryDate && (
                  <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
                    Expires: {doc.expiryDate}
                  </span>
                )}
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-1 rounded-full ${
                    doc.status === 'EXPIRING_SOON'
                      ? 'bg-rose-50 text-rose-700 border border-rose-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  }`}
                >
                  {doc.status === 'EXPIRING_SOON' ? 'Renew Soon' : 'Valid'}
                </span>
                <button
                  onClick={() => deleteDocument(doc.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-600 transition-all cursor-pointer"
                  title="Remove document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Add Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-[#e4e9f1] space-y-4"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#e4e9f1]">
                <h3 className="text-sm font-extrabold text-[#243047]">
                  + Register Document
                </h3>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-600 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5 text-xs font-semibold text-slate-700">
                <div>
                  <label className="block mb-1 text-slate-600">Document Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Health Insurance Policy Certificate"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#b27635] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block mb-1 text-slate-600">Document / Policy No. *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. POL-99214"
                      value={documentNumber}
                      onChange={(e) => setDocumentNumber(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-mono font-bold focus:border-[#b27635] focus:bg-white focus:outline-hidden"
                    />
                  </div>

                  <div>
                    <label className="block mb-1 text-slate-600">Expiry / Renewal Date</label>
                    <input
                      type="date"
                      value={expiryDate}
                      onChange={(e) => setExpiryDate(e.target.value)}
                      className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#b27635] focus:bg-white focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Document Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-bold focus:border-[#b27635] focus:bg-white focus:outline-hidden cursor-pointer"
                  >
                    <option value="ID_CARD">Identity Card (Passport, DL, Aadhaar)</option>
                    <option value="INSURANCE">Insurance Policy</option>
                    <option value="PROPERTY">Property / Real Estate Deed</option>
                    <option value="VEHICLE">Vehicle Registration (RC)</option>
                    <option value="TAX_RECORD">Tax Record / Form 16</option>
                  </select>
                </div>

                <div>
                  <label className="block mb-1 text-slate-600">Issuing Authority / Agency</label>
                  <input
                    type="text"
                    placeholder="e.g. Ministry of External Affairs / ICICI Lombard"
                    value={authority}
                    onChange={(e) => setAuthority(e.target.value)}
                    className="w-full h-10 px-3 rounded-xl bg-[#faf8f5] border border-[#e4e9f1] text-xs text-slate-900 font-medium focus:border-[#b27635] focus:bg-white focus:outline-hidden"
                  />
                </div>

                <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-[#e4e9f1]">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2 rounded-xl border border-[#e4e9f1] text-xs font-semibold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-[#b27635] text-white text-xs font-bold hover:bg-[#9a642a] shadow-md shadow-[#b27635]/20 cursor-pointer"
                  >
                    Save Document
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
