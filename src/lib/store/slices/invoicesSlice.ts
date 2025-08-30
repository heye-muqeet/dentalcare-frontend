import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { invoiceService, type Invoice } from '../../api/services/invoices';

interface InvoicesState {
  invoices: Invoice[];
  isLoading: boolean;
  error: string | null;
  isMarkingPaid: boolean;
  markPaidError: string | null;
}

const initialState: InvoicesState = {
  invoices: [],
  isLoading: false,
  error: null,
  isMarkingPaid: false,
  markPaidError: null,
};

export const fetchInvoices = createAsyncThunk(
  'invoices/fetchInvoices',
  async (_, { rejectWithValue }) => {
    try {
      const response = await invoiceService.getInvoices();
      return response.data || response; // Handle different response structures
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to fetch invoices');
    }
  }
);

export const markInvoiceAsPaid = createAsyncThunk(
  'invoices/markAsPaid',
  async (invoiceId: string, { rejectWithValue }) => {
    try {
      const response = await invoiceService.markAsPaid(invoiceId);
      return { invoiceId, data: response.data || response };
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || 'Failed to mark invoice as paid');
    }
  }
);

const invoicesSlice = createSlice({
  name: 'invoices',
  initialState,
  reducers: {
    clearInvoiceErrors: (state) => {
      state.error = null;
      state.markPaidError = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch Invoices
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
      })
      // Mark as Paid
      .addCase(markInvoiceAsPaid.pending, (state) => {
        state.isMarkingPaid = true;
        state.markPaidError = null;
      })
      .addCase(markInvoiceAsPaid.fulfilled, (state, action) => {
        state.isMarkingPaid = false;
        // Update the invoice status in the state
        const invoiceIndex = state.invoices.findIndex(
          invoice => invoice.id === action.payload.invoiceId
        );
        if (invoiceIndex !== -1) {
          state.invoices[invoiceIndex].status = 'paid';
        }
      })
      .addCase(markInvoiceAsPaid.rejected, (state, action) => {
        state.isMarkingPaid = false;
        state.markPaidError = action.payload as string;
      });
  },
});

export const { clearInvoiceErrors } = invoicesSlice.actions;
export default invoicesSlice.reducer; 