import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import { QRCodeSVG } from 'qrcode.react';
import {
  QrCode,
  Clock,
  Key,
  Calendar,
  CheckCircle2,
  RefreshCw,
  LogOut,
  ShieldCheck,
  User,
} from 'lucide-react';
import { OccupancyBanner } from '../../components/OccupancyBanner';

interface ProfileData {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  photoUrl?: string;
  activeSession: {
    id: string;
    checkInTime: string;
    lockerNumber?: string;
  } | null;
  upcomingClasses: Array<{
    bookingId: string;
    classId: string;
    title: string;
    instructor: string;
    date: string;
    startTime: string;
    endTime: string;
  }>;
}

export const StaffDashboardPage: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [passToken, setPassToken] = useState<string | null>(null);
  const [secondsRemaining, setSecondsRemaining] = useState(45);
  const [isFetchingPass, setIsFetchingPass] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  const fetchPassToken = async () => {
    setIsFetchingPass(true);
    try {
      const data = await apiRequest('/users/me/qr-pass');
      setPassToken(data.passToken);
      setSecondsRemaining(45);
    } catch (e) {
      console.error('Failed to fetch QR pass token', e);
    } finally {
      setIsFetchingPass(false);
    }
  };

  const fetchProfile = async () => {
    try {
      const p = await apiRequest('/users/me');
      setProfile(p);
    } catch (e) {
      console.error('Failed to load profile', e);
    }
  };

  useEffect(() => {
    fetchProfile();
    fetchPassToken();

    // 45s refresh timer
    const interval = setInterval(() => {
      fetchPassToken();
    }, 45000);

    // 1-second countdown
    const countdown = setInterval(() => {
      setSecondsRemaining((prev) => (prev > 0 ? prev - 1 : 45));
    }, 1000);

    return () => {
      clearInterval(interval);
      clearInterval(countdown);
    };
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

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {user?.photoUrl ? (
            <img
              src={user.photoUrl}
              alt={user.fullName}
              className="h-16 w-16 rounded-2xl object-cover ring-2 ring-moa-green/30"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl bg-emerald-50 text-moa-green flex items-center justify-center font-bold text-xl border border-emerald-200">
              <User className="h-8 w-8" />
            </div>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold text-slate-900">{user?.fullName}</h1>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <ShieldCheck className="h-3 w-3 text-moa-green" />
                Verified Whitelist
              </span>
            </div>
            <p className="text-xs text-slate-500 font-mono mt-0.5">
              {user?.employeeId} · {user?.department}
            </p>
          </div>
        </div>

        {/* Active Session Status */}
        {profile?.activeSession ? (
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-emerald-900">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></span>
                Currently Checked In
              </div>
              <p className="text-[11px] text-slate-600">
                Entered:{' '}
                {new Date(profile.activeSession.checkInTime).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}{' '}
                {profile.activeSession.lockerNumber && (
                  <span className="font-semibold text-emerald-800">
                    · Locker: {profile.activeSession.lockerNumber}
                  </span>
                )}
              </p>
            </div>
            <button
              type="button"
              onClick={handleSelfCheckout}
              disabled={isCheckingOut}
              className="px-3 py-1.5 text-xs font-semibold text-white bg-moa-danger hover:bg-red-700 rounded-lg shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>{isCheckingOut ? 'Checking out...' : 'Check Out'}</span>
            </button>
          </div>
        ) : (
          <div className="text-xs text-slate-500 flex items-center gap-2 bg-slate-50 border border-slate-200 px-3 py-2 rounded-xl">
            <span className="h-2 w-2 rounded-full bg-slate-400"></span>
            <span>Not currently inside the gym</span>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Rotating Digital QR Pass */}
        <div className="lg:col-span-1 bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between mb-4">
            <div className="flex items-center gap-1.5 text-xs font-bold text-slate-900">
              <QrCode className="h-4 w-4 text-moa-green" />
              <span>MoA Digital Entry Pass</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
              Anti-Screenshot
            </span>
          </div>

          {/* QR Container with border and moving watermark */}
          <div className="relative p-4 bg-white border-2 border-slate-200 rounded-2xl shadow-inner mb-3">
            {passToken ? (
              <QRCodeSVG
                value={passToken}
                size={220}
                level="M"
                includeMargin={true}
              />
            ) : (
              <div className="w-[220px] h-[220px] bg-slate-50 flex items-center justify-center">
                <RefreshCw className="h-8 w-8 text-slate-300 animate-spin" />
              </div>
            )}

            {/* Subtle live watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-10">
              <span className="text-lg font-bold font-mono tracking-widest text-slate-900 rotate-[-30deg]">
                {user?.employeeId}
              </span>
            </div>
          </div>

          {/* Timer and Countdown */}
          <div className="w-full bg-slate-50 rounded-xl p-3 border border-slate-100 space-y-2 mb-3">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500 flex items-center gap-1">
                <Clock className="h-3.5 w-3.5 text-moa-green" />
                Refreshes in:
              </span>
              <span className="font-mono font-bold text-moa-green">
                {secondsRemaining}s
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-moa-green h-1.5 transition-all duration-1000"
                style={{ width: `${(secondsRemaining / 45) * 100}%` }}
              ></div>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 leading-tight">
            Present this dynamic QR code to the entrance terminal camera or front desk attendant.
          </p>
        </div>

        {/* Right Column: Live Floor + Upcoming Classes */}
        <div className="lg:col-span-2 space-y-6">
          <OccupancyBanner />

          {/* Booked / Available Classes */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-moa-surface rounded-lg text-moa-green">
                  <Calendar className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    My Booked Fitness Classes
                  </h3>
                  <p className="text-xs text-slate-500">Scheduled group wellness sessions</p>
                </div>
              </div>

              <Link
                to="/classes"
                className="text-xs font-semibold text-moa-green hover:text-moa-green-dark"
              >
                Browse All Classes →
              </Link>
            </div>

            {profile?.upcomingClasses && profile.upcomingClasses.length > 0 ? (
              <div className="space-y-3">
                {profile.upcomingClasses.map((cls) => (
                  <div
                    key={cls.bookingId}
                    className="p-3 rounded-xl border border-slate-200 bg-slate-50/50 flex items-center justify-between"
                  >
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{cls.title}</h4>
                      <p className="text-[11px] text-slate-500">
                        {cls.instructor} · {new Date(cls.date).toLocaleDateString()} (
                        {cls.startTime} - {cls.endTime})
                      </p>
                    </div>
                    <span className="text-[11px] font-semibold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-full">
                      Spot Confirmed
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 border border-dashed border-slate-200 rounded-xl">
                <p className="text-xs text-slate-500 mb-2">
                  No upcoming group classes booked yet.
                </p>
                <Link
                  to="/classes"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-moa-green text-white text-xs font-semibold rounded-lg hover:bg-moa-green-dark transition"
                >
                  <Calendar className="h-3.5 w-3.5" />
                  <span>Reserve a Class Spot</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
