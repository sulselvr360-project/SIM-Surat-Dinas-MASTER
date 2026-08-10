import React, { useState, useEffect } from 'react';
import { 
  SuratMasuk, 
  SuratKeluar, 
  KodeKlasifikasi, 
  InstansiConfig, 
  UserRole, 
  ActiveTab,
  Disposisi,
  StatusSuratKeluar,
  UserAccount,
  AppUserRole
} from './types';
import { 
  initialSuratMasuk, 
  initialSuratKeluar, 
  initialKodeKlasifikasi, 
  initialInstansiConfig,
  initialUserAccounts
} from './data/initialData';

import {
  db,
  collection,
  doc,
  onSnapshot,
  setDoc,
  deleteDoc,
  getDocs,
  getDoc,
  writeBatch
} from './lib/firebase';
import { compressDataUrl } from './utils/imageUtils';

import { LoginPage } from './components/LoginPage';
import { UserManagementView } from './components/UserManagementView';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { Dashboard } from './components/Dashboard';
import { SuratMasukList } from './components/SuratMasukList';
import { SuratKeluarList } from './components/SuratKeluarList';
import { FormSuratMasuk } from './components/FormSuratMasuk';
import { FormSuratKeluar } from './components/FormSuratKeluar';
import { DisposisiModal } from './components/DisposisiModal';
import { LembarDisposisiPrint } from './components/LembarDisposisiPrint';
import { OfficialLetterPreview } from './components/OfficialLetterPreview';
import { SuratMasukDetailModal } from './components/SuratMasukDetailModal';
import { KlasifikasiView } from './components/KlasifikasiView';
import { ArsipBukuAgenda } from './components/ArsipBukuAgenda';
import { SettingsModal } from './components/SettingsModal';

export function App() {
  // Local auth state
  const [userAccounts, setUserAccounts] = useState<UserAccount[]>(() => {
    const saved = localStorage.getItem('sim_surat_users');
    return saved ? JSON.parse(saved) : initialUserAccounts;
  });

  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    const saved = localStorage.getItem('sim_surat_current_user');
    return saved ? JSON.parse(saved) : null;
  });

  // Main data collections state
  const [suratMasukList, setSuratMasukList] = useState<SuratMasuk[]>(initialSuratMasuk);
  const [suratKeluarList, setSuratKeluarList] = useState<SuratKeluar[]>(initialSuratKeluar);
  const [kodeKlasifikasiList, setKodeKlasifikasiList] = useState<KodeKlasifikasi[]>(initialKodeKlasifikasi);
  const [instansiConfig, setInstansiConfig] = useState<InstansiConfig>(initialInstansiConfig);

  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Modals state
  const [showFormSuratMasuk, setShowFormSuratMasuk] = useState(false);
  const [showFormSuratKeluar, setShowFormSuratKeluar] = useState(false);

  const [selectedSuratMasuk, setSelectedSuratMasuk] = useState<SuratMasuk | null>(null);
  const [showDetailSuratMasuk, setShowDetailSuratMasuk] = useState(false);
  const [editingSuratMasuk, setEditingSuratMasuk] = useState<SuratMasuk | null>(null);

  const [selectedSuratKeluar, setSelectedSuratKeluar] = useState<SuratKeluar | null>(null);
  const [showDetailSuratKeluar, setShowDetailSuratKeluar] = useState(false);
  const [editingSuratKeluar, setEditingSuratKeluar] = useState<SuratKeluar | null>(null);

  const [showDisposisiModal, setShowDisposisiModal] = useState(false);
  const [showPrintDisposisiModal, setShowPrintDisposisiModal] = useState(false);

  // Sync current logged-in user state
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('sim_surat_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('sim_surat_current_user');
    }
  }, [currentUser]);

  // Seed Firestore initial data if empty
  useEffect(() => {
    const seedFirestoreIfEmpty = async () => {
      try {
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          console.warn('App is offline, skipping Firestore seeding until online.');
          return;
        }

        // If system was already seeded once, NEVER re-seed deleted data
        const seedDoc = await getDoc(doc(db, 'config', 'seed_marker'));
        if (seedDoc.exists()) {
          return;
        }

        // 1. Seed Surat Masuk
        const smSnap = await getDocs(collection(db, 'suratMasuk'));
        if (smSnap.empty) {
          const batch = writeBatch(db);
          initialSuratMasuk.forEach((s) => batch.set(doc(db, 'suratMasuk', s.id), s));
          await batch.commit();
        }

        // 2. Seed Surat Keluar
        const skSnap = await getDocs(collection(db, 'suratKeluar'));
        if (skSnap.empty) {
          const batch = writeBatch(db);
          initialSuratKeluar.forEach((s) => batch.set(doc(db, 'suratKeluar', s.id), s));
          await batch.commit();
        }

        // 3. Seed Kode Klasifikasi
        const kkSnap = await getDocs(collection(db, 'kodeKlasifikasi'));
        if (kkSnap.empty) {
          const batch = writeBatch(db);
          initialKodeKlasifikasi.forEach((k) => batch.set(doc(db, 'kodeKlasifikasi', k.kode.replace(/[^a-zA-Z0-9_]/g, '_')), k));
          await batch.commit();
        }

        // 4. Seed Users
        const uSnap = await getDocs(collection(db, 'users'));
        if (uSnap.empty) {
          const batch = writeBatch(db);
          initialUserAccounts.forEach((u) => batch.set(doc(db, 'users', u.id), u));
          await batch.commit();
        }

        // 5. Seed Instansi Config
        const cfgDoc = await getDoc(doc(db, 'config', 'instansi'));
        if (!cfgDoc.exists()) {
          await setDoc(doc(db, 'config', 'instansi'), initialInstansiConfig);
        }

        // Mark as seeded in Firestore
        await setDoc(doc(db, 'config', 'seed_marker'), { seeded: true, timestamp: new Date().toISOString() });
      } catch (err: any) {
        if (err?.code === 'unavailable' || err?.message?.includes('offline')) {
          console.warn('Firestore is currently offline or unavailable:', err.message);
        } else {
          console.error('Firebase seeding error:', err);
        }
      }
    };

    seedFirestoreIfEmpty();
  }, []);

  // Real-time Firestore Listeners
  useEffect(() => {
    // 1. Listen Surat Masuk
    const unsubSM = onSnapshot(collection(db, 'suratMasuk'), (snapshot) => {
      const items: SuratMasuk[] = [];
      snapshot.forEach((d) => items.push(d.data() as SuratMasuk));
      items.sort((a, b) => (b.createdAt || b.id).localeCompare(a.createdAt || a.id));
      setSuratMasukList(items);
    }, (err) => {
      console.warn('Firestore listener suratMasuk info:', err);
    });

    // 2. Listen Surat Keluar
    const unsubSK = onSnapshot(collection(db, 'suratKeluar'), (snapshot) => {
      const items: SuratKeluar[] = [];
      snapshot.forEach((d) => items.push(d.data() as SuratKeluar));
      items.sort((a, b) => (b.createdAt || b.id).localeCompare(a.createdAt || a.id));
      setSuratKeluarList(items);
    }, (err) => {
      console.warn('Firestore listener suratKeluar info:', err);
    });

    // 3. Listen Kode Klasifikasi
    const unsubKK = onSnapshot(collection(db, 'kodeKlasifikasi'), (snapshot) => {
      const items: KodeKlasifikasi[] = [];
      snapshot.forEach((d) => items.push(d.data() as KodeKlasifikasi));
      setKodeKlasifikasiList(items);
    }, (err) => {
      console.warn('Firestore listener kodeKlasifikasi info:', err);
    });

    // 4. Listen Users
    const unsubUsers = onSnapshot(collection(db, 'users'), (snapshot) => {
      const items: UserAccount[] = [];
      snapshot.forEach((d) => items.push(d.data() as UserAccount));
      if (items.length > 0) {
        setUserAccounts(items);
      }
    }, (err) => {
      console.warn('Firestore listener users info:', err);
    });

    // 5. Listen Instansi Config
    const unsubConfig = onSnapshot(doc(db, 'config', 'instansi'), (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data() as InstansiConfig;
        setInstansiConfig(data);
      }
    }, (err) => {
      console.warn('Firestore listener config info:', err);
    });

    return () => {
      unsubSM();
      unsubSK();
      unsubKK();
      unsubUsers();
      unsubConfig();
    };
  }, []);

  // Dynamically sync favicon and document title with instansiConfig logo & name
  useEffect(() => {
    if (instansiConfig) {
      // 1. Sync document title
      if (instansiConfig.subNama || instansiConfig.namaInstansi) {
        const titleText = instansiConfig.subNama || instansiConfig.namaInstansi;
        document.title = `${titleText} | SIMSURAT`;
      }

      // 2. Sync browser favicon
      if (instansiConfig.logoUrl) {
        let mimeType = 'image/png';
        const logo = instansiConfig.logoUrl;
        if (logo.startsWith('data:image/svg+xml') || logo.endsWith('.svg')) {
          mimeType = 'image/svg+xml';
        } else if (logo.startsWith('data:image/png') || logo.endsWith('.png')) {
          mimeType = 'image/png';
        } else if (logo.startsWith('data:image/jpeg') || logo.startsWith('data:image/jpg') || logo.endsWith('.jpg') || logo.endsWith('.jpeg')) {
          mimeType = 'image/jpeg';
        } else if (logo.startsWith('data:image/gif') || logo.endsWith('.gif')) {
          mimeType = 'image/gif';
        }

        const iconLinks = document.querySelectorAll<HTMLLinkElement>("link[rel*='icon']");
        if (iconLinks.length === 0) {
          const link = document.createElement('link');
          link.rel = 'icon';
          link.type = mimeType;
          link.href = logo;
          document.head.appendChild(link);
        } else {
          iconLinks.forEach((link) => {
            link.type = mimeType;
            link.href = logo;
          });
        }
      }
    }
  }, [instansiConfig]);

  // Derived userRole from currentUser
  const userRole: AppUserRole = currentUser ? currentUser.role : 'user';

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    setActiveTab('dashboard');
  };

  const handleLogout = () => {
    setCurrentUser(null);
  };

  // User Management Handlers (Superadmin Only)
  const handleCreateUser = async (newUser: Omit<UserAccount, 'id'>) => {
    const created: UserAccount = {
      ...newUser,
      id: `usr-${Date.now()}`,
    };
    try {
      await setDoc(doc(db, 'users', created.id), created);
    } catch (err) {
      console.error('Error creating user in Firestore:', err);
    }
  };

  const handleUpdateUser = async (id: string, updatedData: Partial<UserAccount>) => {
    const existing = userAccounts.find((u) => u.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updatedData };
    try {
      await setDoc(doc(db, 'users', id), updated);
      if (currentUser && currentUser.id === id) {
        setCurrentUser(updated);
      }
    } catch (err) {
      console.error('Error updating user in Firestore:', err);
    }
  };

  const handleDeleteUser = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'users', id));
    } catch (err) {
      console.error('Error deleting user in Firestore:', err);
    }
  };

  const handleResetUsers = async () => {
    if (window.confirm('Apakah Anda yakin ingin mengembalikan daftar pengguna ke akun default bawaan sistem?')) {
      try {
        const batch = writeBatch(db);
        userAccounts.forEach((u) => {
          batch.delete(doc(db, 'users', u.id));
        });
        initialUserAccounts.forEach((u) => {
          batch.set(doc(db, 'users', u.id), u);
        });
        await batch.commit();
        alert('Semua akun pengguna berhasil di-reset ke akun default.');
      } catch (err) {
        console.error('Error resetting users:', err);
      }
    }
  };

  // If user is not logged in, render Login Page immediately!
  if (!currentUser) {
    return (
      <LoginPage
        userAccounts={userAccounts}
        onLogin={handleLogin}
        instansiConfig={instansiConfig}
        onResetUsers={handleResetUsers}
      />
    );
  }

  // Next Auto Agenda Numbers
  const nextSuratMasukAgenda = `${String(suratMasukList.length + 1).padStart(3, '0')}/SM/${new Date().getFullYear()}`;
  const nextSuratKeluarAgenda = `${String(suratKeluarList.length + 1).padStart(3, '0')}/SK/${new Date().getFullYear()}`;

  // Counts
  const pendingDisposisiCount = suratMasukList.filter(s => s.status === 'Menunggu').length;
  const totalDisposisiCount = suratMasukList.reduce((acc, curr) => acc + curr.disposisiList.length, 0);

function sanitizeFirestorePayload<T extends Record<string, any>>(obj: T): Record<string, any> {
  const clean: Record<string, any> = {};
  for (const [key, value] of Object.entries(obj)) {
    if (value !== undefined) {
      if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
        clean[key] = sanitizeFirestorePayload(value);
      } else if (Array.isArray(value)) {
        clean[key] = value.map((item) =>
          typeof item === 'object' && item !== null ? sanitizeFirestorePayload(item) : item
        );
      } else {
        clean[key] = value;
      }
    }
  }
  return clean;
}

  // Handlers for Surat Masuk
  const handleCreateSuratMasuk = async (data: Omit<SuratMasuk, 'id' | 'disposisiList' | 'createdAt'>) => {
    const newSurat: SuratMasuk = {
      ...data,
      id: `sm-${Date.now()}`,
      disposisiList: [],
      createdAt: new Date().toISOString(),
    };
    // Optimistic UI state update
    setSuratMasukList((prev) => [newSurat, ...prev.filter((s) => s.id !== newSurat.id)]);
    try {
      const cleanData = sanitizeFirestorePayload(newSurat);
      await setDoc(doc(db, 'suratMasuk', newSurat.id), cleanData);
    } catch (err: any) {
      console.error('Error saving Surat Masuk:', err);
      alert('Gagal menyimpan Surat Masuk: ' + (err?.message || err));
    }
  };

  const handleUpdateSuratMasuk = async (id: string, updatedData: Partial<SuratMasuk>) => {
    const existing = suratMasukList.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updatedData };
    setSuratMasukList((prev) => prev.map((s) => (s.id === id ? updated : s)));
    try {
      const cleanData = sanitizeFirestorePayload(updated);
      await setDoc(doc(db, 'suratMasuk', id), cleanData);
    } catch (err: any) {
      console.error('Error updating Surat Masuk:', err);
      alert('Gagal memperbarui Surat Masuk: ' + (err?.message || err));
    }
  };

  const handleDeleteSuratMasuk = async (id: string) => {
    try {
      // Optimistically remove from state so the UI updates immediately
      setSuratMasukList((prev) => prev.filter((s) => s.id !== id));
      await deleteDoc(doc(db, 'suratMasuk', id));
    } catch (err: any) {
      console.error('Error deleting Surat Masuk:', err);
      alert('Gagal menghapus data Surat Masuk: ' + (err?.message || err));
    }
  };

  // Handlers for Surat Keluar
  const handleCreateSuratKeluar = async (data: Omit<SuratKeluar, 'id' | 'createdAt'>) => {
    const newSurat: SuratKeluar = {
      ...data,
      id: `sk-${Date.now()}`,
      createdAt: new Date().toISOString(),
    };
    setSuratKeluarList((prev) => [newSurat, ...prev.filter((s) => s.id !== newSurat.id)]);
    try {
      const cleanData = sanitizeFirestorePayload(newSurat);
      await setDoc(doc(db, 'suratKeluar', newSurat.id), cleanData);
    } catch (err: any) {
      console.error('Error saving Surat Keluar:', err);
      alert('Gagal menyimpan Surat Keluar: ' + (err?.message || err));
    }
  };

  const handleUpdateSuratKeluar = async (id: string, updatedData: Partial<SuratKeluar>) => {
    const existing = suratKeluarList.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, ...updatedData };
    setSuratKeluarList((prev) => prev.map((s) => (s.id === id ? updated : s)));
    try {
      const cleanData = sanitizeFirestorePayload(updated);
      await setDoc(doc(db, 'suratKeluar', id), cleanData);
    } catch (err: any) {
      console.error('Error updating Surat Keluar:', err);
      alert('Gagal memperbarui Surat Keluar: ' + (err?.message || err));
    }
  };

  const handleUpdateStatusSuratKeluar = async (id: string, newStatus: StatusSuratKeluar) => {
    const existing = suratKeluarList.find((s) => s.id === id);
    if (!existing) return;
    const updated = { ...existing, status: newStatus };
    setSuratKeluarList((prev) => prev.map((s) => (s.id === id ? updated : s)));
    try {
      const cleanData = sanitizeFirestorePayload(updated);
      await setDoc(doc(db, 'suratKeluar', id), cleanData);
    } catch (err: any) {
      console.error('Error updating Surat Keluar status:', err);
      alert('Gagal memperbarui status Surat Keluar: ' + (err?.message || err));
    }
  };

  const handleDeleteSuratKeluar = async (id: string) => {
    try {
      // Optimistically remove from state so the UI updates immediately
      setSuratKeluarList((prev) => prev.filter((s) => s.id !== id));
      await deleteDoc(doc(db, 'suratKeluar', id));
    } catch (err: any) {
      console.error('Error deleting Surat Keluar:', err);
      alert('Gagal menghapus data Surat Keluar: ' + (err?.message || err));
    }
  };

  // Handler for Disposisi Submission
  const handleSubmitDisposisi = async (disposisiData: Omit<Disposisi, 'id'>) => {
    if (!selectedSuratMasuk) return;
    const newDisposisi: Disposisi = {
      ...disposisiData,
      id: `disp-${Date.now()}`,
    };

    // If there is an existing disposisi entry, update it, otherwise append
    const existingIndex = (selectedSuratMasuk.disposisiList || []).length > 0 ? 0 : -1;
    let updatedList: Disposisi[];
    if (existingIndex >= 0) {
      updatedList = [...selectedSuratMasuk.disposisiList];
      updatedList[existingIndex] = {
        ...newDisposisi,
        id: selectedSuratMasuk.disposisiList[existingIndex].id,
      };
    } else {
      updatedList = [...(selectedSuratMasuk.disposisiList || []), newDisposisi];
    }

    const updatedSurat: SuratMasuk = {
      ...selectedSuratMasuk,
      status: 'Didisposisi',
      disposisiList: updatedList,
    };

    setSuratMasukList((prev) => prev.map((s) => (s.id === selectedSuratMasuk.id ? updatedSurat : s)));
    setSelectedSuratMasuk(updatedSurat);

    try {
      const cleanData = sanitizeFirestorePayload(updatedSurat);
      await setDoc(doc(db, 'suratMasuk', selectedSuratMasuk.id), cleanData);
    } catch (err: any) {
      console.error('Error saving disposisi:', err);
      alert('Gagal menyimpan Disposisi: ' + (err?.message || err));
    }
  };

  const handleAddKodeKlasifikasi = async (newKode: KodeKlasifikasi) => {
    try {
      await setDoc(doc(db, 'kodeKlasifikasi', newKode.kode.replace(/[^a-zA-Z0-9_]/g, '_')), newKode);
    } catch (err) {
      console.error('Error adding kode klasifikasi:', err);
    }
  };

  const handleSaveInstansiConfig = async (cfg: InstansiConfig) => {
    try {
      let updatedLogoUrl = cfg.logoUrl;
      if (cfg.logoUrl) {
        updatedLogoUrl = await compressDataUrl(cfg.logoUrl, 300, 300, 0.75);
      }
      const updatedConfig = { ...cfg, logoUrl: updatedLogoUrl };
      
      // Update local state optimistically
      setInstansiConfig(updatedConfig);

      // Save to Firestore so changes sync to all devices and persist across refreshes
      await setDoc(doc(db, 'config', 'instansi'), updatedConfig);
    } catch (err: any) {
      console.error('Error saving instansi config:', err);
      alert('Gagal menyimpan pengaturan ke database Firestore: ' + (err?.message || err));
      throw err;
    }
  };

  const handleRestoreBackupData = async (backupData: any) => {
    try {
      if (backupData.instansiConfig) {
        await handleSaveInstansiConfig(backupData.instansiConfig);
      }
      if (backupData.suratMasukList && Array.isArray(backupData.suratMasukList)) {
        setSuratMasukList(backupData.suratMasukList);
        const batch = writeBatch(db);
        backupData.suratMasukList.forEach((s: any) => {
          batch.set(doc(db, 'suratMasuk', s.id), s);
        });
        await batch.commit();
      }
      if (backupData.suratKeluarList && Array.isArray(backupData.suratKeluarList)) {
        setSuratKeluarList(backupData.suratKeluarList);
        const batch = writeBatch(db);
        backupData.suratKeluarList.forEach((s: any) => {
          batch.set(doc(db, 'suratKeluar', s.id), s);
        });
        await batch.commit();
      }
      alert('Data cadangan berhasil dipulihkan dari Google Drive!');
    } catch (err: any) {
      console.error('Restore backup error:', err);
      alert('Gagal memulihkan data cadangan: ' + (err?.message || err));
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      
      {/* Top Navigation Bar */}
      <Navbar
        userRole={userRole}
        currentUser={currentUser}
        onLogout={handleLogout}
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        instansiConfig={instansiConfig}
        onNewSuratMasuk={() => setShowFormSuratMasuk(true)}
        onNewSuratKeluar={() => setShowFormSuratKeluar(true)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        pendingCount={pendingDisposisiCount}
      />

      {/* Mobile & Tablet Horizontal Tab Navigation Strip */}
      <div className="lg:hidden bg-white border-b border-slate-200 px-4 py-2.5 flex items-center space-x-2 overflow-x-auto sticky top-16 z-30 shadow-xs">
        {[
          { id: 'dashboard', label: 'Dashboard' },
          { id: 'surat-masuk', label: 'Surat Masuk', badge: suratMasukList.length },
          { id: 'surat-keluar', label: 'Surat Keluar', badge: suratKeluarList.length },
          { id: 'disposisi', label: 'Disposisi', badge: pendingDisposisiCount },
          { id: 'klasifikasi', label: 'Kode Klasifikasi' },
          { id: 'buku-agenda', label: 'Buku Agenda' },
          ...((userRole === 'admin' || userRole === 'superadmin') ? [{ id: 'pengaturan', label: 'Profil Instansi' }] : []),
          ...(userRole === 'superadmin' ? [{ id: 'manajemen-user', label: 'User' }] : []),
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setActiveTab(item.id as ActiveTab);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center space-x-1.5 cursor-pointer ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <span>{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                  isActive ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-800'
                }`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="flex-1 max-w-7xl w-full mx-auto flex flex-col lg:flex-row">
        
        {/* Sidebar (Desktop Sticky) */}
        <Sidebar
          userRole={userRole}
          currentUser={currentUser}
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          suratMasukCount={suratMasukList.length}
          suratKeluarCount={suratKeluarList.length}
          disposisiCount={totalDisposisiCount}
          onNewSuratMasuk={() => setShowFormSuratMasuk(true)}
          onNewSuratKeluar={() => setShowFormSuratKeluar(true)}
          onLogout={handleLogout}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-x-hidden">
          {activeTab === 'dashboard' && (
            <Dashboard
              suratMasukList={suratMasukList}
              suratKeluarList={suratKeluarList}
              userRole={userRole}
              currentUser={currentUser}
              setActiveTab={setActiveTab}
              onOpenSuratMasukDetail={(surat) => {
                setSelectedSuratMasuk(surat);
                setShowDetailSuratMasuk(true);
              }}
              onOpenSuratKeluarDetail={(surat) => {
                setSelectedSuratKeluar(surat);
                setShowDetailSuratKeluar(true);
              }}
              onOpenCreateDisposisi={(surat) => {
                setSelectedSuratMasuk(surat);
                setShowDisposisiModal(true);
              }}
              onNewSuratMasuk={() => setShowFormSuratMasuk(true)}
              onNewSuratKeluar={() => setShowFormSuratKeluar(true)}
            />
          )}

          {activeTab === 'surat-masuk' && (
            <SuratMasukList
              suratMasukList={suratMasukList}
              userRole={userRole}
              onOpenDetail={(surat) => {
                setSelectedSuratMasuk(surat);
                setShowDetailSuratMasuk(true);
              }}
              onOpenCreateDisposisi={(surat) => {
                setSelectedSuratMasuk(surat);
                setShowDisposisiModal(true);
              }}
              onPrintDisposisi={(surat) => {
                setSelectedSuratMasuk(surat);
                setShowPrintDisposisiModal(true);
              }}
              onNewSuratMasuk={() => {
                setEditingSuratMasuk(null);
                setShowFormSuratMasuk(true);
              }}
              onEditSurat={(surat) => {
                setEditingSuratMasuk(surat);
                setShowFormSuratMasuk(true);
              }}
              onDeleteSurat={handleDeleteSuratMasuk}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'surat-keluar' && (
            <SuratKeluarList
              suratKeluarList={suratKeluarList}
              userRole={userRole}
              onOpenDetail={(surat) => {
                setSelectedSuratKeluar(surat);
                setShowDetailSuratKeluar(true);
              }}
              onNewSuratKeluar={() => {
                setEditingSuratKeluar(null);
                setShowFormSuratKeluar(true);
              }}
              onEditSurat={(surat) => {
                setEditingSuratKeluar(surat);
                setShowFormSuratKeluar(true);
              }}
              onUpdateStatus={handleUpdateStatusSuratKeluar}
              onDeleteSurat={handleDeleteSuratKeluar}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'disposisi' && (
            <SuratMasukList
              suratMasukList={suratMasukList.filter(s => s.disposisiList.length > 0 || s.status === 'Menunggu')}
              userRole={userRole}
              onOpenDetail={(surat) => {
                setSelectedSuratMasuk(surat);
                setShowDetailSuratMasuk(true);
              }}
              onOpenCreateDisposisi={(surat) => {
                setSelectedSuratMasuk(surat);
                setShowDisposisiModal(true);
              }}
              onPrintDisposisi={(surat) => {
                setSelectedSuratMasuk(surat);
                setShowPrintDisposisiModal(true);
              }}
              onNewSuratMasuk={() => {
                setEditingSuratMasuk(null);
                setShowFormSuratMasuk(true);
              }}
              onEditSurat={(surat) => {
                setEditingSuratMasuk(surat);
                setShowFormSuratMasuk(true);
              }}
              onDeleteSurat={handleDeleteSuratMasuk}
              searchQuery={searchQuery}
            />
          )}

          {activeTab === 'klasifikasi' && (
            <KlasifikasiView
              kodeKlasifikasiList={kodeKlasifikasiList}
              onAddKodeKlasifikasi={handleAddKodeKlasifikasi}
              userRole={userRole}
            />
          )}

          {activeTab === 'buku-agenda' && (
            <ArsipBukuAgenda
              suratMasukList={suratMasukList}
              suratKeluarList={suratKeluarList}
              instansiConfig={instansiConfig}
            />
          )}

          {activeTab === 'pengaturan' && (
            <SettingsModal
              instansiConfig={instansiConfig}
              userRole={userRole}
              suratMasukList={suratMasukList}
              suratKeluarList={suratKeluarList}
              kodeKlasifikasiList={kodeKlasifikasiList}
              userAccounts={userAccounts}
              onSaveConfig={handleSaveInstansiConfig}
              onRestoreData={handleRestoreBackupData}
              onNavigateToDashboard={() => {
                setActiveTab('dashboard');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />
          )}

          {activeTab === 'manajemen-user' && userRole === 'superadmin' && (
            <UserManagementView
              userAccounts={userAccounts}
              currentUser={currentUser}
              onCreateUser={handleCreateUser}
              onUpdateUser={handleUpdateUser}
              onDeleteUser={handleDeleteUser}
              onResetUsers={handleResetUsers}
            />
          )}
        </main>

      </div>

      {/* MODALS */}
      <FormSuratMasuk
        isOpen={showFormSuratMasuk}
        onClose={() => {
          setShowFormSuratMasuk(false);
          setEditingSuratMasuk(null);
        }}
        onSubmit={handleCreateSuratMasuk}
        onUpdate={handleUpdateSuratMasuk}
        editData={editingSuratMasuk}
        kodeKlasifikasiList={kodeKlasifikasiList}
        nextAgendaNo={nextSuratMasukAgenda}
      />

      <FormSuratKeluar
        isOpen={showFormSuratKeluar}
        onClose={() => {
          setShowFormSuratKeluar(false);
          setEditingSuratKeluar(null);
        }}
        onSubmit={handleCreateSuratKeluar}
        onUpdate={handleUpdateSuratKeluar}
        editData={editingSuratKeluar}
        kodeKlasifikasiList={kodeKlasifikasiList}
        instansiConfig={instansiConfig}
        nextAgendaNo={nextSuratKeluarAgenda}
      />

      <DisposisiModal
        isOpen={showDisposisiModal}
        onClose={() => setShowDisposisiModal(false)}
        suratMasuk={selectedSuratMasuk}
        onSubmitDisposisi={handleSubmitDisposisi}
        instansiConfig={instansiConfig}
      />

      <SuratMasukDetailModal
        isOpen={showDetailSuratMasuk}
        onClose={() => setShowDetailSuratMasuk(false)}
        surat={selectedSuratMasuk}
        userRole={userRole}
        onOpenCreateDisposisi={(surat) => {
          setSelectedSuratMasuk(surat);
          setShowDisposisiModal(true);
        }}
        onPrintDisposisi={(surat) => {
          setSelectedSuratMasuk(surat);
          setShowPrintDisposisiModal(true);
        }}
      />

      <LembarDisposisiPrint
        isOpen={showPrintDisposisiModal}
        onClose={() => setShowPrintDisposisiModal(false)}
        suratMasuk={selectedSuratMasuk}
        instansiConfig={instansiConfig}
      />

      <OfficialLetterPreview
        isOpen={showDetailSuratKeluar}
        onClose={() => setShowDetailSuratKeluar(false)}
        suratKeluar={selectedSuratKeluar}
        instansiConfig={instansiConfig}
      />

    </div>
  );
}

export default App;
