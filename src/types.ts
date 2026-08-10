export type SifatSurat = 'Biasa' | 'Penting' | 'Sangat Penting' | 'Rahasia';

export type StatusSuratMasuk = 'Menunggu' | 'Didisposisi' | 'Selesai';

export type StatusSuratKeluar = 'Draft' | 'Pengajuan TTD' | 'Disetujui' | 'Terkirim';

export type StatusDisposisi = 'Diproses' | 'Selesai';

export interface Disposisi {
  id: string;
  suratId: string;
  noAgendaSurat: string;
  tglDisposisi: string;
  dari: string;
  kepada: string[];
  instruksi: string[];
  catatan: string;
  batasWaktu: string;
  sifat: SifatSurat;
  status: StatusDisposisi;
}

export interface SuratMasuk {
  id: string;
  noAgenda: string;
  noSurat: string;
  tglSurat: string;
  tglDiterima: string;
  pengirim: string;
  perihal: string;
  isiRingkasan: string;
  kodeKlasifikasi: string;
  sifatSurat: SifatSurat;
  status: StatusSuratMasuk;
  lampiranName?: string;
  fileUrl?: string;
  disposisiList: Disposisi[];
  createdAt: string;
}

export interface SuratKeluar {
  id: string;
  noAgenda: string;
  noSurat: string;
  tglSurat: string;
  tujuan: string;
  perihal: string;
  isiSurat: string;
  kodeKlasifikasi: string;
  sifatSurat: SifatSurat;
  status: StatusSuratKeluar;
  penandatangan: string;
  fileUrl?: string;
  createdAt: string;
}

export interface KodeKlasifikasi {
  kode: string;
  nama: string;
  kategori: string;
  deskripsi: string;
}

export interface InstansiConfig {
  namaInstansi: string;
  subNama: string;
  alamat: string;
  telepon: string;
  email: string;
  website: string;
  logoUrl: string;
  namaKepala: string;
  nipKepala: string;
  jabatanKepala: string;
  // Petugas Agendaris / Pengelola Surat
  namaAgendaris?: string;
  nipAgendaris?: string;
  // Kodefikasi & Format Penomoran
  kodeSandiInstansi?: string;
  formatNomorSuratKeluar?: string;
  formatNomorSuratMasuk?: string;
  // Tujuan Disposisi Surat
  daftarTujuanDisposisi?: string[];
}

export type AppUserRole = 'superadmin' | 'admin' | 'operator' | 'user';
export type UserRole = AppUserRole;

export interface UserAccount {
  id: string;
  username: string;
  name: string;
  jabatan: string;
  role: AppUserRole;
  password?: string;
  avatarUrl?: string;
}

export type ActiveTab = 'dashboard' | 'surat-masuk' | 'surat-keluar' | 'disposisi' | 'klasifikasi' | 'buku-agenda' | 'pengaturan' | 'manajemen-user';
