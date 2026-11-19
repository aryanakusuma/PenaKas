import React from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  PlusCircle, 
  MinusCircle, 
  Edit3, 
  Building2,
  Calendar,
  RefreshCw,
  CalendarRange,
  Lock,
  ChevronDown,
  Sparkles
} from 'lucide-react';
import { formatIDR } from '../utils/formatters';

interface BalanceCardProps {
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  finalBalance: number;
  isLoading?: boolean;
  activePeriodName: string;
  isPeriodClosed?: boolean;
  onOpenPeriodModal: () => void;
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
  isLoading = false,
  activePeriodName,
  isPeriodClosed = false,
  onOpenPeriodModal,
  onOpenIncomeModal,
  onOpenExpenseModal,
  onEditInitialBalance,
  selectedMonth,
  onMonthChange,
  availableMonths,
}) => {
  return (
    <div className="space-y-4">
      {/* Bar Pemilihan & Status Periode */}
      <div className="bg-white rounded-2xl px-4 py-2.5 border border-slate-200/80 shadow-sm flex items-center justify-between gap-2">
        <button
          onClick={onOpenPeriodModal}
          className="group flex items-center gap-2 min-w-0 text-left hover:opacity-80 transition-opacity"
          title="Klik untuk ganti atau buka periode baru"
        >
          <div className="w-8 h-8 rounded-xl bg-emerald-100/70 text-emerald-800 flex items-center justify-center shrink-0">
            <CalendarRange className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Masa Jabatan / Periode:
              </span>
              {isPeriodClosed ? (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-amber-100 text-amber-800 flex items-center gap-0.5">
                  <Lock className="w-2.5 h-2.5" /> Tutup Buku
                </span>
              ) : (
                <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-emerald-100 text-emerald-700">
                  Aktif
                </span>
              )}
            </div>
            <p className="text-xs sm:text-sm font-extrabold text-slate-800 truncate flex items-center gap-1">
              <span>Periode {activePeriodName}</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:translate-y-0.5 transition-transform" />
            </p>
          </div>
        </button>

        <button
          onClick={onOpenPeriodModal}
          className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors shrink-0 flex items-center gap-1.5"
        >
          <span>Ganti / Tutup Buku</span>
        </button>
      </div>

      {/* Banner Peringatan jika Periode Sudah Tutup Buku */}
      {isPeriodClosed && (
        <div className="p-3 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center justify-between gap-2 animate-fade-in">
          <div className="flex items-center gap-2">
            <Lock className="w-4 h-4 text-amber-700 shrink-0" />
            <span>
              <b>Periode ini sudah Ditutup Buku.</b> Laporan di bawah ini bersifat arsip LPJ.
            </span>
          </div>
          <button
            onClick={onOpenPeriodModal}
            className="text-amber-800 font-bold underline hover:text-amber-950 shrink-0"
          >
            Buka Periode Baru
          </button>
        </div>
      )}

      {/* Hero Card: Saldo Utama */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 p-5 sm:p-6 text-white shadow-xl shadow-slate-900/10">
        
        {/* Background glow decorative circles */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/15 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-teal-500/15 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
            <span className="text-xs uppercase font-bold tracking-wider text-emerald-400/90 flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Total Saldo Kas PC IPM Pringsewu
            </span>

            {/* Tombol Ubah Saldo Awal */}
            <button
              onClick={onEditInitialBalance}
              className="inline-flex items-center gap-1 text-xs text-slate-300 hover:text-white bg-white/10 hover:bg-white/15 px-2.5 py-1 rounded-full backdrop-blur-sm transition-colors border border-white/10"
              title="Atur Saldo Awal Periode Ini"
            >
              <Building2 className="w-3 h-3 text-emerald-300" />
              <span>Saldo Awal: {formatIDR(initialBalance)}</span>
              <Edit3 className="w-2.5 h-2.5 text-slate-400 ml-0.5" />
            </button>
          </div>

          {/* Nominal Saldo Akhir */}
          <div className="mt-1">
            {isLoading ? (
              <div className="py-1">
                <span className="text-xl sm:text-2xl font-bold text-emerald-300/90 animate-pulse flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 animate-spin text-emerald-400" />
                  Menyinkronkan data kas...
                </span>
              </div>
            ) : (
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-white">
                {formatIDR(finalBalance)}
              </h2>
            )}
            <p className="text-xs text-slate-300/80 mt-1">
              {isLoading ? 'Sedang mengambil saldo terbaru dari Google Sheet...' : `Saldo Kas Periode ${activePeriodName} (Saldo Awal + Masuk - Keluar)`}
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

      {/* Filter Periode Bulan & Ringkasan 2 Kolom */}
      <div className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-500 font-semibold">
          <Calendar className="w-3.5 h-3.5" />
          <span>Filter Bulan di Periode {activePeriodName}:</span>
        </div>
        <select
          value={selectedMonth}
          onChange={(e) => onMonthChange(e.target.value)}
          aria-label="Pilih Bulan Transaksi"
          className="text-xs font-semibold bg-white border border-slate-200 text-slate-700 rounded-lg px-2.5 py-1.5 shadow-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
        >
          <option value="ALL">Semua Bulan</option>
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
