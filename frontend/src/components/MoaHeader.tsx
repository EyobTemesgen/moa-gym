import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { MoaLogo } from './MoaLogo';
import { OccupancyBanner } from './OccupancyBanner';
import {
  QrCode,
  Users,
  Calendar,
  ShieldCheck,
  BarChart3,
  Settings,
  LogOut,
  User,
  ClipboardList,
} from 'lucide-react';

export const MoaHeader: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-40 shadow-xs">
      {/* Official 4px MoA Tri-Color Accent Bar */}
      <div className="h-1 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue"></div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Official Emblem & Bilingual Institutional Title */}
          <Link to="/" className="flex items-center gap-3 group">
            <MoaLogo className="h-11 w-11 transition-transform group-hover:scale-105" size={44} />
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[13px] font-bold text-moa-green tracking-tight font-sans">
                  የግብርና ሚኒስቴር
                </span>
                <span className="text-[11px] text-slate-400">|</span>
                <span className="text-[11px] font-semibold text-slate-700 tracking-wider">
                  MINISTRY OF AGRICULTURE
                </span>
              </div>
              <p className="text-xs font-semibold text-slate-900 tracking-tight">
                Staff Wellness & Fitness Center{' '}
                <span className="font-mono text-[10px] text-moa-green font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                  MoA-Gym
                </span>
              </p>
            </div>
          </Link>

          {/* Center Navigation Links */}
          {user && (
            <nav className="hidden md:flex items-center gap-1">
              {/* Staff Member Nav */}
              {user.role === 'STAFF_MEMBER' && (
                <>
                  <Link
                    to="/dashboard"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/dashboard')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <QrCode className="h-4 w-4" />
                    <span>My QR Pass</span>
                  </Link>

                  <Link
                    to="/waiver"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/waiver')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ClipboardList className="h-4 w-4" />
                    <span>PAR-Q & Waiver</span>
                    {user.waiverSigned && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                    )}
                  </Link>

                  <Link
                    to="/classes"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/classes')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Classes</span>
                  </Link>
                </>
              )}

              {/* Front Desk / Gym Attendant Nav */}
              {(user.role === 'GYM_ATTENDANT' || user.role === 'HR_ADMIN') && (
                <>
                  <Link
                    to="/terminal"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/terminal')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <ShieldCheck className="h-4 w-4" />
                    <span>Gate Terminal</span>
                  </Link>

                  <Link
                    to="/active-floor"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/active-floor')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>Active Floor</span>
                  </Link>

                  <Link
                    to="/classes"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/classes')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Calendar className="h-4 w-4" />
                    <span>Classes</span>
                  </Link>
                </>
              )}

              {/* HR Admin Exclusive Nav */}
              {user.role === 'HR_ADMIN' && (
                <>
                  <Link
                    to="/admin/roster"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/admin/roster')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Users className="h-4 w-4" />
                    <span>HR Staff Roster</span>
                  </Link>

                  <Link
                    to="/admin/analytics"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/admin/analytics')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <BarChart3 className="h-4 w-4" />
                    <span>Analytics & CSV</span>
                  </Link>

                  <Link
                    to="/admin/settings"
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      isActive('/admin/settings')
                        ? 'bg-moa-green text-white shadow-xs'
                        : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                    }`}
                  >
                    <Settings className="h-4 w-4" />
                    <span>Settings</span>
                  </Link>
                </>
              )}
            </nav>
          )}

          {/* Right Section: Compact Occupancy & User Actions */}
          <div className="flex items-center gap-3">
            <OccupancyBanner compact />

            {user ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                <div className="text-right hidden sm:block">
                  <div className="text-xs font-semibold text-slate-900 leading-tight">
                    {user.fullName}
                  </div>
                  <div className="text-[10px] text-slate-500 font-mono">
                    {user.employeeId} ·{' '}
                    <span className="font-semibold text-moa-green">{user.role}</span>
                  </div>
                </div>

                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-full object-cover ring-2 ring-moa-green/30"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 ring-1 ring-slate-200">
                    <User className="h-4 w-4" />
                  </div>
                )}

                <button
                  type="button"
                  onClick={logout}
                  title="Sign out of MoA Gym"
                  className="p-1.5 text-slate-400 hover:text-moa-danger hover:bg-red-50 rounded-lg transition"
                >
                  <LogOut className="h-4 w-4" />
                </button>
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
