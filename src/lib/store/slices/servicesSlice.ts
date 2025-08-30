import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { serviceService, type Service, type CreateServiceData } from '../../api/services/services';

interface ServicesState {
  services: Service[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
  isUpdating: boolean;
  updateError: string | null;
  isDeleting: boolean;
  deleteError: string | null;
}

const initialState: ServicesState = {
  services: [],
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
  isUpdating: false,
  updateError: null,
  isDeleting: false,
  deleteError: null,
};

export const fetchServices = createAsyncThunk(
  'services/fetchServices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await serviceService.getServices();
      console.log(response.data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch services');
    }
  }
);

export const createService = createAsyncThunk(
  'services/createService',
  async (serviceData: CreateServiceData, { rejectWithValue }) => {
    try {
      const response = await serviceService.createService(serviceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to create service');
    }
  }
);

export const updateService = createAsyncThunk(
  'services/updateService',
  async ({ id, serviceData }: { id: string; serviceData: Partial<CreateServiceData> }, { rejectWithValue }) => {
    try {
      const response = await serviceService.updateService(id, serviceData);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to update service');
    }
  }
);

export const deleteService = createAsyncThunk(
  'services/deleteService',
  async (id: string, { rejectWithValue }) => {
    try {
      await serviceService.deleteService(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to delete service');
    }
  }
);

const servicesSlice = createSlice({
  name: 'services',
  initialState,
  reducers: {
    clearServiceErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Services
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
      })
      // Create Service
      .addCase(createService.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createService.fulfilled, (state, action) => {
        state.isCreating = false;
        state.services.push(action.payload);
      })
      .addCase(createService.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      // Update Service
      .addCase(updateService.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateService.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.services.findIndex(service => service.id === action.payload.id);
        if (index !== -1) {
          state.services[index] = action.payload;
        }
      })
      .addCase(updateService.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      // Delete Service
      .addCase(deleteService.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteService.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.services = state.services.filter(service => service.id !== action.payload);
      })
      .addCase(deleteService.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearServiceErrors } = servicesSlice.actions;
export default servicesSlice.reducer; 