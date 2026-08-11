# AGENTS.md — E-SuratPro App Blueprint & Guidelines

## Overview
Aplikasi Sistem Informasi Manajemen Surat & Disposisi Resmi (**E-SuratPro**) — **Versi Master (Master Blueprint Application)**.

---

## 🔒 MASTER CONFIGURATION & DATABASE CONNECTIVITY

- **Active Firebase Project**: `sim-surat-dinas-master-true`
- **Default Superadmin User**: `Ubayd Mantsur` (Super Administrator / Kasubag TI)
- **Firebase Web Config**:
  ```json
  {
    "apiKey": "AIzaSyBsf3hXZeC_VGYX8eiY5baau3fcTyNoasw",
    "authDomain": "sim-surat-dinas-master-true.firebaseapp.com",
    "projectId": "sim-surat-dinas-master-true",
    "storageBucket": "sim-surat-dinas-master-true.firebasestorage.app",
    "messagingSenderId": "82145406841",
    "appId": "1:82145406841:web:26d1b2ad79581cb48809a8"
  }
  ```
- **Real-Time Data Sync**: Firebase Firestore (`suratMasuk`, `suratKeluar`, `users`, `kodeKlasifikasi`, `config/instansi`)
- **Google Drive Integration**: Direct OAuth & automatic backup sync for document attachments
- **Authentication Engine**: Direct Firebase Real-time listeners with live user account synchronization

---

## ⚠️ PENTING: ATURAN DUPLIKASI / REMIX APLIKASI MASA DEPAN

Apabila aplikasi ini **diremix**, **diduplikasi**, atau **di-fork** di masa mendatang oleh pengembang manapun, wajib mengikuti prosedur berikut sebelum melakukan deployment:

1. **Database Tersendiri di Firebase**:
   - **SEBELUM DEPLOY**, pengembang WAJIB membuat dan mengonfigurasi **database tersendiri** di proyek Firebase baru khusus untuk aplikasi hasil duplikat tersebut.
   - **DILARANG BENGKOK / MENGGUNAKAN** database master agar data antar instansi/aplikasi hasil duplikat tidak saling bentrok atau bercampur.

2. **Akses & Otorisasi Google Drive**:
   - Pengembang WAJIB mengarahkan pengguna/admin untuk **langsung memberikan otorisasi akses ke Google Drive** saat pertama kali aplikasi dijalankan.
   - Hal ini memastikan fitur **Sinkronisasi Otomatis Google Drive** & cadangan berkas langsung terhubung secara aman ke penyimpanan Google Drive pribadi instansi.

---

## Key Architecture & Business Rules

1. **Authentication & Access Control**:
   - **Login Page**: Official login card only (without quick demo login shortcuts).
   - **User Level (Read-Only / Pelihat)**:
     - `userRole === 'user'` HAS NO permissions to Create, Edit, or Delete records (Surat Masuk, Surat Keluar, Disposisi, User Management) and CANNOT access Profil Instansi Settings (`pengaturan`).
     - Only view, read attachments, search, print, and preview PDF.
   - **Operator**:
     - Can input (create) new agenda items (Surat Masuk, Surat Keluar).
     - Can view letters, attachments, and letter dispositions.
     - Can create initial disposisi on undispositioned letters, but CANNOT edit disposisi on letters that have already been dispositioned.
     - CANNOT delete letters or records.
     - CANNOT access Profil Instansi Settings (`pengaturan`).
   - **Admin**: Can manage Surat Masuk, Surat Keluar, Disposisi, and Klasifikasi (including delete).
   - **Superadmin**: Full access including User Management.

2. **Persistence & Firestore Database**:
   - Firestore database collection paths: `suratMasuk`, `suratKeluar`, `users`, `config/instansi`, `config/seed_marker`.
   - Seed marker (`config/seed_marker`) prevents auto-re-seeding deleted records upon browser refresh.
   - Real-time snapshot synchronization (`onSnapshot`) active across all clients.

3. **UI / Styling Conventions**:
   - Clean, professional Tailwind CSS design with high contrast, elegant status badges, and official document preview layouts.
   - Dynamic real-time synchronization with Firebase Firestore.

4. **Copy Format Rules**:
   - Copy text for Surat Masuk uses standard WhatsApp/Messaging formatting:
     ```
     *SURAT MASUK*

     *_Asal Surat_* : _..._
     *_Tanggal surat_* : _dd mmmm yyyy_
     -------------------
     *_Tanggal terima surat_* : _dd mmmm yyyy_
     *_Perihal_* : _..._
     ============
     *_Uraian singkat_* : 
     ...
     ============
     *_Disposisi Kepada_* : _..._
     =============
     *_Petunjuk/Arahan_* : _..._

     *_Catatan / Petunjuk Khusus Pimpinan_* : _..._
     =============

     _Akses Dokumen : https://bit.ly/4bIVRLB_
     _Username : user_
     _Password : user_

     _made by : E-Surat Pro 2026_
     ```

