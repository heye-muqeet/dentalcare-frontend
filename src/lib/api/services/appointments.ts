import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import type { Patient } from './patients';
import type { User } from './users';

export interface Appointment {
    id: string;
    date: string;
    time: string;
    reason: string;
    appointmentTimestamp: number;
    status: 'pending' | 'confirmed' | 'completed' | 'cancelled';
    notes?: string;
    patient: Patient;
    doctor: User;
    followUpFor?: {
        id: string;
        date: string;
    };
}

export interface CreateAppointmentData {
    date: string;
    time: string;
    reason: string;
    appointmentTimestamp: number;
    notes?: string;
    patientId: string;
    doctorId: string;
    followUpForId?: string;
}

export const appointmentService = {
    getAppointments: async () => {
        const response = await api.get(API_ENDPOINTS.APPOINTMENTS.BASE);
        return response.data;
    },

    getAppointment: async (id: string) => {
        const response = await api.get(API_ENDPOINTS.APPOINTMENTS.BY_ID(id));
        return response.data;
    },

    getAvailableSlots: async (date: string, doctorId: string) => {
        const response = await api.get(API_ENDPOINTS.APPOINTMENTS.AVAILABLE_SLOTS, {
            params: {
                date,
                doctorId
            }
        });
        console.log(response.data);
        return response.data;
    },

    createAppointment: async (data: CreateAppointmentData) => {
        const response = await api.post(API_ENDPOINTS.APPOINTMENTS.BASE, data);
        return response.data;
    },

    updateAppointment: async (id: string, data: Partial<CreateAppointmentData>) => {
        const response = await api.put(API_ENDPOINTS.APPOINTMENTS.BY_ID(id), data);
        return response.data;
    },

    cancelAppointment: async (id: string) => {
        const response = await api.put(API_ENDPOINTS.APPOINTMENTS.CANCEL(id));
        return response.data;
    }
}; 