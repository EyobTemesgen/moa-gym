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
  AlertCircle,
  RefreshCw,
  Sun,
  Moon,
  ArrowRight,
  Flame,
  Info,
} from 'lucide-react';

interface OccupancyData {
  current: number;
  maxCapacity: number;
  percentage: number;
}

const WEEKLY_SCHEDULE = [
  {
    dayIndex: 1,
    name: 'Monday',
    amharic: 'ሰኞ',
    short: 'Mon',
    morning: '06:00 AM – 08:30 AM',
    morningEt: 'ከማለዳው 12:00 – 2:30',
    evening: '05:30 PM – 09:00 PM',
    eveningEt: 'ከምሽቱ 11:30 – 3:00',
    isOpen: true,
  },
  {
    dayIndex: 2,
    name: 'Tuesday',
    amharic: 'ማክሰኞ',
    short: 'Tue',
    morning: '06:00 AM – 08:30 AM',
    morningEt: 'ከማለዳው 12:00 – 2:30',
    evening: '05:30 PM – 09:00 PM',
    eveningEt: 'ከምሽቱ 11:30 – 3:00',
    isOpen: true,
  },
  {
    dayIndex: 3,
    name: 'Wednesday',
    amharic: 'ረቡዕ',
    short: 'Wed',
    morning: '06:00 AM – 08:30 AM',
    morningEt: 'ከማለዳው 12:00 – 2:30',
    evening: '05:30 PM – 09:00 PM',
    eveningEt: 'ከምሽቱ 11:30 – 3:00',
    isOpen: true,
  },
  {
    dayIndex: 4,
    name: 'Thursday',
    amharic: 'ሐሙስ',
    short: 'Thu',
    morning: '06:00 AM – 08:30 AM',
    morningEt: 'ከማለዳው 12:00 – 2:30',
    evening: '05:30 PM – 09:00 PM',
    eveningEt: 'ከምሽቱ 11:30 – 3:00',
    isOpen: true,
  },
  {
    dayIndex: 5,
    name: 'Friday',
    amharic: 'ዓርብ',
    short: 'Fri',
    morning: '06:00 AM – 08:30 AM',
    morningEt: 'ከማለዳው 12:00 – 2:30',
    evening: '05:30 PM – 09:00 PM',
    eveningEt: 'ከምሽቱ 11:30 – 3:00',
    isOpen: true,
  },
  {
    dayIndex: 6,
    name: 'Saturday',
    amharic: 'ቅዳሜ',
    short: 'Sat',
    morning: '06:00 AM – 08:30 AM',
    morningEt: 'ከማለዳው 12:00 – 2:30',
    evening: '05:30 PM – 09:00 PM',
    eveningEt: 'ከምሽቱ 11:30 – 3:00',
    isOpen: true,
  },
  {
    dayIndex: 0,
    name: 'Sunday',
    amharic: 'እሁድ',
    short: 'Sun',
    morning: 'Closed (ዝግ)',
    morningEt: 'ሙሉ ቀን ዝግ',
    evening: 'Closed (ዝግ)',
    eveningEt: 'ሙሉ ቀን ዝግ',
    isOpen: false,
  },
];

export const GymSchedulePage: React.FC = () => {
  const [currentTime, setCurrentTime] = useState(new Date());

  // Update clock every 30 seconds
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 30000);
    return () => clearInterval(timer);
  }, []);

  // Live gym occupancy data
  const { data: occupancy, isLoading: isOccupancyLoading, refetch } = useQuery<OccupancyData>({
    queryKey: ['liveOccupancy'],
    queryFn: () => apiRequest('/attendance/occupancy'),
    refetchInterval: 12000,
  });

  const currentCount = occupancy?.current ?? 0;
  const maxCapacity = occupancy?.maxCapacity ?? 40;
  const occupancyPct = Math.min(100, Math.round((currentCount / maxCapacity) * 100));

  // Determine current facility status
  const currentDayIndex = currentTime.getDay(); // 0 = Sunday, 1 = Monday, ...
  const currentHours = currentTime.getHours();
  const currentMinutes = currentTime.getMinutes();
  const timeInMinutes = currentHours * 60 + currentMinutes;

  const morningStart = 6 * 60; // 06:00 AM
  const morningEnd = 8 * 60 + 30; // 08:30 AM
  const eveningStart = 17 * 60 + 30; // 05:30 PM
  const eveningEnd = 21 * 60; // 09:00 PM

  let facilityStatus: {
    state: 'MORNING_ACTIVE' | 'EVENING_ACTIVE' | 'DAY_BREAK' | 'NIGHT_CLOSED' | 'SUNDAY_CLOSED';
    headline: string;
    subline: string;
    colorTone: string;
  };

  if (currentDayIndex === 0) {
    facilityStatus = {
      state: 'SUNDAY_CLOSED',
      headline: 'Closed for Weekly Maintenance & Sanitization',
      subline: 'The gym room is closed on Sundays for deep cleaning. Opens Monday morning at 6:00 AM.',
      colorTone: 'bg-slate-100 text-slate-700 border-slate-300',
    };
  } else if (timeInMinutes >= morningStart && timeInMinutes <= morningEnd) {
    facilityStatus = {
      state: 'MORNING_ACTIVE',
      headline: 'Morning Session is Active Now',
      subline: 'Open for all registered MoA staff. Session concludes at 8:30 AM before workday start.',
      colorTone: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    };
  } else if (timeInMinutes >= eveningStart && timeInMinutes <= eveningEnd) {
    facilityStatus = {
      state: 'EVENING_ACTIVE',
      headline: 'Evening Session is Active Now',
      subline: 'Open for post-work workouts and strength training. Session concludes at 9:00 PM.',
      colorTone: 'bg-emerald-50 text-emerald-900 border-emerald-300',
    };
  } else if (timeInMinutes > morningEnd && timeInMinutes < eveningStart) {
    facilityStatus = {
      state: 'DAY_BREAK',
      headline: 'Midday Office Hours (Gym Room Closed)',
      subline: 'Staff are on official duty. The room reopens for the Evening Session today at 5:30 PM.',
      colorTone: 'bg-amber-50 text-amber-900 border-amber-200',
    };
  } else {
    facilityStatus = {
      state: 'NIGHT_CLOSED',
      headline: 'Gym Facility Closed for the Night',
      subline: 'The gym reopens tomorrow morning at 6:00 AM for the early morning session.',
      colorTone: 'bg-slate-100 text-slate-700 border-slate-200',
    };
  }

  const isFacilityOpenNow =
    facilityStatus.state === 'MORNING_ACTIVE' || facilityStatus.state === 'EVENING_ACTIVE';

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Facility Timetable & Operating Sessions
            </h1>
            <span className="text-xs font-mono font-semibold text-[#00843D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              የአካል ብቃት እንቅስቃሴ ክፍለ-ጊዜያት
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Official Ministry single-room gymnasium schedule, daily working sessions, and locker allocation.
          </p>
        </div>

        {/* Live Status & Occupancy Meter */}
        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <div
            className={`px-3 py-1.5 rounded-lg border text-xs font-bold flex items-center gap-2 shadow-2xs ${
              isFacilityOpenNow
                ? 'bg-emerald-50 text-emerald-900 border-emerald-300'
                : 'bg-slate-50 text-slate-700 border-slate-200'
            }`}
          >
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                isFacilityOpenNow ? 'bg-[#00843D] animate-pulse' : 'bg-slate-400'
              }`}
            />
            <span>{isFacilityOpenNow ? 'Gym Open Now' : 'Currently Closed'}</span>
          </div>

          <div className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs">
            <Users className="w-3.5 h-3.5 text-[#00843D]" />
            <span className="text-slate-600 font-medium">Inside:</span>
            <span className="font-bold font-mono text-slate-900">
              {currentCount} / {maxCapacity}
            </span>
          </div>

          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh status"
            className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
          >
            <RefreshCw className={`h-4 w-4 ${isOccupancyLoading ? 'animate-spin text-[#00843D]' : ''}`} />
          </button>
        </div>
      </div>

      {/* Real-Time Live Status Banner */}
      <div
        className={`p-4 sm:p-5 rounded-2xl border shadow-xs transition-all ${facilityStatus.colorTone}`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-white shadow-2xs border border-inherit shrink-0">
              {facilityStatus.state === 'MORNING_ACTIVE' ? (
                <Sun className="h-6 w-6 text-amber-500" />
              ) : facilityStatus.state === 'EVENING_ACTIVE' ? (
                <Moon className="h-6 w-6 text-indigo-500" />
              ) : facilityStatus.state === 'DAY_BREAK' ? (
                <Clock className="h-6 w-6 text-amber-600" />
              ) : (
                <Calendar className="h-6 w-6 text-slate-500" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 tracking-tight">
                  {facilityStatus.headline}
                </h2>
                {isFacilityOpenNow && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#00843D] text-white tracking-wider uppercase">
                    Live
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-600 mt-1 max-w-2xl leading-relaxed">
                {facilityStatus.subline}
              </p>
            </div>
          </div>

          {/* Occupancy Indicator in Banner */}
          <div className="bg-white/90 backdrop-blur-xs p-3 rounded-xl border border-slate-200/80 shadow-2xs shrink-0 sm:text-right min-w-[160px]">
            <div className="text-[11px] text-slate-500 font-medium">Facility Occupancy</div>
            <div className="text-base font-extrabold text-slate-900 font-mono mt-0.5">
              {currentCount} <span className="text-xs font-normal text-slate-400">/ {maxCapacity} Max</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-1.5 mt-1.5 overflow-hidden">
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
        </div>
      </div>

      {/* The Two Daily Working Sessions Cards */}
      <div>
        <div className="flex items-center justify-between mb-3.5">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight">
              Daily Working Sessions (የቀኑ ክፍለ-ጊዜያት)
            </h2>
            <p className="text-xs text-slate-500">
              The Ministry operates one main gymnasium room across two dedicated daily workout sessions.
            </p>
          </div>
          <span className="text-xs font-semibold text-slate-500 hidden sm:block">
            Monday through Saturday
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Session 1: Morning Session */}
          <div
            className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
              facilityStatus.state === 'MORNING_ACTIVE'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Top Tag & Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-amber-50 text-amber-900 border border-amber-200">
                  <Sun className="h-3.5 w-3.5 text-amber-600" />
                  Morning Session · የጠዋት ክፍለ-ጊዜ
                </span>

                {facilityStatus.state === 'MORNING_ACTIVE' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00843D]" /> Open Now
                  </span>
                )}
              </div>

              {/* Time Block */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-lg font-extrabold text-slate-900 font-mono tracking-tight">
                    06:00 AM – 08:30 AM
                  </div>
                  <div className="text-xs font-semibold text-[#00843D] mt-0.5">
                    ከማለዳው 12:00 – 2:30 (Ethiopian Time)
                  </div>
                </div>
                <Clock className="h-6 w-6 text-slate-400" />
              </div>

              {/* Description & Purpose */}
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Designed for civil servants who prefer early-morning cardio conditioning, treadmill running, and circuit training before the official Ministry workday starts.
              </p>

              {/* Key Amenities */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00843D] shrink-0" />
                  <span><strong>Full Room Access:</strong> Free weights, treadmills, bikes & resistance machines</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-600 shrink-0" />
                  <span><strong>Daily Lockers:</strong> Clean lockers (L-01 to L-30) issued at front desk</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#00843D] shrink-0" />
                  <span><strong>Admittance:</strong> Scan digital QR pass or provide Employee ID at gate</span>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Duration: 2.5 Hours</span>
              <span className="font-medium text-slate-700">Concludes strictly at 8:30 AM</span>
            </div>
          </div>

          {/* Session 2: Evening Session */}
          <div
            className={`bg-white rounded-2xl border transition-all p-5 shadow-xs flex flex-col justify-between ${
              facilityStatus.state === 'EVENING_ACTIVE'
                ? 'border-emerald-500 ring-2 ring-emerald-500/20 shadow-md'
                : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div>
              {/* Top Tag & Status */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-indigo-50 text-indigo-900 border border-indigo-200">
                  <Moon className="h-3.5 w-3.5 text-indigo-600" />
                  Evening Session · የማታ ክፍለ-ጊዜ
                </span>

                {facilityStatus.state === 'EVENING_ACTIVE' && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-300 flex items-center gap-1 animate-pulse">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#00843D]" /> Open Now
                  </span>
                )}
              </div>

              {/* Time Block */}
              <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 flex items-center justify-between">
                <div>
                  <div className="text-lg font-extrabold text-slate-900 font-mono tracking-tight">
                    05:30 PM – 09:00 PM
                  </div>
                  <div className="text-xs font-semibold text-[#00843D] mt-0.5">
                    ከምሽቱ 11:30 – 3:00 (Ethiopian Time)
                  </div>
                </div>
                <Clock className="h-6 w-6 text-slate-400" />
              </div>

              {/* Description & Purpose */}
              <p className="text-xs text-slate-600 mt-3 leading-relaxed">
                Post-work session focused on strength training, posture recovery from long office desk hours, dumbbell workouts, and general employee wellness.
              </p>

              {/* Key Amenities */}
              <div className="mt-4 space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="h-4 w-4 text-[#00843D] shrink-0" />
                  <span><strong>Full Room Access:</strong> Strength benches, dumbbells, cables & stretching zone</span>
                </div>
                <div className="flex items-center gap-2">
                  <Key className="h-4 w-4 text-amber-600 shrink-0" />
                  <span><strong>Evening Lockers:</strong> Daily key assignment with 23:59 automatic nightly reset</span>
                </div>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="h-4 w-4 text-[#00843D] shrink-0" />
                  <span><strong>Desk Attendant:</strong> Front desk personnel on duty for assistance & check-in</span>
                </div>
              </div>
            </div>

            {/* Bottom Note */}
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
              <span>Duration: 3.5 Hours</span>
              <span className="font-medium text-slate-700">Concludes strictly at 9:00 PM</span>
            </div>
          </div>
        </div>
      </div>

      {/* Self-Guided Workout Spotlight (Since There Is No Trainer) */}
      <div className="bg-gradient-to-r from-emerald-900 via-[#07572A] to-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/15 text-emerald-200 border border-white/20 mb-2">
              <Sparkles className="h-3.5 w-3.5 text-moa-gold" />
              <span>Self-Guided Training Support</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Looking for exercise guidance without a floor trainer?
            </h3>
            <p className="text-xs text-emerald-100/90 mt-1.5 leading-relaxed">
              Because the gym room operates without dedicated fitness instructors, the Ministry provides official video demonstrations in <strong>Amharic & English</strong> covering proper machine adjustments, dumbbell posture, and office-worker stretching.
            </p>
          </div>

          <Link
            to="/guides"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white hover:bg-emerald-50 text-[#07572A] font-bold text-xs rounded-xl shadow-xs transition hover:scale-102 shrink-0 cursor-pointer"
          >
            <Video className="h-4 w-4 text-[#00843D]" />
            <span>Watch Exercise Video Guides</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>

      {/* Weekly Operating Hours Table (Mon - Sun) */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900 tracking-tight">
              Weekly Timetable & Shift Schedule (የሳምንቱ የስራ ሰዓት ሰንጠረዥ)
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Standard Ministry operating timetable across the calendar week.
            </p>
          </div>
          <span className="text-[11px] font-mono text-slate-500">
            Current Day: {WEEKLY_SCHEDULE.find((d) => d.dayIndex === currentDayIndex)?.name}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200">
              <tr>
                <th className="py-3 px-4">Day of the Week</th>
                <th className="py-3 px-4">Morning Session (ጠዋት)</th>
                <th className="py-3 px-4">Evening Session (ማታ)</th>
                <th className="py-3 px-4 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {WEEKLY_SCHEDULE.map((item) => {
                const isCurrentDay = item.dayIndex === currentDayIndex;

                return (
                  <tr
                    key={item.dayIndex}
                    className={`transition ${
                      isCurrentDay
                        ? 'bg-emerald-50/60 font-semibold text-slate-900'
                        : 'hover:bg-slate-50/50 text-slate-700'
                    }`}
                  >
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <span>{item.name} ({item.amharic})</span>
                        {isCurrentDay && (
                          <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-xs uppercase tracking-wider bg-[#00843D] text-white">
                            Today
                          </span>
                        )}
                      </div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div>{item.morning}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{item.morningEt}</div>
                    </td>

                    <td className="py-3 px-4 font-mono">
                      <div>{item.evening}</div>
                      <div className="text-[11px] text-slate-500 font-sans">{item.eveningEt}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {item.isOpen ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-100 text-emerald-800">
                          Active Working Day
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-100 text-slate-500">
                          Weekly Sanitization
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Facility Etiquette & Locker Rules */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
            <ShieldCheck className="h-4 w-4 text-[#00843D]" />
            <span>Digital Gate Entry</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Always present your official Digital QR Pass or Employee ID to the desk attendant for instant verification and capacity counting.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
            <Key className="h-4 w-4 text-amber-600" />
            <span>Daily Locker Policy</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Lockers (L-01 to L-30) are for daily session use only. Please clear your locker and return the key to the front desk before leaving.
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center gap-2 font-bold text-slate-900 mb-1.5">
            <CheckCircle2 className="h-4 w-4 text-[#00843D]" />
            <span>Attire & Sanitization</span>
          </div>
          <p className="text-slate-600 leading-relaxed text-[11px]">
            Wear appropriate athletic sportswear and clean indoor athletic shoes. Please wipe down benches and handles after each workout set.
          </p>
        </div>
      </div>
    </div>
  );
};
