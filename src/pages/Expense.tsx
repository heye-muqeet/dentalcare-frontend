import React, { useState, useEffect } from 'react';
import { FiSearch, FiEdit2, FiTrash2, FiPlus } from 'react-icons/fi';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { 
  fetchExpenses, 
  createExpense, 
  updateExpense,
  deleteExpense, 
  clearExpenseErrors 
} from '../lib/store/slices/expensesSlice';
import type { CreateExpenseData, UpdateExpenseData, ExpenseSummaryResponse, Expense } from '../lib/api/services/expenses';
import { expenseService } from '../lib/api/services/expenses';
import { toast } from 'react-hot-toast';

interface ExpenseStats {
  label: string;
  amount: string;
  count: number;
}

// Add/Edit Expense Modal Component
function ExpenseModal({ 
  isOpen, 
  onClose, 
  onSubmit, 
  expense,
  isEditing = false 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  onSubmit: (data: CreateExpenseData | UpdateExpenseData) => Promise<void>;
  expense?: Expense;
  isEditing?: boolean;
}) {
  const getInitialFormData = () => {
    if (isEditing && expense) {
      return {
        date: new Date(expense.date).toISOString().split('T')[0],
        description: expense.description,
        category: expense.category,
        amount: expense.amount.toString(),
        notes: expense.notes || '',
      };
    }
    return {
      date: new Date().toISOString().split('T')[0],
      description: '',
      category: '',
      amount: '',
      notes: '',
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setFormData(getInitialFormData());
      setIsSubmitting(false);
    }
  }, [isOpen, expense, isEditing]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isSubmitting) return;
    
    try {
      setIsSubmitting(true);
      
      const dateTimestamp = new Date(formData.date).getTime();
      
      const submitData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        category: formData.category,
        notes: formData.notes || undefined,
        date: dateTimestamp,
      };

      await onSubmit(submitData);
      onClose();
    } catch (error) {
      // Error will be handled by parent component
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/10 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-lg border border-gray-100 relative animate-fadeIn">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">
            {isEditing ? 'Edit Expense' : 'Add Expense'}
          </h2>
          <button
            onClick={onClose}
            disabled={isSubmitting}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0F56] disabled:opacity-50 disabled:cursor-not-allowed"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
            <input
              type="date"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Description</label>
            <input
              type="text"
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Category</label>
            <select
              required
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
            >
              <option value="">Select category</option>
              <option value="rent">Rent</option>
              <option value="utilities">Utilities</option>
              <option value="supplies">Supplies</option>
              <option value="equipment">Equipment</option>
              <option value="salary">Salary</option>
              <option value="maintenance">Maintenance</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Amount</label>
            <input
              type="number"
              required
              min="0.01"
              step="0.01"
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              placeholder="Enter amount"
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (Optional)</label>
            <textarea
              disabled={isSubmitting}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter additional notes"
              rows={3}
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 bg-[#0A0F56] text-white rounded-lg font-semibold shadow hover:bg-[#232a7c] transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {isSubmitting ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2 border-white mr-2"></div>
                  {isEditing ? 'Updating...' : 'Creating...'}
                </>
              ) : (
                isEditing ? 'Update Expense' : 'Add Expense'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function Expense() {
  const dispatch = useAppDispatch();
  const { 
    expenses, 
    totalCount,
    isLoading, 
    isCreating, 
    isUpdating,
    isDeleting,
    error,
    createError,
    updateError,
    deleteError 
  } = useAppSelector((state) => state.expenses);

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [selectedExpense, setSelectedExpense] = useState<Expense | undefined>(undefined);
  const [categoryFilter, setCategoryFilter] = useState('');
  
  // Local state for summary data
  const [summaryData, setSummaryData] = useState<ExpenseSummaryResponse | null>(null);
  // const [setIsFetchingSummary] = useState(false);

  // Valid categories according to API
  const categories = [
    'rent',
    'utilities', 
    'supplies',
    'equipment',
    'salary',
    'maintenance',
    'other',
  ];

  // Fetch summary data directly
  const fetchSummaryData = async () => {
    try {
      // setIsFetchingSummary(true);
      const summary = await expenseService.getExpenseSummary();
      setSummaryData(summary);
    } catch (error: any) {
      toast.error('Failed to fetch expense summary');
      console.error('Summary fetch error:', error);
    } finally {
      // setIsFetchingSummary(false);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    dispatch(fetchExpenses());
    fetchSummaryData();
  }, [dispatch]);

  // Handle errors
  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearExpenseErrors());
    }
    if (createError) {
      toast.error(createError);
      dispatch(clearExpenseErrors());
    }
    if (updateError) {
      toast.error(updateError);
      dispatch(clearExpenseErrors());
    }
    if (deleteError) {
      toast.error(deleteError);
      dispatch(clearExpenseErrors());
    }
  }, [error, createError, updateError, deleteError, dispatch]);

  // Filter expenses locally based on search and category
  const filteredExpenses = expenses.filter(expense => {
    const matchesSearch =
      expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      expense.category.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      !categoryFilter || expense.category.toLowerCase() === categoryFilter.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  // Calculate stats from summary data
  const stats: ExpenseStats[] = [
    { 
      label: 'Total Expense', 
      amount: `${summaryData?.timePeriods?.total?.amount}`, 
      count: summaryData ? summaryData.timePeriods.total.count : totalCount 
    },
    { 
      label: 'This Year', 
      amount: `${summaryData?.timePeriods?.thisYear?.amount}`, 
      count: summaryData ? summaryData.timePeriods.thisYear.count : totalCount 
    },
    { 
      label: 'This Month', 
      amount: `${summaryData?.timePeriods?.thisMonth?.amount}`, 
      count: summaryData ? summaryData.timePeriods.thisMonth.count : 0 
    },
    { 
      label: 'This Week', 
      amount: `${summaryData?.timePeriods?.thisWeek?.amount}`, 
      count: summaryData ? summaryData.timePeriods.thisWeek.count : 0 
    },
  ];

  const handleAddExpense = async (data: CreateExpenseData | UpdateExpenseData) => {
    try {
      await dispatch(createExpense(data as CreateExpenseData)).unwrap();
      toast.success('Expense created successfully!');
      // Refresh summary data after adding expense
      fetchSummaryData();
    } catch (error) {
      // Error handled by useEffect
    }
  };

  const handleEditExpense = (expense: Expense) => {
    setSelectedExpense(expense);
    setIsEditModalOpen(true);
  };

  const handleUpdateExpense = async (data: CreateExpenseData | UpdateExpenseData) => {
    if (!selectedExpense) return;
    
    try {
      await dispatch(updateExpense({ 
        id: selectedExpense.id, 
        expenseData: data as UpdateExpenseData 
      })).unwrap();
      toast.success('Expense updated successfully!');
      // Refresh summary data after updating expense
      fetchSummaryData();
    } catch (error) {
      // Error handled by useEffect
    }
  };

  const handleDeleteExpense = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        await dispatch(deleteExpense(id)).unwrap();
        toast.success('Expense deleted successfully!');
        // Refresh summary data after deleting expense
        fetchSummaryData();
      } catch (error) {
        // Error handled by useEffect
      }
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatCategory = (category: string) => {
    return category.charAt(0).toUpperCase() + category.slice(1);
  };

  if (isLoading) {
    return (
      <div className="p-6 bg-gray-50 w-full">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0A0F56] mx-auto mb-4"></div>
            <p className="text-gray-500">Loading expenses...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 w-full">
      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {stats.map((stat, index) => (
          <div key={index} className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex flex-col">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[#0A0F56] text-base">{stat.label}</span>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-blue-500 text-white">
                  {stat.count}
                </span>
              </div>
              <span className="text-2xl font-bold text-gray-900">{stat.amount}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Filters and Search */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mb-6">
        {/* <div className="flex items-center space-x-4">
          <button className="flex items-center space-x-2 text-gray-600 text-sm border rounded-lg px-4 py-2 hover:bg-gray-50">
            <span>Year 2025</span>
            <FiFilter className="w-4 h-4" />
          </button>
        </div> */}
        
        <div className="flex items-center space-x-4 w-full sm:w-auto">
          <div className="relative flex-1 sm:flex-initial">
            <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search..."
              className="w-full sm:w-64 pl-10 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="border rounded-lg px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-white"
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
          >
            <option value="">All Categories</option>
            {categories.map(cat => (
              <option key={cat} value={cat}>{formatCategory(cat)}</option>
            ))}
          </select>
          {/* <button className="flex items-center space-x-1 text-gray-700 px-4 py-2 rounded-lg text-sm hover:bg-gray-200">
            <FiFilter className="w-4 h-4" />
            <span>All</span>
          </button> */}
          <button 
            onClick={() => setIsAddModalOpen(true)}
            disabled={isCreating}
            className="flex items-center space-x-2 bg-[#0A0F56] text-white text-sm rounded-lg px-4 py-2 hover:bg-[#090D45] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{isCreating ? 'Adding...' : 'Add Expense'}</span>
            <FiPlus className="w-4 h-4" />
          </button>
          {/* <button className="flex items-center space-x-2 border border-[#0A0F56] text-[#0A0F56] text-sm rounded-lg px-4 py-2 hover:bg-gray-50">
            <span>Export</span>
          </button> */}
        </div>
      </div>

      {/* Expenses Table */}
      <div className="bg-white rounded-xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expense ID</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                <th className="px-5 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Added By</th>
                <th className="px-5 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredExpenses.length > 0 ? (
                filteredExpenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-blue-600">{expense.expenseNumber}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{formatDate(expense.date)}</td>
                    <td className="px-5 py-4 text-sm text-gray-900">{expense.description}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm text-gray-600">{formatCategory(expense.category)}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.amount}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{expense.addedBy.name}</td>
                    <td className="px-5 py-4 whitespace-nowrap text-center">
                      <div className="flex justify-center space-x-2">
                        <button 
                          onClick={() => handleEditExpense(expense)}
                          disabled={isUpdating}
                          className="text-blue-600 hover:text-blue-900 bg-blue-100 p-2 rounded-lg"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteExpense(expense.id)}
                          disabled={isDeleting}
                          className="text-red-600 hover:text-red-900 bg-red-100 p-2 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-gray-500">
                    No expenses found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <ExpenseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onSubmit={handleAddExpense}
        isEditing={false}
      />

      <ExpenseModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleUpdateExpense}
        expense={selectedExpense}
        isEditing={true}
      />
    </div>
  );
} 