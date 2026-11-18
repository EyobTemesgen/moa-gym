import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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
  Users,
  Clock,
  Key,
  Flame,
  ArrowRight,
} from 'lucide-react';
import { btn, pill, statusTone, table } from '../../components/ui/theme';

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

interface ActiveFloorUser {
  attendanceId: string;
  userId: string;
  employeeId: string;
  fullName: string;
  department: string;
  photoUrl?: string;
  checkInTime: string;
  lockerNumber?: string;
}

export const CheckInTerminalPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [manualId, setManualId] = useState('');
  const [selectedLocker, setSelectedLocker] = useState<string>('');
  const [verification, setVerification] = useState<VerificationResult | null>(null);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isEnrolling, setIsEnrolling] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [lastNotification, setLastNotification] = useState<{
    type: 'success' | 'info';
    message: string;
  } | null>(null);

  const inputRef = useRef<HTMLInputElement | null>(null);
  const confirmBtnRef = useRef<HTMLButtonElement | null>(null);
  const checkoutBtnRef = useRef<HTMLButtonElement | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  // Live gym occupancy & active floor occupants
  const { data: occupancy, isLoading: isOccupancyLoading } = useQuery<{
    current: number;
    maxCapacity: number;
    percentage: number;
    activeUsers: ActiveFloorUser[];
  }>({
    queryKey: ['liveOccupancy'],
    queryFn: () => apiRequest('/attendance/occupancy'),
    refetchInterval: 8000,
  });

  // Always keep focus in the Employee ID input box when idle
  useEffect(() => {
    if (!verification && !cameraActive) {
      inputRef.current?.focus();
    }
  }, [verification, cameraActive]);

  // When verification is ready, auto-focus the primary confirmation action button
  useEffect(() => {
    if (verification?.status === 'READY_FOR_CHECKIN') {
      const timer = setTimeout(() => confirmBtnRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
    if (verification?.status === 'ALREADY_CHECKED_IN') {
      const timer = setTimeout(() => checkoutBtnRef.current?.focus(), 60);
      return () => clearTimeout(timer);
    }
  }, [verification]);

  // Manual / Scanner ID Verification
  const handleVerify = async (ident: { employeeId?: string; qrToken?: string }) => {
    setIsVerifying(true);
    setVerification(null);
    setLastNotification(null);
    try {
      const res = await apiRequest<VerificationResult>('/attendance/verify', {
        method: 'POST',
        body: JSON.stringify(ident),
      });
      setVerification(res);

      // Auto-assign first available locker by default
      if (res.availableLockers && res.availableLockers.length > 0) {
        setSelectedLocker(res.availableLockers[0]);
      } else {
        setSelectedLocker('');
      }
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

      const empName = res.employee?.fullName || verification.employee.fullName;
      const empId = res.employee?.employeeId || verification.employee.employeeId;
      const lockerText = res.lockerNumber ? ` · Locker #${res.lockerNumber}` : '';

      setLastNotification({
        type: 'success',
        message: `Entrance authorized for ${empName} (${empId})${lockerText}`,
      });

      queryClient.invalidateQueries({ queryKey: ['liveOccupancy'] });
      setVerification(null);
      setManualId('');
      setSelectedLocker('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err: any) {
      alert(err.message || 'Check-in failed');
    } finally {
      setIsCheckingIn(false);
    }
  };

  // Instant Walk-in Registration & Check-in
  const handleQuickEnrollAndAdmit = async () => {
    if (!verification?.employee?.employeeId) return;
    setIsEnrolling(true);
    try {
      // 1. Create registration record
      await apiRequest('/registrations', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: verification.employee.employeeId,
          fullName: verification.employee.fullName,
          department: verification.employee.department,
          shiftPreference: 'FLEXIBLE',
          phone: verification.employee.emergencyContactPhone || '+251 91 000 0000',
        }),
      });

      // 2. Perform check-in immediately
      const res = await apiRequest<any>('/attendance/check-in', {
        method: 'POST',
        body: JSON.stringify({
          employeeId: verification.employee.employeeId,
          lockerNumber: selectedLocker || undefined,
        }),
      });

      const empName = verification.employee.fullName;
      const empId = verification.employee.employeeId;
      const lockerText = res.lockerNumber ? ` · Locker #${res.lockerNumber}` : '';

      setLastNotification({
        type: 'success',
        message: `Walk-in staff member ${empName} (${empId}) enrolled & admitted!${lockerText}`,
      });

      queryClient.invalidateQueries({ queryKey: ['liveOccupancy'] });
      queryClient.invalidateQueries({ queryKey: ['gymRegistrations'] });
      setVerification(null);
      setManualId('');
      setSelectedLocker('');
      setTimeout(() => inputRef.current?.focus(), 50);
    } catch (err: any) {
      alert(err.message || 'Quick enrollment failed');
    } finally {
      setIsEnrolling(false);
    }
  };

  // Check out mutation (used for active list & modal)
  const checkOutMutation = useMutation({
    mutationFn: (attendanceId: string) =>
      apiRequest('/attendance/check-out', {
        method: 'POST',
        body: JSON.stringify({ identifier: attendanceId }),
      }),
    onSuccess: (data: any, attendanceId: string) => {
      queryClient.invalidateQueries({ queryKey: ['liveOccupancy'] });
      setLastNotification({
        type: 'info',
        message: `Staff member departure recorded. Locker returned to available.`,
      });
      if (verification?.activeAttendance?.id === attendanceId) {
        setVerification(null);
        setManualId('');
      }
      setTimeout(() => inputRef.current?.focus(), 50);
    },
    onError: (err: any) => {
      alert(err.message || 'Check-out failed');
    },
  });

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

  const currentCount = occupancy?.current ?? 0;
  const maxCapacity = occupancy?.maxCapacity ?? 40;
  const occupancyPct = occupancy?.percentage ?? 0;

  return (
    <div className="space-y-5">
      {/* Page Header with Occupancy & Quick Camera Toggle */}
      <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="min-w-0">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight whitespace-nowrap">
              Gate Checking Terminal
            </h1>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-50 text-[#00843D] border border-emerald-200 shadow-2xs">
              Attendant Fast Lane
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1 truncate">
            Rapid Employee ID Entrance & Departure Control
          </p>
        </div>

        {/* Live Facility Count Meter + Camera Option */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="px-3.5 py-1.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center gap-2 text-xs">
            <Users className="w-4 h-4 text-[#00843D]" />
            <span className="font-semibold text-slate-700">Gym Occupancy:</span>
            <span className="font-bold text-slate-900 font-mono">
              {currentCount} / {maxCapacity}
            </span>
          </div>

          <button
            type="button"
            onClick={() => setCameraActive(!cameraActive)}
            title="Toggle optional webcam QR scanner"
            className={`${cameraActive ? btn.secondary : btn.secondary} shrink-0 text-xs`}
          >
            <Camera className="h-4 w-4 text-slate-500" />
            <span>{cameraActive ? 'Close Camera' : 'Scan QR Code'}</span>
          </button>
        </div>
      </div>

      {/* Instant Notification Banner */}
      {lastNotification && (
        <div
          className={`p-3.5 rounded-lg flex items-center justify-between text-xs font-semibold shadow-2xs border ${
            lastNotification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-sky-50 border-sky-200 text-sky-900'
          }`}
        >
          <div className="flex items-center gap-2">
            <CheckCircle2
              className={`h-4 w-4 shrink-0 ${
                lastNotification.type === 'success' ? 'text-[#00843D]' : 'text-sky-600'
              }`}
            />
            <span>{lastNotification.message}</span>
          </div>
          <button
            type="button"
            onClick={() => setLastNotification(null)}
            className="text-slate-400 hover:text-slate-600 cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {/* Main Grid: Left = ID Lookup & Verify Card; Right = Active Floor Occupants */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* Left Column (7 cols): Primary Employee ID Check-In Lane */}
        <div className="lg:col-span-7 space-y-5">
          {/* Optional Camera Viewport */}
          {cameraActive && (
            <div className="bg-white rounded-xl border border-slate-200 p-4 shadow-xs">
              <div className="text-xs font-semibold text-slate-700 mb-2 flex items-center justify-between">
                <span>Live Camera Viewfinder</span>
                <span className="text-[10px] text-[#00843D] font-mono animate-pulse">
                  Scanning for QR Code...
                </span>
              </div>
              <div id="qr-reader" className="w-full rounded-lg overflow-hidden border border-slate-200"></div>
            </div>
          )}

          {/* PRIMARY HERO CARD: Ask Staff for Employee ID */}
          <div className="bg-white rounded-xl border-2 border-emerald-600/30 shadow-xs overflow-hidden">
            {/* Top Green Accent Ribbon */}
            <div className="h-1.5 w-full bg-[#00843D]"></div>

            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
                    Fast Lane Gate Check
                  </span>
                  <h2 className="text-base sm:text-lg font-bold text-slate-900">
                    Verify Member Entrance
                  </h2>
                </div>
                <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2.5 py-1 rounded-md">
                  Press [Enter] to Search
                </span>
              </div>

              {/* Large, Accessible Employee ID Input Box */}
              <form onSubmit={handleManualSearch} className="space-y-3">
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Search className="h-5 w-5 text-emerald-700" />
                  </div>
                  <input
                    ref={inputRef}
                    type="text"
                    value={manualId}
                    onChange={(e) => setManualId(e.target.value)}
                    placeholder="Scan QR, or enter Pass Code, Employee ID, Name, or Phone..."
                    className="w-full pl-11 pr-24 py-3 bg-slate-50 border-2 border-slate-300 hover:border-emerald-600 focus:border-[#00843D] focus:bg-white rounded-lg text-sm sm:text-base font-mono text-slate-900 placeholder-slate-400 focus:outline-none transition-all shadow-inner"
                  />
                  {manualId && (
                    <button
                      type="button"
                      onClick={() => {
                        setManualId('');
                        setVerification(null);
                        inputRef.current?.focus();
                      }}
                      className="absolute inset-y-0 right-14 pr-2 flex items-center text-slate-400 hover:text-slate-600 cursor-pointer"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={isVerifying || !manualId.trim()}
                    className="absolute inset-y-1.5 right-1.5 px-4 bg-[#00843D] hover:bg-[#0B6B3A] text-white text-xs font-bold rounded-[6px] transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <>
                        <span>Check</span>
                        <ArrowRight className="h-3.5 w-3.5" />
                      </>
                    )}
                  </button>
                </div>
              </form>

              {/* Quick Demo Shortcuts */}
              <div className="pt-2 flex items-center gap-2 text-[11px] text-slate-500 flex-wrap">
                <span className="font-semibold text-slate-400">Quick Test:</span>
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-001');
                    handleVerify({ employeeId: 'EMP-MOA-001' });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-mono text-[10px] text-slate-600 border border-slate-200 cursor-pointer"
                >
                  EMP-MOA-001 (Dawit)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-002');
                    handleVerify({ employeeId: 'EMP-MOA-002' });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-mono text-[10px] text-slate-600 border border-slate-200 cursor-pointer"
                >
                  EMP-MOA-002 (Tigist)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setManualId('EMP-MOA-003');
                    handleVerify({ employeeId: 'EMP-MOA-003' });
                  }}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-emerald-50 hover:text-emerald-800 rounded font-mono text-[10px] text-slate-600 border border-slate-200 cursor-pointer"
                >
                  EMP-MOA-003 (Abebe)
                </button>
              </div>
            </div>
          </div>

          {/* VERIFICATION RESULT CARD (Appears when an ID is checked) */}
          {verification && (
            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-xs space-y-4 animate-in fade-in zoom-in-95 duration-150">
              {/* Status Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                <span className="text-xs font-bold text-slate-700">Gate Verification Result:</span>

                {verification.status === 'READY_FOR_CHECKIN' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-50 text-[#00843D] border border-emerald-300">
                    <CheckCircle2 className="h-4 w-4 text-[#00843D]" />
                    ELIGIBLE · READY FOR CHECK-IN
                  </span>
                )}

                {verification.status === 'ALREADY_CHECKED_IN' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-900 border border-amber-300">
                    <AlertTriangle className="h-4 w-4 text-amber-700" />
                    CURRENTLY INSIDE GYMNASIUM
                  </span>
                )}

                {verification.status === 'UNREGISTERED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-800 border border-amber-200">
                    <UserX className="h-4 w-4 text-amber-600" />
                    NOT ENROLLED IN GYM
                  </span>
                )}

                {verification.status === 'DENIED' && (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-300">
                    <XCircle className="h-4 w-4" />
                    DENIED: {verification.reason}
                  </span>
                )}
              </div>

              {/* Staff Profile Photo & Details */}
              {verification.employee ? (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-start gap-4">
                  {verification.employee.photoUrl ? (
                    <img
                      src={verification.employee.photoUrl}
                      alt={verification.employee.fullName}
                      className="h-16 w-16 rounded-xl object-cover ring-2 ring-emerald-500/20 shrink-0"
                    />
                  ) : (
                    <div className="h-16 w-16 rounded-xl bg-emerald-100 text-[#00843D] flex items-center justify-center font-bold text-2xl shrink-0">
                      {verification.employee.fullName.charAt(0)}
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-bold text-slate-900 truncate">
                      {verification.employee.fullName}
                    </h3>
                    <p className="text-xs font-medium text-slate-600 mt-0.5">
                      {verification.employee.department}
                    </p>
                    <div className="flex flex-wrap items-center gap-2 mt-2 text-xs font-mono">
                      <span className="bg-white border border-slate-200 px-2 py-0.5 rounded text-slate-700 font-bold">
                        {verification.employee.employeeId}
                      </span>
                      <span className="text-emerald-700 font-sans font-semibold">
                        ● {verification.employee.employmentStatus || 'Active MoA Staff'}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-xs text-red-800">
                  {verification.message || 'No employee record found for this search.'}
                </div>
              )}

              {/* ACTION 1: Ready For Check-in */}
              {verification.status === 'READY_FOR_CHECKIN' && (
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between gap-3 bg-emerald-50/70 border border-emerald-200/80 p-3 rounded-lg text-xs">
                    <div className="flex items-center gap-2">
                      <Key className="h-4 w-4 text-[#00843D]" />
                      <span className="font-semibold text-slate-800">Assign Locker:</span>
                    </div>

                    <select
                      value={selectedLocker}
                      onChange={(e) => setSelectedLocker(e.target.value)}
                      className="px-3 py-1.5 text-xs font-mono border border-slate-300 rounded bg-white font-bold text-emerald-900 focus:outline-none focus:border-emerald-600"
                    >
                      <option value="">No Locker Key</option>
                      {(verification.availableLockers || []).map((num) => (
                        <option key={num} value={num}>
                          Locker #{num} (Available)
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    ref={confirmBtnRef}
                    type="button"
                    onClick={handleConfirmCheckIn}
                    disabled={isCheckingIn}
                    className="w-full h-11 bg-[#00843D] hover:bg-[#0B6B3A] text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <UserCheck className="h-5 w-5" />
                    <span>
                      {isCheckingIn
                        ? 'Authorizing...'
                        : `Confirm Check-In [Press Enter]`}
                    </span>
                  </button>
                </div>
              )}

              {/* ACTION 2: Already inside -> Quick Departure Check-out */}
              {verification.status === 'ALREADY_CHECKED_IN' && (
                <div className="space-y-3 pt-2">
                  <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
                    Staff member is currently checked in
                    {verification.activeAttendance?.lockerNumber && (
                      <span className="font-bold">
                        {' '}
                        · Holding Locker #{verification.activeAttendance.lockerNumber}
                      </span>
                    )}
                    . Click below to record departure.
                  </div>

                  <button
                    ref={checkoutBtnRef}
                    type="button"
                    onClick={() => {
                      if (verification.activeAttendance?.id) {
                        checkOutMutation.mutate(verification.activeAttendance.id);
                      }
                    }}
                    disabled={checkOutMutation.isPending}
                    className="w-full h-11 bg-amber-600 hover:bg-amber-700 text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    <LogOut className="h-5 w-5" />
                    <span>
                      {checkOutMutation.isPending
                        ? 'Checking out...'
                        : 'Log Departure & Free Locker [Press Enter]'}
                    </span>
                  </button>
                </div>
              )}

              {/* ACTION 3: Instant Walk-in Registration & Check-in */}
              {verification.status === 'UNREGISTERED' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
                    <UserX className="h-4 w-4 text-amber-700 shrink-0 mt-0.5" />
                    <div>
                      <p className="font-semibold">Active Employee Not Yet Enrolled in Gym</p>
                      <p className="text-[11px] text-amber-800 mt-0.5">
                        {verification.employee?.fullName} is verified on the MoA HR Roster. You can enroll and admit them to the floor immediately below.
                      </p>
                    </div>
                  </div>

                  {/* Optional Locker Assignment */}
                  <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label className="font-bold text-slate-800 flex items-center gap-1.5">
                        <Key className="w-3.5 h-3.5 text-amber-600" />
                        <span>Assign Daily Locker (Optional)</span>
                      </label>
                      <span className="text-[11px] font-mono text-slate-500">
                        {verification.availableLockers?.length ?? 0} available
                      </span>
                    </div>

                    <select
                      value={selectedLocker}
                      onChange={(e) => setSelectedLocker(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-[6px] bg-white font-mono text-slate-800 focus:outline-none focus:border-emerald-700 cursor-pointer"
                    >
                      <option value="">No Locker / Personal Bag</option>
                      {(verification.availableLockers || []).map((lock) => (
                        <option key={lock} value={lock}>
                          Locker #{lock}
                        </option>
                      ))}
                    </select>
                  </div>

                  <button
                    type="button"
                    onClick={handleQuickEnrollAndAdmit}
                    disabled={isEnrolling}
                    className="w-full h-11 bg-[#00843D] hover:bg-[#0B6B3A] text-white font-bold text-sm rounded-lg shadow-sm transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {isEnrolling ? (
                      <>
                        <RefreshCw className="h-5 w-5 animate-spin" />
                        <span>Enrolling & Authorizing Entrance...</span>
                      </>
                    ) : (
                      <>
                        <UserCheck className="h-5 w-5" />
                        <span>⚡ Instant Enroll & Admit to Gym</span>
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (5 cols): Currently Active Gymnasium Occupants */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
            {/* Header with Live Occupancy Counter */}
            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-700" />
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
                  Active In Facility ({currentCount})
                </h3>
              </div>
              <span className="text-[11px] font-mono text-emerald-800 font-bold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                {occupancyPct}% Full
              </span>
            </div>

            {/* Occupancy Progress Bar */}
            <div className="w-full bg-slate-100 h-1.5">
              <div
                className="bg-[#00843D] h-1.5 transition-all duration-300"
                style={{ width: `${occupancyPct}%` }}
              ></div>
            </div>

            {/* Occupants Roster List */}
            <div className="divide-y divide-slate-100 max-h-[520px] overflow-y-auto">
              {isOccupancyLoading ? (
                <div className="p-8 text-center text-xs text-slate-400">
                  <div className="inline-block animate-spin rounded-full h-5 w-5 border-2 border-emerald-600 border-t-transparent mb-1.5"></div>
                  <p>Loading active occupants...</p>
                </div>
              ) : (occupancy?.activeUsers || []).length === 0 ? (
                <div className="p-8 text-center">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2 text-slate-400">
                    <Users className="w-5 h-5" />
                  </div>
                  <p className="text-xs font-bold text-slate-700">No staff currently inside</p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Ask arriving staff for their ID above to check them in.
                  </p>
                </div>
              ) : (
                (occupancy?.activeUsers || []).map((u) => (
                  <div
                    key={u.attendanceId}
                    className="p-3 hover:bg-slate-50/80 transition flex items-center justify-between gap-3 text-xs"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      {u.photoUrl ? (
                        <img
                          src={u.photoUrl}
                          alt={u.fullName}
                          className="h-8 w-8 rounded-full object-cover ring-1 ring-slate-200 shrink-0"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs shrink-0">
                          {u.fullName.charAt(0)}
                        </div>
                      )}
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">{u.fullName}</div>
                        <div className="text-[11px] text-slate-500 font-mono flex items-center gap-1.5">
                          <span>{u.employeeId}</span>
                          {u.lockerNumber && (
                            <span className="text-emerald-800 font-semibold bg-emerald-50 px-1 rounded">
                              Locker #{u.lockerNumber}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => checkOutMutation.mutate(u.attendanceId)}
                      disabled={checkOutMutation.isPending}
                      title="Log departure and free assigned locker"
                      className="px-2.5 h-7 text-[11px] font-semibold text-rose-700 bg-white hover:bg-rose-50 border border-rose-200 rounded-[4px] shadow-2xs transition cursor-pointer shrink-0 disabled:opacity-50"
                    >
                      Check Out
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};