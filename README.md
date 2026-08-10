# SIMSURAT Master Version (Sistem Informasi Manajemen Surat Dinas & Disposisi)

Aplikasi **SIMSURAT** (Sistem Informasi Manajemen Surat & Disposisi Resmi) versi Master. Aplikasi ini dirancang untuk pengelolaan tata naskah dinas, registrasi surat masuk, surat keluar, lembar disposisi elektronik, buku agenda, serta integrasi pencadangan data otomatis ke **Google Drive** dan **Firebase Firestore**.

---

## 👑 MASTER APPLICATION SPECIFICATION & BLUEPRINT

Aplikasi ini dipatenkan sebagai **Aplikasi Master SIMSURAT**.

### ⚠️ PETUNJUK BAGI PENGEMBANG (REMIX / DUPLIKASI APLIKASI DI MASA DEPAN)

Jika aplikasi ini akan **diremix**, **diduplikasi**, atau **di-cloning** untuk keperluan instansi/organisasi lain di masa mendatang, **WAJIB** memperhatikan aturan berikut **SEBELUM MELAKUKAN DEPLOYMENT**:

1. **Membuat Database Tersendiri di Firebase (Wajib)**:
   - Sebelum melakukan deploy pada aplikasi duplikat, buatlah proyek Firebase baru dan **provisioning database Firestore tersendiri** khusus untuk aplikasi duplikat tersebut.
   - **Dilarang keras** menggunakan database milik Aplikasi Master untuk aplikasi duplikat agar data persuratan dan akun pengguna antar instansi tidak saling tumpang tindih atau bercampur.

2. **Otorisasi Akses Google Drive (Wajib)**:
   - Pengembang harus mengarahkan pengguna untuk **segera mengaktifkan dan memberikan akses otorisasi ke Google Drive** pada menu Sinkronisasi Google Drive.
   - Hal ini memastikan seluruh data cadangan (.json) dan riwayat naskah terhubung langsung dan tersinkronisasi secara real-time ke akun Google Drive milik instansi pengelola.

---

## 🚀 FITUR-FITUR UTAMA APLIKASI

1. **Manajemen Surat Masuk**:
   - Registrasi naskah masuk, nomor agenda otomatis, sifat surat, dan pencatatan ringkasan isi.
   - Pencetakan & Pratinjau Lembar Disposisi Resmi Pimpinan.
   - Fitur *Copy Text WhatsApp / Pesan* dengan format resmi terstandarisasi.

2. **Manajemen Surat Keluar**:
   - Pembuatan naskah keluar, penomoran kodefikasi dinas otomatis `{kode}/{no}/{instansi}/{tahun}`.
   - Tracking status persetujuan, pengajuan TTD pimpinan, hingga status terkirim.
   - Cetak Naskah Dinas Resmi dengan Kop Surat dinamis.

3. **Sinkronisasi & Cadangan Google Drive**:
   - Integrasi OAuth 2.0 Google Drive untuk unggah & unduh file cadangan langsung dari Cloud Google Drive.
   - Ekspor/Impor lokal data format `.json`.

4. **Multi-Level Authorization**:
   - **Superadmin**: Akses penuh termasuk Manajemen Pengguna.
   - **Admin**: Akses pengelolaan data persuratan & pengaturan instansi.
   - **Operator**: Akses entri naskah masuk/keluar & disposisi awal.
   - **User (Pelihat / Read-Only)**: Hanya dapat membaca, mencari, dan mencetak naskah tanpa hak ubah/hapus data.

5. **Akses Real-Time Firebase Firestore**:
   - Sinkronisasi multi-perangkat real-time secara instan dengan penanda *seed marker* untuk menjaga integritas data.

---

## 💻 TEKNOLOGI
- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Motion.
- **Backend & Storage**: Firebase Firestore, Google Drive API (OAuth2).
- **PDF & Print Engine**: Native Print Styles, HTML2PDF.js.
