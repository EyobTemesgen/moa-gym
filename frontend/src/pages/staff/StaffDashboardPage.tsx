import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  Clock,
  Printer,
  ShieldCheck,
  User,
  LogOut,
  Building2,
  Calendar,
  Video,
  ArrowRight,
  Sparkles,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import { MoaLogo } from '../../components/MoaLogo';
import { pill, statusTone } from '../../components/ui/theme';

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
  const toast = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchProfile = async () => {
    try {
      const p = await apiRequest<ProfileData>('/users/me');
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
      toast.success('Checked Out', 'You have checked out successfully. Have a great day!');
      await fetchProfile();
    } catch (err: any) {
      const msg = err.message || 'Check-out failed';
      toast.error('Check-Out Failed', msg);
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
            <span>Morning Shift (11:00 – 1:30)</span>
          </span>
        );
      case 'EVENING':
        return (
          <span className={`${pill} ${statusTone.evening}`}>
            <Clock className="w-3 h-3 text-indigo-700" />
            <span>Evening Shift (11:30 – 3:00)</span>
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
    <div className="space-y-6">
      {/* ─── Header: Entry Pass Title, Active Session Status & Print Action ─── */}
      <div className="no-print bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              My Entry Pass
            </h1>
            <span className="inline-flex items-center gap-1 text-[11px] font-bold text-[#00843D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200 shadow-2xs">
              <ShieldCheck className="h-3.5 w-3.5" />
              Active Member Pass
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Present this digital pass at the gym entrance terminal or reception desk.
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap">
          {profile?.activeSession ? (
            <div className="flex items-center gap-2.5 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs">
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Inside Facility</span>
                {profile.activeSession.lockerNumber && (
                  <span className="font-mono text-emerald-800">· Locker #{profile.activeSession.lockerNumber}</span>
                )}
              </div>
              <button
                type="button"
                onClick={handleSelfCheckout}
                disabled={isCheckingOut}
                className="px-2.5 py-1 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-[6px] shadow-2xs transition flex items-center gap-1 cursor-pointer disabled:opacity-50 select-none"
              >
                <LogOut className="h-3 w-3" />
                <span>{isCheckingOut ? 'Checking out...' : 'Check Out'}</span>
              </button>
            </div>
          ) : (
            <div className="hidden sm:flex items-center gap-1.5 text-xs text-slate-500 bg-slate-50 border border-slate-200 px-3 py-1.5 rounded-lg">
              <span className="h-2 w-2 rounded-full bg-slate-400" />
              <span>Not in facility</span>
            </div>
          )}

          <button
            type="button"
            onClick={handlePrintBadge}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00843D] hover:bg-[#0B6B3A] text-white rounded-[6px] text-xs font-semibold shadow-2xs transition cursor-pointer select-none"
            title="Print official pass"
          >
            <Printer className="h-3.5 w-3.5" />
            <span>Print Pass</span>
          </button>
        </div>
      </div>

      {/* ─── Main Content Grid: Digital Entry Pass (Left) & Quick Access Hub (Right) ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Official Digital Membership Pass */}
        <div className="lg:col-span-5 flex flex-col items-center">
          <div
            id="moa-gym-badge"
            className="w-full max-w-[360px] bg-white rounded-2xl border border-slate-200 shadow-md overflow-hidden transition-all hover:shadow-lg"
          >
            {/* Top Official Header with MoA Green & Gold - Sleek & Compact Horizontal Bar */}
            <div className="w-full bg-[#00843D] px-3.5 py-2 text-white relative shrink-0">
              <div className="absolute top-0 left-0 right-0 h-0.5 bg-[#FCDD09]" />
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2 min-w-0">
                  <MoaLogo className="h-6 w-6 text-white brightness-0 invert shrink-0" size={24} />
                  <div className="text-left min-w-0">
                    <p className="text-[10px] font-black uppercase tracking-wider text-white truncate leading-tight">
                      Ministry of Agriculture
                    </p>
                    <p className="text-[8.5px] font-semibold text-emerald-100 uppercase tracking-tight truncate">
                      Staff Wellness Gymnasium
                    </p>
                  </div>
                </div>
                <span className="shrink-0 text-[8px] font-bold uppercase tracking-wider bg-white/20 text-white px-2 py-0.5 rounded-full border border-white/25">
                  Entry Pass
                </span>
              </div>
            </div>

            {/* Pass Body */}
            <div className="p-4 sm:p-5 flex flex-col items-center text-center space-y-2.5">
              {/* Photo or Avatar */}
              <div className="relative pt-0.5">
                {user?.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.fullName}
                    className="h-16 w-16 rounded-xl object-cover ring-2 ring-[#00843D]/20 shadow-xs"
                  />
                ) : (
                  <div className="h-16 w-16 rounded-xl bg-emerald-50 text-[#00843D] flex items-center justify-center font-bold text-xl border-2 border-emerald-200 shadow-2xs">
                    <User className="h-8 w-8 text-emerald-700" />
                  </div>
                )}
                {profile?.regNumber && (
                  <span
                    title={`Roster Registration #${profile.regNumber}`}
                    className="absolute -bottom-1 -right-2 px-1.5 py-0.2 bg-[#00843D] text-white font-mono font-bold text-[8.5px] rounded-full shadow-2xs border-2 border-white"
                  >
                    #{profile.regNumber}
                  </span>
                )}
              </div>

              {/* Member Details */}
              <div className="space-y-0.5 max-w-[260px]">
                <h3 className="text-base font-bold text-slate-900 tracking-tight leading-snug">
                  {user?.fullName}
                </h3>
                <p className="text-[11px] font-mono font-bold text-emerald-800">
                  {user?.employeeId}
                </p>
                <p className="text-[11px] text-slate-500 font-medium truncate">
                  {user?.department}
                </p>
              </div>

              {/* Shift Badge */}
              <div>{getShiftBadge(profile?.shiftPreference)}</div>

              {/* QR Code */}
              <div className="p-2 bg-white border border-slate-200 rounded-xl shadow-inner inline-block">
                <QRCodeSVG
                  value={passValue}
                  size={144}
                  level="H"
                  includeMargin={true}
                />
              </div>

              {/* Label */}
              <div className="space-y-0.5">
                <p className="text-xs font-semibold text-slate-800">
                  Permanent Member Gate Code
                </p>
                <p className="text-[10px] text-slate-400">
                  Scan at gym gate terminal or provide Employee ID
                </p>
              </div>
            </div>

            {/* Bottom Card Footer */}
            <div className="bg-slate-50 border-t border-slate-200 px-4 py-1.5 text-center">
              <span className="text-[8.5px] font-mono text-slate-500 uppercase tracking-wider">
                Federal Democratic Republic of Ethiopia
              </span>
            </div>
          </div>

          <p className="no-print text-[11px] text-slate-500 text-center mt-3 max-w-xs leading-relaxed">
            Works 100% offline. Screenshot or save this pass on your phone for instant gate scanning.
          </p>
        </div>

        {/* Right Column: Clean Hub & Guidelines */}
        <div className="lg:col-span-7 space-y-4 no-print">
          {/* Quick Hub Navigation Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <Link
              to="/schedule"
              className="group p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-emerald-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-emerald-50 text-[#00843D] border border-emerald-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Calendar className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-[#00843D] bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                    Timetable
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-[#00843D] transition-colors">
                  Gym Schedule & Classes
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  View daily group training sessions and reserve your workout spots.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center text-xs font-semibold text-[#00843D]">
                <span>Browse Schedule</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>

            <Link
              to="/guides"
              className="group p-4 bg-white rounded-xl border border-slate-200 shadow-2xs hover:shadow-md hover:border-sky-400 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2.5">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 border border-sky-200 flex items-center justify-center shadow-2xs group-hover:scale-105 transition-transform">
                    <Video className="h-4 w-4" />
                  </div>
                  <span className="text-[10px] font-bold text-sky-800 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200">
                    Tutorials
                  </span>
                </div>
                <h3 className="text-sm font-bold text-slate-900 group-hover:text-sky-800 transition-colors">
                  Exercise Video Guides
                </h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                  Workout tutorials, equipment form, and desk mobility routines.
                </p>
              </div>
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center text-xs font-semibold text-sky-700">
                <span>Watch Videos</span>
                <ArrowRight className="h-3.5 w-3.5 ml-1 group-hover:translate-x-1 transition-transform" />
              </div>
            </Link>
          </div>

          {/* Membership & Shift Overview */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Clock className="h-4 w-4 text-[#00843D]" />
              <h3 className="text-sm font-bold text-slate-900">
                Operating Hours & Facility Details
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Morning Shift
                </p>
                <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                  11:00 – 1:30 (5:00 AM – 7:30 AM)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Pre-work morning workout session
                </p>
              </div>

              <div className="p-3 rounded-lg border border-slate-200 bg-slate-50/70">
                <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  Evening Shift
                </p>
                <p className="text-sm font-mono font-bold text-slate-900 mt-0.5">
                  11:30 – 3:00 (5:30 PM – 9:00 PM)
                </p>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Post-office evening workout session
                </p>
              </div>
            </div>
          </div>

          {/* Gate Verification & Facility Guidelines */}
          <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-[#00843D]" />
              <h3 className="text-sm font-bold text-slate-900">
                Gate Entry & Facility Rules
              </h3>
            </div>

            <div className="space-y-2.5 text-xs text-slate-600">
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Gate Verification:</strong> Hold your QR code to the entrance scanner or show your MoA Employee ID card at the desk.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Locker Keys:</strong> Keys are issued upon check-in. Please return keys at reception prior to leaving.
                </span>
              </div>
              <div className="flex items-start gap-2.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                <span>
                  <strong>Departure:</strong> Scan your code upon departure or tap <strong>Check Out</strong> on this portal to keep live capacity accurate.
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
