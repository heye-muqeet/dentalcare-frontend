import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api/axios';
import { validateSession } from '../../utils/sessionValidation';

interface Doctor {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  specialization?: string;
  role: string;
  isActive: boolean;
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

// API async thunks
export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue, getState }) => {
    try {
      // Validate session before making API call
      validateSession();
      
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
      
      console.log('🔍 Fetching doctors for branch:', branchId);
      console.log('🔍 User object:', user);
      console.log('🔍 User branchId:', user.branchId);
      
      const response = await api.get(`/branches/${branchId}/doctors`);
      console.log('🔍 Doctors API response:', response.data);
      
      return response.data.data || response.data; // Handle both response formats
    } catch (error: any) {
      console.error('Error fetching doctors:', error);
      
      // Handle session expiry specifically
      if (error.message === 'No active session' || error.response?.status === 401) {
        return rejectWithValue('Session expired. Please log in again.');
      }
      
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch doctors');
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
        _id: Date.now().toString(),
        firstName: doctorData.firstName || 'New',
        lastName: doctorData.lastName || 'Doctor',
        email: doctorData.email || 'new@example.com',
        phone: doctorData.phone,
        specialization: doctorData.specialization,
        role: 'doctor',
        isActive: true
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
        _id: id,
        firstName: doctorData.firstName || 'Updated',
        lastName: doctorData.lastName || 'Doctor',
        email: doctorData.email || 'updated@example.com',
        phone: doctorData.phone,
        specialization: doctorData.specialization,
        role: 'doctor',
        isActive: true
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
        console.log('🔍 Doctors fetched successfully:', action.payload);
        state.doctors = action.payload;
      })
      .addCase(fetchDoctors.rejected, (state, action) => {
        state.isLoading = false;
        console.log('🔍 Doctors fetch rejected:', action.payload);
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
        const index = state.doctors.findIndex(doctor => doctor._id === action.payload._id);
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
