import { useState, useEffect } from 'react';
import { useAppSelector } from '../lib/hooks';
import type { RootState } from '../lib/store/store';
import { patientService, type Patient } from '../lib/api/services/patients';
import CreatePatientModal from '../components/Modals/CreatePatientModal';
import { toast } from 'sonner';
import { 
  FiPlus, 
  FiSearch, 
  FiEdit2, 
  FiTrash2, 
  FiEye, 
  FiUser,
  FiMail,
  FiPhone,
  FiMapPin,
  FiCalendar,
  FiClock,
  FiFilter,
  FiHeart,
  FiShield,
  FiFileText
} from 'react-icons/fi';

export default function PatientManagement() {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

  // Extract branch ID safely
  const branchId = typeof user?.branchId === 'string' 
    ? user.branchId 
    : (user?.branchId as any)?._id || (user?.branchId as any)?.id || String(user?.branchId);

  // Load patients
  useEffect(() => {
    const loadPatients = async () => {
      if (!branchId) {
        console.error('No branch ID available');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        console.log('Loading patients for branch:', branchId);
        
        const response = await patientService.getBranchPatients(branchId);
        if (response.success) {
          setPatients(response.data);
          console.log('Patients loaded:', response.data.length);
        } else {
          throw new Error('Failed to load patients');
        }
      } catch (error: any) {
        console.error('Error loading patients:', error);
        toast.error('Failed to load patients');
        setPatients([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadPatients();
  }, [branchId]);

  // Filter patients based on search term
  const filteredPatients = patients.filter(patient =>
    patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.phone.includes(searchTerm) ||
    patient.area.toLowerCase().includes(searchTerm.toLowerCase()) ||
    patient.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleViewPatient = async (patient: Patient) => {
    try {
      console.log('Viewing patient:', patient._id);
      const response = await patientService.getPatientById(patient._id);
      if (response.success) {
        setSelectedPatient(response.data);
        setShowViewModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching patient details:', error);
      toast.error('Failed to load patient details');
    }
  };

  const handleEditPatient = async (patient: Patient) => {
    try {
      console.log('Editing patient:', patient._id);
      const response = await patientService.getPatientById(patient._id);
      if (response.success) {
        setSelectedPatient(response.data);
        setShowEditModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching patient details:', error);
      toast.error('Failed to load patient details');
    }
  };

  const handleCreateSuccess = () => {
    setShowCreateModal(false);
    // Reload patients
    const loadPatients = async () => {
      try {
        const response = await patientService.getBranchPatients(branchId);
        if (response.success) {
          setPatients(response.data);
        }
      } catch (error) {
        console.error('Error reloading patients:', error);
      }
    };
    loadPatients();
  };

  const handleEditSuccess = () => {
    setShowEditModal(false);
    setSelectedPatient(null);
    // Reload patients
    const loadPatients = async () => {
      try {
        const response = await patientService.getBranchPatients(branchId);
        if (response.success) {
          setPatients(response.data);
        }
      } catch (error) {
        console.error('Error reloading patients:', error);
      }
    };
    loadPatients();
  };

  // Calculate age from date of birth
  const calculateAge = (dateOfBirth: string): number => {
    const today = new Date();
    const birthDate = new Date(dateOfBirth);
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
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
          <h1 className="text-2xl font-bold text-gray-900">Patient Management</h1>
          <p className="text-gray-600 mt-1">Manage patients in your branch</p>
        </div>
        <div className="flex items-center space-x-3">
          {/* Search */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search patients by name, email, phone, area, city..."
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
          
          {/* Add Patient Button */}
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
          >
            <FiPlus className="w-4 h-4" />
            <span>Add Patient</span>
          </button>
        </div>
      </div>

      {/* Patients List */}
      {filteredPatients.length === 0 ? (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 text-center">
          <FiUser className="w-8 h-8 text-gray-300 mx-auto mb-3" />
          <h3 className="text-base font-medium text-gray-900 mb-2">
            {searchTerm ? 'No patients found' : 'No patients yet'}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {searchTerm 
              ? 'Try adjusting your search criteria'
              : 'Get started by adding your first patient'
            }
          </p>
          {!searchTerm && (
            <button
              onClick={() => setShowCreateModal(true)}
              className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-md hover:bg-emerald-700 transition-colors"
            >
              Add Patient
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-2">
          {filteredPatients.map((patient) => (
            <div key={patient._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
              <div className="p-3">
                <div className="flex items-start justify-between">
                  {/* Patient Info */}
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    <div className="flex-shrink-0">
                      <div className="w-16 h-16 bg-gradient-to-br from-blue-100 to-blue-200 rounded flex items-center justify-center">
                        <FiUser className="w-8 h-8 text-blue-600" />
                      </div>
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      {/* Name and Status */}
                      <div className="flex items-center space-x-2 mb-1">
                    <h3 className="text-base font-semibold text-gray-900 truncate">
                      {patient.name}
                    </h3>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          patient.isActive 
                            ? 'bg-green-100 text-green-700' 
                            : 'bg-red-100 text-red-700'
                        }`}>
                          {patient.isActive ? 'Active' : 'Inactive'}
                        </div>
                      </div>
                      
                      {/* Primary Info */}
                      <div className="flex items-center space-x-4 mb-1">
                        <div className="flex items-center text-xs text-gray-600">
                          <FiCalendar className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{calculateAge(patient.dateOfBirth)} years old</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <FiMail className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-32">{patient.email}</span>
                        </div>
                        <div className="flex items-center text-xs text-gray-600">
                          <FiPhone className="w-3 h-3 mr-1 text-gray-400" />
                          <span>{patient.phone}</span>
                        </div>
                      </div>
                      
                      {/* Secondary Info */}
                      <div className="flex items-center space-x-4 text-xs text-gray-500">
                        <div className="flex items-center">
                          <FiMapPin className="w-3 h-3 mr-1 text-gray-400" />
                          <span className="truncate max-w-32">{patient.area}, {patient.city}</span>
                        </div>
                        {patient.lastVisit && (
                          <div className="flex items-center">
                            <FiClock className="w-3 h-3 mr-1 text-gray-400" />
                            <span>Last visit: {new Date(patient.lastVisit).toLocaleDateString()}</span>
                          </div>
                        )}
                        {patient.totalVisits && (
                          <div className="flex items-center">
                            <FiFileText className="w-3 h-3 mr-1 text-gray-400" />
                            <span>{patient.totalVisits} visits</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-col space-y-2 flex-shrink-0 ml-3">
                    <button
                      onClick={() => handleViewPatient(patient)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs bg-emerald-600 text-white hover:bg-emerald-700 rounded transition-colors w-full"
                      title="View Patient Details"
                    >
                      <span>View Details</span>
                      <FiEye className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => handleEditPatient(patient)}
                      className="flex items-center justify-center space-x-1 px-3 py-1.5 text-xs border border-gray-300 text-gray-700 hover:bg-gray-50 rounded transition-colors w-full"
                      title="Edit Patient"
                    >
                      <span>Edit Patient</span>
                      <FiEdit2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Patient Modal */}
      <CreatePatientModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSuccess={handleCreateSuccess}
      />
    </div>
  );
}
