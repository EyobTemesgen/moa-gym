import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import {
  Users,
  ShieldCheck,
  ShieldAlert,
  Search,
  KeyRound,
  UserPlus,
  RefreshCw,
  CheckCircle2,
  AlertCircle,
  UserCheck,
  UserX,
  X,
  Mail,
  Building2,
  Lock,
} from 'lucide-react';
import { btn } from '../../components/ui/theme';

interface SystemUser {
  id: string;
  employeeId: string;
  fullName: string;
  department: string;
  phone: string;
  email?: string;
  photoUrl?: string;
  role: 'ADMIN' | 'GYM_ATTENDANT' | 'STAFF_MEMBER';
  status: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
  waiverSigned: boolean;
  createdAt: string;
  lastActive?: string | null;
}

export const UserManagementPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [selectedRole, setSelectedRole] = useState<string>('ALL');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Modals state
  const [resetModalUser, setResetModalUser] = useState<SystemUser | null>(null);
  const [isProvisionModalOpen, setIsProvisionModalOpen] = useState(false);

  // Provision Form state
  const [lookupQuery, setLookupQuery] = useState('');
  const [provisionRole, setProvisionRole] = useState<'ADMIN' | 'GYM_ATTENDANT' | 'STAFF_MEMBER'>('GYM_ATTENDANT');
  const [foundEmployee, setFoundEmployee] = useState<any | null>(null);
  const [isLookingUp, setIsLookingUp] = useState(false);
  const [provisionError, setProvisionError] = useState<string | null>(null);

  // Fetch users
  const { data, isLoading } = useQuery<{
    items: SystemUser[];
    total: number;
    page: number;
    limit: number;
  }>({
    queryKey: ['systemUsers', search, selectedRole, selectedStatus],
    queryFn: () => {
      const params = new URLSearchParams();
      if (search.trim()) params.append('query', search.trim());
      if (selectedRole !== 'ALL') params.append('role', selectedRole);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      return apiRequest(`/users/manage?${params.toString()}`);
    },
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 4000);
  };

  // Role Update Mutation
  const updateRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: string }) =>
      apiRequest(`/users/${id}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      }),
    onSuccess: (res: any) => {
      showToast(res.message || 'User role updated successfully');
      queryClient.invalidateQueries({ queryKey: ['systemUsers'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to update user role');
    },
  });

  // Status Toggle Mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      apiRequest(`/users/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      }),
    onSuccess: (res: any) => {
      showToast(res.message || 'User status updated successfully');
      queryClient.invalidateQueries({ queryKey: ['systemUsers'] });
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to update user status');
    },
  });

  // Reset Password Mutation
  const resetPasswordMutation = useMutation({
    mutationFn: (id: string) =>
      apiRequest(`/users/${id}/reset-password`, {
        method: 'POST',
      }),
    onSuccess: (res: any) => {
      showToast(res.message || 'Password successfully reset to default');
      setResetModalUser(null);
    },
    onError: (err: any) => {
      alert(err.message || 'Failed to reset password');
    },
  });

  // Provision User Mutation
  const provisionMutation = useMutation({
    mutationFn: ({ employeeId, role }: { employeeId: string; role: string }) =>
      apiRequest('/users/provision', {
        method: 'POST',
        body: JSON.stringify({ employeeId, role }),
      }),
    onSuccess: (res: any) => {
      showToast(res.message || 'User account provisioned successfully');
      setIsProvisionModalOpen(false);
      setFoundEmployee(null);
      setLookupQuery('');
      queryClient.invalidateQueries({ queryKey: ['systemUsers'] });
    },
    onError: (err: any) => {
      setProvisionError(err.message || 'Failed to provision user');
    },
  });

  // Lookup employee for provisioning
  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!lookupQuery.trim()) return;
    setIsLookingUp(true);
    setProvisionError(null);
    setFoundEmployee(null);
    try {
      const res = await apiRequest<any>(`/auth/lookup?employeeId=${encodeURIComponent(lookupQuery.trim())}`);
      setFoundEmployee(res);
    } catch (err: any) {
      setProvisionError(err.message || 'Employee not found on HR roster');
    } finally {
      setIsLookingUp(false);
    }
  };

  const users = data?.items || [];
  const adminCount = users.filter((u) => u.role === 'ADMIN').length;
  const attendantCount = users.filter((u) => u.role === 'GYM_ATTENDANT').length;
  const memberCount = users.filter((u) => u.role === 'STAFF_MEMBER').length;
  const inactiveCount = users.filter((u) => u.status !== 'ACTIVE').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 right-5 z-50 bg-emerald-900 text-white px-4 py-3 rounded-xl shadow-lg border border-emerald-500 flex items-center gap-2.5 text-xs animate-in fade-in slide-in-from-top-2">
          <CheckCircle2 className="h-4 w-4 text-moa-gold shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Page Header */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col xl:flex-row xl:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
              User Management
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#00843D] border border-emerald-200 shadow-2xs">
              {data?.total ?? 0} System Accounts
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            System access control, role assignment, and administrative credentials
          </p>
        </div>

        {/* Action Button */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsProvisionModalOpen(true);
              setFoundEmployee(null);
              setLookupQuery('');
              setProvisionError(null);
            }}
            className={btn.primary}
          >
            <UserPlus className="h-4 w-4" />
            <span>Provision User / Grant Role</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3.5">
        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Total Logins</span>
            <Users className="h-4 w-4 text-emerald-700" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums">
            {data?.total ?? 0}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Administrators</span>
            <ShieldAlert className="h-4 w-4 text-moa-gold" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums text-moa-gold">
            {adminCount}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Gate Attendants</span>
            <ShieldCheck className="h-4 w-4 text-sky-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums text-sky-700">
            {attendantCount}
          </div>
        </div>

        <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">Staff Members</span>
            <UserCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-bold text-slate-900 mt-2 tabular-nums text-emerald-700">
            {memberCount}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, employee ID, email, or directorate..."
            className="w-full pl-9 pr-4 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
          />
        </div>

        {/* Filters */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {/* Role Filter */}
          <select
            value={selectedRole}
            onChange={(e) => setSelectedRole(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-moa-green font-medium"
          >
            <option value="ALL">All Roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="GYM_ATTENDANT">GYM ATTENDANT</option>
            <option value="STAFF_MEMBER">STAFF MEMBER</option>
          </select>

          {/* Status Filter */}
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white text-slate-700 focus:outline-none focus:border-moa-green font-medium"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">ACTIVE</option>
            <option value="SUSPENDED">SUSPENDED</option>
            <option value="INACTIVE">INACTIVE</option>
          </select>

          {(search || selectedRole !== 'ALL' || selectedStatus !== 'ALL') && (
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setSelectedRole('ALL');
                setSelectedStatus('ALL');
              }}
              className="text-xs text-slate-500 hover:text-slate-900 underline ml-1 cursor-pointer"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-700 border-collapse">
            <thead className="bg-slate-50 border-b border-slate-200 text-[11px] font-bold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="px-4 py-3">Staff Identity</th>
                <th className="px-4 py-3">Employee ID & Email</th>
                <th className="px-4 py-3">System Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 font-medium">
              {isLoading ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    <RefreshCw className="h-6 w-6 animate-spin mx-auto text-emerald-600 mb-2" />
                    Loading system users...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-400">
                    No system users match the current search or filters.
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    {/* Identity */}
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {u.photoUrl ? (
                          <img
                            src={u.photoUrl}
                            alt={u.fullName}
                            className="h-9 w-9 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                          />
                        ) : (
                          <div className="h-9 w-9 rounded-xl bg-emerald-50 text-[#00843D] flex items-center justify-center font-bold text-sm border border-emerald-200 shrink-0">
                            {u.fullName.slice(0, 2).toUpperCase()}
                          </div>
                        )}
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">{u.fullName}</div>
                          <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                            <Building2 className="h-3 w-3 text-slate-400" />
                            <span>{u.department}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* ID & Email */}
                    <td className="px-4 py-3">
                      <div className="font-mono text-xs font-semibold text-slate-900">
                        {u.employeeId}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate flex items-center gap-1 mt-0.5">
                        <Mail className="h-3 w-3 text-slate-400" />
                        <span>{u.email || u.phone || 'No email registered'}</span>
                      </div>
                    </td>

                    {/* Role Dropdown */}
                    <td className="px-4 py-3">
                      <select
                        value={u.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            id: u.id,
                            role: e.target.value,
                          })
                        }
                        className={`text-xs font-bold rounded-lg px-2.5 py-1.5 border transition cursor-pointer ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-50 text-amber-900 border-amber-300 font-bold'
                            : u.role === 'GYM_ATTENDANT'
                            ? 'bg-sky-50 text-sky-900 border-sky-300 font-bold'
                            : 'bg-emerald-50 text-emerald-900 border-emerald-300 font-semibold'
                        }`}
                      >
                        <option value="ADMIN">ADMIN</option>
                        <option value="GYM_ATTENDANT">GYM_ATTENDANT</option>
                        <option value="STAFF_MEMBER">STAFF_MEMBER</option>
                      </select>
                    </td>

                    {/* Status Badge & Toggle */}
                    <td className="px-4 py-3">
                      <button
                        type="button"
                        onClick={() =>
                          updateStatusMutation.mutate({
                            id: u.id,
                            status: u.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE',
                          })
                        }
                        title="Click to toggle account status"
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-bold border transition cursor-pointer ${
                          u.status === 'ACTIVE'
                            ? 'bg-emerald-50 text-[#00843D] border-emerald-200 hover:bg-red-50 hover:text-red-700 hover:border-red-200'
                            : 'bg-red-50 text-red-700 border-red-200 hover:bg-emerald-50 hover:text-[#00843D] hover:border-emerald-200'
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full ${
                            u.status === 'ACTIVE' ? 'bg-[#00843D]' : 'bg-red-600'
                          }`}
                        />
                        <span>{u.status}</span>
                      </button>
                    </td>

                    {/* Actions */}
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => setResetModalUser(u)}
                        title="Reset user password to default Password123!"
                        className="inline-flex items-center gap-1.5 px-2.5 py-1.5 bg-slate-50 hover:bg-amber-50 text-slate-700 hover:text-amber-800 border border-slate-200 hover:border-amber-300 rounded-lg text-xs font-semibold transition cursor-pointer"
                      >
                        <KeyRound className="h-3.5 w-3.5 text-amber-600" />
                        <span>Reset Pass</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal: Reset Password Confirmation */}
      {resetModalUser && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <KeyRound className="h-5 w-5 text-amber-600" />
                <span>Reset User Password</span>
              </div>
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>
                Are you sure you want to reset the login password for:
              </p>
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                <div className="font-bold text-slate-900 text-sm">{resetModalUser.fullName}</div>
                <div className="font-mono text-emerald-800">{resetModalUser.employeeId}</div>
                <div className="text-slate-500">{resetModalUser.department}</div>
              </div>
              <p className="text-amber-800 font-medium bg-amber-50 p-2.5 rounded-lg border border-amber-200">
                The password will be reset to the default: <strong>Password123!</strong>
              </p>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setResetModalUser(null)}
                className={btn.secondary}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => resetPasswordMutation.mutate(resetModalUser.id)}
                disabled={resetPasswordMutation.isPending}
                className={btn.primary}
              >
                {resetPasswordMutation.isPending ? 'Resetting...' : 'Confirm Reset'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Provision User */}
      {isProvisionModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <UserPlus className="h-5 w-5 text-[#00843D]" />
                <span>Provision System User</span>
              </div>
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="py-4 space-y-4">
              {provisionError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-red-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{provisionError}</span>
                </div>
              )}

              {/* Step 1: Lookup Employee */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Step 1: Find Staff Member on HR Whitelist
                </label>
                <form onSubmit={handleLookup} className="flex gap-2">
                  <input
                    type="text"
                    required
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="Enter Employee ID (e.g. EMP-MOA-002)"
                    className="flex-1 px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-moa-green font-mono"
                  />
                  <button
                    type="submit"
                    disabled={isLookingUp}
                    className={btn.secondary}
                  >
                    {isLookingUp ? 'Searching...' : 'Lookup'}
                  </button>
                </form>
              </div>

              {/* Step 2: Display Found Employee */}
              {foundEmployee && (
                <div className="p-3.5 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2">
                  <div className="flex items-center gap-3">
                    {foundEmployee.photoUrl ? (
                      <img
                        src={foundEmployee.photoUrl}
                        alt={foundEmployee.fullName}
                        className="h-10 w-10 rounded-xl object-cover ring-2 ring-emerald-500/20"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-xl bg-white text-[#00843D] flex items-center justify-center font-bold">
                        {foundEmployee.fullName.slice(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="font-bold text-slate-900 text-sm">{foundEmployee.fullName}</div>
                      <div className="text-xs font-mono text-emerald-800">{foundEmployee.employeeId} · {foundEmployee.department}</div>
                    </div>
                  </div>

                  {foundEmployee.isClaimed && (
                    <div className="text-[11px] text-amber-800 font-semibold bg-amber-100/70 p-2 rounded-lg">
                      Notice: This user already has an active account. Provisioning will update their assigned system role.
                    </div>
                  )}

                  {/* Step 3: Choose Role */}
                  <div className="pt-2">
                    <label className="block text-xs font-bold text-slate-800 mb-1">
                      Step 2: Assign System Role
                    </label>
                    <select
                      value={provisionRole}
                      onChange={(e: any) => setProvisionRole(e.target.value)}
                      className="w-full px-3 py-2 text-xs font-bold border border-slate-300 rounded-lg bg-white focus:outline-none focus:border-moa-green"
                    >
                      <option value="GYM_ATTENDANT">GYM_ATTENDANT (Gate Checking Fast Lane)</option>
                      <option value="ADMIN">ADMIN (System & HR Administrator)</option>
                      <option value="STAFF_MEMBER">STAFF_MEMBER (Standard Gym Pass)</option>
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setIsProvisionModalOpen(false)}
                className={btn.secondary}
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!foundEmployee || provisionMutation.isPending}
                onClick={() =>
                  provisionMutation.mutate({
                    employeeId: foundEmployee.employeeId,
                    role: provisionRole,
                  })
                }
                className={btn.primary}
              >
                {provisionMutation.isPending ? 'Provisioning...' : 'Confirm Provisioning'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
