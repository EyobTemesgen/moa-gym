import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
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
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

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
    if (!identifier.trim() || !password) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      if (user.role === 'STAFF_MEMBER') {
        navigate('/dashboard');
      } else if (user.role === 'GYM_ATTENDANT') {
        navigate('/terminal');
      } else {
        navigate('/admin/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
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
      setForgotError('Enter your Employee ID or registered email.');
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
      setIdentifier(res.employeeId || trimmedId);
      setPassword(newPassword);
      setTimeout(() => {
        setShowForgotModal(false);
        setForgotSuccess(null);
      }, 2500);
    } catch (err: any) {
      setForgotError(err.message || 'Failed to update password. Please check your credentials.');
    } finally {
      setForgotLoading(false);
    }
  };

  const handleQuickLogin = (id: string) => {
    setIdentifier(id);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-[80vh] flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full bg-white rounded-2xl border border-slate-200 shadow-md p-8">
        <div className="text-center mb-6">
          <MoaLogo className="mx-auto h-16 w-16 mb-3" size={64} />
          <h2 className="text-xl font-bold text-slate-900 tracking-tight">
            MoA Gym
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Staff Wellness & Fitness Center
          </p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-moa-danger">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              MoA Employee ID or Work Email
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <User className="h-4 w-4" />
              </div>
              <input
                type="text"
                required
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. EMP-MOA-001 or admin@moa.gov.et"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green font-mono"
              />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-xs font-semibold text-slate-700">
                Password
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
                className="text-[11px] font-semibold text-moa-green hover:underline cursor-pointer"
              >
                Forgot Password?
              </button>
            </div>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-10 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
              />
              <button
                type="button"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-moa-green cursor-pointer"
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-2.5 px-4 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center justify-center gap-2 disabled:opacity-60 cursor-pointer"
          >
            {isSubmitting ? 'Authenticating...' : 'Sign In to Portal'}
            <ArrowRight className="h-4 w-4" />
          </button>
        </form>

        <div className="mt-6 pt-5 border-t border-slate-100 text-center">
          <p className="text-xs text-slate-600 mb-2">
            First time using the Gym? (አዲስ ተመዝጋቢ?)
          </p>
          <Link
            to="/claim"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-moa-green hover:text-moa-green-dark transition bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200"
          >
            Self-Register & Activate Gym Pass →
          </Link>
        </div>

        {/* Demo Fast Login Helpers */}
        <div className="mt-6 bg-slate-50 rounded-xl p-3 border border-slate-200/80">
          <p className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Demo Credentials (1-Click Fill)
          </p>
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
      </div>

      {/* ─── Change / Reset Password Modal (ATS standard) ─── */}
      {showForgotModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !forgotLoading) setShowForgotModal(false);
          }}
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 relative">
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
                    Employee ID or Registered Work Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={forgotIdentifier}
                    onChange={(e) => setForgotIdentifier(e.target.value)}
                    placeholder="e.g. EMP-MOA-001 or dawit.y@moa.gov.et"
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
                        placeholder="e.g. dawit.y@moa.gov.et"
                        className="w-full pl-9 pr-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-moa-green font-mono"
                      />
                    </div>
                    <span className="text-[10px] text-slate-400 mt-1 block">
                      Must match the email registered on your MoA employee file.
                    </span>
                  </div>
                )}

                {/* 4. New Password */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    New Password <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type={showNewPassword ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="At least 6 characters"
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

                {/* 5. Confirm Password */}
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Confirm New Password <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repeat new password"
                    className="w-full px-3 py-2 border border-slate-300 rounded-xl focus:outline-none focus:border-moa-green"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowForgotModal(false)}
                    disabled={forgotLoading}
                    className="px-4 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-xl hover:bg-slate-50 transition cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={forgotLoading}
                    className="px-5 py-2 text-xs font-bold text-white bg-moa-green hover:bg-moa-green-dark rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>{forgotLoading ? 'Updating Password...' : 'Update Password'}</span>
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
