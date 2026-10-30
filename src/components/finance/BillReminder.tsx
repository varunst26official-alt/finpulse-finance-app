import React, { useState } from 'react';
import { useFinanceStore } from '@/stores/financeStore';
import { formatCurrency } from '@/utils/formatters';
import {
  Bell,
  Plus,
  Trash2,
  Pencil,
  CheckCircle2,
  AlertTriangle,
  CalendarDays,
  X,
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const BILLING_CYCLES = ['WEEKLY', 'MONTHLY', 'QUARTERLY', 'YEARLY'] as const;

interface BillFormState {
  name: string;
  category: string;
  amount: string;
  currency: string;
  billingCycle: string;
  nextDueDate: string;
  paymentMethod: string;
  platform: string;
  notes: string;
}

const emptyForm: BillFormState = {
  name: '',
  category: 'OTHER_EXPENSE',
  amount: '',
  currency: 'INR',
  billingCycle: 'MONTHLY',
  nextDueDate: new Date().toISOString().split('T')[0],
  paymentMethod: 'UPI',
  platform: '',
  notes: '',
};

export const BillReminder: React.FC<{ isOpen: boolean; onClose: () => void }> = ({
  isOpen,
  onClose,
}) => {
  const {
    bills,
    currency,
    addBill,
    deleteBill,
    updateBill,
    markBillPaid,
    getUpcomingBills,
  } = useFinanceStore();

  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<BillFormState>(emptyForm);

  const upcoming = getUpcomingBills(7);
  const overdue = bills.filter(
    (b) => b.status === 'OVERDUE' || (b.status === 'UPCOMING' && new Date(b.nextDueDate) < new Date())
  );

  const filtered = bills.filter((b) =>
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSave = () => {
    if (!form.name.trim() || !form.amount || Number(form.amount) <= 0) return;
    const payload = {
      name: form.name.trim(),
      category: form.category,
      amount: Number(form.amount),
      currency: form.currency || currency,
      billingCycle: form.billingCycle,
      nextDueDate: form.nextDueDate,
      paymentMethod: form.paymentMethod,
      status: 'UPCOMING',
      platform: form.platform || undefined,
      notes: form.notes || undefined,
      autoDetected: false,
      createdAt: new Date().toISOString(),
    };
    if (editingId) {
      updateBill(editingId, payload as any);
    } else {
      addBill(payload as any);
    }
    setShowForm(false);
    setEditingId(null);
    setForm(emptyForm);
  };

  const startEdit = (bill: any) => {
    setEditingId(bill.id);
    setForm({
      name: bill.name,
      category: bill.category,
      amount: String(bill.amount),
      currency: bill.currency,
      billingCycle: bill.billingCycle,
      nextDueDate: bill.nextDueDate,
      paymentMethod: bill.paymentMethod,
      platform: bill.platform || '',
      notes: bill.notes || '',
    });
    setShowForm(true);
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[85vh] overflow-hidden flex flex-col relative"
          onClick={(e) => e.stopPropagation()}
        >
        <div className="flex items-center justify-between p-5 border-b border-[#e8e0d1]">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-50 border border-amber-200">
              <Bell className="h-5 w-5 text-amber-600" />
            </div>
            <div>
              <h2 className="text-lg font-extrabold text-slate-900">Bill Reminders</h2>
              <p className="text-xs text-slate-500">Track upcoming & overdue bills</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X className="h-5 w-5 text-slate-500" />
          </button>
        </div>
        {(overdue.length > 0 || upcoming.length > 0) && (
            <div className="px-5 pt-4 space-y-2">
              {overdue.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm font-semibold">
                  <AlertTriangle className="h-4 w-4" />
                  {overdue.length} overdue bill{overdue.length > 1 ? 's' : ''} need attention
                </div>
              )}
              {upcoming.length > 0 && (
                <div className="flex items-center gap-2 p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-700 text-sm font-semibold">
                  <CalendarDays className="h-4 w-4" />
                  {upcoming.length} bill{upcoming.length > 1 ? 's' : ''} due within 7 days
                </div>
              )}
            </div>
          )}

          <div className="flex items-center gap-3 px-5 py-4">
            <input
              type="text"
              placeholder="Search bills..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="flex-1 px-3 py-2 rounded-xl border border-[#e8e0d1] text-sm focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button
              onClick={() => {
                setEditingId(null);
                setForm(emptyForm);
                setShowForm(true);
              }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-amber-600 text-white text-xs font-bold hover:bg-amber-700 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              Add Bill
            </button>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 space-y-3">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-400 text-sm">
                No bills yet. Add your first bill to get started.
              </div>
            ) : (
              filtered.map((bill) => {
                const isOverdue =
                  bill.status !== 'PAID' &&
                  bill.status !== 'CANCELLED' &&
                  new Date(bill.nextDueDate) < new Date();
                return (
                  <div
                    key={bill.id}
                    className={`p-4 rounded-xl border transition-all ${
                      isOverdue
                        ? 'bg-rose-50/50 border-rose-200'
                        : bill.status === 'PAID'
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-[#faf8f5] border-[#e8e0d1]'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-bold text-slate-900 text-sm truncate">
                            {bill.name}
                          </span>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              bill.status === 'PAID'
                                ? 'bg-emerald-100 text-emerald-700'
                                : bill.status === 'OVERDUE' || isOverdue
                                ? 'bg-rose-100 text-rose-700'
                                : bill.status === 'CANCELLED'
                                ? 'bg-slate-200 text-slate-600'
                                : 'bg-amber-100 text-amber-700'
                            }`}
                          >
                            {isOverdue && bill.status !== 'OVERDUE' ? 'OVERDUE' : bill.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-500">
                          <span>{bill.billingCycle}</span>
                          <span>Due: {bill.nextDueDate}</span>
                          {bill.platform && <span>{bill.platform}</span>}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-mono font-bold text-slate-900 text-sm">
                          {formatCurrency(bill.amount, bill.currency)}
                        </span>
                        {bill.status !== 'PAID' && bill.status !== 'CANCELLED' && (
                          <button
                            onClick={() => markBillPaid(bill.id)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-600 hover:bg-emerald-100 transition-colors"
                            title="Mark Paid"
                          >
                            <CheckCircle2 className="h-4 w-4" />
                          </button>
                        )}
                        <button
                          onClick={() => startEdit(bill)}
                          className="p-1.5 rounded-lg bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteBill(bill.id)}
                          className="p-1.5 rounded-lg bg-rose-50 text-rose-600 hover:bg-rose-100 transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          <AnimatePresence>
            {showForm && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-black/30 flex items-center justify-center p-4"
                onClick={() => setShowForm(false)}
              >
                <motion.div
                  initial={{ scale: 0.95 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0.95 }}
                  className="bg-white rounded-2xl p-6 w-full max-w-md space-y-4 shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <h3 className="text-lg font-bold text-slate-900">
                    {editingId ? 'Edit Bill' : 'Add Bill'}
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      placeholder="Bill name"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#e8e0d1] text-sm"
                    />
                    <div className="grid grid-cols-2 gap-3">
                      <input
                        type="number"
                        placeholder="Amount"
                        value={form.amount}
                        onChange={(e) => setForm({ ...form, amount: e.target.value })}
                        className="px-3 py-2 rounded-xl border border-[#e8e0d1] text-sm"
                      />
                      <select
                        value={form.billingCycle}
                        onChange={(e) => setForm({ ...form, billingCycle: e.target.value })}
                        className="px-3 py-2 rounded-xl border border-[#e8e0d1] text-sm"
                      >
                        {BILLING_CYCLES.map((c) => (
                          <option key={c} value={c}>
                            {c}
                          </option>
                        ))}
                      </select>
                    </div>
                    <input
                      type="date"
                      value={form.nextDueDate}
                      onChange={(e) => setForm({ ...form, nextDueDate: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#e8e0d1] text-sm"
                    />
                    <input
                      type="text"
                      placeholder="Platform (e.g. BSES Delhi)"
                      value={form.platform}
                      onChange={(e) => setForm({ ...form, platform: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#e8e0d1] text-sm"
                    />
                    <textarea
                      placeholder="Notes"
                      value={form.notes}
                      onChange={(e) => setForm({ ...form, notes: e.target.value })}
                      className="w-full px-3 py-2 rounded-xl border border-[#e8e0d1] text-sm resize-none"
                      rows={2}
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2">
                    <button
                      onClick={() => setShowForm(false)}
                      className="px-4 py-2 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      className="px-4 py-2 rounded-xl text-sm font-bold bg-amber-600 text-white hover:bg-amber-700"
                    >
                      {editingId ? 'Update' : 'Save'}
                    </button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default BillReminder;
