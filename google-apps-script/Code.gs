/**
 * ============================================================================
 * PENAKAS - GOOGLE APPS SCRIPT DATABASE SINKRONISASI
 * ============================================================================
 * Petunjuk Pemasangan:
 * 1. Buka spreadsheet baru di Google Sheets (sheets.new).
 * 2. Klik menu "Ekstensi" > "Apps Script".
 * 3. Hapus semua kode yang ada di editor, lalu tempel kode di bawah ini.
 * 4. Klik tombol "Simpan" (ikon disket / Ctrl+S).
 * 5. Klik tombol "Terapkan" (Deploy) > "Kelola Penerapan" atau "Penerapan Baru" (New Deployment).
 * 6. Pilih jenis: "Aplikasi Web" (Web App).
 *    - Deskripsi: PenaKas API v1
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
      "Waktu Dibuat"
    ]);
    sheetTransaksi.getRange("A1:H1").setFontWeight("bold").setBackground("#d1fae5");
    sheetTransaksi.setFrozenRows(1);
  }

  // 2. Tab Pengaturan
  let sheetPengaturan = ss.getSheetByName("Pengaturan");
  if (!sheetPengaturan) {
    sheetPengaturan = ss.insertSheet("Pengaturan");
    sheetPengaturan.appendRow(["Kunci", "Nilai"]);
    sheetPengaturan.appendRow(["nama_organisasi", "Kas Organisasi"]);
    sheetPengaturan.appendRow(["saldo_awal", "0"]);
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
      addAuditLog("SETTINGS", payload.author || "Admin", "Memperbarui pengaturan saldo awal / nama organisasi");
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
  let orgName = "Kas Organisasi";
  let initialBalance = 0;
  if (sheetPengaturan) {
    const dataSettings = sheetPengaturan.getDataRange().getValues();
    for (let i = 1; i < dataSettings.length; i++) {
      if (dataSettings[i][0] === "nama_organisasi") orgName = String(dataSettings[i][1] || "");
      if (dataSettings[i][0] === "saldo_awal") initialBalance = Number(dataSettings[i][1] || 0);
    }
  }

  // Ambil Transaksi
  const sheetTransaksi = ss.getSheetByName("Transaksi");
  const transactions = [];
  if (sheetTransaksi && sheetTransaksi.getLastRow() > 1) {
    const rows = sheetTransaksi.getRange(2, 1, sheetTransaksi.getLastRow() - 1, 8).getValues();
    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      if (!row[0]) continue;
      transactions.push({
        id: String(row[0]),
        date: formatDate(row[1]),
        type: String(row[2]).toLowerCase(),
        category: String(row[3] || ""),
        amount: Number(row[4] || 0),
        description: String(row[5] || ""),
        author: String(row[6] || "Bendahara"),
        createdAt: String(row[7] || "")
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
      initialBalance: initialBalance
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
    tx.createdAt || new Date().toISOString()
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
  let foundOrg = false;
  let foundSaldo = false;

  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === "nama_organisasi") {
      sheet.getRange(i + 1, 2).setValue(settings.orgName);
      foundOrg = true;
    }
    if (data[i][0] === "saldo_awal") {
      sheet.getRange(i + 1, 2).setValue(Number(settings.initialBalance));
      foundSaldo = true;
    }
  }

  if (!foundOrg) sheet.appendRow(["nama_organisasi", settings.orgName]);
  if (!foundSaldo) sheet.appendRow(["saldo_awal", Number(settings.initialBalance)]);
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
