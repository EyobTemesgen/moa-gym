import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { apiRequest } from '../../lib/api';
import {
  Users,
  CheckCircle2,
  Building2,
  Calendar,
  ArrowRight,
  ShieldCheck,
  BarChart3,
  UserPlus,
  Clock,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';
import { StatCard } from '../../components/ui/StatCard';
import { btn, pill, statusTone } from '../../components/ui/theme';

interface DashboardStats {
  totalRegistered: number;
  activeMembers: number;
  suspendedMembers: number;
  totalDirectorates: number;
  registeredToday: number;
  activeFloorCount: number;
  departmentBreakdown: Array<{ department: string; count: number }>;
  shiftBreakdown: {
    MORNING: number;
    LUNCH: number;
    EVENING: number;
    FLEXIBLE: number;
  };
  recentRegistrations: Array<{
    id: string;
    regNumber: number;
    fullName: string;
    employeeId: string;
    department: string;
    shiftPreference?: string;
    status: string;
    registeredAt: string;
    hrRecord?: { photoUrl?: string };
  }>;
}

export const AdminDashboardPage: React.FC = () => {
  const { data: stats, isLoading } = useQuery<DashboardStats>({
    queryKey: ['dashboardStats'],
    queryFn: () => apiRequest('/registrations/stats'),
    refetchInterval: 15000,
  });

  const totalRegistered = stats?.totalRegistered ?? 0;
  const activeMembers = stats?.activeMembers ?? 0;
  const activeRate = totalRegistered > 0 ? Math.round((activeMembers / totalRegistered) * 100) : 100;
  const maxDeptCount = Math.max(...(stats?.departmentBreakdown?.map((d) => d.count) || [1]), 1);

  return (
    <div className="space-y-6">
      {/* Page Header (Asset Tracking Standard) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
              Executive Dashboard
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#00843D] border border-emerald-200 shadow-2xs">
              Staff Wellness Overview
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Staff Wellness & Fitness Executive Dashboard
          </p>
        </div>

        {/* Quick Top Actions */}
        <div className="flex items-center gap-2 shrink-0 flex-wrap sm:flex-nowrap">
          <Link to="/terminal" className={btn.secondary}>
            <ShieldCheck className="h-4 w-4 text-slate-500" />
            <span>Gate Terminal</span>
          </Link>

          <Link to="/reports" className={btn.secondary}>
            <BarChart3 className="h-4 w-4 text-slate-500" />
            <span>Reports</span>
          </Link>

          <Link to="/registrations" className={btn.primary}>
            <UserPlus className="h-4 w-4" />
            <span>Staff Registrations</span>
          </Link>
        </div>
      </div>

      {/* Top Metric KPI Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        <StatCard
          label="Total Registrants"
          value={totalRegistered}
          subtitle="Enrolled MoA staff"
          icon={<Users className="h-4 w-4" />}
        />

        <StatCard
          label="Active Members"
          value={activeMembers}
          subtitle={`${activeRate}% active rate`}
          valueColor="text-emerald-700"
          icon={<CheckCircle2 className="h-4 w-4" />}
        />

        <StatCard
          label="Directorates"
          value={stats?.totalDirectorates ?? 0}
          subtitle="Participating units"
          icon={<Building2 className="h-4 w-4" />}
        />

        <StatCard
          label="Registered Today"
          value={stats?.registeredToday ?? 0}
          subtitle="New intakes today"
          icon={<Calendar className="h-4 w-4" />}
        />

        <StatCard
          label="Suspended"
          value={stats?.suspendedMembers ?? 0}
          subtitle="Access on hold"
          valueColor={stats?.suspendedMembers ? 'text-amber-700' : 'text-slate-900'}
          icon={<AlertCircle className="h-4 w-4" />}
        />
      </div>

      {/* Analytics & Department Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Directorate Participation Breakdown (2 cols) */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200 shadow-xs p-5 flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <div>
              <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                <Building2 className="h-4 w-4 text-[#00843D]" />
                Directorate Participation
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Staff gym enrollment distribution across ministry work units
              </p>
            </div>
            <Link
              to="/registrations"
              className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
            >
              <span>View Roster</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-3.5 flex-1">
            {isLoading ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Loading directorate metrics...
              </div>
            ) : !stats?.departmentBreakdown || stats.departmentBreakdown.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                No directorate data recorded yet.
              </div>
            ) : (
              stats.departmentBreakdown.map((dept) => {
                const percent = Math.round((dept.count / maxDeptCount) * 100);
                const shareOfTotal =
                  totalRegistered > 0 ? Math.round((dept.count / totalRegistered) * 100) : 0;

                return (
                  <div key={dept.department} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 truncate pr-2">
                        {dept.department}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className="font-bold text-slate-900 tabular-nums">
                          {dept.count} members
                        </span>
                        <span className="text-[11px] text-slate-400 tabular-nums">
                          ({shareOfTotal}%)
                        </span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                      <div
                        className="bg-[#00843D] h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.max(percent, 4)}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Column: Shift Preferences & Facility Health */}
        <div className="space-y-6">
          {/* Official Ministry Operating Schedule Notice Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="bg-[#07572A] p-4 text-white">
              <div className="flex items-center gap-2 text-[10px] font-bold text-moa-gold uppercase tracking-wider">
                <Clock className="h-3.5 w-3.5" />
                <span>ጂምናዚየሙ አገልግሎት የሚሰጥበት ሰዓት</span>
              </div>
              <h3 className="text-xs font-bold text-white mt-1 leading-snug">
                የሚኒስቴር መ/ቤታችን ጂምናዚየም አገልግሎት መስጠት መጀመሩን በደስታ እንገልጻለን!
              </h3>
            </div>

            <div className="p-4 space-y-3 bg-white">
              <p className="text-[11px] text-slate-600 leading-relaxed">
                በጂምናዚየሙ አባል በመሆን ስፖርታዊ እንቅስቃሴ ለመስራት ፍላጎት ያላችሁ ሰራተኞች በ<strong className="text-slate-800">መሰረታዊ አገልግሎት ስራ አስፈፃሚ ክፍል</strong> በመገኘት መመዝገብ ይችላሉ።
              </p>

              <div className="space-y-2 pt-1 border-t border-slate-100">
                <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-emerald-950 flex items-center gap-1.5">
                      <span>🌅 ጠዋት</span>
                      <span className="text-[10px] text-emerald-700 font-semibold">(Morning)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">5:00 AM – 7:30 AM</div>
                  </div>
                  <div className="text-xs font-mono font-extrabold text-emerald-900 bg-emerald-100/80 px-2 py-1 rounded">
                    ከማለዳው 11:00 – 1:30
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-indigo-50/70 border border-indigo-100 flex items-center justify-between">
                  <div>
                    <div className="text-xs font-bold text-indigo-950 flex items-center gap-1.5">
                      <span>🌙 ማታ</span>
                      <span className="text-[10px] text-indigo-700 font-semibold">(Evening)</span>
                    </div>
                    <div className="text-[11px] text-slate-500 font-mono">5:30 PM – 9:00 PM</div>
                  </div>
                  <div className="text-xs font-mono font-extrabold text-indigo-900 bg-indigo-100/80 px-2 py-1 rounded">
                    ከ11:30 – ምሽት 3:00
                  </div>
                </div>
              </div>

              {/* Tri-color Accent Bar */}
              <div className="h-1 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue rounded-full mt-2"></div>
            </div>
          </div>

          {/* Shift Preferences Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2 pb-3 border-b border-slate-100">
              <Clock className="h-4 w-4 text-emerald-700" />
              Workout Shift Distribution
            </h2>
            <p className="text-xs text-slate-500 mt-1 mb-4">
              Registered staff workout time preferences
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              <div className="p-3 rounded-lg bg-emerald-50/70 border border-emerald-100">
                <span className="text-[11px] font-semibold text-emerald-800 block">ጠዋት (Morning)</span>
                <span className="text-[10px] text-emerald-600 block">11:00 – 1:30 (5:00–7:30 AM)</span>
                <div className="text-xl font-bold text-emerald-950 mt-1.5 tabular-nums">
                  {stats?.shiftBreakdown?.MORNING ?? 0}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-100">
                <span className="text-[11px] font-semibold text-indigo-800 block">ማታ (Evening)</span>
                <span className="text-[10px] text-indigo-600 block">11:30 – 3:00 (5:30–9:00 PM)</span>
                <div className="text-xl font-bold text-indigo-950 mt-1.5 tabular-nums">
                  {stats?.shiftBreakdown?.EVENING ?? 0}
                </div>
              </div>

              <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
                <span className="text-[11px] font-semibold text-slate-700 block">Flexible</span>
                <span className="text-[10px] text-slate-500 block">ማንኛውም ሰዓት</span>
                <div className="text-xl font-bold text-slate-900 mt-1.5 tabular-nums">
                  {(stats?.shiftBreakdown?.FLEXIBLE ?? 0) + (stats?.shiftBreakdown?.LUNCH ?? 0)}
                </div>
              </div>
            </div>
          </div>

          {/* Quick Operations Navigation Card */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs p-5">
            <h2 className="text-sm font-bold text-slate-900 pb-3 border-b border-slate-100">
              Quick Management Shortcuts
            </h2>

            <div className="mt-3 space-y-2">
              <Link
                to="/registrations"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-emerald-100 text-emerald-800">
                    <Users className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Staff Registrations Directory</div>
                    <div className="text-[11px] text-slate-500 font-normal">Manage member intake & roster</div>
                  </div>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                to="/terminal"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-amber-100 text-amber-800">
                    <ShieldCheck className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Gate Checking Terminal</div>
                    <div className="text-[11px] text-slate-500 font-normal">Fast Lane employee badge verify</div>
                  </div>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-slate-400" />
              </Link>

              <Link
                to="/reports"
                className="flex items-center justify-between p-2.5 rounded-lg hover:bg-slate-50 transition border border-transparent hover:border-slate-200 text-xs font-semibold text-slate-800"
              >
                <div className="flex items-center gap-2.5">
                  <div className="p-1.5 rounded-md bg-sky-100 text-sky-800">
                    <BarChart3 className="h-4 w-4" />
                  </div>
                  <div>
                    <div className="font-bold text-slate-900">Reports</div>
                    <div className="text-[11px] text-slate-500 font-normal">Attendance summaries & CSV export</div>
                  </div>
                </div>
                <ChevronRightIcon className="h-4 w-4 text-slate-400" />
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Recent Registrations Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Users className="h-4 w-4 text-[#00843D]" />
              Recent Staff Registrations
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Latest ministry staff members enrolled into the gym program
            </p>
          </div>

          <Link
            to="/registrations"
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 inline-flex items-center gap-1"
          >
            <span>View All Registrations</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className="bg-slate-50/80 border-b border-slate-200 text-slate-700 text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="py-2.5 px-4">Full Name</th>
                <th className="py-2.5 px-4">Directorate</th>
                <th className="py-2.5 px-3.5">Employee ID</th>
                <th className="py-2.5 px-3.5">Shift Preference</th>
                <th className="py-2.5 px-3.5">Registration Date</th>
                <th className="py-2.5 px-3 text-center">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    Loading recent registrations...
                  </td>
                </tr>
              ) : !stats?.recentRegistrations || stats.recentRegistrations.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-xs">
                    No registrations recorded yet.
                  </td>
                </tr>
              ) : (
                stats.recentRegistrations.map((row) => (
                  <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-2.5 px-4">
                      <div className="flex items-center gap-2.5">
                        {row.hrRecord?.photoUrl ? (
                          <img
                            src={row.hrRecord.photoUrl}
                            alt={row.fullName}
                            className="h-7 w-7 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                            {row.fullName.charAt(0)}
                          </div>
                        )}
                        <span className="font-bold text-slate-900 truncate">{row.fullName}</span>
                      </div>
                    </td>
                    <td className="py-2.5 px-4 font-semibold text-slate-700">{row.department}</td>
                    <td className="py-2.5 px-3.5">
                      <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200">
                        {row.employeeId}
                      </span>
                    </td>
                    <td className="py-2.5 px-3.5 text-xs text-slate-600">
                      {row.shiftPreference || 'Flexible'}
                    </td>
                    <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px]">
                      {new Date(row.registeredAt).toLocaleDateString('en-GB')}
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <span
                        className={`${pill} ${
                          row.status === 'ACTIVE' ? statusTone.active : statusTone.suspended
                        }`}
                      >
                        {row.status === 'ACTIVE' ? 'Active' : 'Suspended'}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

const ChevronRightIcon = ({ className }: { className?: string }) => (
  <svg
    className={className}
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);
