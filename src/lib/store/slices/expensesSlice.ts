import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

interface Expense {
  id: string;
  description: string;
  amount: number;
  category: string;
  date: string;
  receipt?: string;
}

interface ExpensesState {
  expenses: Expense[];
  isLoading: boolean;
  error: string | null;
  isCreating: boolean;
  createError: string | null;
}

const initialState: ExpensesState = {
  expenses: [],
  isLoading: false,
  error: null,
  isCreating: false,
  createError: null,
};

export const fetchExpenses = createAsyncThunk(
  'expenses/fetchExpenses',
  async (_, { rejectWithValue }) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const mockExpenses: Expense[] = [
        {
          id: '1',
          description: 'Dental supplies',
          amount: 150,
          category: 'Supplies',
          date: '2024-01-10'
        },
        {
          id: '2',
          description: 'Office rent',
          amount: 2000,
          category: 'Rent',
          date: '2024-01-01'
        }
      ];
      
      return mockExpenses;
    } catch (error: any) {
      return rejectWithValue('Failed to fetch expenses');
    }
  }
);

const expensesSlice = createSlice({
  name: 'expenses',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchExpenses.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExpenses.fulfilled, (state, action) => {
        state.isLoading = false;
        state.expenses = action.payload;
      })
      .addCase(fetchExpenses.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });
  },
});

export default expensesSlice.reducer;
