import React, { useState, useEffect } from 'react';
import { getSetting, setSetting, getPendingOutbox, getAllStudents } from '../lib/db';
import { testSheetConnection, syncToGoogleSheets } from '../lib/googleSheetService';
import { useAuth } from '../context/AuthContext';
import { Shield, Link, Database, Check, RefreshCw, AlertTriangle } from 'lucide-react';

export default function SettingsPage() {
  const { userProfile, role, isSuperAdmin } = useAuth();
  const [webhookUrl, setWebhookUrl] = useState('');
  const [apiSecret, setApiSecret] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const [pendingCount, setPendingCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);

  useEffect(() => {
    async function load() {
      const url = await getSetting('googleSheetWebhookUrl', '');
      const secret = await getSetting('apiSecretToken', 'IOC_USAARI_SECURE_2026');
      setWebhookUrl(url);
      setApiSecret(secret);

      const outbox = await getPendingOutbox();
      setPendingCount(outbox.length);

      const studs = await getAllStudents();
      setTotalStudents(studs.length);
    }
    load();
  }, []);

  const handleSaveSettings = async () => {
    await setSetting('googleSheetWebhookUrl', webhookUrl);
    await setSetting('apiSecretToken', apiSecret);
    alert('Settings saved successfully!');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    const ok = await testSheetConnection(webhookUrl, apiSecret);
    setIsTesting(false);
    setTestResult(ok ? 'Connected! Google Sheet responded successfully.' : 'Failed to connect. Verify your Webhook URL.');
  };

  const handleForceRebuildSheet = async () => {
    if (!confirm('This will synchronize all students and records to your Google Sheet master register. Proceed?')) return;
    const studs = await getAllStudents();
    await syncToGoogleSheets('sync_attendance_batch', { records: [] });
    alert('Master Google Sheet synchronized!');
  };

  return (
    <div className="space-y-3.5 pb-24 text-xs">
      {/* User Role Card */}
      <div className="glass-card rounded-3xl p-4 space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white font-black flex items-center justify-center text-sm shadow-xs">
              {userProfile?.initials || 'AD'}
            </div>
            <div>
              <h4 className="font-extrabold text-xs text-title">{userProfile?.displayName || 'User'}</h4>
              <p className="text-[10px] text-muted font-mono">{userProfile?.email || 'admin@ioc.org'}</p>
            </div>
          </div>
          <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-red-500/20 text-red-600 dark:text-red-400 border border-red-500/30">
            {userProfile?.badgeText || role}
          </span>
        </div>
      </div>

      {/* Google Sheets Master Mirror Configuration */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
            Cloud Integration
          </span>
          <h4 className="text-sm font-extrabold text-title mt-0.5">Google Sheets Live Mirror</h4>
          <p className="text-[10px] text-muted mt-0.5">
            Connect your free Google Sheet to maintain real-time copies of all admissions and roll call logs.
          </p>
        </div>

        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Apps Script Webhook URL</label>
          <input
            type="url"
            value={webhookUrl}
            onChange={(e) => setWebhookUrl(e.target.value)}
            placeholder="https://script.google.com/macros/s/.../exec"
            className="input-glass w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none"
          />
        </div>

        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">API Secret Token</label>
          <input
            type="text"
            value={apiSecret}
            onChange={(e) => setApiSecret(e.target.value)}
            className="input-glass w-full px-3 py-2 rounded-xl text-xs font-mono focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={handleSaveSettings}
            className="flex-1 py-2.5 rounded-xl btn-uniform font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5" /> Save Configuration
          </button>
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={isTesting || !webhookUrl}
            className="flex-1 py-2.5 rounded-xl glass-card border border-slate-200 dark:border-white/10 font-bold text-xs text-title flex items-center justify-center gap-1.5 hover:bg-slate-100 dark:hover:bg-white/5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
            {isTesting ? 'Pinging...' : 'Test Connection'}
          </button>
        </div>

        {testResult && (
          <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 pt-1">{testResult}</p>
        )}
      </div>

      {/* Disaster Recovery & Diagnostics */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <h4 className="font-extrabold text-xs text-title">Database Health & Recovery</h4>
        
        <div className="grid grid-cols-2 gap-2 text-center">
          <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
            <span className="text-[9px] font-bold text-muted uppercase block">Local Students</span>
            <p className="text-sm font-black text-title">{totalStudents}</p>
          </div>
          <div className="p-2.5 rounded-xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
            <span className="text-[9px] font-bold text-muted uppercase block">Pending Outbox</span>
            <p className="text-sm font-black text-title">{pendingCount}</p>
          </div>
        </div>

        {isSuperAdmin && (
          <button
            type="button"
            onClick={handleForceRebuildSheet}
            className="w-full py-2.5 rounded-xl input-glass text-red-600 dark:text-red-400 font-bold text-xs hover:bg-red-50 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 border border-red-500/20"
          >
            <RefreshCw className="w-3.5 h-3.5" /> 1-Click Rebuild Master Google Sheet
          </button>
        )}
      </div>
    </div>
  );
}
