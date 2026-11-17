import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth-context';

interface RoleGuardProps {
  allowedRoles?: Array<'HR_ADMIN' | 'GYM_ATTENDANT' | 'STAFF_MEMBER'>;
  requireWaiver?: boolean;
  children: React.ReactNode;
}

export const RoleGuard: React.FC<RoleGuardProps> = ({
  allowedRoles,
  requireWaiver = false,
  children,
}) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-moa-green border-t-transparent rounded-full animate-spin"></div>
          <span className="text-xs font-medium text-slate-500">Checking credentials...</span>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // If not allowed, redirect to appropriate home
    if (user.role === 'STAFF_MEMBER') {
      return <Navigate to="/dashboard" replace />;
    }
    if (user.role === 'GYM_ATTENDANT') {
      return <Navigate to="/terminal" replace />;
    }
    return <Navigate to="/registrations" replace />;
  }

  return <>{children}</>;
};
