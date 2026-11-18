import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import { MoaLogo } from '../../components/MoaLogo';
import {
  Search,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Lock,
  UserCheck,
  Building2,
  User,
  CreditCard,
  ChevronRight,
} from 'lucide-react';

export const RegisterClaimPage: React.FC = () => {
  // Mode: 'NAME' (default, effortless) or 'ID' (badge holders)
  const [searchMode, setSearchMode] = useState<'NAME' | 'ID'>('NAME');

  // Form Fields
  const [fullName, setFullName] = useState('');
  const [selectedDept, setSelectedDept] = useState('ALL');
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shiftPreference, setShiftPreference] = useState('MORNING');

  // Async & State
  const [departments, setDepartments] = useState<string[]>([]);
  const [multipleCandidates, setMultipleCandidates] = useState<any[]>([]);
  const [verifiedEmployee, setVerifiedEmployee] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { claimAccount } = useAuth();
  const navigate = useNavigate();

  // Load official MoA directorates on mount
  useEffect(() => {
    apiRequest<string[]>('/auth/departments')
      .then((data) => setDepartments(data))
      .catch((err) => console.error('Failed to load departments', err));
  }, []);

  // Handle Name + Directorate Lookup
  const handleNameLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setError(null);
    setIsVerifying(true);
    setVerifiedEmployee(null);
    setMultipleCandidates([]);

    try {
      const deptParam = selectedDept !== 'ALL' ? `&department=${encodeURIComponent(selectedDept)}` : '';
      const results = await apiRequest<any[]>(
        `/auth/lookup-by-name?name=${encodeURIComponent(fullName.trim())}${deptParam}`,
      );

      if (results.length === 1) {
        const candidate = results[0];
        if (candidate.isClaimed) {
          setError(`An account for ${candidate.fullName} (${candidate.employeeId}) has already been activated. Please sign in.`);
          return;
        }
        setVerifiedEmployee(candidate);
      } else {
        // Multiple matches found - prompt user to select their specific profile
        setMultipleCandidates(results);
      }
    } catch (err: any) {
      setError(
        err.message ||
          'No matching employee record found. Please verify the spelling or select "All Directorates".',
      );
    } finally {
      setIsVerifying(false);
    }
  };

  // Handle direct Employee ID lookup (for badge holders)
  const handleIdLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) return;

    setError(null);
    setIsVerifying(true);
    setVerifiedEmployee(null);

    try {
      const data = await apiRequest<any>(
        `/auth/lookup?employeeId=${encodeURIComponent(employeeId.trim())}`,
      );
      if (data.isClaimed) {
        setError(`An account for ${data.fullName} (${data.employeeId}) has already been claimed. Please sign in.`);
        return;
      }
      if (data.employmentStatus !== 'ACTIVE') {
        setError(`Access denied: Staff record status is ${data.employmentStatus}. Only active employees may claim access.`);
        return;
      }
      setVerifiedEmployee(data);
    } catch (err: any) {
      setError(err.message || 'Employee ID not found on active MoA staff whitelist.');
    } finally {
      setIsVerifying(false);
    }
  };

  // Select one candidate from multiple name search results
  const handleSelectCandidate = (candidate: any) => {
    if (candidate.isClaimed) {
      setError(`An account for ${candidate.fullName} (${candidate.employeeId}) has already been claimed. Please sign in.`);
      return;
    }
    setError(null);
    setVerifiedEmployee(candidate);
    setMultipleCandidates([]);
  };

  // Final Step: Submit password and shift preference to activate account
  const handleClaimSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await claimAccount(
        verifiedEmployee.employeeId,
        password,
        shiftPreference,
        verifiedEmployee.fullName,
      );
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to activate account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-start items-center pt-2 sm:pt-3 pb-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-md p-4 sm:p-5">
        <div className="flex items-center justify-center gap-2 mb-2 text-center">
          <MoaLogo className="h-8 w-8" size={32} />
          <div>
            <h2 className="text-base font-bold text-slate-900 tracking-tight leading-tight">
              Sign Up for MoA Gym
            </h2>
            <p className="text-[11px] text-slate-500">
              Staff Wellness & Fitness Access
            </p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-start gap-2.5 text-xs text-moa-danger">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <span className="leading-relaxed">{error}</span>
          </div>
        )}

        {/* New Self-Serve Portal Pill */}
        <div className="mb-4 text-center">
          <Link
            to="/register"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 rounded-lg text-xs font-semibold hover:bg-emerald-100 transition"
          >
            <span>✨ Use New Self-Serve Registration Flow (with Shift, Fee & Locker) →</span>
          </Link>
        </div>

        {!verifiedEmployee ? (
          <div>
            {/* Search Mode Toggle Tabs */}
            <div className="flex border-b border-slate-200 mb-5">
              <button
                type="button"
                onClick={() => {
                  setSearchMode('NAME');
                  setError(null);
                  setMultipleCandidates([]);
                }}
                className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  searchMode === 'NAME'
                    ? 'border-moa-green text-moa-green'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <User className="h-3.5 w-3.5" />
                <span>Search by Name</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setSearchMode('ID');
                  setError(null);
                  setMultipleCandidates([]);
                }}
                className={`flex-1 py-2 text-xs font-semibold text-center border-b-2 transition flex items-center justify-center gap-1.5 cursor-pointer ${
                  searchMode === 'ID'
                    ? 'border-moa-green text-moa-green'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <CreditCard className="h-3.5 w-3.5" />
                <span>Have Employee ID</span>
              </button>
            </div>

            {/* Mode 1: Search by Name & Directorate (No ID needed) */}
            {searchMode === 'NAME' ? (
              <form onSubmit={handleNameLookup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Your Full Name (ሙሉ ስም)
                  </label>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Aster Mengistu or አበበ ከበደ"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    First and Father's Name as listed in Ministry records.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Directorate / የስራ አስፈፃሚ ክፍል
                  </label>
                  <div className="relative">
                    <select
                      value={selectedDept}
                      onChange={(e) => setSelectedDept(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green bg-white"
                    >
                      <option value="ALL">All Directorates / ሁሉም ክፍሎች</option>
                      {departments.map((dept) => (
                        <option key={dept} value={dept}>
                          {dept}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !fullName.trim()}
                  className="w-full py-2.5 px-4 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isVerifying ? 'Searching MoA Roster...' : 'Find My Staff Record'}
                  <Search className="h-4 w-4" />
                </button>
              </form>
            ) : (
              /* Mode 2: Search by Employee ID from Badge */
              <form onSubmit={handleIdLookup} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Official MoA Employee ID
                  </label>
                  <input
                    type="text"
                    required
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    placeholder="e.g. EMP-MOA-004 or MOA/1042/16"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green font-mono uppercase"
                  />
                  <p className="text-[11px] text-slate-400 mt-1">
                    Printed on your MoA Staff ID badge / lanyard card.
                  </p>
                </div>

                <button
                  type="submit"
                  disabled={isVerifying || !employeeId.trim()}
                  className="w-full py-2.5 px-4 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
                >
                  {isVerifying ? 'Verifying Employee ID...' : 'Verify Staff ID'}
                  <Search className="h-4 w-4" />
                </button>
              </form>
            )}

            {/* Multiple Candidate Match Selector */}
            {multipleCandidates.length > 0 && (
              <div className="mt-5 pt-4 border-t border-slate-200">
                <p className="text-xs font-bold text-slate-800 mb-2">
                  Multiple staff records found. Please click yours:
                </p>
                <div className="space-y-2">
                  {multipleCandidates.map((c) => (
                    <button
                      key={c.employeeId}
                      type="button"
                      onClick={() => handleSelectCandidate(c)}
                      className="w-full p-2.5 text-left bg-slate-50 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 rounded-lg transition flex items-center justify-between group cursor-pointer"
                    >
                      <div>
                        <p className="text-xs font-bold text-slate-900 group-hover:text-emerald-800">
                          {c.fullName}
                        </p>
                        <p className="text-[11px] text-slate-500">
                          {c.department} · <span className="font-mono">{c.employeeId}</span>
                        </p>
                      </div>
                      <ChevronRight className="h-4 w-4 text-slate-400 group-hover:text-emerald-700" />
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="text-center pt-4 mt-2">
              <Link to="/login" className="text-xs text-slate-600 hover:text-moa-green">
                Already registered? Sign in →
              </Link>
            </div>
          </div>
        ) : (
          /* Step 2: Confirmation & Password / Shift Creation */
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-emerald-100 rounded-lg text-moa-green">
                  <UserCheck className="h-5 w-5" />
                </div>
                <div>
                  <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                    Verified MoA Staff Member
                  </span>
                  <p className="text-xs font-bold text-slate-900">{verifiedEmployee.fullName}</p>
                  <p className="text-[11px] text-slate-600">
                    {verifiedEmployee.department} · <span className="font-mono font-medium">{verifiedEmployee.employeeId}</span>
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setVerifiedEmployee(null)}
                className="text-[11px] text-slate-500 hover:text-slate-800 underline cursor-pointer shrink-0"
              >
                Change
              </button>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Preferred Workout Shift / የሰዓት ምርጫ
              </label>
              <select
                value={shiftPreference}
                onChange={(e) => setShiftPreference(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green bg-white font-medium"
              >
                <option value="MORNING">ጠዋት / Morning (ከማለዳው 11:00 – 1:30 / 5:00 – 7:30 AM)</option>
                <option value="EVENING">ማታ / Evening (ከ11:30 – ምሽት 3:00 / 5:30 – 9:00 PM)</option>
                <option value="ANY">Flexible / ማንኛውም ሰዓት</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Create Account Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="At least 6 characters"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="h-4 w-4" />
                </div>
                <input
                  type="password"
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="Repeat password"
                  className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Signing Up...' : 'Sign Up & Activate Gym Pass'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
