import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import {
  BarChart3,
  Download,
  Users,
  Clock,
  ShieldCheck,
  Building2,
  TrendingUp,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { btn } from '../../components/ui/theme';

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
    <div className="space-y-5">
      {/* Page Header (Asset Tracking Style) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
              Reports
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#00843D] border border-emerald-200 shadow-2xs">
              Attendance & Utilization
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            Gymnasium attendance summaries and exportable records
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 h-9 text-xs border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-700 bg-white font-medium text-slate-700 shadow-2xs"
          >
            <option value={7}>Last 7 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>

          <button
            type="button"
            onClick={handleDownloadCsv}
            className={btn.primary}
            title="Download CSV attendance report"
          >
            <Download className="h-4 w-4" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Visits"
          value={isLoading ? '--' : analytics?.summary.totalVisits ?? 0}
          subtitle="Check-ins in selected period"
          valueColor="text-slate-900"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Active Staff"
          value={isLoading ? '--' : analytics?.summary.uniqueStaffAttendees ?? 0}
          subtitle={`Out of ${analytics?.summary.activeRosterEligible ?? 0} eligible`}
          valueColor="text-emerald-700"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Enrolled Members"
          value={isLoading ? '--' : analytics?.summary.waiversCompleted ?? 0}
          subtitle="Registered staff members"
          valueColor="text-slate-900"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Auto-Closed"
          value={isLoading ? '--' : analytics?.summary.autoClosedSessions ?? 0}
          subtitle="Nightly 23:59 safety checkouts"
          valueColor="text-amber-800"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Directorate Breakdown */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-emerald-50 rounded-lg text-[#00843D]">
              <Building2 className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">
                Visits by Directorate
              </h3>
              <p className="text-xs text-slate-500">Distribution of gym sessions across MoA work units</p>
            </div>
          </div>

          <div className="space-y-3">
            {(analytics?.departmentDistribution || []).map((dept) => {
              const pct = Math.round((dept.count / maxDeptCount) * 100);
              return (
                <div key={dept.department} className="space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="font-semibold text-slate-800 truncate max-w-xs">
                      {dept.department}
                    </span>
                    <span className="font-mono font-bold text-slate-600">{dept.count} visits</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                    <div
                      className="bg-[#00843D] h-2 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Peak Hours Histogram */}
        <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-4">
            <div className="p-2 bg-slate-100 rounded-lg text-slate-700">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900">Hourly Attendance</h3>
              <p className="text-xs text-slate-500">Check-in distribution across workout hours</p>
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
                    className="w-full bg-emerald-700/80 hover:bg-[#00843D] rounded-t transition-all duration-300"
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
