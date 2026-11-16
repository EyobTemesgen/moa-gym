import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../lib/api';
import { Html5QrcodeScanner, Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  Key,
  RefreshCw,
  LogOut,
  UserX,
  ShieldCheck,
  User,
} from 'lucide-react';

interface VerificationResult {
  status: 'APPROVED' | 'READY_FOR_CHECKIN' | 'ALREADY_CHECKED_IN' | 'UNREGISTERED' | 'DENIED';
  reason?: string;
  message?: string;
  employee?: {
    userId?: string;
    employeeId: string;
    fullName: string;
    department: string;
    photoUrl?: string;
    employmentStatus?: string;
    emergencyContactName?: string;
    emergencyContactPhone?: string;
    waiverSignedAt?: string;
  };
  activeAttendance?: {
    id: string;
    checkInTime: string;
    lockerNumber?: string;
  };
  availableLockers?: string[];
  currentOccupancy?: number;
  maxCapacity?: number;
}

export const CheckInTerminalPage: React.FC = () => {
  const [manualId, setManualId] = useState('');
  const [selectedLocker, setSelectedLocker] = useState<string>('');
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lastCheckInSuccess, setLastCheckInSuccess] = useState<string | null>(null);

  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Manual Employee ID Check
  const handleVerify = async (ident: { employeeId?: string; qrToken?: string }) => {
    setIsVerifying(true);
    setVerification(null);
    setLastCheckInSuccess(null);
    try {
      const res = await apiRequest<VerificationResult>('/attendance/verify', {
        method: 'POST',
        body: JSON.stringify(ident),
      });
      setVerification(res);
      setSelectedLocker('');
    } catch (err: any) {
      setVerification({
        status: 'DENIED',
        reason: 'SERVER_ERROR',
        message: err.message || 'Verification service failed',
      });
    } finally {
      setIsVerifying(false);
    }
  };

  const handleManualSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualId.trim()) return;
    handleVerify({ employeeId: manualId.trim() });
  };

  // Complete Check-in
  const handleConfirmCheckIn = async () => {
    if (!verification?.employee?.employeeId) return;

    setIsCheckingIn(true);
    try {
      const res = await apiRequest('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: verification.employee.employeeId,
          lockerNumber: selectedLocker || undefined,
        }),
      });

      setLastCheckInSuccess(
        `✓ Entrance authorized for ${res.employee.fullName} (${res.employee.employeeId})${
          res.lockerNumber ? ` · Locker: ${res.lockerNumber}` : ''
        }`,
      );
      setVerification(null);
      setManualId('');
      setSelectedLocker('');
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Quick checkout for ALREADY_CHECKED_IN
  const handleQuickCheckout = async () => {
    if (!verification?.activeAttendance?.id) return;
    setIsCheckingOut(true);
    try {
      await apiRequest('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ identifier: verification.activeAttendance.id }),
      });
      setLastCheckInSuccess(`✓ Checked out ${verification.employee?.fullName}`);
      setVerification(null);
    } catch (err: any) {
      alert(err.message || 'Check-out failed');
    } finally {
      setIsCheckingOut(false);
    }
  };

  // Camera QR Scanner Toggle
  useEffect(() => {
    if (cameraActive) {
      const html5QrCode = new Html5Qrcode('qr-reader');
      scannerRef.current = html5QrCode;

      html5QrCode
        .start(
          { facingMode: 'environment' },
          { fps: 10, qrbox: { width: 250, height: 250 } },
          (decodedText) => {
            // Decoded QR Pass
            handleVerify({ qrToken: decodedText });
            // Pause scanner momentarily
            setCameraActive(false);
          },
          () => {},
        )
        .catch((err) => {
          console.warn('Camera failed to start:', err);
          setCameraActive(false);
        });

      return () => {
        if (scannerRef.current?.isScanning) {
          scannerRef.current.stop().catch(() => {});
        }
      };
    } else {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop().catch(() => {});
      }
    }
  }, [cameraActive]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Front Desk Gate Verification Terminal
            </h1>
            <span className="text-[11px] font-bold text-moa-green bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              6-Step Gate Check
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Browser camera QR scanner paired with instant MoA Employee ID whitelist validation.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCameraActive(!cameraActive)}
          className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold shadow-xs transition cursor-pointer ${
            cameraActive
              ? 'bg-red-50 text-moa-danger border border-red-200 hover:bg-red-100'
              : 'bg-moa-green text-white hover:bg-moa-green-dark'
          }`}
        >
          <Camera className="h-4 w-4" />
          <span>{cameraActive ? 'Close Camera Scanner' : 'Activate Camera Scanner'}</span>
        </button>
      </div>

      {lastCheckInSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-xl flex items-center gap-2 text-xs font-semibold text-emerald-900 animate-fadeIn">
          <CheckCircle2 className="h-5 w-5 text-moa-green shrink-0" />
          <span>{lastCheckInSuccess}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input Methods (Camera + Manual ID) */}
        <div className="lg:col-span-5 space-y-6">
          {/* Camera Viewport */}
          {cameraActive && (
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span>Live Camera Viewfinder</span>
                <span className="text-[10px] text-moa-green font-mono animate-pulse">Scanning...</span>
              </div>
              <div id="qr-reader" className="w-full rounded-xl overflow-hidden border border-slate-200"></div>
            </div>
          )}

          {/* Manual Employee ID Search */}
          <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-2">
              Manual Employee Lookup
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Search by MoA Employee ID if the staff member does not have their phone or camera scan fails.
            </p>

            <form onSubmit={handleManualSearch} className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value.toUpperCase())}
                  placeholder="e.g. EMP-MOA-001"
                  className="w-full px-3 py-2.5 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green font-mono uppercase"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || !manualId.trim()}
                className="w-full py-2.5 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
              >
                {isVerifying ? (
                  <>
                    <RefreshCw className="h-4 w-4 animate-spin" />
                    <span>Verifying with Database...</span>
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    <span>Verify Entrance Eligibility</span>
                  </>
                )}
              </button>
            </form>

            {/* Quick Test Fill Buttons */}
            <div className="mt-4 pt-4 border-t border-slate-100">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Test Staff Lookup
              </span>
              <div className="flex flex-wrap gap-1.5 text-[10px]">
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-001');
                    handleVerify({ employeeId: 'EMP-MOA-001' });
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:border-moa-green text-slate-700"
                >
                  EMP-MOA-001 (Valid)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-002');
                    handleVerify({ employeeId: 'EMP-MOA-002' });
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:border-moa-green text-slate-700"
                >
                  EMP-MOA-002 (No Waiver)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-003');
                    handleVerify({ employeeId: 'EMP-MOA-003' });
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:border-moa-green text-slate-700"
                >
                  EMP-MOA-003 (Unclaimed)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-014');
                    handleVerify({ employeeId: 'EMP-MOA-014' });
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:border-moa-green text-slate-700"
                >
                  EMP-MOA-014 (Inactive)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Gate Verification Result & Identity Match Card */}
        <div className="lg:col-span-7">
          {verification ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-xs space-y-6">
              {/* Status Header Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Verification Decision
                  </span>
                  <h3 className="text-lg font-bold text-slate-900">
                    Gate Entrance Assessment
                  </h3>
                </div>

                {verification.status === 'READY_FOR_CHECKIN' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-emerald-100 text-moa-green border border-emerald-300">
                    <CheckCircle2 className="h-4 w-4" />
                    APPROVED · READY FOR CHECK-IN
                  </span>
                )}

                {verification.status === 'ALREADY_CHECKED_IN' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-100 text-amber-900 border border-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-700" />
                    ALREADY INSIDE GYM
                  </span>
                )}

                {verification.status === 'UNREGISTERED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <UserX className="h-4 w-4 text-amber-600" />
                    ACCOUNT NOT CLAIMED
                  </span>
                )}

                {verification.status === 'DENIED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold bg-red-100 text-moa-danger border border-red-300">
                    <XCircle className="h-4 w-4" />
                    DENIED: {verification.reason}
                  </span>
                )}
              </div>

              {/* Message Explanation */}
              <div
                className={`p-3.5 rounded-xl border text-xs ${
                  verification.status === 'READY_FOR_CHECKIN'
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                    : verification.status === 'DENIED'
                    ? 'bg-red-50 border-red-200 text-moa-danger'
                    : 'bg-amber-50 border-amber-200 text-amber-900'
                }`}
              >
                {verification.message}
              </div>

              {/* Staff Visual Identity Match (Photo, Name, Department) */}
              {verification.employee && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl flex flex-col sm:flex-row items-center gap-4">
                  {verification.employee.photoUrl ? (
                    <img
                      src={verification.employee.photoUrl}
                      alt={verification.employee.fullName}
                      className="h-24 w-24 rounded-2xl object-cover ring-2 ring-moa-green/40 shadow-xs"
                    />
                  ) : (
                    <div className="h-24 w-24 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-slate-400">
                      <User className="h-10 w-10" />
                    </div>
                  )}

                  <div className="space-y-1 text-center sm:text-left flex-1">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Physical ID Match
                    </span>
                    <h4 className="text-base font-bold text-slate-900">
                      {verification.employee.fullName}
                    </h4>
                    <p className="text-xs text-slate-600 font-mono">
                      ID: <strong>{verification.employee.employeeId}</strong>
                    </p>
                    <p className="text-xs text-slate-500">
                      {verification.employee.department}
                    </p>

                    {verification.employee.emergencyContactName && (
                      <p className="text-[11px] text-slate-500 pt-1">
                        Emergency: {verification.employee.emergencyContactName} (
                        {verification.employee.emergencyContactPhone})
                      </p>
                    )}
                  </div>
                </div>
              )}

              {/* Action Area depending on status */}
              {verification.status === 'READY_FOR_CHECKIN' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {/* Locker Selection */}
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1.5">
                      <Key className="h-3.5 w-3.5 text-moa-green" />
                      <span>Assign Daily Locker (Optional)</span>
                    </label>
                    <select
                      value={selectedLocker}
                      onChange={(e) => setSelectedLocker(e.target.value)}
                      className="w-full px-3 py-2 text-xs border border-slate-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
                    >
                      <option value="">No Locker / Carrying Bag</option>
                      {verification.availableLockers?.map((locker) => (
                        <option key={locker} value={locker}>
                          Locker {locker} (Available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleConfirmCheckIn}
                    disabled={isCheckingIn}
                    className="w-full py-3 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-bold rounded-xl shadow-xs transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    <span>
                      {isCheckingIn
                        ? 'Authorizing Entrance...'
                        : 'Confirm Identity & Authorize Entrance'}
                    </span>
                  </button>
                </div>
              )}

              {verification.status === 'ALREADY_CHECKED_IN' && (
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-xs text-slate-600">
                    Checked in at:{' '}
                    <strong>
                      {new Date(
                        verification.activeAttendance!.checkInTime,
                      ).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </strong>
                    {verification.activeAttendance?.lockerNumber && (
                      <span> · Locker: {verification.activeAttendance.lockerNumber}</span>
                    )}
                  </span>
                  <button
                    type="button"
                    onClick={handleQuickCheckout}
                    disabled={isCheckingOut}
                    className="px-4 py-2 bg-moa-danger hover:bg-red-700 text-white text-xs font-semibold rounded-xl shadow-xs transition flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>{isCheckingOut ? 'Checking out...' : 'Check Out Now'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-dashed border-slate-200 p-12 text-center flex flex-col items-center justify-center min-h-[350px]">
              <div className="p-4 bg-slate-50 rounded-2xl text-slate-400 mb-3">
                <ShieldCheck className="h-10 w-10 text-moa-green/50" />
              </div>
              <h3 className="text-sm font-bold text-slate-700">Terminal Ready</h3>
              <p className="text-xs text-slate-500 max-w-sm mt-1">
                Scan employee QR pass with the camera or enter their MoA Employee ID to run the 6-step gate check.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
