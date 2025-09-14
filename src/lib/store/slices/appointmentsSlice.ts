import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Appointment {
  id: string;
  patientId: string;
  doctorId: string;
  date: string;
  time: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  notes?: string;
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

// Mock async thunks
export const fetchAppointments = createAsyncThunk(
  'appointments/fetchAppointments',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockAppointments: Appointment[] = [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          date: '2024-01-15',
          time: '10:00',
          status: 'scheduled',
          notes: 'Regular checkup'
        },
        {
          id: '2',
          patientId: '2',
          doctorId: '2',
          date: '2024-01-16',
          time: '14:30',
          status: 'scheduled',
          notes: 'Cleaning appointment'
        }
      ];
      
      return mockAppointments;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch appointments');
    }
  }
);

export const createAppointment = createAsyncThunk(
  'appointments/createAppointment',
  async (appointmentData: Partial<Appointment>, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const newAppointment: Appointment = {
        id: Date.now().toString(),
        patientId: appointmentData.patientId || '',
        doctorId: appointmentData.doctorId || '',
        date: appointmentData.date || '',
        time: appointmentData.time || '',
        status: 'scheduled',
        notes: appointmentData.notes
      };
      
      return newAppointment;
    } catch (error: any) {
      return rejectWithValue('Failed to create appointment');
    }
  }
);

export const updateAppointment = createAsyncThunk(
  'appointments/updateAppointment',
  async ({ id, appointmentData }: { id: string; appointmentData: Partial<Appointment> }, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const updatedAppointment: Appointment = {
        id,
        patientId: appointmentData.patientId || '',
        doctorId: appointmentData.doctorId || '',
        date: appointmentData.date || '',
        time: appointmentData.time || '',
        status: appointmentData.status || 'scheduled',
        notes: appointmentData.notes
      };
      
      return updatedAppointment;
    } catch (error: any) {
      return rejectWithValue('Failed to update appointment');
    }
  }
);

export const cancelAppointment = createAsyncThunk(
  'appointments/cancelAppointment',
  async (id: string, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      return { id, status: 'cancelled' as const };
    } catch (error: any) {
      return rejectWithValue('Failed to cancel appointment');
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
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
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
        const index = state.appointments.findIndex(appointment => appointment.id === action.payload.id);
        if (index !== -1) {
          state.appointments[index].status = 'cancelled';
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
