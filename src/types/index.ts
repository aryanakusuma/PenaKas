export type TransactionType = 'income' | 'expense';

export type UserRole = 'bendahara' | 'developer';

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  type: TransactionType;
  amount: number;
  category: string;
  description: string;
  author: string; // 'Bendahara' or 'Admin'
  createdAt: string; // ISO 8601 string
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
}

export interface SheetSyncResponse {
  success: boolean;
  message?: string;
  data?: {
    settings?: {
      orgName: string;
      initialBalance: number;
    };
    transactions: Transaction[];
    logs: AuditLog[];
  };
  error?: string;
}
