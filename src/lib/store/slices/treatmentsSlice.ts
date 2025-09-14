import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Treatment {
  id: string;
  patientId: string;
  doctorId: string;
  name: string;
  description?: string;
  date: string;
  cost: number;
}

interface TreatmentsState {
  treatments: Treatment[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
}

const initialState: TreatmentsState = {
  treatments: [],
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
};

export const fetchTreatments = createAsyncThunk(
  'treatments/fetchTreatments',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockTreatments: Treatment[] = [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          name: 'Root Canal',
          description: 'Root canal treatment on tooth #14',
          date: '2024-01-10',
          cost: 500
        }
      ];
      
      return mockTreatments;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch treatments');
    }
  }
);

const treatmentsSlice = createSlice({
  name: 'treatments',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
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
      });
  },
});

export default treatmentsSlice.reducer;
