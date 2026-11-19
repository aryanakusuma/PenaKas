import { Transaction, AuditLog, AppSettings, UserRole, Period } from '../types';

export const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxALZGjCFu70HicDJkbo9ebbjbvqRP-m7g07h6szWyaaEre44AeyyedIT2ji7n3vabRng/exec';

const STORAGE_KEYS = {
  TRANSACTIONS: 'penakas_v4_transactions',
  SETTINGS: 'penakas_v4_settings',
  LOGS: 'penakas_v4_audit_logs',
};

// Default periode pertama
export const DEFAULT_INITIAL_PERIOD: Period = {
  id: 'periode-2026-2028',
  name: '2026-2028',
  initialBalance: 0,
  status: 'active',
  createdAt: new Date().toISOString(),
};

const DEFAULT_SETTINGS: AppSettings = {
  orgName: 'PC IPM Pringsewu',
  initialBalance: 0,
  googleSheetUrl: DEFAULT_GOOGLE_SHEET_URL,
  currentRole: 'bendahara',
  activePeriodId: DEFAULT_INITIAL_PERIOD.id,
  periods: [DEFAULT_INITIAL_PERIOD],
};

const DEFAULT_TRANSACTIONS: Transaction[] = [];
const DEFAULT_LOGS: AuditLog[] = [];

export const getStoredSettings = (): AppSettings => {
  try {
    // Cek v4 dulu, jika belum ada cek v3
    let raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) {
      raw = localStorage.getItem('penakas_v3_settings');
    }

    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);

    // Pastikan tidak membawa nama default lama
    let cleanOrg = parsed.orgName;
    if (!cleanOrg || cleanOrg === 'BEM / Himpunan Mahasiswa' || cleanOrg === 'Kas Organisasi') {
      cleanOrg = 'PC IPM Pringsewu';
    }

    // Pastikan daftar periode valid
    let periods: Period[] = Array.isArray(parsed.periods) && parsed.periods.length > 0 
      ? parsed.periods 
      : [{
          id: 'periode-2026-2028',
          name: '2026-2028',
          initialBalance: Number(parsed.initialBalance) || 0,
          status: 'active',
          createdAt: new Date().toISOString(),
        }];

    let activePeriodId = parsed.activePeriodId;
    if (!activePeriodId || !periods.some(p => p.id === activePeriodId)) {
      activePeriodId = periods[0].id;
    }

    const currentPeriod = periods.find(p => p.id === activePeriodId) || periods[0];

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
      orgName: cleanOrg,
      initialBalance: currentPeriod.initialBalance ?? 0,
      activePeriodId: activePeriodId,
      periods: periods,
      googleSheetUrl: parsed.googleSheetUrl || DEFAULT_GOOGLE_SHEET_URL,
    };
  } catch (e) {
    console.error('Failed to parse settings from localStorage', e);
    return DEFAULT_SETTINGS;
  }
};

export const saveStoredSettings = (settings: AppSettings): void => {
  localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
};

export const getStoredTransactions = (): Transaction[] => {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) {
      raw = localStorage.getItem('penakas_v3_transactions');
    }
    if (!raw) return DEFAULT_TRANSACTIONS;
    const parsed = JSON.parse(raw);
    
    if (Array.isArray(parsed)) {
      // Pastikan setiap transaksi memiliki periodId (jika belum ada, masukkan ke periode default pertama)
      return parsed.map((tx: any) => ({
        ...tx,
        periodId: tx.periodId || DEFAULT_INITIAL_PERIOD.id,
      }));
    }
    return DEFAULT_TRANSACTIONS;
  } catch (e) {
    console.error('Failed to parse transactions from localStorage', e);
    return DEFAULT_TRANSACTIONS;
  }
};

export const saveStoredTransactions = (transactions: Transaction[]): void => {
  localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
};

export const getStoredLogs = (): AuditLog[] => {
  try {
    let raw = localStorage.getItem(STORAGE_KEYS.LOGS);
    if (!raw) {
      raw = localStorage.getItem('penakas_v3_logs');
    }
    if (!raw) return DEFAULT_LOGS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_LOGS;
  } catch (e) {
    console.error('Failed to parse logs from localStorage', e);
    return DEFAULT_LOGS;
  }
};

export const addStoredLog = (
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SETTINGS',
  author: string,
  details: string,
  transactionId?: string
): AuditLog => {
  const currentLogs = getStoredLogs();
  const newLog: AuditLog = {
    id: 'log-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6),
    timestamp: new Date().toLocaleString('id-ID'),
    author,
    action,
    details,
    transactionId,
  };
  const updatedLogs = [newLog, ...currentLogs].slice(0, 150);
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
  return newLog;
};
