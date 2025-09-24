import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';

interface Patient {
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
  isActive: boolean;
}

interface PatientsState {
  patients: Patient[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  isUpdating: boolean;
}

const initialState: PatientsState = {
  patients: [],
  isLoading: false,
  error: null,
  isCreating: false,
  isUpdating: false,
};

// API async thunks
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const user = state.auth.user;
      
      if (!user?.branchId) {
        return rejectWithValue('No branch ID available');
      }
      
      // Extract branchId - handle both string and object formats
      const branchId = typeof user.branchId === 'string' 
        ? user.branchId 
        : user.branchId?._id || user.branchId?.id;
      
      if (!branchId) {
        return rejectWithValue('Invalid branch ID format');
      }
      
      console.log('Fetching patients for branch:', branchId);
      
      const response = await api.get(`/branches/${branchId}/patients`);
      console.log('Patients API response:', response.data);
      
      return response.data.data || response.data; // Handle both response formats
    } catch (error: any) {
      console.error('Error fetching patients:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData: Partial<Patient>, { rejectWithValue, getState }) => {
    try {
      const state = getState() as any;
      const user = state.auth.user;
      
      if (!user?.branchId) {
        return rejectWithValue('No branch ID available');
      }
      
      // Extract branchId - handle both string and object formats
      const branchId = typeof user.branchId === 'string' 
        ? user.branchId 
        : user.branchId?._id || user.branchId?.id;
      
      if (!branchId) {
        return rejectWithValue('Invalid branch ID format');
      }
      
      console.log('Creating patient for branch:', branchId, 'with data:', patientData);
      
      const response = await api.post(`/branches/${branchId}/patients`, patientData);
      console.log('Create patient API response:', response.data);
      
      return response.data.data || response.data;
    } catch (error: any) {
      console.error('Error creating patient:', error);
      return rejectWithValue(error.response?.data?.message || 'Failed to create patient');
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, patientData }: { id: string; patientData: Partial<Patient> }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock updated patient
      const updatedPatient: Patient = {
        id,
        name: patientData.name || 'Updated Patient',
        email: patientData.email || 'updated@example.com',
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        address: patientData.address,
        medicalHistory: patientData.medicalHistory
      };
      
      return updatedPatient;
    } catch (error: any) {
      return rejectWithValue('Failed to update patient');
    }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchPatients.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPatients.fulfilled, (state, action) => {
        state.isLoading = false;
        state.patients = action.payload;
      })
      .addCase(fetchPatients.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createPatient.pending, (state) => {
        state.isCreating = true;
        state.error = null;
      })
      .addCase(createPatient.fulfilled, (state, action) => {
        state.isCreating = false;
        state.patients.push(action.payload);
      })
      .addCase(createPatient.rejected, (state, action) => {
        state.isCreating = false;
        state.error = action.payload as string;
      })
      .addCase(updatePatient.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.patients.findIndex(patient => patient.id === action.payload.id);
        if (index !== -1) {
          state.patients[index] = action.payload;
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export default patientsSlice.reducer;
