import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { patientService } from '../../api/services/patients';
import type { Patient, CreatePatientData } from '../../api/services/patients';

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

export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      const response = await patientService.getPatients();
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch patients');
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData: CreatePatientData, { rejectWithValue }) => {
    try {
      const response = await patientService.createPatient(patientData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create patient');
    }
  }
);

export const updatePatient = createAsyncThunk(
  'patients/updatePatient',
  async ({ id, patientData }: { id: string; patientData: Partial<CreatePatientData> }, { rejectWithValue }) => {
    try {
      const response = await patientService.updatePatient(id, patientData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update patient');
    }
  }
);

const patientsSlice = createSlice({
  name: 'patients',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch Patients
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
      // Create Patient
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
      // Update Patient
      .addCase(updatePatient.pending, (state) => {
        state.isUpdating = true;
        state.error = null;
      })
      .addCase(updatePatient.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.patients.findIndex(p => p.id === action.payload.id);
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