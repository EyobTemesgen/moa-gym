import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import {
  Users,
  Plus,
  Printer,
  Search,
  CheckCircle2,
  FileSpreadsheet,
  Download,
  RotateCcw,
  X,
} from 'lucide-react';
import { RegisterStaffModal } from '../../components/registrations/RegisterStaffModal';
import { BatchRegisterModal } from '../../components/registrations/BatchRegisterModal';
import { GymRegistrantsPrintModal } from '../../components/registrations/GymRegistrantsPrintModal';
import { SortableHeader, SortDirection } from '../../components/ui/SortableHeader';
import { usePagination, Pagination } from '../../components/ui/Pagination';
import { btn, table, statusTone, pill } from '../../components/ui/theme';
import { downloadCsv } from '../../utils/csv';

export interface Registrant {
  id: string;
  regNumber: number;
  employeeId: string;
  fullName: string;
  department: string;
  phone?: string;
  email?: string;
  gender?: string;
  shiftPreference?: string;
  registeredAt: string;
  registeredBy?: string;
  registrationSource?: string;
  signatureConfirmed: boolean;
  signatureData?: string;
  status: string;
  remarks?: string;
  hrRecord?: {
    photoUrl?: string;
    employmentStatus?: string;
  };
}

type TabFilter = 'ALL' | 'ACTIVE' | 'MORNING' | 'EVENING' | 'SUSPENDED';

const TABS: { key: TabFilter; label: string }[] = [
  { key: 'ALL', label: 'All Members' },
  { key: 'ACTIVE', label: 'Active' },
  { key: 'MORNING', label: 'Morning (ጠዋት 11:00 - 1:30)' },
  { key: 'EVENING', label: 'Evening (ማታ 11:30 - 3:00)' },
  { key: 'SUSPENDED', label: 'Suspended' },
];

export const RegistrationsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [search, setSearch] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [sortColumn, setSortColumn] = useState<string>('regNumber');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');

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
    queryKey: ['gymRegistrations', search, selectedDept],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('query', search.trim());
      if (selectedDept !== 'ALL') params.append('department', selectedDept);
      return apiRequest(`/registrations?${params.toString()}`);
    },
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

  // Tab Filtering & Sorting
  const filteredAndSortedItems = useMemo(() => {
    let items = (data?.items || []).slice();

    // Tab filter
    if (activeTab === 'ACTIVE') {
      items = items.filter((item) => item.status === 'ACTIVE');
    } else if (activeTab === 'SUSPENDED') {
      items = items.filter((item) => item.status === 'SUSPENDED');
    } else if (activeTab === 'MORNING') {
      items = items.filter((item) => item.shiftPreference === 'MORNING');
    } else if (activeTab === 'EVENING') {
      items = items.filter((item) => item.shiftPreference === 'EVENING');
    }

    // Sorting
    items.sort((a, b) => {
      let valA: any = (a as any)[sortColumn];
      let valB: any = (b as any)[sortColumn];

      if (sortColumn === 'registeredAt') {
        valA = new Date(valA).getTime();
        valB = new Date(valB).getTime();
      } else if (typeof valA === 'string') {
        valA = valA.toLowerCase();
        valB = (valB || '').toLowerCase();
      }

      if (valA < valB) return sortDirection === 'asc' ? -1 : 1;
      if (valA > valB) return sortDirection === 'asc' ? 1 : -1;
      return 0;
    });

    return items;
  }, [data?.items, activeTab, sortColumn, sortDirection]);

  // Client-side pagination
  const pager = usePagination<Registrant>(filteredAndSortedItems, {
    pageSize: 10,
    resetKey: `${activeTab}-${selectedDept}-${search}`,
  });

  const handleSort = (columnKey: string) => {
    if (sortColumn === columnKey) {
      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'));
    } else {
      setSortColumn(columnKey);
      setSortDirection('asc');
    }
  };

  const handleExportCsv = () => {
    const rows = filteredAndSortedItems.map((r) => ({
      'Reg No': r.regNumber,
      'Full Name': r.fullName,
      'Department': r.department,
      'Employee ID': r.employeeId,
      'Phone': r.phone || '',
      'Shift Preference': r.shiftPreference || 'Flexible',
      'Registration Date': new Date(r.registeredAt).toLocaleDateString('en-GB'),
      'Signature': r.signatureConfirmed ? 'Verified' : 'Pending',
      'Status': r.status,
    }));
    downloadCsv(`moa-gym-registrations-${new Date().toISOString().slice(0, 10)}.csv`, rows);
  };

  const clearAllFilters = () => {
    setActiveTab('ALL');
    setSelectedDept('ALL');
    setSearch('');
    setSortColumn('regNumber');
    setSortDirection('asc');
  };

  const hasActiveFilters =
    search.trim() !== '' || selectedDept !== 'ALL' || activeTab !== 'ALL' || sortColumn !== 'regNumber' || sortDirection !== 'asc';

  return (
    <div className="space-y-5">
      {/* Page Title & Main Action Buttons (Asset Tracking style) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
              Staff Registrations
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#00843D] border border-emerald-200 shadow-2xs">
              {data?.total ?? 0} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            Staff gym membership records and directory
          </p>
        </div>

        {/* Action Buttons Toolbar - Guaranteed Single Row on Desktop/Tablet */}
        <div className="flex items-center gap-2 shrink-0 flex-nowrap overflow-x-auto justify-start xl:justify-end">
          <button
            type="button"
            onClick={handleExportCsv}
            title="Export filtered records to CSV"
            className={btn.secondary}
          >
            <Download className="h-4 w-4 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            type="button"
            onClick={() => setIsPrintModalOpen(true)}
            title="Print official A4 roster report"
            className={btn.secondary}
          >
            <Printer className="h-4 w-4 text-slate-500" />
            <span>Print Roster</span>
          </button>

          <button
            type="button"
            onClick={() => setIsBatchModalOpen(true)}
            title="Import staff registrations from Excel (.xlsx) or CSV, or batch enter forms"
            className={btn.secondary}
          >
            <FileSpreadsheet className="h-4 w-4 text-emerald-700" />
            <span>Import CSV / Excel</span>
          </button>

          <button
            type="button"
            onClick={() => setIsRegisterModalOpen(true)}
            title="Register a new staff member"
            className={btn.primary}
          >
            <Plus className="h-4 w-4" />
            <span>Register Staff</span>
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {notification && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs font-semibold text-emerald-900 flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#00843D] shrink-0" />
            <span>{notification}</span>
          </div>
          <button
            type="button"
            onClick={() => setNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Table Container Card */}
      <div className={table.card}>
        {/* Filter Tabs Bar (Asset Tracking Style Tab Switcher) */}
        <div className="border-b border-slate-200 bg-slate-50/70 px-4 pt-2.5 flex items-center gap-1 overflow-x-auto">
          {TABS.map((tab) => {
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

        {/* Search & Select Toolbar */}
        <div className="p-4 bg-white border-b border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="relative flex-1 max-w-md w-full">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="h-4 w-4" />
            </div>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name, employee ID, directorate, or phone..."
              className={table.search}
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}
          </div>

          {/* Department Select & Refresh */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedDept}
              onChange={(e) => setSelectedDept(e.target.value)}
              className="px-3 py-2 text-xs border border-slate-300 rounded-[4px] focus:outline-none focus:border-emerald-700 bg-white text-slate-700 font-medium"
            >
              <option value="ALL">All Directorates</option>
              {(data?.departments || []).map((dept) => (
                <option key={dept} value={dept}>
                  {dept}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={() => {
                queryClient.invalidateQueries({ queryKey: ['gymRegistrations'] });
                queryClient.invalidateQueries({ queryKey: ['registrationStats'] });
              }}
              title="Refresh list"
              className={btn.secondary}
            >
              <RotateCcw className="h-3.5 w-3.5 text-slate-600" />
            </button>
          </div>
        </div>

        {/* Active Filter Pills Bar (Asset Tracking Style) */}
        {hasActiveFilters && (
          <div className="px-4 py-2 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-500">Active filters:</span>

            {search && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                <span>Search: "{search}"</span>
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {selectedDept !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                <span>Directorate: {selectedDept}</span>
                <button
                  type="button"
                  onClick={() => setSelectedDept('ALL')}
                  className="hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {activeTab !== 'ALL' && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                <span>Tab: {TABS.find((t) => t.key === activeTab)?.label}</span>
                <button
                  type="button"
                  onClick={() => setActiveTab('ALL')}
                  className="hover:text-emerald-950 cursor-pointer"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            )}

            {(sortColumn !== 'regNumber' || sortDirection !== 'asc') && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-[4px] bg-emerald-50 text-emerald-800 text-[11px] font-medium border border-emerald-200">
                <span>Sorted by {sortColumn} ({sortDirection})</span>
                <button
                  type="button"
                  onClick={() => {
                    setSortColumn('regNumber');
                    setSortDirection('asc');
                  }}
                  className="hover:text-emerald-950 cursor-pointer"
                >
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

        {/* Registrants Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-[13px]">
            <thead className={table.headRow}>
              <tr>
                <SortableHeader
                  label="Full Name"
                  columnKey="fullName"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-4"
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
                  label="Employee ID"
                  columnKey="employeeId"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-3.5 w-36"
                />
                <SortableHeader
                  label="Registration Date"
                  columnKey="registeredAt"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  thClassName="py-2.5 px-3.5 w-32"
                />
                <SortableHeader
                  label="Status"
                  columnKey="status"
                  currentSortColumn={sortColumn}
                  currentSortDirection={sortDirection}
                  onSort={handleSort}
                  align="center"
                  thClassName="py-2.5 px-3 w-28 text-center"
                />
                <th className={table.actionsHead}>Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center text-slate-400">
                    <div className="inline-block animate-spin rounded-full h-6 w-6 border-2 border-emerald-600 border-t-transparent mb-2"></div>
                    <p className="text-xs">Loading registrants roster...</p>
                  </td>
                </tr>
              ) : pager.pageItems.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                      <Users className="w-6 h-6 text-slate-400" />
                    </div>
                    <p className="text-sm font-bold text-slate-800">No registrants match your search</p>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Try adjusting the search query, shift tab, or directorate filter.
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
                pager.pageItems.map((row: Registrant) => {
                  const isActive = row.status === 'ACTIVE';

                  return (
                    <tr key={row.id} className={table.row}>
                      {/* Full Name & Avatar (with optional phone subtext) */}
                      <td className="py-2.5 px-4">
                        <div className="flex items-center gap-2.5">
                          {row.hrRecord?.photoUrl ? (
                            <img
                              src={row.hrRecord.photoUrl}
                              alt={row.fullName}
                              className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                            />
                          ) : (
                            <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs ring-1 ring-emerald-200 shrink-0">
                              {row.fullName.charAt(0)}
                            </div>
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-slate-900 truncate">{row.fullName}</div>
                            {row.phone && (
                              <span className="text-[11px] text-slate-400 font-mono block">
                                {row.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      {/* Department */}
                      <td className="py-2.5 px-4 font-semibold text-slate-800">
                        {row.department}
                      </td>

                      {/* Employee ID */}
                      <td className="py-2.5 px-3.5">
                        <span className={table.code}>{row.employeeId}</span>
                      </td>

                      {/* Date */}
                      <td className="py-2.5 px-3.5 text-slate-500 font-mono text-[11px]">
                        {new Date(row.registeredAt).toLocaleDateString('en-GB')}
                      </td>

                      {/* Status Pill */}
                      <td className="py-2.5 px-3 text-center">
                        <span
                          className={`${pill} ${
                            isActive ? statusTone.active : statusTone.suspended
                          }`}
                        >
                          {isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>

                      {/* Action Cell (Pinned) */}
                      <td className={table.actionsCell}>
                        <button
                          type="button"
                          onClick={() =>
                            toggleStatusMutation.mutate({
                              id: row.id,
                              status: isActive ? 'SUSPENDED' : 'ACTIVE',
                            })
                          }
                          className={btn.row}
                          title={isActive ? 'Suspend membership' : 'Activate membership'}
                        >
                          <span className={isActive ? 'text-rose-700' : 'text-emerald-700'}>
                            {isActive ? 'Suspend' : 'Activate'}
                          </span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer (Matching Asset Tracking Style) */}
        <Pagination pager={pager} label="registrants" />
      </div>

      {/* Modals */}
      <RegisterStaffModal
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onSuccess={(newReg) => {
          queryClient.invalidateQueries({ queryKey: ['gymRegistrations'] });
          queryClient.invalidateQueries({ queryKey: ['registrationStats'] });
          setNotification(
            `Staff member "${newReg.fullName}" was successfully registered under Reg # ${newReg.regNumber}.`,
          );
        }}
      />

      <BatchRegisterModal
        isOpen={isBatchModalOpen}
        onClose={() => setIsBatchModalOpen(false)}
        onSuccess={() => {
          queryClient.invalidateQueries({ queryKey: ['gymRegistrations'] });
          queryClient.invalidateQueries({ queryKey: ['registrationStats'] });
          setNotification('Batch registration completed successfully.');
        }}
      />

      <GymRegistrantsPrintModal
        isOpen={isPrintModalOpen}
        onClose={() => setIsPrintModalOpen(false)}
        items={filteredAndSortedItems}
        totalCount={filteredAndSortedItems.length}
        selectedDepartment={selectedDept}
      />
    </div>
  );
};
