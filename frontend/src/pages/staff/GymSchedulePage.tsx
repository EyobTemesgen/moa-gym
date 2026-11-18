import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import {
  Clock,
  Users,
  Key,
  CheckCircle2,
  Calendar,
  Sparkles,
  Video,
  ShieldCheck,
  RefreshCw,
  Sun,
  Moon,
  ArrowRight,
  Sparkle,
} from 'lucide-react';

interface OccupancyData {
  current: number;
  maxCapacity: number;
  percentage: number;
}

export const GymSchedulePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Keep live time updated every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Fetch real-time gym occupancy
  const { data: occupancy, isLoading: isOccupancyLoading, refetch } = useQuery<OccupancyData>({
    queryKey: ['liveOccupancy'],
    queryFn: () => apiRequest('/attendance/occupancy'),
    refetchInterval: 15000,
  });

  const currentCount = occupancy?.current ?? 0;
  const maxCapacity = occupancy?.maxCapacity ?? 30;
  const occupancyPct = Math.min(100, Math.round((currentCount / maxCapacity) * 100));

  // Determine current day & session status
  const currentDayIndex = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ...
  const currentMinutes = currentTime.getHours() * 60 + currentTime.getMinutes();

  const morningStart = 6 * 60; // 06:00 AM
  const morningEnd = 8 * 60 + 30; // 08:30 AM
  const eveningStart = 17 * 60 + 30; // 05:30 PM
  const eveningEnd = 21 * 60; // 09:00 PM

  const isSunday = currentDayIndex === 0;
  const isMorningSession = !isSunday && currentMinutes >= morningStart && currentMinutes <= morningEnd;
  const isEveningSession = !isSunday && currentMinutes >= eveningStart && currentMinutes <= eveningEnd;
  const isDayBreak = !isSunday && currentMinutes > morningEnd && currentMinutes < eveningStart;
  const isOpenNow = isMorningSession || isEveningSession;

  const currentDayName = currentTime.toLocaleDateString('en-US', { weekday: 'long' });

  return (
    <div className="space-y-5 max-w-7xl mx-auto">
      {/* 1. Page Header & Live Status Bar (Unified & Uncluttered) */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 sm:p-5 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Facility Timetable & Operating Sessions
            </h1>
            <span className="text-[11px] font-semibold text-[#00843D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              የአካል ብቃት እንቅስቃሴ ሰዓታት
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Ministry of Agriculture single-room gym schedule: two daily working sessions and 30 daily lockers.
          </p>
        </div>

        {/* Live Facility Badge & Real-Time Capacity */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          {/* Open / Closed Indicator */}
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 shadow-2xs ${
              isOpenNow
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isOpenNow ? 'bg-[#00843D] animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>
              {isMorningSession
                ? 'Morning Session Active'
                : isEveningSession
                ? 'Evening Session Active'
                : isSunday
                ? 'Sunday Closed'
                : isDayBreak
                ? 'Day Break (Reopens 5:30 PM)'
                : 'Currently Closed'}
            </span>
          </div>

          {/* Occupancy Counter */}
          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-[#00843D]" />
            <span className="text-slate-600 font-medium">Inside:</span>
            <span className="font-bold font-mono text-slate-900">
              {currentCount} / {maxCapacity}
            </span>
            <div className="w-12 bg-slate-200 rounded-full h-1.5 overflow-hidden ml-1 hidden sm:block">
              <div
                className={`h-full rounded-full transition-all ${
                  occupancyPct >= 90
                    ? 'bg-rose-500'
                    : occupancyPct >= 70
                    ? 'bg-amber-500'
                    : 'bg-[#00843D]'
                }`}
                style={{ width: `${occupancyPct}%` }}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh live occupancy"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isOccupancyLoading ? 'animate-spin text-[#00843D]' : ''}`} />
          </button>
        </div>
      </div>

      {/* 2. Primary Operating Sessions (Morning & Evening) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Morning Session Card */}
        <div
          className={`bg-white rounded-xl border p-5 shadow-xs transition-all relative ${
            isMorningSession
              ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-sm'
              : 'border-slate-200'
          }`}
        >
          {isMorningSession && (
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-600 text-white flex items-center gap-1 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              Active Now
            </span>
          )}

          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-amber-50 text-amber-700 border border-amber-200">
              <Sun className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Morning Session</h2>
              <p className="text-[11px] text-amber-800 font-medium">የጠዋት ክፍለ-ጊዜ · Monday – Saturday</p>
            </div>
          </div>

          {/* Time Badge */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-mono font-extrabold text-slate-900 tracking-tight">
                06:00 AM – 08:30 AM
              </div>
              <div className="text-xs font-semibold text-[#00843D] mt-0.5">
                ከማለዳው 12:00 – 2:30 (Ethiopian Time)
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 block">2.5 Hours</span>
              <span>Ends before workday</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Ideal for pre-office cardio, running, treadmill workouts, and morning circuit training before official Ministry working hours.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Full equipment access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Lockers L-01 to L-30</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Digital QR gate pass</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Closes at 8:30 AM</span>
            </div>
          </div>
        </div>

        {/* Evening Session Card */}
        <div
          className={`bg-white rounded-xl border p-5 shadow-xs transition-all relative ${
            isEveningSession
              ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-sm'
              : 'border-slate-200'
          }`}
        >
          {isEveningSession && (
            <span className="absolute top-4 right-4 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white flex items-center gap-1 shadow-2xs">
              <span className="h-1.5 w-1.5 rounded-full bg-white animate-ping" />
              Active Now
            </span>
          )}

          <div className="flex items-center gap-2.5 mb-3">
            <div className="p-2 rounded-lg bg-indigo-50 text-indigo-700 border border-indigo-200">
              <Moon className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">Evening Session</h2>
              <p className="text-[11px] text-indigo-800 font-medium">የማታ ክፍለ-ጊዜ · Monday – Saturday</p>
            </div>
          </div>

          {/* Time Badge */}
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3 flex items-center justify-between">
            <div>
              <div className="text-lg font-mono font-extrabold text-slate-900 tracking-tight">
                05:30 PM – 09:00 PM
              </div>
              <div className="text-xs font-semibold text-indigo-700 mt-0.5">
                ከምሽቱ 11:30 – 3:00 (Ethiopian Time)
              </div>
            </div>
            <div className="text-right text-[11px] text-slate-500">
              <span className="font-semibold text-slate-700 block">3.5 Hours</span>
              <span>Post-office workout</span>
            </div>
          </div>

          <p className="text-xs text-slate-600 mt-3 leading-relaxed">
            Tailored for evening strength conditioning, dumbbell routines, cable training, and desk de-stressing after office hours.
          </p>

          <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-2 gap-2 text-[11px] text-slate-600">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Full equipment access</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Key className="h-3.5 w-3.5 text-amber-600 shrink-0" />
              <span>Nightly reset at 23:59</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
              <span>Attendant desk active</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span>Closes at 9:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Clean Weekly Timetable Card */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3.5 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Calendar className="h-4 w-4 text-[#00843D]" />
              Weekly Operating Schedule
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Consistent timetable Monday through Saturday · Sunday reserved for facility sanitization
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-200 self-start sm:self-auto">
            Today: <span className="text-slate-900 font-bold">{currentDayName}</span>
          </span>
        </div>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs">
          {/* Active Days Card */}
          <div className="p-3.5 rounded-lg bg-emerald-50/50 border border-emerald-100 flex items-start gap-3">
            <div className="p-2 rounded-md bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
              <CheckCircle2 className="h-4 w-4 text-[#00843D]" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Monday – Saturday (ሰኞ – ቅዳሜ)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-emerald-600 text-white rounded">Open</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Operating strictly during the two daily sessions:
              </p>
              <div className="font-mono text-[11px] text-slate-800 pt-1 space-y-0.5">
                <div>• Morning: <strong>06:00 AM – 08:30 AM</strong> (12:00 – 2:30)</div>
                <div>• Evening: <strong>05:30 PM – 09:00 PM</strong> (11:30 – 3:00)</div>
              </div>
            </div>
          </div>

          {/* Sunday Closed Card */}
          <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 flex items-start gap-3">
            <div className="p-2 rounded-md bg-slate-200 text-slate-700 shrink-0 mt-0.5">
              <Clock className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <div className="font-bold text-slate-900 flex items-center gap-2">
                <span>Sunday (እሁድ)</span>
                <span className="text-[10px] font-bold px-1.5 py-0.2 bg-slate-300 text-slate-700 rounded">Closed</span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Full-day closure for deep sanitization, equipment safety inspections, and facility maintenance. Reopens Monday at 6:00 AM.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Self-Guided Exercise Video Guides Banner */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#07572A] to-slate-900 text-white rounded-xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-bold text-moa-gold">
            <Sparkle className="h-4 w-4" />
            <span>Self-Guided Fitness Resources</span>
          </div>
          <h3 className="text-sm sm:text-base font-bold text-white tracking-tight">
            Need workout guides or machine instructions?
          </h3>
          <p className="text-xs text-emerald-100/80 max-w-xl leading-relaxed">
            Because there are no floor coaches, watch official step-by-step video tutorials in <strong>Amharic & English</strong> for machine setup, form, and desk stretches.
          </p>
        </div>

        <Link
          to="/guides"
          className="inline-flex items-center gap-2 px-3.5 py-2 bg-white text-[#07572A] font-bold text-xs rounded-lg hover:bg-emerald-50 transition shrink-0 self-start sm:self-auto shadow-2xs"
        >
          <Video className="h-4 w-4 text-[#00843D]" />
          <span>Exercise Video Guides</span>
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>

      {/* 5. Facility Etiquette & Locker Rules (3-Column Minimal Grid) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <ShieldCheck className="h-4 w-4 text-[#00843D]" />
            <span>Digital Gate Entry</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Hold your personal Digital QR Pass to the scanner upon arrival to record your check-in and maintain accurate facility occupancy.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <Key className="h-4 w-4 text-amber-600" />
            <span>30 Daily Lockers</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Daily lockers (L-01 to L-30) are issued during check-in. Please return your key to the desk before leaving. Lockers reset nightly at 23:59.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1">
            <CheckCircle2 className="h-4 w-4 text-[#00843D]" />
            <span>Hygiene & Sportswear</span>
          </div>
          <p className="text-slate-600 text-[11px] leading-relaxed">
            Athletic sportswear and clean indoor shoes are mandatory. Wipe down machine seats and re-rack all free weights after each exercise set.
          </p>
        </div>
      </div>
    </div>
  );
};
