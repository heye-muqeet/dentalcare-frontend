import { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { branchService, type Branch, type BranchFilters } from '../lib/api/services/branches';
import CreateBranchModal from '../components/Modals/CreateBranchModal';
import { 
  FiPlus, 
  FiSearch, 
  FiMapPin, 
  FiPhone, 
  FiMail, 
  FiUsers, 
  FiEdit2, 
  FiTrash2, 
  FiRefreshCw,
  FiGrid,
  FiList,
  FiToggleLeft,
  FiToggleRight,
  FiAlertCircle,
  FiCheckCircle
} from 'react-icons/fi';

export default function BranchManagement() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showCreateModal, setShowCreateModal] = useState(false);
  // const [showEditModal, setShowEditModal] = useState(false);
  // const [showDeleteModal, setShowDeleteModal] = useState(false);
  // const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [filters, setFilters] = useState<BranchFilters>({
    search: '',
    isActive: undefined,
    page: 1,
    limit: 12,
    sortBy: 'name',
    sortOrder: 'asc'
  });
  const [stats, setStats] = useState({
    totalBranches: 0,
    activeBranches: 0,
    inactiveBranches: 0,
    totalStaff: 0
  });

  useEffect(() => {
    loadBranches();
    loadStats();
  }, [filters]);

  const loadBranches = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await branchService.getBranches(filters);
      if (response.success) {
        setBranches(response.data);
      } else {
        setError(response.message || 'Failed to load branches');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load branches');
      console.error('Error loading branches:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await branchService.getBranchStats();
      if (response.success) {
        setStats(response.data);
      }
    } catch (err) {
      console.error('Error loading branch stats:', err);
    }
  };

  const handleCreateBranch = () => {
    setShowCreateModal(true);
  };

  const handleCreateSuccess = () => {
    loadBranches();
    loadStats();
  };

  const handleEditBranch = (branch: Branch) => {
    // TODO: Implement edit branch modal
    alert(`Edit branch functionality will be implemented for: ${branch.name}`);
  };

  const handleDeleteBranch = (branch: Branch) => {
    // TODO: Implement delete branch modal
    alert(`Delete branch functionality will be implemented for: ${branch.name}`);
  };

  const handleToggleStatus = async (branch: Branch) => {
    try {
      const response = await branchService.toggleBranchStatus(branch._id);
      if (response.success) {
        loadBranches();
        loadStats();
      }
    } catch (err: any) {
      setError(err.message || 'Failed to toggle branch status');
    }
  };

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFilters(prev => ({ ...prev, search: e.target.value, page: 1 }));
  };

  const handleFilterChange = (key: keyof BranchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'text-green-600 bg-green-100' : 'text-red-600 bg-red-100';
  };

  const getStatusIcon = (isActive: boolean) => {
    return isActive ? <FiCheckCircle className="w-4 h-4" /> : <FiAlertCircle className="w-4 h-4" />;
  };

  if (isLoading && branches.length === 0) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Compact Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Branch Management</h1>
            <p className="text-sm text-gray-600">
              {user?.organization?.name || 'Organization'} branches
            </p>
          </div>
          <button
            onClick={handleCreateBranch}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-1 text-sm transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            Add Branch
          </button>
        </div>
      </div>

      {/* Compact Stats */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <FiGrid className="w-4 h-4 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Total</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalBranches}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <FiCheckCircle className="w-4 h-4 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Active</p>
              <p className="text-lg font-bold text-green-900">{stats.activeBranches}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <FiAlertCircle className="w-4 h-4 text-red-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Inactive</p>
              <p className="text-lg font-bold text-red-900">{stats.inactiveBranches}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="p-2 bg-purple-100 rounded-lg">
              <FiUsers className="w-4 h-4 text-purple-600" />
            </div>
            <div>
              <p className="text-xs text-gray-500">Staff</p>
              <p className="text-lg font-bold text-gray-900">{stats.totalStaff}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Compact Filters */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-3 mb-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex flex-1 gap-2 w-full sm:w-auto">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <FiSearch className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search branches..."
                value={filters.search || ''}
                onChange={handleSearch}
                className="w-full pl-8 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Status Filter */}
            <select
              value={filters.isActive === undefined ? 'all' : filters.isActive.toString()}
              onChange={(e) => handleFilterChange('isActive', 
                e.target.value === 'all' ? undefined : e.target.value === 'true'
              )}
              className="px-2 py-2 text-sm border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All</option>
              <option value="true">Active</option>
              <option value="false">Inactive</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={loadBranches}
              className="px-2 py-2 border border-gray-300 rounded-md hover:bg-gray-50 flex items-center"
              disabled={isLoading}
              title="Refresh"
            >
              <FiRefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-gray-100 rounded-md p-1">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded ${viewMode === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="Grid View"
            >
              <FiGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded ${viewMode === 'list' ? 'bg-white shadow-sm' : 'hover:bg-gray-200'}`}
              title="List View"
            >
              <FiList className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-3 mb-3">
          <div className="flex items-center gap-2">
            <FiAlertCircle className="w-4 h-4 text-red-600" />
            <p className="text-sm text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Compact Branches Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {branches.map((branch) => (
            <div key={branch._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base font-semibold text-gray-900 mb-1 truncate">{branch.name}</h3>
                    <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(branch.isActive)}`}>
                      {getStatusIcon(branch.isActive)}
                      {branch.isActive ? 'Active' : 'Inactive'}
                    </div>
                  </div>
                  <button
                    onClick={() => handleToggleStatus(branch)}
                    className="p-1 hover:bg-gray-100 rounded ml-2"
                    title={`${branch.isActive ? 'Deactivate' : 'Activate'} branch`}
                  >
                    {branch.isActive ? (
                      <FiToggleRight className="w-4 h-4 text-green-600" />
                    ) : (
                      <FiToggleLeft className="w-4 h-4 text-gray-400" />
                    )}
                  </button>
                </div>

                <div className="space-y-1.5 mb-3 text-xs text-gray-600">
                  <div className="flex items-center gap-2 truncate">
                    <FiMapPin className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{branch.address}, {branch.city}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <FiPhone className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{branch.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 truncate">
                    <FiMail className="w-3 h-3 flex-shrink-0" />
                    <span className="truncate">{branch.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <FiUsers className="w-3 h-3 flex-shrink-0" />
                    <span>{branch.totalStaff || 0} staff</span>
                  </div>
                </div>

                <div className="flex gap-1">
                  <button
                    onClick={() => handleEditBranch(branch)}
                    className="flex-1 px-2 py-1.5 text-xs bg-blue-50 text-blue-600 rounded hover:bg-blue-100 flex items-center justify-center gap-1"
                  >
                    <FiEdit2 className="w-3 h-3" />
                    Edit
                  </button>
                  <button
                    onClick={() => handleDeleteBranch(branch)}
                    className="flex-1 px-2 py-1.5 text-xs bg-red-50 text-red-600 rounded hover:bg-red-100 flex items-center justify-center gap-1"
                  >
                    <FiTrash2 className="w-3 h-3" />
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-900">Branch</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-900">Location</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-900">Contact</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-900">Staff</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-900">Status</th>
                  <th className="text-left py-2 px-4 text-sm font-medium text-gray-900">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {branches.map((branch) => (
                  <tr key={branch._id} className="hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{branch.name}</div>
                        {branch.description && (
                          <div className="text-xs text-gray-500 truncate max-w-32">{branch.description}</div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-900 max-w-40">
                        {branch.address}
                      </div>
                      <div className="text-xs text-gray-500">
                        {branch.city}, {branch.state}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="text-xs text-gray-900">{branch.phone}</div>
                      <div className="text-xs text-gray-500 truncate max-w-32">{branch.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="text-sm text-gray-900">{branch.totalStaff || 0}</span>
                    </td>
                    <td className="py-3 px-4">
                      <div className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(branch.isActive)}`}>
                        {getStatusIcon(branch.isActive)}
                        {branch.isActive ? 'Active' : 'Inactive'}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditBranch(branch)}
                          className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                          title="Edit branch"
                        >
                          <FiEdit2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleDeleteBranch(branch)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded"
                          title="Delete branch"
                        >
                          <FiTrash2 className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleToggleStatus(branch)}
                          className="p-1 text-gray-600 hover:bg-gray-50 rounded"
                          title={`${branch.isActive ? 'Deactivate' : 'Activate'} branch`}
                        >
                          {branch.isActive ? (
                            <FiToggleRight className="w-4 h-4 text-green-600" />
                          ) : (
                            <FiToggleLeft className="w-4 h-4 text-gray-400" />
                          )}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Compact Empty State */}
      {branches.length === 0 && !isLoading && (
        <div className="text-center py-8">
          <FiGrid className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-2">No branches found</h3>
          <p className="text-sm text-gray-500 mb-4">
            {filters.search ? 'No branches match your search criteria.' : 'Get started by creating your first branch.'}
          </p>
          <button
            onClick={handleCreateBranch}
            className="bg-blue-600 text-white px-3 py-2 rounded-md hover:bg-blue-700 flex items-center gap-1 mx-auto text-sm"
          >
            <FiPlus className="w-4 h-4" />
            Add Branch
          </button>
        </div>
      )}

      {/* Create Branch Modal */}
      <CreateBranchModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
