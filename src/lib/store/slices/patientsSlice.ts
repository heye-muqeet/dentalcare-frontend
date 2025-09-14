import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Patient {
  id: string;
  name: string;
  email: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  medicalHistory?: string;
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

// Mock async thunks
export const fetchPatients = createAsyncThunk(
  'patients/fetchPatients',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock patients data
      const mockPatients: Patient[] = [
        {
          id: '1',
          name: 'Alice Johnson',
          email: 'alice@example.com',
          phone: '+1234567890',
          dateOfBirth: '1990-01-15',
          address: '123 Main St, City',
          medicalHistory: 'No known allergies'
        },
        {
          id: '2',
          name: 'Bob Wilson',
          email: 'bob@example.com',
          phone: '+1234567891',
          dateOfBirth: '1985-05-20',
          address: '456 Oak Ave, City',
          medicalHistory: 'Allergic to penicillin'
        }
      ];
      
      return mockPatients;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch patients');
    }
  }
);

export const createPatient = createAsyncThunk(
  'patients/createPatient',
  async (patientData: Partial<Patient>, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock created patient
      const newPatient: Patient = {
        id: Date.now().toString(),
        name: patientData.name || 'New Patient',
        email: patientData.email || 'new@example.com',
        phone: patientData.phone,
        dateOfBirth: patientData.dateOfBirth,
        address: patientData.address,
        medicalHistory: patientData.medicalHistory
      };
      
      return newPatient;
    } catch (error: any) {
      return rejectWithValue('Failed to create patient');
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
