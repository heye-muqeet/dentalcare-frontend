import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { doctorService, type Doctor } from '../lib/api/services/doctors';
import CreateDoctorModal from '../components/Modals/CreateDoctorModal';
import ViewDoctorModal from '../components/Modals/ViewDoctorModal';
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
  FiFilter
} from 'react-icons/fi';

export default function DoctorManagement() {
  const navigate = useNavigate();
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  // Use pre-loaded receptionist data for receptionist users
  const { 
    doctors: receptionistDoctors, 
    isInitializing,
    initializationError 
  } = useAppSelector((state: RootState) => state.receptionistData);
  
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Check if user is receptionist
  const isReceptionist = user?.role === 'receptionist';

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Always load data from API for all users
  useEffect(() => {
    console.log('🔍 DoctorManagement - Loading data from API:', {
      userRole: user?.role,
      branchId
    });
    
    // Always load from API regardless of user role
    loadDoctorsFromAPI();
  }, [user?.role, branchId]);

  const loadDoctorsFromAPI = async () => {
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

  const handleScheduleAppointment = (doctor: Doctor) => {
    // Navigate to appointments page with doctor pre-selected
    navigate('/appointments', { 
      state: { 
        selectedDoctor: doctor._id,
        doctorName: `Dr. ${doctor.firstName} ${doctor.lastName}`
      } 
    });
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
          <h1 className="text-2xl font-bold text-gray-900">
            {isReceptionist ? 'Doctor Directory' : 'Doctor Management'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isReceptionist 
              ? 'View and manage doctor information for appointments' 
              : 'Manage doctors in your branch'
            }
          </p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search doctors by name, email, specialization..."
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
          
          {/* Add Doctor Button - Only for non-receptionists */}
          {!isReceptionist && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              <FiPlus className="w-4 h-4" />
              <span>Add Doctor</span>
            </button>
          )}
        </div>
      </div>


      {/* Doctors List */}
      {filteredDoctors.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <FiUserCheck className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-2">
            {searchTerm ? 'No doctors found' : 'No doctors available'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : isReceptionist 
                ? 'No doctors are currently available in your branch'
                : 'Get started by adding your first doctor'
            }
          </p>
          {!searchTerm && !isReceptionist && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Add Doctor
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredDoctors.map((doctor) => (
            <div key={doctor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-3">
                <div className="flex items-start justify-between">
                  {/* Doctor Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded flex items-center justify-center">
                        <FiUserCheck className="w-8 h-8 text-emerald-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Name and Status */}
                      <div className="flex items-center space-x-2 mb-1">
                        <h3 className="text-base font-semibold text-gray-900 truncate">
                          Dr. {doctor.firstName} {doctor.lastName}
                        </h3>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          doctor.isActive 
                            ? 'bg-emerald-100 text-emerald-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {doctor.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      {/* Primary Info */}
                      <div className="flex items-center space-x-4 mb-1">
                        <div className="flex items-center bg-emerald-50 px-2 py-0.5 rounded text-xs">
                          <FiAward className="w-3 h-3 mr-1 text-emerald-600" />
                          <span className="font-medium text-emerald-700">{doctor.specialization}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <FiMail className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-32">{doctor.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <FiPhone className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{doctor.phone}</span>
                        </div>
                      </div>
                      
                      {/* Secondary Info */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FiAward className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-20">Lic: {doctor.licenseNumber}</span>
                        </div>
                        {doctor.experienceYears && (
                          <div className="flex items-center">
                            <FiClock className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{doctor.experienceYears} years exp</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-3">
                    {isReceptionist ? (
                      <>
                        <button
                          onClick={() => handleViewDoctor(doctor)}
                          className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors w-full"
                          title="View Doctor Details"
                        >
                          <span>View Details</span>
                          <FiEye className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleScheduleAppointment(doctor)}
                          className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors w-full"
                          title="Schedule Appointment"
                        >
                          <span>Schedule Appointment</span>
                          <FiCalendar className="w-3 h-3" />
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => handleViewDoctor(doctor)}
                          className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors w-full"
                          title="View Appointments"
                        >
                          <span>View Appointments</span>
                          <FiCalendar className="w-3 h-3" />
                        </button>
                        <button
                          onClick={() => handleEditDoctor(doctor)}
                          className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors w-full"
                          title="View Doctor Details"
                        >
                          <span>View Doctor Details</span>
                          <FiEye className="w-3 h-3" />
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* View Doctor Modal */}
      <ViewDoctorModal
        isOpen={showViewModal}
        onClose={() => {
          setShowViewModal(false);
          setSelectedDoctor(null);
        }}
        doctor={selectedDoctor}
        onEdit={!isReceptionist ? handleEditDoctor : undefined}
      />

      {/* Create Doctor Modal - Only for non-receptionists */}
      {!isReceptionist && (
        <CreateDoctorModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSuccess={handleCreateSuccess}
        />
      )}

      {/* Delete Confirmation Modal - Only for non-receptionists */}
      {!isReceptionist && showDeleteModal && selectedDoctor && (
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
