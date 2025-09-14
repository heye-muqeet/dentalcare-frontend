import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  specialization?: string;
  role: string;
}

interface DoctorsState {
  doctors: Doctor[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
  isUpdating: boolean;
  updateError: string | null;
}

const initialState: DoctorsState = {
  doctors: [],
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
  isUpdating: false,
  updateError: null,
};

// Mock async thunks
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock doctors data
      const mockDoctors: Doctor[] = [
        {
          id: '1',
          name: 'Dr. John Smith',
          email: 'john.smith@example.com',
          phone: '+1234567890',
          specialization: 'General Dentistry',
          role: 'doctor'
        },
        {
          id: '2',
          name: 'Dr. Jane Doe',
          email: 'jane.doe@example.com',
          phone: '+1234567891',
          specialization: 'Orthodontics',
          role: 'doctor'
        }
      ];
      
      return mockDoctors;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch doctors');
    }
  }
);

export const createDoctor = createAsyncThunk(
  'doctors/createDoctor',
  async (doctorData: Partial<Doctor>, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock created doctor
      const newDoctor: Doctor = {
        id: Date.now().toString(),
        name: doctorData.name || 'New Doctor',
        email: doctorData.email || 'new@example.com',
        phone: doctorData.phone,
        specialization: doctorData.specialization,
        role: 'doctor'
      };
      
      return newDoctor;
    } catch (error: any) {
      return rejectWithValue('Failed to create doctor');
    }
  }
);

export const updateDoctor = createAsyncThunk(
  'doctors/updateDoctor',
  async ({ id, doctorData }: { id: string; doctorData: Partial<Doctor> }, { rejectWithValue }) => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Mock updated doctor
      const updatedDoctor: Doctor = {
        id,
        name: doctorData.name || 'Updated Doctor',
        email: doctorData.email || 'updated@example.com',
        phone: doctorData.phone,
        specialization: doctorData.specialization,
        role: 'doctor'
      };
      
      return updatedDoctor;
    } catch (error: any) {
      return rejectWithValue('Failed to update doctor');
    }
  }
);

const doctorsSlice = createSlice({
  name: 'doctors',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchDoctors.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchDoctors.fulfilled, (state, action) => {
        state.isLoading = false;
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(createDoctor.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createDoctor.fulfilled, (state, action) => {
        state.isCreating = false;
        state.doctors.push(action.payload);
      })
      .addCase(createDoctor.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      .addCase(updateDoctor.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateDoctor.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.doctors.findIndex(doctor => doctor.id === action.payload.id);
        if (index !== -1) {
          state.doctors[index] = action.payload;
        }
      })
      .addCase(updateDoctor.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      });
  },
});

export default doctorsSlice.reducer;
