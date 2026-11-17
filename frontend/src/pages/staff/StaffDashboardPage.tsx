import React, { useState, useEffect } from 'react';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Clock,
  Printer,
  ShieldCheck,
  User,
  LogOut,
  Building2,
  Key,
  Info,
  CheckCircle2,
  Calendar,
} from 'lucide-react';
import { MoaLogo } from '../../components/MoaLogo';
import { OccupancyBanner } from '../../components/OccupancyBanner';
import { btn, pill, statusTone } from '../../components/ui/theme';

interface ProfileData {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  regNumber?: number | null;
  shiftPreference?: string | null;
  gymStatus?: string;
  gymRegisteredAt?: string | null;
  activeSession: {
    id: string;
    checkInTime: string;
    lockerNumber?: string;
  } | null;
}

export const StaffDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchProfile = async () => {
    try {
      const p = await apiRequest('/users/me');
      setProfile(p);
    } catch (e) {
      console.error('Failed to load profile', e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSelfCheckout = async () => {
    if (!profile?.activeSession) return;
    setIsCheckingOut(true);
    try {
      await apiRequest('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ identifier: profile.activeSession.id }),
      });
      await fetchProfile();
    } catch (err: any) {
      alert(err.message || 'Check-out failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  const handlePrintBadge = () => {
    window.print();
  };

  const passValue = profile?.employeeId || user?.employeeId || 'MOA-MEMBER';

  const getShiftBadge = (shift?: string | null) => {
    switch (shift) {
      case 'MORNING':
        return (
          <span className={`${pill} ${statusTone.morning}`}>
            <Clock className="w-3 h-3 text-amber-700" />
            <span>ጠዋት / Morning (11:00 – 1:30)</span>
          </span>
        );
      case 'EVENING':
        return (
          <span className={`${pill} ${statusTone.evening}`}>
            <Clock className="w-3 h-3 text-indigo-700" />
            <span>ማታ / Evening (11:30 – 3:00)</span>
          </span>
        );
      default:
        return (
          <span className={`${pill} ${statusTone.neutral}`}>
            <span>Flexible / ማንኛውም ሰዓት</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Member Identity & Live Session Status */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.fullName}
              className="h-14 w-14 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
            />
          ) : (
            <div className="h-14 w-14 rounded-xl bg-emerald-50 text-[#00843D] flex items-center justify-center font-bold text-xl border border-emerald-200 shrink-0">
              <User className="h-7 w-7" />
            </div>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-lg font-bold text-slate-900 tracking-tight truncate">
                {user?.fullName}
              </h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00843D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
                <ShieldCheck className="h-3 w-3" />
                Active Member
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5 truncate">
              {user?.employeeId} · {user?.department}
            </p>
          </div>
        </div>

        {/* Current In-Gym Session Status */}
        {profile?.activeSession ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 flex items-center justify-between gap-4 shrink-0 shadow-2xs">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Currently Inside Gymnasium
              </div>
              <p className="text-[11px] text-slate-600 mt-0.5">
                Checked in at:{' '}
                <span className="font-semibold text-slate-900">
                  {new Date(profile.activeSession.checkInTime).toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </span>
                {profile.activeSession.lockerNumber && (
                  <span className="font-semibold text-emerald-800 ml-1.5">
                    · Locker #{profile.activeSession.lockerNumber}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSelfCheckout}
              disabled={isCheckingOut}
              className="px-3 h-8 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-[6px] shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50 select-none"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isCheckingOut ? 'Checking out...' : 'Check Out'}</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3.5 py-2 rounded-lg shrink-0">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span>Not currently inside facility</span>
          </div>
        )}
      </div>

      {/* Main Grid: Digital Badge Card (Left) & Gym Information (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official Permanent Digital Membership Badge */}
        <div className="lg:col-span-5 flex flex-col items-center">
          {/* Printable Digital Card */}
          <div
            id="moa-gym-badge"
            className="w-full max-w-sm bg-white rounded-2xl border-2 border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg"
          >
            {/* Top Official Header with MoA Green */}
            <div className="bg-[#00843D] px-5 py-4 text-white text-center relative">
              {/* MoA Gold Accent Stripe */}
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

            {/* Card Body */}
            <div className="p-6 flex flex-col items-center text-center space-y-4">
              {/* Staff Photo or Avatar */}
              <div className="relative">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.fullName}
                    className="h-20 w-20 rounded-2xl object-cover ring-3 ring-[#00843D]/20 shadow-xs"
                  />
                ) : (
                  <div className="h-20 w-20 rounded-2xl bg-emerald-50 text-[#00843D] flex items-center justify-center font-bold text-2xl border-2 border-emerald-200 shadow-2xs">
                    <User className="h-10 w-10 text-emerald-700" />
                  </div>
                )}
                {profile?.regNumber && (
                  <span
                    title={`Roster Registration #${profile.regNumber}`}
                    className="absolute -bottom-2 -right-2 px-2 py-0.5 bg-[#00843D] text-white font-mono font-bold text-[10px] rounded-full shadow-2xs border-2 border-white"
                  >
                    #{profile.regNumber}
                  </span>
                )}
              </div>

              {/* Staff Details */}
              <div className="space-y-1">
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {user?.fullName}
                </h3>
                <p className="text-xs font-mono font-bold text-emerald-800">
                  {user?.employeeId}
                </p>
                <p className="text-xs text-slate-500">
                  {user?.department}
                </p>
              </div>

              {/* Shift Badge */}
              <div>{getShiftBadge(profile?.shiftPreference)}</div>

              {/* Static Permanent QR Code */}
              <div className="p-3.5 bg-white border-2 border-slate-200 rounded-xl shadow-inner inline-block">
                <QRCodeSVG
                  value={passValue}
                  size={180}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* QR Explanation */}
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-800">
                  Permanent Member Gate Code
                </p>
                <p className="text-[11px] text-slate-400">
                  Valid for entrance verification at gym gate terminal
                </p>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-5 py-2.5 text-center">
              <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider">
                Federal Democratic Republic of Ethiopia
              </span>
            </div>
          </div>

          {/* Action Toolbar below Card */}
          <div className="no-print mt-4 flex items-center gap-2.5">
            <button
              type="button"
              onClick={handlePrintBadge}
              className={btn.secondary}
              title="Print official membership pass"
            >
              <Printer className="h-4 w-4 text-slate-500" />
              <span>Print Member Pass</span>
            </button>
          </div>

          <p className="no-print text-[11px] text-slate-500 text-center mt-2.5 max-w-xs">
            Works 100% offline. You can save or screenshot this QR pass on your phone, or simply provide your MoA Employee ID at the gate.
          </p>
        </div>

        {/* Right Column: Live Occupancy & Gym Guidelines */}
        <div className="lg:col-span-7 space-y-5 no-print">
          {/* Live Facility Occupancy */}
          <OccupancyBanner />

          {/* Operating Hours & Shifts Schedule */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#00843D]" />
              <h3 className="text-sm font-bold text-slate-900">
                Official Gymnasium Operating Shifts
              </h3>
            </div>
            <p className="text-xs text-slate-500 mb-4">
              To balance equipment availability and ensure a comfortable environment, sessions are organized by shifts:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* Morning Shift */}
              <div
                className={`p-4 rounded-xl border text-left transition ${
                  profile?.shiftPreference === 'MORNING'
                    ? 'border-emerald-300 bg-emerald-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-emerald-950">ጠዋት / Morning Shift</span>
                  </div>
                  {profile?.shiftPreference === 'MORNING' && (
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-200/80 px-2 py-0.5 rounded-full">
                      Your Shift
                    </span>
                  )}
                </div>
                <div className="text-base font-mono font-extrabold text-slate-900">
                  ከማለዳው 11:00 – 1:30
                </div>
                <div className="text-xs font-mono text-emerald-700 font-semibold mt-0.5">
                  5:00 AM – 7:30 AM (Standard Time)
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  ቅድመ-ስራ ስፖርታዊ እንቅስቃሴ (Pre-work training session)
                </p>
              </div>

              {/* Evening Shift */}
              <div
                className={`p-4 rounded-xl border text-left transition ${
                  profile?.shiftPreference === 'EVENING'
                    ? 'border-indigo-300 bg-indigo-50/70 shadow-xs'
                    : 'border-slate-200 bg-slate-50/60'
                }`}
              >
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-indigo-950">ማታ / Evening Shift</span>
                  </div>
                  {profile?.shiftPreference === 'EVENING' && (
                    <span className="text-[10px] font-bold text-indigo-800 bg-indigo-200/80 px-2 py-0.5 rounded-full">
                      Your Shift
                    </span>
                  )}
                </div>
                <div className="text-base font-mono font-extrabold text-slate-900">
                  ከ11:30 – ምሽት 3:00
                </div>
                <div className="text-xs font-mono text-indigo-700 font-semibold mt-0.5">
                  5:30 PM – 9:00 PM (Standard Time)
                </div>
                <p className="text-[11px] text-slate-500 mt-1.5">
                  ከስራ ሰዓት በኋላ (Post-office evening workout session)
                </p>
              </div>
            </div>
          </div>

          {/* Gate Access Guidelines */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-[#00843D]" />
              <h3 className="text-sm font-bold text-slate-900">
                Gate Verification & Facility Rules
              </h3>
            </div>

            <ul className="space-y-2.5 text-xs text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Gate Verification:</strong> Hold your permanent QR pass up to the entrance scanner or show your physical MoA employee badge to the desk attendant.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Lockers:</strong> Locker keys are issued at the front desk upon check-in. Please return the key before leaving.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Attire:</strong> Appropriate athletic footwear and gym sportswear are required at all times.
                </span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Departure:</strong> When you complete your workout, scan your code on your way out or tap the <strong>Check Out</strong> button on this portal to keep room for colleagues.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
