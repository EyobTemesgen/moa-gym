import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MoaHeader } from './MoaHeader';
import { useAuth } from '../lib/auth-context';

export const Layout: React.FC = () => {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-moa-surface text-slate-800 flex flex-col">
      {/* Side Menu */}
      {user && (
        <Sidebar
          collapsed={collapsed}
          onToggleCollapse={() => setCollapsed(!collapsed)}
          mobileOpen={mobileOpen}
          onCloseMobile={() => setMobileOpen(false)}
        />
      )}

      {/* Main Column Wrapper */}
      <div
        className={`flex-1 flex flex-col transition-all duration-300 ease-in-out ${
          user ? (collapsed ? 'lg:pl-20' : 'lg:pl-64') : ''
        }`}
      >
        <MoaHeader onOpenMobileSidebar={() => setMobileOpen(true)} />

        <main className="flex-1 w-full px-4 py-5">
          <Outlet />
        </main>

        <footer className="bg-white border-t border-slate-200 mt-auto py-3">
          <div className="w-full px-4 flex flex-col sm:flex-row items-center justify-between text-[11px] text-slate-500 gap-2">
            <p>© 2026 Ministry of Agriculture (MoA) · Staff Gym</p>
            <div className="flex items-center gap-3">
              <span className="text-emerald-700 font-semibold">Strict HR Whitelist</span>
              <span>·</span>
              <span className="text-slate-600">No Commercial Access</span>
              <span>·</span>
              <span className="text-slate-600">On-Premises Intranet Stack</span>
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};
