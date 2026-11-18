import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  User,
  ShieldCheck,
  Clock,
  Building2,
  Phone,
} from 'lucide-react';
import { MoaLogo } from '../MoaLogo';
import { btn, pill, statusTone } from '../ui/theme';
import { Registrant } from '../../pages/desk/RegistrationsPage';

interface MemberCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrant: Registrant | null;
}

export const MemberCardModal: React.FC<MemberCardModalProps> = ({
  isOpen,
  onClose,
  registrant,
}) => {
  if (!isOpen || !registrant) return null;

  const handlePrint = () => {
    window.print();
  };

  const getShiftBadge = (shift?: string | null) => {
    switch (shift) {
      case 'MORNING':
        return (
          <span className={`${pill} ${statusTone.morning}`}>
            <Clock className="w-3 h-3 text-amber-700" />
            <span>Morning (11:00 – 1:30)</span>
          </span>
        );
      case 'EVENING':
        return (
          <span className={`${pill} ${statusTone.evening}`}>
            <Clock className="w-3 h-3 text-indigo-700" />
            <span>Evening (11:30 – 3:00)</span>
          </span>
        );
      default:
        return (
          <span className={`${pill} ${statusTone.neutral}`}>
            <span>Flexible Hours</span>
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn print:p-0 print:bg-white print:static">
      <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden print:border-none print:shadow-none print:max-w-none">
        {/* Screen Action Bar (Hidden on Print) */}
        <div className="no-print px-5 py-3.5 bg-slate-800 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-moa-gold" />
            <span>Member Gate Pass Card</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handlePrint}
              className="inline-flex items-center gap-1 px-3 py-1 bg-[#00843D] hover:bg-[#0B6B3A] text-white rounded-[6px] text-xs font-semibold shadow-xs transition cursor-pointer"
            >
              <Printer className="h-3.5 w-3.5" />
              <span>Print</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Printable Digital Card */}
        <div id="moa-gym-single-card" className="p-6 flex flex-col items-center text-center space-y-4">
          {/* Top Emblem & Header */}
          <div className="w-full bg-[#00843D] -mx-6 -mt-6 px-6 py-4 text-white relative">
            <div className="absolute top-0 left-0 right-0 h-1 bg-[#FCDD09]"></div>
            <div className="flex items-center justify-center gap-2 mb-1">
              <MoaLogo className="h-6 w-6 text-white brightness-0 invert" />
              <span className="text-[11px] font-black uppercase tracking-wider text-white">
                Ministry of Agriculture
              </span>
            </div>
            <h2 className="text-xs font-semibold text-emerald-100 uppercase tracking-widest">
              Staff Wellness & Fitness Gymnasium
            </h2>
            <div className="inline-block mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
              Official Digital Entry Pass
            </div>
          </div>

          {/* Avatar or Photo */}
          <div className="relative pt-2">
            {registrant.hrRecord?.photoUrl ? (
              <img
                src={registrant.hrRecord.photoUrl}
                alt={registrant.fullName}
                className="h-20 w-20 rounded-2xl object-cover ring-3 ring-[#00843D]/20 shadow-xs"
              />
            ) : (
              <div className="h-20 w-20 rounded-2xl bg-emerald-50 text-[#00843D] flex items-center justify-center font-bold text-2xl border-2 border-emerald-200 shadow-2xs">
                <User className="h-10 w-10 text-emerald-700" />
              </div>
            )}
            <span
              title={`Registration #${registrant.regNumber}`}
              className="absolute -bottom-1 -right-2 px-2 py-0.5 bg-[#00843D] text-white font-mono font-bold text-[10px] rounded-full shadow-2xs border-2 border-white"
            >
              #{registrant.regNumber}
            </span>
          </div>

          {/* Member Name & ID */}
          <div className="space-y-1">
            <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
              {registrant.fullName}
            </h3>
            <p className="text-xs font-mono font-bold text-emerald-800">
              {registrant.employeeId}
            </p>
            <p className="text-xs text-slate-500 font-medium">
              {registrant.department}
            </p>
          </div>

          {/* Shift Badge */}
          <div>{getShiftBadge(registrant.shiftPreference)}</div>

          {/* Static Offline QR Code */}
          <div className="p-3 bg-white border-2 border-slate-200 rounded-xl shadow-inner inline-block">
            <QRCodeSVG
              value={registrant.employeeId}
              size={160}
              level="H"
              includeMargin={true}
            />
          </div>

          <div className="space-y-0.5">
            <p className="text-xs font-semibold text-slate-800">Permanent Member Pass</p>
            <p className="text-[11px] text-slate-400">
              Scan at gym gate terminal or provide Employee ID
            </p>
          </div>

          {/* Bottom Card Footer */}
          <div className="w-full bg-slate-50 -mx-6 -mb-6 px-6 py-2.5 border-t border-slate-200 text-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
              Federal Democratic Republic of Ethiopia
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
