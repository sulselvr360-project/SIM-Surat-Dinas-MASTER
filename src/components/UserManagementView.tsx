import React, { useState } from 'react';
import { UserAccount, AppUserRole } from '../types';
import { 
  Users, 
  UserPlus, 
  Search, 
  Filter, 
  ShieldCheck, 
  ShieldAlert, 
  Edit, 
  Trash2, 
  KeyRound, 
  User, 
  Check, 
  X, 
  Shield, 
  Sliders, 
  FileText, 
  Eye, 
  AlertTriangle 
} from 'lucide-react';

interface UserManagementViewProps {
  userAccounts: UserAccount[];
  currentUser: UserAccount;
  onCreateUser: (newUser: Omit<UserAccount, 'id'>) => void;
  onUpdateUser: (id: string, updatedData: Partial<UserAccount>) => void;
  onDeleteUser: (id: string) => void;
  onResetUsers?: () => void;
}

export const UserManagementView: React.FC<UserManagementViewProps> = ({
  userAccounts,
  currentUser,
  onCreateUser,
  onUpdateUser,
  onDeleteUser,
  onResetUsers,
}) => {
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('semua');

  // Modals
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingUser, setEditingUser] = useState<UserAccount | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<UserAccount | null>(null);

  // Form State for Add User
  const [newUsername, setNewUsername] = useState('');
  const [newName, setNewName] = useState('');
  const [newJabatan, setNewJabatan] = useState('');
  const [newRole, setNewRole] = useState<AppUserRole>('operator');
  const [newPassword, setNewPassword] = useState('');

  // Form State for Edit User
  const [editUsername, setEditUsername] = useState('');
  const [editName, setEditName] = useState('');
  const [editJabatan, setEditJabatan] = useState('');
  const [editRole, setEditRole] = useState<AppUserRole>('operator');
  const [editPassword, setEditPassword] = useState('');

  // Filter List
  const filteredUsers = userAccounts.filter((u) => {
    if (roleFilter !== 'semua' && u.role !== roleFilter) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        u.name.toLowerCase().includes(q) ||
        u.username.toLowerCase().includes(q) ||
        u.jabatan.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Handle Add Submit
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUsername.trim() || !newName.trim()) {
      alert('Username dan Nama Lengkap wajib diisi!');
      return;
    }

    // Check duplicate username
    if (userAccounts.some((u) => u.username.toLowerCase() === newUsername.trim().toLowerCase())) {
      alert('Username ini sudah terdaftar! Gunakan username lain.');
      return;
    }

    onCreateUser({
      username: newUsername.trim(),
      name: newName.trim(),
      jabatan: newJabatan.trim() || 'Staf / Agendaris',
      role: newRole,
      password: newPassword.trim() || '123456',
    });

    // Reset Form
    setNewUsername('');
    setNewName('');
    setNewJabatan('');
    setNewRole('operator');
    setNewPassword('');
    setShowAddModal(false);
  };

  // Handle Start Edit
  const handleStartEdit = (user: UserAccount) => {
    setEditingUser(user);
    setEditUsername(user.username);
    setEditName(user.name);
    setEditJabatan(user.jabatan);
    setEditRole(user.role);
    setEditPassword('');
  };

  // Handle Edit Submit
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;

    if (!editUsername.trim() || !editName.trim()) {
      alert('Username dan Nama Lengkap tidak boleh kosong!');
      return;
    }

    // Check duplicate username if changed
    const cleanNewUsername = editUsername.trim().toLowerCase();
    const isUsernameChanged = cleanNewUsername !== editingUser.username.toLowerCase();
    if (isUsernameChanged && userAccounts.some((u) => u.id !== editingUser.id && u.username.toLowerCase() === cleanNewUsername)) {
      alert('Username ini sudah terdaftar oleh pengguna lain! Gunakan username lain.');
      return;
    }

    const updates: Partial<UserAccount> = {
      username: editUsername.trim(),
      name: editName.trim(),
      jabatan: editJabatan.trim(),
      role: editRole,
    };

    if (editPassword.trim()) {
      updates.password = editPassword.trim();
    }

    onUpdateUser(editingUser.id, updates);
    setEditingUser(null);
  };

  // Role Badge Helper
  const renderRoleBadge = (role: AppUserRole) => {
    switch (role) {
      case 'superadmin':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-rose-100 text-rose-800 border border-rose-200 rounded-md font-extrabold text-[10px] uppercase">
            <ShieldAlert className="w-3 h-3 text-rose-600" />
            <span>Superadmin</span>
          </span>
        );
      case 'admin':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-blue-100 text-blue-800 border border-blue-200 rounded-md font-bold text-[10px] uppercase">
            <Sliders className="w-3 h-3 text-blue-600" />
            <span>Admin</span>
          </span>
        );
      case 'operator':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 border border-emerald-200 rounded-md font-bold text-[10px] uppercase">
            <FileText className="w-3 h-3 text-emerald-600" />
            <span>Operator</span>
          </span>
        );
      case 'user':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 bg-amber-100 text-amber-800 border border-amber-200 rounded-md font-bold text-[10px] uppercase">
            <Eye className="w-3 h-3 text-amber-600" />
            <span>User (Pelihat)</span>
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="p-3 bg-purple-100 text-purple-700 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-900">Manajemen Pengguna & Level Akses</h1>
            <p className="text-xs text-slate-500">
              Pengaturan akun pengguna, penambahan user baru, reset password, dan hak akses aplikasi
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <UserPlus className="w-4 h-4" />
          <span>Tambah User Baru</span>
        </button>
      </div>

      {/* Role Summary Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold text-slate-400 uppercase">Total User</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{userAccounts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-rose-100 shadow-2xs bg-gradient-to-br from-rose-50/50 to-white">
          <p className="text-[11px] font-bold text-rose-600 uppercase">Superadmin</p>
          <p className="text-2xl font-black text-rose-900 mt-1">
            {userAccounts.filter((u) => u.role === 'superadmin').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-2xs bg-gradient-to-br from-blue-50/50 to-white">
          <p className="text-[11px] font-bold text-blue-600 uppercase">Admin & Operator</p>
          <p className="text-2xl font-black text-blue-900 mt-1">
            {userAccounts.filter((u) => u.role === 'admin' || u.role === 'operator').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-amber-100 shadow-2xs bg-gradient-to-br from-amber-50/50 to-white">
          <p className="text-[11px] font-bold text-amber-600 uppercase">User (Pelihat)</p>
          <p className="text-2xl font-black text-amber-900 mt-1">
            {userAccounts.filter((u) => u.role === 'user').length}
          </p>
        </div>
      </div>

      {/* Toolbar Search & Filter */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nama, username, jabatan..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>

        <div className="flex items-center space-x-2 w-full md:w-auto">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Filter Role:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none cursor-pointer"
          >
            <option value="semua">Semua Role Level</option>
            <option value="superadmin">Superadmin</option>
            <option value="admin">Admin</option>
            <option value="operator">Operator</option>
            <option value="user">User (Pelihat)</option>
          </select>
        </div>

      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold uppercase text-[10px]">
                <th className="p-3.5">Pengguna & Jabatan</th>
                <th className="p-3.5">Username</th>
                <th className="p-3.5">Level Role (Hak Akses)</th>
                <th className="p-3.5 text-center">Status Akun</th>
                <th className="p-3.5 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-slate-400">
                    Tidak ditemukan pengguna yang sesuai dengan kriteria pencarian.
                  </td>
                </tr>
              ) : (
                filteredUsers.map((usr) => (
                  <tr key={usr.id} className="hover:bg-slate-50/80 transition-colors">
                    
                    <td className="p-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-purple-600 to-indigo-600 text-white font-black flex items-center justify-center text-xs shadow-xs">
                          {usr.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs flex items-center space-x-1.5">
                            <span>{usr.name}</span>
                            {usr.id === currentUser.id && (
                              <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-extrabold">
                                (Anda)
                              </span>
                            )}
                          </p>
                          <p className="text-[11px] text-slate-500 truncate max-w-xs">{usr.jabatan}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-3.5 font-mono font-bold text-slate-700">
                      @{usr.username}
                    </td>

                    <td className="p-3.5">
                      {renderRoleBadge(usr.role)}
                    </td>

                    <td className="p-3.5 text-center">
                      <span className="inline-flex items-center space-x-1 px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[10px] font-bold">
                        <Check className="w-3 h-3 text-emerald-600" />
                        <span>Aktif</span>
                      </span>
                    </td>

                    <td className="p-3.5 text-right">
                      <div className="flex items-center justify-end space-x-1">
                        
                        <button
                          onClick={() => handleStartEdit(usr)}
                          className="p-1.5 text-slate-600 hover:text-purple-600 hover:bg-purple-50 rounded-lg transition-colors"
                          title="Edit User & Atur Level Role"
                        >
                          <Edit className="w-4 h-4" />
                        </button>

                        <button
                          onClick={() => {
                            if (usr.id === currentUser.id) {
                              alert('Anda tidak bisa menghapus akun Anda sendiri yang sedang digunakan!');
                              return;
                            }
                            setDeleteTarget(usr);
                          }}
                          disabled={usr.id === currentUser.id}
                          className={`p-1.5 rounded-lg transition-colors ${
                            usr.id === currentUser.id
                              ? 'text-slate-300 cursor-not-allowed'
                              : 'text-slate-400 hover:text-red-600 hover:bg-red-50 cursor-pointer'
                          }`}
                          title="Hapus Akun User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>

                      </div>
                    </td>

                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add User */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <UserPlus className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm">Tambah User Pengguna Baru</h3>
              </div>
              <button
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleAddSubmit} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value)}
                  placeholder="Contoh: aris_operator"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  placeholder="Contoh: Aris Ardiansyah, S.IP."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Unit Kerja
                </label>
                <input
                  type="text"
                  value={newJabatan}
                  onChange={(e) => setNewJabatan(e.target.value)}
                  placeholder="Contoh: Operator Agenda / Kasubag Umum"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Level Role (Hak Akses) <span className="text-red-500">*</span>
                </label>
                <select
                  value={newRole}
                  onChange={(e) => setNewRole(e.target.value as AppUserRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-semibold"
                >
                  <option value="superadmin">🔴 Superadmin (All Akses, Hapus, User)</option>
                  <option value="admin">🔵 Admin (Tambah & Edit Surat)</option>
                  <option value="operator">🟢 Operator (Tambah & Edit Agenda)</option>
                  <option value="user">🟡 User (Hanya Pelihat / Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Password
                </label>
                <input
                  type="text"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Default: 123456"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                >
                  Simpan User
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Modal Edit User */}
      {editingUser && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden my-6">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Edit className="w-5 h-5 text-purple-400" />
                <h3 className="font-bold text-sm">Edit User: @{editingUser.username}</h3>
              </div>
              <button
                onClick={() => setEditingUser(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-5 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Username Login <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editUsername}
                  onChange={(e) => setEditUsername(e.target.value)}
                  placeholder="Contoh: superadmin"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono font-bold"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nama Lengkap & Gelar <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Jabatan / Unit Kerja
                </label>
                <input
                  type="text"
                  value={editJabatan}
                  onChange={(e) => setEditJabatan(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Level Role (Atur Hak Akses)
                </label>
                <select
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as AppUserRole)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none bg-white font-semibold"
                >
                  <option value="superadmin">🔴 Superadmin (All Akses, Hapus, User)</option>
                  <option value="admin">🔵 Admin (Tambah & Edit Surat)</option>
                  <option value="operator">🟢 Operator (Tambah & Edit Agenda)</option>
                  <option value="user">🟡 User (Hanya Pelihat / Read-Only)</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Reset Password Baru (Opsional)
                </label>
                <input
                  type="text"
                  value={editPassword}
                  onChange={(e) => setEditPassword(e.target.value)}
                  placeholder="Kosongkan jika tidak ingin mengubah"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none font-mono"
                />
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end space-x-2">
                <button
                  type="button"
                  onClick={() => setEditingUser(null)}
                  className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-lg shadow-sm"
                >
                  Simpan Perubahan
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

      {/* Delete Target Modal */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden p-6 space-y-4">
            <div className="flex items-center space-x-3 text-red-600">
              <div className="p-2.5 bg-red-100 rounded-xl">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Konfirmasi Hapus User</h3>
                <p className="text-xs text-slate-500">Penghapusan akun pengguna dari sistem</p>
              </div>
            </div>

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs text-slate-700 space-y-1">
              <p><span className="font-bold text-slate-900">Nama:</span> {deleteTarget.name}</p>
              <p><span className="font-bold text-slate-900">Username:</span> @{deleteTarget.username}</p>
              <p><span className="font-bold text-slate-900">Role:</span> {deleteTarget.role}</p>
            </div>

            <div className="flex items-center justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  onDeleteUser(deleteTarget.id);
                  setDeleteTarget(null);
                }}
                className="px-4 py-2 text-xs font-bold text-white bg-red-600 hover:bg-red-700 rounded-lg shadow-sm"
              >
                Ya, Hapus User
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
