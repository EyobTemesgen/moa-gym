import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../../lib/auth-context';
import { MoaLogo } from '../../components/MoaLogo';
import { Lock, User, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim() || !password) return;

    setError(null);
    setIsSubmitting(true);
    try {
      const user = await login(identifier.trim(), password);
      if (user.role === 'STAFF_MEMBER') {
        if (!user.waiverSigned) {
          navigate('/waiver');
        } else {
          navigate('/dashboard');
        }
      } else {
        navigate('/terminal');
      }
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
    } finally {
      setIsSubmitting(false);
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
            MoA Staff Gym Portal
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            Ministry of Agriculture · Staff Wellness & Fitness Center
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
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-moa-green/30 focus:border-moa-green"
              />
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
            First time using the facility?
          </p>
          <Link
            to="/claim"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-moa-green hover:text-moa-green-dark transition"
          >
            Claim Account via MoA Employee ID →
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
              HR Admin
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
    </div>
  );
};
