import { Transaction, AuditLog, AppSettings, UserRole } from '../types';

const STORAGE_KEYS = {
  TRANSACTIONS: 'penakas_transactions',
  SETTINGS: 'penakas_settings',
  LOGS: 'penakas_audit_logs',
};

const DEFAULT_SETTINGS: AppSettings = {
  orgName: 'BEM / Himpunan Mahasiswa',
  initialBalance: 1500000, // Rp 1.500.000 saldo awal default
  googleSheetUrl: '',
  currentRole: 'bendahara',
};

const DEFAULT_TRANSACTIONS: Transaction[] = [
  {
    id: 'tx-1',
    date: new Date(Date.now() - 3 * 86400000).toISOString().split('T')[0],
    type: 'income',
    amount: 500000,
    category: 'Iuran Kas Anggota',
    description: 'Iuran kas wajib bulan ini dari 25 anggota divisi acara',
    author: 'Bendahara',
    createdAt: new Date(Date.now() - 3 * 86400000).toISOString(),
  },
  {
    id: 'tx-2',
    date: new Date(Date.now() - 2 * 86400000).toISOString().split('T')[0],
    type: 'income',
    amount: 1200000,
    category: 'Dana Usaha (Danus)',
    description: 'Hasil jualan risol mayo & merchandise kampus minggu ke-3',
    author: 'Bendahara',
    createdAt: new Date(Date.now() - 2 * 86400000).toISOString(),
  },
  {
    id: 'tx-3',
    date: new Date(Date.now() - 1 * 86400000).toISOString().split('T')[0],
    type: 'expense',
    amount: 350000,
    category: 'Konsumsi Rapat',
    description: 'Beli snack & air mineral rapat pleno persiapan proker',
    author: 'Bendahara',
    createdAt: new Date(Date.now() - 1 * 86400000).toISOString(),
  },
  {
    id: 'tx-4',
    date: new Date().toISOString().split('T')[0],
    type: 'expense',
    amount: 180000,
    category: 'Perlengkapan & ATK',
    description: 'Kertas HVS, spidol, dan print proposal sponsorship',
    author: 'Bendahara',
    createdAt: new Date().toISOString(),
  },
];

const DEFAULT_LOGS: AuditLog[] = [
  {
    id: 'log-1',
    timestamp: new Date().toLocaleString('id-ID'),
    author: 'Admin / Developer',
    action: 'SETTINGS',
    details: 'Inisialisasi aplikasi PenaKas pertama kali dengan saldo awal Rp 1.500.000',
  },
];

export const getStoredSettings = (): AppSettings => {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
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
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_TRANSACTIONS;
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
  const updatedLogs = [newLog, ...currentLogs].slice(0, 150); // Keep last 150
  localStorage.setItem(STORAGE_KEYS.LOGS, JSON.stringify(updatedLogs));
  return newLog;
};
