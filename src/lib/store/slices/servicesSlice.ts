import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Service {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration?: number; // in minutes
}

interface ServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
}

const initialState: ServicesState = {
  services: [],
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
};

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockServices: Service[] = [
        {
          id: '1',
          name: 'Dental Cleaning',
          description: 'Professional teeth cleaning',
          price: 100,
          duration: 60
        },
        {
          id: '2',
          name: 'Tooth Extraction',
          description: 'Simple tooth extraction',
          price: 200,
          duration: 30
        }
      ];
      
      return mockServices;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch services');
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchServices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchServices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.services = action.payload;
      })
      .addCase(fetchServices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default servicesSlice.reducer;
