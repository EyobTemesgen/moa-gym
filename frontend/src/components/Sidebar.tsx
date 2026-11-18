import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { MoaLogo } from './MoaLogo';
import {
  QrCode,
  ShieldCheck,
  Users,
  BarChart3,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  LayoutDashboard,
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { user, logout } = useAuth();
  const location = useLocation();

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

              {/* 2. Staff Registration */}
              <NavLink
                to="/registrations"
                onClick={onCloseMobile}
                className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition ${
                  isActive('/registrations')
                    ? 'bg-white/20 text-white shadow-xs'
                    : 'text-white/80 hover:text-white hover:bg-white/10'
                }`}
                title={collapsed ? 'Staff Registrations' : undefined}
              >
                {isActive('/registrations') && <ActiveBar />}
                <Users className="h-5 w-5 text-emerald-200 shrink-0" />
                {!collapsed && <span className="truncate">Staff Registrations</span>}
              </NavLink>

              {/* 3. Reports */}
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
            </div>
          )}
        </div>

        {/* Bottom Section: User Profile & Logout */}
        <div className="p-3 border-t border-white/10 bg-black/10">
          <div className="flex items-center gap-3 overflow-hidden">
            {user.photoUrl ? (
              <img
                src={user.photoUrl}
                alt={user.fullName}
                className="h-9 w-9 rounded-xl object-cover ring-2 ring-moa-gold shrink-0"
              />
            ) : (
              <div className="h-9 w-9 rounded-xl bg-white/15 flex items-center justify-center text-white font-bold shrink-0">
                <User className="h-4 w-4" />
              </div>
            )}

            {!collapsed && (
              <div className="flex-1 overflow-hidden">
                <div className="text-xs font-bold text-white truncate">{user.fullName}</div>
                <div className="text-[10px] font-mono text-emerald-200 truncate">
                  {user.employeeId} ·{' '}
                  <span className="font-semibold text-moa-gold">{user.role === 'HR_ADMIN' ? 'ADMIN' : user.role}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-white/70 hover:text-red-300 hover:bg-white/10 rounded-lg transition shrink-0 ml-auto cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
