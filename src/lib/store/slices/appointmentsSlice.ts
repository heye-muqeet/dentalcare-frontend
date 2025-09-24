import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

interface Appointment {
  _id: string;
  patientId: {
    _id: string;
    firstName: string;
    lastName: string;
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

interface AppointmentsState {
  appointments: Appointment[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
  isUpdating: boolean;
  updateError: string | null;
  isCancelling: boolean;
  cancelError: string | null;
}

const initialState: AppointmentsState = {
  appointments: [],
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
  isUpdating: false,
  updateError: null,
  isCancelling: false,
  cancelError: null,
};

// API async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (filters: any = {}, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const user = state.auth.user;
      
      // Add user context to the request
      const params = {
        ...filters,
        branchId: user?.branchId,
        organizationId: user?.organizationId,
      };
      
      const response = await api.get('/appointments', { params });
      return response.data.data || response.data; // Handle both response formats
    } catch (error: any) {
      console.error('Error fetching appointments:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: any, { rejectWithValue }) => {
    try {
      console.log('📡 Sending appointment data to API:', appointmentData);
      const response = await api.post('/appointments', appointmentData);
      console.log('📡 API response:', response.data);
      return response.data;
    } catch (error: any) {
      console.error('📡 API error:', error.response?.data || error.message);
      return rejectWithValue(error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, appointmentData }: { id: string; appointmentData: any }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/appointments/${id}`, appointmentData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async ({ id, cancellationReason }: { id: string; cancellationReason: string }, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/appointments/${id}/cancel`, {
        data: { cancellationReason }
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to cancel appointment');
    }
  }
);

const appointmentsSlice = createSlice({
  name: 'appointments',
  initialState,
  reducers: {
    clearAppointmentErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.cancelError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAppointments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAppointments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.appointments = action.payload;
      })
      .addCase(fetchAppointments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createAppointment.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createAppointment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.appointments.push(action.payload);
      })
      .addCase(createAppointment.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      .addCase(updateAppointment.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.appointments.findIndex(appointment => appointment._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      .addCase(cancelAppointment.pending, (state) => {
        state.isCancelling = true;
        state.cancelError = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.isCancelling = false;
        const index = state.appointments.findIndex(appointment => appointment._id === action.payload._id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(cancelAppointment.rejected, (state, action) => {
        state.isCancelling = false;
        state.cancelError = action.payload as string;
      });
  },
});

export const { clearAppointmentErrors } = appointmentsSlice.actions;
export default appointmentsSlice.reducer;
