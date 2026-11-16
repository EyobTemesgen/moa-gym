import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import {
  Users,
  Key,
  LogOut,
  Search,
  CheckCircle2,
  Clock,
  User,
  AlertCircle,
  RefreshCw,
} from 'lucide-react';
import { OccupancyBanner } from '../../components/OccupancyBanner';

interface ActiveFloorUser {
  attendanceId: string;
  userId: string;
  employeeId: string;
  fullName: string;
  department: string;
  photoUrl?: string;
  checkInTime: string;
  lockerNumber?: string;
}

interface LockerItem {
  id: string;
  lockerNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
  assignedUser?: {
    userId: string;
    employeeId: string;
    fullName: string;
    department: string;
  } | null;
}

export const ActiveFloorPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [activeTab, setActiveTab] = useState<'floor' | 'lockers'>('floor');

  // Floor occupancy data
  const { data: occupancy, isLoading: isFloorLoading } = useQuery<{
    current: number;
    maxCapacity: number;
    percentage: number;
    activeUsers: ActiveFloorUser[];
  }>({
    queryKey: ['liveOccupancy'],
    queryFn: () => apiRequest('/attendance/occupancy'),
    refetchInterval: 10000,
  });

  // Lockers data
  const { data: lockers, isLoading: isLockersLoading } = useQuery<LockerItem[]>({
    queryKey: ['lockers'],
    queryFn: () => apiRequest('/lockers'),
    refetchInterval: 15000,
  });

  // Check-out mutation
  const checkOutMutation = useMutation({
    mutationFn: (attendanceId: string) =>
      apiRequest('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ identifier: attendanceId }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['liveOccupancy'] });
      queryClient.invalidateQueries({ queryKey: ['lockers'] });
    },
  });

  // Locker release mutation
  const releaseLockerMutation = useMutation({
    mutationFn: (lockerNumber: string) =>
      apiRequest(`/lockers/${lockerNumber}/release`, { method: 'POST' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lockers'] });
      queryClient.invalidateQueries({ queryKey: ['liveOccupancy'] });
    },
  });

  const filteredUsers = (occupancy?.activeUsers || []).filter((u) => {
    const q = search.toLowerCase();
    return (
      u.fullName.toLowerCase().includes(q) ||
      u.employeeId.toLowerCase().includes(q) ||
      u.department.toLowerCase().includes(q) ||
      (u.lockerNumber && u.lockerNumber.toLowerCase().includes(q))
    );
  });

  return (
    <div className="space-y-6">
      {/* Overview & Tabs */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Live Gym Floor & Locker Control
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time tracking of staff currently inside the facility and active daily lockers.
          </p>
        </div>

        <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
          <button
            type="button"
            onClick={() => setActiveTab('floor')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'floor'
                ? 'bg-white text-moa-green shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Active Staff ({occupancy?.current ?? 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('lockers')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeTab === 'lockers'
                ? 'bg-white text-moa-green shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Locker Grid (30)
          </button>
        </div>
      </div>

      <OccupancyBanner />

      {activeTab === 'floor' ? (
        // Active Floor Staff Tab
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Search className="h-4 w-4" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search active staff by name, ID, or locker..."
                className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
              />
            </div>

            <span className="text-xs text-slate-500">
              Showing <strong>{filteredUsers.length}</strong> active staff member(s)
            </span>
          </div>

          {filteredUsers.length > 0 ? (
            <div className="divide-y divide-slate-100">
              {filteredUsers.map((u) => (
                <div
                  key={u.attendanceId}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-slate-50/50 transition"
                >
                  <div className="flex items-center gap-3">
                    {u.photoUrl ? (
                      <img
                        src={u.photoUrl}
                        alt={u.fullName}
                        className="h-11 w-11 rounded-xl object-cover ring-1 ring-slate-200"
                      />
                    ) : (
                      <div className="h-11 w-11 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center">
                        <User className="h-5 w-5" />
                      </div>
                    )}

                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{u.fullName}</h4>
                      <p className="text-[11px] text-slate-500 font-mono">
                        {u.employeeId} · {u.department}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-600">
                      <Clock className="h-3.5 w-3.5 text-moa-green" />
                      <span>
                        In:{' '}
                        {new Date(u.checkInTime).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    {u.lockerNumber ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-blue-50 text-moa-blue font-mono font-semibold text-[11px] border border-blue-200">
                        <Key className="h-3 w-3" />
                        {u.lockerNumber}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-400">No locker</span>
                    )}

                    <button
                      type="button"
                      onClick={() => checkOutMutation.mutate(u.attendanceId)}
                      disabled={checkOutMutation.isPending}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-moa-danger hover:bg-red-100 border border-red-200 rounded-lg text-xs font-semibold transition cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Check Out</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <Users className="mx-auto h-8 w-8 text-slate-300 mb-2" />
              <p className="text-xs text-slate-500">
                {search ? 'No active staff match search filter.' : 'Gym floor is currently empty.'}
              </p>
            </div>
          )}
        </div>
      ) : (
        // Locker Grid Tab
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Daily Locker Inventory (L-01 to L-30)
              </h3>
              <p className="text-xs text-slate-500">
                Lockers are for daily workout use only and auto-reset at 23:59 nightly.
              </p>
            </div>

            <div className="flex items-center gap-4 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-emerald-100 border border-emerald-300"></span>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-amber-100 border border-amber-300"></span>
                <span>Occupied</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="h-3 w-3 rounded bg-red-100 border border-red-300"></span>
                <span>Maintenance</span>
              </div>
            </div>
          </div>

          {isLockersLoading ? (
            <div className="py-12 text-center text-xs text-slate-400">
              Loading locker states...
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-3">
              {(lockers || []).map((l) => {
                const isOccupied = l.status === 'OCCUPIED';
                const isMaint = l.status === 'MAINTENANCE';

                return (
                  <div
                    key={l.id}
                    className={`p-3 rounded-xl border flex flex-col justify-between h-28 transition ${
                      isOccupied
                        ? 'bg-amber-50/70 border-amber-200'
                        : isMaint
                        ? 'bg-red-50/70 border-red-200'
                        : 'bg-emerald-50/50 border-emerald-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-sm text-slate-900">
                        {l.lockerNumber}
                      </span>
                      <Key
                        className={`h-4 w-4 ${
                          isOccupied
                            ? 'text-amber-600'
                            : isMaint
                            ? 'text-red-500'
                            : 'text-moa-green'
                        }`}
                      />
                    </div>

                    <div>
                      {isOccupied && l.assignedUser ? (
                        <div>
                          <p className="text-[11px] font-bold text-slate-800 truncate">
                            {l.assignedUser.fullName}
                          </p>
                          <p className="text-[10px] text-slate-500 font-mono">
                            {l.assignedUser.employeeId}
                          </p>
                        </div>
                      ) : isMaint ? (
                        <p className="text-[10px] font-semibold text-red-700">Out of Order</p>
                      ) : (
                        <p className="text-[10px] font-semibold text-emerald-700">Available</p>
                      )}
                    </div>

                    {isOccupied && (
                      <button
                        type="button"
                        onClick={() => releaseLockerMutation.mutate(l.lockerNumber)}
                        disabled={releaseLockerMutation.isPending}
                        className="text-[10px] font-semibold text-amber-800 hover:text-amber-950 underline self-start cursor-pointer"
                      >
                        Force Release
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
