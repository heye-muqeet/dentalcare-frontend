import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { treatmentService } from '../../api/services/treatments';
import type { Treatment, CreateTreatmentData, UpdateTreatmentData } from '../../api/services/treatments';

interface TreatmentsState {
  treatments: Treatment[];
  currentTreatment: Treatment | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
}

const initialState: TreatmentsState = {
  treatments: [],
  currentTreatment: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
};

// Async thunks
export const fetchTreatments = createAsyncThunk(
  'treatments/fetchTreatments',
  async (_, { rejectWithValue }) => {
    try {
      return await treatmentService.getTreatments();
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to fetch treatments');
    }
  }
);

export const fetchTreatment = createAsyncThunk(
  'treatments/fetchTreatment',
  async (id: string, { rejectWithValue }) => {
    try {
      return await treatmentService.getTreatment(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to fetch treatment');
    }
  }
);

export const createTreatment = createAsyncThunk(
  'treatments/createTreatment',
  async (treatmentData: CreateTreatmentData, { rejectWithValue }) => {
    try {
      return await treatmentService.createTreatment(treatmentData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to create treatment');
    }
  }
);

export const updateTreatment = createAsyncThunk(
  'treatments/updateTreatment',
  async ({ id, treatmentData }: { id: string; treatmentData: UpdateTreatmentData }, { rejectWithValue }) => {
    try {
      return await treatmentService.updateTreatment(id, treatmentData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to update treatment');
    }
  }
);

export const deleteTreatment = createAsyncThunk(
  'treatments/deleteTreatment',
  async (id: string, { rejectWithValue }) => {
    try {
      await treatmentService.deleteTreatment(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to delete treatment');
    }
  }
);

const treatmentsSlice = createSlice({
  name: 'treatments',
  initialState,
  reducers: {
    clearTreatmentErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
    },
    clearCurrentTreatment: (state) => {
      state.currentTreatment = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch treatments
      .addCase(fetchTreatments.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTreatments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.treatments = action.payload;
      })
      .addCase(fetchTreatments.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch treatment
      .addCase(fetchTreatment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTreatment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentTreatment = action.payload;
      })
      .addCase(fetchTreatment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create treatment
      .addCase(createTreatment.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createTreatment.fulfilled, (state, action) => {
        state.isCreating = false;
        state.treatments.push(action.payload);
        state.currentTreatment = action.payload;
      })
      .addCase(createTreatment.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      // Update treatment
      .addCase(updateTreatment.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateTreatment.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.treatments.findIndex(t => t.id === action.payload.id);
        if (index !== -1) {
          state.treatments[index] = action.payload;
        }
        state.currentTreatment = action.payload;
      })
      .addCase(updateTreatment.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      // Delete treatment
      .addCase(deleteTreatment.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteTreatment.fulfilled, (state, action) => {
        state.isDeleting = false;
        state.treatments = state.treatments.filter(t => t.id !== action.payload);
        if (state.currentTreatment?.id === action.payload) {
          state.currentTreatment = null;
        }
      })
      .addCase(deleteTreatment.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      });
  },
});

export const { clearTreatmentErrors, clearCurrentTreatment } = treatmentsSlice.actions;
export default treatmentsSlice.reducer; 