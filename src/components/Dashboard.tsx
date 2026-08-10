import React from 'react';
import { SuratMasuk, SuratKeluar, UserRole, ActiveTab, UserAccount, AppUserRole } from '../types';
import { 
  Inbox, 
  Send, 
  GitFork, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  Plus, 
  ArrowRight, 
  FileText,
  Calendar,
  ShieldAlert,
  User,
  ArrowUpRight,
  Eye,
  Sliders
} from 'lucide-react';

interface DashboardProps {
  suratMasukList: SuratMasuk[];
  suratKeluarList: SuratKeluar[];
  userRole: UserRole;
  currentUser?: UserAccount | null;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenSuratMasukDetail: (surat: SuratMasuk) => void;
  onOpenSuratKeluarDetail: (surat: SuratKeluar) => void;
  onOpenCreateDisposisi: (surat: SuratMasuk) => void;
  onNewSuratMasuk: () => void;
  onNewSuratKeluar: () => void;
}

export const Dashboard: React.FC<DashboardProps> = ({
  suratMasukList,
  suratKeluarList,
  userRole,
  currentUser,
  setActiveTab,
  onOpenSuratMasukDetail,
  onOpenSuratKeluarDetail,
  onOpenCreateDisposisi,
  onNewSuratMasuk,
  onNewSuratKeluar,
}) => {
  // Stats Calculations
  const totalMasuk = suratMasukList.length;
  const totalKeluar = suratKeluarList.length;
  const totalDisposisi = suratMasukList.reduce((acc, curr) => acc + curr.disposisiList.length, 0);
  
  const pendingMasuk = suratMasukList.filter(s => s.status === 'Menunggu').length;
  const didisposisiMasuk = suratMasukList.filter(s => s.status === 'Didisposisi').length;
  const selesaiMasuk = suratMasukList.filter(s => s.status === 'Selesai').length;

  const ttdKeluar = suratKeluarList.filter(s => s.status === 'Pengajuan TTD').length;
  const terkirimKeluar = suratKeluarList.filter(s => s.status === 'Terkirim').length;

  // Urgent / High priority letters
  const pentingCount = suratMasukList.filter(s => s.sifatSurat === 'Penting' || s.sifatSurat === 'Sangat Penting').length;

  return (
    <div className="space-y-6">
      
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white rounded-2xl p-6 shadow-lg relative overflow-hidden">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-blue-200 text-xs font-semibold uppercase tracking-wider mb-1 flex-wrap gap-y-1">
              <Calendar className="w-3.5 h-3.5" />
              <span>Sistem Manajemen Tata Naskah Dinas & Disposisi</span>
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[10px] rounded-full font-bold uppercase tracking-normal">
                👑 Versi Master (Paten)
              </span>
            </div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight flex items-center space-x-2">
              <span>Selamat Datang, {currentUser?.name || 'Pengguna Aplikasi'}</span>
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl">
              Level Akses: <span className="font-bold text-yellow-300 uppercase">{userRole}</span> — {currentUser?.jabatan || 'Sistem Agenda Persuratan Instansi'}.
            </p>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            {userRole !== 'user' ? (
              <>
                <button
                  onClick={onNewSuratMasuk}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow-md transition-all border border-blue-400/30 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Surat Masuk Baru</span>
                </button>
                <button
                  onClick={onNewSuratKeluar}
                  className="inline-flex items-center space-x-1.5 px-4 py-2 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-xl backdrop-blur-sm transition-all border border-white/20 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>Surat Keluar</span>
                </button>
              </>
            ) : (
              <div className="px-3.5 py-2 bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center space-x-2">
                <Eye className="w-4 h-4" />
                <span>Modus User (Pelihat / Read-Only)</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Developer Master Notice & Remix Instructions */}
      <div className="bg-slate-900 text-white rounded-xl p-4 border border-slate-800 shadow-md text-xs space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="font-bold text-slate-200">Petunjuk Pengembang & Integrasi Sistem (Master Application)</span>
          </div>
          <button
            onClick={() => {
              setActiveTab('pengaturan');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-[11px] text-blue-400 hover:underline font-semibold"
          >
            Kelola Pengaturan & Google Drive →
          </button>
        </div>
        <p className="text-slate-300 text-[11px] leading-relaxed">
          Sistem ini berjalan pada mode <strong className="text-amber-300">Aplikasi Master SIMSURAT</strong>. Bagi pengembang yang akan melakukan <strong className="text-white">remix / duplikasi project</strong> di masa mendatang:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-[11px]">
          <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-start space-x-2">
            <span className="text-blue-400 font-bold shrink-0">1.</span>
            <span className="text-slate-300">
              <strong>Database Tersendiri:</strong> Sebelum deploy, pengembang wajib membuatkan database Firebase tersendiri untuk versi duplikat agar data persuratan terisolasi.
            </span>
          </div>
          <div className="p-2.5 bg-slate-800/80 rounded-lg border border-slate-700/60 flex items-start space-x-2">
            <span className="text-emerald-400 font-bold shrink-0">2.</span>
            <span className="text-slate-300">
              <strong>Otorisasi Google Drive:</strong> Pengguna langsung diarahkan memberikan akses Google Drive untuk sinkronisasi otomatis naskah dan cadangan.
            </span>
          </div>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Card 1: Surat Masuk */}
        <div 
          onClick={() => {
            setActiveTab('surat-masuk');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-blue-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-blue-600 transition-colors">
              Surat Masuk
            </span>
            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Inbox className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalMasuk}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
              {pendingMasuk} Menunggu Disposisi
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span><span className="font-semibold text-slate-700">{didisposisiMasuk}</span> didisposisi • <span className="font-semibold text-slate-700">{selesaiMasuk}</span> selesai</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* Card 2: Surat Keluar */}
        <div 
          onClick={() => {
            setActiveTab('surat-keluar');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-emerald-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-emerald-600 transition-colors">
              Surat Keluar
            </span>
            <div className="w-9 h-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:bg-emerald-600 group-hover:text-white transition-all">
              <Send className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalKeluar}</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200">
              {ttdKeluar} Pengajuan TTD
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span><span className="font-semibold text-slate-700">{terkirimKeluar}</span> telah terkirim resmi</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* Card 3: Total Disposisi */}
        <div 
          onClick={() => {
            setActiveTab('disposisi');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-amber-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-amber-600 transition-colors">
              Total Disposisi
            </span>
            <div className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center group-hover:bg-amber-600 group-hover:text-white transition-all">
              <GitFork className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-slate-900">{totalDisposisi}</span>
            <span className="text-xs font-semibold text-amber-700">
              Instruksi Pimpinan
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Buka lembar disposisi digital</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

        {/* Card 4: Surat Sifat Penting */}
        <div 
          onClick={() => {
            setActiveTab('surat-masuk');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm hover:shadow-md hover:border-red-400 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider group-hover:text-red-600 transition-colors">
              Atensi Khusus
            </span>
            <div className="w-9 h-9 rounded-lg bg-red-50 text-red-600 flex items-center justify-center group-hover:bg-red-600 group-hover:text-white transition-all">
              <ShieldAlert className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline justify-between">
            <span className="text-2xl font-bold text-red-600">{pentingCount}</span>
            <span className="text-xs font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded-full border border-red-200">
              Penting / Rahasia
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-2 flex items-center justify-between">
            <span>Perlu tindak lanjut segera</span>
            <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-red-600 group-hover:translate-x-1 transition-all" />
          </p>
        </div>

      </div>

      {/* Main Grid: Recent Incoming Letters & Disposisi Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Agenda Surat Masuk Terbaru */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Inbox className="w-4 h-4 text-blue-600" />
                <span>Surat Masuk Terbaru</span>
              </h2>
              <p className="text-xs text-slate-500">Daftar agenda naskah masuk yang membutuhkan proses</p>
            </div>
            <button
              onClick={() => setActiveTab('surat-masuk')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center space-x-1"
            >
              <span>Lihat Semua</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {suratMasukList.slice(0, 4).map((surat) => (
              <div
                key={surat.id}
                className="p-3.5 rounded-lg border border-slate-100 hover:border-blue-200 hover:bg-slate-50 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                    <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                      {surat.noAgenda}
                    </span>
                    <span className="text-xs text-slate-500 font-mono">
                      No: {surat.noSurat}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      surat.sifatSurat === 'Sangat Penting' || surat.sifatSurat === 'Penting'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      {surat.sifatSurat}
                    </span>
                    <span className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                      surat.status === 'Menunggu'
                        ? 'bg-amber-100 text-amber-800'
                        : surat.status === 'Didisposisi'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-emerald-100 text-emerald-800'
                    }`}>
                      {surat.status}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 line-clamp-1">
                    {surat.perihal}
                  </h3>
                  <p className="text-xs text-slate-500 line-clamp-1">
                    <span className="font-medium text-slate-700">Pengirim:</span> {surat.pengirim}
                  </p>
                </div>

                <div className="flex items-center space-x-2 shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => onOpenSuratMasukDetail(surat)}
                    className="px-2.5 py-1 text-xs font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 rounded-md transition-colors"
                  >
                    Detail
                  </button>
                  {userRole !== 'user' && surat.status === 'Menunggu' && (
                    <button
                      onClick={() => onOpenCreateDisposisi(surat)}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors flex items-center space-x-1 cursor-pointer"
                    >
                      <GitFork className="w-3 h-3" />
                      <span>Disposisi</span>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column (1 col): Surat Keluar & Status Flow */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-emerald-600" />
                <span>Surat Keluar Terbaru</span>
              </h2>
              <p className="text-xs text-slate-500">Draft & persetujuan naskah keluar</p>
            </div>
            <button
              onClick={() => setActiveTab('surat-keluar')}
              className="text-xs font-semibold text-blue-600 hover:text-blue-700"
            >
              Lihat
            </button>
          </div>

          <div className="space-y-3">
            {suratKeluarList.slice(0, 3).map((surat) => (
              <div
                key={surat.id}
                onClick={() => onOpenSuratKeluarDetail(surat)}
                className="p-3 rounded-lg border border-slate-100 hover:bg-slate-50 cursor-pointer transition-all space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-700">{surat.noAgenda}</span>
                  <span className={`font-semibold px-2 py-0.5 rounded-full text-[10px] ${
                    surat.status === 'Disetujui' || surat.status === 'Terkirim'
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-indigo-100 text-indigo-800'
                  }`}>
                    {surat.status}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-900 line-clamp-1">{surat.perihal}</h4>
                <p className="text-[11px] text-slate-500 line-clamp-1">Kepada: {surat.tujuan}</p>
              </div>
            ))}
          </div>

          {/* User Role Quick Info Box */}
          <div className="pt-3 border-t border-slate-100 bg-slate-50 p-3 rounded-lg border border-slate-200 text-xs space-y-1">
            <div className="flex items-center space-x-1.5 text-slate-700 font-bold">
              <User className="w-3.5 h-3.5 text-blue-600" />
              <span>Panduan Akses Role: {userRole}</span>
            </div>
            <p className="text-slate-500 text-[11px]">
              {userRole === 'superadmin' 
                ? 'Hak Akses Penuh (Superadmin): Dapat mengelola user, menambah, mengedit, dan menghapus seluruh data.' 
                : userRole === 'admin'
                ? 'Hak Akses Administrator: Dapat menambah dan mengedit agenda surat masuk, keluar, dan disposisi.'
                : userRole === 'operator'
                ? 'Hak Akses Operator: Dapat menginput agenda surat masuk dan keluar.'
                : 'Hak Akses Pelihat: Hanya dapat membaca dan mencetak naskah tanpa fitur ubah data.'}
            </p>
          </div>

        </div>

      </div>

    </div>
  );
};
