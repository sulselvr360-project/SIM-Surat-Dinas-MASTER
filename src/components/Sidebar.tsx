import React from 'react';
import { ActiveTab, AppUserRole, UserAccount } from '../types';
import { 
  LayoutDashboard, 
  Inbox, 
  Send, 
  GitFork, 
  BookOpen, 
  BookmarkCheck, 
  Building,
  Plus,
  Users,
  LogOut,
  ShieldAlert,
  Sliders,
  FileText,
  Eye,
  User as UserIcon
} from 'lucide-react';

interface SidebarProps {
  userRole: AppUserRole;
  currentUser: UserAccount | null;
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  suratMasukCount: number;
  suratKeluarCount: number;
  disposisiCount: number;
  onNewSuratMasuk: () => void;
  onNewSuratKeluar: () => void;
  onLogout: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  userRole,
  currentUser,
  activeTab,
  setActiveTab,
  suratMasukCount,
  suratKeluarCount,
  disposisiCount,
  onNewSuratMasuk,
  onNewSuratKeluar,
  onLogout,
}) => {
  const canCreate = userRole !== 'user';
  const isSuperadmin = userRole === 'superadmin';
  const canAccessSettings = userRole === 'admin' || userRole === 'superadmin';

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      id: 'surat-masuk',
      label: 'Surat Masuk',
      icon: Inbox,
      badge: suratMasukCount,
      badgeColor: 'bg-blue-100 text-blue-700',
    },
    {
      id: 'surat-keluar',
      label: 'Surat Keluar',
      icon: Send,
      badge: suratKeluarCount,
      badgeColor: 'bg-emerald-100 text-emerald-700',
    },
    {
      id: 'disposisi',
      label: 'Disposisi Surat',
      icon: GitFork,
      badge: disposisiCount,
      badgeColor: 'bg-amber-100 text-amber-800',
    },
    {
      id: 'klasifikasi',
      label: 'Kode Klasifikasi',
      icon: BookmarkCheck,
      badge: null,
    },
    {
      id: 'buku-agenda',
      label: 'Buku Agenda & Cetak',
      icon: BookOpen,
      badge: null,
    },
    ...(canAccessSettings
      ? [
          {
            id: 'pengaturan',
            label: 'Profil Instansi',
            icon: Building,
            badge: null,
          },
        ]
      : []),
    ...(isSuperadmin
      ? [
          {
            id: 'manajemen-user',
            label: 'Manajemen User',
            icon: Users,
            badge: null,
          },
        ]
      : []),
  ];

  const handleMenuClick = (tabId: ActiveTab) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const getRoleBadge = (role: AppUserRole) => {
    switch (role) {
      case 'superadmin':
        return { label: 'SUPERADMIN', bg: 'bg-rose-100 text-rose-800 border-rose-200', icon: ShieldAlert };
      case 'admin':
        return { label: 'ADMIN', bg: 'bg-blue-100 text-blue-800 border-blue-200', icon: Sliders };
      case 'operator':
        return { label: 'OPERATOR', bg: 'bg-emerald-100 text-emerald-800 border-emerald-200', icon: FileText };
      case 'user':
        return { label: 'PELIHAT', bg: 'bg-amber-100 text-amber-800 border-amber-200', icon: Eye };
      default:
        return { label: 'USER', bg: 'bg-slate-100 text-slate-800 border-slate-200', icon: UserIcon };
    }
  };

  const roleInfo = getRoleBadge(userRole);
  const RoleIcon = roleInfo.icon;

  return (
    <aside className="hidden lg:flex w-64 bg-white border-r border-slate-200 p-4 flex-col justify-between shrink-0 sticky top-16 h-[calc(100vh-4rem)] overflow-y-auto">
      <div className="space-y-6">
        
        {/* Navigation Section */}
        <div>
          <p className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
            Menu Utama Instansi
          </p>
          <nav className="space-y-1">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id as ActiveTab)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-md font-bold'
                      : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge !== null && item.badge > 0 && (
                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                        isActive ? 'bg-white/20 text-white' : item.badgeColor
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Quick Action Shortcuts (Only for users who can create) */}
        {canCreate && (
          <div className="pt-4 border-t border-slate-200 space-y-2">
            <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
              Aksi Cepat
            </p>
            <button
              onClick={onNewSuratMasuk}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Agenda Surat Masuk</span>
            </button>
            <button
              onClick={onNewSuratKeluar}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Draft Surat Keluar</span>
            </button>
          </div>
        )}

      </div>

      {/* User Info Card & Logout Footer */}
      <div className="pt-4 border-t border-slate-200 space-y-3">
        <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-black flex items-center justify-center text-xs shrink-0">
              {currentUser?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="font-bold text-xs text-slate-900 truncate">
                {currentUser?.name || 'User'}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {currentUser?.jabatan || 'Pengguna Sistem'}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className={`inline-flex items-center space-x-1 px-2 py-0.5 text-[9px] font-black rounded border ${roleInfo.bg}`}>
              <RoleIcon className="w-3 h-3" />
              <span>{roleInfo.label}</span>
            </span>

            <button
              onClick={onLogout}
              className="text-xs font-bold text-rose-600 hover:text-rose-800 hover:underline flex items-center space-x-1 cursor-pointer"
              title="Keluar / Logout"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Keluar</span>
            </button>
          </div>
        </div>

        <div className="text-[10px] text-slate-400 text-center">
          E-SuratPro v1.0 | Multi-User Role
        </div>
      </div>
    </aside>
  );
};
