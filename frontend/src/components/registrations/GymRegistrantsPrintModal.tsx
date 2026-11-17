import React from 'react';
import { MoaLogo } from '../MoaLogo';
import { X, Printer } from 'lucide-react';

interface GymRegistrantsPrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  items: any[];
  totalCount: number;
  selectedDepartment?: string;
}

export const GymRegistrantsPrintModal: React.FC<GymRegistrantsPrintModalProps> = ({
  isOpen,
  onClose,
  items,
  totalCount,
  selectedDepartment = 'ALL',
}) => {
  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const todayGregorian = new Date().toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:my-0 print:max-w-none print:w-full print:max-h-none">
        {/* Screen Action Bar (hidden on print) */}
        <div className="px-6 py-3 bg-slate-800 text-white flex items-center justify-between shrink-0 print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Printer className="h-4 w-4 text-moa-gold" />
            <span>Official Registrants Roster Document (Print Preview)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-moa-green hover:bg-moa-green-dark text-white rounded-lg text-xs font-bold shadow transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>Print / Save as PDF</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Official Printable Document Container */}
        <div className="flex-1 overflow-y-auto p-8 sm:p-12 print:p-6 print:overflow-visible bg-white space-y-6 text-slate-900 font-sans min-h-0">
          {/* Institutional Top Tri-color Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue"></div>

          {/* Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-moa-green pb-4">
            <div className="flex items-center gap-4">
              <MoaLogo className="h-16 w-16" size={64} />
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight uppercase">
                  Federal Democratic Republic of Ethiopia
                </h1>
                <h2 className="text-sm font-bold text-moa-green tracking-normal font-sans">
                  Ministry of Agriculture
                </h2>
                <div className="text-[11px] font-semibold text-slate-600 uppercase tracking-wider mt-0.5">
                  Staff Wellness & Gymnasium Management Center
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-600 font-mono">
              <div>Date: <strong>{todayGregorian}</strong></div>
              <div>Total Enrolled: <strong>{totalCount}</strong></div>
              {selectedDepartment !== 'ALL' && (
                <div className="text-moa-green font-bold">Department: {selectedDepartment}</div>
              )}
            </div>
          </div>

          {/* Official Document Title */}
          <div className="text-center py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide uppercase">
              Staff Gymnasium Registrants Master Roster
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Official Institutional Register of Ministry of Agriculture Enrolled Personnel
            </p>
          </div>

          {/* Table matching the paper columns in English */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold text-[11px]">
                  <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">No.</th>
                  <th className="py-2.5 px-4 border-r border-slate-300">Full Name</th>
                  <th className="py-2.5 px-4 border-r border-slate-300">Directorate / Department</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-28">Employee ID</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-28">Phone</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-24">Date</th>
                  <th className="py-2.5 px-4 w-28 text-center">Signature</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {items.map((row, idx) => (
                  <tr key={row.id || idx} className="hover:bg-slate-50/50">
                    <td className="py-2 px-3 border-r border-slate-200 text-center font-bold font-mono text-slate-700">
                      {row.regNumber ?? idx + 1}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 font-bold text-slate-900">
                      {row.fullName}
                    </td>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-700 font-medium">
                      {row.department}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 font-mono text-[11px] text-slate-600">
                      {row.employeeId || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-600 font-mono text-[11px]">
                      {row.phone || '—'}
                    </td>
                    <td className="py-2 px-3 border-r border-slate-200 text-slate-500 font-mono text-[10px]">
                      {row.registeredAt
                        ? new Date(row.registeredAt).toLocaleDateString('en-GB')
                        : todayGregorian}
                    </td>
                    <td className="py-1 px-4 text-center">
                      {row.signatureData ? (
                        <img
                          src={row.signatureData}
                          alt="Signature"
                          className="h-7 max-w-[90px] mx-auto object-contain"
                        />
                      ) : row.signatureConfirmed ? (
                        <span className="font-serif italic font-bold text-moa-green-dark text-xs">
                          {row.fullName.split(' ')[0]} ✍️
                        </span>
                      ) : (
                        <span className="text-slate-300">________________</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Official Signatory Blocks */}
          <div className="pt-6 border-t-2 border-slate-300 grid grid-cols-3 gap-6 text-[11px] text-slate-700">
            <div className="space-y-4">
              <div className="font-bold text-slate-900">Prepared by:</div>
              <div className="space-y-1.5 pt-2">
                <div>Name: ________________________</div>
                <div>Position: <strong>Gym Attendant / Desk Officer</strong></div>
                <div>Signature: ________________________</div>
                <div>Date: ________________________</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-slate-900">Verified by:</div>
              <div className="space-y-1.5 pt-2">
                <div>Name: ________________________</div>
                <div>Position: <strong>Security & Access Control Lead</strong></div>
                <div>Signature: ________________________</div>
                <div>Date: ________________________</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-slate-900">Approved by:</div>
              <div className="space-y-1.5 pt-2">
                <div>Name: ________________________</div>
                <div>Position: <strong>Human Resource Directorate</strong></div>
                <div>Signature: ________________________</div>
                <div>Date: ________________________</div>
              </div>
            </div>
          </div>

          {/* Document Footer Notice */}
          <div className="text-center pt-4 border-t border-slate-200 text-[10px] text-slate-400">
            © 2026 Federal Democratic Republic of Ethiopia Ministry of Agriculture · Internal Civil Service Wellness Center
          </div>
        </div>
      </div>
    </div>
  );
};
