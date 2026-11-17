import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { MoaLogo } from './MoaLogo';
import { OccupancyBanner } from './OccupancyBanner';
import { Menu, User, LogOut } from 'lucide-react';

interface MoaHeaderProps {
  onOpenMobileSidebar?: () => void;
}

export const MoaHeader: React.FC<MoaHeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();

  // Page title mapping
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/registrations':
        return 'ግብርና ሚ/ር ሰራተኞች የጂምናዚየም ተመዝጋቢዎች ስም ዝርዝር (Staff Gym Registrants Roster)';
      case '/dashboard':
        return 'Staff Dashboard & QR Entry Pass';
      case '/waiver':
        return 'Health Screening & Liability Waiver (PAR-Q)';
      case '/terminal':
        return 'Gate Verification Terminal (Camera QR)';
      case '/active-floor':
        return 'Live Floor Occupancy & Lockers';
      case '/classes':
        return 'Group Fitness Classes & Equipment Log';
      case '/admin/roster':
        return 'MoA Staff Whitelist Roster';
      case '/admin/analytics':
        return 'Facility Analytics & Utilization Reports';
      case '/admin/settings':
        return 'Institutional Facility Settings';
      default:
        return 'MoA Staff Wellness Portal';
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      {/* Official 4px MoA Tri-Color Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue"></div>

      <div className="px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14">
          {/* Left: Mobile hamburger & breadcrumb title */}
          <div className="flex items-center gap-3">
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
                <MoaLogo className="h-9 w-9" size={36} />
                <span className="font-bold text-xs text-slate-900">MoA-Gym Portal</span>
              </Link>
            )}

            {user && (
              <div>
                <h2 className="text-xs sm:text-sm font-bold text-slate-900 leading-tight">
                  {getPageTitle()}
                </h2>
              </div>
            )}
          </div>

          {/* Right: Live Occupancy Pill & User Actions */}
          <div className="flex items-center gap-3">
            <OccupancyBanner compact />

            {user ? (
              <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-bold text-slate-900 leading-none">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                    {user.employeeId}
                  </div>
                </div>

                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-moa-green/30"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 ring-1 ring-slate-200 font-bold text-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  to="/claim"
                  className="text-xs font-semibold text-moa-green hover:text-moa-green-dark px-3 py-1.5 rounded-lg hover:bg-emerald-50 transition"
                >
                  Claim Account
                </Link>
                <Link
                  to="/login"
                  className="text-xs font-semibold text-white bg-moa-green hover:bg-moa-green-dark px-3.5 py-1.5 rounded-lg shadow-xs transition"
                >
                  Log In
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
