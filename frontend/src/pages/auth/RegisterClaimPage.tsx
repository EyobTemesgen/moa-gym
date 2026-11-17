import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import { MoaLogo } from '../../components/MoaLogo';
import { Search, CheckCircle2, AlertCircle, ArrowRight, Lock, UserCheck } from 'lucide-react';

export const RegisterClaimPage: React.FC = () => {
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [shiftPreference, setShiftPreference] = useState('MORNING');
  const [verifiedEmployee, setVerifiedEmployee] = useState<any | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { claimAccount } = useAuth();
  const navigate = useNavigate();

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeId.trim()) return;

    setError(null);
    setIsVerifying(true);
    setVerifiedEmployee(null);

    try {
      const data = await apiRequest(`/auth/lookup?employeeId=${encodeURIComponent(employeeId.trim())}`);
      if (data.isClaimed) {
        setError(`An account for ${data.fullName} (${data.employeeId}) has already been claimed. Please proceed to login.`);
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
      await claimAccount(verifiedEmployee.employeeId, password, shiftPreference);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to claim account');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-md p-8">
        <div className="text-center mb-6">
          <MoaLogo className="mx-auto h-16 w-16 mb-3" size={64} />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            Claim MoA Gym Access
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Internal Staff Eligibility Verification & Account Activation
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-moa-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {!verifiedEmployee ? (
          // Step 1: Whitelist Employee ID Lookup
          <form onSubmit={handleLookup} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Official MoA Employee ID
              </label>
              <div className="relative">
                <input
                  type="text"
                  required
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                  placeholder="e.g. EMP-MOA-003"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green font-mono uppercase"
                />
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Your ID must be registered on the HR-approved staff roster.
              </p>
            </div>

            <button
              type="submit"
              disabled={isVerifying || !employeeId.trim()}
              className="w-full py-2.5 px-4 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isVerifying ? 'Verifying with HR Roster...' : 'Verify Eligibility'}
              <Search className="h-4 w-4" />
            </button>

            <div className="text-center pt-2">
              <Link to="/login" className="text-xs text-slate-600 hover:text-moa-green">
                Already registered? Sign in instead →
              </Link>
            </div>
          </form>
        ) : (
          // Step 2: Confirmation & Password Creation
          <form onSubmit={handleClaimSubmit} className="space-y-4">
            <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
              <div className="p-2 bg-emerald-100 rounded-lg text-moa-green">
                <UserCheck className="h-5 w-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">
                  Eligible MoA Staff Member
                </span>
                <p className="text-xs font-bold text-slate-900">{verifiedEmployee.fullName}</p>
                <p className="text-[11px] text-slate-600 font-mono">
                  {verifiedEmployee.employeeId} · {verifiedEmployee.department}
                </p>
              </div>
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

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-2.5 px-4 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
            >
              {isSubmitting ? 'Activating Account...' : 'Activate & Generate Gym Pass'}
              <ArrowRight className="h-4 w-4" />
            </button>

            <button
              type="button"
              onClick={() => setVerifiedEmployee(null)}
              className="w-full text-center text-xs text-slate-500 hover:text-slate-800"
            >
              Back to ID search
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
