import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { appointmentService, type Appointment, type CreateAppointmentData } from '../../api/services/appointments';

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

export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointments();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch appointments');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: CreateAppointmentData, { rejectWithValue }) => {
    try {
      const response = await appointmentService.createAppointment(appointmentData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, appointmentData }: { id: string; appointmentData: Partial<CreateAppointmentData> }, { rejectWithValue }) => {
    try {
      const response = await appointmentService.updateAppointment(id, appointmentData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update appointment');
    }
  }
);

export const getAppointment = createAsyncThunk(
  'appointments/getAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await appointmentService.getAppointment(id);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await appointmentService.cancelAppointment(id);
      return { ...response, appointmentId: id };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to cancel appointment');
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
      // Fetch Appointments
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
      // Create Appointment
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
      // Update Appointment
      .addCase(updateAppointment.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateAppointment.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        }
      })
      .addCase(updateAppointment.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      // Get Single Appointment
      .addCase(getAppointment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(getAppointment.fulfilled, (state, action) => {
        state.isLoading = false;
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index] = action.payload;
        } else {
          state.appointments.push(action.payload);
        }
      })
      .addCase(getAppointment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Cancel Appointment
      .addCase(cancelAppointment.pending, (state) => {
        state.isCancelling = true;
        state.cancelError = null;
      })
      .addCase(cancelAppointment.fulfilled, (state, action) => {
        state.isCancelling = false;
        const appointmentId = action.payload.appointmentId || action.payload.id;
        const index = state.appointments.findIndex(appointment => appointment.id === appointmentId);
        if (index !== -1) {
          // If the response contains the full updated appointment, use it
          if (action.payload.id && action.payload.status) {
            state.appointments[index] = action.payload;
          } else {
            // Otherwise, just update the status to cancelled
            state.appointments[index].status = 'cancelled';
          }
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