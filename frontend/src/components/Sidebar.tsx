import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';
import { MoaLogo } from './MoaLogo';
import { OccupancyBanner } from './OccupancyBanner';
import {
  QrCode,
  ShieldCheck,
  Users,
  Calendar,
  BarChart3,
  Settings,
  ClipboardList,
  LogOut,
  ChevronLeft,
  ChevronRight,
  User,
  Activity,
  HeartPulse,
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
        className={`fixed inset-y-0 left-0 z-50 flex flex-col bg-[#07572A] text-white shadow-xl transition-all duration-300 ease-in-out ${
          collapsed ? 'w-20' : 'w-64'
        } ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top 4px MoA Tri-Color Accent Bar */}
        <div className="h-1 w-full bg-gradient-to-r from-moa-gold via-moa-green to-moa-blue shrink-0"></div>

        {/* Branding & Logo */}
        <div className="p-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3 overflow-hidden">
            <MoaLogo className="h-10 w-10 shrink-0" size={40} />
            {!collapsed && (
              <div className="overflow-hidden whitespace-nowrap">
                <div className="text-[11px] font-bold text-moa-gold tracking-tight font-sans">
                  የግብርና ሚኒስቴር
                </div>
                <div className="text-[10px] font-semibold text-white/80 tracking-wider">
                  MINISTRY OF AGRICULTURE
                </div>
                <div className="text-xs font-bold text-white tracking-tight flex items-center gap-1.5 mt-0.5">
                  <span>MoA-Gym</span>
                  <span className="text-[9px] font-mono text-emerald-200 bg-white/15 px-1.5 py-0.2 rounded">
                    Staff Wellness
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Desktop Collapse Toggle */}
          <button
            type="button"
            onClick={onToggleCollapse}
            title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="hidden lg:flex p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </button>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
          {/* Staff Member Navigation */}
          {user.role === 'STAFF_MEMBER' && (
            <div>
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider mb-2">
                  Staff Member Portal
                </div>
              )}
              <div className="space-y-1">
                <NavLink
                  to="/dashboard"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/dashboard')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'My Digital QR Pass' : undefined}
                >
                  {isActive('/dashboard') && <ActiveBar />}
                  <QrCode className="h-5 w-5 text-moa-gold shrink-0" />
                  {!collapsed && <span>My QR Entry Pass</span>}
                </NavLink>

                <NavLink
                  to="/waiver"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/waiver')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'PAR-Q & Liability Waiver' : undefined}
                >
                  {isActive('/waiver') && <ActiveBar />}
                  <ClipboardList className="h-5 w-5 text-emerald-300 shrink-0" />
                  {!collapsed && (
                    <div className="flex items-center justify-between flex-1">
                      <span>PAR-Q & Waiver</span>
                      {user.waiverSigned ? (
                        <span className="text-[10px] font-bold text-emerald-300 bg-emerald-900/60 px-1.5 py-0.5 rounded">
                          Signed
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-moa-gold bg-amber-900/60 px-1.5 py-0.5 rounded animate-pulse">
                          Pending
                        </span>
                      )}
                    </div>
                  )}
                </NavLink>

                <NavLink
                  to="/classes"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/classes')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'Wellness & Fitness Classes' : undefined}
                >
                  {isActive('/classes') && <ActiveBar />}
                  <Calendar className="h-5 w-5 text-sky-300 shrink-0" />
                  {!collapsed && <span>Fitness Classes</span>}
                </NavLink>
              </div>
            </div>
          )}

          {/* Front Desk / Gym Attendant Navigation */}
          {(user.role === 'GYM_ATTENDANT' || user.role === 'HR_ADMIN') && (
            <div>
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider mb-2">
                  Front Desk Operations
                </div>
              )}
              <div className="space-y-1">
                <NavLink
                  to="/terminal"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/terminal')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'Gate Verification Terminal' : undefined}
                >
                  {isActive('/terminal') && <ActiveBar />}
                  <ShieldCheck className="h-5 w-5 text-moa-gold shrink-0" />
                  {!collapsed && <span>Gate Terminal (QR)</span>}
                </NavLink>

                <NavLink
                  to="/active-floor"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/active-floor')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'Live Floor & Lockers' : undefined}
                >
                  {isActive('/active-floor') && <ActiveBar />}
                  <Activity className="h-5 w-5 text-emerald-300 shrink-0" />
                  {!collapsed && <span>Active Floor & Lockers</span>}
                </NavLink>

                <NavLink
                  to="/classes"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/classes')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'Classes & Equipment Log' : undefined}
                >
                  {isActive('/classes') && <ActiveBar />}
                  <Calendar className="h-5 w-5 text-sky-300 shrink-0" />
                  {!collapsed && <span>Classes & Equipment</span>}
                </NavLink>
              </div>
            </div>
          )}

          {/* HR Admin Exclusive Navigation */}
          {user.role === 'HR_ADMIN' && (
            <div>
              {!collapsed && (
                <div className="px-3 text-[10px] font-bold text-emerald-200/70 uppercase tracking-wider mb-2">
                  HR Administration
                </div>
              )}
              <div className="space-y-1">
                <NavLink
                  to="/admin/roster"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/admin/roster')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'Staff Eligibility Whitelist' : undefined}
                >
                  {isActive('/admin/roster') && <ActiveBar />}
                  <Users className="h-5 w-5 text-amber-300 shrink-0" />
                  {!collapsed && <span>Staff Whitelist Roster</span>}
                </NavLink>

                <NavLink
                  to="/admin/analytics"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/admin/analytics')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'Utilization Analytics & CSV' : undefined}
                >
                  {isActive('/admin/analytics') && <ActiveBar />}
                  <BarChart3 className="h-5 w-5 text-sky-300 shrink-0" />
                  {!collapsed && <span>Analytics & CSV Report</span>}
                </NavLink>

                <NavLink
                  to="/admin/settings"
                  onClick={onCloseMobile}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive('/admin/settings')
                      ? 'bg-white/20 text-white shadow-xs'
                      : 'text-white/80 hover:text-white hover:bg-white/10'
                  }`}
                  title={collapsed ? 'Facility & Waiver Settings' : undefined}
                >
                  {isActive('/admin/settings') && <ActiveBar />}
                  <Settings className="h-5 w-5 text-slate-300 shrink-0" />
                  {!collapsed && <span>Facility Settings</span>}
                </NavLink>
              </div>
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
                  <span className="font-semibold text-moa-gold">{user.role}</span>
                </div>
              </div>
            )}

            <button
              type="button"
              onClick={logout}
              title="Sign out"
              className="p-1.5 text-white/70 hover:text-red-300 hover:bg-white/10 rounded-lg transition shrink-0 ml-auto"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
