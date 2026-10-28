import { Transaction, AuditLog, AppSettings, UserRole } from '../types';

export const DEFAULT_GOOGLE_SHEET_URL = 'https://script.google.com/macros/s/AKfycbxALZGjCFu70HicDJkbo9ebbjbvqRP-m7g07h6szWyaaEre44AeyyedIT2ji7n3vabRng/exec';

const STORAGE_KEYS = {
  TRANSACTIONS: 'penakas_v3_transactions',
  SETTINGS: 'penakas_v3_settings',
  LOGS: 'penakas_v3_audit_logs',
};

// Bersihkan cache dan data contoh lama dari HP/Laptop secara otomatis
try {
  localStorage.removeItem('kaskita_transactions');
  localStorage.removeItem('kaskita_settings');
  localStorage.removeItem('kaskita_audit_logs');
  localStorage.removeItem('penakas_transactions');
  localStorage.removeItem('penakas_settings');
  localStorage.removeItem('penakas_audit_logs');
  localStorage.removeItem('penakas_v2_transactions');
  localStorage.removeItem('penakas_v2_settings');
  localStorage.removeItem('penakas_v2_audit_logs');
} catch (e) {
  // Abaikan jika di lingkungan tanpa localStorage
}

const DEFAULT_SETTINGS: AppSettings = {
  orgName: 'PC IPM Pringsewu',
  initialBalance: 0,
  googleSheetUrl: DEFAULT_GOOGLE_SHEET_URL,
  currentRole: 'bendahara',
};

const DEFAULT_TRANSACTIONS: Transaction[] = [];

const DEFAULT_LOGS: AuditLog[] = [];

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    const parsed = JSON.parse(raw);
    
    // Pastikan tidak membawa sisa saldo contoh 1.500.000 atau nama default lama
    if (parsed.initialBalance === 1500000 || parsed.orgName === 'BEM / Himpunan Mahasiswa' || parsed.orgName === 'Kas Organisasi') {
      parsed.initialBalance = 0;
      parsed.orgName = 'PC IPM Pringsewu';
    }

    return {
      ...DEFAULT_SETTINGS,
      ...parsed,
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
    const raw = localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
    if (!raw) return DEFAULT_TRANSACTIONS;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_TRANSACTIONS;
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
    const raw = localStorage.getItem(STORAGE_KEYS.LOGS);
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
