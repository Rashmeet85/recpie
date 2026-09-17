import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Sun, Moon, Sparkles, Shield, Eye, EyeOff } from 'lucide-react';

export default function PreLoginPage() {
  const { loginWithDemoRole, loginWithGoogle } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const [selectedRole, setSelectedRole] = useState('super_admin');
  const [email, setEmail] = useState('admin@ioc.org');
  const [password, setPassword] = useState('••••••••');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleRoleSelect = (roleKey) => {
    setSelectedRole(roleKey);
    if (roleKey === 'super_admin') setEmail('admin@ioc.org');
    else if (roleKey === 'teacher') setEmail('teacher@ioc.org');
    else setEmail('observer@ioc.org');
  };

  const handleSignIn = () => {
    setIsLoading(true);
    setTimeout(() => {
      loginWithDemoRole(selectedRole);
      setIsLoading(false);
    }, 450);
  };

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    await loginWithGoogle();
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 relative z-10">
      {/* Top Floating Brand & Theme Bar */}
      <div className="w-full max-w-sm flex items-center justify-between pb-4">
        <div className="flex items-center gap-2">
          <div className="w-1.5 h-8 rounded-full bg-gradient-to-b from-orange-500 to-amber-500 shadow-xs"></div>
          <div className="flex flex-col leading-none">
            <div className="flex items-baseline gap-1">
              <span className="text-base font-black tracking-tight text-orange-500">INITIATORS</span>
              <span className="text-[10px] font-bold text-muted">Of</span>
            </div>
            <span className="text-base font-black tracking-wider text-emerald-600 dark:text-emerald-400 uppercase">CHANGE</span>
          </div>
        </div>

        <button
          onClick={toggleTheme}
          className="w-8 h-8 rounded-xl glass-card flex items-center justify-center text-xs text-title hover:scale-105 active:scale-95 transition-all"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
        </button>
      </div>

      {/* Main Glass Card */}
      <div className="w-full max-w-sm glass-card rounded-[32px] p-5 space-y-4 shadow-2xl">
        {/* Welcome & Mission Hero */}
        <div className="space-y-2">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">Project Usaari</span>
              <h1 className="text-xl font-black tracking-tight text-title mt-0.5">Evening School Gate</h1>
            </div>
            <div className="w-9 h-9 rounded-2xl bg-gradient-to-tr from-red-500 via-orange-500 to-amber-400 flex items-center justify-center text-white shadow-md shadow-red-500/20 font-black text-sm">
              🎓
            </div>
          </div>
          <p className="text-xs text-sub leading-relaxed font-medium">
            Empowering underprivileged children through daily evening education, attendance tracking, and compassionate care.
          </p>

          {/* 3 Micro Impact Chips */}
          <div className="grid grid-cols-3 gap-2 pt-1 text-center">
            <div className="py-2 px-1 rounded-xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
              <span className="text-[9px] font-bold text-muted uppercase block">Enrolled</span>
              <p className="text-sm font-black text-title">88</p>
            </div>
            <div className="py-2 px-1 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
              <span className="text-[9px] font-bold uppercase block">Timing</span>
              <p className="text-xs font-black mt-0.5">5:00 PM</p>
            </div>
            <div className="py-2 px-1 rounded-xl bg-orange-50 dark:bg-orange-950/30 border border-orange-200/60 dark:border-orange-500/20 text-orange-700 dark:text-orange-300">
              <span className="text-[9px] font-bold uppercase block">Mode</span>
              <p className="text-xs font-black mt-0.5">Offline First</p>
            </div>
          </div>
        </div>

        {/* 1-Tap Fast Role Switcher */}
        <div className="space-y-1.5 pt-1">
          <div className="flex items-center justify-between px-0.5">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-muted">Select Sign-In Role</span>
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">100% Free Tier</span>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <button
              type="button"
              onClick={() => handleRoleSelect('super_admin')}
              className={`py-2 px-1 rounded-2xl glass-card text-center transition-all ${
                selectedRole === 'super_admin'
                  ? 'border-2 border-red-500/80 bg-red-500/10 shadow-sm scale-105'
                  : 'border border-slate-200/60 dark:border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-base block">👑</span>
              <span className="text-[11px] font-black block mt-0.5 text-title">Admin</span>
              <span className="text-[8px] text-red-600 dark:text-red-400 font-bold block">Full Control</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('teacher')}
              className={`py-2 px-1 rounded-2xl glass-card text-center transition-all ${
                selectedRole === 'teacher'
                  ? 'border-2 border-red-500/80 bg-red-500/10 shadow-sm scale-105'
                  : 'border border-slate-200/60 dark:border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-base block">✍️</span>
              <span className="text-[11px] font-black block mt-0.5 text-title">Teacher</span>
              <span className="text-[8px] text-muted font-medium block">Roll Call</span>
            </button>

            <button
              type="button"
              onClick={() => handleRoleSelect('observer')}
              className={`py-2 px-1 rounded-2xl glass-card text-center transition-all ${
                selectedRole === 'observer'
                  ? 'border-2 border-red-500/80 bg-red-500/10 shadow-sm scale-105'
                  : 'border border-slate-200/60 dark:border-white/10 opacity-70 hover:opacity-100'
              }`}
            >
              <span className="text-base block">👁️</span>
              <span className="text-[11px] font-black block mt-0.5 text-title">Observer</span>
              <span className="text-[8px] text-muted font-medium block">Read Only</span>
            </button>
          </div>
        </div>

        {/* Credentials Form */}
        <div className="space-y-3 pt-1">
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Staff Email / ID</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="input-glass w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              placeholder="staff@ioc.org"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block">Security PIN / Password</label>
              <span className="text-[10px] font-bold text-red-600 dark:text-red-400 cursor-pointer hover:underline">Forgot?</span>
            </div>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-glass w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-title text-xs"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="checkbox" defaultChecked className="w-3.5 h-3.5 rounded text-red-600 accent-red-600" />
              <span className="text-[11px] font-medium text-sub">Remember on this device</span>
            </label>
            <span className="text-[9px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">
              Offline Cache
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={handleSignIn}
            disabled={isLoading}
            className="btn-uniform w-full py-3 rounded-2xl font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-transform active:scale-[0.98]"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating...</span>
            ) : (
              <span>Sign In to Usaari Portal</span>
            )}
          </button>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
            <span className="flex-shrink mx-3 text-[9px] font-extrabold text-muted uppercase tracking-wider">or instant auth</span>
            <div className="flex-grow border-t border-slate-200 dark:border-white/10"></div>
          </div>

          {/* Google One-Click Auth */}
          <button
            type="button"
            onClick={handleGoogleSignIn}
            className="w-full py-2.5 rounded-2xl glass-card border border-slate-200 dark:border-white/10 font-bold text-xs text-title hover:bg-slate-100/60 dark:hover:bg-white/5 transition-all flex items-center justify-center gap-2.5 shadow-xs"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24">
              <path fill="#EA4335" d="M12 5c1.6 0 3 .6 4.1 1.6l3.1-3.1C17.3 1.7 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.3l3.7 2.9C6.5 7.2 9 5 12 5z"/>
              <path fill="#4285F4" d="M23.5 12.3c0-.8-.1-1.7-.2-2.3H12v4.6h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.9z"/>
              <path fill="#FBBC05" d="M5.6 14.8c-.2-.7-.4-1.5-.4-2.3 0-.8.2-1.6.4-2.3L1.9 7.3C.7 9.7 0 12.3 0 15.2c0 2.8.7 5.5 1.9 7.9l3.7-2.9z"/>
              <path fill="#34A853" d="M12 23.5c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.2-6.4-5.2L1.9 16.5C3.7 20.2 7.5 23.5 12 23.5z"/>
            </svg>
            <span>Continue with Google</span>
          </button>
        </div>

        {/* Security Tagline */}
        <div className="text-center pt-2 border-t border-slate-200/60 dark:border-white/5">
          <p className="text-[10px] text-muted font-medium">Protected by Firebase Auth & Google Sheets Sync</p>
          <p className="text-[10px] font-black text-sub">Initiators of Change • Project Usaari</p>
        </div>
      </div>
    </div>
  );
}
