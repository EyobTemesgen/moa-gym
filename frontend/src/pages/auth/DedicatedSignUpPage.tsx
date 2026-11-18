import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { useToast } from '../../context/ToastContext';
import { apiRequest } from '../../lib/api';
import { MoaLogo } from '../../components/MoaLogo';
import {
  ShieldCheck,
  Building2,
  Globe,
  User,
  Mail,
  Phone,
  Lock,
  Eye,
  EyeOff,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  ArrowLeft,
  Sparkles,
  DollarSign,
  CreditCard,
  Check,
  Video,
  Camera,
  Upload,
  X,
  RefreshCw,
} from 'lucide-react';

interface LockerItem {
  id: string;
  lockerNumber: string;
  status: 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE';
}

const WEEK_DAYS = [
  { key: 'MON', name: 'Mon', fullName: 'Monday' },
  { key: 'TUE', name: 'Tue', fullName: 'Tuesday' },
  { key: 'WED', name: 'Wed', fullName: 'Wednesday' },
  { key: 'THU', name: 'Thu', fullName: 'Thursday' },
  { key: 'FRI', name: 'Fri', fullName: 'Friday' },
  { key: 'SAT', name: 'Sat', fullName: 'Saturday' },
];

export const DedicatedSignUpPage: React.FC = () => {
  const { registerStaff } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  // Wizard Step: 1 = Profile, 2 = Schedule & Fee, 3 = Locker, 4 = Success
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Step 1: Member Category & Profile
  const [memberType, setMemberType] = useState<'INTERNAL' | 'EXTERNAL'>('INTERNAL');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [organization, setOrganization] = useState('');
  const [employeeId, setEmployeeId] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE'>('MALE');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Profile Photo (Camera or File Upload)
  const [photoUrl, setPhotoUrl] = useState<string>('');
  const [webcamActive, setWebcamActive] = useState<boolean>(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const videoRef = React.useRef<HTMLVideoElement>(null);

  // Step 2: Schedule & Fee
  const [shiftPreference, setShiftPreference] = useState<'MORNING' | 'EVENING'>('MORNING');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [fitnessGoal, setFitnessGoal] = useState('Cardio & Aerobics');
  const [paymentMethod, setPaymentMethod] = useState('PAYROLL_DEDUCTION');

  // Step 3: Locker & Terms
  const [wantsLocker, setWantsLocker] = useState(true);
  const [selectedLocker, setSelectedLocker] = useState<string>('');
  const [lockers, setLockers] = useState<LockerItem[]>([]);
  const [isLoadingLockers, setIsLoadingLockers] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  // Field Validation & Touched State
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Departments & Metadata
  const [departments, setDepartments] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Result after registration
  const [registrationResult, setRegistrationResult] = useState<any | null>(null);

  // Load official MoA directorates on mount
  useEffect(() => {
    apiRequest<string[]>('/auth/departments')
      .then((data) => {
        setDepartments(data);
        if (data.length > 0 && !department) {
          setDepartment(data[0]);
        }
      })
      .catch((err) => console.error('Failed to load departments', err));
  }, []);

  // Load available lockers when entering Step 3
  useEffect(() => {
    if (step === 3 && lockers.length === 0) {
      setIsLoadingLockers(true);
      apiRequest<LockerItem[]>('/auth/available-lockers')
        .then((data) => {
          setLockers(data);
          const firstAvailable = data.find((l) => l.status === 'AVAILABLE');
          if (firstAvailable && !selectedLocker) {
            setSelectedLocker(firstAvailable.lockerNumber);
          }
        })
        .catch((err) => console.error('Failed to fetch available lockers', err))
        .finally(() => setIsLoadingLockers(false));
    }
  }, [step]);

  // Adjust payment method default when member category changes
  useEffect(() => {
    if (memberType === 'INTERNAL') {
      setPaymentMethod('PAYROLL_DEDUCTION');
    } else {
      setPaymentMethod('TELEBIRR');
    }
  }, [memberType]);

  // Clean up webcam stream on unmount
  useEffect(() => {
    return () => {
      stopWebcam();
    };
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (PNG, JPG, JPEG, WEBP).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const minDim = Math.min(img.width, img.height);
        const startX = (img.width - minDim) / 2;
        const startY = (img.height - minDim) / 2;

        canvas.width = 250;
        canvas.height = 250;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, startX, startY, minDim, minDim, 0, 0, 250, 250);
          const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
          setPhotoUrl(dataUrl);
        }
      };
      img.src = event.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const startWebcam = async () => {
    setWebcamActive(true);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 350, height: 350, facingMode: 'user' },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
    } catch (err) {
      console.warn('Webcam failed to start:', err);
      setWebcamActive(false);
      alert('Unable to access camera. Please check camera permissions or upload a photo from your device.');
    }
  };

  const stopWebcam = () => {
    if (videoRef.current?.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      stream.getTracks().forEach((track) => track.stop());
      videoRef.current.srcObject = null;
    }
    setWebcamActive(false);
  };

  const captureWebcamPhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = 250;
    canvas.height = 250;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, 250, 250);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
      setPhotoUrl(dataUrl);
    }
    stopWebcam();
  };

  // Day toggle
  const toggleDay = (dayKey: string) => {
    if (selectedDays.includes(dayKey)) {
      if (selectedDays.length === 1) return; // keep at least 1 day
      setSelectedDays(selectedDays.filter((d) => d !== dayKey));
    } else {
      setSelectedDays([...selectedDays, dayKey]);
    }
  };

  const daysPerWeek = selectedDays.length;

  // Fee calculation in ETB (Internal staff: 100% Free / Institutional Benefit; External: Paid subscription)
  const calculateFee = () => {
    if (memberType === 'INTERNAL') {
      return 0; // Free institutional wellness benefit for MoA civil servants
    }
    if (daysPerWeek <= 2) return 800;
    if (daysPerWeek === 3) return 1200;
    if (daysPerWeek === 4) return 1600;
    return 2200; // 5 or 6 days / Full Access
  };

  const monthlyFee = calculateFee();
  const perSessionEst = daysPerWeek > 0 ? Math.round(monthlyFee / (daysPerWeek * 4)) : 0;

  // Field Validation Rules
  const validateField = (name: string, value: any): string => {
    switch (name) {
      case 'firstName': {
        const val = String(value ?? '').trim();
        if (!val) return 'First name is required.';
        if (val.length < 2) return 'First name must be at least 2 characters.';
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(val)) return 'First name can only contain letters.';
        return '';
      }
      case 'lastName': {
        const val = String(value ?? '').trim();
        if (!val) return 'Last name is required.';
        if (val.length < 2) return 'Last name must be at least 2 characters.';
        if (!/^[a-zA-ZÀ-ÿ\s'-]+$/.test(val)) return 'Last name can only contain letters.';
        return '';
      }
      case 'username': {
        const val = String(value ?? '').trim();
        if (!val) return 'Username is required.';
        if (val.length < 3) return 'Username must be at least 3 characters.';
        if (!/^[a-zA-Z0-9._-]+$/.test(val)) return 'Username can only contain letters, numbers, ".", "_", or "-".';
        return '';
      }
      case 'email': {
        const val = String(value ?? '').trim();
        if (!val) return 'Email address is required.';
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(val)) return 'Please enter a valid email address (e.g. name@moa.gov.et).';
        return '';
      }
      case 'department': {
        if (memberType === 'INTERNAL' && !String(value ?? '').trim()) {
          return 'Please select your MoA Directorate / Department.';
        }
        return '';
      }
      case 'organization': {
        if (memberType === 'EXTERNAL') {
          const val = String(value ?? '').trim();
          if (!val) return 'Organization / institution name is required.';
          if (val.length < 2) return 'Organization name must be at least 2 characters.';
        }
        return '';
      }
      case 'employeeId': {
        if (memberType === 'INTERNAL') {
          const val = String(value ?? '').trim();
          if (!val) return 'Employee ID is required for MoA staff (e.g. EMP-MOA-007).';
          if (val.length < 3) return 'Employee ID must be at least 3 characters.';
        }
        return '';
      }
      case 'phone': {
        const val = String(value ?? '').trim().replace(/[\s-]/g, '');
        if (!val) return 'Phone number is required.';
        if (!/^(?:\+251|0)?[79]\d{8}$/.test(val) && !/^\+?[0-9]{9,15}$/.test(val)) {
          return 'Enter a valid mobile number (e.g. 0911234567 or +251 91 123 4567).';
        }
        return '';
      }
      case 'password': {
        const val = String(value ?? '');
        if (!val) return 'Password is required.';
        if (val.length < 6) return 'Password must be at least 6 characters.';
        if (!/(?=.*[a-zA-Z])(?=.*[0-9])/.test(val)) {
          return 'Password must contain at least one letter and one number.';
        }
        return '';
      }
      case 'confirmPassword': {
        const val = String(value ?? '');
        if (!val) return 'Please confirm your password.';
        if (val !== password) return 'Passwords do not match.';
        return '';
      }
      case 'selectedDays': {
        const days = Array.isArray(value) ? value : [];
        if (days.length === 0) return 'Please select at least 1 workout day for your weekly schedule.';
        return '';
      }
      case 'selectedLocker': {
        if (wantsLocker && !String(value ?? '').trim()) {
          return 'Please select an available locker number, or choose "Skip Locker".';
        }
        return '';
      }
      case 'termsAccepted': {
        if (!value) return 'You must agree to the Gym Trainee safety rules and code of conduct.';
        return '';
      }
      default:
        return '';
    }
  };

  const markTouched = (name: string, value: any) => {
    setTouched((prev) => ({ ...prev, [name]: true }));
    const err = validateField(name, value);
    setFieldErrors((prev) => ({ ...prev, [name]: err }));
  };

  const getInputClass = (fieldName: string) => {
    const hasError = touched[fieldName] && fieldErrors[fieldName];
    const isValid = touched[fieldName] && !fieldErrors[fieldName];
    return `w-full px-3.5 py-2.5 bg-slate-50 border rounded-xl text-sm transition-all focus:outline-none focus:ring-2 ${
      hasError
        ? 'border-rose-400 bg-rose-50/20 text-slate-900 focus:ring-rose-500 focus:border-rose-500'
        : isValid
        ? 'border-emerald-300 text-slate-900 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
        : 'border-slate-200 text-slate-900 placeholder-slate-400 focus:ring-emerald-500 focus:border-emerald-500 focus:bg-white'
    }`;
  };

  // Step 1 Validation & Pre-Check
  const handleProceedToStep2 = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const step1Fields: Record<string, any> = {
      firstName,
      lastName,
      username,
      email,
      department: memberType === 'INTERNAL' ? department : undefined,
      organization: memberType === 'EXTERNAL' ? organization : undefined,
      employeeId: memberType === 'INTERNAL' ? employeeId : undefined,
      phone,
      password,
      confirmPassword,
    };

    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    Object.entries(step1Fields).forEach(([k, v]) => {
      newTouched[k] = true;
      const err = validateField(k, v);
      if (err) newErrors[k] = err;
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setFieldErrors((prev) => ({ ...prev, ...newErrors }));

    const errorCount = Object.keys(newErrors).length;
    if (errorCount > 0) {
      const firstErrorMsg = Object.values(newErrors)[0];
      setError(firstErrorMsg);
      toast.warning('Check Required Fields', firstErrorMsg);
      return;
    }

    // Pre-check if Employee ID, Username, or Email is already registered in the system
    try {
      const params = new URLSearchParams();
      if (employeeId.trim()) params.append('employeeId', employeeId.trim());
      if (username.trim()) params.append('username', username.trim());
      if (email.trim()) params.append('email', email.trim());

      const checkRes = await apiRequest<{
        available: boolean;
        message?: string;
        conflictField?: string;
      }>(`/auth/check-availability?${params.toString()}`);

      if (checkRes && checkRes.available === false) {
        setError(checkRes.message || 'An account already exists for this ID or email. Please sign in instead.');
        toast.error('Account Already Exists', checkRes.message || 'Please sign in instead.');
        return;
      }
    } catch (err: any) {
      console.warn('Pre-check availability error:', err);
    }

    setStep(2);
  };

  // Step 2 Validation
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const err = validateField('selectedDays', selectedDays);
    if (err) {
      setFieldErrors((prev) => ({ ...prev, selectedDays: err }));
      setTouched((prev) => ({ ...prev, selectedDays: true }));
      setError(err);
      toast.warning('Schedule Incomplete', err);
      return;
    }

    setStep(3);
  };

  // Final Submission with Step 3 Validation
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const step3Fields: Record<string, any> = {
      selectedLocker: wantsLocker ? selectedLocker : undefined,
      termsAccepted,
    };

    const newErrors: Record<string, string> = {};
    const newTouched: Record<string, boolean> = {};

    Object.entries(step3Fields).forEach(([k, v]) => {
      newTouched[k] = true;
      const err = validateField(k, v);
      if (err) newErrors[k] = err;
    });

    setTouched((prev) => ({ ...prev, ...newTouched }));
    setFieldErrors((prev) => ({ ...prev, ...newErrors }));

    if (Object.keys(newErrors).length > 0) {
      const firstError = Object.values(newErrors)[0];
      setError(firstError);
      toast.warning('Terms & Agreement Required', firstError);
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        memberType,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        username: username.trim() || undefined,
        email: email.trim().toLowerCase(),
        department: memberType === 'INTERNAL' ? department : (organization.trim() || 'External Member'),
        organization: memberType === 'EXTERNAL' ? organization.trim() : 'Ministry of Agriculture',
        employeeId: employeeId.trim() || undefined,
        phone: phone.trim() || undefined,
        gender,
        password,
        shiftPreference,
        daysPerWeek,
        workoutDays: selectedDays,
        fitnessGoal,
        lockerNumber: wantsLocker && selectedLocker ? selectedLocker : undefined,
        monthlyFee,
        paymentMethod: memberType === 'INTERNAL' ? 'GOVERNMENT_BENEFIT' : paymentMethod,
        photoUrl: photoUrl.trim() || undefined,
      };

      const result = await registerStaff(payload);
      setRegistrationResult(result);
      setStep(4);
      toast.success('Registration Complete', 'Your gym membership has been created successfully!');
    } catch (err: any) {
      const errMsg = err.message || 'Failed to complete registration. Please check your information.';
      setError(errMsg);
      toast.error('Registration Failed', errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-start items-center pt-3 sm:pt-4 pb-8 px-4 sm:px-6 lg:px-8 relative">
      {/* MoA Header Badge & Branding - Matching Login Page */}
      <div className="text-center mb-3">
        <MoaLogo className="mx-auto h-12 w-12 mb-1.5" size={48} />
        <h1 className="text-xl font-bold text-slate-900 tracking-tight">
          MoA Gym Service Registration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Staff Wellness & Fitness Center · Ministry of Agriculture
        </p>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-md p-5 sm:p-6 max-w-xl w-full z-10 transition-all">
        {/* Step Progress Indicators */}
        <div className="mb-5 pb-3.5 border-b border-slate-100">
          <div className="grid grid-cols-4 gap-1.5 sm:gap-2">
            {[
              { num: 1, label: 'Profile' },
              { num: 2, label: 'Schedule & Fee' },
              { num: 3, label: 'Locker' },
              { num: 4, label: 'Complete' },
            ].map((s) => {
              const isActive = step === s.num;
              const isDone = step > s.num;
              return (
                <div key={s.num} className="flex flex-col items-center">
                  <div className="flex items-center gap-1 sm:gap-1.5 mb-1.5">
                    <span
                      className={`w-5 h-5 rounded-full flex items-center justify-center text-[11px] font-bold transition-all shrink-0 ${
                        isActive
                          ? 'bg-[#00843D] text-white shadow-2xs ring-2 ring-emerald-500/20'
                          : isDone
                          ? 'bg-emerald-100 text-[#00843D] font-bold'
                          : 'bg-slate-100 text-slate-400 font-medium'
                      }`}
                    >
                      {isDone ? '✓' : s.num}
                    </span>
                    <span
                      className={`text-xs sm:text-sm transition-colors truncate ${
                        isActive
                          ? 'text-[#00843D] font-bold'
                          : isDone
                          ? 'text-slate-700 font-semibold'
                          : 'text-slate-400 font-medium'
                      }`}
                    >
                      {s.label}
                    </span>
                  </div>
                  <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-300 ${
                        isActive || isDone ? 'bg-[#00843D]' : 'bg-transparent'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert with Sign In CTA */}
        {error && (
          <div className="mb-4 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 text-xs rounded-xl shadow-2xs">
            <div className="flex items-start gap-2.5">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold">{error}</p>
                {(error.toLowerCase().includes('already exists') ||
                  error.toLowerCase().includes('sign in instead') ||
                  error.toLowerCase().includes('already taken')) && (
                  <div className="mt-2.5 flex items-center gap-2 flex-wrap">
                    <Link
                      to="/login"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#00843D] hover:bg-[#007033] text-white text-xs font-bold rounded-lg shadow-xs transition cursor-pointer"
                    >
                      <span>Sign In Instead</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                    <span className="text-[11px] text-slate-500">
                      Already registered? Log in with your Employee ID, username, or email.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* STEP 1: ACCOUNT CREATION */}
        {step === 1 && (
          <form onSubmit={handleProceedToStep2} className="space-y-3">
            <div className="flex items-center justify-between border-b border-slate-100 pb-2 mb-1">
              <h2 className="text-base font-bold text-slate-900 tracking-tight">Create an Account</h2>
              <span className="text-[11px] text-slate-400">MoA Staff & Community Registration</span>
            </div>

            {/* Member Category Segmented Toggle */}
            <div className="space-y-1">
              <label className="block text-[11px] font-semibold text-slate-700 uppercase tracking-wider">
                Membership Category <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 rounded-xl">
                <button
                  type="button"
                  onClick={() => setMemberType('INTERNAL')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                    memberType === 'INTERNAL'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-emerald-600" />
                  <span>MoA Staff Member</span>
                </button>
                <button
                  type="button"
                  onClick={() => setMemberType('EXTERNAL')}
                  className={`flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold rounded-lg transition-all ${
                    memberType === 'EXTERNAL'
                      ? 'bg-white text-emerald-800 shadow-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Globe className="w-3.5 h-3.5 text-teal-600" />
                  <span>External Member</span>
                </button>
              </div>
            </div>

            {/* Member Profile Photo Section (Take with Camera or Attach Photo) */}
            <div className="bg-slate-50 border border-slate-200/90 rounded-xl p-3 sm:p-3.5 space-y-2.5">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  {photoUrl ? (
                    <img
                      src={photoUrl}
                      alt="Profile Preview"
                      className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl object-cover ring-2 ring-[#00843D] shadow-xs"
                    />
                  ) : (
                    <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-emerald-100/80 text-[#00843D] flex items-center justify-center font-bold text-xl border border-emerald-200 shadow-2xs">
                      <User className="w-7 h-7 sm:w-8 sm:h-8 text-[#00843D]" />
                    </div>
                  )}
                  {photoUrl && (
                    <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#00843D] text-white rounded-full shadow-2xs">
                      <Check className="w-3 h-3" />
                    </span>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-xs">
                      Profile Photo
                    </span>
                    <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100/80 px-2 py-0.5 rounded-full">
                      Pass & Gate Verification
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Take a live photo with your camera or attach an image from your device.
                  </p>

                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />

                    <button
                      type="button"
                      onClick={webcamActive ? stopWebcam : startWebcam}
                      className="px-2.5 py-1 text-xs font-semibold text-white bg-[#00843D] hover:bg-[#0B6B3A] rounded-[6px] shadow-xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>{webcamActive ? 'Cancel Camera' : 'Take with Camera'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-100 border border-slate-300 rounded-[6px] shadow-2xs transition cursor-pointer flex items-center gap-1.5"
                    >
                      <Upload className="w-3.5 h-3.5 text-slate-500" />
                      <span>Attach Photo</span>
                    </button>

                    {photoUrl && (
                      <button
                        type="button"
                        onClick={() => setPhotoUrl('')}
                        className="text-xs text-rose-600 hover:text-rose-800 hover:underline cursor-pointer ml-1"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {/* Webcam Live Capture Viewfinder */}
              {webcamActive && (
                <div className="p-3 bg-slate-900 rounded-xl flex flex-col items-center gap-2.5 text-white animate-fadeIn">
                  <div className="text-xs font-semibold flex items-center gap-1.5 text-emerald-400">
                    <Camera className="w-3.5 h-3.5" />
                    <span>Live Camera Viewfinder</span>
                  </div>
                  <div className="relative w-44 h-44 rounded-xl overflow-hidden border-2 border-emerald-500/50 shadow-inner bg-black">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      muted
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={captureWebcamPhoto}
                      className="px-4 py-1.5 bg-[#00843D] hover:bg-[#0B6B3A] text-white text-xs font-bold rounded-[6px] shadow-xs cursor-pointer flex items-center gap-1.5"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Capture Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={stopWebcam}
                      className="px-3 py-1.5 bg-slate-700 hover:bg-slate-600 text-white text-xs font-semibold rounded-[6px] cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* First Name & Last Name (2 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Abebe"
                  value={firstName}
                  onChange={(e) => {
                    setFirstName(e.target.value);
                    if (touched.firstName) {
                      setFieldErrors((prev) => ({ ...prev, firstName: validateField('firstName', e.target.value) }));
                    }
                  }}
                  onBlur={(e) => markTouched('firstName', e.target.value)}
                  className={getInputClass('firstName')}
                />
                {touched.firstName && fieldErrors.firstName && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.firstName}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Kebede"
                  value={lastName}
                  onChange={(e) => {
                    setLastName(e.target.value);
                    if (touched.lastName) {
                      setFieldErrors((prev) => ({ ...prev, lastName: validateField('lastName', e.target.value) }));
                    }
                  }}
                  onBlur={(e) => markTouched('lastName', e.target.value)}
                  className={getInputClass('lastName')}
                />
                {touched.lastName && fieldErrors.lastName && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.lastName}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="e.g. staff.member"
                value={username}
                onChange={(e) => {
                  setUsername(e.target.value);
                  if (touched.username) {
                    setFieldErrors((prev) => ({ ...prev, username: validateField('username', e.target.value) }));
                  }
                }}
                onBlur={(e) => markTouched('username', e.target.value)}
                className={getInputClass('username')}
              />
              {touched.username && fieldErrors.username ? (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.username}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Used for sign-in and personalized member identification.
                </p>
              )}
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                placeholder="e.g. member@moa.gov.et or staff@gmail.com"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (touched.email) {
                    setFieldErrors((prev) => ({ ...prev, email: validateField('email', e.target.value) }));
                  }
                }}
                onBlur={(e) => markTouched('email', e.target.value)}
                className={getInputClass('email')}
              />
              {touched.email && fieldErrors.email && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.email}</span>
                </p>
              )}
            </div>

            {/* Department (if Internal) or Organization (if External) */}
            {memberType === 'INTERNAL' ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Directorate / Department <span className="text-red-500">*</span>
                </label>
                <select
                  value={department}
                  onChange={(e) => {
                    setDepartment(e.target.value);
                    if (touched.department) {
                      setFieldErrors((prev) => ({ ...prev, department: validateField('department', e.target.value) }));
                    }
                  }}
                  onBlur={(e) => markTouched('department', e.target.value)}
                  className={getInputClass('department')}
                >
                  <option value="">Select your directorate / department...</option>
                  {departments.map((dept) => (
                    <option key={dept} value={dept}>
                      {dept}
                    </option>
                  ))}
                  {departments.length === 0 && (
                    <option value="General MoA Staff">Ministry of Agriculture General Staff</option>
                  )}
                </select>
                {touched.department && fieldErrors.department && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.department}</span>
                  </p>
                )}
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Organization / Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. UNDP Ethiopia, Private, or Community Member"
                  value={organization}
                  onChange={(e) => {
                    setOrganization(e.target.value);
                    if (touched.organization) {
                      setFieldErrors((prev) => ({ ...prev, organization: validateField('organization', e.target.value) }));
                    }
                  }}
                  onBlur={(e) => markTouched('organization', e.target.value)}
                  className={getInputClass('organization')}
                />
                {touched.organization && fieldErrors.organization && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.organization}</span>
                  </p>
                )}
              </div>
            )}

            {/* Employee ID & Phone (2 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {memberType === 'INTERNAL' ? (
                    <>
                      Employee ID <span className="text-red-500">*</span>
                    </>
                  ) : (
                    'National / Kebele ID (Optional)'
                  )}
                </label>
                <input
                  type="text"
                  placeholder={memberType === 'INTERNAL' ? 'e.g. EMP-MOA-007' : 'e.g. ID-89472'}
                  value={employeeId}
                  onChange={(e) => {
                    setEmployeeId(e.target.value);
                    if (touched.employeeId) {
                      setFieldErrors((prev) => ({ ...prev, employeeId: validateField('employeeId', e.target.value) }));
                    }
                  }}
                  onBlur={(e) => markTouched('employeeId', e.target.value)}
                  className={getInputClass('employeeId')}
                />
                {touched.employeeId && fieldErrors.employeeId && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.employeeId}</span>
                  </p>
                )}
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0911234567 or +251 91 123 4567"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    if (touched.phone) {
                      setFieldErrors((prev) => ({ ...prev, phone: validateField('phone', e.target.value) }));
                    }
                  }}
                  onBlur={(e) => markTouched('phone', e.target.value)}
                  className={getInputClass('phone')}
                />
                {touched.phone && fieldErrors.phone && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.phone}</span>
                  </p>
                )}
              </div>
            </div>

            {/* Password with Eye Toggle */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Password <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="At least 6 characters (letters & numbers)"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (touched.password) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        password: validateField('password', e.target.value),
                        ...(touched.confirmPassword
                          ? { confirmPassword: e.target.value === confirmPassword ? '' : 'Passwords do not match.' }
                          : {}),
                      }));
                    }
                  }}
                  onBlur={(e) => markTouched('password', e.target.value)}
                  className={`${getInputClass('password')} pr-10`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {touched.password && fieldErrors.password ? (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.password}</span>
                </p>
              ) : (
                <p className="text-[10px] text-slate-400 mt-0.5">
                  Must be at least 6 characters long and include both letters and numbers.
                </p>
              )}
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value);
                  if (touched.confirmPassword) {
                    setFieldErrors((prev) => ({
                      ...prev,
                      confirmPassword: e.target.value === password ? '' : 'Passwords do not match.',
                    }));
                  }
                }}
                onBlur={(e) => {
                  setTouched((prev) => ({ ...prev, confirmPassword: true }));
                  setFieldErrors((prev) => ({
                    ...prev,
                    confirmPassword: e.target.value === password ? '' : 'Passwords do not match.',
                  }));
                }}
                className={getInputClass('confirmPassword')}
              />
              {touched.confirmPassword && fieldErrors.confirmPassword ? (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.confirmPassword}</span>
                </p>
              ) : confirmPassword && confirmPassword === password ? (
                <p className="flex items-center gap-1 text-[11px] font-medium text-emerald-600 mt-1">
                  <Check className="w-3.5 h-3.5 shrink-0" />
                  <span>Passwords match</span>
                </p>
              ) : null}
            </div>

            {/* Submit Button (Matching Green "Request Account" button) */}
            <div className="pt-2">
              <button
                type="submit"
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Continue to Gym Schedule & Fee</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 2: SCHEDULE, SHIFT & DYNAMIC FEE CALCULATION */}
        {step === 2 && (
          <form onSubmit={handleProceedToStep3} className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gym Schedule & Fee Calculation</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Select your preferred workout shift and target weekly frequency to calculate your membership fee.
              </p>
            </div>

            {/* Shift Preference Selector */}
            <div className="space-y-2">
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                Workout Shift <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setShiftPreference('MORNING')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    shiftPreference === 'MORNING'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 bg-emerald-100 rounded-lg text-emerald-800 shrink-0">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Morning Shift</div>
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">06:00 AM – 08:30 AM</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Pre-work fitness & power training</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setShiftPreference('EVENING')}
                  className={`p-3.5 rounded-xl border text-left transition-all flex items-start gap-3 ${
                    shiftPreference === 'EVENING'
                      ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                      : 'border-slate-200 bg-white hover:border-slate-300'
                  }`}
                >
                  <div className="p-2 bg-teal-100 rounded-lg text-teal-800 shrink-0">
                    <Calendar className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-slate-900">Evening Shift</div>
                    <div className="text-xs text-teal-700 font-semibold mt-0.5">05:30 PM – 09:00 PM</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">Post-work fitness & conditioning</div>
                  </div>
                </button>
              </div>
            </div>

            {/* Preferred Workout Days Picker */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider">
                  Target Workout Days
                </label>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-100">
                  {daysPerWeek} days / week
                </span>
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {WEEK_DAYS.map((d) => {
                  const isChecked = selectedDays.includes(d.key);
                  return (
                    <button
                      key={d.key}
                      type="button"
                      onClick={() => toggleDay(d.key)}
                      className={`py-2 px-2 rounded-xl text-center border text-xs font-semibold transition-all cursor-pointer ${
                        isChecked
                          ? 'bg-[#00843D] text-white border-[#00843D] shadow-xs'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{d.name}</div>
                      <div className={`text-[10px] ${isChecked ? 'text-emerald-100' : 'opacity-75'}`}>{d.key}</div>
                    </button>
                  );
                })}
              </div>
              {touched.selectedDays && fieldErrors.selectedDays && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.selectedDays}</span>
                </p>
              )}
            </div>

            {/* Dynamic Fee & Payment Card (Internal: 100% Free Staff Benefit; External: Paid Subscription) */}
            {memberType === 'INTERNAL' ? (
              <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/90 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900 uppercase tracking-wider flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-700" />
                    MoA Staff Wellness Benefit
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-900 border border-emerald-200">
                    100% Free · Institutional Sponsorship
                  </span>
                </div>

                <div className="flex items-baseline justify-between bg-white p-3.5 rounded-xl border border-emerald-100 shadow-xs">
                  <div>
                    <div className="text-2xl font-extrabold text-emerald-800">
                      0 <span className="text-sm font-bold text-emerald-600">ETB / Month</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      Provided at no cost to Ministry of Agriculture employees. No payment or deduction required.
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-medium text-slate-500">Locker Access</div>
                    <div className="text-xs font-bold text-emerald-700">Included Free</div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <DollarSign className="w-4 h-4 text-emerald-700" />
                    Calculated Monthly Fee
                  </span>
                  <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100/80 text-amber-900 border border-amber-200">
                    External Standard Rate
                  </span>
                </div>

                <div className="flex items-baseline justify-between bg-white p-3.5 rounded-xl border border-slate-200 shadow-xs">
                  <div>
                    <div className="text-2xl font-extrabold text-slate-900">
                      {monthlyFee.toLocaleString()}{' '}
                      <span className="text-sm font-bold text-emerald-700">ETB / Month</span>
                    </div>
                    <div className="text-[11px] text-slate-500 mt-0.5">
                      {daysPerWeek} days per week (~{perSessionEst} ETB per workout session)
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[11px] font-medium text-slate-500">Locker Access</div>
                    <div className="text-xs font-bold text-emerald-700">Included Free</div>
                  </div>
                </div>

                {/* Payment Method Selector for External Members */}
                <div>
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                    Preferred Payment Method
                  </label>
                  <select
                    value={paymentMethod}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="TELEBIRR">Telebirr Direct</option>
                    <option value="CBE_BIRR">Commercial Bank of Ethiopia (CBE Birr)</option>
                    <option value="CASH_DESK">Gym Front Desk Cash / Receipt</option>
                  </select>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Continue to Locker Assignment</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 3: LOCKER ASSIGNMENT */}
        {step === 3 && (
          <form onSubmit={handleFinalSubmit} className="space-y-5">
            <div className="border-b border-slate-100 pb-3">
              <h2 className="text-xl font-bold text-slate-900 tracking-tight">Gym Locker Assignment</h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Reserve an individual secure locker for storing gym attire, footwear, and personal gear.
              </p>
            </div>

            {/* Locker Choice Radio */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setWantsLocker(true)}
                className={`p-3 rounded-xl border text-left transition-all ${
                  wantsLocker
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">🗄️ Reserve a Locker</div>
                <div className="text-[11px] text-slate-500 mt-0.5">Assign an individual secure locker</div>
              </button>

              <button
                type="button"
                onClick={() => {
                  setWantsLocker(false);
                  setSelectedLocker('');
                }}
                className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                  !wantsLocker
                    ? 'border-emerald-600 bg-emerald-50/60 ring-2 ring-emerald-500/20'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <div className="text-xs font-bold text-slate-900">🚫 Skip Locker for Now</div>
                <div className="text-[11px] text-slate-500 mt-0.5">No locker required at this time</div>
              </button>
            </div>

            {/* Interactive Locker Grid */}
            {wantsLocker && (
              <div className="space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">
                    Select Locker ({selectedLocker ? `Selected: ${selectedLocker}` : 'Choose from available'})
                  </span>
                  <div className="flex items-center gap-3 text-[11px] text-slate-500">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block" /> Available
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-slate-300 inline-block" /> Occupied
                    </span>
                  </div>
                </div>

                {isLoadingLockers ? (
                  <div className="py-8 text-center text-xs text-slate-500">Loading locker map...</div>
                ) : (
                  <div className="grid grid-cols-5 sm:grid-cols-6 gap-2 max-h-56 overflow-y-auto p-2 bg-slate-50 rounded-xl border border-slate-200">
                    {lockers.map((l) => {
                      const isAvailable = l.status === 'AVAILABLE';
                      const isSelected = selectedLocker === l.lockerNumber;

                      return (
                        <button
                          key={l.id}
                          type="button"
                          disabled={!isAvailable}
                          onClick={() => setSelectedLocker(l.lockerNumber)}
                          className={`py-2 px-1 text-center rounded-lg text-xs font-bold border transition-all ${
                            isSelected
                              ? 'bg-emerald-700 text-white border-emerald-800 shadow-sm ring-2 ring-emerald-500/40'
                              : isAvailable
                              ? 'bg-white text-emerald-800 border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50'
                              : 'bg-slate-200/60 text-slate-400 border-slate-200 cursor-not-allowed opacity-60'
                          }`}
                        >
                          <div>{l.lockerNumber}</div>
                        </button>
                      );
                    })}
                  </div>
                )}
                {touched.selectedLocker && fieldErrors.selectedLocker && (
                  <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1">
                    <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                    <span>{fieldErrors.selectedLocker}</span>
                  </p>
                )}
              </div>
            )}

            {/* Terms / Waiver Check */}
            <div>
              <label className="flex items-start gap-3 p-3.5 bg-emerald-50/70 border border-emerald-200/90 rounded-xl cursor-pointer hover:bg-emerald-50 transition select-none">
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (touched.termsAccepted) {
                      setFieldErrors((prev) => ({
                        ...prev,
                        termsAccepted: validateField('termsAccepted', e.target.checked),
                      }));
                    }
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-[#00843D] focus:ring-[#00843D] cursor-pointer"
                />
                <div className="text-xs text-slate-700 leading-relaxed">
                  <strong className="text-slate-900">Gym Trainee Safety & Conduct Agreement:</strong> I confirm physical fitness readiness and agree to observe the Ministry of Agriculture Fitness Center facility rules, locker protocols, shift hours, and hygiene regulations.
                </div>
              </label>
              {touched.termsAccepted && fieldErrors.termsAccepted && (
                <p className="flex items-center gap-1 text-[11px] font-medium text-rose-600 mt-1.5">
                  <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                  <span>{fieldErrors.termsAccepted}</span>
                </p>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-60"
              >
                <span>{isSubmitting ? 'Registering...' : 'Complete Registration & Sign Up'}</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </form>
        )}

        {/* STEP 4: SUCCESS & ONBOARDING CONFIRMATION */}
        {step === 4 && registrationResult && (
          <div className="space-y-6 text-center py-2">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-700 rounded-2xl mx-auto flex items-center justify-center shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>

            <div>
              <h2 className="text-2xl font-bold text-slate-900">Welcome to MoA Gym!</h2>
              <p className="text-xs text-slate-500 mt-1">
                Your self-service registration has been activated. You are now an official member.
              </p>
            </div>

            {/* Summary Credentials Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 text-left space-y-2.5 text-xs">
              {(photoUrl || registrationResult.user?.photoUrl) && (
                <div className="flex items-center gap-3 pb-2.5 border-b border-slate-200/80">
                  <img
                    src={photoUrl || registrationResult.user?.photoUrl}
                    alt="Member"
                    className="w-12 h-12 rounded-xl object-cover ring-2 ring-[#00843D] shadow-xs shrink-0"
                  />
                  <div>
                    <div className="font-bold text-slate-900 text-xs">{registrationResult.user?.fullName}</div>
                    <div className="text-[11px] text-emerald-800 font-medium">Digital Gate Pass Photo Attached</div>
                  </div>
                </div>
              )}
              <div className="flex items-center justify-between pb-2 border-b border-slate-200/80">
                <span className="text-slate-500">Official Reg Number:</span>
                <span className="font-mono font-bold text-emerald-800 text-sm">
                  REG-{String(registrationResult.registration?.regNumber || '001').padStart(4, '0')}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Member Name:</span>
                <span className="font-semibold text-slate-900">{registrationResult.user?.fullName}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Category / Affiliation:</span>
                <span className="font-semibold text-slate-800">
                  {registrationResult.registration?.memberType === 'INTERNAL'
                    ? 'MoA Staff'
                    : 'External Member'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Selected Shift:</span>
                <span className="font-semibold text-slate-800">
                  {registrationResult.registration?.shiftPreference === 'MORNING'
                    ? 'Morning Shift (6:00 AM – 8:30 AM)'
                    : 'Evening Shift (5:30 PM – 9:00 PM)'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Workout Schedule:</span>
                <span className="font-semibold text-slate-800">
                  {registrationResult.registration?.daysPerWeek} Days / Week
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Monthly Fee:</span>
                <span className="font-bold text-emerald-700">
                  {registrationResult.registration?.memberType === 'INTERNAL'
                    ? 'Free (MoA Institutional Benefit)'
                    : `${registrationResult.registration?.monthlyFee} ETB / Month`}
                </span>
              </div>
              {registrationResult.registration?.lockerNumber && (
                <div className="flex items-center justify-between pt-2 border-t border-slate-200/80">
                  <span className="text-slate-500">Assigned Locker:</span>
                  <span className="font-bold text-emerald-800">
                    Locker {registrationResult.registration?.lockerNumber}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Action Navigation */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="w-full py-3 px-4 bg-emerald-700 hover:bg-emerald-800 text-white font-semibold text-sm rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Go to Staff Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => navigate('/guides')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Video className="w-4 h-4 text-emerald-700" />
                  <span>Exercise Videos</span>
                </button>
                <button
                  type="button"
                  onClick={() => navigate('/schedule')}
                  className="py-2.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  <span>Gym Schedule</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Persistent "Already have an account? Sign in" Footer across Steps 1, 2, and 3 */}
        {step < 4 && (
          <div className="mt-5 pt-3.5 border-t border-slate-100 text-center">
            <p className="text-xs text-slate-600">
              Already have an account?{' '}
              <Link to="/login" className="font-bold text-[#00843D] hover:text-[#007033] hover:underline">
                Sign in &rarr;
              </Link>
            </p>
          </div>
        )}
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-emerald-200/70 z-10">
        Federal Democratic Republic of Ethiopia Ministry of Agriculture &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};
