import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Plus, Sun, Moon, LogOut } from 'lucide-react';

export default function Header({ onOpenNewAdmission, activeTabTitle }) {
  const { userProfile, role, isSuperAdmin, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="pt-10 px-5 pb-3 sticky top-0 z-30 flex items-center justify-between backdrop-blur-2xl border-b border-slate-200/60 dark:border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.03)] bg-white/70 dark:bg-slate-900/70">
      <div className="flex items-center gap-3">
        {/* Typographic Logo: Orange 'INITIATORS' & Green 'CHANGE' */}
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-orange-500 to-amber-500 shadow-xs"></div>
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline gap-1">
              <span className="text-sm font-black tracking-tight text-orange-500">INITIATORS</span>
              <span className="text-[10px] font-bold text-muted">Of</span>
            </div>
            <span className="text-sm font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">CHANGE</span>
          </div>
        </div>

        <div className="border-l border-slate-200 dark:border-white/15 pl-2.5">
          <span className="text-[9px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest block">Project Usaari</span>
          <h2 className="text-sm font-extrabold tracking-tight text-title">{activeTabTitle || 'Dashboard'}</h2>
        </div>
      </div>

      <div className="flex items-center gap-2">
        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          title={theme === 'dark' ? 'Switch to Crisp Glass' : 'Switch to Velvet Dark'}
          className="w-8 h-8 rounded-xl glass-card flex items-center justify-center text-xs text-title hover:scale-105 active:scale-95 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>

        {/* New Admission Button (Permitted Roles Only) */}
        {isSuperAdmin && onOpenNewAdmission && (
          <button
            onClick={onOpenNewAdmission}
            title="New Student Admission"
            className="btn-uniform w-8 h-8 rounded-xl flex items-center justify-center font-bold text-sm transition-transform active:scale-95"
          >
            <Plus className="w-4 h-4 text-white" />
          </button>
        )}

        {/* User Profile Avatar with Sign Out Trigger */}
        <button
          onClick={logout}
          title={`Signed in as ${userProfile?.displayName || 'User'} (${userProfile?.badgeText || role}). Click to Sign Out.`}
          className="w-8 h-8 rounded-xl glass-card flex items-center justify-center font-black text-red-600 dark:text-red-400 text-xs border border-red-500/20 hover:scale-105 active:scale-95 transition-all"
        >
          {userProfile?.initials || 'AD'}
        </button>
      </div>
    </header>
  );
}
