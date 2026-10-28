import React from 'react';
import { 
  Wallet, 
  RefreshCw, 
  Download, 
  Settings2, 
  ShieldCheck, 
  FileSpreadsheet, 
  UserCheck, 
  Terminal,
  Smartphone
} from 'lucide-react';
import { UserRole, AppSettings } from '../types';

interface HeaderProps {
  settings: AppSettings;
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  isSyncing: boolean;
  onSync: () => void;
  onOpenGoogleSheetModal: () => void;
  onOpenDeveloperModal: () => void;
  onOpenExportModal: () => void;
  canInstallPwa: boolean;
  onInstallPwa: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  settings,
  currentRole,
  onRoleChange,
  isSyncing,
  onSync,
  onOpenGoogleSheetModal,
  onOpenDeveloperModal,
  onOpenExportModal,
  canInstallPwa,
  onInstallPwa,
}) => {
  const isSheetConnected = Boolean(settings.googleSheetUrl && settings.googleSheetUrl.startsWith('http'));

  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-200/80 transition-all">
      <div className="max-w-5xl mx-auto px-4 py-3 sm:px-6">
        <div className="flex items-center justify-between gap-3">
          
          {/* Logo & Org Name */}
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-emerald-500/20 shrink-0">
              <Wallet className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <h1 className="text-base sm:text-lg font-bold text-slate-800 tracking-tight leading-tight truncate">
                  PenaKas
                </h1>
                <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700">
                  IPM
                </span>
              </div>
              <p className="text-xs text-slate-500 truncate max-w-[160px] sm:max-w-xs font-medium">
                {settings.orgName || 'Kas Organisasi'}
              </p>
            </div>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            
            {/* Install PWA Button (if available) */}
            {canInstallPwa && (
              <button
                onClick={onInstallPwa}
                className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
                title="Install ke Layar Utama Laptop/HP"
              >
                <Smartphone className="w-3.5 h-3.5" />
                <span>Install App</span>
              </button>
            )}

            {/* Sync Button */}
            <button
              onClick={onSync}
              disabled={isSyncing}
              className={`p-2 rounded-lg text-xs font-medium transition-colors border flex items-center gap-1.5 ${
                isSheetConnected 
                  ? 'bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200' 
                  : 'bg-amber-50 hover:bg-amber-100 text-amber-800 border-amber-200'
              }`}
              title={isSheetConnected ? 'Sinkronkan dengan Google Sheets' : 'Mode Offline (Klik untuk hubungkan Google Sheet)'}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
              <span className="hidden md:inline">
                {isSyncing ? 'Menyinkronkan...' : isSheetConnected ? 'Sinkron' : 'Lokal (Offline)'}
              </span>
            </button>

            {/* Export Button */}
            <button
              onClick={onOpenExportModal}
              className="p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 border border-slate-200 transition-colors"
              title="Unduh Rekap Kas (Excel / Cetak)"
            >
              <Download className="w-4 h-4" />
            </button>

            {/* Google Sheet Config Button */}
            <button
              onClick={onOpenGoogleSheetModal}
              className={`p-2 rounded-lg border transition-colors ${
                isSheetConnected
                  ? 'text-emerald-700 bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                  : 'text-slate-600 hover:text-slate-900 bg-slate-50 border-slate-200'
              }`}
              title="Pengaturan Google Sheet Database"
            >
              <FileSpreadsheet className="w-4 h-4" />
            </button>

            {/* Developer Audit Log (Only in Developer Mode) */}
            {currentRole === 'developer' && (
              <button
                onClick={onOpenDeveloperModal}
                className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 transition-colors"
                title="Log Audit & Status Debug Developer"
              >
                <Terminal className="w-4 h-4" />
              </button>
            )}

            {/* Role Switcher Pill */}
            <div className="relative inline-flex bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                onClick={() => onRoleChange('bendahara')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'bendahara'
                    ? 'bg-white text-emerald-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Beralih ke Akun Bendahara"
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Bendahara</span>
              </button>
              <button
                onClick={() => onRoleChange('developer')}
                className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs font-semibold transition-all ${
                  currentRole === 'developer'
                    ? 'bg-white text-indigo-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
                title="Beralih ke Akun Kamu (Developer / Super Admin)"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Admin/Dev</span>
              </button>
            </div>

          </div>

        </div>
      </div>
    </header>
  );
};
