import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { validateSession } from '../../utils/sessionValidation';

// Interfaces for receptionist data
interface ReceptionistData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  branchId: string;
  organizationId: string;
  role: string;
  isActive: boolean;
}

interface BranchData {
  _id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  phone: string;
  email: string;
  organizationId: string;
  operatingHours: {
    [key: string]: {
      open: string;
      close: string;
      isOpen: boolean;
    };
  };
  isActive: boolean;
}

interface DoctorData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  role: string;
  branchId: string;
  organizationId: string;
  isActive: boolean;
}

interface PatientData {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  area?: string;
  city?: string;
  medicalHistory?: {
    allergies: string[];
    medications: string[];
    conditions: string[];
    previousSurgeries: string[];
  };
  branchId: string;
  organizationId: string;
  isActive: boolean;
}

interface AppointmentData {
  _id: string;
  patientId: string;
  doctorId?: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  visitType: 'walk_in' | 'scheduled';
  reasonForVisit: string;
  notes?: string;
  duration: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled' | 'no_show';
  isEmergency: boolean;
  isWalkIn: boolean;
  branchId: string;
  organizationId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

interface ReceptionistDataState {
  // Core data
  receptionist: ReceptionistData | null;
  branch: BranchData | null;
  doctors: DoctorData[];
  patients: PatientData[];
  appointments: AppointmentData[];
  
  // Loading states
  isLoading: boolean;
  isInitializing: boolean;
  
  // Error states
  error: string | null;
  initializationError: string | null;
  
  // Data freshness
  lastUpdated: number | null;
  dataExpiryTime: number; // 5 minutes in milliseconds
}

const initialState: ReceptionistDataState = {
  receptionist: null,
  branch: null,
  doctors: [],
  patients: [],
  appointments: [],
  isLoading: false,
  isInitializing: false,
  error: null,
  initializationError: null,
  lastUpdated: null,
  dataExpiryTime: 5 * 60 * 1000, // 5 minutes
};

// Pre-load all receptionist data
export const initializeReceptionistData = createAsyncThunk(
  'receptionistData/initialize',
  async (_, { rejectWithValue, getState }) => {
    try {
      console.log('🚀 Initializing receptionist data...');
      
      // Validate session before making API calls
      validateSession();
      
      const state = getState() as any;
      const user = state.auth.user;
      
      if (!user?.branchId || !user?.organizationId) {
        return rejectWithValue('User missing branch or organization data');
      }
      
      // Extract IDs - handle both string and object formats
      const branchId = typeof user.branchId === 'string' 
        ? user.branchId 
        : user.branchId?._id || user.branchId?.id;
        
      const organizationId = typeof user.organizationId === 'string' 
        ? user.organizationId 
        : user.organizationId?._id || user.organizationId?.id;
      
      if (!branchId || !organizationId) {
        return rejectWithValue('Invalid branch or organization ID format');
      }
      
      console.log('🔍 Fetching data for branch:', branchId, 'organization:', organizationId);
      
      // Fetch all data in parallel
      const [
        branchResponse,
        doctorsResponse,
        patientsResponse,
        appointmentsResponse
      ] = await Promise.all([
        // Fetch branch data
        api.get(`/branches/${branchId}`),
        
        // Fetch doctors for the branch
        api.get(`/branches/${branchId}/doctors`),
        
        // Fetch patients for the branch
        api.get(`/branches/${branchId}/patients`),
        
        // Fetch appointments for the branch
        api.get('/appointments', {
          params: {
            branchId: branchId,
            organizationId: organizationId,
            limit: 1000, // Get more appointments
            sort: 'appointmentDate:desc'
          }
        })
      ]);
      
      console.log('✅ All data fetched successfully');
      
      return {
        receptionist: {
          _id: user._id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          branchId: branchId,
          organizationId: organizationId,
          role: user.role,
          isActive: user.isActive
        },
        branch: branchResponse.data.data || branchResponse.data,
        doctors: doctorsResponse.data.data || doctorsResponse.data,
        patients: patientsResponse.data.data || patientsResponse.data,
        appointments: appointmentsResponse.data.data || appointmentsResponse.data,
        lastUpdated: Date.now()
      };
      
    } catch (error: any) {
      console.error('❌ Error initializing receptionist data:', error);
      
      // Handle session expiry specifically
      if (error.message === 'No active session' || error.response?.status === 401) {
        return rejectWithValue('Session expired. Please log in again.');
      }
      
      return rejectWithValue(error.response?.data?.message || 'Failed to initialize receptionist data');
    }
  }
);

// Refresh specific data
export const refreshReceptionistData = createAsyncThunk(
  'receptionistData/refresh',
  async (dataType: 'doctors' | 'patients' | 'appointments' | 'all', { rejectWithValue, getState }) => {
    try {
      validateSession();
      
      const state = getState() as any;
      const user = state.auth.user;
      const currentData = state.receptionistData;
      
      if (!user?.branchId || !user?.organizationId) {
        return rejectWithValue('User missing branch or organization data');
      }
      
      const branchId = typeof user.branchId === 'string' 
        ? user.branchId 
        : user.branchId?._id || user.branchId?.id;
        
      const organizationId = typeof user.organizationId === 'string' 
        ? user.organizationId 
        : user.organizationId?._id || user.organizationId?.id;
      
      const updates: any = { lastUpdated: Date.now() };
      
      if (dataType === 'all' || dataType === 'doctors') {
        const doctorsResponse = await api.get(`/branches/${branchId}/doctors`);
        updates.doctors = doctorsResponse.data.data || doctorsResponse.data;
      }
      
      if (dataType === 'all' || dataType === 'patients') {
        const patientsResponse = await api.get(`/branches/${branchId}/patients`);
        updates.patients = patientsResponse.data.data || patientsResponse.data;
      }
      
      if (dataType === 'all' || dataType === 'appointments') {
        const appointmentsResponse = await api.get('/appointments', {
          params: {
            branchId: branchId,
            organizationId: organizationId,
            limit: 1000,
            sort: 'appointmentDate:desc'
          }
        });
        updates.appointments = appointmentsResponse.data.data || appointmentsResponse.data;
      }
      
      return updates;
      
    } catch (error: any) {
      console.error('Error refreshing receptionist data:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to refresh data');
    }
  }
);

const receptionistDataSlice = createSlice({
  name: 'receptionistData',
  initialState,
  reducers: {
    clearReceptionistData: (state) => {
      return initialState;
    },
    updateAppointment: (state, action: PayloadAction<AppointmentData>) => {
      const index = state.appointments.findIndex(apt => apt._id === action.payload._id);
      if (index !== -1) {
        state.appointments[index] = action.payload;
      }
    },
    addAppointment: (state, action: PayloadAction<AppointmentData>) => {
      state.appointments.unshift(action.payload);
    },
    removeAppointment: (state, action: PayloadAction<string>) => {
      state.appointments = state.appointments.filter(apt => apt._id !== action.payload);
    },
    updatePatient: (state, action: PayloadAction<PatientData>) => {
      const index = state.patients.findIndex(patient => patient._id === action.payload._id);
      if (index !== -1) {
        state.patients[index] = action.payload;
      }
    },
    addPatient: (state, action: PayloadAction<PatientData>) => {
      state.patients.unshift(action.payload);
    },
    updateDoctor: (state, action: PayloadAction<DoctorData>) => {
      const index = state.doctors.findIndex(doctor => doctor._id === action.payload._id);
      if (index !== -1) {
        state.doctors[index] = action.payload;
      }
    },
    addDoctor: (state, action: PayloadAction<DoctorData>) => {
      state.doctors.unshift(action.payload);
    }
  },
  extraReducers: (builder) => {
    builder
      // Initialize receptionist data
      .addCase(initializeReceptionistData.pending, (state) => {
        state.isInitializing = true;
        state.initializationError = null;
      })
      .addCase(initializeReceptionistData.fulfilled, (state, action) => {
        state.isInitializing = false;
        state.receptionist = action.payload.receptionist;
        state.branch = action.payload.branch;
        state.doctors = action.payload.doctors;
        state.patients = action.payload.patients;
        state.appointments = action.payload.appointments;
        state.lastUpdated = action.payload.lastUpdated;
        state.error = null;
        console.log('✅ Receptionist data initialized successfully');
      })
      .addCase(initializeReceptionistData.rejected, (state, action) => {
        state.isInitializing = false;
        state.initializationError = action.payload as string;
        console.error('❌ Failed to initialize receptionist data:', action.payload);
      })
      
      // Refresh data
      .addCase(refreshReceptionistData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(refreshReceptionistData.fulfilled, (state, action) => {
        state.isLoading = false;
        if (action.payload.doctors) state.doctors = action.payload.doctors;
        if (action.payload.patients) state.patients = action.payload.patients;
        if (action.payload.appointments) state.appointments = action.payload.appointments;
        state.lastUpdated = action.payload.lastUpdated;
        console.log('✅ Receptionist data refreshed successfully');
      })
      .addCase(refreshReceptionistData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        console.error('❌ Failed to refresh receptionist data:', action.payload);
      });
  },
});

export const {
  clearReceptionistData,
  updateAppointment,
  addAppointment,
  removeAppointment,
  updatePatient,
  addPatient,
  updateDoctor,
  addDoctor
} = receptionistDataSlice.actions;

export default receptionistDataSlice.reducer;
