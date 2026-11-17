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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto print:p-0 print:bg-white print:static">
      <div className="bg-white w-full max-w-4xl rounded-2xl shadow-2xl border border-slate-200 overflow-hidden my-8 print:border-none print:shadow-none print:my-0 print:max-w-none print:w-full">
        {/* Screen Action Bar (hidden on print) */}
        <div className="px-6 py-3 bg-slate-800 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <Printer className="h-4 w-4 text-moa-gold" />
            <span>ኦፊሴላዊ የተመዝጋቢዎች ስም ዝርዝር ሰነድ (Print Preview)</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-moa-green hover:bg-moa-green-dark text-white rounded-lg text-xs font-bold shadow transition cursor-pointer"
            >
              <Printer className="h-4 w-4" />
              <span>አትም (Print / Save PDF)</span>
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
        <div className="p-8 sm:p-12 print:p-6 bg-white space-y-6 text-slate-900 font-sans">
          {/* Institutional Top Tri-color Bar */}
          <div className="h-1.5 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue"></div>

          {/* Letterhead */}
          <div className="flex items-center justify-between border-b-2 border-moa-green pb-4">
            <div className="flex items-center gap-4">
              <MoaLogo className="h-16 w-16" size={64} />
              <div>
                <h1 className="text-base font-extrabold text-slate-900 tracking-tight leading-tight">
                  የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ ግብርና ሚኒስቴር
                </h1>
                <h2 className="text-xs font-semibold text-slate-700 tracking-normal font-sans">
                  Federal Democratic Republic of Ethiopia — Ministry of Agriculture
                </h2>
                <div className="text-[11px] font-bold text-moa-green uppercase tracking-wider mt-0.5">
                  የሰራተኞች ደህንነትና የአካል ብቃት ማዕከል · Staff Wellness & Fitness Center
                </div>
              </div>
            </div>

            <div className="text-right text-[11px] text-slate-600 font-mono">
              <div>ቀን (Date): <strong>{todayGregorian}</strong></div>
              <div>ድምር ተመዝጋቢዎች፡ <strong>{totalCount}</strong></div>
              {selectedDepartment !== 'ALL' && (
                <div className="text-moa-green font-bold">ክፍል፡ {selectedDepartment}</div>
              )}
            </div>
          </div>

          {/* Official Document Title matching user's paper form */}
          <div className="text-center py-2 bg-slate-50 border border-slate-200 rounded-lg">
            <h2 className="text-base sm:text-lg font-black text-slate-900 tracking-wide font-sans">
              ግብርና ሚ/ር ሰራተኞች የጂምናዚየም ተመዝጋቢዎች ስም ዝርዝር
            </h2>
            <p className="text-[11px] text-slate-600 font-medium">
              Ministry of Agriculture Staff Gym Registered Members Roster
            </p>
          </div>

          {/* Table matching the paper columns */}
          <div className="border border-slate-300 rounded-lg overflow-hidden">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-100 border-b border-slate-300 text-slate-800 font-bold text-[11px]">
                  <th className="py-2.5 px-3 border-r border-slate-300 w-12 text-center">ተ.ቁ</th>
                  <th className="py-2.5 px-4 border-r border-slate-300">ስም ዝርዝር (Full Name)</th>
                  <th className="py-2.5 px-4 border-r border-slate-300">የስራ ክፍል (Directorate)</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-28">መለያ ቁ. (ID)</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-28">ስልክ (Phone)</th>
                  <th className="py-2.5 px-3 border-r border-slate-300 w-24">ቀን (Date)</th>
                  <th className="py-2.5 px-4 w-28 text-center">ፊርማ (Signature)</th>
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
              <div className="font-bold text-slate-900">ያዘጋጀው (Prepared by):</div>
              <div className="space-y-1.5 pt-2">
                <div>ስም፡ ________________________</div>
                <div>የስራ መደብ፡ <strong>የጂም አስተባባሪ / Desk</strong></div>
                <div>ፊርማ፡ ________________________</div>
                <div>ቀን፡ ________________________</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-slate-900">ያረጋገጠው (Verified by):</div>
              <div className="space-y-1.5 pt-2">
                <div>ስም፡ ________________________</div>
                <div>የስራ መደብ፡ <strong>የደህንነት አገልግሎት ኃላፊ</strong></div>
                <div>ፊርማ፡ ________________________</div>
                <div>ቀን፡ ________________________</div>
              </div>
            </div>

            <div className="space-y-4">
              <div className="font-bold text-slate-900">ያፀደቀው (Approved by):</div>
              <div className="space-y-1.5 pt-2">
                <div>ስም፡ ________________________</div>
                <div>የስራ መደብ፡ <strong>የሰው ሃብት ዳይሬክቶሬት</strong></div>
                <div>ፊርማ፡ ________________________</div>
                <div>ቀን፡ ________________________</div>
              </div>
            </div>
          </div>

          {/* Document Footer Notice */}
          <div className="text-center pt-4 border-t border-slate-200 text-[10px] text-slate-400">
            © 2026 የኢትዮጵያ ፌዴራላዊ ዲሞክራሲያዊ ሪፐብሊክ ግብርና ሚኒስቴር · የውስጥ ሰራተኞች ደህንነት ማዕከል አገልግሎት
          </div>
        </div>
      </div>
    </div>
  );
};
