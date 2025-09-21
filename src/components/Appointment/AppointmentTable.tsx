import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { cancelAppointment, clearAppointmentErrors } from '../../lib/store/slices/appointmentsSlice';
import { toast } from 'react-hot-toast';
import type { Appointment } from '../../lib/api/services/appointments';
import { calculateAge } from '../../lib/utils/dateUtils';
import { getInitials } from '../../lib/utils/stringUtils';
import InitialAvatar from '../Common/InitialAvatar';
import { FiEdit2, FiTrash2 } from 'react-icons/fi';

interface AppointmentTableProps {
  appointments: Appointment[];
}

export const AppointmentTable: React.FC<AppointmentTableProps> = ({ appointments }) => {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { user } = useAppSelector((state) => state.auth);
  const { cancelError } = useAppSelector((state) => state.appointments);
  
  // Local state to track which appointment is being cancelled
  const [cancellingAppointmentId, setCancellingAppointmentId] = React.useState<string | null>(null);

  // Handle cancel errors
  React.useEffect(() => {
    if (cancelError) {
      toast.error(cancelError);
      dispatch(clearAppointmentErrors());
      setCancellingAppointmentId(null); // Reset cancelling state on error
    }
  }, [cancelError, dispatch]);

  const canAccessAppointment = (appointment: Appointment): boolean => {
    if (!user) return false;

    const userRole = user.role;
    const appointmentStatus = appointment.status?.toLowerCase();
    const isAssignedDoctor = appointment.doctor?.id === user.id;

    switch (appointmentStatus) {
      case 'cancelled':
        // Cancelled appointments: No one can open
        return false;
      
      case 'pending':
        // Pending appointments: Only assigned doctor can open
        return isAssignedDoctor;
      
      case 'completed':
        // Completed appointments: Assigned doctor and owner can open
        return isAssignedDoctor || userRole === 'owner';
      
      case 'confirmed':
        // Confirmed appointments: Only assigned doctor can open (similar to pending)
        return isAssignedDoctor;
      
      default:
        // Default: Only assigned doctor can open
        return isAssignedDoctor;
    }
  };

  const handleAppointmentClick = (appointment: Appointment) => {
    if (!canAccessAppointment(appointment)) {
      const appointmentStatus = appointment.status?.toLowerCase();
      
      if (appointmentStatus === 'cancelled') {
        toast.error('Cannot open cancelled appointments');
      } else if (appointmentStatus === 'pending' || appointmentStatus === 'confirmed') {
        toast.error('Only the assigned doctor can open this appointment');
      } else if (appointmentStatus === 'completed') {
        toast.error('Only the assigned doctor or owner can open completed appointments');
      } else {
        toast.error('You do not have permission to access this appointment');
      }
      return;
    }

    // Navigate based on appointment status
    if (appointment.status === 'completed') {
      navigate(`/treatments/${appointment.id}`);
    } else {
      navigate('/appointment-details', { state: { appointment } });
    }
  };

  const getRowCursor = (appointment: Appointment): string => {
    return canAccessAppointment(appointment) ? 'cursor-pointer' : 'cursor-not-allowed';
  };

  const getRowOpacity = (appointment: Appointment): string => {
    const appointmentStatus = appointment.status?.toLowerCase();
    if (appointmentStatus === 'cancelled') {
      return 'opacity-50';
    }
    return canAccessAppointment(appointment) ? 'opacity-100' : 'opacity-60';
  };

  const handleDeleteAppointment = async (appointment: Appointment) => {
    // if (!canAccessAppointment(appointment)) {
    //   toast.error('You do not have permission to cancel this appointment');
    //   return;
    // }

    if (appointment.status === 'cancelled') {
      toast.error('This appointment is already cancelled');
      return;
    }

    if (appointment.status === 'completed') {
      toast.error('Cannot cancel a completed appointment');
      return;
    }

    if (cancellingAppointmentId === appointment.id) {
      return; // Prevent multiple cancel requests for the same appointment
    }

    const confirmCancel = window.confirm(
      `Are you sure you want to cancel the appointment for ${appointment.patient?.name}?`
    );
    
    if (!confirmCancel) {
      return;
    }

    try {
      setCancellingAppointmentId(appointment.id);
      await dispatch(cancelAppointment(appointment.id)).unwrap();
      toast.success('Appointment cancelled successfully!');
      setCancellingAppointmentId(null);
    } catch (error) {
      // Error is handled by useEffect for cancelError
      setCancellingAppointmentId(null);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4">
      <div className="flex items-center mb-4">
        <h3 className="text-sm font-medium">Appointments List</h3>
        <span className="bg-blue-100 ml-2 text-blue-600 text-xs px-2 py-1 rounded-full">
          {appointments.length} Appointments
        </span>
      </div>

      <table className="w-full border-collapse text-xs">
        <thead>
          <tr className="bg-gray-100 text-gray-600">
            <th className="text-left p-2">Patient Name</th>
            <th className="text-left p-2">Date</th>
            <th className="text-left p-2">Time</th>
            <th className="text-left p-2">Gender</th>
            <th className="text-left p-2">Age</th>
            <th className="text-left p-2">Disease</th>
            <th className="text-left p-2">Status</th>
            <th className="text-left p-2">Doctor Name</th>
            <th className="text-left p-2">Actions</th>
          </tr>
        </thead>
        <tbody>
          {appointments.map((appointment, index) => (
            <tr
              key={index}
              className={`border-t border-gray-200 text-gray-700 hover:bg-gray-50 ${getRowCursor(appointment)} ${getRowOpacity(appointment)}`}
              onClick={() => handleAppointmentClick(appointment)}
            >
              <td className="flex items-center space-x-2 p-2">
                <InitialAvatar
                  initials={getInitials(appointment.patient?.name || '')}
                  size={8}
                  bgColor="bg-blue-500"
                  textColor="text-white"
                  className="border-none shadow-none text-xs"
                />
                <div>
                  <p className="font-sm capitalize">{appointment.patient?.name || 'N/A'}</p>
                  <p className="text-gray-500 text-xxs">{appointment.patient?.email || 'N/A'}</p>
                </div>
              </td>
              <td className="p-2">{new Date(appointment.date).toLocaleDateString()}</td>
              <td className="p-2">{appointment.time || 'N/A'}</td>
              <td className="p-2 capitalize">{appointment.patient?.gender || 'N/A'}</td>
              <td className="p-2">{appointment.patient?.dob ? calculateAge(appointment.patient.dob) : 'N/A'}</td>
              <td className="p-2">{appointment.reason || 'N/A'}</td>
              <td className="p-2">
                <span
                  className={`px-2 py-1 text-xxs rounded-full capitalize ${appointment.status === "completed"
                    ? "bg-green-100 text-green-700"
                    : appointment.status === "pending"
                      ? "bg-yellow-100 text-yellow-700"
                      : appointment.status === "confirmed"
                        ? "bg-blue-100 text-blue-700"
                        : appointment.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-700"
                    }`}
                >
                  {appointment.status || 'N/A'}
                </span>
              </td>
              <td className="p-2">{appointment.doctor?.name || 'N/A'}</td>
              <td className="p-2 flex space-x-2">
                {appointment.status === "completed" || appointment.status === "cancelled" ? null :
                  (
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate('/add-appointment', { 
                            state: { 
                              appointment: appointment,
                              isEditing: true 
                            } 
                          });
                        }}
                        className="text-blue-600 hover:text-blue-900 bg-blue-100 p-2 rounded-lg"
                        title="Edit appointment"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        className="text-red-600 hover:text-red-900 bg-red-100 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={
                          cancellingAppointmentId === appointment.id || 
                          (appointment.status as string) === 'cancelled' || 
                          (appointment.status as string) === 'completed'
                        }
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteAppointment(appointment);
                        }}
                        title={
                          (appointment.status as string) === 'cancelled' 
                            ? 'Already cancelled' 
                            : (appointment.status as string) === 'completed'
                            ? 'Cannot cancel completed appointment'
                            : 'Cancel appointment'
                        }
                      >
                        {cancellingAppointmentId === appointment.id ? (
                          <div className="w-4 h-4 border-2 border-red-600 border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <FiTrash2 className="w-4 h-4" />
                        )}
                      </button>
                    </>
                  )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}; 