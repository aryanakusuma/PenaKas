import React, { useState } from 'react';
import { 
  X, 
  CalendarRange, 
  FolderPlus, 
  Lock, 
  Unlock, 
  CheckCircle2, 
  ArrowRight, 
  History, 
  Trash2, 
  Edit3, 
  Sparkles,
  Building2,
  AlertCircle
} from 'lucide-react';
import { Period, Transaction } from '../types';
import { formatIDR, formatNumberWithDots, parseCleanNumber } from '../utils/formatters';

interface PeriodManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  periods: Period[];
  activePeriodId: string;
  transactions: Transaction[];
  currentPeriodFinalBalance: number;
  onSelectPeriod: (periodId: string) => void;
  onCreatePeriod: (data: {
    name: string;
    initialBalance: number;
    closePrevious: boolean;
  }) => void;
  onTogglePeriodStatus: (periodId: string) => void;
  onDeletePeriod: (periodId: string) => void;
}

export const PeriodManagerModal: React.FC<PeriodManagerModalProps> = ({
  isOpen,
  onClose,
  periods,
  activePeriodId,
  transactions,
  currentPeriodFinalBalance,
  onSelectPeriod,
  onCreatePeriod,
  onTogglePeriodStatus,
  onDeletePeriod,
}) => {
  const [activeTab, setActiveTab] = useState<'create' | 'list'>('create');
  const [newPeriodName, setNewPeriodName] = useState('');
  const [balanceOption, setBalanceOption] = useState<'carryover' | 'zero' | 'custom'>('carryover');
  const [customBalanceStr, setCustomBalanceStr] = useState('0');
  const [closePrevious, setClosePrevious] = useState(true);

  if (!isOpen) return null;

  const currentActivePeriod = periods.find((p) => p.id === activePeriodId) || periods[0];

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanName = newPeriodName.trim();
    if (!cleanName) {
      alert('Mohon masukkan nama periode baru (contoh: 2028-2030)!');
      return;
    }

    // Cek apakah nama periode sudah ada
    if (periods.some((p) => p.name.toLowerCase() === cleanName.toLowerCase())) {
      alert(`Periode dengan nama "${cleanName}" sudah ada. Silakan gunakan nama periode lain.`);
      return;
    }

    let initialBalance = 0;
    if (balanceOption === 'carryover') {
      initialBalance = currentPeriodFinalBalance > 0 ? currentPeriodFinalBalance : 0;
    } else if (balanceOption === 'custom') {
      initialBalance = parseCleanNumber(customBalanceStr);
    }

    onCreatePeriod({
      name: cleanName,
      initialBalance,
      closePrevious,
    });

    setNewPeriodName('');
    setCustomBalanceStr('0');
    setBalanceOption('carryover');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] animate-scale-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-emerald-800 to-teal-800 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-white/10 rounded-xl text-emerald-200 backdrop-blur-sm">
              <CalendarRange className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base sm:text-lg">Periode Kepengurusan Kas</h3>
              <p className="text-xs text-emerald-200">
                Tutup buku masa jabatan lama & buka laporan periode baru
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-bold bg-slate-50">
          <button
            onClick={() => setActiveTab('create')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'create'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <FolderPlus className="w-3.5 h-3.5" />
            <span>Buka Periode Baru</span>
          </button>
          <button
            onClick={() => setActiveTab('list')}
            className={`pb-2.5 border-b-2 flex items-center gap-1.5 transition-colors ${
              activeTab === 'list'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Daftar Semua Periode ({periods.length})</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          {activeTab === 'create' ? (
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              {/* Info banner periode saat ini */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-xs text-emerald-900 space-y-1">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-emerald-700">Periode yang Sedang Dibuka:</span>
                  <span className="font-bold px-2 py-0.5 rounded bg-emerald-200/70 text-emerald-800 uppercase text-[10px]">
                    {currentActivePeriod.status === 'active' ? 'Aktif' : 'Tutup Buku'}
                  </span>
                </div>
                <p className="text-base font-extrabold text-emerald-950">
                  Periode {currentActivePeriod.name}
                </p>
                <p className="text-slate-600 text-[11px]">
                  Sisa Saldo Kas saat ini: <span className="font-bold text-emerald-700">{formatIDR(currentPeriodFinalBalance)}</span>
                </p>
              </div>

              {/* Input Nama Periode Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                  Nama Periode Baru *
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    placeholder="Contoh: 2028-2030 atau 2026-2028"
                    value={newPeriodName}
                    onChange={(e) => setNewPeriodName(e.target.value)}
                    className="w-full px-4 py-3 text-sm font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                  />
                </div>
                <p className="text-[11px] text-slate-400 mt-1">
                  Saat periode baru dibuka, laporan dan riwayat kas akan <b>mulai kosong kembali</b>.
                </p>
              </div>

              {/* Opsi Saldo Awal Periode Baru */}
              <div>
                <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-2">
                  Saldo Awal Periode Baru
                </label>
                <div className="space-y-2">
                  {/* Opsi 1: Lanjutkan Sisa Saldo Periode Lalu */}
                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      balanceOption === 'carryover' 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="balanceOption"
                      checked={balanceOption === 'carryover'}
                      onChange={() => setBalanceOption('carryover')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                        Lanjutkan Sisa Saldo Periode {currentActivePeriod.name}
                      </p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Saldo awal otomatis diisi: <span className="font-bold text-emerald-700">{formatIDR(currentPeriodFinalBalance)}</span>
                      </p>
                    </div>
                  </label>

                  {/* Opsi 2: Mulai dari Rp 0 */}
                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      balanceOption === 'zero' 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="balanceOption"
                      checked={balanceOption === 'zero'}
                      onChange={() => setBalanceOption('zero')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs">
                      <p className="font-bold text-slate-800">Mulai dari Nol (Rp 0)</p>
                      <p className="text-slate-500 text-[11px] mt-0.5">
                        Laporan dan saldo kas benar-benar bersih dari awal Rp 0.
                      </p>
                    </div>
                  </label>

                  {/* Opsi 3: Input Manual */}
                  <label 
                    className={`flex items-start gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                      balanceOption === 'custom' 
                        ? 'border-emerald-500 bg-emerald-50/50 shadow-sm' 
                        : 'border-slate-200 hover:bg-slate-50'
                    }`}
                  >
                    <input
                      type="radio"
                      name="balanceOption"
                      checked={balanceOption === 'custom'}
                      onChange={() => setBalanceOption('custom')}
                      className="mt-0.5 text-emerald-600 focus:ring-emerald-500"
                    />
                    <div className="text-xs flex-1">
                      <p className="font-bold text-slate-800">Input Nominal Saldo Awal Manual</p>
                      {balanceOption === 'custom' && (
                        <div className="relative mt-2">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                            Rp
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            value={customBalanceStr}
                            onChange={(e) => setCustomBalanceStr(formatNumberWithDots(e.target.value))}
                            placeholder="0"
                            className="w-full pl-10 pr-3 py-1.5 text-sm font-bold bg-white border border-slate-300 rounded-lg focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>

              {/* Checkbox Tutup Buku Periode Lama */}
              <label className="flex items-center gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200 cursor-pointer">
                <input
                  type="checkbox"
                  checked={closePrevious}
                  onChange={(e) => setClosePrevious(e.target.checked)}
                  className="rounded text-emerald-600 focus:ring-emerald-500"
                />
                <span className="text-xs font-semibold text-slate-700">
                  Tutup buku & kunci periode lama (<b>{currentActivePeriod.name}</b>) sebagai arsip LPJ
                </span>
              </label>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-3.5 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>Buka Periode Baru & Mulai Laporan Bersih</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <p className="text-xs text-slate-500">
                Pilih periode untuk melihat laporan keuangan dan transaksi pada masa jabatan tersebut:
              </p>

              <div className="space-y-2.5">
                {periods.map((p) => {
                  const isCurrent = p.id === activePeriodId;
                  const isClosed = p.status === 'closed';
                  
                  // Hitung transaksi di periode ini
                  const periodTxCount = transactions.filter((t) => (t.periodId || periods[0].id) === p.id).length;

                  return (
                    <div
                      key={p.id}
                      className={`p-4 rounded-2xl border transition-all ${
                        isCurrent
                          ? 'border-emerald-500 bg-emerald-50/40 shadow-sm ring-1 ring-emerald-500/30'
                          : 'border-slate-200 hover:bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-extrabold text-sm sm:text-base text-slate-800">
                              Periode {p.name}
                            </h4>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase flex items-center gap-1 ${
                              isClosed
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                            }`}>
                              {isClosed ? <Lock className="w-2.5 h-2.5" /> : <Unlock className="w-2.5 h-2.5" />}
                              {isClosed ? 'Tutup Buku' : 'Aktif'}
                            </span>
                            {isCurrent && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white">
                                Sedang Dibuka
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 mt-1.5 font-medium">
                            <span>Saldo Awal: <b className="text-slate-700">{formatIDR(p.initialBalance || 0)}</b></span>
                            <span>&bull;</span>
                            <span>{periodTxCount} Transaksi</span>
                          </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {!isCurrent && (
                            <button
                              type="button"
                              onClick={() => {
                                onSelectPeriod(p.id);
                                onClose();
                              }}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-white text-emerald-700 hover:bg-emerald-50 border border-emerald-300 shadow-sm transition-all"
                              title="Buka laporan periode ini"
                            >
                              Buka Laporan
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() => onTogglePeriodStatus(p.id)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/70 transition-colors"
                            title={isClosed ? 'Buka Kunci / Aktifkan Kembali' : 'Tutup Buku Periode Ini'}
                          >
                            {isClosed ? <Unlock className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-amber-600" />}
                          </button>

                          {periods.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`Yakin ingin menghapus Periode "${p.name}"? Transaksi di periode ini juga akan terhapus.`)) {
                                  onDeletePeriod(p.id);
                                }
                              }}
                              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                              title="Hapus Periode Ini"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('create')}
                  className="w-full py-2.5 px-3 rounded-xl border border-dashed border-emerald-400 bg-emerald-50/50 hover:bg-emerald-50 text-emerald-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                >
                  <FolderPlus className="w-4 h-4" />
                  <span>+ Buka Periode Baru Lainnya</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
