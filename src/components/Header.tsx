import React from 'react';
import { 
  Shield, 
  ShieldCheck, 
  LogOut, 
  Database, 
  Bell, 
  KeyRound, 
  LayoutDashboard, 
  Receipt, 
  CalendarDays, 
  CheckCircle2,
  Car
} from 'lucide-react';

interface HeaderProps {
  currentTab: 'dashboard' | 'logs' | 'recap';
  setCurrentTab: (tab: 'dashboard' | 'logs' | 'recap') => void;
  isAdmin: boolean;
  onOpenLogin: () => void;
  onLogout: () => void;
  onOpenSettings: () => void;
  onOpenMasterData: () => void;
  onOpenPasswordModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  setCurrentTab,
  isAdmin,
  onOpenLogin,
  onLogout,
  onOpenSettings,
  onOpenMasterData,
  onOpenPasswordModal
}) => {
  return (
    <header className="sticky top-0 z-40 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md shadow-lg no-print">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3.5 flex flex-wrap items-center justify-between gap-2.5">
        
        {/* Brand Logo & Name */}
        <div className="flex items-center gap-2.5 sm:gap-3 cursor-pointer" onClick={() => setCurrentTab('dashboard')}>
          <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl sm:rounded-2xl bg-slate-950 border border-slate-800 p-1.5 flex items-center justify-center shadow-md text-sky-400">
            <Car className="w-full h-full text-sky-400" />
          </div>
          <div>
            <h1 className="font-extrabold text-sm sm:text-base lg:text-lg tracking-tight text-white flex items-center gap-1.5 sm:gap-2">
              <span><span className="text-sky-400 font-black">AUTOMAN</span> UNS</span>
              <span className="text-[9px] sm:text-[10px] bg-sky-950 text-sky-400 border border-sky-800 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider font-bold">
                Fleet Pro
              </span>
            </h1>
            <p className="text-[10px] sm:text-[11px] text-slate-400 hidden sm:block">
              Sistem Terintegrasi Monitoring Perawatan & Bengkel Armada UNS
            </p>
          </div>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* Status Badge */}
          <div className="px-2.5 py-1 sm:py-1.5 rounded-xl border bg-emerald-950/80 border-emerald-800 text-emerald-400 text-[11px] sm:text-xs font-semibold flex items-center gap-1.5 shadow-sm">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline">Sistem Aktif</span>
            <span className="sm:hidden">Ready</span>
          </div>

          {isAdmin ? (
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <button
                onClick={onOpenSettings}
                className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Pengaturan Bot & AI"
              >
                <Bell className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden md:inline">Bot & AI</span>
              </button>

              <button
                onClick={onOpenMasterData}
                className="px-2.5 py-1.5 bg-indigo-950 hover:bg-indigo-900 border border-indigo-800 text-indigo-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Kelola Master Data & Cadangan"
              >
                <Database className="w-3.5 h-3.5 text-indigo-400" />
                <span className="hidden md:inline">Master Data</span>
              </button>

              <button
                onClick={onOpenPasswordModal}
                className="px-2.5 py-1.5 bg-amber-950 hover:bg-amber-900 border border-amber-800 text-amber-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Ubah PIN / Password Admin"
              >
                <KeyRound className="w-3.5 h-3.5 text-amber-400" />
                <span className="hidden sm:inline">PIN Admin</span>
              </button>

              <button
                onClick={onLogout}
                className="px-2.5 py-1.5 bg-rose-950 hover:bg-rose-900 border border-rose-800 text-rose-300 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-sm"
                title="Keluar dari Mode Admin"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-400" />
                <span className="hidden sm:inline">Keluar</span>
              </button>
            </div>
          ) : (
            <button
              onClick={onOpenLogin}
              className="px-3 py-1.5 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition shadow-md flex items-center gap-1.5"
            >
              <Shield className="w-3.5 h-3.5" />
              <span>Login Admin</span>
            </button>
          )}
        </div>
      </div>

      {/* Navigation Tabs */}
      <nav className="border-t border-slate-800/80 bg-slate-900/60 px-3 sm:px-6 lg:px-8 py-1.5 flex items-center gap-1.5 sm:gap-2 overflow-x-auto">
        <button
          onClick={() => setCurrentTab('dashboard')}
          className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 font-bold whitespace-nowrap ${
            currentTab === 'dashboard'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Dashboard Armada</span>
        </button>

        <button
          onClick={() => setCurrentTab('logs')}
          className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 font-bold whitespace-nowrap ${
            currentTab === 'logs'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Receipt className="w-3.5 h-3.5" />
          <span>Riwayat Servis</span>
        </button>

        <button
          onClick={() => setCurrentTab('recap')}
          className={`px-3 sm:px-4 py-1.5 rounded-xl text-xs transition flex items-center gap-1.5 font-bold whitespace-nowrap ${
            currentTab === 'recap'
              ? 'bg-sky-600 text-white shadow-md'
              : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <CalendarDays className="w-3.5 h-3.5" />
          <span>Rekap Bulanan & Tahunan</span>
        </button>
      </nav>
    </header>
  );
};
