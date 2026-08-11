import React, { useState } from 'react';
import { UserAccount, InstansiConfig } from '../types';
import { 
  Building2, 
  Lock, 
  User, 
  Eye, 
  EyeOff, 
  LogIn, 
  ShieldCheck, 
  Sparkles, 
  AlertCircle
} from 'lucide-react';

interface LoginPageProps {
  userAccounts: UserAccount[];
  onLogin: (user: UserAccount) => void;
  instansiConfig: InstansiConfig;
  onResetUsers?: () => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({
  userAccounts,
  onLogin,
  instansiConfig,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const cleanInputUser = username.trim().toLowerCase();
    const cleanInputPass = password.trim();

    const foundUser = userAccounts.find((u) => {
      const matchUsername = u.username.toLowerCase() === cleanInputUser;
      const matchName = u.name.toLowerCase() === cleanInputUser;
      const matchId = u.id.toLowerCase() === cleanInputUser;

      const userPass = (u.password || '').trim();
      const matchPass = userPass
        ? userPass === cleanInputPass || userPass === password
        : cleanInputPass === 'admin' || password === 'admin';

      return (matchUsername || matchName || matchId) && matchPass;
    });

    if (foundUser) {
      onLogin(foundUser);
    } else {
      setErrorMsg('Username atau password yang Anda masukkan salah.');
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans">
      
      {/* Background Decorative Lighting */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-600/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Header Bar */}
      <header className="p-4 sm:p-6 max-w-7xl mx-auto w-full flex items-center justify-between relative z-10">
        <div className="flex items-center space-x-3">
          {instansiConfig.logoUrl ? (
            <img
              src={instansiConfig.logoUrl}
              alt="Logo Instansi"
              className="w-10 h-10 object-contain drop-shadow"
              referrerPolicy="no-referrer"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          ) : (
            <div className="w-10 h-10 rounded-xl bg-blue-600 p-2 flex items-center justify-center text-white font-extrabold shadow-lg">
              <Building2 className="w-6 h-6 text-yellow-400" />
            </div>
          )}
          <div>
            <h2 className="font-extrabold text-white text-base sm:text-lg tracking-tight">
              E-SuratPro
            </h2>
            <p className="text-xs text-slate-400 truncate max-w-[200px] sm:max-w-md">
              {instansiConfig.namaInstansi}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center space-x-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/80 text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Akses Terenkripsi & Otentikasi Resmi</span>
        </div>
      </header>

      {/* Main Container - Centered Login Card */}
      <main className="max-w-md mx-auto w-full px-4 py-8 flex-1 flex flex-col justify-center relative z-10">
        
        <div className="bg-slate-800/90 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-slate-700/80 shadow-2xl space-y-6">
          
          <div className="text-center">
            <div className="inline-flex items-center space-x-1.5 bg-blue-500/10 text-blue-400 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/20 mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Portal Login Resmi</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Selamat Datang
            </h1>
            <p className="text-slate-400 text-xs sm:text-sm mt-1">
              Masukkan username dan password akun Anda untuk mengakses sistem persuratan.
            </p>
          </div>

          {/* Error Message */}
          {errorMsg && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs flex items-center space-x-2 animate-in fade-in">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Username Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Masukkan username Anda"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Masukkan password Anda"
                  className="w-full pl-10 pr-10 py-2.5 bg-slate-900/80 border border-slate-700 rounded-xl text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all placeholder:text-slate-600"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-bold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/30 transition-all flex items-center justify-center space-x-2 cursor-pointer mt-2"
            >
              <LogIn className="w-4 h-4" />
              <span>Masuk ke Aplikasi</span>
            </button>

          </form>

        </div>

      </main>

      {/* Footer */}
      <footer className="p-4 border-t border-slate-800 text-center text-xs text-slate-500 relative z-10">
        <p>© 2026 E-SuratPro v1.0 - {instansiConfig.subNama || instansiConfig.namaInstansi}</p>
      </footer>

    </div>
  );
};
