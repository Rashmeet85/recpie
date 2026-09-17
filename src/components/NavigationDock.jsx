import React from 'react';
import { LayoutDashboard, CheckSquare, Users, Settings } from 'lucide-react';

export default function NavigationDock({ activeTab, setActiveTab }) {
  const tabs = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'attendance', label: 'Roll Call', icon: CheckSquare },
    { id: 'students', label: 'Directory', icon: Users },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <nav className="glass-dock fixed bottom-4 left-1/2 -translate-x-1/2 w-[92%] max-w-[390px] h-16 rounded-[28px] px-3 flex items-center justify-around z-40 transition-all shadow-2xl">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-1.5 rounded-2xl flex flex-col items-center justify-center gap-0.5 transition-all active:scale-95 ${
              isActive
                ? 'text-red-600 dark:text-red-400 font-extrabold'
                : 'text-slate-400 dark:text-slate-500 hover:text-title font-medium'
            }`}
          >
            <Icon className={`w-5 h-5 transition-transform ${isActive ? 'scale-110 stroke-[2.5]' : 'stroke-[1.8]'}`} />
            <span className="text-[10px] tracking-tight">{tab.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
