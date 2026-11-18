import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import {
  Calendar,
  Clock,
  Users,
  Flame,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  Filter,
  UserCheck,
  Check,
  ChevronRight,
  ShieldCheck,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { btn, pill, statusTone } from '../../components/ui/theme';

interface Participant {
  bookingId: string;
  userId: string;
  employeeId: string;
  fullName: string;
  department: string;
  photoUrl?: string;
  attended: boolean;
}

interface WellnessClass {
  id: string;
  title: string;
  instructorName: string;
  scheduledDate: string;
  startTime: string;
  endTime: string;
  capacity: number;
  bookedCount: number;
  isFull: boolean;
  isBookedByMe: boolean;
  participants: Participant[];
  category?: string;
  ethiopianTime?: string;
}

// Days of the active gym week (Mon - Sat)
const DAYS_OF_WEEK = [
  { key: 1, name: 'Monday', amharic: 'ሰኞ', short: 'Mon' },
  { key: 2, name: 'Tuesday', amharic: 'ማክሰኞ', short: 'Tue' },
  { key: 3, name: 'Wednesday', amharic: 'ረቡዕ', short: 'Wed' },
  { key: 4, name: 'Thursday', amharic: 'ሐሙስ', short: 'Thu' },
  { key: 5, name: 'Friday', amharic: 'ዓርብ', short: 'Fri' },
  { key: 6, name: 'Saturday', amharic: 'ቅዳሜ', short: 'Sat' },
];

export const GymSchedulePage: React.FC = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Calculate current week dates
  const today = new Date();
  const currentDayIndex = today.getDay(); // 0 is Sun, 1 is Mon...
  
  // Find Monday of current week
  const monday = new Date(today);
  const diffToMonday = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

  // Generate 6 days from Monday to Saturday
  const weekDays = DAYS_OF_WEEK.map((d, idx) => {
    const dayDate = new Date(monday);
    dayDate.setDate(monday.getDate() + idx);
    const dateStr = dayDate.toISOString().split('T')[0];
    const isToday = dayDate.toDateString() === today.toDateString();
    return {
      ...d,
      date: dayDate,
      dateStr,
      isToday,
      dayNumber: dayDate.getDate(),
      monthName: dayDate.toLocaleString('default', { month: 'short' }),
    };
  });

  // Selected date defaults to today if Mon-Sat, else Monday
  const defaultDateStr = weekDays.find((d) => d.isToday)?.dateStr || weekDays[0].dateStr;
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);

  // Filters
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'MORNING' | 'EVENING'>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewParticipantsClass, setViewParticipantsClass] = useState<WellnessClass | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // New Class Form State (for Admin/Attendant)
  const [newTitle, setNewTitle] = useState('');
  const [newInstructor, setNewInstructor] = useState('Coach Henok');
  const [newStartTime, setNewStartTime] = useState('06:30');
  const [newEndTime, setNewEndTime] = useState('07:30');
  const [newCapacity, setNewCapacity] = useState(15);

  // Query classes from backend
  const { data: dbClasses = [], isLoading, refetch } = useQuery<WellnessClass[]>({
    queryKey: ['wellness-classes', selectedDate],
    queryFn: async () => {
      return apiRequest<WellnessClass[]>(`/wellness/classes?date=${selectedDate}`);
    },
  });

  // Book mutation
  const bookMutation = useMutation({
    mutationFn: async (classId: string) => {
      return apiRequest(`/wellness/classes/${classId}/book`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-classes'] });
      setActionMessage({ type: 'success', text: 'Class spot booked successfully! See you on the floor.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to book class.' });
      setTimeout(() => setActionMessage(null), 5000);
    },
  });

  // Cancel booking mutation
  const cancelMutation = useMutation({
    mutationFn: async (classId: string) => {
      return apiRequest(`/wellness/classes/${classId}/book`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-classes'] });
      setActionMessage({ type: 'success', text: 'Reservation cancelled.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to cancel reservation.' });
      setTimeout(() => setActionMessage(null), 5000);
    },
  });

  // Create class mutation (Attendant / Admin)
  const createClassMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/wellness/classes', {
        method: 'POST',
        body: JSON.stringify({
          title: newTitle,
          instructorName: newInstructor,
          scheduledDate: selectedDate,
          startTime: newStartTime,
          endTime: newEndTime,
          capacity: Number(newCapacity),
        }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-classes'] });
      setIsAddModalOpen(false);
      setNewTitle('');
      setActionMessage({ type: 'success', text: 'New group class scheduled!' });
      setTimeout(() => setActionMessage(null), 4000);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to create class.' });
    },
  });

  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'GYM_ATTENDANT';

  // Standard recurring template sessions if none created for the day
  const defaultTemplates: WellnessClass[] = [
    {
      id: `tmpl-morning-${selectedDate}`,
      title: 'Morning Energizer Aerobics & Cardio Blast',
      instructorName: 'Coach Henok',
      scheduledDate: selectedDate,
      startTime: '06:15',
      endTime: '07:15',
      capacity: 15,
      bookedCount: 8,
      isFull: false,
      isBookedByMe: false,
      participants: [],
      category: 'Aerobics & Cardio',
      ethiopianTime: 'ከማለዳው 12:15 – 1:15',
    },
    {
      id: `tmpl-evening-${selectedDate}`,
      title: 'Post-Work Core & Functional Strength',
      instructorName: 'Trainer Bethel',
      scheduledDate: selectedDate,
      startTime: '17:30',
      endTime: '18:30',
      capacity: 18,
      bookedCount: 12,
      isFull: false,
      isBookedByMe: false,
      participants: [],
      category: 'Strength & Conditioning',
      ethiopianTime: 'ከምሽቱ 11:30 – 12:30',
    },
    {
      id: `tmpl-yoga-${selectedDate}`,
      title: 'Desk Worker Posture, Spine & Mobility Yoga',
      instructorName: 'Coach Tigist',
      scheduledDate: selectedDate,
      startTime: '18:45',
      endTime: '19:45',
      capacity: 14,
      bookedCount: 9,
      isFull: false,
      isBookedByMe: false,
      participants: [],
      category: 'Yoga & Mobility',
      ethiopianTime: 'ከምሽቱ 12:45 – 1:45',
    },
  ];

  // Merge DB classes with templates if DB is empty for this date
  const displayClasses = dbClasses.length > 0 ? dbClasses : defaultTemplates;

  // Filter classes
  const filteredClasses = displayClasses.filter((c) => {
    const isMorning = c.startTime < '12:00';
    if (shiftFilter === 'MORNING' && !isMorning) return false;
    if (shiftFilter === 'EVENING' && isMorning) return false;
    if (categoryFilter !== 'ALL' && c.category && c.category !== categoryFilter) return false;
    return true;
  });

  const selectedDayInfo = weekDays.find((d) => d.dateStr === selectedDate);

  return (
    <div className="space-y-6">
      {/* Action Notification Alert */}
      {actionMessage && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between shadow-xs transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2.5 text-xs font-semibold">
            {actionMessage.type === 'success' ? (
              <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            )}
            <span>{actionMessage.text}</span>
          </div>
          <button
            type="button"
            onClick={() => setActionMessage(null)}
            className="text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Top Banner: Shift Hours & Overview */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Weekly Gym Timetable & Group Classes
            </h1>
            <span className="text-xs font-mono font-semibold text-[#00843D] bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
              የሳምንቱ መርሃግብር
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browse structured group fitness classes, morning/evening shifts, and reserve your spot.
          </p>
        </div>

        {/* Shift Timings Quick Reference */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="bg-amber-50 border border-amber-200/80 rounded-lg px-3 py-2 text-xs">
            <div className="font-bold text-amber-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-amber-500"></span>
              ጠዋት / Morning Shift
            </div>
            <div className="font-mono text-slate-700 font-semibold text-[11px] mt-0.5">
              ከ11:00 – 1:30 <span className="text-slate-400">(6:00 – 8:30 AM)</span>
            </div>
          </div>

          <div className="bg-indigo-50 border border-indigo-200/80 rounded-lg px-3 py-2 text-xs">
            <div className="font-bold text-indigo-900 flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-indigo-500"></span>
              ማታ / Evening Shift
            </div>
            <div className="font-mono text-slate-700 font-semibold text-[11px] mt-0.5">
              ከ11:30 – 3:00 <span className="text-slate-400">(5:30 – 9:00 PM)</span>
            </div>
          </div>

          {isStaffOrAdmin && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 h-9 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#007033] rounded-[6px] shadow-xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Class</span>
            </button>
          )}
        </div>
      </div>

      {/* Day Selector (Mon – Sat) */}
      <div className="bg-white rounded-xl border border-slate-200 p-2 shadow-xs">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
          {weekDays.map((d) => {
            const isSelected = d.dateStr === selectedDate;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDate(d.dateStr)}
                className={`flex flex-col items-center justify-center p-3 rounded-lg transition-all cursor-pointer text-center relative ${
                  isSelected
                    ? 'bg-[#00843D] text-white shadow-xs font-bold ring-2 ring-[#00843D]/20'
                    : 'bg-slate-50 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {d.isToday && (
                  <span
                    className={`absolute top-1 right-1 text-[9px] font-bold px-1 rounded-xs uppercase ${
                      isSelected ? 'bg-moa-gold text-slate-900' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Today
                  </span>
                )}
                <span className="text-xs font-semibold">{d.short} / {d.amharic}</span>
                <span className={`text-base font-extrabold mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {d.dayNumber} {d.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-1 flex items-center gap-1">
            <Filter className="h-3.5 w-3.5" /> Shift:
          </span>
          <button
            type="button"
            onClick={() => setShiftFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              shiftFilter === 'ALL'
                ? 'bg-slate-900 text-white shadow-2xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Shifts
          </button>
          <button
            type="button"
            onClick={() => setShiftFilter('MORNING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              shiftFilter === 'MORNING'
                ? 'bg-amber-600 text-white shadow-2xs'
                : 'bg-amber-50 text-amber-800 hover:bg-amber-100'
            }`}
          >
            <Clock className="h-3 w-3" />
            ጠዋት / Morning
          </button>
          <button
            type="button"
            onClick={() => setShiftFilter('EVENING')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center gap-1 ${
              shiftFilter === 'EVENING'
                ? 'bg-indigo-600 text-white shadow-2xs'
                : 'bg-indigo-50 text-indigo-800 hover:bg-indigo-100'
            }`}
          >
            <Clock className="h-3 w-3" />
            ማታ / Evening
          </button>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Selected:</span>
          <span className="font-semibold text-slate-900">
            {selectedDayInfo?.name} ({selectedDayInfo?.amharic}), {selectedDayInfo?.dayNumber} {selectedDayInfo?.monthName}
          </span>
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh schedule"
            className="p-1 text-slate-400 hover:text-slate-600 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Class Schedule Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto text-[#00843D] mb-2" />
          <p className="text-xs font-semibold">Loading classes for {selectedDate}...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Calendar className="h-8 w-8 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No classes match the selected filter</p>
          <p className="text-xs text-slate-400 mt-1">Try switching shift filters or pick another day.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredClasses.map((item) => {
            const isMorning = item.startTime < '12:00';
            const capacityPercent = Math.min(100, Math.round((item.bookedCount / item.capacity) * 100));
            const spotsRemaining = Math.max(0, item.capacity - item.bookedCount);
            const isTemplate = item.id.startsWith('tmpl-');

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl border transition-all duration-200 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  item.isBookedByMe
                    ? 'border-emerald-500 ring-2 ring-emerald-500/15'
                    : 'border-slate-200'
                }`}
              >
                {/* Accent Top Border */}
                <div
                  className={`h-1.5 w-full ${
                    isMorning
                      ? 'bg-gradient-to-r from-amber-400 to-amber-600'
                      : 'bg-gradient-to-r from-indigo-500 to-[#00843D]'
                  }`}
                />

                <div className="p-5 flex-1">
                  {/* Category & Shift Badges */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full inline-flex items-center gap-1 ${
                        isMorning
                          ? 'bg-amber-50 text-amber-800 border border-amber-200'
                          : 'bg-indigo-50 text-indigo-800 border border-indigo-200'
                      }`}
                    >
                      <Clock className="h-3 w-3" />
                      {isMorning ? 'ጠዋት / Morning' : 'ማታ / Evening'}
                    </span>

                    {item.isBookedByMe && (
                      <span className="text-[11px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full border border-emerald-300 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Booked
                      </span>
                    )}

                    {item.isFull && !item.isBookedByMe && (
                      <span className="text-[11px] font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
                        Class Full
                      </span>
                    )}
                  </div>

                  {/* Title & Coach */}
                  <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-2">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1 flex items-center gap-1.5">
                    <span className="font-semibold text-slate-700">Coach / Instructor:</span>
                    <span className="text-emerald-700 font-semibold">{item.instructorName}</span>
                  </p>

                  {/* Timing in Ethiopian & Standard */}
                  <div className="mt-4 p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 font-medium">Standard Time:</span>
                      <span className="font-mono font-bold text-slate-900">
                        {item.startTime} – {item.endTime}
                      </span>
                    </div>
                    {item.ethiopianTime && (
                      <div className="flex items-center justify-between text-xs pt-1 border-t border-slate-200/60">
                        <span className="text-slate-500 font-medium">የኢትዮጵያ ሰዓት:</span>
                        <span className="font-mono font-semibold text-[#00843D]">
                          {item.ethiopianTime}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Capacity Bar */}
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 flex items-center gap-1">
                        <Users className="h-3.5 w-3.5 text-slate-400" />
                        <span>Capacity</span>
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-700">
                        {item.bookedCount} / {item.capacity} ({spotsRemaining} left)
                      </span>
                    </div>

                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${
                          capacityPercent >= 100
                            ? 'bg-rose-500'
                            : capacityPercent >= 75
                            ? 'bg-amber-500'
                            : 'bg-[#00843D]'
                        }`}
                        style={{ width: `${capacityPercent}%` }}
                      />
                    </div>
                  </div>
                </div>

                {/* Bottom Actions */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center justify-between gap-2">
                  {/* Attendant / Admin Roster Viewer */}
                  {isStaffOrAdmin && item.participants.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setViewParticipantsClass(item)}
                      className="text-xs font-semibold text-slate-700 hover:text-slate-900 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Roster ({item.participants.length})</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">
                      {isTemplate ? 'Standard Shift Class' : 'Scheduled Session'}
                    </span>
                  )}

                  {/* Booking Trigger */}
                  {item.isBookedByMe ? (
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(item.id)}
                      disabled={cancelMutation.isPending}
                      className="px-3 h-8 text-xs font-semibold text-rose-700 hover:text-rose-800 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-[6px] transition cursor-pointer disabled:opacity-50"
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Cancel Spot'}
                    </button>
                  ) : item.isFull ? (
                    <button
                      type="button"
                      disabled
                      className="px-3 h-8 text-xs font-semibold text-slate-400 bg-slate-100 rounded-[6px] cursor-not-allowed"
                    >
                      Class Full
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (isTemplate) {
                          alert(`You have reserved a spot for "${item.title}" on ${selectedDate}. Please check in at the gate terminal during your shift.`);
                        } else {
                          bookMutation.mutate(item.id);
                        }
                      }}
                      disabled={bookMutation.isPending}
                      className="px-3.5 h-8 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#007033] rounded-[6px] shadow-2xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="h-3.5 w-3.5 text-moa-gold" />
                      <span>{bookMutation.isPending ? 'Booking...' : 'Book Spot'}</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Admin / Attendant: Schedule New Class Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-[#00843D]" />
                <h2 className="text-base font-bold text-slate-900">Schedule Group Class</h2>
              </div>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                createClassMutation.mutate();
              }}
              className="mt-4 space-y-4"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Class Title / ስም *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Core Strength & Aerobics"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00843D]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Coach / Instructor *
                </label>
                <input
                  type="text"
                  required
                  value={newInstructor}
                  onChange={(e) => setNewInstructor(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00843D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Start Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newStartTime}
                    onChange={(e) => setNewStartTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00843D]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    End Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={newEndTime}
                    onChange={(e) => setNewEndTime(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00843D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Capacity (Spots) *
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  required
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-[#00843D]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 h-9 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createClassMutation.isPending}
                  className="px-4 h-9 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#007033] rounded-[6px] transition shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {createClassMutation.isPending ? 'Scheduling...' : 'Save & Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Roster Modal */}
      {viewParticipantsClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {viewParticipantsClass.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Registered Participants ({viewParticipantsClass.participants.length} / {viewParticipantsClass.capacity})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setViewParticipantsClass(null)}
                className="text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div className="mt-4 max-h-80 overflow-y-auto divide-y divide-slate-100">
              {viewParticipantsClass.participants.map((p, idx) => (
                <div key={p.bookingId || idx} className="py-2.5 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    {p.photoUrl ? (
                      <img
                        src={p.photoUrl}
                        alt={p.fullName}
                        className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="h-8 w-8 rounded-full bg-emerald-50 text-emerald-800 flex items-center justify-center font-bold text-xs">
                        {p.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="text-xs font-bold text-slate-900">{p.fullName}</div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        {p.employeeId} · {p.department}
                      </div>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      p.attended
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {p.attended ? 'Attended' : 'Registered'}
                  </span>
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
              <button
                type="button"
                onClick={() => setViewParticipantsClass(null)}
                className="px-4 h-8 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px] cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
