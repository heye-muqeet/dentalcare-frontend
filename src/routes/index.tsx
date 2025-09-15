import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { RoleBasedRoute } from '../components/Auth/RoleBasedRoute';
import { DashboardLayout } from '../layouts/DashboardLayout';
import Dashboard from '../pages/Dashboard';
import OrganizationManagement from '../pages/OrganizationManagement';
import SystemUsers from '../pages/SystemUsers';
import SystemLogs from '../pages/SystemLogs';
import { useSelector } from 'react-redux';
import type { RootState } from '../lib/store/store';

// Simple loading component
const LoadingSpinner = () => (
  <div className="min-h-screen flex items-center justify-center">
    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A0F56]"></div>
  </div>
);

// Create a wrapper component to provide user from Redux
const DashboardWrapper = ({ children }: { children: React.ReactNode }) => {
  const { user, isLoading, isAuthenticated } = useSelector((state: RootState) => state.auth);

  // Show loading spinner while checking authentication
  if (isLoading) {
    return <LoadingSpinner />;
  }

  // Only redirect if we're sure the user is not authenticated
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <DashboardLayout user={user}>
      {children}
    </DashboardLayout>
  );
};

// Placeholder components for now

const Doctors = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Doctors</h1>
    <p className="text-gray-600">Manage doctors and their schedules</p>
  </div>
);

const Patients = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Patients</h1>
    <p className="text-gray-600">Manage patient records and information</p>
  </div>
);

const Appointments = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Appointments</h1>
    <p className="text-gray-600">Schedule and manage appointments</p>
  </div>
);

const Services = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Services</h1>
    <p className="text-gray-600">Manage dental services and treatments</p>
  </div>
);

const Treatments = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Treatments</h1>
    <p className="text-gray-600">Track patient treatments and procedures</p>
  </div>
);

const Invoices = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Invoices</h1>
    <p className="text-gray-600">Manage billing and invoices</p>
  </div>
);

const Expenses = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Expenses</h1>
    <p className="text-gray-600">Track clinic expenses and costs</p>
  </div>
);

const Profile = () => (
  <div className="p-6">
    <h1 className="text-2xl font-bold text-gray-900">Profile</h1>
    <p className="text-gray-600">Manage your account settings</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/login" replace />,
  },
  {
    path: '/login',
    element: <LoginForm />,
  },
  {
    path: '/dashboard',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']}>
          <DashboardWrapper>
            <Dashboard />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/doctors',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'receptionist']}>
          <DashboardWrapper>
            <Doctors />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist']}>
          <DashboardWrapper>
            <Patients />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointments',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']}>
          <DashboardWrapper>
            <Appointments />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/services',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'receptionist']}>
          <DashboardWrapper>
            <Services />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/treatments',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']}>
          <DashboardWrapper>
            <Treatments />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/invoices',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'receptionist']}>
          <DashboardWrapper>
            <Invoices />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/expenses',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'receptionist']}>
          <DashboardWrapper>
            <Expenses />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin', 'organization_admin', 'branch_admin', 'doctor', 'receptionist', 'patient']}>
          <DashboardWrapper>
            <Profile />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  // Super Admin specific routes
  {
    path: '/organizations',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin']}>
          <DashboardWrapper>
            <OrganizationManagement />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/system-users',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin']}>
          <DashboardWrapper>
            <SystemUsers />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/system-logs',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin']}>
          <DashboardWrapper>
            <SystemLogs />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/analytics',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin']}>
          <DashboardWrapper>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">System Analytics</h1>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">System-wide analytics and reports page coming soon...</p>
              </div>
            </div>
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/system-settings',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin']}>
          <DashboardWrapper>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">System Settings</h1>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">System configuration page coming soon...</p>
              </div>
            </div>
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/security',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['super_admin']}>
          <DashboardWrapper>
            <div className="p-6">
              <h1 className="text-3xl font-bold text-gray-900 mb-6">Security Monitor</h1>
              <div className="bg-white rounded-lg shadow-md p-6">
                <p className="text-gray-600">Security monitoring and threat detection page coming soon...</p>
              </div>
            </div>
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
]);
