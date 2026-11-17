import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { RegisterStaffModal } from '../../components/registrations/RegisterStaffModal';
import { BatchRegisterModal } from '../../components/registrations/BatchRegisterModal';
import { GymRegistrantsPrintModal } from '../../components/registrations/GymRegistrantsPrintModal';
import {
  Users,
  UserPlus,
  Printer,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  FileSpreadsheet,
  Clock,
  Building2,
  Calendar,
  PenTool,
  AlertCircle,
  MoreVertical,
} from 'lucide-react';

interface Registrant {
  id: string;
  regNumber: number;
  employeeId: string;
  fullName: string;
  department: string;
  phone?: string;
  email?: string;
  shiftPreference?: string;
  registeredAt: string;
  registeredBy?: string;
  registrationSource: string;
  signatureConfirmed: boolean;
  signatureData?: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'CANCELLED';
  remarks?: string;
  hrRecord?: {
    photoUrl?: string;
    employmentStatus: string;
  };
}

export const RegistrationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [isBatchModalOpen, setIsBatchModalOpen] = useState(false);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);
  const [notification, setNotification] = useState<string | null>(null);

  // Fetch Registrations
  const { data, isLoading } = useQuery<{
    items: Registrant[];
    total: number;
    departments: string[];
  }>({
    queryKey: ['gymRegistrations', search, selectedDept, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('query', search.trim());
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      return apiRequest(`/registrations?${params.toString()}`);
    },
  });

  // Fetch summary stats
  const { data: stats } = useQuery<{
    totalRegistered: number;
    activeMembers: number;
    totalDirectorates: number;
    registeredToday: number;
  }>({
    queryKey: ['registrationStats'],
    queryFn: () => apiRequest('/registrations/stats'),
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/registrations/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gymRegistrations'] });
      queryClient.invalidateQueries({ queryKey: ['registrationStats'] });
    },
  });

  const getShiftBadge = (shift?: string) => {
    switch (shift) {
      case 'MORNING':
        return (
          <span className="bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded text-[10px] font-semibold">
            ጠዋት (06:00 - 08:30)
          </span>
        );
      case 'LUNCH':
        return (
          <span className="bg-blue-50 text-blue-800 border border-blue-200 px-2 py-0.5 rounded text-[10px] font-semibold">
            ምሳ (12:00 - 14:00)
          </span>
        );
      case 'EVENING':
        return (
          <span className="bg-indigo-50 text-indigo-800 border border-indigo-200 px-2 py-0.5 rounded text-[10px] font-semibold">
            ማታ (17:00 - 20:00)
          </span>
        );
      default:
        return (
          <span className="bg-slate-50 text-slate-600 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
            ማንኛውም (Flexible)
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Title Banner */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
              ግብርና ሚ/ር ሰራተኞች የጂምናዚየም ተመዝጋቢዎች ስም ዝርዝር
            </h1>
            <span className="text-[11px] font-bold text-moa-green bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              {stats?.totalRegistered ?? data?.total ?? 0} የተመዘገቡ
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            MoA Staff Gym Registrants Roster · የሰራተኞች የአካል ብቃት ማዕከል አገልግሎት ምዝገባና የተመዝጋቢዎች ማህደር
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl border border-slate-200 transition cursor-pointer"
          >
            <Printer className="h-4 w-4 text-slate-600" />
            <span>ዝርዝር አትም (Print Roster)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold rounded-xl border border-emerald-200 transition cursor-pointer"
          >
            <FileSpreadsheet className="h-4 w-4 text-moa-green" />
            <span>ፈጣን የቡድን ምዝገባ (Batch Entry)</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-bold rounded-xl shadow-xs transition cursor-pointer"
          >
            <UserPlus className="h-4 w-4" />
            <span>+ አዲስ ተመዝጋቢ መዝግብ (Register Staff)</span>
          </button>
        </div>
      </div>

      {notification && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-moa-green shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600"
          >
            ✕
          </button>
        </div>
      )}

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ድምር ተመዝጋቢዎች (Total)</span>
            <Users className="h-5 w-5 text-moa-green" />
          </div>
          <div className="text-2xl font-black text-slate-900 mt-2">
            {stats?.totalRegistered ?? data?.total ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">የተመዘገቡ የግብርና ሚ/ር ሰራተኞች</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ንቁ ተጠቃሚዎች (Active)</span>
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-700 mt-2">
            {stats?.activeMembers ?? 0}
          </div>
          <div className="text-[11px] text-emerald-600 mt-0.5 font-medium">በአገልግሎት ላይ የሚገኙ</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">የተወከሉ ዳይሬክቶሬቶች</span>
            <Building2 className="h-5 w-5 text-moa-blue" />
          </div>
          <div className="text-2xl font-black text-moa-blue mt-2">
            {stats?.totalDirectorates ?? data?.departments?.length ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">የተለያዩ የስራ ክፍሎች</div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">ዛሬ የተመዘገቡ (Today)</span>
            <Calendar className="h-5 w-5 text-moa-gold" />
          </div>
          <div className="text-2xl font-black text-slate-800 mt-2">
            {stats?.registeredToday ?? 0}
          </div>
          <div className="text-[11px] text-slate-400 mt-0.5">በዛሬው ዕለት የገቡ አዳዲስ</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="በስም፣ በዳይሬክቶሬት (የስራ ክፍል)፣ በመለያ ቁጥር ወይም በስልክ ፈልግ..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-green/30"
          />
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          {/* Directorate Dropdown */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-green/30 bg-white"
          >
            <option value="ALL">ሁሉም የስራ ክፍሎች (All Directorates)</option>
            {(data?.departments || []).map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-green/30 bg-white"
          >
            <option value="ALL">ሁሉም ሁኔታዎች (All Statuses)</option>
            <option value="ACTIVE">ንቁ (Active)</option>
            <option value="SUSPENDED">የታገዱ (Suspended)</option>
          </select>
        </div>
      </div>

      {/* Registrants Table matching official paper format */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-700 font-bold">
                <th className="py-3 px-3.5 w-14 text-center">ተ.ቁ</th>
                <th className="py-3 px-4">ስም ዝርዝር (Full Name)</th>
                <th className="py-3 px-4">የስራ ክፍል / ዳይሬክቶሬት (Department)</th>
                <th className="py-3 px-3.5 w-28">መለያ ቁ. (ID)</th>
                <th className="py-3 px-3.5 w-28">ስልክ ቁጥር</th>
                <th className="py-3 px-3.5">የምርጫ ሰዓት (Shift)</th>
                <th className="py-3 px-3.5 w-24">ቀን (Date)</th>
                <th className="py-3 px-4 text-center w-28">ፊርማ (Signature)</th>
                <th className="py-3 px-3 w-20 text-center">ሁኔታ</th>
                <th className="py-3 px-4 text-right w-24">ድርጊት</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {isLoading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    መረጃው በመጫን ላይ ነው (Loading registrants...)...
                  </td>
                </tr>
              ) : (data?.items || []).length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-slate-400">
                    ምንም የተመዘገበ ሰራተኛ አልተገኘም (No registered staff members found).
                  </td>
                </tr>
              ) : (
                (data?.items || []).map((row) => {
                  const isActive = row.status === 'ACTIVE';

                  return (
                    <tr key={row.id} className="hover:bg-slate-50/70 transition">
                      {/* ተ.ቁ */}
                      <td className="py-3 px-3.5 text-center font-bold font-mono text-slate-600 bg-slate-50/50">
                        {row.regNumber}
                      </td>

                      {/* ስም ዝርዝር */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2.5">
                          {row.hrRecord?.photoUrl ? (
                            <img
                              src={row.hrRecord.photoUrl}
                              alt={row.fullName}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-200">
                              {row.fullName.charAt(0)}
                            </div>
                          )}
                          <div>
                            <div className="font-bold text-slate-900">{row.fullName}</div>
                            {row.registrationSource === 'PAPER_FORM' && (
                              <span className="text-[10px] text-amber-700 font-medium">
                                📋 ከወረቀት ቅጽ
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* የስራ ክፍል */}
                      <td className="py-3 px-4 font-semibold text-slate-800">
                        {row.department}
                      </td>

                      {/* መለያ ቁጥር */}
                      <td className="py-3 px-3.5 font-mono text-[11px] text-slate-500">
                        {row.employeeId}
                      </td>

                      {/* ስልክ */}
                      <td className="py-3 px-3.5 text-slate-600 font-mono text-[11px]">
                        {row.phone || '—'}
                      </td>

                      {/* Shift preference */}
                      <td className="py-3 px-3.5">
                        {getShiftBadge(row.shiftPreference)}
                      </td>

                      {/* የተመዘገበበት ቀን */}
                      <td className="py-3 px-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(row.registeredAt).toLocaleDateString('en-GB')}
                      </td>

                      {/* ፊርማ */}
                      <td className="py-2 px-4 text-center">
                        {row.signatureData ? (
                          <img
                            src={row.signatureData}
                            alt="Signature"
                            className="h-6 max-w-[80px] mx-auto object-contain"
                          />
                        ) : row.signatureConfirmed ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-moa-green">
                            <PenTool className="h-3 w-3" />
                            <span>ተፈርሟል</span>
                          </span>
                        ) : (
                          <span className="text-slate-300 font-mono text-[11px]">—</span>
                        )}
                      </td>

                      {/* ሁኔታ */}
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            isActive
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isActive ? 'ንቁ' : 'የታገደ'}
                        </span>
                      </td>

                      {/* ድርጊት */}
                      <td className="py-3 px-4 text-right">
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: row.id,
                              status: isActive ? 'SUSPENDED' : 'ACTIVE',
                            })
                          }
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                            isActive
                              ? 'text-red-700 hover:bg-red-50 border border-red-200'
                              : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                          }`}
                        >
                          {isActive ? 'እገድ' : 'አንቃ'}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <RegisterStaffModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={(newReg) => {
          queryClient.invalidateQueries({ queryKey: ['gymRegistrations'] });
          queryClient.invalidateQueries({ queryKey: ['registrationStats'] });
          setNotification(
            `✓ ሰራተኛው "${newReg.fullName}" በተ.ቁ ${newReg.regNumber} በተሳካ ሁኔታ ተመዝግቧል።`,
          );
        }}
      />

      <BatchRegisterModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['gymRegistrations'] });
          queryClient.invalidateQueries({ queryKey: ['registrationStats'] });
          setNotification('✓ የቡድን ምዝገባው በተሳካ ሁኔታ ተጠናቋል።');
        }}
      />

      <GymRegistrantsPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        items={data?.items || []}
        totalCount={data?.total || 0}
        selectedDepartment={selectedDept}
      />
    </div>
  );
};
