import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { userService } from '../../api/services/users';
import type { User } from '../../api/services/users';
import type { DoctorFormData } from '../../../components/Doctor/AddDoctorModal';

interface DoctorsState {
  doctors: User[];
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

export const fetchDoctors = createAsyncThunk(
  'doctors/fetchDoctors',
  async (_, { rejectWithValue }) => {
    try {
      const response = await userService.getDoctors();
      // Based on the Postman collection structure: response.data.users would contain the doctors array
      return response.data?.users || [];
    } catch (error: any) {
      console.log('Error fetching doctors:', error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to fetch doctors');
    }
  }
);

export const createDoctor = createAsyncThunk(
  'doctors/createDoctor',
  async (doctorData: DoctorFormData, { rejectWithValue }) => {
    try {
      const response = await userService.createUser({
        ...doctorData,
        role: 'doctor',
      });
      // Based on the Postman collection structure: response.data.user contains the created user
      return response.data?.data?.user;
    } catch (error: any) {
      console.log('Error creating doctor:', error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to create doctor');
    }
  }
);

export const updateDoctor = createAsyncThunk(
  'doctors/updateDoctor',
  async ({ id, doctorData }: { id: string; doctorData: Partial<DoctorFormData> }, { rejectWithValue }) => {
    try {
      const response = await userService.updateUser(id, doctorData);
      // Based on Postman collection structure
      return response.data?.data || response.data;
    } catch (error: any) {
      console.log('Error updating doctor:', error.response?.data?.message || error.message);
      return rejectWithValue(error.response?.data?.message || error.message || 'Failed to update doctor');
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