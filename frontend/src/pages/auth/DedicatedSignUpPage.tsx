import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
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

  // Step 2: Schedule & Fee
  const [shiftPreference, setShiftPreference] = useState<'MORNING' | 'EVENING'>('MORNING');
  const [selectedDays, setSelectedDays] = useState<string[]>(['MON', 'WED', 'FRI']);
  const [fitnessGoal, setFitnessGoal] = useState('Cardio & Aerobics');
  const [paymentMethod, setPaymentMethod] = useState('PAYROLL_DEDUCTION');

  // Step 3: Locker
  const [wantsLocker, setWantsLocker] = useState(true);
  const [selectedLocker, setSelectedLocker] = useState<string>('');
  const [lockers, setLockers] = useState<LockerItem[]>([]);
  const [isLoadingLockers, setIsLoadingLockers] = useState(false);

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

  // Fee calculation in ETB
  const calculateFee = () => {
    if (memberType === 'EXTERNAL') {
      if (daysPerWeek <= 2) return 800;
      if (daysPerWeek === 3) return 1200;
      if (daysPerWeek === 4) return 1600;
      return 2200; // 5 or 6 days / Full Access
    } else {
      if (daysPerWeek <= 2) return 250;
      if (daysPerWeek === 3) return 350;
      if (daysPerWeek === 4) return 450;
      return 600; // 5 or 6 days / Full Access
    }
  };

  const monthlyFee = calculateFee();
  const perSessionEst = Math.round(monthlyFee / (daysPerWeek * 4));

  // Step 1 Validation
  const handleProceedToStep2 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!firstName.trim() || !lastName.trim()) {
      setError('Please enter both your First Name and Last Name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (memberType === 'INTERNAL' && !department) {
      setError('Please select your MoA Directorate / Department.');
      return;
    }
    if (memberType === 'EXTERNAL' && !organization.trim()) {
      setError('Please state your organization, company, or "Individual Member".');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match. Please verify.');
      return;
    }

    setStep(2);
  };

  // Step 2 Validation
  const handleProceedToStep3 = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (selectedDays.length === 0) {
      setError('Please select at least 1 workout day.');
      return;
    }
    setStep(3);
  };

  // Final Submission
  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
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
        paymentMethod,
      };

      const result = await registerStaff(payload);
      setRegistrationResult(result);
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Failed to complete registration. Please check your information.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0c3924] via-[#115033] to-[#0a2f1c] flex flex-col justify-start items-center pt-2 sm:pt-3 pb-6 px-4 sm:px-6 lg:px-8 selection:bg-emerald-500 selection:text-white relative">
      {/* Background Decorative Rings */}
      <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* MoA Header Badge & Branding - Compact Bar */}
      <div className="flex items-center justify-center gap-2 mb-2 z-10 text-center">
        <div className="w-7 h-7 bg-white rounded-lg shadow-sm flex items-center justify-center border border-emerald-100/50">
          <ShieldCheck className="w-4 h-4 text-emerald-700" />
        </div>
        <h1 className="text-sm sm:text-base font-bold tracking-tight text-white drop-shadow-sm">
          MoA Wellness & Fitness Center
        </h1>
        <span className="text-[11px] text-emerald-200/80 font-medium hidden sm:inline">
          · Ministry of Agriculture
        </span>
      </div>

      {/* Main Container Card */}
      <div className="bg-white rounded-2xl shadow-2xl p-4 sm:p-5 max-w-xl w-full border border-slate-100 z-10 transition-all">
        {/* Step Progress Indicators */}
        <div className="mb-3">
          <div className="flex items-center justify-between text-[11px] font-semibold text-slate-500 mb-1">
            <span className={step >= 1 ? 'text-emerald-700 font-bold' : ''}>1. Profile</span>
            <span className={step >= 2 ? 'text-emerald-700 font-bold' : ''}>2. Schedule & Fee</span>
            <span className={step >= 3 ? 'text-emerald-700 font-bold' : ''}>3. Locker</span>
            <span className={step >= 4 ? 'text-emerald-700 font-bold' : ''}>4. Complete</span>
          </div>
          <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden flex">
            <div
              className="bg-emerald-600 h-full transition-all duration-300"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-3 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-xl flex items-start gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
            <span>{error}</span>
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

            {/* First Name & Last Name (2 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  First Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Eyob"
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Last Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Temesgen"
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Username */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Username <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                placeholder="e.g. eyob-moa"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                placeholder="e.g. eyobatem@gmail.com or name@moa.gov.et"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
            </div>

            {/* Department (if Internal) or Organization (if External) */}
            {memberType === 'INTERNAL' ? (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Directorate / Department <span className="text-red-500">*</span>
                </label>
                <select
                  required
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
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
              </div>
            ) : (
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Organization / Institution <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. UNDP Ethiopia, Private, or Community Member"
                  value={organization}
                  onChange={(e) => setOrganization(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
            )}

            {/* Employee ID & Phone (2 Cols) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  {memberType === 'INTERNAL' ? 'Employee ID' : 'National / Kebele ID'}
                </label>
                <input
                  type="text"
                  placeholder={memberType === 'INTERNAL' ? 'e.g. EMP-MOA-007' : 'e.g. ID-89472'}
                  value={employeeId}
                  onChange={(e) => setEmployeeId(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Phone Number
                </label>
                <input
                  type="tel"
                  placeholder="e.g. 0927847332"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
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
                  required
                  placeholder="Min. 6 characters"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-3.5 py-2.5 pr-10 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm Password */}
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">
                Confirm Password <span className="text-red-500">*</span>
              </label>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="Re-enter password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:bg-white transition-all"
              />
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

            {/* Sign in footer */}
            <div className="text-center pt-2">
              <p className="text-xs text-slate-600">
                Already have an account?{' '}
                <Link to="/login" className="font-semibold text-emerald-700 hover:underline">
                  Sign in
                </Link>
              </p>
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
                    <div className="text-xs text-emerald-700 font-semibold mt-0.5">05:00 AM – 07:30 AM</div>
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
                      className={`py-2 px-2 rounded-xl text-center border text-xs font-semibold transition-all ${
                        isChecked
                          ? 'bg-slate-900 text-white border-slate-900 shadow-sm'
                          : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{d.name}</div>
                      <div className="text-[10px] opacity-75">{d.key}</div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dynamic Fee Calculation Card */}
            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-emerald-700" />
                  Calculated Monthly Fee
                </span>
                <span
                  className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                    memberType === 'INTERNAL'
                      ? 'bg-emerald-100/80 text-emerald-900 border-emerald-200'
                      : 'bg-amber-100/80 text-amber-900 border-amber-200'
                  }`}
                >
                  {memberType === 'INTERNAL' ? 'MoA Subsidized Benefit' : 'External Standard Rate'}
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

              {/* Payment Method Selector */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1.5">
                  Preferred Payment Method
                </label>
                <select
                  value={paymentMethod}
                  onChange={(e) => setPaymentMethod(e.target.value)}
                  className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
                >
                  {memberType === 'INTERNAL' ? (
                    <>
                      <option value="PAYROLL_DEDUCTION">MoA Monthly Payroll Deduction</option>
                      <option value="TELEBIRR">Telebirr Direct</option>
                      <option value="CASH_DESK">Gym Front Desk Receipt</option>
                    </>
                  ) : (
                    <>
                      <option value="TELEBIRR">Telebirr Direct</option>
                      <option value="CBE_BIRR">Commercial Bank of Ethiopia (CBE Birr)</option>
                      <option value="CASH_DESK">Gym Front Desk Cash / Receipt</option>
                    </>
                  )}
                </select>
              </div>
            </div>

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
                className={`p-3 rounded-xl border text-left transition-all ${
                  !wantsLocker
                    ? 'border-slate-800 bg-slate-50 ring-2 ring-slate-400/20'
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
              </div>
            )}

            {/* Terms / Waiver Check */}
            <div className="p-3 bg-emerald-50/70 border border-emerald-100 rounded-xl text-xs text-emerald-900 leading-relaxed">
              <strong>Gym Trainee Agreement:</strong> By completing registration, you confirm physical fitness readiness
              and agree to follow the Ministry of Agriculture Fitness Center code of conduct and safety regulations.
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
                    ? 'Morning Shift (5:00 AM – 7:30 AM)'
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
                  {registrationResult.registration?.monthlyFee} ETB / Month
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
      </div>

      {/* Footer copyright */}
      <div className="mt-8 text-center text-xs text-emerald-200/70 z-10">
        Federal Democratic Republic of Ethiopia Ministry of Agriculture &copy; {new Date().getFullYear()}
      </div>
    </div>
  );
};
