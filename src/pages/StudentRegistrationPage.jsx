import React, { useState } from 'react';
import { calculateAge } from '../lib/searchIndex';
import { saveStudent, getAllStudents } from '../lib/db';
import { syncToGoogleSheets } from '../lib/googleSheetService';
import { Check, X, Printer, UserPlus } from 'lucide-react';

export default function StudentRegistrationPage({ onRegistrationComplete, onClose }) {
  const [fullName, setFullName] = useState('');
  const [gender, setGender] = useState('male');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [calculatedAgeState, setCalculatedAgeState] = useState(null);
  const [ageError, setAgeError] = useState(null);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [grade, setGrade] = useState('Grade 6');
  const [shift, setShift] = useState('Evening Shift');
  const [guardianName, setGuardianName] = useState('');
  const [guardianRelationship, setGuardianRelationship] = useState('Father');
  const [primaryPhone, setPrimaryPhone] = useState('');
  const [emergencyPhone, setEmergencyPhone] = useState('');
  const [residentialAddress, setResidentialAddress] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleDobChange = (val) => {
    setDateOfBirth(val);
    const res = calculateAge(val);
    setCalculatedAgeState(res.age);
    setAgeError(res.error);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (ageError || calculatedAgeState === null) {
      alert(ageError || 'Please enter a valid Date of Birth (ages 6 to 20).');
      return;
    }

    setIsSubmitting(true);
    try {
      const existing = await getAllStudents();
      const nextSeq = existing.length + 1;
      const studentId = `UES-2026-${String(nextSeq).padStart(4, '0')}`;

      const newStudent = {
        studentId,
        fullName,
        gender,
        dateOfBirth,
        calculatedAge: calculatedAgeState,
        bloodGroup,
        grade,
        shift,
        admissionDate: new Date().toISOString().split('T')[0],
        status: 'active',
        guardianName,
        guardianRelationship,
        primaryPhone,
        emergencyPhone: emergencyPhone || primaryPhone,
        residentialAddress
      };

      await saveStudent(newStudent);
      syncToGoogleSheets('register_student', newStudent);

      if (onRegistrationComplete) {
        onRegistrationComplete(newStudent);
      }
    } catch (err) {
      alert('Error registering student: ' + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-3 overflow-y-auto">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 space-y-4 shadow-2xl my-8 max-h-[90vh] overflow-y-auto no-scrollbar animate-fade-up">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 dark:text-red-400">
              New Admission
            </span>
            <h3 className="text-base font-extrabold text-title">Student Registration Dossier</h3>
          </div>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-muted hover:text-title"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
          {/* Personal Info */}
          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Student Full Name *</label>
            <input
              required
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="e.g. Jaspreet Singh"
              className="input-glass w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-red-500"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="input-glass w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Blood Group</label>
              <select
                value={bloodGroup}
                onChange={(e) => setBloodGroup(e.target.value)}
                className="input-glass w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
              >
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-', 'Unknown'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>
          </div>

          {/* DOB & Dynamic Age Engine */}
          <div className="grid grid-cols-2 gap-3 p-3 rounded-2xl bg-slate-100/50 dark:bg-white/5 border border-slate-200/50 dark:border-white/5">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Date of Birth *</label>
              <input
                required
                type="date"
                value={dateOfBirth}
                onChange={(e) => handleDobChange(e.target.value)}
                className="input-glass w-full px-2.5 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Calculated Age</label>
              <div className="h-9 flex items-center px-3 rounded-xl input-glass">
                {calculatedAgeState !== null ? (
                  <span className={`font-black text-xs ${ageError ? 'text-red-600' : 'text-emerald-600 dark:text-emerald-400'}`}>
                    {calculatedAgeState} Years Old {ageError ? '⚠️' : '✓'}
                  </span>
                ) : (
                  <span className="text-muted text-[11px]">Auto calculated</span>
                )}
              </div>
            </div>
            {ageError && (
              <p className="col-span-2 text-[10px] font-bold text-red-600 dark:text-red-400">{ageError}</p>
            )}
          </div>

          {/* Academic Placement */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Class Placement</label>
              <select
                value={grade}
                onChange={(e) => setGrade(e.target.value)}
                className="input-glass w-full px-3 py-2.5 rounded-xl text-xs font-semibold focus:outline-none"
              >
                {['Grade 1','Grade 2','Grade 3','Grade 4','Grade 5','Grade 6','Grade 7','Grade 8','Grade 9','Grade 10','Grade 11','Grade 12'].map(g => (
                  <option key={g} value={g}>{g}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">School Shift</label>
              <input
                type="text"
                disabled
                value={shift}
                className="input-glass w-full px-3 py-2.5 rounded-xl text-xs font-semibold opacity-80"
              />
            </div>
          </div>

          {/* Guardian Info */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Guardian Name *</label>
              <input
                required
                type="text"
                value={guardianName}
                onChange={(e) => setGuardianName(e.target.value)}
                placeholder="Parent's Name"
                className="input-glass w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Relationship</label>
              <select
                value={guardianRelationship}
                onChange={(e) => setGuardianRelationship(e.target.value)}
                className="input-glass w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
              >
                <option value="Father">Father</option>
                <option value="Mother">Mother</option>
                <option value="Guardian">Guardian</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Primary Phone *</label>
              <input
                required
                type="tel"
                value={primaryPhone}
                onChange={(e) => setPrimaryPhone(e.target.value)}
                placeholder="+91 98765-43210"
                className="input-glass w-full px-3 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>
            <div>
              <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Emergency Phone</label>
              <input
                type="tel"
                value={emergencyPhone}
                onChange={(e) => setEmergencyPhone(e.target.value)}
                placeholder="Optional backup"
                className="input-glass w-full px-3 py-2 rounded-xl text-xs font-mono font-bold focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Residential Address / Ward</label>
            <input
              type="text"
              value={residentialAddress}
              onChange={(e) => setResidentialAddress(e.target.value)}
              placeholder="e.g. Near Gurudwara, Giaspura, Ludhiana"
              className="input-glass w-full px-3 py-2 rounded-xl text-xs font-semibold focus:outline-none"
            />
          </div>

          {/* Form Actions */}
          <div className="flex items-center gap-2 pt-2">
            {onClose && (
              <button
                type="button"
                onClick={onClose}
                className="flex-1 py-2.5 rounded-xl glass-card border border-slate-200 dark:border-white/10 text-xs font-bold text-muted"
              >
                Cancel
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 py-3 rounded-xl btn-uniform font-extrabold text-xs tracking-wider uppercase flex items-center justify-center gap-1.5 shadow-md active:scale-95 transition-all"
            >
              <UserPlus className="w-4 h-4" />
              {isSubmitting ? 'Registering...' : 'Admit & Generate ID'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
