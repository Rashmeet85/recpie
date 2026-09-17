import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PrintableStudentIdCard({ student, isOpen, onClose }) {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const el = document.getElementById('printableIdCardContainer');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 3 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('l', 'mm', [85.6, 53.98]); // Standard CR80 ID Card
    pdf.addImage(imgData, 'PNG', 0, 0, 85.6, 53.98);
    pdf.save(`${student.studentId}_ID_Card.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3">
      <div className="bg-white text-slate-900 w-full max-w-sm rounded-3xl shadow-2xl p-5 space-y-4 animate-scale-in">
        <div className="flex items-center justify-between border-b pb-2 border-slate-200">
          <div>
            <h3 className="text-sm font-extrabold text-slate-900">Student Identity Card</h3>
            <p className="text-[10px] text-slate-500">CR80 Pocket Laminated Format</p>
          </div>
          <button onClick={onClose} className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 hover:text-slate-800">
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* ID Card Front View */}
        <div
          id="printableIdCardContainer"
          className="w-full h-[190px] rounded-2xl p-3.5 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-950 text-white shadow-xl flex flex-col justify-between border border-white/20 relative overflow-hidden"
        >
          {/* Subtle Brand Accent Lines */}
          <div className="absolute -top-12 -right-12 w-28 h-28 bg-red-600/30 rounded-full blur-xl pointer-events-none"></div>
          <div className="absolute -bottom-10 -left-10 w-24 h-24 bg-emerald-500/20 rounded-full blur-xl pointer-events-none"></div>

          {/* Top Brand Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-1.5 relative z-10">
            <div className="flex items-center gap-1.5">
              <div className="w-1 h-5 rounded-full bg-orange-500"></div>
              <div className="leading-none">
                <span className="text-[9px] font-black text-orange-400">INITIATORS </span>
                <span className="text-[9px] font-black text-emerald-400">CHANGE</span>
              </div>
            </div>
            <span className="text-[8px] uppercase tracking-widest font-extrabold text-red-400 bg-red-500/20 px-1.5 py-0.5 rounded border border-red-500/30">
              Project Usaari
            </span>
          </div>

          {/* Card Body */}
          <div className="flex items-center gap-3 relative z-10">
            {/* Avatar Initials Badge */}
            <div className="w-14 h-16 rounded-xl bg-gradient-to-tr from-red-600 to-orange-500 flex items-center justify-center text-white font-black text-lg shadow-md border-t border-white/40 flex-shrink-0">
              {student.fullName ? student.fullName.slice(0, 2).toUpperCase() : 'ST'}
            </div>

            <div className="space-y-0.5 leading-tight flex-1 min-w-0">
              <h4 className="font-extrabold text-xs text-white truncate">{student.fullName}</h4>
              <p className="font-mono text-[9px] text-red-400 font-bold">{student.studentId}</p>
              <p className="text-[9px] text-slate-300 font-medium">{student.grade} • Age: {student.calculatedAge}y</p>
              <p className="text-[8px] text-slate-400">Blood: <strong className="text-white">{student.bloodGroup || 'O+'}</strong></p>
            </div>
          </div>

          {/* Bottom Bar with Emergency Contact */}
          <div className="flex items-center justify-between border-t border-white/10 pt-1.5 text-[8px] text-slate-400 relative z-10">
            <span>Parent: {student.guardianName || 'Guardian'}</span>
            <span className="font-mono text-white font-bold">{student.primaryPhone}</span>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 pt-1">
          <button
            onClick={handlePrint}
            className="flex-1 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Printer className="w-3.5 h-3.5" /> Print
          </button>
          <button
            onClick={handleDownloadPDF}
            className="flex-1 py-2 rounded-xl btn-uniform text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Save PDF
          </button>
        </div>
      </div>
    </div>
  );
}
