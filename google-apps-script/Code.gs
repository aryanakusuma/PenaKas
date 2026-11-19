/**
 * ============================================================================
 * PENAKAS - GOOGLE APPS SCRIPT DATABASE SINKRONISASI (v2 - Multi-Periode)
 * ============================================================================
 * Petunjuk Pemasangan:
 * 1. Buka spreadsheet baru di Google Sheets (sheets.new).
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus semua kode yang ada di editor, lalu tempel kode di bawah ini.
 * 4. Klik tombol "Simpan" (ikon disket / Ctrl+S).
 * 5. Klik tombol "Terapkan" (Deploy) > "Kelola Penerapan" atau "Penerapan Baru" (New Deployment).
 * 6. Pilih jenis: "Aplikasi Web" (Web App).
 *    - Deskripsi: PenaKas API v2
 *    - Jalankan sebagai: "Saya" (Me - email akun Google kamu)
 *    - Yang memiliki akses: "Siapa saja" (Anyone) -> WAJIB agar aplikasi HP/Laptop bisa kirim data!
 * 7. Klik "Terapkan" (Deploy), berikan izin Google jika diminta.
 * 8. Salin "URL Aplikasi Web" (contoh: https://script.google.com/macros/s/.../exec)
 *    lalu tempelkan ke aplikasi PenaKas pada menu "Hubungkan Google Sheet".
 * ============================================================================
 */

function setupSheets() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // 1. Tab Transaksi
  let sheetTransaksi = ss.getSheetByName("Transaksi");
  if (!sheetTransaksi) {
    sheetTransaksi = ss.insertSheet("Transaksi");
    sheetTransaksi.appendRow([
      "ID",
      "Tanggal",
      "Tipe",
      "Kategori",
      "Nominal",
      "Keterangan",
      "Diinput Oleh",
      "Waktu Dibuat",
      "Periode"
    ]);
    sheetTransaksi.getRange("A1:I1").setFontWeight("bold").setBackground("#d1fae5");
    sheetTransaksi.setFrozenRows(1);
  } else {
    // Tambahkan header Periode jika belum ada di kolom 9
    if (sheetTransaksi.getLastColumn() < 9) {
      sheetTransaksi.getRange(1, 9).setValue("Periode").setFontWeight("bold").setBackground("#d1fae5");
    }
  }

  // 2. Tab Pengaturan
  let sheetPengaturan = ss.getSheetByName("Pengaturan");
  if (!sheetPengaturan) {
    sheetPengaturan = ss.insertSheet("Pengaturan");
    sheetPengaturan.appendRow(["Kunci", "Nilai"]);
    sheetPengaturan.appendRow(["nama_organisasi", "PC IPM Pringsewu"]);
    sheetPengaturan.appendRow(["saldo_awal", "0"]);
    sheetPengaturan.appendRow(["periode_aktif", "periode-2026-2028"]);
    sheetPengaturan.appendRow(["daftar_periode", JSON.stringify([{
      id: "periode-2026-2028",
      name: "2026-2028",
      initialBalance: 0,
      status: "active",
      createdAt: new Date().toISOString()
    }])]);
    sheetPengaturan.getRange("A1:B1").setFontWeight("bold").setBackground("#e0e7ff");
    sheetPengaturan.setFrozenRows(1);
  }

  // 3. Tab Log_Aktivitas (Untuk Developer/Super Admin memantau perubahan & kendala)
  let sheetLog = ss.getSheetByName("Log_Aktivitas");
  if (!sheetLog) {
    sheetLog = ss.insertSheet("Log_Aktivitas");
    sheetLog.appendRow(["ID", "Waktu", "Aktor", "Aksi", "Detail", "ID Transaksi"]);
    sheetLog.getRange("A1:F1").setFontWeight("bold").setBackground("#fee2e2");
    sheetLog.setFrozenRows(1);
  }

  // Hapus "Sheet1" default jika ada dan sudah tidak dipakai
  const defaultSheet = ss.getSheetByName("Sheet1") || ss.getSheetByName("Sheet 1");
  if (defaultSheet && ss.getSheets().length > 1) {
    try { ss.deleteSheet(defaultSheet); } catch (e) {}
  }
}

function doGet(e) {
  setupSheets();
  const data = getAllData();
  return createJsonResponse({
    success: true,
    data: data
  });
}

function doPost(e) {
  setupSheets();
  try {
    let payload = {};
    if (e && e.postData && e.postData.contents) {
      payload = JSON.parse(e.postData.contents);
    }

    const action = payload.action;

    if (action === "get_data") {
      return createJsonResponse({
        success: true,
        data: getAllData()
      });
    }

    if (action === "add_transaction") {
      const tx = payload.transaction;
      addTransactionRow(tx);
      addAuditLog("CREATE", tx.author || "User", "Menambah transaksi " + tx.type.toUpperCase() + ": " + tx.category + " (Rp " + Number(tx.amount).toLocaleString('id-ID') + ")", tx.id);
      return createJsonResponse({ success: true, message: "Transaksi berhasil dicatat" });
    }

    if (action === "update_transaction") {
      const tx = payload.transaction;
      updateTransactionRow(tx);
      addAuditLog("UPDATE", tx.author || "User", "Mengubah transaksi: " + tx.category + " (Rp " + Number(tx.amount).toLocaleString('id-ID') + ")", tx.id);
      return createJsonResponse({ success: true, message: "Transaksi berhasil diperbarui" });
    }

    if (action === "delete_transaction") {
      const txId = payload.id;
      const author = payload.author || "User";
      deleteTransactionRow(txId);
      addAuditLog("DELETE", author, "Menghapus transaksi ID: " + txId, txId);
      return createJsonResponse({ success: true, message: "Transaksi berhasil dihapus" });
    }

    if (action === "update_settings") {
      const settings = payload.settings;
      updateSettingsRow(settings);
      addAuditLog("SETTINGS", payload.author || "Admin", "Memperbarui pengaturan saldo awal / nama organisasi / periode");
      return createJsonResponse({ success: true, message: "Pengaturan berhasil disimpan" });
    }

    return createJsonResponse({ success: false, error: "Aksi tidak dikenali: " + action });
  } catch (err) {
    return createJsonResponse({ success: false, error: err.toString() });
  }
}

function getAllData() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();

  // Ambil Pengaturan
  const sheetPengaturan = ss.getSheetByName("Pengaturan");
  let orgName = "PC IPM Pringsewu";
  let initialBalance = 0;
  let activePeriodId = "periode-2026-2028";
  let periods = [];

  if (sheetPengaturan) {
    const dataSettings = sheetPengaturan.getDataRange().getValues();
    for (let i = 1; i < dataSettings.length; i++) {
      const key = String(dataSettings[i][0] || "");
      const val = dataSettings[i][1];
      if (key === "nama_organisasi") orgName = String(val || "");
      if (key === "saldo_awal") initialBalance = Number(val || 0);
      if (key === "periode_aktif") activePeriodId = String(val || "");
      if (key === "daftar_periode") {
        try {
          periods = JSON.parse(String(val || "[]"));
        } catch (e) {
          periods = [];
        }
      }
    }
  }

  // Fallback nama organisasi
  if (!orgName || orgName === "Kas Organisasi" || orgName === "BEM / Himpunan Mahasiswa") {
    orgName = "PC IPM Pringsewu";
  }

  // Fallback periods jika belum ada
  if (!periods || periods.length === 0) {
    periods = [{
      id: activePeriodId || "periode-2026-2028",
      name: "2026-2028",
      initialBalance: initialBalance,
      status: "active",
      createdAt: new Date().toISOString()
    }];
    activePeriodId = periods[0].id;
  }

  // Ambil Transaksi
  const sheetTransaksi = ss.getSheetByName("Transaksi");
  const transactions = [];
  if (sheetTransaksi && sheetTransaksi.getLastRow() > 1) {
    const numCols = Math.max(8, sheetTransaksi.getLastColumn());
    const rows = sheetTransaksi.getRange(2, 1, sheetTransaksi.getLastRow() - 1, numCols).getValues();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      const periodId = row.length >= 9 && row[8] ? String(row[8]) : activePeriodId;
      transactions.push({
        id: String(row[0]),
        date: formatDate(row[1]),
        type: String(row[2]).toLowerCase(),
        category: String(row[3] || ""),
        amount: Number(row[4] || 0),
        description: String(row[5] || ""),
        author: String(row[6] || "Bendahara"),
        createdAt: String(row[7] || ""),
        periodId: periodId
      });
    }
  }

  // Ambil Log Aktivitas (Maks 100 terakhir)
  const sheetLog = ss.getSheetByName("Log_Aktivitas");
  const logs = [];
  if (sheetLog && sheetLog.getLastRow() > 1) {
    const logRows = sheetLog.getRange(2, 1, sheetLog.getLastRow() - 1, 6).getValues();
    for (let i = logRows.length - 1; i >= 0 && logs.length < 100; i--) {
      const r = logRows[i];
      if (!r[0]) continue;
      logs.push({
        id: String(r[0]),
        timestamp: String(r[1]),
        author: String(r[2]),
        action: String(r[3]),
        details: String(r[4]),
        transactionId: String(r[5] || "")
      });
    }
  }

  return {
    settings: {
      orgName: orgName,
      initialBalance: initialBalance,
      activePeriodId: activePeriodId,
      periods: periods
    },
    transactions: transactions,
    logs: logs
  };
}

function addTransactionRow(tx) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Transaksi");
  sheet.appendRow([
    tx.id,
    tx.date,
    tx.type,
    tx.category,
    Number(tx.amount),
    tx.description,
    tx.author,
    tx.createdAt || new Date().toISOString(),
    tx.periodId || ""
  ]);
}

function updateTransactionRow(tx) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Transaksi");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(tx.id)) {
      sheet.getRange(i + 1, 2).setValue(tx.date);
      sheet.getRange(i + 1, 3).setValue(tx.type);
      sheet.getRange(i + 1, 4).setValue(tx.category);
      sheet.getRange(i + 1, 5).setValue(Number(tx.amount));
      sheet.getRange(i + 1, 6).setValue(tx.description);
      sheet.getRange(i + 1, 7).setValue(tx.author);
      if (tx.periodId) {
        sheet.getRange(i + 1, 9).setValue(tx.periodId);
      }
      return;
    }
  }
}

function deleteTransactionRow(id) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Transaksi");
  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (String(data[i][0]) === String(id)) {
      sheet.deleteRow(i + 1);
      return;
    }
  }
}

function updateSettingsRow(settings) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Pengaturan");
  const data = sheet.getDataRange().getValues();
  const keysFound = {};

  for (let i = 1; i < data.length; i++) {
    const key = data[i][0];
    if (key === "nama_organisasi" && settings.orgName !== undefined) {
      sheet.getRange(i + 1, 2).setValue(settings.orgName);
      keysFound[key] = true;
    }
    if (key === "saldo_awal" && settings.initialBalance !== undefined) {
      sheet.getRange(i + 1, 2).setValue(Number(settings.initialBalance));
      keysFound[key] = true;
    }
    if (key === "periode_aktif" && settings.activePeriodId !== undefined) {
      sheet.getRange(i + 1, 2).setValue(settings.activePeriodId);
      keysFound[key] = true;
    }
    if (key === "daftar_periode" && settings.periods !== undefined) {
      sheet.getRange(i + 1, 2).setValue(JSON.stringify(settings.periods));
      keysFound[key] = true;
    }
  }

  if (settings.orgName && !keysFound["nama_organisasi"]) sheet.appendRow(["nama_organisasi", settings.orgName]);
  if (settings.initialBalance !== undefined && !keysFound["saldo_awal"]) sheet.appendRow(["saldo_awal", Number(settings.initialBalance)]);
  if (settings.activePeriodId && !keysFound["periode_aktif"]) sheet.appendRow(["periode_aktif", settings.activePeriodId]);
  if (settings.periods && !keysFound["daftar_periode"]) sheet.appendRow(["daftar_periode", JSON.stringify(settings.periods)]);
}

function addAuditLog(action, author, details, txId) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName("Log_Aktivitas");
  const id = Utilities.getUuid();
  const timestamp = Utilities.formatDate(new Date(), "Asia/Jakarta", "yyyy-MM-dd HH:mm:ss");
  sheet.appendRow([id, timestamp, author, action, details, txId || "-"]);
}

function formatDate(val) {
  if (val instanceof Date) {
    return Utilities.formatDate(val, "Asia/Jakarta", "yyyy-MM-dd");
  }
  return String(val);
}

function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
