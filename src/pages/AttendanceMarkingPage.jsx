import React, { useState, useEffect } from 'react';
import { getAllStudents, getAttendanceByDate, saveAttendanceRecord, saveAttendanceBatch } from '../lib/db';
import { searchStudents } from '../lib/searchIndex';
import { syncToGoogleSheets } from '../lib/googleSheetService';
import { useAuth } from '../context/AuthContext';
import ReasonModal from '../components/ReasonModal';
import { Search, Calendar, Check, CheckCheck, FileText } from 'lucide-react';

export default function AttendanceMarkingPage() {
  const { userProfile, isSuperAdmin } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendanceMap, setAttendanceMap] = useState({});
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [selectedDate, setSelectedDate] = useState(() => {
    return new Date().toISOString().split('T')[0];
  });
  const [activeModalStudent, setActiveModalStudent] = useState(null);

  // Load students & date's attendance
  useEffect(() => {
    async function loadData() {
      const studentList = await getAllStudents();
      setStudents(studentList);

      const logs = await getAttendanceByDate(selectedDate);
      const map = {};
      logs.forEach(log => {
        map[log.studentId] = log;
      });
      setAttendanceMap(map);
    }
    loadData();
  }, [selectedDate]);

  const handleStatusToggle = async (student, newStatus) => {
    const record = {
      recordId: `${selectedDate}_${student.studentId}`,
      date: selectedDate,
      studentId: student.studentId,
      studentName: student.fullName,
      grade: student.grade,
      status: newStatus,
      markedByName: userProfile?.displayName || 'Educator',
      markedByUid: userProfile?.uid || 'educator_uid',
      timestamp: Date.now()
    };

    await saveAttendanceRecord(record);
    setAttendanceMap(prev => ({
      ...prev,
      [student.studentId]: record
    }));

    // Dispatch sync in background
    syncToGoogleSheets('mark_attendance', record);
  };

  const handleMarkAllPresent = async () => {
    const records = filteredStudents.map(student => ({
      recordId: `${selectedDate}_${student.studentId}`,
      date: selectedDate,
      studentId: student.studentId,
      studentName: student.fullName,
      grade: student.grade,
      status: 'present',
      markedByName: userProfile?.displayName || 'Educator',
      markedByUid: userProfile?.uid || 'educator_uid',
      timestamp: Date.now()
    }));

    await saveAttendanceBatch(records);

    const newMap = { ...attendanceMap };
    records.forEach(r => {
      newMap[r.studentId] = r;
    });
    setAttendanceMap(newMap);

    syncToGoogleSheets('sync_attendance_batch', { records });
  };

  const handleSaveRemark = async (data) => {
    if (!activeModalStudent) return;
    const record = {
      recordId: `${selectedDate}_${activeModalStudent.studentId}`,
      date: selectedDate,
      studentId: activeModalStudent.studentId,
      studentName: activeModalStudent.fullName,
      grade: activeModalStudent.grade,
      status: data.status,
      reasonTag: data.reasonTag,
      customNote: data.customNote,
      markedByName: userProfile?.displayName || 'Educator',
      markedByUid: userProfile?.uid || 'educator_uid',
      timestamp: Date.now()
    };

    await saveAttendanceRecord(record);
    setAttendanceMap(prev => ({
      ...prev,
      [activeModalStudent.studentId]: record
    }));
    syncToGoogleSheets('mark_attendance', record);
  };

  const filteredStudents = searchStudents(searchQuery, students, selectedGrade);

  // Statistics for today's session
  const totalMarked = Object.keys(attendanceMap).length;
  const totalPresent = Object.values(attendanceMap).filter(a => a.status === 'present').length;
  const totalAbsent = Object.values(attendanceMap).filter(a => a.status === 'absent').length;

  return (
    <div className="space-y-3.5 pb-24">
      {/* Top Session & Date Control Card */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              Daily Roll Call
            </span>
            <h3 className="text-base font-black text-title">Evening Session Register</h3>
          </div>
          <div className="flex items-center gap-1.5 input-glass px-2.5 py-1.5 rounded-xl">
            <Calendar className="w-3.5 h-3.5 text-muted" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs font-bold font-mono focus:outline-none text-title"
            />
          </div>
        </div>

        {/* Live Counters */}
        <div className="grid grid-cols-3 gap-2 text-center pt-1">
          <div className="py-2 rounded-xl bg-slate-100/60 dark:bg-white/5 border border-slate-200/40 dark:border-white/5">
            <span className="text-[9px] font-bold text-muted uppercase block">Marked</span>
            <p className="text-xs font-black text-title">{totalMarked} / {students.length}</p>
          </div>
          <div className="py-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300">
            <span className="text-[9px] font-bold uppercase block">Present</span>
            <p className="text-xs font-black">{totalPresent}</p>
          </div>
          <div className="py-2 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200/50 dark:border-red-500/20 text-red-600 dark:text-red-400">
            <span className="text-[9px] font-bold uppercase block">Absent</span>
            <p className="text-xs font-black">{totalAbsent}</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="glass-card rounded-3xl p-3.5 space-y-2.5">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search student, roll number, or phone..."
            className="input-glass w-full pl-9 pr-3 py-2 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        <div className="flex items-center justify-between gap-2 pt-0.5">
          {/* Grade filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
            {['ALL', 'Primary', 'Middle', 'High', 'Senior'].map(grade => (
              <button
                key={grade}
                type="button"
                onClick={() => setSelectedGrade(grade)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                  selectedGrade === grade
                    ? 'btn-uniform text-white'
                    : 'input-glass text-muted hover:text-title'
                }`}
              >
                {grade}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={handleMarkAllPresent}
            className="px-2.5 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-[10px] font-extrabold flex items-center gap-1 active:scale-95 transition-all flex-shrink-0"
          >
            <CheckCheck className="w-3.5 h-3.5" /> Mark All Present
          </button>
        </div>
      </div>

      {/* Student List */}
      <div className="space-y-2">
        {filteredStudents.map(student => {
          const currentRecord = attendanceMap[student.studentId];
          const isPresent = currentRecord?.status === 'present';
          const isAbsent = currentRecord?.status === 'absent';

          return (
            <div
              key={student.studentId}
              className="glass-card rounded-2xl p-3 space-y-2.5 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-red-600 to-rose-600 text-white font-black flex items-center justify-center text-xs shadow-xs border-t border-white/40">
                    {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST'}
                  </div>
                  <div>
                    <h4 className="font-bold text-xs text-title">{student.fullName}</h4>
                    <p className="text-[10px] text-muted font-mono">
                      {student.studentId} • <span className="font-semibold text-sub">{student.grade}</span>
                      {currentRecord?.reasonTag && (
                        <span className="ml-1 text-[9px] text-red-600 dark:text-red-400 font-bold">
                          ({currentRecord.reasonTag})
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveModalStudent(student)}
                  className="input-glass px-2.5 py-1 rounded-lg text-[10px] font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 flex items-center gap-1"
                >
                  <FileText className="w-3 h-3" /> Note
                </button>
              </div>

              {/* Binary 2-Button Toggle: Present / Absent */}
              <div className="pill-track grid grid-cols-2 gap-1.5 p-1 rounded-xl text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => handleStatusToggle(student, 'present')}
                  className={`py-1.5 rounded-lg transition-all font-bold ${
                    isPresent
                      ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-xs'
                      : 'text-muted hover:text-title'
                  }`}
                >
                  Present
                </button>
                <button
                  type="button"
                  onClick={() => handleStatusToggle(student, 'absent')}
                  className={`py-1.5 rounded-lg transition-all font-bold ${
                    isAbsent
                      ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-xs'
                      : 'text-muted hover:text-title'
                  }`}
                >
                  Absent
                </button>
              </div>
            </div>
          );
        })}

        {filteredStudents.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-center text-muted text-xs">
            No students found matching your search.
          </div>
        )}
      </div>

      {/* Custom Remarks Modal */}
      <ReasonModal
        isOpen={!!activeModalStudent}
        student={activeModalStudent}
        initialStatus={attendanceMap[activeModalStudent?.studentId]?.status || 'absent'}
        onSave={handleSaveRemark}
        onClose={() => setActiveModalStudent(null)}
      />
    </div>
  );
}
