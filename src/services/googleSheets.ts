import { Transaction, AppSettings, AuditLog, SheetSyncResponse } from '../types';

/**
 * Mengambil semua data dari Google Apps Script Web App
 */
export const fetchFromGoogleSheet = async (url: string): Promise<SheetSyncResponse> => {
  if (!url || !url.startsWith('http')) {
    return { success: false, error: 'URL Google Sheet belum diatur' };
  }

  try {
    // Menambahkan timestamp untuk mencegah cache browser
    const fetchUrl = url.includes('?') 
      ? `${url}&action=get_data&_t=${Date.now()}` 
      : `${url}?action=get_data&_t=${Date.now()}`;

    const res = await fetch(fetchUrl, {
      method: 'GET',
      redirect: 'follow',
    });

    if (!res.ok) {
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const text = await res.text();
    
    // Jika Google mengembalikan halaman HTML (biasanya halaman login atau izin ditolak)
    if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
      if (text.includes('Maaf, file yang Anda minta tidak ada') || text.includes('File not found')) {
        return {
          success: false,
          error: 'Akses ditolak Google ("File tidak ada"). Pastikan deploy disetel "Execute as: Me" dan "Who has access: Anyone", atau gunakan akun Gmail pribadi (@gmail.com) bukan akun kampus.',
        };
      }
      return {
        success: false,
        error: 'Google merespons dengan halaman web login/error, bukan data. Pastikan akses disetel ke "Anyone" (Siapa saja).',
      };
    }

    const data: SheetSyncResponse = JSON.parse(text);
    return data;
  } catch (error: any) {
    console.error('Error fetching from Google Sheets:', error);
    return {
      success: false,
      error: error.message || 'Gagal terhubung ke Google Sheets. Periksa URL atau koneksi internet.',
    };
  }
};

/**
 * Mengirim transaksi baru atau pembaruan transaksi ke Google Apps Script
 */
export const syncTransactionToGoogleSheet = async (
  url: string,
  transaction: Transaction,
  isUpdate: boolean = false
): Promise<{ success: boolean; message?: string; error?: string }> => {
  if (!url || !url.startsWith('http')) {
    // Mode offline / demo
    return { success: true, message: 'Disimpan di penyimpanan lokal perangkat (Mode Offline)' };
  }

  try {
    const payload = {
      action: isUpdate ? 'update_transaction' : 'add_transaction',
      transaction,
    };

    // Menggunakan text/plain untuk menghindari CORS Preflight (OPTIONS) di Google Apps Script
    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const resText = await res.text();
    if (resText.trim().startsWith('<')) {
      return {
        success: false,
        error: 'Google Apps Script mengembalikan halaman web. Periksa izin akses Web App.',
      };
    }
    const result = JSON.parse(resText);
    return result;
  } catch (error: any) {
    console.warn('Gagal sync ke Google Sheet, data tetap tersimpan di lokal:', error);
    return {
      success: false,
      error: error.message || 'Gagal mengirim ke Google Sheet, namun transaksi sudah tersimpan di HP/Laptop.',
    };
  }
};

/**
 * Menghapus transaksi dari Google Sheet
 */
export const deleteTransactionFromGoogleSheet = async (
  url: string,
  transactionId: string,
  author: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  if (!url || !url.startsWith('http')) {
    return { success: true, message: 'Dihapus dari penyimpanan lokal perangkat' };
  }

  try {
    const payload = {
      action: 'delete_transaction',
      id: transactionId,
      author,
    };

    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const resText = await res.text();
    if (resText.trim().startsWith('<')) {
      return {
        success: false,
        error: 'Google Apps Script mengembalikan halaman web. Periksa izin akses Web App.',
      };
    }
    const result = JSON.parse(resText);
    return result;
  } catch (error: any) {
    console.warn('Gagal menghapus di Google Sheet:', error);
    return {
      success: false,
      error: error.message || 'Gagal menghapus di Google Sheet',
    };
  }
};

/**
 * Memperbarui pengaturan (Saldo Awal, Nama Organisasi) ke Google Sheet
 */
export const syncSettingsToGoogleSheet = async (
  url: string,
  settings: { orgName: string; initialBalance: number },
  author: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  if (!url || !url.startsWith('http')) {
    return { success: true, message: 'Pengaturan tersimpan secara lokal' };
  }

  try {
    const payload = {
      action: 'update_settings',
      settings,
      author,
    };

    const res = await fetch(url, {
      method: 'POST',
      redirect: 'follow',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(payload),
    });

    const resText = await res.text();
    if (resText.trim().startsWith('<')) {
      return {
        success: false,
        error: 'Google Apps Script mengembalikan halaman web. Periksa izin akses Web App.',
      };
    }
    const result = JSON.parse(resText);
    return result;
  } catch (error: any) {
    console.warn('Gagal simpan pengaturan ke Google Sheet:', error);
    return {
      success: false,
      error: error.message || 'Gagal memperbarui pengaturan di Google Sheet',
    };
  }
};
