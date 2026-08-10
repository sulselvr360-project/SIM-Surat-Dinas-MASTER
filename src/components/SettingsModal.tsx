import React, { useState, useEffect } from 'react';
import { InstansiConfig, AppUserRole, SuratMasuk, SuratKeluar, KodeKlasifikasi, UserAccount } from '../types';
import { compressImageFile, compressDataUrl } from '../utils/imageUtils';
import { 
  Building, 
  Save, 
  Image, 
  UserCheck, 
  CheckCircle2, 
  Hash, 
  FileCode, 
  ArrowLeft, 
  GitFork, 
  Plus, 
  Trash2, 
  Edit2, 
  RotateCcw, 
  Check, 
  Upload, 
  Eye, 
  ShieldAlert, 
  AlertTriangle,
  RefreshCw
} from 'lucide-react';
import { DEFAULT_TUJUAN_DISPOSISI } from '../data/initialData';

const PRESET_LOGOS = [
  {
    id: 'sulsel',
    title: 'Pemprov Sulsel',
    desc: 'Perisai Hijau & Emas',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240"><path d="M100 10 L180 50 L180 150 C180 190 100 230 100 230 C100 230 20 190 20 150 L20 50 Z" fill="%230b6e4f" stroke="%23f4c430" stroke-width="8"/><path d="M100 25 L165 58 L165 145 C165 178 100 212 100 212 C100 212 35 178 35 145 L35 58 Z" fill="%2309533c"/><polygon points="100,45 107,66 130,66 111,80 118,101 100,88 82,101 89,80 70,66 93,66" fill="%23f4c430"/><path d="M60 120 C70 110 130 110 140 120 L135 150 C120 160 80 160 65 150 Z" fill="%23ffffff" stroke="%231e3a8a" stroke-width="3"/><path d="M100 110 L100 160 M75 140 L125 140" stroke="%23b91c1c" stroke-width="4"/><path d="M45 170 Q100 195 155 170" fill="none" stroke="%23f4c430" stroke-width="6"/></svg>'
  },
  {
    id: 'garuda',
    title: 'Garuda Pancasila',
    desc: 'Lambang Negara Emas',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 220" width="200" height="220"><path d="M100 20 Q120 40 140 40 Q160 20 180 50 Q160 80 170 120 Q130 130 100 190 Q70 130 30 120 Q40 80 20 50 Q40 20 60 40 Q80 40 100 20 Z" fill="%23d97706" stroke="%23b45309" stroke-width="4"/><path d="M75 80 L125 80 L125 130 L75 130 Z" fill="%23b91c1c" stroke="%23ffffff" stroke-width="3"/><polygon points="100,90 103,98 112,98 105,103 108,111 100,106 92,111 95,103 88,98 97,98" fill="%23f59e0b"/><path d="M60 155 Q100 170 140 155" fill="none" stroke="%23ffffff" stroke-width="6"/><text x="100" y="163" font-family="sans-serif" font-weight="bold" font-size="8" fill="%231e293b" text-anchor="middle">BHINNEKA TUNGGAL IKA</text></svg>'
  },
  {
    id: 'pemda',
    title: 'Pemda / Kota / Kab',
    desc: 'Perisai Biru Bintang',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240"><path d="M100 10 L180 45 L180 145 C180 190 100 230 100 230 C100 230 20 190 20 145 L20 45 Z" fill="%231e3a8a" stroke="%23f59e0b" stroke-width="7"/><polygon points="100,35 106,52 124,52 109,63 115,80 100,70 85,80 91,63 76,52 94,52" fill="%23f59e0b"/><path d="M50 110 Q100 80 150 110 L140 170 Q100 200 60 170 Z" fill="%23059669"/><path d="M80 120 L120 120 L115 160 L85 160 Z" fill="%23ffffff"/><text x="100" y="145" font-family="sans-serif" font-weight="bold" font-size="12" fill="%231e3a8a" text-anchor="middle">PEMDA</text></svg>'
  },
  {
    id: 'kementerian',
    title: 'Kementerian / Lembaga',
    desc: 'Segel Bulat Hijau',
    url: 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 240" width="200" height="240"><circle cx="100" cy="120" r="95" fill="%23065f46" stroke="%23f59e0b" stroke-width="6"/><circle cx="100" cy="120" r="82" fill="%23047857"/><polygon points="100,50 107,70 128,70 111,83 117,103 100,90 83,103 89,83 72,70 93,70" fill="%23f59e0b"/><path d="M55 130 C70 110 130 110 145 130 L135 170 C120 180 80 180 65 170 Z" fill="%23ffffff"/><text x="100" y="155" font-family="sans-serif" font-weight="bold" font-size="11" fill="%23065f46" text-anchor="middle">INSTANSI</text></svg>'
  }
];

interface SettingsModalProps {
  instansiConfig: InstansiConfig;
  userRole?: AppUserRole;
  suratMasukList?: SuratMasuk[];
  suratKeluarList?: SuratKeluar[];
  kodeKlasifikasiList?: KodeKlasifikasi[];
  userAccounts?: UserAccount[];
  onSaveConfig: (config: InstansiConfig) => Promise<void> | void;
  onNavigateToDashboard?: () => void;
  onRestoreData?: (data: SIMSuratBackupData) => Promise<void> | void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  instansiConfig,
  userRole,
  suratMasukList = [],
  suratKeluarList = [],
  kodeKlasifikasiList = [],
  userAccounts = [],
  onSaveConfig,
  onNavigateToDashboard,
  onRestoreData,
}) => {
  if (userRole === 'user' || userRole === 'operator') {
    return (
      <div className="max-w-xl mx-auto my-12 p-8 bg-white rounded-2xl shadow-sm border border-slate-200 text-center space-y-4">
        <div className="w-16 h-16 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center mx-auto">
          <ShieldAlert className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-slate-900">Akses Terbatas</h2>
        <p className="text-xs text-slate-600 max-w-md mx-auto leading-relaxed">
          Akun Anda terdaftar sebagai <span className="font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">{userRole === 'operator' ? 'OPERATOR' : 'PELIHAT (Read-Only)'}</span>. Pengaturan Profil Instansi hanya dapat diakses oleh Admin atau Superadmin.
        </p>
        {onNavigateToDashboard && (
          <div className="pt-2">
            <button
              onClick={onNavigateToDashboard}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl text-xs transition-all shadow-md cursor-pointer"
            >
              Kembali ke Dashboard
            </button>
          </div>
        )}
      </div>
    );
  }
  const [form, setForm] = useState<InstansiConfig>({
    kodeSandiInstansi: 'DISKOMINFO-SS',
    formatNomorSuratKeluar: '{kode}/{no}/{instansi}/{tahun}',
    formatNomorSuratMasuk: '{no}/SM/{tahun}',
    daftarTujuanDisposisi: DEFAULT_TUJUAN_DISPOSISI,
    ...instansiConfig,
  });

  useEffect(() => {
    if (instansiConfig) {
      setForm((prev) => ({
        ...prev,
        ...instansiConfig,
      }));
    }
  }, [instansiConfig]);

  const [isSaving, setIsSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newTujuanInput, setNewTujuanInput] = useState('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState('');
  const [imageError, setImageError] = useState(false);

  const handleChange = (field: keyof InstansiConfig, value: any) => {
    if (field === 'logoUrl') {
      setImageError(false);
    }
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Silakan pilih file gambar (PNG, JPG, WEBP, atau SVG)!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Ukuran file maksimal 10 MB!');
      return;
    }

    try {
      const compressedDataUrl = await compressImageFile(file, 300, 300, 0.75);
      handleChange('logoUrl', compressedDataUrl);
    } catch (err) {
      console.error('Failed compressing image:', err);
      alert('Gagal memproses gambar logo!');
    }
  };

  const handleAddTujuan = () => {
    if (!newTujuanInput.trim()) return;
    const currentList = form.daftarTujuanDisposisi || DEFAULT_TUJUAN_DISPOSISI;
    if (currentList.includes(newTujuanInput.trim())) {
      alert('Tujuan disposisi ini sudah ada di dalam daftar!');
      return;
    }
    setForm((prev) => ({
      ...prev,
      daftarTujuanDisposisi: [...currentList, newTujuanInput.trim()],
    }));
    setNewTujuanInput('');
  };

  const handleDeleteTujuan = (indexToDelete: number) => {
    const currentList = form.daftarTujuanDisposisi || DEFAULT_TUJUAN_DISPOSISI;
    if (currentList.length <= 1) {
      alert('Minimal harus ada 1 tujuan disposisi!');
      return;
    }
    setForm((prev) => ({
      ...prev,
      daftarTujuanDisposisi: currentList.filter((_, idx) => idx !== indexToDelete),
    }));
    if (editingIndex === indexToDelete) {
      setEditingIndex(null);
    }
  };

  const handleStartEdit = (index: number, text: string) => {
    setEditingIndex(index);
    setEditingText(text);
  };

  const handleSaveEdit = (index: number) => {
    if (!editingText.trim()) return;
    const currentList = [...(form.daftarTujuanDisposisi || DEFAULT_TUJUAN_DISPOSISI)];
    currentList[index] = editingText.trim();
    setForm((prev) => ({
      ...prev,
      daftarTujuanDisposisi: currentList,
    }));
    setEditingIndex(null);
    setEditingText('');
  };

  const handleResetDefaultTujuan = () => {
    if (confirm('Kembalikan daftar tujuan disposisi ke pengaturan standar?')) {
      setForm((prev) => ({
        ...prev,
        daftarTujuanDisposisi: DEFAULT_TUJUAN_DISPOSISI,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      let finalForm = form;
      if (form.logoUrl && form.logoUrl.startsWith('data:image/') && !form.logoUrl.startsWith('data:image/svg+xml')) {
        const compressedLogo = await compressDataUrl(form.logoUrl, 300, 300, 0.75);
        finalForm = { ...form, logoUrl: compressedLogo };
      }
      await onSaveConfig(finalForm);
      setSaved(true);
      
      // Redirect to dashboard after saving
      setTimeout(() => {
        setSaved(false);
        if (onNavigateToDashboard) {
          onNavigateToDashboard();
        }
      }, 1000);
    } catch (err) {
      console.error('Error saving settings:', err);
      alert('Gagal menyimpan perubahan ke Firestore database.');
    } finally {
      setIsSaving(false);
    }
  };

  // Live preview helpers for number formats
  const sampleYear = new Date().getFullYear().toString();
  const sampleKeluarPreview = (form.formatNomorSuratKeluar || '{kode}/{no}/{instansi}/{tahun}')
    .replace('{kode}', '005')
    .replace('{no}', '012')
    .replace('{instansi}', form.kodeSandiInstansi || 'DISKOMINFO')
    .replace('{tahun}', sampleYear);

  const sampleMasukPreview = (form.formatNomorSuratMasuk || '{no}/SM/{tahun}')
    .replace('{kode}', '800')
    .replace('{no}', '008')
    .replace('{instansi}', form.kodeSandiInstansi || 'DISKOMINFO')
    .replace('{tahun}', sampleYear);

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      
      {/* Header */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Profil & Pengaturan Kop Surat Instansi</h1>
            <p className="text-xs text-slate-500">Konfigurasi identitas dinas, logo daerah, pejabat, dan format kodefikasi nomor surat</p>
          </div>
        </div>

        {saved && (
          <div className="flex items-center space-x-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-3.5 py-2 rounded-lg border border-emerald-200 animate-in fade-in">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>Pengaturan Disimpan & Kembali ke Dashboard...</span>
          </div>
        )}
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-6 text-xs">
        
        {/* Identitas Instansi */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <Building className="w-4 h-4 text-blue-600" />
            <span>1. Identitas Organisasi / Pemerintah Daerah</span>
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Induk Instansi / Pemerintah *</label>
              <input
                type="text"
                value={form.namaInstansi}
                onChange={(e) => handleChange('namaInstansi', e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Nama Dinas / Badan / OPD *</label>
              <input
                type="text"
                value={form.subNama}
                onChange={(e) => handleChange('subNama', e.target.value)}
                required
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
            <div>
              <label className="block font-bold text-slate-700 mb-1">Telepon Office</label>
              <input
                type="text"
                value={form.telepon}
                onChange={(e) => handleChange('telepon', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Email Resmi</label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleChange('email', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 mb-1">Website Resmi</label>
              <input
                type="text"
                value={form.website}
                onChange={(e) => handleChange('website', e.target.value)}
                className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="mt-4">
            <label className="block font-bold text-slate-700 mb-1">Alamat Kantor Lengkap & Kode Pos *</label>
            <input
              type="text"
              value={form.alamat}
              onChange={(e) => handleChange('alamat', e.target.value)}
              required
              className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Logo Daerah / Instansi & Live Preview Kop Surat */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Image className="w-4 h-4 text-blue-600" />
              <span>2. Logo Daerah / Instansi & Pratinjau Kop Surat</span>
            </div>
            <span className="text-[11px] text-slate-500 font-normal">
              Pilih preset, upload file dari komputer, atau masukkan link URL
            </span>
          </h2>

          <div className="space-y-5">
            
            {/* Options Grid: Presets & Upload */}
            <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
              
              {/* Preset Logos Selector */}
              <div>
                <label className="block font-bold text-slate-700 mb-2">Pilih Lambang / Logo Bawaan Instansi:</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {PRESET_LOGOS.map((preset) => {
                    const isSelected = form.logoUrl === preset.url;
                    return (
                      <button
                        key={preset.id}
                        type="button"
                        onClick={() => handleChange('logoUrl', preset.url)}
                        className={`p-2.5 rounded-xl border text-left flex flex-col items-center justify-center space-y-1.5 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 border-blue-600 ring-2 ring-blue-500/30 shadow-xs'
                            : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-100/80'
                        }`}
                      >
                        <div className="w-10 h-10 flex items-center justify-center p-0.5">
                          <img
                            src={preset.url}
                            alt={preset.title}
                            className="max-w-full max-h-full object-contain"
                          />
                        </div>
                        <div className="text-center">
                          <p className={`text-[11px] font-bold ${isSelected ? 'text-blue-900' : 'text-slate-800'}`}>
                            {preset.title}
                          </p>
                          <p className="text-[9px] text-slate-500">{preset.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Upload & Manual URL Inputs */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200">
                
                {/* File Upload Button */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Upload File Logo dari Komputer:</label>
                  <label className="flex items-center justify-center space-x-2 w-full p-2.5 bg-white border-2 border-dashed border-slate-300 hover:border-blue-500 hover:bg-blue-50/50 rounded-xl cursor-pointer transition-all text-xs font-bold text-slate-700">
                    <Upload className="w-4 h-4 text-blue-600" />
                    <span>Pilih File Gambar (PNG, JPG, SVG)</span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                  <p className="text-[10px] text-slate-500 mt-1">Mendukung format PNG transparan, JPG, dan SVG (Maks. 5MB)</p>
                </div>

                {/* Custom URL Input */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Atau Salin Link / URL Gambar Online:</label>
                  <input
                    type="text"
                    value={form.logoUrl}
                    onChange={(e) => handleChange('logoUrl', e.target.value)}
                    placeholder="https://domain.com/logo.png atau data:image/..."
                    className="w-full p-2.5 bg-white border border-slate-200 rounded-xl text-xs font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                  {form.logoUrl && (
                    <button
                      type="button"
                      onClick={() => handleChange('logoUrl', '')}
                      className="text-[10px] text-rose-600 hover:underline mt-1 font-semibold block"
                    >
                      Hapus URL Logo
                    </button>
                  )}
                </div>

              </div>

              {/* Error Warning if URL Broken */}
              {imageError && (
                <div className="p-3 bg-amber-50 border border-amber-300 rounded-xl flex items-start space-x-2 text-amber-900 text-xs">
                  <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-bold">Gambar Logo dari URL tidak dapat dimuat atau diblokir (CORS / Hotlink Restriction).</p>
                    <p className="text-[11px] mt-0.5">
                      Saran: Silakan klik salah satu <strong>Logo Bawaan</strong> di atas, atau klik tombol <strong>Pilih File Gambar</strong> untuk mengupload file dari komputer Anda.
                    </p>
                  </div>
                </div>
              )}

            </div>

            {/* REAL-TIME LIVE KOP SURAT PREVIEW BOX */}
            <div className="bg-white p-5 rounded-xl border-2 border-slate-300 shadow-sm relative overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-100">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-blue-600" />
                  <span>Pratinjau Kertas Kop Surat Resmi Instansi (Real-Time Preview)</span>
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 font-bold px-2 py-0.5 rounded">
                  Ukuran Standar Naskah Dinas
                </span>
              </div>

              {/* KOP SURAT MOCKUP */}
              <div className="border-b-4 border-double border-slate-900 pb-3 flex items-center justify-center space-x-4 text-center">
                
                {/* Logo Container */}
                <div className="w-16 h-16 shrink-0 flex items-center justify-center">
                  {form.logoUrl && !imageError ? (
                    <img
                      src={form.logoUrl}
                      alt="Logo Instansi"
                      className="max-w-full max-h-16 object-contain drop-shadow-xs"
                      referrerPolicy="no-referrer"
                      onError={() => setImageError(true)}
                    />
                  ) : (
                    <div className="w-16 h-16 rounded-xl bg-slate-100 border-2 border-dashed border-slate-300 text-slate-400 flex flex-col items-center justify-center p-1 text-[9px] font-bold">
                      <ShieldAlert className="w-6 h-6 text-slate-400" />
                      <span>NO LOGO</span>
                    </div>
                  )}
                </div>

                {/* Kop Surat Header Text */}
                <div className="font-sans">
                  <h2 className="font-bold text-xs sm:text-sm tracking-wide text-slate-900 uppercase">
                    {form.namaInstansi || 'PEMERINTAH PROVINSI SULAWESI SELATAN'}
                  </h2>
                  <h1 className="font-black text-sm sm:text-base text-slate-950 uppercase tracking-tight">
                    {form.subNama || 'DINAS KOMUNIKASI, INFORMATIKA, STATISTIK DAN PERSANDIAN'}
                  </h1>
                  <p className="text-[10px] text-slate-600 mt-0.5">
                    {form.alamat || 'Jl. H. Baddare Daeng Sitaba No. 27, Makassar 90245'} | Telp: {form.telepon || '(0411) 453123'}
                  </p>
                  <p className="text-[10px] text-slate-600">
                    Email: {form.email || 'diskominfo@sulselprov.go.id'} | Web: {form.website || 'https://diskominfo.sulselprov.go.id'}
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>

        {/* Pejabat Penandatangan & Petugas Agendaris */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <UserCheck className="w-4 h-4 text-blue-600" />
            <span>3. Pejabat Penandatangan & Petugas Agendaris / Pengelola Surat</span>
          </h2>

          <div className="space-y-4">
            <div>
              <p className="font-bold text-slate-800 text-xs mb-2">a. Pejabat Utama Penandatangan Naskah Dinas</p>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Jabatan Pimpinan *</label>
                  <input
                    type="text"
                    value={form.jabatanKepala}
                    onChange={(e) => handleChange('jabatanKepala', e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-semibold focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap & Gelar *</label>
                  <input
                    type="text"
                    value={form.namaKepala}
                    onChange={(e) => handleChange('namaKepala', e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP Pimpinan *</label>
                  <input
                    type="text"
                    value={form.nipKepala}
                    onChange={(e) => handleChange('nipKepala', e.target.value)}
                    required
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-100">
              <p className="font-bold text-slate-800 text-xs mb-2">b. Petugas Agendaris / Pengelola Surat (Buku Agenda & Register)</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Nama Lengkap Petugas Agendaris / Pengelola Surat</label>
                  <input
                    type="text"
                    value={form.namaAgendaris || ''}
                    onChange={(e) => handleChange('namaAgendaris', e.target.value)}
                    placeholder="Contoh: Hj. St. Rosdiana, S.Sos., M.AP."
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">NIP Petugas Agendaris / Pengelola Surat</label>
                  <input
                    type="text"
                    value={form.nipAgendaris || ''}
                    onChange={(e) => handleChange('nipAgendaris', e.target.value)}
                    placeholder="Contoh: 19780415 200501 2 004"
                    className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg font-mono focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* BARU: Kodefikasi & Format Penomoran Surat */}
        <div>
          <h2 className="text-sm font-bold text-slate-900 border-b border-slate-200 pb-2 mb-4 flex items-center gap-2">
            <Hash className="w-4 h-4 text-blue-600" />
            <span>4. Pengaturan Kodefikasi & Format Penomoran Surat</span>
          </h2>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            
            {/* Tag Explanation */}
            <div className="bg-blue-50/60 p-3 rounded-lg border border-blue-200 text-blue-900 text-[11px] space-y-1">
              <p className="font-bold flex items-center gap-1">
                <FileCode className="w-3.5 h-3.5 text-blue-600" />
                <span>Petunjuk Tag Otomatis Format Nomor Surat:</span>
              </p>
              <div className="flex flex-wrap gap-2 pt-1 font-mono text-[10px]">
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold text-blue-800">{`{kode}`} : Kode Klasifikasi</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold text-blue-800">{`{no}`} : Nomor Urut Agenda</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold text-blue-800">{`{instansi}`} : Singkatan / Kode Sandi</span>
                <span className="bg-white px-2 py-0.5 rounded border border-blue-200 font-bold text-blue-800">{`{tahun}`} : Tahun Anggaran</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block font-bold text-slate-700 mb-1">Kode Sandi / Singkatan Instansi *</label>
                <input
                  type="text"
                  value={form.kodeSandiInstansi || ''}
                  onChange={(e) => handleChange('kodeSandiInstansi', e.target.value)}
                  placeholder="Contoh: DISKOMINFO-SS"
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-mono font-bold text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Format Penomoran Surat Keluar *</label>
                <input
                  type="text"
                  value={form.formatNomorSuratKeluar || ''}
                  onChange={(e) => handleChange('formatNomorSuratKeluar', e.target.value)}
                  placeholder="Contoh: {kode}/{no}/{instansi}/{tahun}"
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Format Agenda Surat Masuk *</label>
                <input
                  type="text"
                  value={form.formatNomorSuratMasuk || ''}
                  onChange={(e) => handleChange('formatNomorSuratMasuk', e.target.value)}
                  placeholder="Contoh: {no}/SM/{tahun}"
                  required
                  className="w-full p-2.5 bg-white border border-slate-200 rounded-lg font-mono text-slate-900 focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Live Previews */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-slate-200">
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Contoh Hasil Nomor Surat Keluar:</span>
                <span className="font-mono font-bold text-emerald-700 text-sm">{sampleKeluarPreview}</span>
              </div>
              <div className="p-3 bg-white rounded-lg border border-slate-200">
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block mb-0.5">Contoh Hasil Agenda Surat Masuk:</span>
                <span className="font-mono font-bold text-blue-700 text-sm">{sampleMasukPreview}</span>
              </div>
            </div>

          </div>
        </div>

        {/* BARU: Pengaturan & Edit Tujuan Disposisi Surat */}
        <div>
          <div className="flex items-center justify-between border-b border-slate-200 pb-2 mb-4">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <GitFork className="w-4 h-4 text-amber-600" />
              <span>5. Pengaturan & Daftar Tujuan Disposisi Surat</span>
            </h2>
            <button
              type="button"
              onClick={handleResetDefaultTujuan}
              className="text-[11px] font-semibold text-slate-600 hover:text-amber-700 bg-slate-100 hover:bg-amber-50 px-2.5 py-1 rounded-lg transition-colors flex items-center space-x-1 border border-slate-200 cursor-pointer"
              title="Reset ke daftar default instansi"
            >
              <RotateCcw className="w-3 h-3" />
              <span>Reset Default</span>
            </button>
          </div>

          <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-4">
            <p className="text-xs text-slate-600">
              Atur daftar Pejabat / Jabatan / Bidang penerima disposisi surat masuk yang akan tampil pada pilihan lembar disposisi pimpinan.
            </p>

            {/* Input Tambah Tujuan Baru */}
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={newTujuanInput}
                onChange={(e) => setNewTujuanInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddTujuan();
                  }
                }}
                placeholder="Tambah Jabatan / Bidang baru (contoh: Kepala Subbagian Hukmas)..."
                className="flex-1 p-2.5 bg-white border border-slate-200 rounded-lg text-xs font-semibold text-slate-900 focus:ring-2 focus:ring-amber-500"
              />
              <button
                type="button"
                onClick={handleAddTujuan}
                className="px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs rounded-lg transition-all flex items-center space-x-1 shrink-0 shadow-sm cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>Tambah Tujuan</span>
              </button>
            </div>

            {/* List Tujuan Disposisi */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
              {(form.daftarTujuanDisposisi || DEFAULT_TUJUAN_DISPOSISI).map((tujuan, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2.5 bg-white rounded-lg border border-slate-200 shadow-2xs group hover:border-amber-300 transition-all"
                >
                  {editingIndex === idx ? (
                    <div className="flex items-center space-x-2 w-full">
                      <input
                        type="text"
                        value={editingText}
                        onChange={(e) => setEditingText(e.target.value)}
                        className="flex-1 p-1 bg-amber-50 border border-amber-300 rounded font-semibold text-xs text-slate-900 focus:outline-none"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            handleSaveEdit(idx);
                          }
                        }}
                      />
                      <button
                        type="button"
                        onClick={() => handleSaveEdit(idx)}
                        className="p-1 bg-emerald-600 text-white rounded hover:bg-emerald-700 cursor-pointer"
                        title="Simpan"
                      >
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <div className="flex items-center space-x-2 min-w-0 pr-2">
                        <span className="w-5 h-5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px] flex items-center justify-center shrink-0">
                          {idx + 1}
                        </span>
                        <span className="font-semibold text-slate-800 text-xs truncate">
                          {tujuan}
                        </span>
                      </div>

                      <div className="flex items-center space-x-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleStartEdit(idx, tujuan)}
                          className="p-1 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded transition-colors cursor-pointer"
                          title="Edit Nama Tujuan"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDeleteTujuan(idx)}
                          className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                          title="Hapus Tujuan"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  )}
                </div>
              ))}
            </div>

          </div>
        </div>

        {/* Submit & Cancel Buttons */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between">
          {onNavigateToDashboard && (
            <button
              type="button"
              onClick={onNavigateToDashboard}
              className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all flex items-center space-x-1.5 text-xs"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Kembali ke Dashboard</span>
            </button>
          )}

          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl shadow-md transition-all flex items-center space-x-2 text-xs ml-auto cursor-pointer"
          >
            {isSaving ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" />
                <span>Menyimpan ke Firestore...</span>
              </>
            ) : (
              <>
                <Save className="w-4 h-4" />
                <span>Simpan Perubahan & Ke Dashboard</span>
              </>
            )}
          </button>
        </div>

      </form>

    </div>
  );
};

