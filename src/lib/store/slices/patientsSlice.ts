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
      console.log('fetchPatients: Fetching patients from API');
      const response = await patientService.getPatients();
      console.log('fetchPatients: Raw API response:', response);
      
      // Return the full response to let the reducer handle different structures
      return response;
    } catch (error: any) {
      console.error('fetchPatients: Error fetching patients:', error);
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
        
        // Handle different response structures
        let patientsData = [];
        const response = action.payload;
        
        if (response) {
          if (Array.isArray(response)) {
            patientsData = response;
          } else if (response.items) {
            patientsData = response.items;
          } else if (response.data?.items) {
            patientsData = response.data.items;
          } else if (response.data) {
            patientsData = Array.isArray(response.data) ? response.data : [];
          }
        }
        
        // Ensure each patient has an id property (MongoDB uses _id)
        state.patients = patientsData.map((patient: any) => {
          if (!patient.id && patient._id) {
            return { ...patient, id: patient._id };
          }
          return patient;
        });
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
        
        // Handle different response structures
        const newPatient = action.payload;
        
        // Ensure patients array exists
        if (!state.patients) {
          state.patients = [];
        }
        
        // Add the new patient to the array
        if (newPatient) {
          // Ensure the patient has an id (might be _id from MongoDB)
          const patientWithId = newPatient._id && !newPatient.id 
            ? { ...newPatient, id: newPatient._id } 
            : newPatient;
            
          state.patients.push(patientWithId);
        }
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
        
        // Handle different response structures and ID formats
        const updatedPatient = action.payload;
        
        if (updatedPatient) {
          // Ensure the patient has an id (might be _id from MongoDB)
          const patientId = updatedPatient.id || updatedPatient._id;
          
          // Find the patient by either id or _id
          const index = state.patients.findIndex(p => {
            const currentId = p.id || (p as any)._id;
            return currentId === patientId;
          });
          
          if (index !== -1) {
            // Preserve the id field if it exists in the current state
            const currentId = state.patients[index].id;
            state.patients[index] = {
              ...updatedPatient,
              id: currentId || patientId
            };
          }
        }
      })
      .addCase(updatePatient.rejected, (state, action) => {
        state.isUpdating = false;
        state.error = action.payload as string;
      });
  },
});

export default patientsSlice.reducer; 