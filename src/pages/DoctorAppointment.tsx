import { useState, useEffect } from 'react';
import { DoctorList } from '../components/Doctor/DoctorList';
// import { DoctorPagination } from '../components/Doctor/DoctorPagination';
import { AddDoctorModal } from '../components/Doctor/AddDoctorModal';
import type { DoctorFormData } from '../components/Doctor/AddDoctorModal';
import { FaPlus } from 'react-icons/fa';
import { useAppDispatch, useAppSelector } from '../lib/hooks';
import { createDoctor, fetchDoctors } from '../lib/store/slices/doctorsSlice';
import { toast } from 'react-hot-toast';
import type { RootState } from '../lib/store/store';

export default function DoctorAppointment() {
  const dispatch = useAppDispatch();
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const { isCreating } = useAppSelector((state: RootState) => state.doctors);
  const user = useAppSelector((state: RootState) => state.auth.user);
  
  // Check user role
  const isOwner = user?.role === 'owner';
  
  // Fetch doctors when component mounts
  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

  const handleAddDoctor = async (doctorData: DoctorFormData) => {
    // Check if user is owner before proceeding
    if (!isOwner) {
      toast.error("Only clinic owners can add doctors");
      return;
    }
    
    try {
      console.log('Submitting doctor data:', doctorData);
      const result = await dispatch(createDoctor(doctorData)).unwrap();
      console.log('Doctor creation successful:', result);
      toast.success('Doctor added successfully');
      setIsModalOpen(false);
      
      // Refresh the doctors list
      dispatch(fetchDoctors());
    } catch (error: any) {
      console.error('Error in handleAddDoctor, raw error:', error);
      
      // The error should come as a string from our redux thunk
      const errorMessage = typeof error === 'string' ? error : 'Failed to add doctor. Please try again.';
      console.log('Error message to process:', errorMessage);
      
      // Process common error patterns with exact matching
      if (errorMessage === 'Email already in use with this role in this organization') {
        toast.error('This email is already registered as a doctor in this organization. Please use a different email.');
      } else if (errorMessage.startsWith('Email already in use')) {
        toast.error('This email is already registered. Please use a different email.');
      } else if (errorMessage.includes('401') || errorMessage.includes('unauthorized') || errorMessage.includes('Unauthorized')) {
        toast.error('You do not have permission to add doctors. Only clinic owners can add doctors.');
      } else {
        // Default case - show the actual error message
        toast.error(errorMessage);
      }
    }
  };

  return (
    <div className="flex-1 px-4 py-6 bg-gray-50 min-h-screen">
      <div className="flex items-center justify-between mb-4">
      <h1 className="text-2xl sm:text-3xl font-bold text-[#0A0F56]">Doctors</h1>
       
        <button 
          onClick={() => {
            if (!isOwner) {
              toast.error("Only clinic owners can add doctors");
              return;
            }
            setIsModalOpen(true);
          }}
          disabled={isCreating || !isOwner}
          className={`px-5 py-2.5 rounded-xl text-sm font-medium flex items-center transition-all duration-300 shadow-lg transform ${
            !isOwner 
              ? 'bg-gray-400 text-gray-600 cursor-not-allowed opacity-50' 
              : 'bg-gradient-to-r from-[#0A0F56] to-[#232a7c] text-white hover:from-[#232a7c] hover:to-[#0A0F56] hover:shadow-xl hover:-translate-y-0.5'
          }`}
          title={!isOwner ? "Only clinic owners can add doctors" : "Add a new doctor"}
        >
          <FaPlus className="mr-2 text-base" />
          Add Doctor
        </button>
      </div>
      <div className="mb-4 text-sm text-gray-500">
        <span className="font-semibold text-gray-700">Showing: </span> All Healthcare Providers
      </div>
      <DoctorList />
      {/* <DoctorPagination /> */}

      <AddDoctorModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleAddDoctor}
        isSubmitting={isCreating}
      />
    </div>
  );
} 