import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../context/ToastContext';
import { MoaLogo } from '../../components/MoaLogo';
import {
  Lock,
  User,
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff,
  CheckCircle2,
  X,
  KeyRound,
  Mail,
  ShieldCheck,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState(() => {
    return localStorage.getItem('moa_gym_remembered_user') || '';
  });
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(() => {
    return localStorage.getItem('moa_gym_remember_choice') === 'true';
  });
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Auto-redirect if already authenticated
  useEffect(() => {
    if (user) {
      if (user.role === 'STAFF_MEMBER') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'GYM_ATTENDANT') {
        navigate('/terminal', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    }
  }, [user, navigate]);

  // Forgot / Reset Password Modal State (matching ATS standard)
  const [showForgotModal, setShowForgotModal] = useState(false);
  const [forgotIdentifier, setForgotIdentifier] = useState('');
  const [forgotMode, setForgotMode] = useState<'CURRENT_PASSWORD' | 'EMAIL'>('CURRENT_PASSWORD');
  const [currentPassword, setCurrentPassword] = useState('');
  const [verifyEmail, setVerifyEmail] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotSuccess, setForgotSuccess] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedId = identifier.trim();
    if (!trimmedId || !password) return;

    if (rememberMe) {
      localStorage.setItem('moa_gym_remembered_user', trimmedId);
      localStorage.setItem('moa_gym_remember_choice', 'true');
    } else {
      localStorage.removeItem('moa_gym_remembered_user');
      localStorage.removeItem('moa_gym_remember_choice');
    }

    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(trimmedId, password);
      toast.success('Signed In', `Welcome back, ${user.fullName || user.employeeId || 'Member'}!`);
      if (user.role === 'STAFF_MEMBER') {
        navigate('/dashboard', { replace: true });
      } else if (user.role === 'GYM_ATTENDANT') {
        navigate('/terminal', { replace: true });
      } else {
        navigate('/admin/dashboard', { replace: true });
      }
    } catch (err: any) {
      const errMsg = err.message || 'Login failed. Please verify credentials.';
      setError(errMsg);
      toast.error('Authentication Failed', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setForgotError(null);
    setForgotSuccess(null);

    const trimmedId = forgotIdentifier.trim();
    if (!trimmedId) {
      setForgotError('Enter your username, Employee ID, or registered email.');
      return;
    }
    if (forgotMode === 'CURRENT_PASSWORD' && !currentPassword) {
      setForgotError('Enter your current or temporary password (e.g. Password123!).');
      return;
    }
    if (forgotMode === 'EMAIL' && !verifyEmail.trim()) {
      setForgotError('Enter your official registered work email.');
      return;
    }
    if (newPassword.length < 6) {
      setForgotError('New password must be at least 6 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setForgotError('New passwords do not match. Please verify.');
      return;
    }

    setForgotLoading(true);
    try {
      const res = await apiRequest<any>('/auth/reset-password', {
        method: 'POST',
        body: JSON.stringify({
          identifier: trimmedId,
          currentPassword: forgotMode === 'CURRENT_PASSWORD' ? currentPassword : undefined,
          email: forgotMode === 'EMAIL' ? verifyEmail.trim() : undefined,
          newPassword,
        }),
      });

      setForgotSuccess(res.message || 'Password updated successfully.');
      toast.success('Password Updated', res.message || 'Password updated successfully. You can now sign in.');
      setIdentifier(res.employeeId || trimmedId);
      setPassword(newPassword);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(null);
      }, 2500);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to update password. Please check your credentials.';
      setForgotError(errMsg);
      toast.error('Reset Failed', errMsg);
    } finally {
      setForgotLoading(false);
    }
  };

  const handleQuickLogin = (id: string) => {
    setIdentifier(id);
    setPassword('Password123!');
  };

  // Only expose quick demo credentials on local development / localhost testing
  const isLocalHost =
    typeof window !== 'undefined' &&
    (window.location.hostname === 'localhost' ||
      window.location.hostname === '127.0.0.1' ||
      window.location.hostname.endsWith('.local'));

  const showDemoCredentials =
    (import.meta.env.DEV || (isLocalHost && import.meta.env.VITE_SHOW_DEMO_LOGINS !== 'false')) &&
    import.meta.env.VITE_HIDE_DEMO_LOGINS !== 'true';

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center py-10 px-4 sm:px-6 lg:px-8 relative">
      <div className="max-w-[480px] w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl p-7 sm:p-9 relative overflow-hidden">
        {/* Top Gold & Green Brand Stripe */}
        <div className="absolute top-0 inset-x-0 h-1.5 bg-gradient-to-r from-[#00843D] via-[#FCDD09] to-[#00843D]" />

        {/* Branding Header */}
        <div className="text-center mb-6 pt-1">
          <MoaLogo className="mx-auto h-14 w-14 mb-2.5 transition hover:scale-105" size={56} />
          <p className="text-[11px] font-bold uppercase tracking-wider text-[#00843D] mb-0.5">
            Ministry of Agriculture
          </p>
          <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
            Staff Wellness & Fitness Center
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official Portal Sign In
          </p>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-2.5 text-xs text-rose-700 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>{error}</span>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Username / Identifier */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                autoComplete="username"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Username, Employee ID, or email"
                className="w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] bg-slate-50/50 focus:bg-white font-mono transition"
              />
            </div>
          </div>

          {/* Password */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#00843D]/20 focus:border-[#00843D] bg-slate-50/50 focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-[#00843D] cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          {/* Options Row: Remember Me & Forgot Password */}
          <div className="flex items-center justify-between text-xs pt-0.5">
            <label className="flex items-center gap-2 cursor-pointer select-none text-slate-600 hover:text-slate-900">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 accent-[#00843D] rounded border-slate-300 cursor-pointer"
              />
              <span>Remember me</span>
            </label>

            <button
              type="button"
              onClick={() => {
                setForgotIdentifier(identifier);
                setForgotError(null);
                setForgotSuccess(null);
                setCurrentPassword('');
                setVerifyEmail('');
                setNewPassword('');
                setConfirmPassword('');
                setShowForgotModal(true);
              }}
              className="font-semibold text-[#00843D] hover:text-[#0B6B3A] hover:underline cursor-pointer"
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 sm:py-3 px-4 bg-[#00843D] hover:bg-[#0B6B3A] active:bg-[#06542D] text-white text-xs sm:text-sm font-semibold rounded-xl shadow-xs hover:shadow transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
          >
            <span>{isSubmitting ? 'Authenticating...' : 'Sign In'}</span>
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        {/* Sign Up Link Section */}
        <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-center gap-1.5 text-xs text-slate-600">
          <span>Don't have an account?</span>
          <Link
            to="/register"
            className="font-bold text-[#00843D] hover:text-[#0B6B3A] hover:underline transition"
          >
            Sign Up →
          </Link>
        </div>

        {/* Demo Fast Login Helpers (Local Development Only) */}
        {showDemoCredentials && (
          <div className="mt-6 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
            <div className="flex items-center justify-between mb-2">
              <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                Demo Credentials (1-Click Fill)
              </p>
              <span className="text-[9px] font-mono font-bold text-amber-700 bg-amber-100/80 px-1.5 py-0.5 rounded">
                Local Only
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[10px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('EMP-ADM-01')}
                className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:border-moa-green font-medium cursor-pointer"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('EMP-DSK-01')}
                className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:border-moa-green font-medium cursor-pointer"
              >
                Attendant
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('EMP-MOA-001')}
                className="px-2 py-1.5 bg-white border border-slate-200 rounded text-slate-700 hover:border-moa-green font-medium cursor-pointer"
              >
                Staff Member
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Institutional Footer */}
      <footer className="mt-8 text-center text-xs text-slate-400">
        © 2026 Ministry of Agriculture · Staff Wellness & Fitness Gymnasium
      </footer>

      {/* ─── Change / Reset Password Modal (ATS standard) ─── */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-3 sm:p-4 backdrop-blur-xs animate-in fade-in overflow-y-auto"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !forgotLoading) setShowForgotModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 relative max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-50 text-moa-green rounded-xl border border-emerald-200">
                  <KeyRound className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Change / Reset Password
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    Set a new personal password for your MoA Gym account.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowForgotModal(false)}
                disabled={forgotLoading}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-lg cursor-pointer"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {forgotSuccess && (
              <div className="my-4 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2.5 text-xs text-emerald-900 animate-in fade-in">
                <CheckCircle2 className="h-5 w-5 text-moa-green shrink-0" />
                <span className="font-semibold">{forgotSuccess}</span>
              </div>
            )}

            {forgotError && (
              <div className="my-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-xs text-red-700 animate-in fade-in">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{forgotError}</span>
              </div>
            )}

            {!forgotSuccess && (
              <form onSubmit={handleForgotSubmit} className="py-3 space-y-3.5 text-xs">
                {/* 1. Identifier */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username, Employee ID, or Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. staff.member, EMP-MOA-001, or name@moa.gov.et"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-moa-green font-mono"
                  />
                </div>

                {/* 2. Verification Mode Switcher */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verification Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => setForgotMode('CURRENT_PASSWORD')}
                      className={`py-1.5 px-2 rounded-lg font-semibold transition text-center cursor-pointer ${
                        forgotMode === 'CURRENT_PASSWORD'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Current / Temporary Pwd
                    </button>
                    <button
                      type="button"
                      onClick={() => setForgotMode('EMAIL')}
                      className={`py-1.5 px-2 rounded-lg font-semibold transition text-center cursor-pointer ${
                        forgotMode === 'EMAIL'
                          ? 'bg-white text-slate-900 shadow-xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Registered Work Email
                    </button>
                  </div>
                </div>

                {/* 3. Conditional Verification Input */}
                {forgotMode === 'CURRENT_PASSWORD' ? (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Current or Temporary Password <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? 'text' : 'password'}
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="Enter current or temporary password"
                        className="w-full px-3 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-moa-green font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-moa-green cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Default after admin provisioning or reset is <code>Password123!</code>
                    </span>
                  </div>
                ) : (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Official Work Email Address <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <input
                        type="email"
                        required
                        value={verifyEmail}
                        onChange={(e) => setVerifyEmail(e.target.value)}
                        placeholder="e.g. member@moa.gov.et"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-moa-green"
                      />
                    </div>
                  </div>
                )}

                {/* 4. New Password Fields */}
                <div className="pt-2 border-t border-slate-100 space-y-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      New Password (min 6 characters) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full px-3 pr-10 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-moa-green"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-moa-green cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-moa-green"
                    />
                  </div>
                </div>

                {/* Submit Reset Button */}
                <div className="pt-3 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-xl transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="flex-1 py-2.5 px-3 bg-[#00843D] hover:bg-[#0B6B3A] text-white font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    {forgotLoading ? (
                      <span>Saving...</span>
                    ) : (
                      <>
                        <ShieldCheck className="h-4 w-4" />
                        <span>Update Password</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
