import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { CheckSquare, UserPlus, TrendingUp, Calendar, ChevronRight } from 'lucide-react';

export default function DashboardPage({ onNavigateTab, onOpenNewAdmission }) {
  const { isSuperAdmin, canMarkAttendance } = useAuth();
  const [inspectedDay, setInspectedDay] = useState({ day: 'Today', rate: '92.8%' });

  const WEEK_TREND = [
    { day: 'Mon', rate: '88.5%', cx: 20, cy: 35 },
    { day: 'Tue', rate: '90.2%', cx: 70, cy: 30 },
    { day: 'Wed', rate: '91.8%', cx: 125, cy: 26 },
    { day: 'Thu', rate: '89.4%', cx: 175, cy: 32 },
    { day: 'Fri', rate: '93.5%', cx: 225, cy: 20 },
    { day: 'Sat', rate: '94.1%', cx: 275, cy: 18 },
    { day: 'Today', rate: '92.8%', cx: 330, cy: 22 }
  ];

  const CLASS_STATS = [
    { grade: 'Primary (Grades 1-5)', count: '24 / 26 Present', percent: 92 },
    { grade: 'Middle (Grades 6-8)', count: '28 / 30 Present', percent: 93 },
    { grade: 'High School (Grades 9-10)', count: '18 / 20 Present', percent: 90 },
    { grade: 'Senior Secondary (11-12)', count: '11 / 12 Present', percent: 91 }
  ];

  return (
    <div className="space-y-3.5 pb-24">
      {/* 1. HERO ATTENDANCE SUMMARY (NO CIRCULAR CLUTTER, BINARY STATUS) */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div className="flex items-start justify-between">
          <div>
            <div className="mb-1">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-red-600 dark:text-red-400">
                Evening Session Active
              </span>
            </div>
            <h3 className="text-2xl font-black tracking-tight text-title">
              92.8% <span className="text-xs font-semibold text-muted">Attendance Rate</span>
            </h3>
            <p className="text-xs text-sub font-medium mt-0.5">
              81 Present &nbsp;•&nbsp; <strong className="text-red-600 dark:text-red-400 font-bold">7 Absent</strong>
            </p>
          </div>

          <div className="px-3 py-1 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold tracking-wider uppercase">
            Active
          </div>
        </div>

        {/* 3 CLEAN BALANCED METRIC CARDS */}
        <div className="grid grid-cols-3 gap-2.5 pt-1 text-center">
          <div className="py-2.5 px-2 rounded-2xl bg-slate-100/70 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
            <span className="text-[9px] font-bold text-muted uppercase block">Total Enrolled</span>
            <p className="text-base font-black text-title">88</p>
          </div>
          <div className="py-2.5 px-2 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/60 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            <span className="text-[9px] font-bold uppercase block">Present Today</span>
            <p className="text-base font-black">81</p>
          </div>
          <div className="py-2.5 px-2 rounded-2xl bg-red-50 dark:bg-red-950/30 border border-red-200/60 dark:border-red-500/20 text-red-600 dark:text-red-400">
            <span className="text-[9px] font-bold uppercase block">Absent Today</span>
            <p className="text-base font-black">7</p>
          </div>
        </div>
      </div>

      {/* 2. AREA TREND GRAPH (SUNSET-TO-EMERALD SOFT GRADIENT) */}
      <div className="glass-card rounded-3xl p-4 space-y-2.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-muted block">7-Day Trajectory</span>
            <h4 className="font-extrabold text-xs text-title">Weekly Attendance Velocity</h4>
          </div>
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-lg bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 border border-emerald-200/70 dark:border-emerald-500/30">
            {inspectedDay.day}: {inspectedDay.rate}
          </span>
        </div>

        <div className="w-full h-24 relative mt-2">
          <svg className="w-full h-full overflow-visible" viewBox="0 0 350 70">
            <defs>
              <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10B981" stopOpacity="0.3" />
                <stop offset="60%" stopColor="#F97316" stopOpacity="0.1" />
                <stop offset="100%" stopColor="#EF4444" stopOpacity="0.0" />
              </linearGradient>
              <linearGradient id="strokeGradient" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#F97316" />
                <stop offset="50%" stopColor="#EAB308" />
                <stop offset="100%" stopColor="#10B981" />
              </linearGradient>
            </defs>

            {/* Filled Area */}
            <path
              d="M 20,35 Q 70,30 125,26 T 225,20 T 330,22 L 330,70 L 20,70 Z"
              fill="url(#areaGlow)"
            />

            {/* Dynamic Trend Stroke */}
            <path
              d="M 20,35 Q 70,30 125,26 T 225,20 T 330,22"
              fill="none"
              stroke="url(#strokeGradient)"
              strokeWidth="3.5"
              strokeLinecap="round"
            />

            {/* Interactive Data Points */}
            {WEEK_TREND.map((item, idx) => (
              <circle
                key={idx}
                onClick={() => setInspectedDay({ day: item.day, rate: item.rate })}
                cx={item.cx}
                cy={item.cy}
                r="5"
                className="fill-emerald-500 stroke-2 stroke-white dark:stroke-slate-900 cursor-pointer hover:r-7 transition-all"
              />
            ))}
          </svg>
        </div>

        <div className="flex justify-between text-[10px] text-muted font-bold px-1 pt-1 border-t border-slate-100 dark:border-white/5">
          {WEEK_TREND.map((item, idx) => (
            <span
              key={idx}
              onClick={() => setInspectedDay({ day: item.day, rate: item.rate })}
              className={`cursor-pointer ${inspectedDay.day === item.day ? 'text-emerald-600 dark:text-emerald-400 font-black' : ''}`}
            >
              {item.day}
            </span>
          ))}
        </div>
      </div>

      {/* 3. CLASS-BY-CLASS HEALTH BREAKDOWN */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="font-extrabold text-xs text-title">Classroom Health Breakdown</h4>
          <span className="text-[10px] text-muted font-mono">Evening Batches</span>
        </div>

        <div className="space-y-2.5">
          {CLASS_STATS.map((cls, idx) => (
            <div key={idx} className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-sub text-[11px]">{cls.grade}</span>
                <span className="font-mono text-emerald-600 dark:text-emerald-400 text-[10px] font-bold">{cls.count}</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-white/5 rounded-full h-2 overflow-hidden flex p-0.5">
                <div
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-full rounded-full transition-all duration-500"
                  style={{ width: `${cls.percent}%` }}
                ></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 4. QUICK ACTION SHORTCUTS */}
      <div className="grid grid-cols-2 gap-2.5">
        {canMarkAttendance && (
          <button
            onClick={() => onNavigateTab('attendance')}
            className="glass-card p-3.5 rounded-2xl text-left space-y-1 hover:border-red-500/40 active:scale-95 transition-all group shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
              <CheckSquare className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-xs text-title group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              Roll Call Today
            </h5>
            <p className="text-[10px] text-muted">Take evening session attendance</p>
          </button>
        )}

        {isSuperAdmin && (
          <button
            onClick={onOpenNewAdmission}
            className="glass-card p-3.5 rounded-2xl text-left space-y-1 hover:border-red-500/40 active:scale-95 transition-all group shadow-xs"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white flex items-center justify-center font-bold shadow-xs">
              <UserPlus className="w-4 h-4" />
            </div>
            <h5 className="font-bold text-xs text-title group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
              New Admission
            </h5>
            <p className="text-[10px] text-muted">Register student (ages 6–20)</p>
          </button>
        )}
      </div>
    </div>
  );
}
