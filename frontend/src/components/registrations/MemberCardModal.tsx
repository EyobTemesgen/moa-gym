import React from 'react';
import { QRCodeSVG } from 'qrcode.react';
import {
  X,
  Printer,
  User,
  ShieldCheck,
  Clock,
} from 'lucide-react';
import { MoaLogo } from '../MoaLogo';
import { pill, statusTone } from '../ui/theme';
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
    <div
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs animate-fadeIn p-2 sm:p-4 print:p-0 print:bg-white print:static print:min-h-0 print:overflow-visible"
    >
      <div className="flex min-h-full items-center justify-center p-2 text-center print:p-0">
        <div
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col text-left my-auto max-h-[calc(100vh-2rem)] print:max-h-none print:border-none print:shadow-none print:max-w-none print:overflow-visible"
        >
          {/* Screen Action Bar (Sticky, Never Cut Off, Hidden on Print) */}
          <div className="no-print print:hidden sticky top-0 z-10 px-3.5 py-2 bg-slate-800 text-white flex items-center justify-between shrink-0 border-b border-slate-700/60">
            <div className="flex items-center gap-1.5 text-xs font-semibold">
              <ShieldCheck className="h-4 w-4 text-moa-gold" />
              <span>Member Gate Pass Card</span>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handlePrint}
                className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#00843D] hover:bg-[#0B6B3A] text-white rounded-[6px] text-xs font-semibold shadow-xs transition cursor-pointer"
              >
                <Printer className="h-3.5 w-3.5" />
                <span>Print</span>
              </button>
              <button
                type="button"
                onClick={onClose}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition cursor-pointer"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Printable Digital Card (Scrollable if screen is very short, fitted for standard viewports) */}
          <div
            id="moa-gym-single-card"
            className="overflow-y-auto flex-1 flex flex-col items-center text-center print:overflow-visible"
          >
            {/* Top Emblem & Header */}
            <div className="w-full bg-[#00843D] px-4 py-2.5 text-white relative shrink-0">
              <div className="absolute top-0 left-0 right-0 h-1 bg-[#FCDD09]"></div>
              <div className="flex items-center justify-center gap-1.5 mb-0.5">
                <MoaLogo className="h-4.5 w-4.5 text-white brightness-0 invert" />
                <span className="text-[11px] font-black uppercase tracking-wider text-white">
                  Ministry of Agriculture
                </span>
              </div>
              <h2 className="text-[10px] font-semibold text-emerald-100 uppercase tracking-wider">
                Staff Wellness & Fitness Gymnasium
              </h2>
              <div className="inline-block mt-1 px-2 py-0.5 rounded-full text-[8.5px] font-bold uppercase tracking-wider bg-white/20 text-white backdrop-blur-xs">
                Official Digital Entry Pass
              </div>
            </div>

            {/* Card Body */}
            <div className="w-full p-3.5 sm:p-4 flex flex-col items-center space-y-2">
              {/* Avatar or Photo */}
              <div className="relative pt-0.5">
                {registrant.hrRecord?.photoUrl ? (
                  <img
                    src={registrant.hrRecord.photoUrl}
                    alt={registrant.fullName}
                    className="h-14 w-14 rounded-xl object-cover ring-2 ring-[#00843D]/20 shadow-xs"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-xl bg-emerald-50 text-[#00843D] flex items-center justify-center font-bold text-lg border-2 border-emerald-200 shadow-2xs">
                    <User className="h-7 w-7 text-emerald-700" />
                  </div>
                )}
                <span
                  title={`Registration #${registrant.regNumber}`}
                  className="absolute -bottom-1 -right-2 px-1.5 py-0.2 bg-[#00843D] text-white font-mono font-bold text-[8.5px] rounded-full shadow-2xs border-2 border-white"
                >
                  #{registrant.regNumber}
                </span>
              </div>

              {/* Member Name & ID */}
              <div className="space-y-0.5 max-w-[260px]">
                <h3 className="text-sm font-bold text-slate-900 tracking-tight leading-snug">
                  {registrant.fullName}
                </h3>
                <p className="text-[10.5px] font-mono font-bold text-emerald-800">
                  {registrant.employeeId}
                </p>
                <p className="text-[10.5px] text-slate-500 font-medium truncate">
                  {registrant.department}
                </p>
              </div>

              {/* Shift Badge */}
              <div>{getShiftBadge(registrant.shiftPreference)}</div>

              {/* Static Offline QR Code */}
              <div className="p-1.5 bg-white border border-slate-200 rounded-xl shadow-inner inline-block">
                <QRCodeSVG
                  value={registrant.employeeId}
                  size={118}
                  level="H"
                  includeMargin={true}
                />
              </div>

              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-800">Permanent Member Pass</p>
                <p className="text-[9.5px] text-slate-400">
                  Scan at gym gate terminal or provide Employee ID
                </p>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="w-full bg-slate-50 px-4 py-1.5 border-t border-slate-200 text-center shrink-0 mt-auto">
              <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">
                Federal Democratic Republic of Ethiopia
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
