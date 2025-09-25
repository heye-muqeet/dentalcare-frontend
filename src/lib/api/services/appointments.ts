import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';

export interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    name: string; // Updated to match backend schema
    firstName?: string; // For backward compatibility
    lastName?: string; // For backward compatibility
    email: string;
    phone: string;
  };
  doctorId?: {
    _id: string;
    firstName: string;
    lastName: string;
    specialization: string;
  };
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  visitType: 'walk_in' | 'scheduled';
  reasonForVisit: string;
  notes?: string;
  duration: number;
  isWalkIn: boolean;
  isEmergency: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAppointmentData {
  patientId: string;
  doctorId?: string;
  appointmentDate: string;
  startTime: string;
  visitType: 'walk_in' | 'scheduled';
  reasonForVisit: string;
  notes?: string;
  duration?: number;
  isWalkIn?: boolean;
  metadata?: {
    source?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
  };
}

export interface UpdateAppointmentData {
  doctorId?: string;
  appointmentDate?: string;
  startTime?: string;
  endTime?: string;
  status?: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  reasonForVisit?: string;
  notes?: string;
  duration?: number;
  isWalkIn?: boolean;
  metadata?: {
    source?: string;
    priority?: 'low' | 'normal' | 'high' | 'urgent';
    reminderSent?: boolean;
    confirmationSent?: boolean;
    followUpRequired?: boolean;
  };
}

export interface AvailableSlot {
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  doctorId?: string;
  doctorName?: string;
}

export interface AppointmentFilters {
  status?: string;
  doctorId?: string;
  patientId?: string;
  dateFrom?: string;
  dateTo?: string;
}

export const appointmentsApi = {
  // Get all appointments with optional filters
  getAppointments: async (filters?: AppointmentFilters): Promise<Appointment[]> => {
    const response = await api.get(API_ENDPOINTS.APPOINTMENTS.BASE, { params: filters });
    return response.data;
  },

  // Get a single appointment by ID
  getAppointment: async (id: string): Promise<Appointment> => {
    const response = await api.get(API_ENDPOINTS.APPOINTMENTS.BY_ID(id));
    return response.data;
  },

  // Create a new appointment
  createAppointment: async (appointmentData: CreateAppointmentData): Promise<Appointment> => {
    const response = await api.post(API_ENDPOINTS.APPOINTMENTS.BASE, appointmentData);
    return response.data;
  },

  // Update an existing appointment
  updateAppointment: async (id: string, appointmentData: UpdateAppointmentData): Promise<Appointment> => {
    const response = await api.patch(API_ENDPOINTS.APPOINTMENTS.BY_ID(id), appointmentData);
    return response.data;
  },

  // Cancel an appointment
  cancelAppointment: async (id: string, cancellationReason: string): Promise<Appointment> => {
    const response = await api.delete(API_ENDPOINTS.APPOINTMENTS.CANCEL(id), {
      data: { cancellationReason }
    });
    return response.data;
  },

  // Get available time slots
  getAvailableSlots: async (
    date: string,
    doctorId?: string,
    duration: number = 30
  ): Promise<AvailableSlot[]> => {
    const response = await api.get(API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS, {
      params: { date, doctorId, duration }
    });
    return response.data;
  },

  // Validate slot availability
  validateSlot: async (data: {
    doctorId?: string;
    appointmentDate: string;
    startTime: string;
    endTime: string;
    patientId: string;
    excludeAppointmentId?: string;
    isWalkIn?: boolean;
  }) => {
    const response = await api.post('/appointments/validate-slot', data);
    return response.data;
  },

  checkExistingAppointment: async (patientId: string, appointmentDate: string) => {
    console.log('🔍 Checking for existing appointment:', { patientId, appointmentDate });
    const response = await api.get('/appointments/check-existing', {
      params: { patientId, appointmentDate }
    });
    console.log('🔍 Existing appointment check response:', response.data);
    return response.data;
  },
};
