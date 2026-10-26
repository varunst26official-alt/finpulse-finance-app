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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="w-full max-w-md rounded-2xl border border-[#e8dfcf] bg-white p-6 shadow-2xl space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8dfcf] pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#f4efe4] text-[#866632]">
              <DollarSign className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-[#2b2823]">Record Transaction</h3>
              <p className="text-[11px] text-[#786e5e] font-mono">
                Log a trade or yield event to update your portfolio
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#8c8273] hover:text-[#2b2823] hover:bg-[#f4efe4] transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3.5 text-xs font-mono">
          {/* Asset Select */}
          <div>
            <label className="block text-[#443f36] font-semibold mb-1">Select Asset</label>
            <select
              {...register('assetId')}
              className="w-full rounded-xl bg-[#faf8f5] border border-[#e4d9c7] px-3 py-2 text-[#2b2823] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
            >
              {assets.map((asset: Asset) => (
                <option key={asset.id} value={asset.id}>
                  {asset.symbol} — {asset.name}
                </option>
              ))}
            </select>
            {errors.assetId && (
              <p className="text-rose-600 text-[10px] mt-1">{errors.assetId.message}</p>
            )}
          </div>

          {/* Type Select */}
          <div>
            <label className="block text-[#443f36] font-semibold mb-1">Transaction Type</label>
            <div className="grid grid-cols-3 gap-2">
              {(['BUY', 'SELL', 'DIVIDEND'] as const).map((t) => (
                <label
                  key={t}
                  className="flex items-center justify-center gap-1.5 p-2 rounded-xl border border-[#e4d9c7] bg-[#faf8f5] text-[#5e574c] cursor-pointer hover:border-[#ded3bf] has-checked:border-[#9c783e] has-checked:bg-[#f4efe4] has-checked:text-[#866632] font-bold"
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
              <label className="block text-[#443f36] font-semibold mb-1">Quantity</label>
              <input
                type="number"
                step="any"
                {...register('quantity', { valueAsNumber: true })}
                className="w-full rounded-xl bg-[#faf8f5] border border-[#e4d9c7] px-3 py-2 text-[#2b2823] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
              />
              {errors.quantity && (
                <p className="text-rose-600 text-[10px] mt-1">{errors.quantity.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[#443f36] font-semibold mb-1">Price / Unit ($)</label>
              <input
                type="number"
                step="any"
                {...register('pricePerUnit', { valueAsNumber: true })}
                className="w-full rounded-xl bg-[#faf8f5] border border-[#e4d9c7] px-3 py-2 text-[#2b2823] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
              />
              {errors.pricePerUnit && (
                <p className="text-rose-600 text-[10px] mt-1">{errors.pricePerUnit.message}</p>
              )}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-[#443f36] font-semibold mb-1">Execution Date</label>
            <input
              type="date"
              {...register('date')}
              className="w-full rounded-xl bg-[#faf8f5] border border-[#e4d9c7] px-3 py-2 text-[#2b2823] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
            />
            {errors.date && (
              <p className="text-rose-600 text-[10px] mt-1">{errors.date.message}</p>
            )}
          </div>

          {/* Notes */}
          <div>
            <label className="block text-[#443f36] font-semibold mb-1">
              Notes / Thesis (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Monthly SIP or target breakout"
              {...register('notes')}
              className="w-full rounded-xl bg-[#faf8f5] border border-[#e4d9c7] px-3 py-2 text-[#2b2823] placeholder-[#8c8273] focus:border-[#9c783e] focus:bg-white focus:outline-hidden"
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8dfcf]">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-[#786e5e] hover:text-[#2b2823] hover:bg-[#f4efe4] transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-4 py-2 rounded-xl bg-[#9c783e] font-bold text-white shadow-md shadow-[#9c783e]/20 hover:bg-[#866632] active:scale-95 transition-all cursor-pointer"
            >
              Confirm Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
