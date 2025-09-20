import { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { doctorService, type Doctor } from '../lib/api/services/doctors';
import CreateDoctorModal from '../components/Modals/CreateDoctorModal';
import { toast } from 'sonner';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiUserCheck,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiAward,
  FiClock,
  FiDollarSign,
  FiStar
} from 'react-icons/fi';

export default function DoctorManagement() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Load doctors
  useEffect(() => {
    const loadDoctors = async () => {
      if (!branchId) {
        console.error('No branch ID available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Loading doctors for branch:', branchId);
        
        const response = await doctorService.getBranchDoctors(branchId);
        if (response.success) {
          setDoctors(response.data);
          console.log('Doctors loaded:', response.data.length);
        } else {
          throw new Error('Failed to load doctors');
        }
      } catch (error: any) {
        console.error('Error loading doctors:', error);
        toast.error('Failed to load doctors');
        setDoctors([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadDoctors();
  }, [branchId]);

  // Filter doctors based on search term
  const filteredDoctors = doctors.filter(doctor =>
    `${doctor.firstName} ${doctor.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.specialization.toLowerCase().includes(searchTerm.toLowerCase()) ||
    doctor.phone.includes(searchTerm)
  );

  const handleViewDoctor = async (doctor: Doctor) => {
    try {
      console.log('Viewing doctor:', doctor._id);
      const response = await doctorService.getDoctorById(doctor._id);
      if (response.success) {
        setSelectedDoctor(response.data);
        setShowViewModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to load doctor details');
    }
  };

  const handleEditDoctor = async (doctor: Doctor) => {
    try {
      console.log('Editing doctor:', doctor._id);
      const response = await doctorService.getDoctorById(doctor._id);
      if (response.success) {
        setSelectedDoctor(response.data);
        setShowEditModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching doctor details:', error);
      toast.error('Failed to load doctor details');
    }
  };

  const handleDeleteDoctor = (doctor: Doctor) => {
    setSelectedDoctor(doctor);
    setShowDeleteModal(true);
  };

  const confirmDeleteDoctor = async () => {
    if (!selectedDoctor) return;

    try {
      console.log('Deleting doctor:', selectedDoctor._id);
      const response = await doctorService.deleteDoctor(selectedDoctor._id);
      
      if (response.success) {
        toast.success('Doctor deleted successfully');
        setDoctors(doctors.filter(d => d._id !== selectedDoctor._id));
        setShowDeleteModal(false);
        setSelectedDoctor(null);
      }
    } catch (error: any) {
      console.error('Error deleting doctor:', error);
      toast.error(error.response?.data?.message || 'Failed to delete doctor');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Reload doctors
    const loadDoctors = async () => {
      try {
        const response = await doctorService.getBranchDoctors(branchId);
        if (response.success) {
          setDoctors(response.data);
        }
      } catch (error) {
        console.error('Error reloading doctors:', error);
      }
    };
    loadDoctors();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedDoctor(null);
    // Reload doctors
    const loadDoctors = async () => {
      try {
        const response = await doctorService.getBranchDoctors(branchId);
        if (response.success) {
          setDoctors(response.data);
        }
      } catch (error) {
        console.error('Error reloading doctors:', error);
      }
    };
    loadDoctors();
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
          <h1 className="text-2xl font-bold text-gray-900">Doctor Management</h1>
          <p className="text-gray-600">Manage doctors in your branch</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <FiPlus className="w-4 h-4" />
          <span>Add Doctor</span>
        </button>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search doctors by name, email, specialization, or phone..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total Doctors</p>
              <p className="text-2xl font-bold text-gray-900">{doctors.length}</p>
            </div>
            <FiUserCheck className="w-8 h-8 text-blue-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Active Doctors</p>
              <p className="text-2xl font-bold text-green-600">{doctors.filter(d => d.isActive).length}</p>
            </div>
            <FiUserCheck className="w-8 h-8 text-green-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Specializations</p>
              <p className="text-2xl font-bold text-purple-600">{new Set(doctors.map(d => d.specialization)).size}</p>
            </div>
            <FiAward className="w-8 h-8 text-purple-600" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Avg Rating</p>
              <p className="text-2xl font-bold text-yellow-600">
                {doctors.length > 0 
                  ? (doctors.reduce((sum, d) => sum + (d.rating || 0), 0) / doctors.length).toFixed(1)
                  : '0.0'
                }
              </p>
            </div>
            <FiStar className="w-8 h-8 text-yellow-600" />
          </div>
        </div>
      </div>

      {/* Doctors Grid */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-8 text-center">
          <FiUserCheck className="w-12 h-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm ? 'No doctors found' : 'No doctors yet'}
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first doctor'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add Doctor
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h3>
                    <p className="text-blue-600 font-medium">{doctor.specialization}</p>
                  </div>
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${
                    doctor.isActive 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {doctor.isActive ? 'Active' : 'Inactive'}
                  </div>
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-gray-600">
                    <FiMail className="w-4 h-4 mr-2" />
                    <span className="truncate">{doctor.email}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiPhone className="w-4 h-4 mr-2" />
                    <span>{doctor.phone}</span>
                  </div>
                  <div className="flex items-center text-sm text-gray-600">
                    <FiAward className="w-4 h-4 mr-2" />
                    <span>License: {doctor.licenseNumber}</span>
                  </div>
                  {doctor.experienceYears && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiClock className="w-4 h-4 mr-2" />
                      <span>{doctor.experienceYears} years experience</span>
                    </div>
                  )}
                  {doctor.consultationFee && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiDollarSign className="w-4 h-4 mr-2" />
                      <span>{doctor.consultationFee.currency} {doctor.consultationFee.amount}</span>
                    </div>
                  )}
                  {doctor.rating && doctor.rating > 0 && (
                    <div className="flex items-center text-sm text-gray-600">
                      <FiStar className="w-4 h-4 mr-2 text-yellow-500" />
                      <span>{doctor.rating}/5 ({doctor.totalReviews || 0} reviews)</span>
                    </div>
                  )}
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDoctor(doctor)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
                  >
                    <FiEye className="w-4 h-4" />
                    <span>View</span>
                  </button>
                  <button
                    onClick={() => handleEditDoctor(doctor)}
                    className="flex-1 flex items-center justify-center space-x-1 px-3 py-2 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
                  >
                    <FiEdit2 className="w-4 h-4" />
                    <span>Edit</span>
                  </button>
                  <button
                    onClick={() => handleDeleteDoctor(doctor)}
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

      {/* Create Doctor Modal */}
      <CreateDoctorModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedDoctor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Delete Doctor</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete Dr. {selectedDoctor.firstName} {selectedDoctor.lastName}? 
              This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setSelectedDoctor(null);
                }}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmDeleteDoctor}
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
