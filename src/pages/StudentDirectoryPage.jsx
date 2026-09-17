import React, { useState, useEffect } from 'react';
import { getAllStudents } from '../lib/db';
import { searchStudents } from '../lib/searchIndex';
import PrintableAdmissionForm from '../components/PrintableAdmissionForm';
import PrintableStudentIdCard from '../components/PrintableStudentIdCard';
import { Search, Printer, CreditCard, UserPlus, Phone } from 'lucide-react';

export default function StudentDirectoryPage({ onOpenNewAdmission }) {
  const [students, setStudents] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedGrade, setSelectedGrade] = useState('ALL');
  const [dossierStudent, setDossierStudent] = useState(null);
  const [idCardStudent, setIdCardStudent] = useState(null);

  useEffect(() => {
    async function load() {
      const data = await getAllStudents();
      setStudents(data);
    }
    load();
  }, []);

  const filtered = searchStudents(searchQuery, students, selectedGrade);

  return (
    <div className="space-y-3.5 pb-24">
      {/* Header & Stats Banner */}
      <div className="glass-card rounded-3xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400">
              Student Directory
            </span>
            <h3 className="text-base font-black text-title">Official Student Dossiers</h3>
          </div>
          <div className="px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-white/5 border border-slate-200/50 dark:border-white/10 text-muted font-bold text-xs">
            {students.length} Total Enrolled
          </div>
        </div>

        {/* Search Bar */}
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

        {/* Grade Category Filters */}
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar pt-0.5">
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
      </div>

      {/* Roster Cards */}
      <div className="space-y-2.5">
        {filtered.map(student => (
          <div key={student.studentId} className="glass-card rounded-2xl p-3.5 space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 text-white font-black flex items-center justify-center text-sm shadow-xs border-t border-white/40">
                  {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST'}
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-title">{student.fullName}</h4>
                  <p className="font-mono text-[10px] text-red-600 dark:text-red-400 font-bold">
                    {student.studentId} &nbsp;•&nbsp; <span className="text-sub font-semibold">{student.grade}</span>
                  </p>
                  <p className="text-[10px] text-muted font-medium">
                    Age: {student.calculatedAge} yrs • Blood: {student.bloodGroup || 'O+'}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setIdCardStudent(student)}
                  title="Print ID Card"
                  className="w-8 h-8 rounded-xl input-glass flex items-center justify-center text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-white/5 active:scale-95 transition-all"
                >
                  <CreditCard className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setDossierStudent(student)}
                  title="Print A4 Admission Dossier"
                  className="w-8 h-8 rounded-xl input-glass flex items-center justify-center text-title hover:bg-slate-100 dark:hover:bg-white/5 active:scale-95 transition-all"
                >
                  <Printer className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-100 dark:border-white/5 text-[10px] text-muted">
              <span>Guardian: <strong className="text-sub">{student.guardianName}</strong></span>
              <span className="font-mono font-bold text-sub flex items-center gap-1">
                <Phone className="w-3 h-3 text-emerald-500" /> {student.primaryPhone}
              </span>
            </div>
          </div>
        ))}

        {filtered.length === 0 && (
          <div className="glass-card rounded-2xl p-6 text-center text-muted text-xs">
            No students found matching your search.
          </div>
        )}
      </div>

      {/* Printable Overlays */}
      <PrintableAdmissionForm
        student={dossierStudent}
        isOpen={!!dossierStudent}
        onClose={() => setDossierStudent(null)}
      />

      <PrintableStudentIdCard
        student={idCardStudent}
        isOpen={!!idCardStudent}
        onClose={() => setIdCardStudent(null)}
      />
    </div>
  );
}
