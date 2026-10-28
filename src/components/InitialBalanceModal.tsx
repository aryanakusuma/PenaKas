import React, { useState, useEffect } from 'react';
import { X, Building2, Save } from 'lucide-react';
import { formatNumberWithDots, parseCleanNumber } from '../utils/formatters';

interface InitialBalanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  orgName: string;
  initialBalance: number;
  onSave: (data: { orgName: string; initialBalance: number }) => void;
}

export const InitialBalanceModal: React.FC<InitialBalanceModalProps> = ({
  isOpen,
  onClose,
  orgName: initialOrgName,
  initialBalance: initialInitialBalance,
  onSave,
}) => {
  const [name, setName] = useState(initialOrgName);
  const [balanceStr, setBalanceStr] = useState(formatNumberWithDots(initialInitialBalance));

  useEffect(() => {
    setName(initialOrgName);
    setBalanceStr(formatNumberWithDots(initialInitialBalance));
  }, [initialOrgName, initialInitialBalance, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanNum = parseCleanNumber(balanceStr);
    onSave({
      orgName: name.trim() || 'Kas Organisasi',
      initialBalance: cleanNum,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 bg-slate-900 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-base">Atur Kas Organisasi</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Nama Organisasi / Komunitas
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Contoh: BEM Fakultas / Himpunan / UKM"
              className="w-full px-4 py-2.5 text-sm font-semibold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Saldo Awal Kas (Rp)
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">
                Rp
              </span>
              <input
                type="text"
                inputMode="numeric"
                required
                value={balanceStr}
                onChange={(e) => setBalanceStr(formatNumberWithDots(e.target.value))}
                placeholder="0"
                className="w-full pl-12 pr-4 py-2.5 text-lg font-bold text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all"
              />
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Saldo sisa periode lalu atau modal awal kas organisasi saat ini.
            </p>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm text-white bg-slate-900 hover:bg-slate-800 shadow-lg shadow-slate-900/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
            >
              <Save className="w-4 h-4 text-emerald-400" />
              <span>Simpan Pengaturan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
