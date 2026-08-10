import React, { useState } from 'react';
import { AppUserRole, ActiveTab, InstansiConfig, UserAccount } from '../types';
import { 
  Building2, 
  Search, 
  Bell, 
  PlusCircle, 
  Settings,
  FileText,
  Menu,
  X,
  LayoutDashboard,
  Inbox,
  Send,
  GitFork,
  BookOpen,
  BookmarkCheck,
  Building,
  Users,
  LogOut,
  ShieldAlert,
  Sliders,
  Eye,
  User as UserIcon
} from 'lucide-react';

interface NavbarProps {
  userRole: AppUserRole;
  currentUser: UserAccount | null;
  onLogout: () => void;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  instansiConfig: InstansiConfig;
  onNewSuratMasuk: () => void;
  onNewSuratKeluar: () => void;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  pendingCount: number;
  isRealtimeSynced?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  userRole,
  currentUser,
  onLogout,
  activeTab,
  setActiveTab,
  instansiConfig,
  onNewSuratMasuk,
  onNewSuratKeluar,
  searchQuery,
  setSearchQuery,
  pendingCount,
  isRealtimeSynced = true,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const canCreate = userRole !== 'user';
  const isSuperadmin = userRole === 'superadmin';
  const canAccessSettings = userRole === 'admin' || userRole === 'superadmin';

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'surat-masuk', label: 'Surat Masuk', icon: Inbox },
    { id: 'surat-keluar', label: 'Surat Keluar', icon: Send },
    { id: 'disposisi', label: 'Disposisi', icon: GitFork, badge: pendingCount },
    { id: 'klasifikasi', label: 'Kode Klasifikasi', icon: BookmarkCheck },
    { id: 'buku-agenda', label: 'Buku Agenda', icon: BookOpen },
    ...(canAccessSettings ? [{ id: 'pengaturan', label: 'Profil Instansi', icon: Building }] : []),
    ...(isSuperadmin ? [{ id: 'manajemen-user', label: 'Manajemen User', icon: Users }] : []),
  ];

  const handleNavClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleBadge = (role: AppUserRole) => {
    switch (role) {
      case 'superadmin':
        return {
          label: 'SUPERADMIN',
          bg: 'bg-rose-100 text-rose-800 border-rose-200',
          icon: ShieldAlert,
        };
      case 'admin':
        return {
          label: 'ADMIN',
          bg: 'bg-blue-100 text-blue-800 border-blue-200',
          icon: Sliders,
        };
      case 'operator':
        return {
          label: 'OPERATOR',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-200',
          icon: FileText,
        };
      case 'user':
        return {
          label: 'PELIHAT',
          bg: 'bg-amber-100 text-amber-800 border-amber-200',
          icon: Eye,
        };
      default:
        return {
          label: 'USER',
          bg: 'bg-slate-100 text-slate-800 border-slate-200',
          icon: UserIcon,
        };
    }
  };

  const roleInfo = getRoleBadge(userRole);
  const RoleIcon = roleInfo.icon;

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-2">
          
          {/* Left: Mobile Toggle & Brand Header */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-100 focus:outline-none"
              aria-label="Toggle Navigation Menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6 text-slate-800" /> : <Menu className="w-6 h-6 text-slate-800" />}
            </button>

            <button 
              onClick={() => handleNavClick('dashboard')}
              className="flex items-center space-x-3 text-left focus:outline-none group"
            >
              {instansiConfig.logoUrl ? (
                <img
                  src={instansiConfig.logoUrl}
                  alt="Logo"
                  className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-blue-700 to-indigo-900 p-1 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5 text-yellow-400" />
                </div>
              )}
              <div>
                <div className="flex items-center space-x-2">
                  <span className="font-extrabold text-slate-900 tracking-tight text-base sm:text-lg group-hover:text-blue-700 transition-colors">
                    SurDin
                  </span>
                  <span className="text-[10px] bg-blue-100 text-blue-800 font-extrabold px-2 py-0.5 rounded-full border border-blue-200">
                    v1.0
                  </span>
                  <span className="inline-flex items-center space-x-1 text-[10px] bg-emerald-50 text-emerald-700 font-bold px-2 py-0.5 rounded-full border border-emerald-200" title="Firestore Realtime Database Terhubung">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span>Realtime Sync</span>
                  </span>
                </div>
                <p className="text-xs text-slate-500 truncate max-w-[140px] sm:max-w-xs font-medium">
                  {instansiConfig.subNama || instansiConfig.namaInstansi}
                </p>
              </div>
            </button>
          </div>

          {/* Center: Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-4">
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari nomor surat, pengirim, perihal..."
                className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          {/* Right: Actions, Role Badge & User Account */}
          <div className="flex items-center space-x-1.5 sm:space-x-3">
            
            {/* Quick Create Buttons (Hidden for read-only user) */}
            {canCreate && (
              <div className="hidden xl:flex items-center space-x-2">
                <button
                  onClick={onNewSuratMasuk}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>+ Surat Masuk</span>
                </button>
                <button
                  onClick={onNewSuratKeluar}
                  className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg border border-slate-200 transition-all cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5 text-slate-600" />
                  <span>+ Surat Keluar</span>
                </button>
              </div>
            )}

            {/* Notification Indicator */}
            <button 
              onClick={() => handleNavClick('disposisi')}
              className="relative p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              title="Notifikasi Disposisi Masuk"
            >
              <Bell className="w-5 h-5" />
              {pendingCount > 0 && (
                <span className="absolute top-1 right-1 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            {/* Superadmin User Management Link */}
            {isSuperadmin && (
              <button
                onClick={() => handleNavClick('manajemen-user')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'manajemen-user'
                    ? 'bg-purple-100 text-purple-700 font-bold'
                    : 'text-slate-500 hover:bg-purple-50 hover:text-purple-700'
                }`}
                title="Kelola User & Level Akses"
              >
                <Users className="w-5 h-5" />
              </button>
            )}

            {/* Settings Button (Only for Operator, Admin, Superadmin) */}
            {canAccessSettings && (
              <button
                onClick={() => handleNavClick('pengaturan')}
                className={`p-2 rounded-lg transition-colors cursor-pointer ${
                  activeTab === 'pengaturan' 
                    ? 'bg-blue-50 text-blue-600' 
                    : 'text-slate-500 hover:bg-slate-100 hover:text-slate-800'
                }`}
                title="Pengaturan Instansi & Logo"
              >
                <Settings className="w-5 h-5" />
              </button>
            )}

            {/* Active User Chip */}
            <div className="flex items-center space-x-2 pl-2 border-l border-slate-200">
              <div className="hidden md:flex flex-col text-right">
                <div className="flex items-center justify-end space-x-1">
                  <span className="font-bold text-xs text-slate-900 truncate max-w-[120px]">
                    {currentUser?.name || 'User Logged In'}
                  </span>
                </div>
                <div className="flex items-center justify-end space-x-1 mt-0.5">
                  <span className={`inline-flex items-center space-x-0.5 px-1.5 py-0.2 text-[9px] font-black rounded border ${roleInfo.bg}`}>
                    <RoleIcon className="w-2.5 h-2.5 mr-0.5" />
                    <span>{roleInfo.label}</span>
                  </span>
                </div>
              </div>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="p-2 text-rose-600 hover:text-rose-800 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                title="Keluar / Logout dari Sistem"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>

          </div>
        </div>
      </div>

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-6 space-y-3 shadow-xl animate-in slide-in-from-top-2">
          
          <div className="flex items-center justify-between p-2.5 bg-slate-50 rounded-xl border border-slate-200">
            <div>
              <p className="font-bold text-xs text-slate-900">{currentUser?.name}</p>
              <p className="text-[10px] text-slate-500">{currentUser?.jabatan}</p>
            </div>
            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[10px] font-black rounded border ${roleInfo.bg}`}>
              <RoleIcon className="w-3 h-3" />
              <span>{roleInfo.label}</span>
            </span>
          </div>

          <div className="relative w-full md:hidden mb-2">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari surat..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Menu Halaman
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleNavClick(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-blue-600 text-white shadow'
                      : 'text-slate-700 hover:bg-slate-100'
                  }`}
                >
                  <div className="flex items-center space-x-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                      isActive ? 'bg-white/20 text-white' : 'bg-red-100 text-red-700'
                    }`}>
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {canCreate && (
            <div className="pt-3 border-t border-slate-100 flex items-center space-x-2">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNewSuratMasuk();
                }}
                className="flex-1 py-2 bg-blue-600 text-white text-xs font-bold rounded-lg text-center"
              >
                + Agenda Surat Masuk
              </button>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onNewSuratKeluar();
                }}
                className="flex-1 py-2 bg-slate-100 text-slate-800 text-xs font-bold rounded-lg text-center border border-slate-200"
              >
                + Draft Surat Keluar
              </button>
            </div>
          )}

          <div className="pt-2">
            <button
              onClick={onLogout}
              className="w-full py-2 bg-rose-50 text-rose-700 hover:bg-rose-100 font-bold text-xs rounded-xl flex items-center justify-center space-x-1.5 border border-rose-200"
            >
              <LogOut className="w-4 h-4" />
              <span>Keluar dari Akun</span>
            </button>
          </div>

        </div>
      )}
    </header>
  );
};
