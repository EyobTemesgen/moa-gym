import React from 'react';
import { Outlet } from 'react-router-dom';
import { MoaHeader } from './MoaHeader';

export const Layout: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col bg-moa-surface text-slate-800">
      <MoaHeader />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      <footer className="bg-white border-t border-slate-200 mt-auto py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-2">
          <p>© 2026 Federal Democratic Republic of Ethiopia – Ministry of Agriculture. Internal Staff Portal.</p>
          <div className="flex items-center gap-4 text-[11px]">
            <span className="text-emerald-700 font-semibold">Strict HR Whitelist</span>
            <span>·</span>
            <span className="text-slate-600">No Commercial Access</span>
            <span>·</span>
            <span className="text-slate-600">On-Premises Intranet Stack</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
