import React from 'react';
import { 
  X, 
  FileSpreadsheet, 
  Download, 
  Printer, 
  ExternalLink, 
  CheckCircle2, 
  FileText 
} from 'lucide-react';
import { Transaction, AppSettings } from '../types';
import { formatIDR, formatDateIndo } from '../utils/formatters';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
  transactions: Transaction[];
  settings: AppSettings;
  initialBalance: number;
  totalIncome: number;
  totalExpense: number;
  finalBalance: number;
}

export const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onClose,
  transactions,
  settings,
  initialBalance,
  totalIncome,
  totalExpense,
  finalBalance,
}) => {
  if (!isOpen) return null;

  // Unduh data sebagai file CSV yang kompatibel dengan Excel
  const handleDownloadCSV = () => {
    const headers = ['ID', 'Tanggal', 'Tipe', 'Kategori', 'Nominal (Rp)', 'Keterangan', 'Diinput Oleh'];
    const rows = transactions.map((t) => [
      `"${t.id}"`,
      `"${t.date}"`,
      `"${t.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}"`,
      `"${t.category.replace(/"/g, '""')}"`,
      t.amount,
      `"${(t.description || '').replace(/"/g, '""')}"`,
      `"${t.author || 'Bendahara'}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute('download', `Rekap_Kas_${settings.orgName.replace(/\s+/g, '_')}_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in print:bg-white print:p-0">
      <div 
        className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[92vh] print:max-h-none print:shadow-none print:border-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header (Hidden when printing) */}
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-slate-800 rounded-lg text-emerald-400">
              <Download className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base">Unduh & Cetak Laporan Kas</h3>
              <p className="text-xs text-slate-300">Ekspor rekap untuk LPJ organisasi atau pembina</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1">
          
          {/* Quick Action Options (Hidden in Print) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 print:hidden">
            <button
              onClick={handleDownloadCSV}
              className="p-4 rounded-2xl border-2 border-emerald-100 bg-emerald-50/50 hover:bg-emerald-50 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center mb-2 shadow-md shadow-emerald-600/20 group-hover:scale-105 transition-transform">
                <FileSpreadsheet className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Unduh File Excel / CSV</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Bisa langsung dibuka di Microsoft Excel, Google Sheets, atau WPS
              </p>
            </button>

            <button
              onClick={handlePrint}
              className="p-4 rounded-2xl border-2 border-slate-200 bg-slate-50/50 hover:bg-slate-50 text-left transition-all group"
            >
              <div className="w-10 h-10 rounded-xl bg-slate-800 text-white flex items-center justify-center mb-2 shadow-md shadow-slate-800/20 group-hover:scale-105 transition-transform">
                <Printer className="w-5 h-5" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Cetak Laporan / Simpan PDF</p>
              <p className="text-xs text-slate-500 mt-0.5">
                Format tabel rapi siap tanda tangan untuk laporan pengurus
              </p>
            </button>
          </div>

          {/* Printable Preview Sheet */}
          <div className="p-5 border border-slate-200 rounded-2xl bg-white space-y-4 print:border-none print:p-0">
            <div className="text-center pb-3 border-b border-slate-200">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 uppercase tracking-wide">
                Laporan Kas Keuangan
              </h2>
              <p className="text-xs font-semibold text-slate-600">
                {settings.orgName}
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Dicetak pada: {new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>

            {/* Financial Summary Box */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center text-xs">
              <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                <span className="text-slate-400 block text-[10px] font-bold">SALDO AWAL</span>
                <span className="font-bold text-slate-800">{formatIDR(initialBalance)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-100">
                <span className="text-emerald-700 block text-[10px] font-bold">TOTAL MASUK</span>
                <span className="font-bold text-emerald-700">{formatIDR(totalIncome)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-100">
                <span className="text-rose-700 block text-[10px] font-bold">TOTAL KELUAR</span>
                <span className="font-bold text-rose-700">{formatIDR(totalExpense)}</span>
              </div>
              <div className="p-2.5 rounded-xl bg-indigo-50 border border-indigo-100">
                <span className="text-indigo-800 block text-[10px] font-bold">SALDO AKHIR</span>
                <span className="font-bold text-indigo-900">{formatIDR(finalBalance)}</span>
              </div>
            </div>

            {/* Mini Table Preview */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold uppercase text-[10px]">
                    <th className="py-2">Tanggal</th>
                    <th className="py-2">Kategori</th>
                    <th className="py-2 text-right">Nominal</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {transactions.slice(0, 10).map((t) => (
                    <tr key={t.id}>
                      <td className="py-2 text-slate-500">{t.date}</td>
                      <td className="py-2 font-medium text-slate-800">
                        {t.category}
                        {t.description && <span className="text-slate-400 block text-[11px] truncate max-w-[180px]">{t.description}</span>}
                      </td>
                      <td className={`py-2 text-right font-bold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {t.type === 'income' ? '+' : '-'} {formatIDR(t.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {transactions.length > 10 && (
                <p className="text-center text-[11px] text-slate-400 py-2">
                  ... dan {transactions.length - 10} transaksi lainnya (unduh file Excel untuk daftar lengkap).
                </p>
              )}
            </div>

            {/* Signature Area for Organization */}
            <div className="pt-6 grid grid-cols-2 gap-4 text-center text-xs text-slate-600 print:pt-10">
              <div>
                <p>Mengetahui,</p>
                <p className="font-bold text-slate-800">Ketua Organisasi</p>
                <div className="h-16" />
                <p className="border-t border-slate-300 pt-1 font-semibold mx-4">( .............................. )</p>
              </div>
              <div>
                <p>Dibuat oleh,</p>
                <p className="font-bold text-slate-800">Bendahara Organisasi</p>
                <div className="h-16" />
                <p className="border-t border-slate-300 pt-1 font-semibold mx-4">( .............................. )</p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};
