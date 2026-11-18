import React, { useState } from 'react';
import {
  X,
  Lock,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  ShieldCheck,
  RefreshCw,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { btn } from '../ui/theme';

interface ChangePasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const ChangePasswordModal: React.FC<ChangePasswordModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const toast = useToast();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!isOpen) return null;

  // Validation criteria
  const hasMinLength = newPassword.length >= 8;
  const hasLetter = /[A-Za-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isValid = hasMinLength && hasLetter && hasNumber && passwordsMatch && currentPassword.length > 0;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!currentPassword) {
      setError('Please enter your current password.');
      return;
    }

    if (!hasMinLength || !hasLetter || !hasNumber) {
      setError('New password must be at least 8 characters and contain both letters and numbers.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('The new passwords do not match.');
      return;
    }

    if (newPassword === currentPassword) {
      setError('New password must be different from your current password.');
      return;
    }

    setLoading(true);
    try {
      await apiRequest('/users/me/change-password', {
        method: 'POST',
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      setSuccess(true);
      toast.success('Password Changed', 'Your security password has been updated.');
      setTimeout(() => {
        onSuccess?.();
        handleClose();
      }, 1500);
    } catch (err: any) {
      const errMsg = err.message || 'Failed to change password. Please check your current password.';
      setError(errMsg);
      toast.error('Update Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setError(null);
    setSuccess(false);
    onClose();
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && handleClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all transform scale-100 max-h-[92vh] overflow-y-auto my-auto"
        role="dialog"
        aria-modal="true"
        aria-labelledby="change-password-title"
      >
        {/* Header with MoA Green Accent */}
        <div className="relative bg-[#00843D] px-6 py-4 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FCDD09]"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/15 text-white backdrop-blur-xs">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 id="change-password-title" className="text-sm font-bold text-white tracking-tight">
                  Change Password
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Update your account credentials
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Success Message Banner */}
          {success && (
            <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-semibold text-emerald-900 flex items-center gap-2.5 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-[#00843D] shrink-0" />
              <span>Password changed successfully! Closing...</span>
            </div>
          )}

          {/* Error Message Banner */}
          {error && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2.5 shadow-2xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Current Password Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Current Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                disabled={loading || success}
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="Enter your current password"
                className="w-full px-3 py-2 pl-9 pr-10 text-xs border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 font-mono text-slate-800 transition"
              />
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* New Password Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                disabled={loading || success}
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                placeholder="Minimum 8 characters"
                className="w-full px-3 py-2 pl-9 pr-10 text-xs border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 font-mono text-slate-800 transition"
              />
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showNew ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          {/* Password Strength Checklist */}
          <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-lg space-y-1 text-[11px]">
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${hasMinLength ? 'bg-emerald-600' : 'bg-slate-300'}`} />
              <span className={hasMinLength ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                At least 8 characters
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className={`h-1.5 w-1.5 rounded-full ${hasLetter && hasNumber ? 'bg-emerald-600' : 'bg-slate-300'}`} />
              <span className={hasLetter && hasNumber ? 'text-emerald-800 font-semibold' : 'text-slate-500'}>
                Contains both letters and numbers
              </span>
            </div>
          </div>

          {/* Confirm New Password Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Confirm New Password <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                disabled={loading || success}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Re-enter your new password"
                className={`w-full px-3 py-2 pl-9 pr-10 text-xs border rounded-[6px] focus:outline-none font-mono text-slate-800 transition ${
                  confirmPassword && !passwordsMatch
                    ? 'border-rose-300 focus:border-rose-500 focus:ring-1 focus:ring-rose-500'
                    : 'border-slate-300 focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700'
                }`}
              />
              <Lock className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
            {confirmPassword && !passwordsMatch && (
              <p className="text-[11px] text-rose-600 mt-0.5">Passwords do not match</p>
            )}
          </div>

          {/* Footer Action Buttons */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              disabled={loading}
              className={btn.secondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !isValid || success}
              className={btn.primary}
            >
              {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>{loading ? 'Updating...' : 'Update Password'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
