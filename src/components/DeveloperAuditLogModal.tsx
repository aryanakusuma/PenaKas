import React, { useState } from 'react';
import { 
  X, 
  Terminal, 
  ShieldAlert, 
  Clock, 
  User, 
  Copy, 
  Check, 
  RefreshCw,
  Activity,
  AlertCircle
} from 'lucide-react';
import { AuditLog, AppSettings } from '../types';

interface DeveloperAuditLogModalProps {
  isOpen: boolean;
  onClose: () => void;
  logs: AuditLog[];
  settings: AppSettings;
  onTestConnection: () => Promise<void>;
  isTesting: boolean;
}

export const DeveloperAuditLogModal: React.FC<DeveloperAuditLogModalProps> = ({
  isOpen,
  onClose,
  logs,
  settings,
  onTestConnection,
  isTesting,
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const handleCopyLogs = () => {
    const text = JSON.stringify(logs, null, 2);
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-indigo-950 text-white flex items-center justify-between border-b border-indigo-900">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-indigo-800 rounded-lg text-indigo-300">
              <Terminal className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base flex items-center gap-2">
                Panel Developer & Audit Log
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-indigo-800 text-indigo-200">
                  Super Admin
                </span>
              </h3>
              <p className="text-xs text-indigo-300">
                Pantau setiap aktivitas pengeditan data dan diagnosa kendala sistem
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* System Diagnostics Box */}
        <div className="p-5 bg-indigo-50/50 border-b border-indigo-100 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-600" />
              <span className="text-xs font-bold text-indigo-900 uppercase tracking-wide">
                Status Koneksi Database
              </span>
            </div>

            <button
              onClick={onTestConnection}
              disabled={isTesting}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 transition-colors self-start sm:self-auto"
            >
              <RefreshCw className={`w-3 h-3 ${isTesting ? 'animate-spin' : ''}`} />
              <span>{isTesting ? 'Menguji...' : 'Uji Koneksi Sheet'}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
            <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
              <span className="text-slate-400 block text-[11px]">Database Provider:</span>
              <span className="font-semibold text-slate-800">
                {settings.googleSheetUrl ? 'Google Sheets (Apps Script Web App)' : 'Mode Lokal (Browser Storage)'}
              </span>
            </div>
            <div className="bg-white p-2.5 rounded-xl border border-indigo-100">
              <span className="text-slate-400 block text-[11px]">Terakhir Sinkron:</span>
              <span className="font-semibold text-slate-800">
                {settings.lastSynced || 'Belum tersinkron'}
              </span>
            </div>
          </div>
        </div>

        {/* Audit Log Table */}
        <div className="p-6 overflow-y-auto space-y-3 flex-1">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Riwayat Perubahan Data ({logs.length} Log)
            </h4>
            <button
              onClick={handleCopyLogs}
              className="inline-flex items-center gap-1 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 px-2.5 py-1 rounded-lg transition-colors"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Tersalin' : 'Salin JSON'}</span>
            </button>
          </div>

          {logs.length === 0 ? (
            <div className="py-8 text-center text-slate-400 text-xs">
              Belum ada riwayat aktivitas yang tercatat.
            </div>
          ) : (
            <div className="space-y-2">
              {logs.map((log) => {
                let badgeColor = 'bg-slate-100 text-slate-700';
                if (log.action === 'CREATE') badgeColor = 'bg-emerald-100 text-emerald-800 border border-emerald-200';
                if (log.action === 'UPDATE') badgeColor = 'bg-amber-100 text-amber-800 border border-amber-200';
                if (log.action === 'DELETE') badgeColor = 'bg-rose-100 text-rose-800 border border-rose-200';
                if (log.action === 'SETTINGS') badgeColor = 'bg-indigo-100 text-indigo-800 border border-indigo-200';

                return (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-xl border border-slate-200/80 bg-slate-50 hover:bg-white text-xs transition-colors space-y-1"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded uppercase ${badgeColor}`}>
                          {log.action}
                        </span>
                        <span className="font-semibold text-slate-800 flex items-center gap-1">
                          <User className="w-3 h-3 text-slate-400" />
                          {log.author}
                        </span>
                      </div>
                      <span className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {log.timestamp}
                      </span>
                    </div>

                    <p className="text-slate-700 font-medium pl-1">
                      {log.details}
                    </p>

                    {log.transactionId && (
                      <p className="text-[10px] font-mono text-slate-400 pl-1">
                        ID: {log.transactionId}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
