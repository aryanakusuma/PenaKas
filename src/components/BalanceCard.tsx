import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  MinusCircle, 
  Edit3, 
  Building2,
  Calendar
} from 'lucide-react';
import { formatIDR } from '../utils/formatters';

interface BalanceCardProps {
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  finalBalance: number;
  onOpenIncomeModal: () => void;
  onOpenExpenseModal: () => void;
  onEditInitialBalance: () => void;
  selectedMonth: string;
  onMonthChange: (month: string) => void;
  availableMonths: string[];
}

export const BalanceCard: React.FC<BalanceCardProps> = ({
  initialBalance,
  totalIncome,
  totalExpense,
  finalBalance,
  onOpenIncomeModal,
  onOpenExpenseModal,
  onEditInitialBalance,
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  return (
    <div className="space-y-4">
      {/* Hero Card: Saldo Utama */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 sm:p-6 text-white shadow-xl shadow-slate-900/10">
        
        {/* Background glow decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Total Saldo Kas Organisasi
            </span>

            {/* Tombol Ubah Saldo Awal */}
            <button
              onClick={onEditInitialBalance}
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm transition-colors border border-white/10"
              title="Atur Saldo Awal Organisasi"
            >
              <Building2 className="w-3 h-3 text-emerald-300" />
              <span>Saldo Awal: {formatIDR(initialBalance)}</span>
              <Edit3 className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* Nominal Saldo Akhir */}
          <div className="mt-1">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
              {formatIDR(finalBalance)}
            </h2>
            <p className="text-xs text-slate-300/80 mt-1">
              Dihitung otomatis: Saldo Awal + Total Masuk - Total Keluar
            </p>
          </div>

          {/* Quick Action CTA Buttons */}
          <div className="grid grid-cols-2 gap-3 mt-6 pt-5 border-t border-white/10">
            <button
              onClick={onOpenIncomeModal}
              className="group flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-emerald-500/25 transition-all"
            >
              <PlusCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Uang Masuk</span>
            </button>

            <button
              onClick={onOpenExpenseModal}
              className="group flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-rose-500 hover:bg-rose-400 active:scale-[0.98] text-white font-bold text-sm shadow-lg shadow-rose-500/25 transition-all"
            >
              <MinusCircle className="w-4 h-4 transition-transform group-hover:scale-110" />
              <span>Uang Keluar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Periode & Ringkasan 2 Kolom */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Ringkasan Periode:</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          aria-label="Pilih Periode Transaksi"
          className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          <option value="ALL">Semua Waktu</option>
          {availableMonths.map((m) => (
            <option key={m} value={m}>
              {m}
            </option>
          ))}
        </select>
      </div>

      {/* Kartu Uang Masuk & Uang Keluar */}
      <div className="grid grid-cols-2 gap-3">
        {/* Pemasukan */}
        <div className="bg-white rounded-2xl p-4 border border-emerald-100 shadow-sm relative overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center mb-2">
            <TrendingUp className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Masuk
          </p>
          <p className="text-lg sm:text-xl font-bold text-emerald-600 mt-1 truncate">
            {formatIDR(totalIncome)}
          </p>
        </div>

        {/* Pengeluaran */}
        <div className="bg-white rounded-2xl p-4 border border-rose-100 shadow-sm relative overflow-hidden">
          <div className="w-8 h-8 rounded-lg bg-rose-50 text-rose-600 flex items-center justify-center mb-2">
            <TrendingDown className="w-4 h-4" />
          </div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
            Total Keluar
          </p>
          <p className="text-lg sm:text-xl font-bold text-rose-600 mt-1 truncate">
            {formatIDR(totalExpense)}
          </p>
        </div>
      </div>
    </div>
  );
};
