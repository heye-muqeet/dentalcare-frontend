import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginForm } from '../features/auth/components/LoginForm';
import { ProtectedRoute } from '../features/auth/components/ProtectedRoute';
import { RoleBasedRoute } from '../components/Auth/RoleBasedRoute';
import DoctorAppointment from '../pages/DoctorAppointment';
import { DashboardLayout } from '../layouts/DashboardLayout';
import AppointmentTable from '../pages/AppointmentList';
import PatientList from '../pages/PatientList';
import AddAppointment from '../pages/AddAppointment';
import PatientProfile from '../pages/PatientProfile';
import Services from '../pages/Services';
import AppointmentDetails from '../pages/AppointmentDetails';
import TreatmentDetails from '../pages/TreatmentDetails';
import Expense from '../pages/Expense';
import Invoice from '../pages/Invoice';
import UserProfile from '../pages/UserProfile';
import Dashboard from '../pages/Dashboard';
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
        <RoleBasedRoute requiredRoles={['owner', 'receptionist', 'doctor']}>
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
        <RoleBasedRoute requiredRoles={['owner', 'receptionist']}>
          <DashboardWrapper>
            <DoctorAppointment />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointments',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist', 'doctor']}>
          <DashboardWrapper>
            <AppointmentTable />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patients',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist', 'doctor']}>
          <DashboardWrapper>
            <PatientList />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/services',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist']}>
          <DashboardWrapper>
            <Services />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/add-appointment',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist']}>
          <DashboardWrapper>
            <AddAppointment />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/patient-profile/:id',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist', 'doctor']}>
          <DashboardWrapper>
            <PatientProfile />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/appointment-details',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'doctor']} redirectPath="/appointments">
          <DashboardWrapper>
            <AppointmentDetails />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/treatments/:treatmentId',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist', 'doctor']}>
          <DashboardWrapper>
            <TreatmentDetails />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/expense',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist']}>
          <DashboardWrapper>
            <Expense />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/invoice',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist']}>
          <DashboardWrapper>
            <Invoice />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: '/account',
    element: (
      <ProtectedRoute>
        <RoleBasedRoute requiredRoles={['owner', 'receptionist', 'doctor']}>
          <DashboardWrapper>
            <UserProfile />
          </DashboardWrapper>
        </RoleBasedRoute>
      </ProtectedRoute>
    ),
  },
]);
