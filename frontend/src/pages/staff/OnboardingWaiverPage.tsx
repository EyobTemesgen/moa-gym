import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { apiRequest } from '../../lib/api';
import { ShieldCheck, HeartPulse, AlertTriangle, CheckCircle2, FileText, ArrowRight } from 'lucide-react';

export const OnboardingWaiverPage: React.FC = () => {
  const { user, refreshProfile } = useAuth();
  const navigate = useNavigate();

  const [parq, setParq] = useState({
    chestPain: false,
    chestPainActive: false,
    dizziness: false,
    boneJointCondition: false,
    bloodPressureHeartMeds: false,
    recentSurgery: false,
    otherReason: false,
  });

  const [emergencyContactName, setEmergencyContactName] = useState('');
  const [emergencyContactPhone, setEmergencyContactPhone] = useState('');
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasAnyYes = Object.values(parq).some((v) => v === true);

  const handleParqChange = (key: keyof typeof parq, val: boolean) => {
    setParq((prev) => ({ ...prev, [key]: val }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setError('You must read and agree to the institutional liability waiver terms.');
      return;
    }
    if (!emergencyContactName.trim() || !emergencyContactPhone.trim()) {
      setError('Please provide an emergency contact name and phone number.');
      return;
    }

    setError(null);
    setIsSubmitting(true);
    try {
      await apiRequest('/users/me/waiver', {
        method: 'POST',
        body: JSON.stringify({
          parqResponses: parq,
          emergencyContactName: emergencyContactName.trim(),
          emergencyContactPhone: emergencyContactPhone.trim(),
          agreedToTerms,
        }),
      });

      await refreshProfile();
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Failed to submit health waiver.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto py-4">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Banner */}
        <div className="bg-moa-green p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/10 rounded-xl backdrop-blur-xs">
              <HeartPulse className="h-7 w-7 text-moa-gold" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">
                Staff Health Screening & Liability Waiver
              </h1>
              <p className="text-xs text-white/80 mt-0.5">
                Physical Activity Readiness Questionnaire (PAR-Q) · MoA Staff Wellness & Fitness Center
              </p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-xs text-moa-danger">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: PAR-Q Screening */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-6 w-6 rounded-full bg-emerald-100 text-moa-green font-bold text-xs flex items-center justify-center">
                1
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Physical Activity Readiness Questionnaire (PAR-Q)
              </h2>
            </div>
            <p className="text-xs text-slate-500 mb-4 pl-8">
              Regular physical activity is safe for most staff. Please answer the following questions honestly to determine if you should consult a physician before starting exercise.
            </p>

            <div className="space-y-3 pl-8">
              {[
                {
                  key: 'chestPain' as const,
                  q: '1. Has your doctor ever said that you have a heart condition and that you should only do physical activity recommended by a doctor?',
                },
                {
                  key: 'chestPainActive' as const,
                  q: '2. Do you feel pain in your chest when you engage in physical activity?',
                },
                {
                  key: 'dizziness' as const,
                  q: '3. Do you lose your balance because of dizziness or have you ever lost consciousness?',
                },
                {
                  key: 'boneJointCondition' as const,
                  q: '4. Do you have a bone or joint problem (e.g. back, knee, hip) that could be worsened by physical exertion?',
                },
                {
                  key: 'bloodPressureHeartMeds' as const,
                  q: '5. Is your doctor currently prescribing medication for high blood pressure or a heart condition?',
                },
                {
                  key: 'recentSurgery' as const,
                  q: '6. Have you undergone surgery or had any medical condition in the last 6 months requiring physical limitation?',
                },
                {
                  key: 'otherReason' as const,
                  q: '7. Do you know of any other medical reason why you should not engage in physical activity?',
                },
              ].map((item) => (
                <div
                  key={item.key}
                  className="p-3 rounded-lg border border-slate-200 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <span className="text-xs font-medium text-slate-800">{item.q}</span>
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleParqChange(item.key, false)}
                      className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition ${
                        parq[item.key] === false
                          ? 'bg-moa-green text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      NO
                    </button>
                    <button
                      type="button"
                      onClick={() => handleParqChange(item.key, true)}
                      className={`px-3 py-1 text-xs font-semibold rounded cursor-pointer transition ${
                        parq[item.key] === true
                          ? 'bg-amber-600 text-white shadow-xs'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      YES
                    </button>
                  </div>
                </div>
              ))}

              {hasAnyYes && (
                <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                  <div>
                    <span className="font-semibold block">Medical Advisory Note:</span>
                    Because you indicated "YES" to one or more questions, you are strongly advised to obtain medical consultation or clearance from a physician before undertaking vigorous workouts.
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 2: Emergency Contact */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-6 w-6 rounded-full bg-emerald-100 text-moa-green font-bold text-xs flex items-center justify-center">
                2
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Emergency Contact Details
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-8">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Person Full Name
                </label>
                <input
                  type="text"
                  required
                  value={emergencyContactName}
                  onChange={(e) => setEmergencyContactName(e.target.value)}
                  placeholder="e.g. Almaz Bekele (Spouse / Relative)"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Contact Phone Number
                </label>
                <input
                  type="text"
                  required
                  value={emergencyContactPhone}
                  onChange={(e) => setEmergencyContactPhone(e.target.value)}
                  placeholder="e.g. +251 91 123 4567"
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
                />
              </div>
            </div>
          </div>

          {/* Section 3: Liability Terms & Electronic Signature */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="h-6 w-6 rounded-full bg-emerald-100 text-moa-green font-bold text-xs flex items-center justify-center">
                3
              </span>
              <h2 className="text-sm font-bold text-slate-900">
                Ministry Liability Agreement & Electronic Signature
              </h2>
            </div>

            <div className="pl-8 space-y-4">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl max-h-48 overflow-y-auto text-xs text-slate-700 leading-relaxed space-y-2">
                <p className="font-semibold text-slate-900">
                  Federal Democratic Republic of Ethiopia — Ministry of Agriculture
                </p>
                <p>
                  1. <strong>Voluntary Participation:</strong> Access to the MoA Staff Wellness & Fitness Center is an employee wellness benefit provided by the Ministry. Participation is entirely voluntary.
                </p>
                <p>
                  2. <strong>Facility Rules:</strong> I agree to use the designated digital QR pass or employee badge for entrance, respect locker day-use protocols, observe all hygiene and safety rules, and maintain proper sports attire.
                </p>
                <p>
                  3. <strong>Acknowledgment:</strong> I assume responsibility for participating within my personal physical limits and certify that the PAR-Q information provided is accurate and true.
                </p>
              </div>

              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  required
                  checked={agreedToTerms}
                  onChange={(e) => setAgreedToTerms(e.target.checked)}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-moa-green focus:ring-moa-green"
                />
                <span className="text-xs text-slate-700 font-medium">
                  I, <strong>{user?.fullName}</strong> ({user?.employeeId}), have read, understood, and agreed to the above terms and hereby submit my electronic signature.
                </span>
              </label>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-4 border-t border-slate-200 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSubmitting || !agreedToTerms}
              className="py-2.5 px-6 bg-moa-green hover:bg-moa-green-dark text-white text-xs font-semibold rounded-lg shadow-sm transition flex items-center gap-2 disabled:opacity-50 cursor-pointer"
            >
              {isSubmitting ? 'Recording Signature...' : 'Complete & Generate QR Pass'}
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
