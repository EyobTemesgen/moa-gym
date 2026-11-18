import React, { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { MoaLogo } from './MoaLogo';
import {
  Menu,
  Calendar,
  User,
  Shield,
  KeyRound,
  LogOut,
  ChevronDown,
  LayoutDashboard,
  ShieldCheck,
  UserCog,
  QrCode,
  Building2,
} from 'lucide-react';
import { getTodayGcAndEc } from '../utils/eth-date';
import { ChangePasswordModal } from './auth/ChangePasswordModal';

interface MoaHeaderProps {
  onOpenMobileSidebar?: () => void;
}

const getInitials = (name?: string): string => {
  if (!name) return 'MOA';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export const MoaHeader: React.FC<MoaHeaderProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const today = getTodayGcAndEc();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close user dropdown on outside click or escape
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setShowUserMenu(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowUserMenu(false);
      }
    };

    if (showUserMenu) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showUserMenu]);

  // Page title mapping - 100% English
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/admin/dashboard':
        return {
          title: 'Dashboard',
          subtitle: 'Staff gym executive summary and metrics',
        };
      case '/registrations':
        return {
          title: 'Staff Registrations',
          subtitle: 'Staff gym membership records and directory',
        };
      case '/admin/users':
        return {
          title: 'User Management',
          subtitle: 'System access control, role assignment, and administrative credentials',
        };
      case '/terminal':
        return {
          title: 'Gate Terminal',
          subtitle: 'Front desk access verification and check-in terminal',
        };
      case '/active-floor':
        return {
          title: 'Floor & Lockers',
          subtitle: 'Active gym floor occupants and locker inventory',
        };
      case '/reports':
      case '/admin/analytics':
        return {
          title: 'Reports',
          subtitle: 'Attendance summaries and exportable records',
        };
      case '/dashboard':
        return {
          title: 'My Entry Pass',
          subtitle: 'Personal gym access pass and membership status',
        };
      default:
        return {
          title: 'MoA Gym',
          subtitle: 'Staff Wellness Facility',
        };
    }
  };

  const { title, subtitle } = getPageTitle();
  const roleDisplay = user?.role === 'HR_ADMIN' ? 'ADMIN' : user?.role || 'STAFF';

  return (
    <>
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
        {/* Official 4px MoA Tri-Color Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-[#FCDD09] via-[#00843D] to-[#145B8C]"></div>

        <div className="px-4">
          <div className="flex items-center justify-between h-14">
            {/* Left: Mobile toggle & Breadcrumb Page Title */}
            <div className="flex items-center gap-3 min-w-0">
              {user && (
                <button
                  type="button"
                  onClick={onOpenMobileSidebar}
                  className="lg:hidden p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                  aria-label="Open navigation menu"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}

              {!user && (
                <Link to="/" className="flex items-center gap-2">
                  <MoaLogo className="h-9 w-9 shrink-0" size={36} />
                  <span className="font-bold text-xs text-slate-900">MoA Gym</span>
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

            {/* Right: Date Widget + User Account Dropdown */}
            <div className="flex items-center gap-3 shrink-0">
              {/* Ethiopian + Gregorian Date Pill */}
              <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 bg-slate-50 border border-slate-200 rounded-[4px] text-xs text-slate-600 shadow-2xs">
                <Calendar className="h-3.5 w-3.5 text-emerald-700" />
                <span className="font-medium text-slate-800">{today.gc}</span>
                <span className="text-slate-300">|</span>
                <span className="text-slate-500 font-mono text-[11px]">{today.ecFormattedEn}</span>
              </div>

              {/* User Account Trigger Button */}
              {user && (
                <div className="relative" ref={userMenuRef}>
                  <button
                    type="button"
                    onClick={() => setShowUserMenu(!showUserMenu)}
                    aria-haspopup="true"
                    aria-expanded={showUserMenu}
                    aria-label={`Account menu for ${user.fullName}`}
                    className={`flex items-center gap-2 pl-1.5 pr-2.5 py-1 rounded-full border transition cursor-pointer select-none ${
                      showUserMenu
                        ? 'bg-emerald-50 border-emerald-300 ring-2 ring-emerald-500/20'
                        : 'bg-white hover:bg-slate-50 border-slate-200 shadow-2xs'
                    }`}
                  >
                    {user.photoUrl ? (
                      <img
                        src={user.photoUrl}
                        alt={user.fullName}
                        className="h-7 w-7 rounded-full object-cover ring-1 ring-emerald-600/30 shrink-0"
                      />
                    ) : (
                      <div className="h-7 w-7 rounded-full bg-[#00843D] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-2xs">
                        {getInitials(user.fullName)}
                      </div>
                    )}

                    <div className="hidden md:flex flex-col text-left leading-tight">
                      <span className="text-xs font-bold text-slate-900 truncate max-w-[120px]">
                        {user.fullName}
                      </span>
                      <span className="text-[10px] font-mono text-slate-500">
                        {roleDisplay}
                      </span>
                    </div>

                    <ChevronDown
                      className={`h-3.5 w-3.5 text-slate-400 transition-transform ${
                        showUserMenu ? 'rotate-180 text-emerald-700' : ''
                      }`}
                    />
                  </button>

                  {/* Floating Account Dropdown (Asset Tracking System Standard) */}
                  {showUserMenu && (
                    <div
                      role="menu"
                      aria-label="User Account Menu"
                      className="absolute right-0 mt-2 w-72 bg-white rounded-xl border border-slate-200 shadow-xl z-50 overflow-hidden animate-fadeIn text-slate-800"
                    >
                      {/* Identity Card Header */}
                      <div className="p-4 bg-slate-50/90 border-b border-slate-100 flex items-start gap-3">
                        {user.photoUrl ? (
                          <img
                            src={user.photoUrl}
                            alt={user.fullName}
                            className="h-10 w-10 rounded-xl object-cover ring-2 ring-emerald-600/30 shrink-0"
                          />
                        ) : (
                          <div className="h-10 w-10 rounded-xl bg-[#00843D] text-white flex items-center justify-center font-bold text-sm shrink-0 ring-1 ring-emerald-600/30">
                            {getInitials(user.fullName)}
                          </div>
                        )}

                        <div className="min-w-0 flex-1 leading-tight">
                          <span className="block font-bold text-xs text-slate-900 truncate">
                            {user.fullName}
                          </span>
                          <span className="block text-[11px] text-slate-500 font-mono truncate mt-0.5">
                            ID: {user.employeeId}
                          </span>
                          <div className="mt-1.5 flex items-center gap-1.5 flex-wrap">
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200">
                              <Shield className="w-2.5 h-2.5 text-emerald-700" />
                              {roleDisplay}
                            </span>
                            {user.department && (
                              <span className="inline-flex items-center gap-1 text-[10px] text-slate-500 truncate">
                                <Building2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                                <span className="truncate max-w-[120px]">{user.department}</span>
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Menu Actions */}
                      <div className="p-1.5 space-y-0.5 text-xs">
                        {/* Role-Specific Shortcuts */}
                        {user.role === 'STAFF_MEMBER' && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setShowUserMenu(false);
                              navigate('/dashboard');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition cursor-pointer"
                          >
                            <QrCode className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>My Entry Pass</span>
                          </button>
                        )}

                        {user.role === 'GYM_ATTENDANT' && (
                          <button
                            type="button"
                            role="menuitem"
                            onClick={() => {
                              setShowUserMenu(false);
                              navigate('/terminal');
                            }}
                            className="w-full flex items-center gap-2.5 px-3 py-2 text-left font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0" />
                            <span>Gate Terminal</span>
                          </button>
                        )}

                        {(user.role === 'ADMIN' || user.role === 'HR_ADMIN') && (
                          <>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/admin/dashboard');
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-left font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition cursor-pointer"
                            >
                              <LayoutDashboard className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>Dashboard</span>
                            </button>
                            <button
                              type="button"
                              role="menuitem"
                              onClick={() => {
                                setShowUserMenu(false);
                                navigate('/admin/users');
                              }}
                              className="w-full flex items-center gap-2.5 px-3 py-2 text-left font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition cursor-pointer"
                            >
                              <UserCog className="w-4 h-4 text-emerald-700 shrink-0" />
                              <span>User Management</span>
                            </button>
                          </>
                        )}

                        {/* Change Password Dialog Trigger */}
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setShowUserMenu(false);
                            setIsChangePasswordOpen(true);
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left font-medium text-slate-700 hover:bg-emerald-50 hover:text-emerald-900 rounded-lg transition cursor-pointer"
                        >
                          <KeyRound className="w-4 h-4 text-emerald-700 shrink-0" />
                          <span>Change Password</span>
                        </button>
                      </div>

                      {/* Sign Out Action */}
                      <div className="p-1.5 border-t border-slate-100">
                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setShowUserMenu(false);
                            logout();
                          }}
                          className="w-full flex items-center gap-2.5 px-3 py-2 text-left font-semibold text-rose-700 hover:bg-rose-50 rounded-lg transition cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-rose-600 shrink-0" />
                          <span>Sign out</span>
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Change Password Modal */}
      <ChangePasswordModal
        isOpen={isChangePasswordOpen}
        onClose={() => setIsChangePasswordOpen(false)}
      />
    </>
  );
};
