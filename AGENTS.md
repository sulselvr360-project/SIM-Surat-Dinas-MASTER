# AGENTS.md — SIMSURAT App Blueprint & Guidelines

## Overview
Aplikasi Sistem Informasi Manajemen Surat & Disposisi Resmi (SIMSURAT).

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
   - Optimistic state updates on deletion paired with Firestore `deleteDoc` API.

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
     _..._
     ============
     *_Disposisi Kepada_* : _..._
     =============
     *_Petunjuk/Arahan_* : _..._

     *_Catatan / Petunjuk Khusus Pimpinan_* : _..._
     =============
     ```
