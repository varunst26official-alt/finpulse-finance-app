import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useFinanceStore } from '@/stores/financeStore';
import { X, DollarSign } from 'lucide-react';
import { Asset, AssetCategory, TransactionType } from '@/types/finance';

const transactionSchema = z.object({
  assetId: z.string().min(1, 'Please select an asset'),
  type: z.enum(['BUY', 'SELL', 'DIVIDEND']),
  quantity: z.number().positive('Quantity must be greater than 0'),
  pricePerUnit: z.number().positive('Price must be greater than 0'),
  date: z.string().min(1, 'Please choose a date'),
  notes: z.string().optional(),
});

type TransactionFormValues = z.infer<typeof transactionSchema>;

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose }) => {
  const { assets, addTransaction } = useFinanceStore();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<TransactionFormValues>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      assetId: assets[0]?.id || '',
      type: 'BUY',
      quantity: 1,
      pricePerUnit: 100,
      date: new Date().toISOString().split('T')[0],
      notes: '',
    },
  });

  if (!isOpen) return null;

  const onSubmit = (data: TransactionFormValues) => {
    const asset = assets.find((a: Asset) => a.id === data.assetId);
    if (!asset) return;

    addTransaction({
      assetId: data.assetId,
      assetSymbol: asset.symbol,
      assetName: asset.name,
      category: asset.category as AssetCategory,
      type: data.type as TransactionType,
      quantity: data.quantity,
      pricePerUnit: data.pricePerUnit,
      totalAmount: data.quantity * data.pricePerUnit,
      date: data.date,
      notes: data.notes,
    });

    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-slate-800 bg-slate-900 p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-emerald-500/20 text-emerald-400">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Record Transaction</h3>
              <p className="text-[11px] text-slate-400 font-mono">
                Log a trade or yield event to update your portfolio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs font-mono">
          {/* Asset Select */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Select Asset</label>
            <select
              {...register('assetId')}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-hidden"
            >
              {assets.map((asset: Asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.symbol} — {asset.name}
                </option>
              ))}
            </select>
            {errors.assetId && (
              <p className="text-rose-400 text-[10px] mt-1">{errors.assetId.message}</p>
            )}
          </div>

          {/* Type Select */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['BUY', 'SELL', 'DIVIDEND'] as const).map((t) => (
                <label
                  key={t}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-slate-800 bg-slate-950 text-slate-300 cursor-pointer hover:border-slate-700 has-checked:border-emerald-500 has-checked:bg-emerald-500/10 has-checked:text-emerald-400 font-bold"
                >
                  <input type="radio" value={t} {...register('type')} className="sr-only" />
                  {t}
                </label>
              ))}
            </div>
          </div>

          {/* Quantity & Price Row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                {...register('quantity', { valueAsNumber: true })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-hidden"
              />
              {errors.quantity && (
                <p className="text-rose-400 text-[10px] mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Price / Unit ($)</label>
              <input
                type="number"
                step="any"
                {...register('pricePerUnit', { valueAsNumber: true })}
                className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-hidden"
              />
              {errors.pricePerUnit && (
                <p className="text-rose-400 text-[10px] mt-1">{errors.pricePerUnit.message}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Execution Date</label>
            <input
              type="date"
              {...register('date')}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white focus:border-emerald-500 focus:outline-hidden"
            />
            {errors.date && (
              <p className="text-rose-400 text-[10px] mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Notes / Thesis (Optional)</label>
            <input
              type="text"
              placeholder="e.g. Monthly SIP or target breakout"
              {...register('notes')}
              className="w-full rounded-xl bg-slate-950 border border-slate-800 px-3 py-2 text-white placeholder-slate-600 focus:border-emerald-500 focus:outline-hidden"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 font-bold text-white shadow-md shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-500 active:scale-95 transition-all cursor-pointer"
            >
              Confirm Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
