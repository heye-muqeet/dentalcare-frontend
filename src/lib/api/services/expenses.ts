import api from '../axios';
import { API_ENDPOINTS } from '../endpoints';
import { type User } from './users';

export interface Expense {
  id: number;
  expenseNumber: string;
  description: string;
  amount: number;
  date: number;
  category: string;
  notes?: string;
  organization: number;
  location: number;
  addedBy: User;
  createdAt: number;
  updatedAt: number;
}

export interface CreateExpenseData {
  description: string;
  amount: number;
  category: string;
  date?: number;
  notes?: string;
}

export interface UpdateExpenseData {
  description?: string;
  amount?: number;
  category?: string;
  date?: number;
  notes?: string;
}

export interface ExpenseFilters {
  category?: string;
  startDate?: string;
  endDate?: string;
  page?: number;
  limit?: number;
}

export interface ExpensesResponse {
  expenses: Expense[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
  summary: {
    totalAmount: number;
    count: number;
  };
}

export interface ExpenseSummaryResponse {
  timePeriods: {
    total: { amount: number; count: number };
    thisYear: { amount: number; count: number };
    thisMonth: { amount: number; count: number };
    thisWeek: { amount: number; count: number };
  };
  byCategory: Array<{
    category: string;
    totalAmount: number;
    count: number;
  }>;
  dateRange: {
    startDate: string;
    endDate: string;
  };
}

export const expenseService = {
  // Create a new expense
  createExpense: async (data: CreateExpenseData): Promise<Expense> => {
    const response = await api.post(API_ENDPOINTS.EXPENSES.BASE, data);
    return response.data.data;
  },

  // Get all expenses with optional filtering
  getExpenses: async (filters?: ExpenseFilters): Promise<ExpensesResponse> => {
    const params = new URLSearchParams();
    
    if (filters?.category) params.append('category', filters.category);
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);
    if (filters?.page) params.append('page', filters.page.toString());
    if (filters?.limit) params.append('limit', filters.limit.toString());

    const response = await api.get(`${API_ENDPOINTS.EXPENSES.BASE}?${params.toString()}`);
    return response.data.data;
  },

  // Get a single expense by ID
  getExpense: async (id: number): Promise<Expense> => {
    const response = await api.get(`/expenses/${id}`);
    return response.data.data;
  },

  // Update an existing expense
  updateExpense: async (id: number, data: UpdateExpenseData): Promise<Expense> => {
    const response = await api.put(`${API_ENDPOINTS.EXPENSES.BASE}/${id}`, data);
    return response.data.data;
  },

  // Delete an expense
  deleteExpense: async (id: number): Promise<void> => {
    await api.delete(`${API_ENDPOINTS.EXPENSES.BASE}/${id}`);
  },

  // Get expense summary
  getExpenseSummary: async (startDate?: string, endDate?: string): Promise<ExpenseSummaryResponse> => {
    const params = new URLSearchParams();
    
    if (startDate) params.append('startDate', startDate);
    if (endDate) params.append('endDate', endDate);

    const response = await api.get(`${API_ENDPOINTS.EXPENSES.SUMMARY}?${params.toString()}`);
    return response.data.data;
  },
};

export default expenseService; 