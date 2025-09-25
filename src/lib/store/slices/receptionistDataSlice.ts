import { createSlice, createAsyncThunk, type PayloadAction } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { validateSession } from '../../utils/sessionValidation';
import { showErrorToast, showWarningToast } from '../../utils/errorHandler';
import sessionManager from '../../services/sessionManager';

// Interfaces for receptionist data
interface ReceptionistData {
  _id: string;
  name: string; // Updated to match backend schema
  firstName?: string; // For backward compatibility
  lastName?: string; // For backward compatibility
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
  name: string;
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
      
      const state = getState() as any;
      const user = state.auth.user;
      
      console.log('🔍 User data for receptionist initialization:', {
        user: user,
        hasBranchId: !!user?.branchId,
        hasOrganizationId: !!user?.organizationId,
        branchIdType: typeof user?.branchId,
        organizationIdType: typeof user?.organizationId,
        branchIdValue: user?.branchId,
        organizationIdValue: user?.organizationId
      });
      
      // Check if user exists first
      if (!user) {
        console.error('❌ User is null, cannot initialize receptionist data');
        return rejectWithValue('User not found in auth state');
      }
      
      // Check if user has required role
      if (user.role !== 'receptionist') {
        console.error('❌ User is not a receptionist, cannot initialize receptionist data');
        return rejectWithValue('User is not a receptionist');
      }

      // Validate session after confirming user exists
      validateSession();
      
      // Extract IDs - handle both string and object formats
      const branchId = typeof user.branchId === 'string' 
        ? user.branchId 
        : user.branchId?._id || user.branchId?.id;
        
      const organizationId = typeof user.organizationId === 'string' 
        ? user.organizationId 
        : user.organizationId?._id || user.organizationId?.id;
      
      if (!branchId || !organizationId) {
        console.error('❌ User data missing required IDs:', {
          user: user,
          branchId: branchId,
          organizationId: organizationId,
          branchIdType: typeof user.branchId,
          organizationIdType: typeof user.organizationId,
          allUserKeys: Object.keys(user || {}),
          userStringified: JSON.stringify(user, null, 2)
        });
        
        // For now, let's just return a more informative error
        // The user might need to log out and log back in to get proper data
        return rejectWithValue(`User data incomplete. Missing ${!branchId ? 'branchId' : ''} ${!organizationId ? 'organizationId' : ''}. Please log out and log back in.`);
      }
      
      console.log('🔍 Fetching data for branch:', branchId, 'organization:', organizationId);
      
      // Fetch all data in parallel with individual error handling
      let branchResponse, doctorsResponse, patientsResponse, appointmentsResponse;
      
      try {
        console.log('🔍 Fetching branch data...');
        branchResponse = await api.get(`/branches/${branchId}`);
        console.log('✅ Branch data fetched successfully');
      } catch (error: any) {
        console.error('❌ Failed to fetch branch data:', error);
        throw new Error(`Failed to fetch branch data: ${error.response?.data?.message || error.message}`);
      }
      
      try {
        console.log('🔍 Fetching doctors data...');
        doctorsResponse = await api.get(`/branches/${branchId}/doctors`);
        console.log('✅ Doctors data fetched successfully');
      } catch (error: any) {
        console.error('❌ Failed to fetch doctors data:', error);
        throw new Error(`Failed to fetch doctors data: ${error.response?.data?.message || error.message}`);
      }
      
      try {
        console.log('🔍 Fetching patients data...');
        patientsResponse = await api.get(`/branches/${branchId}/patients`);
        console.log('✅ Patients data fetched successfully');
      } catch (error: any) {
        console.error('❌ Failed to fetch patients data:', error);
        throw new Error(`Failed to fetch patients data: ${error.response?.data?.message || error.message}`);
      }
      
      try {
        console.log('🔍 Fetching appointments data...');
        appointmentsResponse = await api.get('/appointments', {
          params: {
            branchId: branchId,
            organizationId: organizationId,
            limit: 1000, // Get more appointments
            sort: 'appointmentDate:desc'
          }
        });
        console.log('✅ Appointments data fetched successfully');
      } catch (error: any) {
        console.error('❌ Failed to fetch appointments data:', error);
        throw new Error(`Failed to fetch appointments data: ${error.response?.data?.message || error.message}`);
      }
      
      console.log('✅ All data fetched successfully');
      
      const doctorsData = doctorsResponse.data.data || doctorsResponse.data;
      const patientsData = patientsResponse.data.data || patientsResponse.data;
      const appointmentsData = appointmentsResponse.data.data || appointmentsResponse.data;
      
      console.log('🔍 Receptionist Data - Fetched Data Debug:', {
        doctorsData: doctorsData,
        doctorsLength: doctorsData?.length,
        patientsData: patientsData,
        patientsLength: patientsData?.length,
        appointmentsData: appointmentsData,
        appointmentsLength: appointmentsData?.length,
        doctorsResponse: doctorsResponse.data,
        patientsResponse: patientsResponse.data,
        appointmentsResponse: appointmentsResponse.data
      });
      
      console.log('🔍 Doctors API Response Debug:', {
        doctorsResponseStatus: doctorsResponse.status,
        doctorsResponseData: doctorsResponse.data,
        doctorsResponseDataSuccess: doctorsResponse.data?.success,
        doctorsResponseDataData: doctorsResponse.data?.data,
        doctorsResponseDataDataLength: doctorsResponse.data?.data?.length
      });
      
      return {
        receptionist: {
          _id: user._id,
          name: user.name || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
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
        doctors: doctorsData,
        patients: patientsData,
        appointments: appointmentsData,
        lastUpdated: Date.now()
      };
      
    } catch (error: any) {
      console.error('❌ Error initializing receptionist data:', error);
      console.error('❌ Error details:', {
        message: error.message,
        status: error.response?.status,
        statusText: error.response?.statusText,
        data: error.response?.data,
        url: error.config?.url,
        method: error.config?.method
      });
      
      // Handle session expiry specifically
      if (error.message === 'No active session' || error.message === 'Session validation failed' || error.response?.status === 401) {
        console.log('Session expired or invalid - redirecting to login');
        // Clear session and redirect to login
        sessionManager.clearSession();
        window.location.href = '/login';
        return rejectWithValue('Session expired. Please log in again.');
      }
      
      // Handle specific API errors
      if (error.response?.status === 403) {
        return rejectWithValue('Access denied. Please check your permissions.');
      }
      
      if (error.response?.status === 404) {
        return rejectWithValue('Resource not found. Please check your branch/organization data.');
      }
      
      if (error.response?.status >= 500) {
        return rejectWithValue('Server error. Please try again later.');
      }
      
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to initialize receptionist data');
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
      
      // Extract IDs - handle both string and object formats
      const branchId = typeof user.branchId === 'string' 
        ? user.branchId 
        : user.branchId?._id || user.branchId?.id;
        
      const organizationId = typeof user.organizationId === 'string' 
        ? user.organizationId 
        : user.organizationId?._id || user.organizationId?.id;
      
      if (!branchId || !organizationId) {
        return rejectWithValue('User missing branch or organization data');
      }
      
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
        console.log('🔍 Redux State Update - Doctors Data:', {
          doctorsPayload: action.payload.doctors,
          doctorsLength: action.payload.doctors?.length,
          stateDoctors: state.doctors,
          stateDoctorsLength: state.doctors?.length
        });
      })
      .addCase(initializeReceptionistData.rejected, (state, action) => {
        state.isInitializing = false;
        state.initializationError = action.payload as string;
        console.error('❌ Failed to initialize receptionist data:', action.payload);
        showErrorToast(action.payload as string, 'Failed to initialize dashboard data');
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
        showWarningToast('Data Refresh Failed', 'Could not refresh dashboard data. Some information may be outdated.');
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
