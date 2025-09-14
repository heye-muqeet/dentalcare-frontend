import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Invoice {
  id: string;
  patientId: string;
  doctorId: string;
  amount: number;
  status: 'pending' | 'paid' | 'overdue';
  date: string;
  dueDate: string;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
}

interface InvoicesState {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockInvoices: Invoice[] = [
        {
          id: '1',
          patientId: '1',
          doctorId: '1',
          amount: 300,
          status: 'paid',
          date: '2024-01-10',
          dueDate: '2024-01-24',
          items: [
            { name: 'Dental Cleaning', quantity: 1, price: 100 },
            { name: 'X-Ray', quantity: 2, price: 100 }
          ]
        }
      ];
      
      return mockInvoices;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch invoices');
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchInvoices.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchInvoices.fulfilled, (state, action) => {
        state.isLoading = false;
        state.invoices = action.payload;
      })
      .addCase(fetchInvoices.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default invoicesSlice.reducer;
