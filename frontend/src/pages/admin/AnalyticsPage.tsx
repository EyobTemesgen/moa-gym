import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import {
  BarChart3,
  Download,
  Users,
  Clock,
  ShieldCheck,
  Building,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

interface AnalyticsData {
  periodDays: number;
  summary: {
    totalVisits: number;
    uniqueStaffAttendees: number;
    activeRosterEligible: number;
    accountsClaimed: number;
    waiversCompleted: number;
    autoClosedSessions: number;
    facilityMaxCapacity: number;
  };
  departmentDistribution: Array<{
    department: string;
    count: number;
  }>;
  peakHours: Array<{
    hour: string;
    visits: number;
  }>;
}

export const AnalyticsPage: React.FC = () => {
  const [days, setDays] = useState(30);

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', days],
    queryFn: () => apiRequest(`/reports/analytics?days=${days}`),
  });

  const handleDownloadCsv = () => {
    window.location.href = `/api/reports/export-csv?days=${days}`;
  };

  const maxDeptCount = Math.max(
    ...(analytics?.departmentDistribution.map((d) => d.count) || [1]),
    1,
  );

  const maxHourVisits = Math.max(
    ...(analytics?.peakHours.map((h) => h.visits) || [1]),
    1,
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900 tracking-tight">
            Facility Utilization Analytics & Export
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Aggregated attendance patterns, peak workout hours, and directorate wellness engagement.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-green/30 bg-white"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last Quarter (90 Days)</option>
          </select>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Total Gym Visits</span>
            <div className="p-2 bg-emerald-50 text-moa-green rounded-xl">
              <TrendingUp className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {isLoading ? '--' : analytics?.summary.totalVisits}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Logged check-ins in period</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Unique Staff Active</span>
            <div className="p-2 bg-blue-50 text-moa-blue rounded-xl">
              <Users className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {isLoading ? '--' : analytics?.summary.uniqueStaffAttendees}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Out of {analytics?.summary.activeRosterEligible ?? 0} eligible
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Waivers Completed</span>
            <div className="p-2 bg-emerald-50 text-moa-green rounded-xl">
              <ShieldCheck className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {isLoading ? '--' : analytics?.summary.waiversCompleted}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Compliant for entrance</p>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500">Auto-Closed (23:59)</span>
            <div className="p-2 bg-amber-50 text-amber-600 rounded-xl">
              <Clock className="h-4 w-4" />
            </div>
          </div>
          <div className="text-2xl font-bold font-mono text-slate-900">
            {isLoading ? '--' : analytics?.summary.autoClosedSessions}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">Closed by nightly cron</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Directorate Breakdown */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-slate-50 rounded-xl text-moa-green">
              <Building className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Participation by Directorate
              </h3>
              <p className="text-xs text-slate-500">Distribution of gym sessions across MoA branches</p>
            </div>
          </div>

          <div className="space-y-3">
            {(analytics?.departmentDistribution || []).map((dept) => {
              const pct = Math.round((dept.count / maxDeptCount) * 100);
              return (
                <div key={dept.department} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-medium text-slate-800 truncate max-w-xs">
                      {dept.department}
                    </span>
                    <span className="font-mono font-bold text-slate-600">{dept.count} visits</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className="bg-moa-green h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Hours Histogram */}
        <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-slate-50 rounded-xl text-moa-blue">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Peak Workout Hours</h3>
              <p className="text-xs text-slate-500">Daily check-in distribution (06:00 to 21:00)</p>
            </div>
          </div>

          <div className="flex items-end gap-1.5 h-48 pt-6">
            {(analytics?.peakHours || []).map((h) => {
              const heightPct = Math.round((h.visits / maxHourVisits) * 100);
              return (
                <div key={h.hour} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end group">
                  <span className="text-[10px] font-mono text-slate-500 opacity-0 group-hover:opacity-100 transition">
                    {h.visits}
                  </span>
                  <div
                    className="w-full bg-moa-blue/80 hover:bg-moa-blue rounded-t transition-all duration-300"
                    style={{ height: `${Math.max(4, heightPct)}%` }}
                  ></div>
                  <span className="text-[9px] font-mono text-slate-400 rotate-[-45deg] origin-top-left mt-1">
                    {h.hour.split(':')[0]}h
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
