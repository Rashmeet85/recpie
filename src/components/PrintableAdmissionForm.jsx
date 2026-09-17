import React from 'react';
import { Printer, Download, X } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export default function PrintableAdmissionForm({ student, isOpen, onClose }) {
  if (!isOpen || !student) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadPDF = async () => {
    const el = document.getElementById('printableDossierSheet');
    if (!el) return;
    const canvas = await html2canvas(el, { scale: 2 });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgWidth = 210;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${student.studentId}_Admission_Dossier.pdf`);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-md p-3 overflow-y-auto">
      <div className="bg-white text-slate-900 w-full max-w-2xl rounded-3xl shadow-2xl p-6 space-y-4 my-8 max-h-[90vh] overflow-y-auto no-scrollbar">
        {/* Toolbar */}
        <div className="flex items-center justify-between no-print border-b pb-3 border-slate-200">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">Official Student Admission Dossier</h3>
            <p className="text-xs text-slate-500">Project Usaari Evening School • Initiators of Change</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <Printer className="w-3.5 h-3.5" /> Print A4
            </button>
            <button
              onClick={handleDownloadPDF}
              className="px-3 py-1.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
            >
              <Download className="w-3.5 h-3.5" /> Save PDF
            </button>
            <button
              onClick={onClose}
              className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:text-slate-900"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* A4 Printable Sheet */}
        <div id="printableDossierSheet" className="p-6 bg-white border border-slate-300 rounded-2xl space-y-6 text-slate-900">
          {/* Header */}
          <div className="flex items-center justify-between border-b-2 border-red-600 pb-4">
            <div>
              <span className="text-[10px] uppercase font-black tracking-widest text-orange-600">Initiators of Change</span>
              <h1 className="text-xl font-black text-slate-900">PROJECT USAARI EVENING SCHOOL</h1>
              <p className="text-xs text-slate-600 font-medium">Free Evening Learning Center & Child Welfare Program</p>
            </div>
            <div className="text-right">
              <span className="text-[10px] font-bold text-slate-500 uppercase block">Registration ID</span>
              <span className="font-mono text-base font-black text-red-600">{student.studentId}</span>
              <span className="text-[9px] text-slate-400 block mt-0.5">Date: {student.admissionDate || '2026-01-15'}</span>
            </div>
          </div>

          {/* Top Section: Photo Box & Basic Identity */}
          <div className="grid grid-cols-4 gap-4 items-center">
            <div className="col-span-1 flex flex-col items-center justify-center border-2 border-dashed border-slate-300 rounded-xl h-32 bg-slate-50 p-2 text-center">
              <span className="text-2xl">👤</span>
              <span className="text-[9px] font-bold text-slate-400 uppercase mt-1">Affix Photo (35x45mm)</span>
            </div>
            <div className="col-span-3 space-y-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Student Full Name</span>
                  <span className="font-black text-sm text-slate-900">{student.fullName}</span>
                </div>
                <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Academic Placement</span>
                  <span className="font-black text-sm text-slate-900">{student.grade} ({student.shift || 'Evening'})</span>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Date of Birth</span>
                  <span className="font-bold text-xs text-slate-900">{student.dateOfBirth}</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Age at Admission</span>
                  <span className="font-black text-xs text-emerald-700">{student.calculatedAge} Years</span>
                </div>
                <div className="p-2 rounded-lg bg-slate-50 border border-slate-200">
                  <span className="text-[9px] font-bold text-slate-500 uppercase block">Blood Group</span>
                  <span className="font-black text-xs text-red-600">{student.bloodGroup || 'O+'}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Guardian & Contact Information */}
          <div className="space-y-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-slate-700 border-b pb-1">Guardian & Emergency Details</h4>
            <div className="grid grid-cols-3 gap-3">
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Parent / Guardian Name</span>
                <span className="font-bold text-xs text-slate-900">{student.guardianName} ({student.guardianRelationship || 'Guardian'})</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Primary Contact</span>
                <span className="font-mono font-bold text-xs text-slate-900">{student.primaryPhone}</span>
              </div>
              <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[9px] font-bold text-slate-500 uppercase block">Emergency Phone</span>
                <span className="font-mono font-bold text-xs text-slate-900">{student.emergencyPhone || student.primaryPhone}</span>
              </div>
            </div>
            <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-200">
              <span className="text-[9px] font-bold text-slate-500 uppercase block">Residential Locality & Address</span>
              <span className="text-xs text-slate-800 font-medium">{student.residentialAddress || 'Ludhiana, Punjab'}</span>
            </div>
          </div>

          {/* School Declaration & Signatures */}
          <div className="space-y-4 pt-2">
            <p className="text-[10px] text-slate-500 leading-relaxed italic">
              Declaration: The student is enrolled under Project Usaari Evening School run by Initiators of Change. Education and learning supplies are provided free of cost. Regular attendance in evening sessions (5:00 PM - 7:30 PM) is mandatory.
            </p>
            <div className="grid grid-cols-2 gap-8 pt-6">
              <div className="border-t border-slate-400 pt-1 text-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Parent / Guardian Signature</span>
              </div>
              <div className="border-t border-slate-400 pt-1 text-center">
                <span className="text-[10px] font-bold text-slate-600 uppercase">Head of School / Coordinator Signature</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
