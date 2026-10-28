import React, { useState } from 'react';
import { 
  X, 
  FileSpreadsheet, 
  ExternalLink, 
  Copy, 
  Check, 
  Save, 
  Trash2,
  AlertCircle,
  HelpCircle,
  Sparkles
} from 'lucide-react';

interface GoogleSheetSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUrl: string;
  onSaveUrl: (url: string) => void;
  onDisconnect: () => void;
}

export const GoogleSheetSetupModal: React.FC<GoogleSheetSetupModalProps> = ({
  isOpen,
  onClose,
  currentUrl,
  onSaveUrl,
  onDisconnect,
}) => {
  const [url, setUrl] = useState(currentUrl);
  const [copiedScript, setCopiedScript] = useState(false);
  const [activeTab, setActiveTab] = useState<'url' | 'instructions'>('url');

  if (!isOpen) return null;

  const handleCopyScript = () => {
    // Kode Google Apps Script ringkas & lengkap
    const scriptText = `function setupSheets(){const e=SpreadsheetApp.getActiveSpreadsheet();let t=e.getSheetByName("Transaksi");t||((t=e.insertSheet("Transaksi")).appendRow(["ID","Tanggal","Tipe","Kategori","Nominal","Keterangan","Diinput Oleh","Waktu Dibuat"]),t.getRange("A1:H1").setFontWeight("bold").setBackground("#d1fae5"),t.setFrozenRows(1));let a=e.getSheetByName("Pengaturan");a||((a=e.insertSheet("Pengaturan")).appendRow(["Kunci","Nilai"]),a.appendRow(["nama_organisasi","Kas Organisasi"]),a.appendRow(["saldo_awal","0"]),a.getRange("A1:B1").setFontWeight("bold").setBackground("#e0e7ff"),a.setFrozenRows(1));let n=e.getSheetByName("Log_Aktivitas");n||((n=e.insertSheet("Log_Aktivitas")).appendRow(["ID","Waktu","Aktor","Aksi","Detail","ID Transaksi"]),n.getRange("A1:F1").setFontWeight("bold").setBackground("#fee2e2"),n.setFrozenRows(1))}function doGet(e){setupSheets();return createJsonResponse({success:!0,data:getAllData()})}function doPost(e){setupSheets();try{let t={};e&&e.postData&&e.postData.contents&&(t=JSON.parse(e.postData.contents));const a=t.action;if("get_data"===a)return createJsonResponse({success:!0,data:getAllData()});if("add_transaction"===a){const e=t.transaction;return addTransactionRow(e),addAuditLog("CREATE",e.author||"User","Menambah transaksi "+e.type.toUpperCase()+": "+e.category+" (Rp "+Number(e.amount).toLocaleString("id-ID")+")",e.id),createJsonResponse({success:!0,message:"Transaksi berhasil dicatat"})}if("update_transaction"===a){const e=t.transaction;return updateTransactionRow(e),addAuditLog("UPDATE",e.author||"User","Mengubah transaksi: "+e.category+" (Rp "+Number(e.amount).toLocaleString("id-ID")+")",e.id),createJsonResponse({success:!0,message:"Transaksi berhasil diperbarui"})}if("delete_transaction"===a){const e=t.id,a=t.author||"User";return deleteTransactionRow(e),addAuditLog("DELETE",a,"Menghapus transaksi ID: "+e,e),createJsonResponse({success:!0,message:"Transaksi berhasil dihapus"})}if("update_settings"===a){const e=t.settings;return updateSettingsRow(e),addAuditLog("SETTINGS",t.author||"Admin","Memperbarui pengaturan saldo awal / nama organisasi"),createJsonResponse({success:!0,message:"Pengaturan berhasil disimpan"})}return createJsonResponse({success:!1,error:"Aksi tidak dikenali: "+a})}catch(t){return createJsonResponse({success:!1,error:t.toString()})}}function getAllData(){const e=SpreadsheetApp.getActiveSpreadsheet(),t=e.getSheetByName("Pengaturan");let a="Kas Organisasi",n=0;if(t){const e=t.getDataRange().getValues();for(let t=1;t<e.length;t++)"nama_organisasi"===e[t][0]&&(a=String(e[t][1]||"")),"saldo_awal"===e[t][0]&&(n=Number(e[t][1]||0))}const r=e.getSheetByName("Transaksi"),s=[];if(r&&r.getLastRow()>1){const e=r.getRange(2,1,r.getLastRow()-1,8).getValues();for(let t=0;t<e.length;t++){const a=e[t];a[0]&&s.push({id:String(a[0]),date:formatDate(a[1]),type:String(a[2]).toLowerCase(),category:String(a[3]||""),amount:Number(a[4]||0),description:String(a[5]||""),author:String(a[6]||"Bendahara"),createdAt:String(a[7]||"")})}}const o=e.getSheetByName("Log_Aktivitas"),i=[];if(o&&o.getLastRow()>1){const e=o.getRange(2,1,o.getLastRow()-1,6).getValues();for(let t=e.length-1;t>=0&&i.length<100;t--){const a=e[t];a[0]&&i.push({id:String(a[0]),timestamp:String(a[1]),author:String(a[2]),action:String(a[3]),details:String(a[4]),transactionId:String(a[5]||"")})}}return{settings:{orgName:a,initialBalance:n},transactions:s,logs:i}}function addTransactionRow(e){SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Transaksi").appendRow([e.id,e.date,e.type,e.category,Number(e.amount),e.description,e.author,e.createdAt||(new Date).toISOString()])}function updateTransactionRow(e){const t=SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Transaksi"),a=t.getDataRange().getValues();for(let n=1;n<a.length;n++)if(String(a[n][0])===String(e.id))return t.getRange(n+1,2).setValue(e.date),t.getRange(n+1,3).setValue(e.type),t.getRange(n+1,4).setValue(e.category),t.getRange(n+1,5).setValue(Number(e.amount)),t.getRange(n+1,6).setValue(e.description),void t.getRange(n+1,7).setValue(e.author)}function deleteTransactionRow(e){const t=SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Transaksi"),a=t.getDataRange().getValues();for(let n=1;n<a.length;n++)if(String(a[n][0])===String(e))return void t.deleteRow(n+1)}function updateSettingsRow(e){const t=SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Pengaturan"),a=t.getDataRange().getValues();let n=!1,r=!1;for(let s=1;s<a.length;s++)"nama_organisasi"===a[s][0]&&(t.getRange(s+1,2).setValue(e.orgName),n=!0),"saldo_awal"===a[s][0]&&(t.getRange(s+1,2).setValue(Number(e.initialBalance)),r=!0);n||t.appendRow(["nama_organisasi",e.orgName]),r||t.appendRow(["saldo_awal",Number(e.initialBalance)])}function addAuditLog(e,t,a,n){SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Log_Aktivitas").appendRow([Utilities.getUuid(),Utilities.formatDate(new Date,"Asia/Jakarta","yyyy-MM-dd HH:mm:ss"),t,e,a,n||"-"])}function formatDate(e){return e instanceof Date?Utilities.formatDate(e,"Asia/Jakarta","yyyy-MM-dd"):String(e)}function createJsonResponse(e){return ContentService.createTextOutput(JSON.stringify(e)).setMimeType(ContentService.MimeType.JSON)}`;

    navigator.clipboard.writeText(scriptText);
    setCopiedScript(true);
    setTimeout(() => setCopiedScript(false), 2500);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    onSaveUrl(url.trim());
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden flex flex-col max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-emerald-700 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-emerald-800 rounded-lg">
              <FileSpreadsheet className="w-5 h-5 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-base">Hubungkan Google Sheets</h3>
              <p className="text-xs text-emerald-200">Database online gratis, otomatis & transparan</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full hover:bg-white/20 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab selection */}
        <div className="flex border-b border-slate-200 px-6 pt-3 gap-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('url')}
            className={`pb-2 border-b-2 transition-colors ${
              activeTab === 'url' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            URL Database
          </button>
          <button
            onClick={() => setActiveTab('instructions')}
            className={`pb-2 border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === 'instructions' ? 'border-emerald-600 text-emerald-700' : 'border-transparent text-slate-400 hover:text-slate-600'
            }`}
          >
            <HelpCircle className="w-3.5 h-3.5" />
            Panduan Cara Pasang (3 Menit)
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-4 flex-1">
          {activeTab === 'url' ? (
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">
                  URL Google Apps Script Web App
                </label>
                <input
                  type="url"
                  placeholder="https://script.google.com/macros/s/.../exec"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm font-mono text-slate-800 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-emerald-500 focus:outline-none transition-all placeholder:text-slate-400"
                />
                <p className="text-xs text-slate-400 mt-1.5">
                  Tempelkan URL Web App yang didapat setelah Deploy Apps Script.
                </p>
              </div>

              {currentUrl && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between text-xs text-emerald-800">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Database Google Sheet saat ini Terhubung</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setUrl('');
                      onDisconnect();
                    }}
                    className="text-rose-600 hover:text-rose-800 font-semibold flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    Putuskan
                  </button>
                </div>
              )}

              <div className="pt-2 flex gap-2">
                <button
                  type="submit"
                  className="flex-1 py-3 px-4 rounded-xl font-bold text-sm text-white bg-emerald-600 hover:bg-emerald-500 shadow-lg shadow-emerald-600/20 flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                >
                  <Save className="w-4 h-4" />
                  <span>Simpan & Sinkronkan</span>
                </button>
              </div>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setActiveTab('instructions')}
                  className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold underline"
                >
                  Belum punya URL? Lihat panduan buatnya di sini
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4 text-xs text-slate-600">
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">1</span>
                    Buat Google Sheet Baru
                  </p>
                  <p className="text-slate-500">
                    Buka Google Drive atau ketik langsung di browser:
                  </p>
                  <a
                    href="https://sheets.new"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-600 font-bold hover:underline mt-1"
                  >
                    Buka sheets.new <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">2</span>
                    Buka Apps Script & Salin Kode
                  </p>
                  <p className="text-slate-500">
                    Di Google Sheet tersebut, klik menu <b>Ekstensi</b> &gt; <b>Apps Script</b>. Hapus semua teks yang ada, lalu klik tombol di bawah ini:
                  </p>
                  <button
                    type="button"
                    onClick={handleCopyScript}
                    className="w-full py-2.5 px-3 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold flex items-center justify-center gap-2 transition-all active:scale-98 shadow-sm"
                  >
                    {copiedScript ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                    <span>{copiedScript ? 'Kode Berhasil Disalin ke Clipboard!' : 'Salin Kode Google Apps Script'}</span>
                  </button>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-1">
                  <p className="font-bold text-slate-800 flex items-center gap-1.5">
                    <span className="w-5 h-5 rounded-full bg-emerald-600 text-white inline-flex items-center justify-center text-[10px]">3</span>
                    Deploy sebagai Web App
                  </p>
                  <ol className="list-decimal pl-4 space-y-1 text-slate-600 text-[11px]">
                    <li>Klik tombol <b>Terapkan (Deploy)</b> &gt; <b>Penerapan Baru</b>.</li>
                    <li>Pilih jenis roda gigi: <b>Aplikasi Web (Web App)</b>.</li>
                    <li>Ubah <i>Yang memiliki akses (Who has access)</i> menjadi: <b>Siapa saja (Anyone)</b>.</li>
                    <li>Klik <b>Terapkan</b> dan berikan otorisasi akun Google kamu.</li>
                    <li>Salin <b>URL Aplikasi Web</b>, lalu tempelkan ke tab <i>URL Database</i> di atas.</li>
                  </ol>
                </div>
              </div>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};
