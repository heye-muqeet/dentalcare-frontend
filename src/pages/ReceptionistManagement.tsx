import { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { receptionistService, type Receptionist } from '../lib/api/services/receptionists';
import { toast } from 'sonner';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiUsers,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiShield,
  FiGlobe
} from 'react-icons/fi';

export default function ReceptionistManagement() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [receptionists, setReceptionists] = useState<Receptionist[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReceptionist, setSelectedReceptionist] = useState<Receptionist | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Load receptionists
  useEffect(() => {
    const loadReceptionists = async () => {
      if (!branchId) {
        console.error('No branch ID available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Loading receptionists for branch:', branchId);
        
        const response = await receptionistService.getBranchReceptionists(branchId);
        if (response.success) {
          setReceptionists(response.data);
          console.log('Receptionists loaded:', response.data.length);
        } else {
          throw new Error('Failed to load receptionists');
        }
      } catch (error: any) {
        console.error('Error loading receptionists:', error);
        toast.error('Failed to load receptionists');
        setReceptionists([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadReceptionists();
  }, [branchId]);

  // Filter receptionists based on search term
  const filteredReceptionists = receptionists.filter(receptionist =>
    `${receptionist.firstName} ${receptionist.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receptionist.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    receptionist.phone.includes(searchTerm) ||
    (receptionist.employeeId && receptionist.employeeId.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleViewReceptionist = async (receptionist: Receptionist) => {
    try {
      console.log('Viewing receptionist:', receptionist._id);
      const response = await receptionistService.getReceptionistById(receptionist._id);
      if (response.success) {
        setSelectedReceptionist(response.data);
        setShowViewModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching receptionist details:', error);
      toast.error('Failed to load receptionist details');
    }
  };

  const handleEditReceptionist = async (receptionist: Receptionist) => {
    try {
      console.log('Editing receptionist:', receptionist._id);
      const response = await receptionistService.getReceptionistById(receptionist._id);
      if (response.success) {
        setSelectedReceptionist(response.data);
        setShowEditModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching receptionist details:', error);
      toast.error('Failed to load receptionist details');
    }
  };

  const handleDeleteReceptionist = (receptionist: Receptionist) => {
    setSelectedReceptionist(receptionist);
    setShowDeleteModal(true);
  };

  const confirmDeleteReceptionist = async () => {
    if (!selectedReceptionist) return;

    try {
      console.log('Deleting receptionist:', selectedReceptionist._id);
      const response = await receptionistService.deleteReceptionist(selectedReceptionist._id);
      
      if (response.success) {
        toast.success('Receptionist deleted successfully');
        setReceptionists(receptionists.filter(r => r._id !== selectedReceptionist._id));
        setShowDeleteModal(false);
        setSelectedReceptionist(null);
      }
    } catch (error: any) {
      console.error('Error deleting receptionist:', error);
      toast.error(error.response?.data?.message || 'Failed to delete receptionist');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Reload receptionists
    const loadReceptionists = async () => {
      try {
        const response = await receptionistService.getBranchReceptionists(branchId);
        if (response.success) {
          setReceptionists(response.data);
        }
      } catch (error) {
        console.error('Error reloading receptionists:', error);
      }
    };
    loadReceptionists();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedReceptionist(null);
    // Reload receptionists
    const loadReceptionists = async () => {
      try {
        const response = await receptionistService.getBranchReceptionists(branchId);
        if (response.success) {
          setReceptionists(response.data);
        }
      } catch (error) {
        console.error('Error reloading receptionists:', error);
      }
    };
    loadReceptionists();
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                <div className="h-20 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receptionist Management</h1>
          <p className="text-gray-600">Manage receptionists in your branch</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Receptionist</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search receptionists by name, email, phone, or employee ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Receptionists</p>
              <p className="text-2xl font-bold text-gray-900">{receptionists.length}</p>
            </div>
            <FiUsers className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active</p>
              <p className="text-2xl font-bold text-green-600">{receptionists.filter(r => r.isActive).length}</p>
            </div>
            <FiUsers className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Experience</p>
              <p className="text-2xl font-bold text-purple-600">
                {receptionists.length > 0 
                  ? Math.round(receptionists.reduce((sum, r) => sum + (r.experienceYears || 0), 0) / receptionists.length)
                  : 0
                } yrs
              </p>
            </div>
            <FiClock className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Languages</p>
              <p className="text-2xl font-bold text-blue-600">
                {new Set(receptionists.flatMap(r => r.languages || [])).size}
              </p>
            </div>
            <FiGlobe className="w-8 h-8 text-blue-600" />
          </div>
        </div>
      </div>

      {/* Receptionists Grid */}
      {filteredReceptionists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FiUsers className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No receptionists found' : 'No receptionists yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first receptionist'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Add Receptionist
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredReceptionists.map((receptionist) => (
            <div key={receptionist._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      {receptionist.firstName} {receptionist.lastName}
                    </h3>
                    <p className="text-green-600 font-medium">Receptionist</p>
                    {receptionist.employeeId && (
                      <p className="text-sm text-gray-500">ID: {receptionist.employeeId}</p>
                    )}
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    receptionist.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {receptionist.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMail className="w-4 h-4 mr-2" />
                    <span className="truncate">{receptionist.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 mr-2" />
                    <span>{receptionist.phone}</span>
                  </div>
                  {receptionist.address && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiMapPin className="w-4 h-4 mr-2" />
                      <span className="truncate">{receptionist.address}</span>
                    </div>
                  )}
                  {receptionist.experienceYears && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="w-4 h-4 mr-2" />
                      <span>{receptionist.experienceYears} years experience</span>
                    </div>
                  )}
                  {receptionist.languages && receptionist.languages.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiGlobe className="w-4 h-4 mr-2" />
                      <span className="truncate">{receptionist.languages.join(', ')}</span>
                    </div>
                  )}
                  {receptionist.permissions && receptionist.permissions.length > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiShield className="w-4 h-4 mr-2" />
                      <span>{receptionist.permissions.length} permissions</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewReceptionist(receptionist)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEditReceptionist(receptionist)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteReceptionist(receptionist)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Delete</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals would be rendered here */}
      {/* CreateReceptionistModal */}
      {/* ViewReceptionistModal */}
      {/* EditReceptionistModal */}
      {/* DeleteConfirmationModal */}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedReceptionist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Receptionist</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete {selectedReceptionist.firstName} {selectedReceptionist.lastName}? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedReceptionist(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteReceptionist}
                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
