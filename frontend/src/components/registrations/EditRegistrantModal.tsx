import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Phone,
  Clock,
  Building2,
  FileText,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import { apiRequest } from '../../lib/api';
import { useToast } from '../../context/ToastContext';
import { btn } from '../ui/theme';
import { Registrant } from '../../pages/desk/RegistrationsPage';

interface EditRegistrantModalProps {
  isOpen: boolean;
  onClose: () => void;
  registrant: Registrant | null;
  onSuccess?: () => void;
}

export const EditRegistrantModal: React.FC<EditRegistrantModalProps> = ({
  isOpen,
  onClose,
  registrant,
  onSuccess,
}) => {
  const toast = useToast();
  const [phone, setPhone] = useState('');
  const [shiftPreference, setShiftPreference] = useState('FLEXIBLE');
  const [department, setDepartment] = useState('');
  const [remarks, setRemarks] = useState('');

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (registrant) {
      setPhone(registrant.phone || '');
      setShiftPreference(registrant.shiftPreference || 'FLEXIBLE');
      setDepartment(registrant.department || '');
      setRemarks(registrant.remarks || '');
      setError(null);
    }
  }, [registrant]);

  if (!isOpen || !registrant) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await apiRequest(`/registrations/${registrant.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          phone: phone.trim() || undefined,
          shiftPreference,
          department: department.trim() || undefined,
          remarks: remarks.trim() || undefined,
        }),
      });

      onSuccess?.();
      onClose();
    } catch (err: any) {
      const errMsg = err.message || 'Failed to update member registration details';
      setError(errMsg);
      toast.error('Update Failed', errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      onClick={(e) => e.target === e.currentTarget && onClose()}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-fadeIn overflow-y-auto"
    >
      <div
        className="w-full max-w-md bg-white rounded-2xl border border-slate-200 shadow-2xl overflow-hidden transition-all max-h-[92vh] overflow-y-auto my-auto"
        role="dialog"
        aria-modal="true"
      >
        {/* Header */}
        <div className="relative bg-[#00843D] px-6 py-4 text-white">
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#FCDD09]"></div>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-white/15 text-white backdrop-blur-xs">
                <Edit3 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white tracking-tight">
                  Edit Member Particulars
                </h3>
                <p className="text-[11px] text-emerald-100">
                  Update phone, shift schedule, or department
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="p-1.5 text-white/80 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs font-medium text-rose-800 flex items-center gap-2 shadow-2xs">
              <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Member Card Header Overview */}
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-sm shrink-0">
              {registrant.fullName.charAt(0)}
            </div>
            <div className="min-w-0">
              <h4 className="font-bold text-xs text-slate-900 truncate">{registrant.fullName}</h4>
              <p className="text-[11px] text-slate-500 font-mono">
                ID: {registrant.employeeId} · Reg #{registrant.regNumber}
              </p>
            </div>
          </div>

          {/* Directorate Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Directorate / Work Unit
            </label>
            <div className="relative">
              <input
                type="text"
                required
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 pl-9 text-xs border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-800 transition"
              />
              <Building2 className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Phone Field */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Phone Number
            </label>
            <div className="relative">
              <input
                type="text"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+251 91 123 4567"
                className="w-full px-3 py-2 pl-9 text-xs border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 font-mono text-slate-800 transition"
              />
              <Phone className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            </div>
          </div>

          {/* Shift Preference */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Shift Preference
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setShiftPreference('MORNING')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                  shiftPreference === 'MORNING'
                    ? 'bg-amber-50 border-amber-300 text-amber-900 ring-2 ring-amber-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-amber-600" />
                <span>Morning</span>
                <span className="text-[10px] font-normal text-slate-500">6:00–8:30 AM</span>
              </button>

              <button
                type="button"
                onClick={() => setShiftPreference('EVENING')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                  shiftPreference === 'EVENING'
                    ? 'bg-indigo-50 border-indigo-300 text-indigo-900 ring-2 ring-indigo-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-indigo-600" />
                <span>Evening</span>
                <span className="text-[10px] font-normal text-slate-500">5:30–9:00 PM</span>
              </button>

              <button
                type="button"
                onClick={() => setShiftPreference('FLEXIBLE')}
                className={`py-2 px-2.5 rounded-lg border text-xs font-semibold flex flex-col items-center gap-1 transition cursor-pointer ${
                  shiftPreference === 'FLEXIBLE'
                    ? 'bg-emerald-50 border-emerald-300 text-emerald-900 ring-2 ring-emerald-500/20'
                    : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Flexible</span>
                <span className="text-[10px] font-normal text-slate-500">Either Session</span>
              </button>
            </div>
          </div>

          {/* Remarks */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-slate-700">
              Remarks & Medical Notes
            </label>
            <textarea
              rows={2}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Any specific note or locker preference..."
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-[6px] focus:outline-none focus:border-emerald-700 focus:ring-1 focus:ring-emerald-700 text-slate-800 transition"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className={btn.secondary}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className={btn.primary}
            >
              {loading && <RefreshCw className="h-3.5 w-3.5 animate-spin" />}
              <span>{loading ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
