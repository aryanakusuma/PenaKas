import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Edit2, 
  Trash2, 
  Receipt,
  User,
  Calendar
} from 'lucide-react';
import { Transaction, TransactionType } from '../types';
import { formatIDR, formatDateIndo } from '../utils/formatters';

interface TransactionListProps {
  transactions: Transaction[];
  onEdit: (tx: Transaction) => void;
  onDelete: (id: string) => void;
  onOpenAddModal: (type: TransactionType) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions,
  onEdit,
  onDelete,
  onOpenAddModal,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');

  // Filter transactions
  const filtered = transactions.filter((tx) => {
    const matchesType = filterType === 'all' || tx.type === filterType;
    const q = searchQuery.toLowerCase();
    const matchesSearch = 
      tx.category.toLowerCase().includes(q) || 
      tx.description.toLowerCase().includes(q) ||
      (tx.author && tx.author.toLowerCase().includes(q));
    return matchesType && matchesSearch;
  });

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-sm space-y-4">
      {/* List Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h3 className="text-base sm:text-lg font-bold text-slate-800 flex items-center gap-2">
            <Receipt className="w-5 h-5 text-emerald-600" />
            Riwayat Kas Masuk & Keluar
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Total {filtered.length} transaksi tercatat
          </p>
        </div>

        {/* Filter Type Pills */}
        <div className="inline-flex bg-slate-100 p-1 rounded-xl self-start sm:self-auto border border-slate-200/80">
          <button
            onClick={() => setFilterType('all')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Semua
          </button>
          <button
            onClick={() => setFilterType('income')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'income'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Masuk
          </button>
          <button
            onClick={() => setFilterType('expense')}
            className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              filterType === 'expense'
                ? 'bg-white text-rose-700 shadow-sm'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Keluar
          </button>
        </div>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Cari transaksi berdasarkan kategori, keperluan, atau nama..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 text-xs sm:text-sm bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all placeholder:text-slate-400"
        />
      </div>

      {/* Transactions List */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center space-y-3">
          <div className="w-14 h-14 bg-slate-100 rounded-2xl flex items-center justify-center mx-auto text-slate-400">
            <Receipt className="w-7 h-7" />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-700">Belum ada transaksi ditemukan</p>
            <p className="text-xs text-slate-400 mt-0.5">
              {searchQuery ? 'Coba ubah kata kunci pencarian kamu' : 'Mulai catat pemasukan atau pengeluaran pertama'}
            </p>
          </div>
          {!searchQuery && (
            <div className="flex justify-center gap-2 pt-2">
              <button
                onClick={() => onOpenAddModal('income')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-emerald-100 text-emerald-800 hover:bg-emerald-200 transition-colors"
              >
                + Tambah Masuk
              </button>
              <button
                onClick={() => onOpenAddModal('expense')}
                className="text-xs font-bold px-3 py-1.5 rounded-lg bg-rose-100 text-rose-800 hover:bg-rose-200 transition-colors"
              >
                + Tambah Keluar
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="divide-y divide-slate-100">
          {filtered.map((tx) => {
            const isIncome = tx.type === 'income';
            return (
              <div 
                key={tx.id} 
                className="py-3.5 sm:py-4 flex items-center justify-between gap-3 group hover:bg-slate-50/70 -mx-2 px-2 rounded-2xl transition-colors"
              >
                {/* Left: Icon & Details */}
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                    isIncome ? 'bg-emerald-100/70 text-emerald-700' : 'bg-rose-100/70 text-rose-700'
                  }`}>
                    {isIncome ? <ArrowDownLeft className="w-5 h-5" /> : <ArrowUpRight className="w-5 h-5" />}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-bold text-slate-800 truncate">
                        {tx.category}
                      </p>
                      <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 flex items-center gap-1 shrink-0">
                        <User className="w-2.5 h-2.5" />
                        {tx.author || 'Bendahara'}
                      </span>
                    </div>

                    {tx.description && (
                      <p className="text-xs text-slate-500 truncate mt-0.5 max-w-xs sm:max-w-md">
                        {tx.description}
                      </p>
                    )}

                    <div className="flex items-center gap-2 text-[11px] text-slate-400 mt-1 font-medium">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateIndo(tx.date)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Right: Amount & Actions */}
                <div className="flex flex-col items-end gap-1 shrink-0">
                  <span className={`text-sm sm:text-base font-extrabold ${
                    isIncome ? 'text-emerald-600' : 'text-rose-600'
                  }`}>
                    {isIncome ? '+ ' : '- '}
                    {formatIDR(tx.amount)}
                  </span>

                  {/* Action buttons (Edit & Delete) */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => onEdit(tx)}
                      className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                      title="Edit Transaksi Ini"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(tx.id)}
                      className="p-1 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Hapus Transaksi Ini"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
