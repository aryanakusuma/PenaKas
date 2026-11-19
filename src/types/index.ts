export type TransactionType = 'income' | 'expense';

export type UserRole = 'bendahara' | 'developer';

export interface Period {
  id: string; // e.g. "periode-2026-2028"
  name: string; // e.g. "2026-2028"
  initialBalance: number; // Saldo awal khusus periode ini
  status: 'active' | 'closed'; // 'active' atau 'closed' (tutup buku)
  createdAt: string; // ISO 8601 string
  closedAt?: string;
  notes?: string;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  author: string; // 'Bendahara' or 'Admin'
  createdAt: string; // ISO 8601 string
  periodId?: string; // ID periode kepengurusan (misal "periode-2026-2028")
}

export interface AuditLog {
  id: string;
  timestamp: string;
  author: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'SETTINGS';
  details: string;
  transactionId?: string;
}

export interface AppSettings {
  orgName: string;
  initialBalance: number;
  googleSheetUrl: string;
  currentRole: UserRole;
  lastSynced?: string;
  activePeriodId: string; // Periode yang saat ini aktif/dipilih
  periods: Period[]; // Daftar semua periode kepengurusan
}

export interface SheetSyncResponse {
  success: boolean;
  message?: string;
  data?: {
    settings?: {
      orgName: string;
      initialBalance: number;
      activePeriodId?: string;
      periods?: Period[];
    };
    transactions: Transaction[];
    logs: AuditLog[];
  };
  error?: string;
}
