import React, { useState, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import {
  BarChart3,
  Download,
  Users,
  Clock,
  ShieldCheck,
  Building2,
  TrendingUp,
  Search,
  RotateCcw,
  X,
  User,
  Key,
  CheckCircle2,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { SortableHeader, SortDirection } from '../../components/ui/SortableHeader';
import { usePagination, Pagination } from '../../components/ui/Pagination';
import { btn, table, pill, statusTone } from '../../components/ui/theme';

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

export interface AttendanceLogItem {
  id: string;
  userId: string;
  employeeId: string;
  fullName: string;
  department: string;
  photoUrl?: string;
  checkInTime: string;
  checkOutTime?: string | null;
  durationMinutes?: number | null;
  lockerNumber?: string | null;
  autoClosed: boolean;
  status: 'ACTIVE' | 'COMPLETED' | 'AUTO_CLOSED';
}

type TabStatus = 'ALL' | 'COMPLETED' | 'ACTIVE' | 'AUTO_CLOSED';

const LOG_TABS: { key: TabStatus; label: string }[] = [
  { key: 'ALL', label: 'All Sessions' },
  { key: 'COMPLETED', label: 'Completed' },
  { key: 'ACTIVE', label: 'Currently Active' },
  { key: 'AUTO_CLOSED', label: 'Auto-Closed (23:59)' },
];

function formatDuration(minutes?: number | null) {
  if (minutes === null || minutes === undefined) return '—';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m > 0 ? `${h}h ${m}m` : `${h}h`;
}

export const AnalyticsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [days, setDays] = useState(30);

  // Table filter states
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [activeTab, setActiveTab] = useState<TabStatus>('ALL');
  const [sortColumn, setSortColumn] = useState<string>('checkInTime');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  // Aggregated Analytics Query
  const { data: analytics, isLoading: isAnalyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ['analytics', days],
    queryFn: () => apiRequest(`/reports/analytics?days=${days}`),
  });

  // Attendance Logs Query
  const { data: logsData, isLoading: isLogsLoading } = useQuery<{
    items: AttendanceLogItem[];
    total: number;
    departments: string[];
  }>({
    queryKey: ['attendanceLogs', days, search, selectedDept, activeTab],
    queryFn: () => {
      const params = new URLSearchParams();
      params.append('days', days.toString());
      if (search.trim()) params.append('query', search.trim());
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      if (activeTab !== 'ALL') params.append('status', activeTab);
      params.append('limit', '100');
      return apiRequest(`/reports/attendance-logs?${params.toString()}`);
    },
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

  // Sorting
  const sortedItems = useMemo(() => {
    const list = [...(logsData?.items || [])];
    list.sort((a: any, b: any) => {
      let valA = a[sortColumn];
      let valB = b[sortColumn];

      if (sortColumn === 'checkInTime' || sortColumn === 'checkOutTime') {
        valA = valA ? new Date(valA).getTime() : 0;
        valB = valB ? new Date(valB).getTime() : 0;
      }

      if (valA === valB) return 0;
      if (valA === null || valA === undefined) return 1;
      if (valB === null || valB === undefined) return -1;

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      return sortDirection === 'asc' ? 1 : -1;
    });
    return list;
  }, [logsData?.items, sortColumn, sortDirection]);

  // Client-side pagination over fetched items
  const pager = usePagination(sortedItems, {
    pageSize: 15,
    resetKey: `${days}-${search}-${selectedDept}-${activeTab}`,
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const hasActiveFilters = search.trim() !== '' || selectedDept !== 'ALL' || activeTab !== 'ALL';

  const clearAllFilters = () => {
    setSearch('');
    setSelectedDept('ALL');
    setActiveTab('ALL');
  };

  return (
    <div className="space-y-6">
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
            Gymnasium attendance audit logs, utilization metrics, and exportable records
          </p>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap sm:flex-nowrap justify-start sm:justify-end">
          <select
            value={days}
            onChange={(e) => setDays(Number(e.target.value))}
            className="px-3 h-9 text-xs border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-700 bg-white font-medium text-slate-700 shadow-2xs cursor-pointer"
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
          value={isAnalyticsLoading ? '--' : analytics?.summary.totalVisits ?? 0}
          subtitle="Check-ins in selected period"
          valueColor="text-slate-900"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Active Staff"
          value={isAnalyticsLoading ? '--' : analytics?.summary.uniqueStaffAttendees ?? 0}
          subtitle={`Out of ${analytics?.summary.activeRosterEligible ?? 0} eligible`}
          valueColor="text-emerald-700"
          icon={<Users className="h-5 w-5" />}
        />
        <StatCard
          label="Enrolled Members"
          value={isAnalyticsLoading ? '--' : analytics?.summary.waiversCompleted ?? 0}
          subtitle="Registered staff members"
          valueColor="text-slate-900"
          icon={<ShieldCheck className="h-5 w-5" />}
        />
        <StatCard
          label="Auto-Closed"
          value={isAnalyticsLoading ? '--' : analytics?.summary.autoClosedSessions ?? 0}
          subtitle="Nightly 23:59 safety checkouts"
          valueColor="text-amber-800"
          icon={<Clock className="h-5 w-5" />}
        />
      </div>

      {/* Analytics Charts Grid */}
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
            {isAnalyticsLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">Loading directorate breakdown...</div>
            ) : !analytics?.departmentDistribution || analytics.departmentDistribution.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">No visit records in this period.</div>
            ) : (
              analytics.departmentDistribution.slice(0, 7).map((dept) => {
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
                        style={{ width: `${Math.max(4, pct)}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })
            )}
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
            {isAnalyticsLoading ? (
              <div className="w-full py-12 text-center text-slate-400 text-xs">Loading hourly histogram...</div>
            ) : (
              (analytics?.peakHours || []).map((h) => {
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
              })
            )}
          </div>
        </div>
      </div>

      {/* Attendance Activity Logs Data Table (Matching PTS DisbursementsListView & ATS Standard) */}
      <div className={table.card}>
        {/* Table Title Bar */}
        <div className="p-4 border-b border-slate-200 bg-white flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-50 rounded-lg text-[#00843D]">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Attendance Activity Logs</h2>
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                  {logsData?.total ?? 0} Recorded
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Audit trail of daily check-ins, durations, and assigned lockers
              </p>
            </div>
          </div>
        </div>

        {/* Tab Filters Bar */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 pt-2.5 flex items-center gap-1 overflow-x-auto">
          {LOG_TABS.map((tab) => {
            const isTabActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                type="button"
                onClick={() => setActiveTab(tab.key)}
                className={`px-3 py-1.5 rounded-t-[4px] text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
                  isTabActive
                    ? 'bg-white border-t-2 border-t-[#00843D] border-x border-slate-200 text-slate-900 shadow-2xs -mb-px'
                    : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100/80 border-t-2 border-transparent'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Search & Filter Toolbar */}
        <div className="p-3.5 bg-white border-b border-slate-200 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by staff name, employee ID, or locker..."
              className={table.search}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-2.5 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 h-8.5 text-xs border border-slate-300 rounded-[4px] focus:outline-none focus:border-emerald-700 bg-white font-medium text-slate-700 shadow-2xs cursor-pointer"
            >
              <option value="ALL">All Directorates</option>
              {(logsData?.departments || []).map((d) => (
                <option key={d} value={d}>
                  {d}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => queryClient.invalidateQueries({ queryKey: ['attendanceLogs'] })}
              title="Refresh logs"
              className={btn.secondary}
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Active Filter Chips Bar */}
        {hasActiveFilters && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Active filters:</span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                <span>Search: "{search}"</span>
                <button type="button" onClick={() => setSearch('')} className="hover:text-emerald-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDept !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                <span>Directorate: {selectedDept}</span>
                <button type="button" onClick={() => setSelectedDept('ALL')} className="hover:text-emerald-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeTab !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                <span>Tab: {LOG_TABS.find((t) => t.key === activeTab)?.label}</span>
                <button type="button" onClick={() => setActiveTab('ALL')} className="hover:text-emerald-950 cursor-pointer">
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={clearAllFilters}
              className="text-[11px] text-emerald-700 hover:text-emerald-900 font-semibold underline ml-auto cursor-pointer"
            >
              Clear all filters
            </button>
          </div>
        )}

        {/* Table Body */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className={table.headRow}>
              <tr>
                <SortableHeader
                  label="Staff Member"
                  columnKey="fullName"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-4"
                />
                <SortableHeader
                  label="Employee ID"
                  columnKey="employeeId"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-3.5 w-32"
                />
                <SortableHeader
                  label="Directorate"
                  columnKey="department"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-4"
                />
                <SortableHeader
                  label="Check-In"
                  columnKey="checkInTime"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-3.5 w-36"
                />
                <SortableHeader
                  label="Check-Out"
                  columnKey="checkOutTime"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-3.5 w-36"
                />
                <SortableHeader
                  label="Duration"
                  columnKey="durationMinutes"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-3 w-28 text-center"
                  align="center"
                />
                <th className="py-2.5 px-3 text-center w-24">Locker</th>
                <SortableHeader
                  label="Status"
                  columnKey="status"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-3 w-28 text-center"
                  align="center"
                />
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-100 bg-white">
              {isLogsLoading ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mb-2"></div>
                    <p className="text-xs">Loading attendance activity logs...</p>
                  </td>
                </tr>
              ) : pager.pageItems.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Clock className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">No attendance sessions found</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      No check-in records match the current filter criteria.
                    </p>
                    {hasActiveFilters && (
                      <button
                        type="button"
                        onClick={clearAllFilters}
                        className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-[4px] border border-slate-300 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5 text-slate-400" />
                        <span>Clear all filters</span>
                      </button>
                    )}
                  </td>
                </tr>
              ) : (
                pager.pageItems.map((log: AttendanceLogItem) => {
                  const checkIn = new Date(log.checkInTime);
                  const checkOut = log.checkOutTime ? new Date(log.checkOutTime) : null;

                  return (
                    <tr key={log.id} className={table.row}>
                      {/* Staff Member Avatar & Name */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {log.photoUrl ? (
                            <img
                              src={log.photoUrl}
                              alt={log.fullName}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-200 shrink-0">
                              {log.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0 font-bold text-slate-900 truncate">
                            {log.fullName}
                          </div>
                        </div>
                      </td>

                      {/* Employee ID */}
                      <td className="py-2.5 px-3.5">
                        <span className={table.code}>{log.employeeId}</span>
                      </td>

                      {/* Directorate */}
                      <td className="py-2.5 px-4 font-semibold text-slate-700 truncate max-w-xs">
                        {log.department}
                      </td>

                      {/* Check-In */}
                      <td className="py-2.5 px-3.5 font-mono text-xs text-slate-600">
                        <div>{checkIn.toLocaleDateString('en-GB')}</div>
                        <div className="text-[11px] text-slate-400">
                          {checkIn.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </td>

                      {/* Check-Out */}
                      <td className="py-2.5 px-3.5 font-mono text-xs">
                        {checkOut ? (
                          <>
                            <div className="text-slate-600">{checkOut.toLocaleDateString('en-GB')}</div>
                            <div className="text-[11px] text-slate-400">
                              {checkOut.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </div>
                          </>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            On Floor
                          </span>
                        )}
                      </td>

                      {/* Duration */}
                      <td className="py-2.5 px-3 text-center">
                        {log.status === 'ACTIVE' ? (
                          <span className="text-[11px] font-bold text-emerald-700 font-mono">
                            In Session
                          </span>
                        ) : (
                          <span className="text-xs font-mono font-semibold text-slate-800">
                            {formatDuration(log.durationMinutes)}
                          </span>
                        )}
                      </td>

                      {/* Locker # */}
                      <td className="py-2.5 px-3 text-center">
                        {log.lockerNumber ? (
                          <span className="inline-flex items-center gap-1 font-mono text-xs font-semibold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            <Key className="w-3 h-3 text-amber-600" />
                            <span>#{log.lockerNumber}</span>
                          </span>
                        ) : (
                          <span className="text-slate-400 text-xs">—</span>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-2.5 px-3 text-center">
                        {log.status === 'ACTIVE' && (
                          <span className={`${pill} ${statusTone.active}`}>
                            Active
                          </span>
                        )}
                        {log.status === 'COMPLETED' && (
                          <span className={`${pill} ${statusTone.neutral}`}>
                            Completed
                          </span>
                        )}
                        {log.status === 'AUTO_CLOSED' && (
                          <span className={`${pill} ${statusTone.pending}`} title="Automatically checked out at 23:59">
                            Auto-Closed
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        <Pagination pager={pager} label="attendance sessions" />
      </div>
    </div>
  );
};
