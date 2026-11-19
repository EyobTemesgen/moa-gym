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
  Check,
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

  // Field validation and touched states
  const [fieldErrors, setFieldErrors] = useState<{ identifier?: string; password?: string }>({});
  const [touched, setTouched] = useState<{ identifier?: boolean; password?: boolean }>({});
  const [capsLockActive, setCapsLockActive] = useState(false);

  const identifierInputRef = React.useRef<HTMLInputElement>(null);
  const passwordInputRef = React.useRef<HTMLInputElement>(null);

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

  // Validate single field
  const validateField = (field: 'identifier' | 'password', val: string): string | undefined => {
    const trimmed = val.trim();
    if (field === 'identifier') {
      if (!trimmed) {
        return 'Please enter your Username, Employee ID, or Email address.';
      }
      if (trimmed.length < 2) {
        return 'Identifier must be at least 2 characters.';
      }
      return undefined;
    }
    if (field === 'password') {
      if (!val) {
        return 'Please enter your account password.';
      }
      if (val.length < 6) {
        return 'Password must be at least 6 characters.';
      }
      return undefined;
    }
    return undefined;
  };

  const handleBlur = (field: 'identifier' | 'password') => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const errorMsg = validateField(field, field === 'identifier' ? identifier : password);
    setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
  };

  const handleChange = (field: 'identifier' | 'password', value: string) => {
    if (field === 'identifier') {
      setIdentifier(value);
    } else {
      setPassword(value);
    }

    if (error) {
      setError(null);
    }

    // Live validation if already touched
    if (touched[field]) {
      const errorMsg = validateField(field, value);
      setFieldErrors((prev) => ({ ...prev, [field]: errorMsg }));
    }
  };

  const handleKeyUp = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.getModifierState) {
      setCapsLockActive(e.getModifierState('CapsLock'));
    }
  };

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
  const [forgotTouched, setForgotTouched] = useState<Record<string, boolean>>({});
  const [forgotFieldErrors, setForgotFieldErrors] = useState<Record<string, string>>({});

  const validateForgotField = (field: string, val: string): string | undefined => {
    const trimmed = val.trim();
    if (field === 'forgotIdentifier' && !trimmed) {
      return 'Enter your username, Employee ID, or registered email.';
    }
    if (field === 'currentPassword' && forgotMode === 'CURRENT_PASSWORD' && !val) {
      return 'Current or temporary password is required.';
    }
    if (field === 'verifyEmail' && forgotMode === 'EMAIL') {
      if (!trimmed) return 'Official work email is required.';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmed)) return 'Please enter a valid email address.';
    }
    if (field === 'newPassword') {
      if (!val) return 'New password is required.';
      if (val.length < 6) return 'Password must be at least 6 characters.';
    }
    if (field === 'confirmPassword') {
      if (!val) return 'Please confirm your new password.';
      if (val !== newPassword) return 'Passwords do not match.';
    }
    return undefined;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Mark all fields as touched
    setTouched({ identifier: true, password: true });

    // Validate all fields
    const idErr = validateField('identifier', identifier);
    const pwdErr = validateField('password', password);

    setFieldErrors({
      identifier: idErr,
      password: pwdErr,
    });

    if (idErr || pwdErr) {
      setError('Please resolve the highlighted credential errors below.');
      if (idErr && identifierInputRef.current) {
        identifierInputRef.current.focus();
      } else if (pwdErr && passwordInputRef.current) {
        passwordInputRef.current.focus();
      }
      return;
    }

    const trimmedId = identifier.trim();

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
      let errMsg = err.message || 'Login failed. Please verify credentials.';

      // Context-aware error mapping
      if (errMsg.includes('Invalid Employee ID or password') || errMsg.includes('Unauthorized') || errMsg.includes('Invalid credentials')) {
        errMsg = 'Incorrect username, Employee ID, or password. Please verify and try again.';
        setFieldErrors({
          identifier: 'Please double-check your username or ID',
          password: 'Check your password or reset if forgotten',
        });
        if (passwordInputRef.current) {
          passwordInputRef.current.focus();
        }
      } else if (errMsg.includes('status is not active') || errMsg.includes('INACTIVE') || errMsg.includes('SUSPENDED')) {
        errMsg = 'Access denied: Your employee record is inactive or suspended in HR records. Please contact HR Administration.';
      } else if (errMsg.includes('Failed to fetch') || errMsg.includes('NetworkError') || !navigator.onLine) {
        errMsg = 'Unable to connect to the gym server. Please check your intranet connection and try again.';
      }

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

    // Validate all modal fields
    const idErr = validateForgotField('forgotIdentifier', forgotIdentifier);
    const curErr = forgotMode === 'CURRENT_PASSWORD' ? validateForgotField('currentPassword', currentPassword) : undefined;
    const emailErr = forgotMode === 'EMAIL' ? validateForgotField('verifyEmail', verifyEmail) : undefined;
    const newPwdErr = validateForgotField('newPassword', newPassword);
    const confirmErr = validateForgotField('confirmPassword', confirmPassword);

    const errors: Record<string, string> = {};
    if (idErr) errors.forgotIdentifier = idErr;
    if (curErr) errors.currentPassword = curErr;
    if (emailErr) errors.verifyEmail = emailErr;
    if (newPwdErr) errors.newPassword = newPwdErr;
    if (confirmErr) errors.confirmPassword = confirmErr;

    setForgotTouched({
      forgotIdentifier: true,
      currentPassword: true,
      verifyEmail: true,
      newPassword: true,
      confirmPassword: true,
    });
    setForgotFieldErrors(errors);

    if (Object.keys(errors).length > 0) {
      setForgotError('Please correct the highlighted errors before submitting.');
      return;
    }

    const trimmedId = forgotIdentifier.trim();

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
      setFieldErrors({});
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

        {/* Contextual Error Alert */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2.5 text-xs text-rose-800 animate-in fade-in">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
            <div className="flex-1 space-y-1">
              <p className="font-medium leading-relaxed">{error}</p>
              <div className="flex items-center gap-3 pt-0.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setForgotIdentifier(identifier);
                    setForgotError(null);
                    setForgotSuccess(null);
                    setShowForgotModal(true);
                  }}
                  className="font-bold text-[#00843D] hover:underline cursor-pointer"
                >
                  Forgot Password? →
                </button>
                <span className="text-slate-300">·</span>
                <Link to="/register" className="font-bold text-[#00843D] hover:underline">
                  New Member Sign Up →
                </Link>
              </div>
            </div>
          </div>
        )}

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} noValidate className="space-y-4">
          {/* Username / Identifier */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-identifier" className="block text-xs font-semibold text-slate-700">
                Username or Staff Identifier <span className="text-rose-500">*</span>
              </label>
              {touched.identifier && !fieldErrors.identifier && identifier.trim() && (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Valid
                </span>
              )}
            </div>
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  touched.identifier && fieldErrors.identifier ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                <User className="h-4 w-4" />
              </div>
              <input
                id="login-identifier"
                ref={identifierInputRef}
                type="text"
                autoComplete="username"
                value={identifier}
                onChange={(e) => handleChange('identifier', e.target.value)}
                onBlur={() => handleBlur('identifier')}
                aria-invalid={!!(touched.identifier && fieldErrors.identifier)}
                aria-describedby={touched.identifier && fieldErrors.identifier ? 'identifier-error' : undefined}
                placeholder="Username, Employee ID, or email"
                className={`w-full pl-10 pr-3.5 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 font-mono transition ${
                  touched.identifier && fieldErrors.identifier
                    ? 'border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-[#00843D] focus:ring-[#00843D]/20 bg-slate-50/50 focus:bg-white'
                }`}
              />
            </div>
            {touched.identifier && fieldErrors.identifier && (
              <p
                id="identifier-error"
                className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 mt-1.5 animate-in fade-in"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.identifier}</span>
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="login-password" className="block text-xs font-semibold text-slate-700">
                Password <span className="text-rose-500">*</span>
              </label>
              {touched.password && !fieldErrors.password && password && (
                <span className="text-[11px] font-semibold text-emerald-700 flex items-center gap-1">
                  <Check className="w-3 h-3" /> Ready
                </span>
              )}
            </div>
            <div className="relative">
              <div
                className={`absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none transition-colors ${
                  touched.password && fieldErrors.password ? 'text-rose-500' : 'text-slate-400'
                }`}
              >
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="login-password"
                ref={passwordInputRef}
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={password}
                onChange={(e) => handleChange('password', e.target.value)}
                onBlur={() => handleBlur('password')}
                onKeyUp={handleKeyUp}
                onKeyDown={handleKeyUp}
                aria-invalid={!!(touched.password && fieldErrors.password)}
                aria-describedby={touched.password && fieldErrors.password ? 'password-error' : undefined}
                placeholder="••••••••••••"
                className={`w-full pl-10 pr-10 py-2.5 text-xs sm:text-sm border rounded-xl focus:outline-none focus:ring-2 transition ${
                  touched.password && fieldErrors.password
                    ? 'border-rose-400 bg-rose-50/20 text-slate-900 focus:border-rose-500 focus:ring-rose-500/20'
                    : 'border-slate-300 focus:border-[#00843D] focus:ring-[#00843D]/20 bg-slate-50/50 focus:bg-white'
                }`}
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

            {/* Caps Lock Warning */}
            {capsLockActive && (
              <div className="mt-1.5 flex items-center gap-1.5 text-[11px] font-semibold text-amber-800 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200 animate-in fade-in">
                <span>⚠️ Caps Lock is turned ON</span>
              </div>
            )}

            {touched.password && fieldErrors.password && (
              <p
                id="password-error"
                className="flex items-center gap-1.5 text-[11px] font-medium text-rose-600 mt-1.5 animate-in fade-in"
              >
                <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                <span>{fieldErrors.password}</span>
              </p>
            )}
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
              <form onSubmit={handleForgotSubmit} noValidate className="py-3 space-y-3.5 text-xs">
                {/* 1. Identifier */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Username, Employee ID, or Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={forgotIdentifier}
                    onChange={(e) => {
                      setForgotIdentifier(e.target.value);
                      if (forgotTouched.forgotIdentifier) {
                        const err = validateForgotField('forgotIdentifier', e.target.value);
                        setForgotFieldErrors((prev) => ({ ...prev, forgotIdentifier: err || '' }));
                      }
                    }}
                    onBlur={() => {
                      setForgotTouched((prev) => ({ ...prev, forgotIdentifier: true }));
                      const err = validateForgotField('forgotIdentifier', forgotIdentifier);
                      setForgotFieldErrors((prev) => ({ ...prev, forgotIdentifier: err || '' }));
                    }}
                    placeholder="e.g. staff.member, EMP-MOA-001, or name@moa.gov.et"
                    className={`w-full px-3 py-2 border rounded-xl focus:outline-none font-mono ${
                      forgotTouched.forgotIdentifier && forgotFieldErrors.forgotIdentifier
                        ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                        : 'border-slate-300 focus:border-moa-green'
                    }`}
                  />
                  {forgotTouched.forgotIdentifier && forgotFieldErrors.forgotIdentifier && (
                    <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                      <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                      <span>{forgotFieldErrors.forgotIdentifier}</span>
                    </p>
                  )}
                </div>

                {/* 2. Verification Mode Switcher */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Verification Method <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-2 gap-1.5 p-1 bg-slate-100 rounded-xl">
                    <button
                      type="button"
                      onClick={() => {
                        setForgotMode('CURRENT_PASSWORD');
                        setForgotError(null);
                      }}
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
                      onClick={() => {
                        setForgotMode('EMAIL');
                        setForgotError(null);
                      }}
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
                        value={currentPassword}
                        onChange={(e) => {
                          setCurrentPassword(e.target.value);
                          if (forgotTouched.currentPassword) {
                            const err = validateForgotField('currentPassword', e.target.value);
                            setForgotFieldErrors((prev) => ({ ...prev, currentPassword: err || '' }));
                          }
                        }}
                        onBlur={() => {
                          setForgotTouched((prev) => ({ ...prev, currentPassword: true }));
                          const err = validateForgotField('currentPassword', currentPassword);
                          setForgotFieldErrors((prev) => ({ ...prev, currentPassword: err || '' }));
                        }}
                        placeholder="Enter current or temporary password"
                        className={`w-full px-3 pr-10 py-2 border rounded-xl focus:outline-none font-mono ${
                          forgotTouched.currentPassword && forgotFieldErrors.currentPassword
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                            : 'border-slate-300 focus:border-moa-green'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-moa-green cursor-pointer"
                      >
                        {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {forgotTouched.currentPassword && forgotFieldErrors.currentPassword ? (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{forgotFieldErrors.currentPassword}</span>
                      </p>
                    ) : (
                      <span className="text-[10px] text-slate-400 mt-1 block">
                        Default after admin provisioning or reset is <code>Password123!</code>
                      </span>
                    )}
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
                        value={verifyEmail}
                        onChange={(e) => {
                          setVerifyEmail(e.target.value);
                          if (forgotTouched.verifyEmail) {
                            const err = validateForgotField('verifyEmail', e.target.value);
                            setForgotFieldErrors((prev) => ({ ...prev, verifyEmail: err || '' }));
                          }
                        }}
                        onBlur={() => {
                          setForgotTouched((prev) => ({ ...prev, verifyEmail: true }));
                          const err = validateForgotField('verifyEmail', verifyEmail);
                          setForgotFieldErrors((prev) => ({ ...prev, verifyEmail: err || '' }));
                        }}
                        placeholder="e.g. member@moa.gov.et"
                        className={`w-full pl-9 pr-3 py-2 border rounded-xl focus:outline-none ${
                          forgotTouched.verifyEmail && forgotFieldErrors.verifyEmail
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                            : 'border-slate-300 focus:border-moa-green'
                        }`}
                      />
                    </div>
                    {forgotTouched.verifyEmail && forgotFieldErrors.verifyEmail && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{forgotFieldErrors.verifyEmail}</span>
                      </p>
                    )}
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
                        value={newPassword}
                        onChange={(e) => {
                          setNewPassword(e.target.value);
                          if (forgotTouched.newPassword) {
                            const err = validateForgotField('newPassword', e.target.value);
                            setForgotFieldErrors((prev) => ({ ...prev, newPassword: err || '' }));
                          }
                        }}
                        onBlur={() => {
                          setForgotTouched((prev) => ({ ...prev, newPassword: true }));
                          const err = validateForgotField('newPassword', newPassword);
                          setForgotFieldErrors((prev) => ({ ...prev, newPassword: err || '' }));
                        }}
                        placeholder="••••••••••••"
                        className={`w-full px-3 pr-10 py-2 border rounded-xl focus:outline-none ${
                          forgotTouched.newPassword && forgotFieldErrors.newPassword
                            ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                            : 'border-slate-300 focus:border-moa-green'
                        }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((prev) => !prev)}
                        className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-moa-green cursor-pointer"
                      >
                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {forgotTouched.newPassword && forgotFieldErrors.newPassword && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{forgotFieldErrors.newPassword}</span>
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Confirm New Password <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (forgotTouched.confirmPassword) {
                          const err = validateForgotField('confirmPassword', e.target.value);
                          setForgotFieldErrors((prev) => ({ ...prev, confirmPassword: err || '' }));
                        }
                      }}
                      onBlur={() => {
                        setForgotTouched((prev) => ({ ...prev, confirmPassword: true }));
                        const err = validateForgotField('confirmPassword', confirmPassword);
                        setForgotFieldErrors((prev) => ({ ...prev, confirmPassword: err || '' }));
                      }}
                      placeholder="••••••••••••"
                      className={`w-full px-3 py-2 border rounded-xl focus:outline-none ${
                        forgotTouched.confirmPassword && forgotFieldErrors.confirmPassword
                          ? 'border-rose-400 bg-rose-50/20 focus:border-rose-500'
                          : 'border-slate-300 focus:border-moa-green'
                      }`}
                    />
                    {forgotTouched.confirmPassword && forgotFieldErrors.confirmPassword && (
                      <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                        <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                        <span>{forgotFieldErrors.confirmPassword}</span>
                      </p>
                    )}
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
