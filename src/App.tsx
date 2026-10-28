import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BalanceCard } from './components/BalanceCard';
import { TransactionList } from './components/TransactionList';
import { TransactionModal } from './components/TransactionModal';
import { InitialBalanceModal } from './components/InitialBalanceModal';
import { DeveloperAuditLogModal } from './components/DeveloperAuditLogModal';
import { GoogleSheetSetupModal } from './components/GoogleSheetSetupModal';
import { ExportModal } from './components/ExportModal';
import { 
  Transaction, 
  TransactionType, 
  UserRole, 
  AppSettings, 
  AuditLog 
} from './types';
import { 
  getStoredSettings, 
  saveStoredSettings, 
  getStoredTransactions, 
  saveStoredTransactions, 
  getStoredLogs, 
  addStoredLog 
} from './services/storage';
import { 
  fetchFromGoogleSheet, 
  syncTransactionToGoogleSheet, 
  deleteTransactionFromGoogleSheet, 
  syncSettingsToGoogleSheet 
} from './services/googleSheets';
import { Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export const App: React.FC = () => {
  // 1. Core State
  const [settings, setSettings] = useState<AppSettings>(getStoredSettings);
  const [transactions, setTransactions] = useState<Transaction[]>(getStoredTransactions);
  const [logs, setLogs] = useState<AuditLog[]>(getStoredLogs);

  // 2. UI & Filter State
  const [selectedMonth, setSelectedMonth] = useState<string>('ALL');
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [hasLoadedInitial, setHasLoadedInitial] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<{ text: string; type: 'success' | 'info' | 'error' } | null>(null);

  // 3. Modals State
  const [activeTxType, setActiveTxType] = useState<TransactionType | null>(null);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [isBalanceModalOpen, setIsBalanceModalOpen] = useState(false);
  const [isDeveloperModalOpen, setIsDeveloperModalOpen] = useState(false);
  const [isGoogleSheetModalOpen, setIsGoogleSheetModalOpen] = useState(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);

  // 4. PWA Installation State
  const [installPrompt, setInstallPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
  }, []);

  const handleInstallPwa = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  const showToast = (text: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToastMessage({ text, type });
    setTimeout(() => {
      setToastMessage(null);
    }, 3500);
  };

  // 5. Automatic Initial Sync from Google Sheets on Mount
  useEffect(() => {
    if (settings.googleSheetUrl && settings.googleSheetUrl.startsWith('http')) {
      handleSyncSheet(true);
    }
  }, []);

  // 6. Sync Handler
  const handleSyncSheet = async (isSilent: boolean = false) => {
    if (!settings.googleSheetUrl) {
      if (!isSilent) setIsGoogleSheetModalOpen(true);
      return;
    }

    setIsSyncing(true);
    try {
      const res = await fetchFromGoogleSheet(settings.googleSheetUrl);
      if (res.success && res.data) {
        if (res.data.transactions) {
          setTransactions(res.data.transactions);
          saveStoredTransactions(res.data.transactions);
        }
        if (res.data.settings) {
          setSettings((prev) => {
            const sheetOrg = res.data?.settings?.orgName;
            const cleanOrg = (!sheetOrg || sheetOrg === 'Kas Organisasi' || sheetOrg === 'BEM / Himpunan Mahasiswa')
              ? 'PC IPM Pringsewu'
              : sheetOrg;

            const updatedSettings = {
              ...prev,
              orgName: cleanOrg,
              initialBalance: res.data?.settings?.initialBalance ?? prev.initialBalance,
              lastSynced: new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }),
            };
            saveStoredSettings(updatedSettings);
            return updatedSettings;
          });
        }
        if (res.data.logs && res.data.logs.length > 0) {
          setLogs(res.data.logs);
        }
        if (!isSilent) showToast('Data kas berhasil disinkronkan dengan Google Sheet!', 'success');
      } else {
        if (!isSilent) showToast(res.error || 'Gagal sinkron dengan Google Sheet', 'error');
      }
    } catch (e: any) {
      if (!isSilent) showToast('Koneksi internet bermasalah', 'error');
    } finally {
      setIsSyncing(false);
      setHasLoadedInitial(true);
    }
  };

  // 7. Role Switcher
  const handleRoleChange = (newRole: UserRole) => {
    const updated = { ...settings, currentRole: newRole };
    setSettings(updated);
    saveStoredSettings(updated);
    showToast(`Beralih ke tampilan ${newRole === 'bendahara' ? 'Bendahara' : 'Admin/Developer'}`, 'info');
  };

  // 8. Calculations & Filtering
  const availableMonths = useMemo(() => {
    const months = new Set<string>();
    transactions.forEach((t) => {
      if (t.date) {
        const ym = t.date.substring(0, 7); // YYYY-MM
        months.add(ym);
      }
    });
    return Array.from(months).sort().reverse();
  }, [transactions]);

  const filteredTransactions = useMemo(() => {
    if (selectedMonth === 'ALL') return transactions;
    return transactions.filter((t) => t.date && t.date.startsWith(selectedMonth));
  }, [transactions, selectedMonth]);

  const totalIncome = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredTransactions]);

  const totalExpense = useMemo(() => {
    return filteredTransactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [filteredTransactions]);

  // Total saldo akumulatif dari semua transaksi
  const allTotalIncome = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'income')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  const allTotalExpense = useMemo(() => {
    return transactions
      .filter((t) => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);
  }, [transactions]);

  const finalBalance = (settings.initialBalance || 0) + allTotalIncome - allTotalExpense;

  // 9. Save Transaction (Add or Update)
  const handleSaveTransaction = async (txData: {
    id?: string;
    date: string;
    type: TransactionType;
    amount: number;
    category: string;
    description: string;
  }) => {
    const authorName = settings.currentRole === 'bendahara' ? 'Bendahara' : 'Admin/Dev';
    const isEditing = Boolean(txData.id);

    let updatedTx: Transaction;
    let newTransactions: Transaction[];

    if (isEditing && txData.id) {
      updatedTx = {
        id: txData.id,
        date: txData.date,
        type: txData.type,
        amount: txData.amount,
        category: txData.category,
        description: txData.description,
        author: authorName,
        createdAt: new Date().toISOString(),
      };
      newTransactions = transactions.map((t) => (t.id === txData.id ? updatedTx : t));
      
      const newLog = addStoredLog('UPDATE', authorName, `Edit transaksi: ${txData.category} (Rp ${txData.amount.toLocaleString('id-ID')})`, txData.id);
      setLogs((prev) => [newLog, ...prev]);
      showToast('Transaksi berhasil diperbarui', 'success');
    } else {
      updatedTx = {
        id: 'tx-' + Date.now(),
        date: txData.date,
        type: txData.type,
        amount: txData.amount,
        category: txData.category,
        description: txData.description,
        author: authorName,
        createdAt: new Date().toISOString(),
      };
      newTransactions = [updatedTx, ...transactions];

      const newLog = addStoredLog('CREATE', authorName, `Tambah ${txData.type === 'income' ? 'Pemasukan' : 'Pengeluaran'}: ${txData.category} (Rp ${txData.amount.toLocaleString('id-ID')})`, updatedTx.id);
      setLogs((prev) => [newLog, ...prev]);
      showToast('Transaksi baru berhasil dicatat!', 'success');
    }

    setTransactions(newTransactions);
    saveStoredTransactions(newTransactions);

    // Sync to Google Sheet asynchronously
    if (settings.googleSheetUrl) {
      syncTransactionToGoogleSheet(settings.googleSheetUrl, updatedTx, isEditing).catch(console.error);
    }
  };

  // 10. Delete Transaction
  const handleDeleteTransaction = async (id: string) => {
    const tx = transactions.find((t) => t.id === id);
    if (!tx) return;

    if (!window.confirm(`Yakin ingin menghapus transaksi "${tx.category}" sebesar Rp ${tx.amount.toLocaleString('id-ID')}?`)) {
      return;
    }

    const authorName = settings.currentRole === 'bendahara' ? 'Bendahara' : 'Admin/Dev';
    const newTransactions = transactions.filter((t) => t.id !== id);
    setTransactions(newTransactions);
    saveStoredTransactions(newTransactions);

    const newLog = addStoredLog('DELETE', authorName, `Hapus transaksi: ${tx.category} (Rp ${tx.amount.toLocaleString('id-ID')})`, id);
    setLogs((prev) => [newLog, ...prev]);
    showToast('Transaksi berhasil dihapus', 'info');

    if (settings.googleSheetUrl) {
      deleteTransactionFromGoogleSheet(settings.googleSheetUrl, id, authorName).catch(console.error);
    }
  };

  // 11. Save Initial Balance & Org Name
  const handleSaveInitialBalance = (data: { orgName: string; initialBalance: number }) => {
    const authorName = settings.currentRole === 'bendahara' ? 'Bendahara' : 'Admin/Dev';
    const updated = {
      ...settings,
      orgName: data.orgName,
      initialBalance: data.initialBalance,
    };
    setSettings(updated);
    saveStoredSettings(updated);

    const newLog = addStoredLog('SETTINGS', authorName, `Ubah saldo awal jadi Rp ${data.initialBalance.toLocaleString('id-ID')} & nama: ${data.orgName}`);
    setLogs((prev) => [newLog, ...prev]);
    showToast('Pengaturan saldo awal berhasil disimpan', 'success');

    if (settings.googleSheetUrl) {
      syncSettingsToGoogleSheet(settings.googleSheetUrl, data, authorName).catch(console.error);
    }
  };

  // 12. Save Google Sheet URL
  const handleSaveGoogleSheetUrl = (url: string) => {
    const updated = { ...settings, googleSheetUrl: url };
    setSettings(updated);
    saveStoredSettings(updated);
    showToast('URL Google Sheet berhasil disimpan! Mulai sinkron...', 'success');
    if (url) {
      setTimeout(() => handleSyncSheet(false), 300);
    }
  };

  const handleDisconnectSheet = () => {
    const updated = { ...settings, googleSheetUrl: '' };
    setSettings(updated);
    saveStoredSettings(updated);
    showToast('Koneksi Google Sheet diputuskan (Mode Lokal aktif)', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-emerald-500 selection:text-white">
      {/* Toast Notification Banner */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-bounce-short">
          <div className={`px-4 py-2.5 rounded-2xl shadow-xl flex items-center gap-2 text-xs sm:text-sm font-semibold text-white ${
            toastMessage.type === 'success' 
              ? 'bg-emerald-600 shadow-emerald-600/30' 
              : toastMessage.type === 'error'
              ? 'bg-rose-600 shadow-rose-600/30'
              : 'bg-indigo-600 shadow-indigo-600/30'
          }`}>
            {toastMessage.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-200" />
            ) : (
              <AlertCircle className="w-4 h-4 text-rose-200" />
            )}
            <span>{toastMessage.text}</span>
          </div>
        </div>
      )}

      {/* Top Navbar */}
      <Header
        settings={settings}
        currentRole={settings.currentRole}
        onRoleChange={handleRoleChange}
        isSyncing={isSyncing}
        onSync={() => handleSyncSheet(false)}
        onOpenGoogleSheetModal={() => setIsGoogleSheetModalOpen(true)}
        onOpenDeveloperModal={() => setIsDeveloperModalOpen(true)}
        onOpenExportModal={() => setIsExportModalOpen(true)}
        canInstallPwa={Boolean(installPrompt)}
        onInstallPwa={handleInstallPwa}
      />

      {/* Main Container */}
      <main className="max-w-4xl mx-auto w-full px-4 py-5 sm:px-6 space-y-6 flex-1">
        
        {/* Banner Reminder for First Time Setup (if sheet is not yet connected) */}
        {!settings.googleSheetUrl && (
          <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-amber-900 shadow-sm">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-amber-100 rounded-xl text-amber-700 shrink-0">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <p className="font-bold text-amber-950">Aplikasi Berjalan dalam Mode Lokal</p>
                <p className="text-amber-800/90 mt-0.5">
                  Hubungkan Google Sheets agar data bisa tersinkron otomatis antara HP kamu & bendahara.
                </p>
              </div>
            </div>
            <button
              onClick={() => setIsGoogleSheetModalOpen(true)}
              className="text-xs font-bold px-3 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white shadow-sm transition-colors self-start sm:self-auto shrink-0"
            >
              Hubungkan Google Sheet
            </button>
          </div>
        )}

        {/* Hero Section: Saldo & Ringkasan */}
        <BalanceCard
          initialBalance={settings.initialBalance || 0}
          totalIncome={totalIncome}
          totalExpense={totalExpense}
          finalBalance={finalBalance}
          isLoading={isSyncing && !hasLoadedInitial}
          onOpenIncomeModal={() => {
            setEditingTransaction(null);
            setActiveTxType('income');
          }}
          onOpenExpenseModal={() => {
            setEditingTransaction(null);
            setActiveTxType('expense');
          }}
          onEditInitialBalance={() => setIsBalanceModalOpen(true)}
          selectedMonth={selectedMonth}
          onMonthChange={setSelectedMonth}
          availableMonths={availableMonths}
        />

        {/* Transactions List */}
        <TransactionList
          transactions={filteredTransactions}
          onEdit={(tx) => {
            setEditingTransaction(tx);
            setActiveTxType(tx.type);
          }}
          onDelete={handleDeleteTransaction}
          onOpenAddModal={(type) => {
            setEditingTransaction(null);
            setActiveTxType(type);
          }}
        />

      </main>

      {/* Footer */}
      <footer className="text-center py-6 text-xs text-slate-400 border-t border-slate-200/60 bg-white">
        <p className="font-medium text-slate-500">
          PenaKas &bull; Aplikasi Pencatat Kas PC IPM Pringsewu
        </p>
        <p className="text-[11px] text-slate-400 mt-0.5">
          Dibuat oleh Aryana Kusuma.
        </p>
      </footer>

      {/* Modals */}
      {activeTxType && (
        <TransactionModal
          isOpen={Boolean(activeTxType)}
          onClose={() => {
            setActiveTxType(null);
            setEditingTransaction(null);
          }}
          type={activeTxType}
          editingTransaction={editingTransaction}
          onSave={handleSaveTransaction}
        />
      )}

      <InitialBalanceModal
        isOpen={isBalanceModalOpen}
        onClose={() => setIsBalanceModalOpen(false)}
        orgName={settings.orgName}
        initialBalance={settings.initialBalance || 0}
        onSave={handleSaveInitialBalance}
      />

      <DeveloperAuditLogModal
        isOpen={isDeveloperModalOpen}
        onClose={() => setIsDeveloperModalOpen(false)}
        logs={logs}
        settings={settings}
        onTestConnection={() => handleSyncSheet(false)}
        isTesting={isSyncing}
      />

      <GoogleSheetSetupModal
        isOpen={isGoogleSheetModalOpen}
        onClose={() => setIsGoogleSheetModalOpen(false)}
        currentUrl={settings.googleSheetUrl}
        onSaveUrl={handleSaveGoogleSheetUrl}
        onDisconnect={handleDisconnectSheet}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        transactions={transactions}
        settings={settings}
        initialBalance={settings.initialBalance || 0}
        totalIncome={allTotalIncome}
        totalExpense={allTotalExpense}
        finalBalance={finalBalance}
      />
    </div>
  );
};

export default App;
