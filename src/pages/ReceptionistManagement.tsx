import { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { receptionistService, type Receptionist } from '../lib/api/services/receptionists';
import CreateReceptionistModal from '../components/Modals/CreateReceptionistModal';
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
  FiGlobe,
  FiFilter,
  FiAward
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
      <div className="p-4">
        <div className="animate-pulse">
          <div className="flex items-start justify-between mb-6">
            <div>
              <div className="h-8 bg-gray-200 rounded w-48 mb-1"></div>
              <div className="h-4 bg-gray-200 rounded w-80"></div>
            </div>
            <div className="flex items-center space-x-3">
              <div className="h-10 bg-gray-200 rounded w-64"></div>
              <div className="h-10 bg-gray-200 rounded w-20"></div>
              <div className="h-10 bg-gray-200 rounded w-24"></div>
            </div>
          </div>
          <div className="space-y-2">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white p-3 rounded-lg shadow-sm border border-gray-200">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gray-200 rounded"></div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <div className="h-4 bg-gray-200 rounded w-40"></div>
                        <div className="h-4 bg-gray-200 rounded w-16"></div>
                      </div>
                      <div className="flex items-center space-x-4 mb-1">
                        <div className="h-3 bg-gray-200 rounded w-24"></div>
                        <div className="h-3 bg-gray-200 rounded w-32"></div>
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                      </div>
                      <div className="flex items-center space-x-4">
                        <div className="h-3 bg-gray-200 rounded w-20"></div>
                        <div className="h-3 bg-gray-200 rounded w-16"></div>
                        <div className="h-3 bg-gray-200 rounded w-12"></div>
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-3">
                    <div className="h-7 bg-gray-200 rounded w-32"></div>
                    <div className="h-7 bg-gray-200 rounded w-36"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4">
      {/* Header */}
      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Receptionist Management</h1>
          <p className="text-gray-600 mt-1">Manage receptionists in your branch</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search receptionists by name, email, phone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-64 pl-4 pr-10 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <FiSearch className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          </div>
          
          {/* Filter Button */}
          <button className="flex items-center space-x-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
            <FiFilter className="w-4 h-4" />
            <span>Filter</span>
          </button>
          
          {/* Add Receptionist Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Receptionist</span>
          </button>
        </div>
      </div>

      {/* Receptionists List */}
      {filteredReceptionists.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <FiUsers className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-2">
            {searchTerm ? 'No receptionists found' : 'No receptionists yet'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first receptionist'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Add Receptionist
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredReceptionists.map((receptionist) => (
            <div key={receptionist._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-3">
                <div className="flex items-start justify-between">
                  {/* Receptionist Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded flex items-center justify-center">
                        <FiUsers className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Name and Status */}
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          {receptionist.firstName} {receptionist.lastName}
                        </h3>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          receptionist.isActive 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {receptionist.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      {/* Primary Info */}
                      <div className="flex items-center space-x-4 mb-1">
                        <div className="flex items-center bg-emerald-50 px-2 py-0.5 rounded text-xs">
                          <FiUsers className="w-3 h-3 mr-1 text-emerald-600" />
                          <span className="font-medium text-emerald-700">Receptionist</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <FiMail className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-32">{receptionist.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <FiPhone className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{receptionist.phone}</span>
                        </div>
                      </div>
                      
                      {/* Secondary Info */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        {receptionist.employeeId && (
                          <div className="flex items-center">
                            <FiAward className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="truncate max-w-20">ID: {receptionist.employeeId}</span>
                          </div>
                        )}
                        {receptionist.experienceYears && (
                          <div className="flex items-center">
                            <FiClock className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{receptionist.experienceYears} years exp</span>
                          </div>
                        )}
                        {receptionist.languages && receptionist.languages.length > 0 && (
                          <div className="flex items-center">
                            <FiGlobe className="w-3 h-3 mr-1 text-gray-400" />
                            <span className="truncate max-w-24">{receptionist.languages.join(', ')}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => handleViewReceptionist(receptionist)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors w-full"
                      title="View Receptionist"
                    >
                      <span>View Receptionist</span>
                      <FiEye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditReceptionist(receptionist)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors w-full"
                      title="Edit Receptionist"
                    >
                      <span>Edit Receptionist</span>
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Receptionist Modal */}
      <CreateReceptionistModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

    </div>
  );
}
