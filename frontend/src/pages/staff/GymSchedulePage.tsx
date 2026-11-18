import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  AlertCircle,
  Plus,
  X,
  UserCheck,
  Check,
  RefreshCw,
} from 'lucide-react';

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

  const today = new Date();
  const currentDayIndex = today.getDay();
  
  const monday = new Date(today);
  const diffToMonday = currentDayIndex === 0 ? -6 : 1 - currentDayIndex;
  monday.setDate(today.getDate() + diffToMonday);
  monday.setHours(0, 0, 0, 0);

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

  const defaultDateStr = weekDays.find((d) => d.isToday)?.dateStr || weekDays[0].dateStr;
  const [selectedDate, setSelectedDate] = useState<string>(defaultDateStr);
  const [shiftFilter, setShiftFilter] = useState<'ALL' | 'MORNING' | 'EVENING'>('ALL');

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewParticipantsClass, setViewParticipantsClass] = useState<WellnessClass | null>(null);
  const [actionMessage, setActionMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [newTitle, setNewTitle] = useState('');
  const [newInstructor, setNewInstructor] = useState('Coach Henok');
  const [newStartTime, setNewStartTime] = useState('06:30');
  const [newEndTime, setNewEndTime] = useState('07:30');
  const [newCapacity, setNewCapacity] = useState(15);

  const { data: dbClasses = [], isLoading, refetch } = useQuery<WellnessClass[]>({
    queryKey: ['wellness-classes', selectedDate],
    queryFn: async () => {
      return apiRequest<WellnessClass[]>(`/wellness/classes?date=${selectedDate}`);
    },
  });

  const bookMutation = useMutation({
    mutationFn: async (classId: string) => {
      return apiRequest(`/wellness/classes/${classId}/book`, { method: 'POST' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-classes'] });
      setActionMessage({ type: 'success', text: 'Class spot booked successfully!' });
      setTimeout(() => setActionMessage(null), 3500);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to book class.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async (classId: string) => {
      return apiRequest(`/wellness/classes/${classId}/book`, { method: 'DELETE' });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['wellness-classes'] });
      setActionMessage({ type: 'success', text: 'Reservation cancelled.' });
      setTimeout(() => setActionMessage(null), 3500);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to cancel reservation.' });
      setTimeout(() => setActionMessage(null), 4000);
    },
  });

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
      setActionMessage({ type: 'success', text: 'Class scheduled successfully.' });
      setTimeout(() => setActionMessage(null), 3500);
    },
    onError: (err: any) => {
      setActionMessage({ type: 'error', text: err.message || 'Failed to create class.' });
    },
  });

  const isStaffOrAdmin = user?.role === 'ADMIN' || user?.role === 'HR_ADMIN' || user?.role === 'GYM_ATTENDANT';

  const defaultTemplates: WellnessClass[] = [
    {
      id: `tmpl-morning-${selectedDate}`,
      title: 'Morning Aerobics & Conditioning',
      instructorName: 'Coach Henok',
      scheduledDate: selectedDate,
      startTime: '06:15',
      endTime: '07:15',
      capacity: 15,
      bookedCount: 8,
      isFull: false,
      isBookedByMe: false,
      participants: [],
      category: 'Aerobics',
      ethiopianTime: 'ከማለዳው 12:15 – 1:15',
    },
    {
      id: `tmpl-evening-${selectedDate}`,
      title: 'Post-Work Strength & Form',
      instructorName: 'Trainer Bethel',
      scheduledDate: selectedDate,
      startTime: '17:30',
      endTime: '18:30',
      capacity: 18,
      bookedCount: 12,
      isFull: false,
      isBookedByMe: false,
      participants: [],
      category: 'Strength',
      ethiopianTime: 'ከምሽቱ 11:30 – 12:30',
    },
    {
      id: `tmpl-yoga-${selectedDate}`,
      title: 'Desk Worker Posture & Mobility',
      instructorName: 'Coach Tigist',
      scheduledDate: selectedDate,
      startTime: '18:45',
      endTime: '19:45',
      capacity: 14,
      bookedCount: 9,
      isFull: false,
      isBookedByMe: false,
      participants: [],
      category: 'Mobility',
      ethiopianTime: 'ከምሽቱ 12:45 – 1:45',
    },
  ];

  const displayClasses = dbClasses.length > 0 ? dbClasses : defaultTemplates;

  const filteredClasses = displayClasses.filter((c) => {
    const isMorning = c.startTime < '12:00';
    if (shiftFilter === 'MORNING' && !isMorning) return false;
    if (shiftFilter === 'EVENING' && isMorning) return false;
    return true;
  });

  const selectedDayInfo = weekDays.find((d) => d.dateStr === selectedDate);

  return (
    <div className="space-y-6">
      {/* Toast Alert */}
      {actionMessage && (
        <div
          className={`p-3.5 rounded-xl border flex items-center justify-between shadow-xs transition-all ${
            actionMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2 text-xs font-semibold">
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

      {/* Clean Top Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-lg font-bold text-slate-900 tracking-tight">
              Gym Schedule
            </h1>
            <span className="text-xs font-mono font-semibold text-[#00843D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              የሳምንቱ መርሃግብር
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Weekly class schedule, shift timings, and session reservations.
          </p>
        </div>

        {/* Clean Shift Summary & Action */}
        <div className="flex items-center gap-3 shrink-0 flex-wrap">
          <div className="text-[11px] text-slate-500 font-mono hidden md:block">
            <span>Morning: 6:00 – 8:30 AM</span>
            <span className="mx-1.5 text-slate-300">·</span>
            <span>Evening: 5:30 – 9:00 PM</span>
          </div>

          {isStaffOrAdmin && (
            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="px-3.5 h-8.5 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#007033] rounded-[6px] shadow-2xs transition flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Schedule Class</span>
            </button>
          )}
        </div>
      </div>

      {/* Clean Horizontal Day Selector (Mon – Sat) */}
      <div className="bg-white rounded-xl border border-slate-200 p-1.5 shadow-xs">
        <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5">
          {weekDays.map((d) => {
            const isSelected = d.dateStr === selectedDate;
            return (
              <button
                key={d.key}
                type="button"
                onClick={() => setSelectedDate(d.dateStr)}
                className={`flex flex-col items-center justify-center py-2.5 px-2 rounded-lg transition-all cursor-pointer text-center relative ${
                  isSelected
                    ? 'bg-slate-900 text-white font-bold shadow-xs'
                    : 'bg-slate-50/70 text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {d.isToday && (
                  <span
                    className={`absolute top-1 right-1 text-[8px] font-bold px-1 rounded-xs uppercase tracking-wider ${
                      isSelected ? 'bg-moa-gold text-slate-950' : 'bg-emerald-100 text-emerald-800'
                    }`}
                  >
                    Today
                  </span>
                )}
                <span className="text-[11px] font-medium">{d.short} · {d.amharic}</span>
                <span className={`text-sm font-bold mt-0.5 ${isSelected ? 'text-white' : 'text-slate-900'}`}>
                  {d.dayNumber} {d.monthName}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Minimal Filter Bar */}
      <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Shift Filter Tabs */}
        <div className="flex items-center gap-1 text-xs">
          {[
            { key: 'ALL', label: 'All Shifts' },
            { key: 'MORNING', label: 'ጠዋት / Morning' },
            { key: 'EVENING', label: 'ማታ / Evening' },
          ].map((tab) => (
            <button
              key={tab.key}
              type="button"
              onClick={() => setShiftFilter(tab.key as any)}
              className={`px-3 py-1.5 rounded-lg font-medium transition cursor-pointer ${
                shiftFilter === tab.key
                  ? 'bg-slate-900 text-white font-semibold shadow-2xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Selected Day Meta */}
        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>{selectedDayInfo?.name} ({selectedDayInfo?.amharic}), {selectedDayInfo?.dayNumber} {selectedDayInfo?.monthName}</span>
          <button
            type="button"
            onClick={() => refetch()}
            title="Refresh schedule"
            className="p-1 text-slate-400 hover:text-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Class Schedule Cards Grid */}
      {isLoading ? (
        <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
          <RefreshCw className="h-5 w-5 animate-spin mx-auto text-[#00843D] mb-2" />
          <p className="text-xs font-medium">Loading schedule...</p>
        </div>
      ) : filteredClasses.length === 0 ? (
        <div className="bg-white rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
          <Calendar className="h-7 w-7 mx-auto text-slate-400 mb-2" />
          <p className="text-sm font-semibold text-slate-700">No classes for this shift</p>
          <p className="text-xs text-slate-400 mt-0.5">Switch shifts or pick another day of the week.</p>
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
                className={`bg-white rounded-xl border transition-all duration-150 flex flex-col justify-between overflow-hidden shadow-xs hover:shadow-md ${
                  item.isBookedByMe
                    ? 'border-emerald-500 ring-1 ring-emerald-500/20'
                    : 'border-slate-200'
                }`}
              >
                <div className="p-5 flex-1">
                  {/* Top Shift Tag & Booking Badge */}
                  <div className="flex items-center justify-between gap-2 mb-2.5">
                    <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                      {isMorning ? 'ጠዋት · Morning' : 'ማታ · Evening'}
                    </span>

                    {item.isBookedByMe && (
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                        <Check className="h-3 w-3" /> Reserved
                      </span>
                    )}

                    {item.isFull && !item.isBookedByMe && (
                      <span className="text-[10px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                        Full
                      </span>
                    )}
                  </div>

                  {/* Title & Instructor */}
                  <h3 className="text-sm font-bold text-slate-900 leading-snug">
                    {item.title}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    Coach: <span className="font-semibold text-slate-700">{item.instructorName}</span>
                  </p>

                  {/* Clean Time Display */}
                  <div className="mt-3.5 flex items-center gap-1.5 text-xs text-slate-600 font-mono">
                    <Clock className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                    <span>{item.startTime} – {item.endTime}</span>
                    {item.ethiopianTime && (
                      <span className="text-slate-400 text-[11px]">({item.ethiopianTime})</span>
                    )}
                  </div>

                  {/* Clean Capacity Meter */}
                  <div className="mt-3 space-y-1">
                    <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>{item.bookedCount} / {item.capacity} spots</span>
                      <span>{spotsRemaining > 0 ? `${spotsRemaining} left` : '0 left'}</span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${
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

                {/* Card Actions */}
                <div className="px-4 py-3 bg-slate-50/60 border-t border-slate-100 flex items-center justify-between gap-2">
                  {isStaffOrAdmin && item.participants.length > 0 ? (
                    <button
                      type="button"
                      onClick={() => setViewParticipantsClass(item)}
                      className="text-xs font-semibold text-slate-600 hover:text-slate-900 flex items-center gap-1 cursor-pointer"
                    >
                      <UserCheck className="h-3.5 w-3.5" />
                      <span>Roster ({item.participants.length})</span>
                    </button>
                  ) : (
                    <span className="text-[11px] text-slate-400">Regular Session</span>
                  )}

                  {item.isBookedByMe ? (
                    <button
                      type="button"
                      onClick={() => cancelMutation.mutate(item.id)}
                      disabled={cancelMutation.isPending}
                      className="px-2.5 h-7.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-[6px] transition cursor-pointer disabled:opacity-50"
                    >
                      {cancelMutation.isPending ? 'Cancelling...' : 'Cancel'}
                    </button>
                  ) : item.isFull ? (
                    <button
                      type="button"
                      disabled
                      className="px-2.5 h-7.5 text-xs font-semibold text-slate-400 bg-slate-100 rounded-[6px] cursor-not-allowed"
                    >
                      Full
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={() => {
                        if (isTemplate) {
                          alert(`You have reserved a spot for "${item.title}" on ${selectedDate}.`);
                        } else {
                          bookMutation.mutate(item.id);
                        }
                      }}
                      disabled={bookMutation.isPending}
                      className="px-3 h-7.5 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#007033] rounded-[6px] shadow-2xs transition cursor-pointer disabled:opacity-50"
                    >
                      {bookMutation.isPending ? 'Booking...' : 'Book Spot'}
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
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h2 className="text-base font-bold text-slate-900">Schedule Group Session</h2>
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
              className="mt-4 space-y-3.5"
            >
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Session Title *
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Core Conditioning & Aerobics"
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#00843D]"
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
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#00843D]"
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
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#00843D]"
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
                    className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#00843D]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Max Capacity *
                </label>
                <input
                  type="number"
                  min="5"
                  max="40"
                  required
                  value={newCapacity}
                  onChange={(e) => setNewCapacity(Number(e.target.value))}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-[#00843D]"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 h-8 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createClassMutation.isPending}
                  className="px-3.5 h-8 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#007033] rounded-[6px] transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {createClassMutation.isPending ? 'Saving...' : 'Save Session'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Participants Roster Modal */}
      {viewParticipantsClass && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h2 className="text-base font-bold text-slate-900">
                  {viewParticipantsClass.title}
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Roster ({viewParticipantsClass.participants.length} / {viewParticipantsClass.capacity})
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

            <div className="mt-3 max-h-72 overflow-y-auto divide-y divide-slate-100">
              {viewParticipantsClass.participants.map((p, idx) => (
                <div key={p.bookingId || idx} className="py-2 flex items-center justify-between gap-3 text-xs">
                  <div>
                    <div className="font-semibold text-slate-900">{p.fullName}</div>
                    <div className="text-[11px] text-slate-500 font-mono">
                      {p.employeeId} · {p.department}
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      p.attended
                        ? 'bg-emerald-50 text-emerald-800'
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
                className="px-3.5 h-7.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-[6px] cursor-pointer"
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
