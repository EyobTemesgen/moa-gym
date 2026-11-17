import React, { useState, useRef, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '../../lib/api';
import { X, Search, Check, AlertCircle, PenTool, RotateCcw, UserPlus } from 'lucide-react';
import { btn } from '../ui/theme';

interface RegisterStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (newReg: any) => void;
}

export const RegisterStaffModal: React.FC<RegisterStaffModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const [employeeId, setEmployeeId] = useState('');
  const [fullName, setFullName] = useState('');
  const [department, setDepartment] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [gender, setGender] = useState('MALE');
  const [shiftPreference, setShiftPreference] = useState('ANY');
  const [remarks, setRemarks] = useState('');
  const [paperSignedVerified, setPaperSignedVerified] = useState(true);
  const [signatureMode, setSignatureMode] = useState<'PAPER' | 'DIGITAL'>('PAPER');

  // Search roster
  const [rosterSearch, setRosterSearch] = useState('');
  const [showRosterSuggestions, setShowRosterSuggestions] = useState(false);
  const [manualMode, setManualMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Digital canvas
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasDrawnSignature, setHasDrawnSignature] = useState(false);

  // Fetch employees for auto-complete
  const { data: rosterData } = useQuery<{ items: any[] }>({
    queryKey: ['rosterLookup', rosterSearch],
    queryFn: () => {
      const q = rosterSearch.trim();
      return apiRequest(`/hr-roster?limit=25${q ? `&query=${encodeURIComponent(q)}` : ''}`);
    },
    enabled: isOpen && !manualMode,
  });

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasDrawnSignature(false);
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    setIsDrawing(true);
    setHasDrawnSignature(true);
    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#07572A';
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement> | React.TouchEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = 'touches' in e ? e.touches[0].clientX - rect.left : e.clientX - rect.left;
    const y = 'touches' in e ? e.touches[0].clientY - rect.top : e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
  };

  const handleSelectEmployee = (emp: any) => {
    setEmployeeId(emp.employeeId);
    setFullName(emp.fullName);
    setDepartment(emp.department);
    if (emp.phone) setPhone(emp.phone);
    if (emp.email) setEmail(emp.email);
    setShowRosterSuggestions(false);
  };

  const resetForm = () => {
    setEmployeeId('');
    setFullName('');
    setDepartment('');
    setPhone('');
    setEmail('');
    setRemarks('');
    setShiftPreference('ANY');
    setRosterSearch('');
    setManualMode(false);
    setErrorMsg(null);
    clearCanvas();
  };

  useEffect(() => {
    if (isOpen) {
      resetForm();
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!fullName.trim()) {
      setErrorMsg('Full Name is required');
      return;
    }
    if (!department.trim()) {
      setErrorMsg('Directorate / Department is required');
      return;
    }

    const effectiveId = employeeId.trim() || `EMP-TMP-${Date.now().toString().slice(-6)}`;

    let signatureData: string | null = null;
    if (signatureMode === 'DIGITAL' && canvasRef.current && hasDrawnSignature) {
      signatureData = canvasRef.current.toDataURL('image/png');
    }

    setSubmitting(true);
    try {
      const payload = {
        employeeId: effectiveId,
        fullName: fullName.trim(),
        department: department.trim(),
        phone: phone.trim() || undefined,
        email: email.trim() || undefined,
        gender,
        shiftPreference,
        registrationSource: manualMode ? 'MANUAL_ENTRY' : 'HR_AUTOFILL',
        signatureConfirmed: paperSignedVerified || hasDrawnSignature,
        signatureData: signatureData || undefined,
        remarks: remarks.trim() || undefined,
      };

      const res = await apiRequest('/registrations', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      onSuccess(res);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl max-h-[90vh] flex flex-col bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Institutional Color Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue shrink-0"></div>

        {/* Modal Header */}
        <div className="px-6 py-3.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between shrink-0">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Register Staff Member for Gym Service
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              MoA Staff Gymnasium Official Membership Enrollment
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="flex-1 flex flex-col min-h-0 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-6 space-y-4 text-xs">
            {errorMsg && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-800 flex items-center gap-2">
                <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
                <span>{errorMsg}</span>
              </div>
            )}

          {/* Employee Auto-Complete / Lookup Section */}
          <div className="bg-emerald-50/60 border border-emerald-200/80 rounded-xl p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-800 flex items-center gap-1.5">
                <Search className="h-4 w-4 text-moa-green" />
                <span>Search Staff from MoA HR Roster</span>
              </span>
              <button
                type="button"
                onClick={() => {
                  setManualMode(!manualMode);
                  if (!manualMode) {
                    setRosterSearch('');
                  }
                }}
                className="text-[11px] font-semibold text-moa-green hover:underline cursor-pointer flex items-center gap-1"
              >
                <UserPlus className="h-3 w-3" />
                <span>{manualMode ? 'Switch to HR Search' : 'Type Manually'}</span>
              </button>
            </div>

            {!manualMode ? (
              <div className="relative">
                <input
                  type="text"
                  placeholder="Type name or Employee ID to auto-fill..."
                  value={rosterSearch}
                  onChange={(e) => {
                    setRosterSearch(e.target.value);
                    setShowRosterSuggestions(true);
                  }}
                  onFocus={() => setShowRosterSuggestions(true)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-moa-green/30 text-xs"
                />

                {showRosterSuggestions && (rosterData?.items || []).length > 0 && (
                  <div className="absolute top-full left-0 right-0 mt-1 max-h-48 overflow-y-auto bg-white border border-slate-200 rounded-lg shadow-lg z-20 divide-y divide-slate-100">
                    {(rosterData?.items || []).map((emp) => (
                      <button
                        key={emp.employeeId}
                        type="button"
                        onClick={() => handleSelectEmployee(emp)}
                        className="w-full text-left px-3 py-2 hover:bg-emerald-50 flex items-center justify-between transition cursor-pointer"
                      >
                        <div>
                          <div className="font-bold text-slate-900">{emp.fullName}</div>
                          <div className="text-[11px] text-slate-500">{emp.department}</div>
                        </div>
                        <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                          {emp.employeeId}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <p className="text-[11px] text-slate-500">
                If the staff member is not found in the HR database, you can type their information directly below.
              </p>
            )}
          </div>

          {/* Form Fields Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Meseret Mebrate"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Directorate / Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Food Security Directorate"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Employee ID
              </label>
              <input
                type="text"
                placeholder="e.g. EMP-MOA-001"
                value={employeeId}
                onChange={(e) => setEmployeeId(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-moa-green/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                placeholder="+251 91 234 5678"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Shift Preference
              </label>
              <select
                value={shiftPreference}
                onChange={(e) => setShiftPreference(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-moa-green/30"
              >
                <option value="ANY">Flexible / Any Time</option>
                <option value="MORNING">Morning (06:00 - 08:30)</option>
                <option value="LUNCH">Lunch Hours (12:00 - 14:00)</option>
                <option value="EVENING">Evening (17:00 - 20:00)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Gender
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-moa-green/30"
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
              </select>
            </div>
          </div>

          {/* Signature / Confirmation Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-800 flex items-center gap-1.5">
                <PenTool className="h-4 w-4 text-moa-green" />
                <span>Registrant Signature</span>
              </label>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setSignatureMode('PAPER')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    signatureMode === 'PAPER'
                      ? 'bg-moa-green text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Paper Sheet Verified
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureMode('DIGITAL')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition cursor-pointer ${
                    signatureMode === 'DIGITAL'
                      ? 'bg-moa-green text-white shadow-xs'
                      : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  Draw Digital Signature
                </button>
              </div>
            </div>

            {signatureMode === 'PAPER' ? (
              <label className="flex items-start gap-2.5 p-2.5 bg-white border border-slate-200 rounded-lg cursor-pointer">
                <input
                  type="checkbox"
                  checked={paperSignedVerified}
                  onChange={(e) => setPaperSignedVerified(e.target.checked)}
                  className="mt-0.5 rounded text-moa-green focus:ring-moa-green/30"
                />
                <span className="text-slate-700 leading-snug">
                  <strong>Paper Signature Verified:</strong> Staff member has personally signed the physical Ministry of Agriculture gymnasium registration paper form.
                </span>
              </label>
            ) : (
              <div className="space-y-1.5">
                <div className="relative bg-white border border-slate-300 rounded-lg overflow-hidden h-28 cursor-crosshair">
                  <canvas
                    ref={canvasRef}
                    width={550}
                    height={112}
                    onMouseDown={startDrawing}
                    onMouseMove={draw}
                    onMouseUp={stopDrawing}
                    onMouseLeave={stopDrawing}
                    onTouchStart={startDrawing}
                    onTouchMove={draw}
                    onTouchEnd={stopDrawing}
                    className="w-full h-full"
                  />
                  {!hasDrawnSignature && (
                    <div className="absolute inset-0 pointer-events-none flex items-center justify-center text-slate-300 text-xs font-medium">
                      Sign here using mouse or touch screen
                    </div>
                  )}
                </div>
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={clearCanvas}
                    className="inline-flex items-center gap-1 text-[11px] text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    <RotateCcw className="h-3 w-3" />
                    <span>Clear Signature</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Optional Health / Fitness Remarks */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Optional Medical / Fitness Remarks
            </label>
            <input
              type="text"
              placeholder="e.g. Previous joint injury, medical clearance on file, etc."
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              className="w-full px-3 py-1.5 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30"
            />
          </div>
          </div>

          {/* Footer Actions (Pinned at bottom) */}
          <div className="shrink-0 px-6 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className={btn.secondary}
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={submitting}
              className={btn.primary}
            >
              <Check className="h-4 w-4" />
              <span>{submitting ? 'Registering...' : 'Complete Registration'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
