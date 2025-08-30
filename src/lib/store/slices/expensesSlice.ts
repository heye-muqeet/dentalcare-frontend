import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { expenseService } from '../../api/services/expenses';
import type { 
  Expense, 
  CreateExpenseData, 
  UpdateExpenseData, 
  ExpenseFilters,
  ExpenseSummaryResponse 
} from '../../api/services/expenses';

interface ExpensesState {
  expenses: Expense[];
  currentExpense: Expense | null;
  summary: ExpenseSummaryResponse | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  } | null;
  totalAmount: number;
  totalCount: number;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  isFetchingSummary: boolean;
  error: string | null;
  createError: string | null;
  updateError: string | null;
  deleteError: string | null;
  summaryError: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  currentExpense: null,
  summary: null,
  pagination: null,
  totalAmount: 0,
  totalCount: 0,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  isFetchingSummary: false,
  error: null,
  createError: null,
  updateError: null,
  deleteError: null,
  summaryError: null,
};

// Async thunks
export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (filters: ExpenseFilters | undefined, { rejectWithValue }) => {
    try {
      return await expenseService.getExpenses(filters);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to fetch expenses');
    }
  }
);

export const fetchExpense = createAsyncThunk(
  'expenses/fetchExpense',
  async (id: number, { rejectWithValue }) => {
    try {
      return await expenseService.getExpense(id);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to fetch expense');
    }
  }
);

export const createExpense = createAsyncThunk(
  'expenses/createExpense',
  async (expenseData: CreateExpenseData, { rejectWithValue }) => {
    try {
      return await expenseService.createExpense(expenseData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to create expense');
    }
  }
);

export const updateExpense = createAsyncThunk(
  'expenses/updateExpense',
  async ({ id, expenseData }: { id: number; expenseData: UpdateExpenseData }, { rejectWithValue }) => {
    try {
      return await expenseService.updateExpense(id, expenseData);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to update expense');
    }
  }
);

export const deleteExpense = createAsyncThunk(
  'expenses/deleteExpense',
  async (id: number, { rejectWithValue }) => {
    try {
      await expenseService.deleteExpense(id);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to delete expense');
    }
  }
);

export const fetchExpenseSummary = createAsyncThunk(
  'expenses/fetchExpenseSummary',
  async ({ startDate, endDate }: { startDate?: string; endDate?: string } = {}, { rejectWithValue }) => {
    try {
      return await expenseService.getExpenseSummary(startDate, endDate);
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.error?.message || error.response?.data?.message || error.response?.data?.error || 'Failed to fetch expense summary');
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {
    clearExpenseErrors: (state) => {
      state.error = null;
      state.createError = null;
      state.updateError = null;
      state.deleteError = null;
      state.summaryError = null;
    },
    clearCurrentExpense: (state) => {
      state.currentExpense = null;
    },
    setExpenseFilters: () => {
      // This can be used to store current filter state if needed
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch expenses
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload.expenses;
        state.pagination = action.payload.pagination;
        state.totalAmount = action.payload.summary.totalAmount;
        state.totalCount = action.payload.summary.count;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Fetch expense
      .addCase(fetchExpense.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpense.fulfilled, (state, action) => {
        state.isLoading = false;
        state.currentExpense = action.payload;
      })
      .addCase(fetchExpense.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      // Create expense
      .addCase(createExpense.pending, (state) => {
        state.isCreating = true;
        state.createError = null;
      })
      .addCase(createExpense.fulfilled, (state, action) => {
        state.isCreating = false;
        state.expenses.unshift(action.payload);
        state.totalCount += 1;
        state.totalAmount += action.payload.amount;
      })
      .addCase(createExpense.rejected, (state, action) => {
        state.isCreating = false;
        state.createError = action.payload as string;
      })
      // Update expense
      .addCase(updateExpense.pending, (state) => {
        state.isUpdating = true;
        state.updateError = null;
      })
      .addCase(updateExpense.fulfilled, (state, action) => {
        state.isUpdating = false;
        const index = state.expenses.findIndex(e => e.id === action.payload.id);
        if (index !== -1) {
          const oldAmount = state.expenses[index].amount;
          state.expenses[index] = action.payload;
          state.totalAmount = state.totalAmount - oldAmount + action.payload.amount;
        }
        if (state.currentExpense?.id === action.payload.id) {
          state.currentExpense = action.payload;
        }
      })
      .addCase(updateExpense.rejected, (state, action) => {
        state.isUpdating = false;
        state.updateError = action.payload as string;
      })
      // Delete expense
      .addCase(deleteExpense.pending, (state) => {
        state.isDeleting = true;
        state.deleteError = null;
      })
      .addCase(deleteExpense.fulfilled, (state, action) => {
        state.isDeleting = false;
        const expenseIndex = state.expenses.findIndex(e => e.id === action.payload);
        if (expenseIndex !== -1) {
          const deletedExpense = state.expenses[expenseIndex];
          state.totalAmount -= deletedExpense.amount;
          state.totalCount -= 1;
          state.expenses.splice(expenseIndex, 1);
        }
        if (state.currentExpense?.id === action.payload) {
          state.currentExpense = null;
        }
      })
      .addCase(deleteExpense.rejected, (state, action) => {
        state.isDeleting = false;
        state.deleteError = action.payload as string;
      })
      // Fetch expense summary
      .addCase(fetchExpenseSummary.pending, (state) => {
        state.isFetchingSummary = true;
        state.summaryError = null;
      })
      .addCase(fetchExpenseSummary.fulfilled, (state, action) => {
        state.isFetchingSummary = false;
        state.summary = action.payload;
      })
      .addCase(fetchExpenseSummary.rejected, (state, action) => {
        state.isFetchingSummary = false;
        state.summaryError = action.payload as string;
      });
  },
});

export const { clearExpenseErrors, clearCurrentExpense, setExpenseFilters } = expensesSlice.actions;
export default expensesSlice.reducer; 