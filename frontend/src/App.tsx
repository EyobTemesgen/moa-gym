import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './lib/auth-context';
import { Layout } from './components/Layout';
import { RoleGuard } from './components/RoleGuard';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterClaimPage } from './pages/auth/RegisterClaimPage';
import { OnboardingWaiverPage } from './pages/staff/OnboardingWaiverPage';
import { StaffDashboardPage } from './pages/staff/StaffDashboardPage';
import { CheckInTerminalPage } from './pages/desk/CheckInTerminalPage';
import { ActiveFloorPage } from './pages/desk/ActiveFloorPage';
import { RegistrationsPage } from './pages/desk/RegistrationsPage';
import { HrRosterPage } from './pages/admin/HrRosterPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { SettingsPage } from './pages/admin/SettingsPage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5000,
      retry: 1,
    },
  },
});

const RoleRootRedirect: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return null;
  if (!user) return <Navigate to="/login" replace />;

  if (user.role === 'STAFF_MEMBER') {
    return <Navigate to="/dashboard" replace />;
  }

  if (user.role === 'GYM_ATTENDANT') {
    return <Navigate to="/terminal" replace />;
  }

  return <Navigate to="/registrations" replace />;
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            {/* Public Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/claim" element={<RegisterClaimPage />} />

            {/* Authenticated Application Shell */}
            <Route element={<Layout />}>
              <Route path="/" element={<RoleRootRedirect />} />

              {/* Staff Member Routes */}
              <Route
                path="/dashboard"
                element={
                  <RoleGuard allowedRoles={['STAFF_MEMBER']}>
                    <StaffDashboardPage />
                  </RoleGuard>
                }
              />

              <Route path="/waiver" element={<Navigate to="/dashboard" replace />} />
              <Route path="/classes" element={<Navigate to="/" replace />} />

              {/* Front Desk & Gate Terminal */}
              <Route
                path="/registrations"
                element={
                  <RoleGuard allowedRoles={['GYM_ATTENDANT', 'HR_ADMIN']}>
                    <RegistrationsPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/terminal"
                element={
                  <RoleGuard allowedRoles={['GYM_ATTENDANT']}>
                    <CheckInTerminalPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/active-floor"
                element={
                  <RoleGuard allowedRoles={['GYM_ATTENDANT', 'HR_ADMIN']}>
                    <ActiveFloorPage />
                  </RoleGuard>
                }
              />

              {/* HR Admin Management */}
              <Route
                path="/admin/roster"
                element={
                  <RoleGuard allowedRoles={['HR_ADMIN']}>
                    <HrRosterPage />
                  </RoleGuard>
                }
              />

              {/* Reports & Analytics */}
              <Route
                path="/reports"
                element={
                  <RoleGuard allowedRoles={['HR_ADMIN']}>
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/admin/analytics"
                element={
                  <RoleGuard allowedRoles={['HR_ADMIN', 'GYM_ATTENDANT']}>
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/admin/settings"
                element={
                  <RoleGuard allowedRoles={['HR_ADMIN']}>
                    <SettingsPage />
                  </RoleGuard>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
