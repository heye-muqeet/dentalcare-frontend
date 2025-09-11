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
      console.log("Doctors API response:", response);
      console.log("Raw response type:", typeof response);
      console.log("Response has items property:", Boolean(response?.items));
      
      // EMERGENCY FIX: Log the entire response
      const responseStr = JSON.stringify(response, null, 2);
      console.log("Full serialized response:", responseStr);
      
      // Check different possible response structures
      let doctorsData = [];
      
      // Forced extraction approach for debugging
      if (response && typeof response === 'object') {
        if (Array.isArray(response)) {
          doctorsData = response;
          console.log("Response is an array, using directly");
        } else if (response.items) {
          doctorsData = response.items;
          console.log("Found items directly in response:", doctorsData);
        } else if (response.data?.items) {
          doctorsData = response.data.items;
          console.log("Found items in response.data:", doctorsData);
        }
      }
      
      // Force convert any doctors that don't have proper ID
      doctorsData = doctorsData.map((doctor: any) => {
        if (!doctor.id && doctor._id) {
          return { ...doctor, id: doctor._id };
        }
        return doctor;
      });
      
      console.log("Final processed doctors data:", doctorsData);
      return doctorsData;
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
      // Log the full response to debug the structure
      console.log('Create doctor response:', response);
      // Extract the user based on observed structure
      const newDoctor = response?.data || response;
      console.log('Extracted doctor data:', newDoctor);
      
      // Return user data or null if not found
      return newDoctor;
    } catch (error: any) {
      // Log detailed error information
      console.log('Error creating doctor, full error:', error);
      console.log('Error response data:', error.response?.data);
      console.log('Error message from backend:', error.response?.data?.message);
      
      // Return the most specific error message available
      const errorMessage = error.response?.data?.message || error.message || 'Failed to create doctor';
      console.log('Final error message being sent to component:', errorMessage);
      return rejectWithValue(errorMessage);
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
        // Only push to doctors array if we have a valid doctor with an ID
        if (action.payload && action.payload.id) {
          state.doctors.push(action.payload);
        } else {
          console.warn('Received invalid doctor data:', action.payload);
        }
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