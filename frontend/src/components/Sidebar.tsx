import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { MoaLogo } from './MoaLogo';
import {
  QrCode,
  ShieldCheck,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LayoutDashboard,
  UserCog,
  Settings,
  Flame,
  LogOut,
  Calendar,
  Video,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

const getInitials = (name?: string): string => {
  if (!name) return 'MOA';
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const isSettingsActive =
    location.pathname === '/registrations' ||
    location.pathname === '/admin/users';

  const [settingsOpen, setSettingsOpen] = useState<boolean>(() => {
    if (isSettingsActive) return true;
    try {
      return localStorage.getItem('moa_gym_settings_open') !== '0';
    } catch {
      return true;
    }
  });

  useEffect(() => {
    if (isSettingsActive) {
      setSettingsOpen(true);
    }
  }, [isSettingsActive]);

  const toggleSettingsOpen = () => {
    setSettingsOpen((prev) => {
      const next = !prev;
      try {
        localStorage.setItem('moa_gym_settings_open', next ? '1' : '0');
      } catch {}
      return next;
    });
  };

  if (!user) return null;

  const isActive = (path: string) => location.pathname === path;

  // Gold vertical indicator
  const ActiveBar = () => (
    <span
      aria-hidden="true"
      className="absolute left-0 top-1/2 -translate-y-1/2 h-7 w-1.5 rounded-r-full bg-moa-gold shadow-[0_0_8px_rgba(245,184,28,0.6)]"
    />
  );

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-xs lg:hidden"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#07572A] text-white shadow-xl transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'
          } ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
          }`}
      >
        {/* Top 4px MoA Tri-Color Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue shrink-0"></div>

        {/* Branding & Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <MoaLogo className="h-10 w-10 shrink-0" size={40} />
            {!collapsed && (
              <span className="font-bold text-sm text-white tracking-tight truncate">
                MoA Gym
              </span>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Staff Member Navigation */}
          {user.role === 'STAFF_MEMBER' && (
            <div className="space-y-1.5">
              {/* 1. My Entry Pass */}
              <NavLink
                to="/dashboard"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/dashboard')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'My Entry Pass' : undefined}
              >
                {isActive('/dashboard') && <ActiveBar />}
                <QrCode className="h-5 w-5 text-moa-gold shrink-0" />
                {!collapsed && <span className="truncate">My Entry Pass</span>}
              </NavLink>

              {/* 2. Gym Schedule */}
              <NavLink
                to="/schedule"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/schedule')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Gym Schedule' : undefined}
              >
                {isActive('/schedule') && <ActiveBar />}
                <Calendar className="h-5 w-5 text-emerald-300 shrink-0" />
                {!collapsed && <span className="truncate">Gym Schedule</span>}
              </NavLink>

              {/* 3. Exercise Video Guides */}
              <NavLink
                to="/guides"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/guides')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Exercise Videos' : undefined}
              >
                {isActive('/guides') && <ActiveBar />}
                <Video className="h-5 w-5 text-sky-300 shrink-0" />
                {!collapsed && <span className="truncate">Exercise Videos</span>}
              </NavLink>
            </div>
          )}

          {/* Admin Navigation */}
          {(user.role === 'ADMIN' || user.role === 'HR_ADMIN') && (
            <div className="space-y-1.5">
              {/* 1. Executive Dashboard */}
              <NavLink
                to="/admin/dashboard"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/admin/dashboard')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Dashboard' : undefined}
              >
                {isActive('/admin/dashboard') && <ActiveBar />}
                <LayoutDashboard className="h-5 w-5 text-moa-gold shrink-0" />
                {!collapsed && <span className="truncate">Dashboard</span>}
              </NavLink>

              {/* 2. Gym Schedule */}
              <NavLink
                to="/schedule"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/schedule')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Gym Schedule' : undefined}
              >
                {isActive('/schedule') && <ActiveBar />}
                <Calendar className="h-5 w-5 text-emerald-300 shrink-0" />
                {!collapsed && <span className="truncate">Gym Schedule</span>}
              </NavLink>

              {/* 3. Exercise Videos */}
              <NavLink
                to="/guides"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/guides')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Exercise Videos' : undefined}
              >
                {isActive('/guides') && <ActiveBar />}
                <Video className="h-5 w-5 text-sky-300 shrink-0" />
                {!collapsed && <span className="truncate">Exercise Videos</span>}
              </NavLink>

              {/* 4. Reports */}
              <NavLink
                to="/reports"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/reports') || isActive('/admin/analytics')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Reports' : undefined}
              >
                {(isActive('/reports') || isActive('/admin/analytics')) && <ActiveBar />}
                <BarChart3 className="h-5 w-5 text-sky-300 shrink-0" />
                {!collapsed && <span className="truncate">Reports</span>}
              </NavLink>

              {/* 5. Settings Menu (Collapsible, matching Asset Tracking System) */}
              <div className="pt-1">
                <button
                  type="button"
                  onClick={() => (collapsed ? navigate('/registrations') : toggleSettingsOpen())}
                  className={`w-full relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition cursor-pointer ${
                    isSettingsActive && (collapsed || !settingsOpen)
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'Settings' : undefined}
                >
                  {isSettingsActive && (collapsed || !settingsOpen) && <ActiveBar />}
                  <Settings className="h-5 w-5 text-amber-300 shrink-0" />
                  {!collapsed && (
                    <>
                      <span className="flex-1 text-left truncate">Settings</span>
                      <ChevronRight
                        className={`h-4 w-4 text-emerald-200/70 transition-transform ${
                          settingsOpen ? 'rotate-90 text-white' : ''
                        }`}
                      />
                    </>
                  )}
                </button>

                {/* Submenu items */}
                {!collapsed && settingsOpen && (
                  <div className="mt-1 ml-4 pl-3 border-l border-white/15 space-y-1">
                    {/* Member Directory */}
                    <NavLink
                      to="/registrations"
                      onClick={onCloseMobile}
                      className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                        isActive('/registrations')
                          ? 'bg-white/20 text-white shadow-2xs font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <Users className="h-4 w-4 text-emerald-300 shrink-0" />
                      <span className="truncate">Member Directory</span>
                    </NavLink>

                    {/* Users */}
                    <NavLink
                      to="/admin/users"
                      onClick={onCloseMobile}
                      className={`relative flex items-center gap-2.5 px-2.5 py-2 rounded-lg text-xs font-medium transition ${
                        isActive('/admin/users')
                          ? 'bg-white/20 text-white shadow-2xs font-semibold'
                          : 'text-white/70 hover:text-white hover:bg-white/10'
                      }`}
                    >
                      <UserCog className="h-4 w-4 text-amber-300 shrink-0" />
                      <span className="truncate">Users</span>
                    </NavLink>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Front Desk Attendant Navigation */}
          {user.role === 'GYM_ATTENDANT' && (
            <div className="space-y-1.5">
              {/* 1. Gate Checking Terminal */}
              <NavLink
                to="/terminal"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/terminal')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Gate Terminal' : undefined}
              >
                {isActive('/terminal') && <ActiveBar />}
                <ShieldCheck className="h-5 w-5 text-moa-gold shrink-0" />
                {!collapsed && <span className="truncate">Gate Terminal</span>}
              </NavLink>

              {/* 2. Live Floor & Lockers */}
              <NavLink
                to="/active-floor"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/active-floor')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Floor & Lockers' : undefined}
              >
                {isActive('/active-floor') && <ActiveBar />}
                <Flame className="h-5 w-5 text-amber-300 shrink-0" />
                {!collapsed && <span className="truncate">Floor & Lockers</span>}
              </NavLink>

              {/* 3. Gym Schedule */}
              <NavLink
                to="/schedule"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/schedule')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Gym Schedule' : undefined}
              >
                {isActive('/schedule') && <ActiveBar />}
                <Calendar className="h-5 w-5 text-emerald-300 shrink-0" />
                {!collapsed && <span className="truncate">Gym Schedule</span>}
              </NavLink>

              {/* 4. Exercise Videos */}
              <NavLink
                to="/guides"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/guides')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Exercise Videos' : undefined}
              >
                {isActive('/guides') && <ActiveBar />}
                <Video className="h-5 w-5 text-sky-300 shrink-0" />
                {!collapsed && <span className="truncate">Exercise Videos</span>}
              </NavLink>
            </div>
          )}
        </div>

        {/* Bottom Section: Compact User Avatar & Quick Logout */}
        <div className="p-2.5 border-t border-white/10 bg-black/15 shrink-0">
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <div
                title={`${user.fullName} (${user.role === 'HR_ADMIN' ? 'ADMIN' : user.role})`}
                className="relative cursor-default"
              >
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-moa-gold"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/20">
                    {getInitials(user.fullName)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-[#07572A]" />
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="p-2 text-white/70 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2.5">
              <div className="relative shrink-0">
                {user.photoUrl ? (
                  <img
                    src={user.photoUrl}
                    alt={user.fullName}
                    className="h-8 w-8 rounded-lg object-cover ring-1 ring-moa-gold"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-white/20 text-white flex items-center justify-center font-bold text-xs ring-1 ring-white/20">
                    {getInitials(user.fullName)}
                  </div>
                )}
                <span className="absolute -bottom-0.5 -right-0.5 size-2 rounded-full bg-emerald-400 ring-2 ring-[#07572A]" />
              </div>

              <div className="flex-1 min-w-0 leading-tight">
                <div className="text-xs font-bold text-white truncate">
                  {user.fullName}
                </div>
                <div className="text-[10px] font-mono text-emerald-200/90 truncate mt-0.5">
                  <span className="text-moa-gold font-semibold">
                    {user.role === 'HR_ADMIN' ? 'ADMIN' : user.role}
                  </span>
                  {' · '}{user.employeeId}
                </div>
              </div>

              <button
                type="button"
                onClick={logout}
                title="Sign out"
                aria-label="Sign out"
                className="p-1.5 text-white/70 hover:text-rose-300 hover:bg-rose-500/20 rounded-lg transition cursor-pointer shrink-0"
              >
                <LogOut className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </aside>
    </>
  );
};
