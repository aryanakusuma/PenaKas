import React, { useState, useEffect } from 'react';
import { 
  X, 
  PlusCircle, 
  MinusCircle, 
  Calendar, 
  Tag, 
  FileText, 
  Sparkles,
  Save
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatNumberWithDots, parseCleanNumber } from '../utils/formatters';

interface TransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: TransactionType;
  editingTransaction?: Transaction | null;
  onSave: (txData: {
    id?: string;
    date: string;
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
  }) => void;
}

const INCOME_CATEGORIES = [
  'Iuran Anggota',
  'Dana Usaha (Danus)',
  'Sponsor / Donasi',
  'Kas Awal',
  'Penjualan Merchandise',
  'Hadiah Lomba',
  'Lain-lain'
];

const EXPENSE_CATEGORIES = [
  'Konsumsi Rapat',
  'Perlengkapan & ATK',
  'Sewa Tempat / Alat',
  'Transport & Bensin',
  'Spanduk / Banner',
  'Hadiah / Plakat',
  'Operasional Acara',
  'Lain-lain'
];

const QUICK_AMOUNTS = [10000, 20000, 50000, 100000, 500000];

export const TransactionModal: React.FC<TransactionModalProps> = ({
  isOpen,
  onClose,
  type,
  editingTransaction,
  onSave,
}) => {
  const [amountStr, setAmountStr] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [date, setDate] = useState<string>(new Date().toISOString().split('T')[0]);

  const isIncome = type === 'income';
  const categorySuggestions = isIncome ? INCOME_CATEGORIES : EXPENSE_CATEGORIES;

  useEffect(() => {
    if (editingTransaction) {
      setAmountStr(formatNumberWithDots(editingTransaction.amount));
      setCategory(editingTransaction.category);
      setDescription(editingTransaction.description);
      setDate(editingTransaction.date);
    } else {
      setAmountStr('');
      setCategory('');
      setDescription('');
      setDate(new Date().toISOString().split('T')[0]);
    }
  }, [editingTransaction, isOpen, type]);

  if (!isOpen) return null;

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    const formatted = formatNumberWithDots(raw);
    setAmountStr(formatted);
  };

  const handleAddQuickAmount = (val: number) => {
    const current = parseCleanNumber(amountStr);
    const updated = current + val;
    setAmountStr(formatNumberWithDots(updated));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAmount = parseCleanNumber(amountStr);
    if (cleanAmount <= 0) {
      alert('Mohon masukkan nominal yang valid!');
      return;
    }
    if (!category.trim()) {
      alert('Mohon pilih atau ketik kategori transaksi!');
      return;
    }

    onSave({
      id: editingTransaction?.id,
      date,
      type,
      amount: cleanAmount,
      category: category.trim(),
      description: description.trim(),
    });

    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className={`px-6 py-4 flex items-center justify-between text-white ${
          isIncome 
            ? 'bg-gradient-to-r from-emerald-600 to-teal-600' 
            : 'bg-gradient-to-r from-rose-600 to-red-600'
        }`}>
          <div className="flex items-center gap-2.5">
            {isIncome ? <PlusCircle className="w-5 h-5" /> : <MinusCircle className="w-5 h-5" />}
            <h3 className="font-bold text-base sm:text-lg">
              {editingTransaction ? 'Edit Transaksi' : isIncome ? 'Catat Uang Masuk' : 'Catat Uang Keluar'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-full hover:bg-white/20 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 overflow-y-auto">
          
          {/* Input Nominal Uang (Besar & Jelas) */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Nominal Uang (Rp) *
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-lg text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                autoFocus
                placeholder="0"
                value={amountStr}
                onChange={handleAmountChange}
                className="w-full pl-12 pr-4 py-3.5 text-2xl font-extrabold text-slate-800 bg-slate-50 border-2 border-slate-200 rounded-2xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-300"
              />
            </div>

            {/* Quick add chips */}
            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-[11px] font-semibold text-slate-400 flex items-center gap-1 mr-1">
                <Sparkles className="w-3 h-3 text-amber-500" /> Cepat:
              </span>
              {QUICK_AMOUNTS.map((amt) => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => handleAddQuickAmount(amt)}
                  className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 transition-colors active:scale-95"
                >
                  +{amt >= 1000 ? `${amt / 1000}rb` : amt}
                </button>
              ))}
            </div>
          </div>

          {/* Kategori dengan Preset Chips */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-slate-400" />
                Kategori Transaksi *
              </span>
            </label>
            <input
              type="text"
              required
              placeholder="Pilih di bawah atau ketik kategori baru..."
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
            {/* Suggestion Chips */}
            <div className="flex flex-wrap gap-1.5 mt-2">
              {categorySuggestions.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-medium transition-all ${
                    category === cat
                      ? isIncome
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold'
                        : 'bg-rose-100 text-rose-800 border border-rose-300 font-bold'
                      : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Tanggal Transaksi */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Tanggal Transaksi *
              </span>
            </label>
            <input
              type="date"
              required
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full px-4 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          {/* Keterangan / Catatan Tambahan */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              <span className="flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-slate-400" />
                Keterangan / Keperluan (Opsional)
              </span>
            </label>
            <textarea
              rows={2}
              placeholder="Contoh: Beli snack rapat pleno di Toko Berkah atau iuran nama anggota..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-4 py-2.5 text-sm text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all resize-none"
            />
          </div>

          {/* Footer Submit Button */}
          <div className="pt-2">
            <button
              type="submit"
              className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white shadow-lg flex items-center justify-center gap-2 active:scale-[0.98] transition-all ${
                isIncome
                  ? 'bg-emerald-600 hover:bg-emerald-500 shadow-emerald-600/25'
                  : 'bg-rose-600 hover:bg-rose-500 shadow-rose-600/25'
              }`}
            >
              <Save className="w-4 h-4" />
              <span>{editingTransaction ? 'Simpan Perubahan' : 'Catat Transaksi Sekarang'}</span>
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};
