import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { MoaLogo } from './MoaLogo';
import { OccupancyBanner } from './OccupancyBanner';
import { Menu, Calendar } from 'lucide-react';
import { getTodayGcAndEc } from '../utils/eth-date';

interface MoaHeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const MoaHeader: React.FC<MoaHeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user } = useAuth();
  const location = useLocation();
  const today = getTodayGcAndEc();

  // Page title mapping - 100% English
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/registrations':
        return {
          title: 'Staff Gym Registration Directory & Intake',
          subtitle: 'Institutional employee wellness membership roster and physical intake log',
        };
      case '/terminal':
        return {
          title: 'Gate Access Control & Check-In Terminal',
          subtitle: 'Real-time QR barcode verification, employee lookup, and capacity monitoring',
        };
      case '/reports':
      case '/admin/analytics':
        return {
          title: 'Facility Utilization & Attendance Reports',
          subtitle: 'Departmental analytics, shift distribution, and audit log exports',
        };
      case '/dashboard':
        return {
          title: 'Staff Member Digital QR Pass',
          subtitle: 'Personal gym access QR code and membership verification status',
        };
      case '/waiver':
        return {
          title: 'Physical Activity Readiness (PAR-Q) & Liability Waiver',
          subtitle: 'Annual institutional health screening compliance questionnaire',
        };
      default:
        return {
          title: 'MoA Staff Gym & Wellness Portal',
          subtitle: 'Ministry of Agriculture Institutional Wellness Facility',
        };
    }
  };

  const { title, subtitle } = getPageTitle();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Official 4px MoA Tri-Color Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-[#FCDD09] via-[#00843D] to-[#145B8C]"></div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile toggle & Breadcrumb Page Title */}
          <div className="flex items-center gap-3 min-w-0">
            {user && (
              <button
                type="button"
                onClick={onOpenMobileSidebar}
                className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition"
                aria-label="Open navigation menu"
              >
                <Menu className="h-5 w-5" />
              </button>
            )}

            {!user && (
              <Link to="/" className="flex items-center gap-2">
                <MoaLogo className="h-9 w-9 shrink-0" size={36} />
                <span className="font-bold text-xs text-slate-900">MoA Gym Portal</span>
              </Link>
            )}

            {user && (
              <div className="min-w-0">
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight truncate">
                  {title}
                </h2>
                <p className="text-[11px] text-slate-500 hidden md:block truncate">
                  {subtitle}
                </p>
              </div>
            )}
          </div>

          {/* Right: Date Widget & Live Occupancy Counter */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Ethiopian + Gregorian Date Pill */}
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-600">
              <Calendar className="h-3.5 w-3.5 text-emerald-700" />
              <span className="font-medium text-slate-800">{today.gc}</span>
              <span className="text-slate-300">|</span>
              <span className="text-slate-500 font-mono text-[11px]">{today.ecFormattedEn}</span>
            </div>

            {/* Live Occupancy Counter */}
            <OccupancyBanner compact />
          </div>
        </div>
      </div>
    </header>
  );
};
