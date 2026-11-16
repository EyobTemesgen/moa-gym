import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../lib/api';
import { Users, AlertCircle, CheckCircle2 } from 'lucide-react';

interface OccupancyData {
  current: number;
  maxCapacity: number;
  percentage: number;
  activeUsers: Array<{
    attendanceId: string;
    employeeId: string;
    fullName: string;
    department: string;
    photoUrl?: string;
    checkInTime: string;
    lockerNumber?: string;
  }>;
}

export const OccupancyBanner: React.FC<{ compact?: boolean }> = ({ compact = false }) => {
  const { data, isLoading } = useQuery<OccupancyData>({
    queryKey: ['liveOccupancy'],
    queryFn: () => apiRequest<OccupancyData>('/attendance/occupancy'),
    refetchInterval: 15000, // 15 seconds
  });

  const current = data?.current ?? 0;
  const maxCapacity = data?.maxCapacity ?? 40;
  const percentage = data?.percentage ?? 0;

  const getStatusColor = () => {
    if (percentage >= 95) return 'text-moa-danger bg-red-50 border-red-200';
    if (percentage >= 75) return 'text-amber-800 bg-amber-50 border-amber-200';
    return 'text-moa-green bg-emerald-50 border-emerald-200';
  };

  const getBarColor = () => {
    if (percentage >= 95) return 'bg-moa-danger';
    if (percentage >= 75) return 'bg-moa-gold';
    return 'bg-moa-green';
  };

  if (compact) {
    return (
      <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full border text-xs font-medium ${getStatusColor()}`}>
        <span className="relative flex h-2 w-2">
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${percentage >= 90 ? 'bg-red-400' : 'bg-emerald-400'}`}></span>
          <span className={`relative inline-flex rounded-full h-2 w-2 ${percentage >= 90 ? 'bg-red-500' : 'bg-emerald-500'}`}></span>
        </span>
        <span>
          Live Floor: <strong>{current}</strong> / {maxCapacity} staff ({percentage}%)
        </span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-moa-surface rounded-lg text-moa-green">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-slate-800">Facility Live Occupancy</h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                15s Live Polling
              </span>
            </div>
            <p className="text-xs text-slate-500">Ministry Staff Wellness & Fitness Center Floor Count</p>
          </div>
        </div>

        <div className="text-right">
          <div className="text-2xl font-bold font-mono text-slate-900">
            {isLoading ? '--' : current}
            <span className="text-sm font-normal text-slate-500"> / {maxCapacity}</span>
          </div>
          <span className="text-xs font-medium text-slate-600">
            {percentage >= 100 ? 'Full Capacity' : `${maxCapacity - current} spots open`}
          </span>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-slate-100 rounded-full h-2.5 overflow-hidden">
        <div
          className={`h-2.5 rounded-full transition-all duration-500 ${getBarColor()}`}
          style={{ width: `${Math.min(100, percentage)}%` }}
        ></div>
      </div>

      <div className="mt-2 flex items-center justify-between text-[11px] text-slate-500">
        <span>0</span>
        <span>25%</span>
        <span>50%</span>
        <span>75%</span>
        <span>100% (Cap: {maxCapacity})</span>
      </div>
    </div>
  );
};
