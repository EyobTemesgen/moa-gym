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
import { AdminDashboardPage } from './pages/admin/AdminDashboardPage';
import { UserManagementPage } from './pages/admin/UserManagementPage';
import { AnalyticsPage } from './pages/admin/AnalyticsPage';
import { GymSchedulePage } from './pages/staff/GymSchedulePage';
import { TraineeGuidesPage } from './pages/staff/TraineeGuidesPage';

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

  return <Navigate to="/admin/dashboard" replace />;
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
            <Route path="/signup" element={<Navigate to="/claim" replace />} />
            <Route path="/register" element={<Navigate to="/claim" replace />} />
            <Route path="/register/claim" element={<Navigate to="/claim" replace />} />

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

              {/* Gym Schedule & Timetable */}
              <Route
                path="/schedule"
                element={
                  <RoleGuard allowedRoles={['STAFF_MEMBER', 'GYM_ATTENDANT', 'ADMIN', 'HR_ADMIN']}>
                    <GymSchedulePage />
                  </RoleGuard>
                }
              />

              {/* Exercise Video Guides */}
              <Route
                path="/guides"
                element={
                  <RoleGuard allowedRoles={['STAFF_MEMBER', 'GYM_ATTENDANT', 'ADMIN', 'HR_ADMIN']}>
                    <TraineeGuidesPage />
                  </RoleGuard>
                }
              />

              {/* Aliases */}
              <Route path="/waiver" element={<Navigate to="/dashboard" replace />} />
              <Route path="/classes" element={<Navigate to="/schedule" replace />} />
              <Route path="/videos" element={<Navigate to="/guides" replace />} />
              <Route path="/training" element={<Navigate to="/guides" replace />} />

              {/* Admin: Overview Dashboard */}
              <Route
                path="/admin/dashboard"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'HR_ADMIN']}>
                    <AdminDashboardPage />
                  </RoleGuard>
                }
              />

              {/* Admin: Staff Registration Directory & Intake */}
              <Route
                path="/registrations"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'HR_ADMIN']}>
                    <RegistrationsPage />
                  </RoleGuard>
                }
              />

              {/* Admin: System User Management */}
              <Route
                path="/admin/users"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'HR_ADMIN']}>
                    <UserManagementPage />
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
                  <RoleGuard allowedRoles={['GYM_ATTENDANT', 'ADMIN', 'HR_ADMIN']}>
                    <ActiveFloorPage />
                  </RoleGuard>
                }
              />

              {/* Legacy HR Whitelist Route Redirected to Unified Registrations */}
              <Route path="/admin/roster" element={<Navigate to="/registrations" replace />} />

              {/* Reports & Analytics */}
              <Route
                path="/reports"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'HR_ADMIN']}>
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />

              <Route
                path="/admin/analytics"
                element={
                  <RoleGuard allowedRoles={['ADMIN', 'HR_ADMIN', 'GYM_ATTENDANT']}>
                    <AnalyticsPage />
                  </RoleGuard>
                }
              />

              {/* Legacy Settings Route Redirected to Users */}
              <Route path="/admin/settings" element={<Navigate to="/admin/users" replace />} />

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
