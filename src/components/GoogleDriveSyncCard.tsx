import React, { useState } from 'react';
import { 
  Cloud, 
  UploadCloud, 
  DownloadCloud, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  HardDrive, 
  Download, 
  FileJson, 
  Lock,
  ExternalLink,
  ShieldCheck
} from 'lucide-react';
import { 
  SIMSuratBackupData, 
  requestGoogleDriveToken, 
  uploadBackupToGoogleDrive, 
  listGoogleDriveBackups, 
  downloadBackupFromGoogleDrive 
} from '../lib/googleDrive';
import { SuratMasuk, SuratKeluar, KodeKlasifikasi, InstansiConfig, UserAccount } from '../types';

interface GoogleDriveSyncCardProps {
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  kodeKlasifikasiList: KodeKlasifikasi[];
  instansiConfig: InstansiConfig;
  userAccounts: UserAccount[];
  onRestoreData?: (data: SIMSuratBackupData) => Promise<void> | void;
}

export const GoogleDriveSyncCard: React.FC<GoogleDriveSyncCardProps> = ({
  suratMasukList,
  suratKeluarList,
  kodeKlasifikasiList,
  instansiConfig,
  userAccounts,
  onRestoreData,
}) => {
  const [accessToken, setAccessToken] = useState<string | null>(() => {
    return localStorage.getItem('sim_surat_gdrive_token');
  });
  const [isConnecting, setIsConnecting] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(() => {
    return localStorage.getItem('sim_surat_gdrive_last_synced');
  });
  const [lastUploadedFileUrl, setLastUploadedFileUrl] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [driveFiles, setDriveFiles] = useState<Array<{ id: string; name: string; createdTime: string; size: string }>>([]);

  const buildBackupPayload = (): SIMSuratBackupData => {
    return {
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      instansiConfig,
      suratMasukList,
      suratKeluarList,
      kodeKlasifikasiList,
      userAccounts: userAccounts.map(u => ({ ...u, password: '***' })), // sanitize passwords
    };
  };

  const handleConnectDrive = async () => {
    setIsConnecting(true);
    setStatusMessage(null);
    try {
      const token = await requestGoogleDriveToken();
      setAccessToken(token);
      localStorage.setItem('sim_surat_gdrive_token', token);
      setStatusMessage({
        type: 'success',
        text: 'Berhasil terhubung dengan Google Drive akun Anda!'
      });
      fetchDriveFileList(token);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal menghubungkan ke Google Drive. Pastikan izin popup diizinkan.'
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleSyncToDrive = async () => {
    setStatusMessage(null);
    setIsSyncing(true);
    try {
      let currentToken = accessToken;
      if (!currentToken) {
        currentToken = await requestGoogleDriveToken();
        setAccessToken(currentToken);
        localStorage.setItem('sim_surat_gdrive_token', currentToken);
      }

      const payload = buildBackupPayload();
      const result = await uploadBackupToGoogleDrive(currentToken, payload);

      const nowStr = new Date().toLocaleString('id-ID', {
        dateStyle: 'full',
        timeStyle: 'medium'
      });

      setLastSynced(nowStr);
      localStorage.setItem('sim_surat_gdrive_last_synced', nowStr);
      if (result.webViewLink) {
        setLastUploadedFileUrl(result.webViewLink);
      }

      setStatusMessage({
        type: 'success',
        text: `Berhasil mengunggah & menyinkronkan data SIMSURAT ke Google Drive! (${result.name})`
      });

      fetchDriveFileList(currentToken);
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Terjadi kesalahan saat menyinkronkan ke Google Drive.'
      });
    } finally {
      setIsSyncing(false);
    }
  };

  const fetchDriveFileList = async (token?: string) => {
    const tok = token || accessToken;
    if (!tok) return;
    setIsLoadingFiles(true);
    try {
      const files = await listGoogleDriveBackups(tok);
      setDriveFiles(files);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleRestoreFromDrive = async (fileId: string, fileName: string) => {
    if (!accessToken) return;
    if (!window.confirm(`Apakah Anda yakin ingin memulihkan/mengimpor data dari cadangan "${fileName}"? Data saat ini di layar akan diperbarui.`)) {
      return;
    }

    setIsLoadingFiles(true);
    try {
      const data = await downloadBackupFromGoogleDrive(accessToken, fileId);
      if (onRestoreData) {
        await onRestoreData(data);
        setStatusMessage({
          type: 'success',
          text: `Data SIMSURAT berhasil dipulihkan dari berkas Google Drive: ${fileName}`
        });
      }
    } catch (err: any) {
      console.error(err);
      setStatusMessage({
        type: 'error',
        text: err.message || 'Gagal memulihkan data dari Google Drive.'
      });
    } finally {
      setIsLoadingFiles(false);
    }
  };

  const handleLocalDownload = () => {
    const payload = buildBackupPayload();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(payload, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute('download', `SIMSURAT_Backup_Lokal_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-xl border border-slate-800 space-y-5">
      {/* Master Blueprint & Remix Notice Banner */}
      <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-indigo-950/80 p-4 rounded-xl border border-amber-500/30 text-xs space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-1 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] rounded-full font-extrabold uppercase tracking-wider flex items-center gap-1">
              👑 Versi Master SIMSURAT
            </span>
            <span className="text-slate-300 font-bold">Panduan Pengembang (Remix / Duplikasi Project)</span>
          </div>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Aplikasi ini disetting sebagai <strong className="text-amber-300">Aplikasi Master Resmi</strong>. Jika di masa depan aplikasi ini <strong className="text-white">diremix atau diduplikasi</strong> untuk instansi/unit lain, pastikan untuk mengikuti 2 aturan wajib sebelum melakukan <em>deployment</em>:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-1 font-sans text-[11px]">
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-blue-900/80 text-blue-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-blue-700 mt-0.5">1</span>
            <div>
              <p className="font-bold text-blue-300">Database Firebase Khusus:</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Sebelum deploy, buatkan database Firebase tersendiri untuk aplikasi hasil duplikat agar data tidak saling bercampur dengan Master.</p>
            </div>
          </div>
          <div className="bg-slate-950/70 p-2.5 rounded-lg border border-slate-800 flex items-start space-x-2">
            <span className="w-5 h-5 rounded-full bg-emerald-900/80 text-emerald-300 font-bold text-[10px] flex items-center justify-center shrink-0 border border-emerald-700 mt-0.5">2</span>
            <div>
              <p className="font-bold text-emerald-300">Otorisasi Google Drive Direct:</p>
              <p className="text-slate-400 text-[10px] mt-0.5">Langsung hubungkan dan berikan izin akses Google Drive agar sinkronisasi otomatis dan cadangan data tersimpan aman.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-500 to-emerald-500 rounded-xl text-white shadow-lg shadow-blue-500/20">
            <Cloud className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <span>Sinkronisasi Google Drive & Cadangan Data</span>
              <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] rounded-full font-semibold">
                OAuth Active
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Simpan seluruh database surat, disposisi, dan konfigurasi instansi secara otomatis ke Google Drive Anda
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleLocalDownload}
          className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl font-bold text-xs flex items-center space-x-2 transition-all cursor-pointer"
          title="Unduh Salinan JSON ke Komputer"
        >
          <Download className="w-4 h-4 text-emerald-400" />
          <span>Unduh Cadangan (.json)</span>
        </button>
      </div>

      {/* Connection & Status Banner */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
              <HardDrive className="w-4 h-4 text-blue-400" />
              <span>Status Koneksi Drive</span>
            </span>
            {accessToken ? (
              <span className="px-2.5 py-1 bg-emerald-950 text-emerald-400 border border-emerald-800 text-xs rounded-full font-bold flex items-center space-x-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Terhubung</span>
              </span>
            ) : (
              <span className="px-2.5 py-1 bg-amber-950 text-amber-400 border border-amber-800 text-xs rounded-full font-bold flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5" />
                <span>Belum Terhubung</span>
              </span>
            )}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {accessToken
              ? 'Akun Google Drive Anda terhubung. Anda dapat menyinkronkan data kapan saja dengan 1-klik.'
              : 'Hubungkan akun Google Anda untuk menyimpan data cadangan proyek langsung di akun Drive pribadi Anda.'}
          </p>

          <div className="pt-1">
            <button
              type="button"
              onClick={handleConnectDrive}
              disabled={isConnecting}
              className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer disabled:opacity-60"
            >
              {isConnecting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Menghubungkan ke Google...</span>
                </>
              ) : (
                <>
                  <ShieldCheck className="w-4 h-4 text-emerald-300" />
                  <span>{accessToken ? 'Otentikasi Ulang Google Drive' : 'Hubungkan Google Drive Saya'}</span>
                </>
              )}
            </button>
          </div>
        </div>

        <div className="bg-slate-800/80 rounded-xl p-4 border border-slate-700/60 space-y-3 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
                <UploadCloud className="w-4 h-4 text-emerald-400" />
                <span>Sinkronisasi Terakhir</span>
              </span>
            </div>

            <p className="text-xs font-bold text-slate-200">
              {lastSynced ? lastSynced : 'Belum pernah disinkronkan'}
            </p>

            <p className="text-[11px] text-slate-400 mt-1">
              Total Rekaman: <span className="text-emerald-400 font-semibold">{suratMasukList.length}</span> Surat Masuk, <span className="text-blue-400 font-semibold">{suratKeluarList.length}</span> Surat Keluar.
            </p>
          </div>

          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={handleSyncToDrive}
              disabled={isSyncing}
              className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 transition-all shadow-md cursor-pointer"
            >
              {isSyncing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Mengunggah ke Google Drive...</span>
                </>
              ) : (
                <>
                  <UploadCloud className="w-4 h-4" />
                  <span>Sinkronkan Data Sekarang ke Google Drive</span>
                </>
              )}
            </button>

            {lastUploadedFileUrl && (
              <a
                href={lastUploadedFileUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-1 text-[11px] text-blue-400 hover:underline pt-1"
              >
                <span>Buka Berkas Cadangan Terakhir di Google Drive</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Status Messages */}
      {statusMessage && (
        <div
          className={`p-3 rounded-xl border text-xs font-medium flex items-start space-x-2 ${
            statusMessage.type === 'success'
              ? 'bg-emerald-950/80 border-emerald-800 text-emerald-200'
              : statusMessage.type === 'error'
              ? 'bg-rose-950/80 border-rose-800 text-rose-200'
              : 'bg-blue-950/80 border-blue-800 text-blue-200'
          }`}
        >
          {statusMessage.type === 'success' ? (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
          )}
          <span>{statusMessage.text}</span>
        </div>
      )}

      {/* Drive Backups List & Restore */}
      {accessToken && (
        <div className="pt-2 border-t border-slate-800 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-slate-300 flex items-center space-x-2">
              <FileJson className="w-4 h-4 text-amber-400" />
              <span>Daftar Berkas Cadangan SIMSURAT di Google Drive Anda</span>
            </h4>
            <button
              type="button"
              onClick={() => fetchDriveFileList()}
              disabled={isLoadingFiles}
              className="text-slate-400 hover:text-white text-xs flex items-center space-x-1 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoadingFiles ? 'animate-spin' : ''}`} />
              <span>Segarkan</span>
            </button>
          </div>

          {driveFiles.length === 0 ? (
            <div className="text-center py-4 bg-slate-800/40 rounded-xl border border-slate-800 text-slate-500 text-xs">
              Belum ada berkas cadangan SIMSURAT di Google Drive Anda. Klik "Sinkronkan Data Sekarang" di atas.
            </div>
          ) : (
            <div className="max-h-48 overflow-y-auto space-y-2 pr-1">
              {driveFiles.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between p-2.5 bg-slate-800/80 hover:bg-slate-800 rounded-xl border border-slate-700/60 transition-all text-xs"
                >
                  <div className="min-w-0 pr-2">
                    <p className="font-semibold text-slate-200 truncate">{file.name}</p>
                    <p className="text-[10px] text-slate-400">
                      Dibuat pada: {new Date(file.createdTime).toLocaleString('id-ID')}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRestoreFromDrive(file.id, file.name)}
                    className="px-3 py-1.5 bg-blue-600/80 hover:bg-blue-600 text-white rounded-lg font-bold text-[11px] flex items-center space-x-1 shrink-0 cursor-pointer transition-all"
                  >
                    <DownloadCloud className="w-3.5 h-3.5" />
                    <span>Pulihkan Data</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
