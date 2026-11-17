import React, { useState, useEffect, useRef } from 'react';
import { apiRequest } from '../../lib/api';
import { Html5Qrcode } from 'html5-qrcode';
import {
  Camera,
  Search,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  UserCheck,
  RefreshCw,
  LogOut,
  UserX,
  ShieldCheck,
  X,
  User,
} from 'lucide-react';
import { btn } from '../../components/ui/theme';

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
      const res = await apiRequest<any>('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: verification.employee.employeeId,
          lockerNumber: selectedLocker || undefined,
        }),
      });

      setLastCheckInSuccess(
        `✓ Entrance authorized for ${res.employee?.fullName || verification.employee.fullName} (${res.employee?.employeeId || verification.employee.employeeId})${
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
            handleVerify({ qrToken: decodedText });
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
    <div className="space-y-5">
      {/* Header Banner (Asset Tracking Style) */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">
              Front Desk Gate Verification Terminal
            </h1>
            <span className="text-[11px] font-bold text-[#00843D] bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
              Access Control
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Camera QR scan verification paired with instant MoA staff roster & whitelist lookup.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setCameraActive(!cameraActive)}
          className={cameraActive ? btn.secondary : btn.primary}
        >
          <Camera className="h-4 w-4" />
          <span>{cameraActive ? 'Close Camera Scanner' : 'Activate Camera Scanner'}</span>
        </button>
      </div>

      {lastCheckInSuccess && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg flex items-center justify-between text-xs font-semibold text-emerald-900 shadow-2xs">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-[#00843D] shrink-0" />
            <span>{lastCheckInSuccess}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastCheckInSuccess(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Left Column: Input Methods */}
        <div className="lg:col-span-5 space-y-5">
          {/* Camera Viewport */}
          {cameraActive && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span>Live Camera Viewfinder</span>
                <span className="text-[10px] text-[#00843D] font-mono animate-pulse">Scanning QR...</span>
              </div>
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden border border-slate-200"></div>
            </div>
          )}

          {/* Manual Employee Lookup Card */}
          <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs">
            <h2 className="text-sm font-bold text-slate-900 mb-1">
              Manual Employee Lookup
            </h2>
            <p className="text-xs text-slate-500 mb-4">
              Search by Employee ID, Name, or Registration No if staff do not have their QR pass.
            </p>

            <form onSubmit={handleManualSearch} className="space-y-3">
              <div>
                <input
                  type="text"
                  value={manualId}
                  onChange={(e) => setManualId(e.target.value)}
                  placeholder="e.g. EMP-MOA-001, Mulugeta, or 1"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-[4px] focus:outline-none focus:border-emerald-700 font-mono text-slate-900 placeholder-slate-400"
                />
              </div>

              <button
                type="submit"
                disabled={isVerifying || !manualId.trim()}
                className={`${btn.primary} w-full`}
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

            {/* Quick Test Lookups */}
            <div className="mt-4 pt-3.5 border-t border-slate-100">
              <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                Quick Test Lookup
              </span>
              <div className="flex flex-wrap gap-1.5 text-[11px]">
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-001');
                    handleVerify({ employeeId: 'EMP-MOA-001' });
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:border-emerald-600 text-slate-700 font-mono text-[10px] cursor-pointer"
                >
                  EMP-MOA-001 (Valid)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualId('1');
                    handleVerify({ employeeId: '1' });
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:border-emerald-600 text-slate-700 font-mono text-[10px] cursor-pointer"
                >
                  Reg #1 (Paper Form)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-014');
                    handleVerify({ employeeId: 'EMP-MOA-014' });
                  }}
                  className="px-2 py-1 bg-slate-50 border border-slate-200 rounded hover:border-emerald-600 text-slate-700 font-mono text-[10px] cursor-pointer"
                >
                  EMP-MOA-014 (Inactive)
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Verification Result Card */}
        <div className="lg:col-span-7">
          {verification ? (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-5">
              {/* Status Header Badge */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider block">
                    Verification Decision
                  </span>
                  <h3 className="text-base font-bold text-slate-900">
                    Gate Entrance Assessment
                  </h3>
                </div>

                {verification.status === 'READY_FOR_CHECKIN' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-emerald-800 border border-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-[#00843D]" />
                    APPROVED · READY FOR CHECK-IN
                  </span>
                )}

                {verification.status === 'ALREADY_CHECKED_IN' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-700" />
                    ALREADY INSIDE GYM
                  </span>
                )}

                {verification.status === 'UNREGISTERED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <UserX className="h-4 w-4 text-amber-600" />
                    ACCOUNT NOT CLAIMED
                  </span>
                )}

                {verification.status === 'DENIED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-300">
                    <XCircle className="h-4 w-4" />
                    DENIED: {verification.reason}
                  </span>
                )}
              </div>

              {/* Employee ID Details Card */}
              {verification.employee && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg flex items-start gap-4">
                  {verification.employee.photoUrl ? (
                    <img
                      src={verification.employee.photoUrl}
                      alt={verification.employee.fullName}
                      className="h-16 w-16 rounded-lg object-cover ring-2 ring-emerald-500/20 shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xl shrink-0">
                      <User className="h-8 w-8 text-[#00843D]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-900 truncate">
                      {verification.employee.fullName}
                    </h4>
                    <p className="text-xs font-medium text-slate-600">
                      {verification.employee.department}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 mt-1.5 text-xs text-slate-500 font-mono">
                      <span>ID: {verification.employee.employeeId}</span>
                      <span>·</span>
                      <span className="text-emerald-700 font-sans font-semibold">
                        {verification.employee.employmentStatus || 'Active Staff'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              {verification.status === 'READY_FOR_CHECKIN' && (
                <div className="space-y-4 pt-2 border-t border-slate-100">
                  {verification.availableLockers && verification.availableLockers.length > 0 && (
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Assign Key Locker (Optional):
                      </label>
                      <select
                        value={selectedLocker}
                        onChange={(e) => setSelectedLocker(e.target.value)}
                        className="px-3 py-2 text-xs border border-slate-300 rounded-[4px] bg-white font-mono"
                      >
                        <option value="">No Locker Key Assigned</option>
                        {verification.availableLockers.map((num) => (
                          <option key={num} value={num}>
                            Locker #{num}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}

                  <button
                    type="button"
                    onClick={handleConfirmCheckIn}
                    disabled={isCheckingIn}
                    className={`${btn.primary} w-full py-2.5 text-sm`}
                  >
                    <UserCheck className="h-4 w-4" />
                    <span>{isCheckingIn ? 'Authorizing...' : 'Authorize Entrance & Log Check-In'}</span>
                  </button>
                </div>
              )}

              {verification.status === 'ALREADY_CHECKED_IN' && (
                <div className="pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={handleQuickCheckout}
                    disabled={isCheckingOut}
                    className="w-full py-2.5 bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs rounded-[4px] shadow-xs flex items-center justify-center gap-2 cursor-pointer transition"
                  >
                    <LogOut className="h-4 w-4" />
                    <span>{isCheckingOut ? 'Checking out...' : 'Log Departure (Check-Out)'}</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center shadow-xs">
              <div className="w-12 h-12 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-3 text-slate-400">
                <ShieldCheck className="w-6 h-6 text-slate-400" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Terminal Awaiting Gate Arrival
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1">
                Scan employee QR pass with the camera or type an employee ID / name into the manual search box.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
