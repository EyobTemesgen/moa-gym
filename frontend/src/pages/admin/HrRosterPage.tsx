import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import {
  UploadCloud,
  FileSpreadsheet,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Download,
  UserCheck,
  UserX,
  User,
} from 'lucide-react';

interface RosterItem {
  employeeId: string;
  fullName: string;
  department: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  employmentStatus: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  userAccount?: {
    id: string;
    role: string;
    waiverSigned: boolean;
    waiverSignedAt?: string;
  } | null;
}

export const HrRosterPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  // Departments list
  const { data: departments } = useQuery<string[]>({
    queryKey: ['departments'],
    queryFn: () => apiRequest('/hr-roster/departments'),
  });

  // Roster list
  const { data: rosterData, isLoading } = useQuery<{
    items: RosterItem[];
    total: number;
    page: number;
    limit: number;
  }>({
    queryKey: ['hrRoster', search, selectedDept, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('query', search.trim());
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      return apiRequest(`/hr-roster?${params.toString()}`);
    },
  });

  // Toggle status mutation
  const toggleStatusMutation = useMutation({
    mutationFn: ({
      employeeId,
      status,
    }: {
      employeeId: string;
      status: 'ACTIVE' | 'INACTIVE';
    }) =>
      apiRequest(`/hr-roster/${employeeId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['hrRoster'] });
    },
  });

  // Handle CSV Upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const csvText = event.target?.result as string;
      if (!csvText) return;

      setIsUploading(true);
      setUploadResult(null);
      try {
        const res = await apiRequest('/hr-roster/upload', {
          method: 'POST',
          body: JSON.stringify({ csvContent: csvText }),
        });
        setUploadResult(
          `✓ Successfully synced ${res.totalRows} employees (${res.created} new, ${res.updated} updated).`,
        );
        queryClient.invalidateQueries({ queryKey: ['hrRoster'] });
        queryClient.invalidateQueries({ queryKey: ['departments'] });
      } catch (err: any) {
        alert(err.message || 'CSV sync failed');
      } finally {
        setIsUploading(false);
      }
    };
    reader.readAsText(file);
  };

  const handleDownloadTemplate = () => {
    const template =
      'employeeId,fullName,department,phone,email,employmentStatus\r\n' +
      'EMP-MOA-101,Abebe Kebede,Agricultural Extension Directorate,+251911223344,abebe.k@moa.gov.et,ACTIVE\r\n' +
      'EMP-MOA-102,Genet Bekele,Horticulture Directorate,+251922334455,genet.b@moa.gov.et,ACTIVE\r\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'moa_staff_roster_template.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              MoA Staff Eligibility Whitelist (HR Portal)
            </h1>
            <span className="text-[11px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {rosterData?.total ?? 0} Whitelisted Employees
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Maintain authorized ministry staff roster. Only active employees can claim accounts and access the gym.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={handleDownloadTemplate}
            className="inline-flex items-center gap-1.5 px-3 py-2 bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 text-xs font-semibold rounded-xl transition cursor-pointer"
          >
            <Download className="h-4 w-4" />
            <span>CSV Template</span>
          </button>

          <label className="inline-flex items-center gap-1.5 px-4 py-2 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer">
            <UploadCloud className="h-4 w-4" />
            <span>{isUploading ? 'Syncing...' : 'Upload HR CSV'}</span>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={handleFileUpload}
              disabled={isUploading}
            />
          </label>
        </div>
      </div>

      {uploadResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2">
          <CheckCircle2 className="h-5 w-5 text-moa-green shrink-0" />
          <span>{uploadResult}</span>
        </div>
      )}

      {/* Filters & Search */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 max-w-sm w-full">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="h-4 w-4" />
          </div>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by Employee ID, Name, Directorate..."
            className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Directorate Filter */}
          <select
            value={selectedDept}
            onChange={(e) => setSelectedDept(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 bg-white"
          >
            <option value="ALL">All Directorates</option>
            {(departments || []).map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 bg-white"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active Staff</option>
            <option value="INACTIVE">Inactive / Suspended</option>
          </select>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                <th className="py-3 px-4">Employee</th>
                <th className="py-3 px-4">MoA Directorate</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">HR Eligibility</th>
                <th className="py-3 px-4">Portal Account</th>
                <th className="py-3 px-4">Waiver</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(rosterData?.items || []).map((emp) => {
                const isActive = emp.employmentStatus === 'ACTIVE';
                const hasAccount = !!emp.userAccount;
                const hasWaiver = emp.userAccount?.waiverSigned;

                return (
                  <tr key={emp.employeeId} className="hover:bg-slate-50/50 transition">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {emp.photoUrl ? (
                          <img
                            src={emp.photoUrl}
                            alt={emp.fullName}
                            className="h-9 w-9 rounded-xl object-cover ring-1 ring-slate-200"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-slate-100 text-slate-400 flex items-center justify-center font-bold">
                            <User className="h-4 w-4" />
                          </div>
                        )}
                        <div>
                          <div className="font-bold text-slate-900">{emp.fullName}</div>
                          <div className="font-mono text-[11px] text-slate-500">
                            {emp.employeeId}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3 px-4 text-slate-700 font-medium">
                      {emp.department}
                    </td>

                    <td className="py-3 px-4 text-slate-500">
                      <div>{emp.phone}</div>
                      {emp.email && <div className="text-[11px] text-slate-400">{emp.email}</div>}
                    </td>

                    <td className="py-3 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          isActive
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-red-100 text-moa-danger'
                        }`}
                      >
                        {isActive ? (
                          <>
                            <CheckCircle2 className="h-3 w-3" />
                            ACTIVE
                          </>
                        ) : (
                          <>
                            <XCircle className="h-3 w-3" />
                            {emp.employmentStatus}
                          </>
                        )}
                      </span>
                    </td>

                    <td className="py-3 px-4">
                      {hasAccount ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-moa-green">
                          <UserCheck className="h-3.5 w-3.5" />
                          Claimed ({emp.userAccount?.role})
                        </span>
                      ) : (
                        <span className="text-[11px] text-slate-400">Not Claimed</span>
                      )}
                    </td>

                    <td className="py-3 px-4">
                      {hasWaiver ? (
                        <span className="text-[11px] font-bold text-emerald-700">✓ Signed</span>
                      ) : (
                        <span className="text-[11px] text-amber-700 font-medium">Pending</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() =>
                          toggleStatusMutation.mutate({
                            employeeId: emp.employeeId,
                            status: isActive ? 'INACTIVE' : 'ACTIVE',
                          })
                        }
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-semibold transition cursor-pointer ${
                          isActive
                            ? 'text-red-700 hover:bg-red-50 border border-red-200'
                            : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
                        }`}
                      >
                        {isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
