import React, { useState, useEffect } from 'react';
import { X, Check } from 'lucide-react';

export default function ReasonModal({ isOpen, student, initialStatus, onSave, onClose }) {
  const [status, setStatus] = useState('absent');
  const [selectedTag, setSelectedTag] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    if (student) {
      setStatus(initialStatus || 'absent');
      setSelectedTag('');
      setNote('');
    }
  }, [student, initialStatus]);

  if (!isOpen || !student) return null;

  const REASON_TAGS = [
    'Sick / Medical',
    'Distance / Traffic',
    'Heavy Rain / Cold',
    'Family Emergency',
    'Household Work',
    'Exam Preparation'
  ];

  const handleSave = () => {
    onSave({
      status,
      reasonTag: selectedTag,
      customNote: note
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-3">
      <div className="glass-card w-full max-w-md rounded-3xl p-5 space-y-4 shadow-2xl animate-fade-up">
        <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-white/10">
          <div>
            <h3 className="text-base font-extrabold text-title">{student.fullName}</h3>
            <p className="text-xs text-muted font-mono">{student.studentId} • {student.grade}</p>
          </div>
          <button
            onClick={onClose}
            className="w-7 h-7 rounded-full bg-slate-100 dark:bg-white/10 flex items-center justify-center text-muted hover:text-title"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Binary Status Toggle */}
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Attendance Status</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setStatus('present')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                status === 'present'
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-sm'
                  : 'input-glass text-muted hover:text-title'
              }`}
            >
              Present
            </button>
            <button
              type="button"
              onClick={() => setStatus('absent')}
              className={`py-2 rounded-xl text-xs font-bold transition-all ${
                status === 'absent'
                  ? 'bg-gradient-to-r from-red-600 to-rose-700 text-white shadow-sm'
                  : 'input-glass text-muted hover:text-title'
              }`}
            >
              Absent
            </button>
          </div>
        </div>

        {/* Reason Tags */}
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1.5">Common Reason Tag</label>
          <div className="grid grid-cols-2 gap-1.5">
            {REASON_TAGS.map(tag => (
              <button
                key={tag}
                type="button"
                onClick={() => setSelectedTag(tag === selectedTag ? '' : tag)}
                className={`py-2 px-2.5 rounded-xl text-xs font-medium text-left transition-all border ${
                  selectedTag === tag
                    ? 'border-red-500/70 bg-red-500/10 text-red-600 dark:text-red-400 font-bold'
                    : 'border-slate-200/60 dark:border-white/10 input-glass text-muted'
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>

        {/* Custom Remarks */}
        <div>
          <label className="text-[10px] font-bold text-muted uppercase tracking-wider block mb-1">Teacher's Note / Remark</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="Add specific context, parent communication, or details..."
            rows={2}
            maxLength={200}
            className="input-glass w-full p-2.5 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-red-500"
          />
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl glass-card border border-slate-200 dark:border-white/10 text-xs font-bold text-muted"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl btn-uniform text-xs font-extrabold tracking-wide uppercase flex items-center justify-center gap-1.5"
          >
            <Check className="w-4 h-4" />
            Save Remark
          </button>
        </div>
      </div>
    </div>
  );
}
