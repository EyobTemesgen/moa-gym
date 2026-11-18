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

        <footer className="no-print bg-white border-t border-slate-200 mt-auto py-3">
          <div className="w-full px-4 flex items-center justify-between text-xs text-slate-500">
            <p>© 2026 Ministry of Agriculture · Staff Wellness & Fitness Gymnasium</p>
          </div>
        </footer>
      </div>
    </div>
  );
};
