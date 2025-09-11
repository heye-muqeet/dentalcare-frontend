import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { fetchDoctors, updateDoctor } from '../../lib/store/slices/doctorsSlice';
import { DoctorCard } from './DoctorCard';
import type { RootState } from '../../lib/store/store';
import { toast } from 'react-hot-toast';

export function DoctorList() {
  const dispatch = useAppDispatch();
  const { doctors, isLoading, error, isUpdating } = useAppSelector((state: RootState) => state.doctors);
  const user = useAppSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    console.log("DoctorList component mounted, fetching doctors...");
    dispatch(fetchDoctors());
  }, [dispatch]);
  
  // Debug log when doctors state changes
  useEffect(() => {
    console.log("Current doctors state:", doctors);
  }, [doctors]);

  const handleEditDoctor = async (id: string, doctorData: any, onSuccess: () => void) => {
    try {
      await dispatch(updateDoctor({ id, doctorData })).unwrap();
      toast.success('Doctor updated successfully');
      onSuccess();
    } catch (error: any) {
      toast.error(error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#0A0F56]"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md">
        Error loading doctors: {error}
      </div>
    );
  }

  // First check if doctors is undefined
  if (!doctors) {
    console.log("Doctors is undefined!");
    return (
      <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
        Loading doctors data...
      </div>
    );
  }

  // Then check if the array is empty
  if (doctors.length === 0) {
    return (
      <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
        No doctors found. Add a new doctor by clicking the "Add Doctor" button.
      </div>
    );
  }

  // Extra safety debugging
  const validDoctors = Array.isArray(doctors) ? 
    doctors.filter((doctor: any) => doctor && (doctor.id || doctor._id)) : 
    [];
    
  console.log("Valid doctors for rendering:", validDoctors);
  
  // If we have doctors but none are valid for rendering, show explanation
  if (Array.isArray(doctors) && doctors.length > 0 && validDoctors.length === 0) {
    console.error("Found doctors but none have valid IDs:", doctors);
    return (
      <div className="text-red-500 p-4 bg-red-50 rounded-md">
        Error: Found {doctors.length} doctors but they have invalid data structure.
        Check console for details.
      </div>
    );
  }

  return (
    <div>
      {validDoctors.map((doctor: any) => {
        // Use _id as fallback if id is missing
        const doctorWithId = doctor.id ? doctor : {...doctor, id: doctor._id};
        console.log("Rendering doctor:", doctorWithId);
        
        return (
          <DoctorCard
            key={doctorWithId.id}
            doctor={doctorWithId}
            onEdit={handleEditDoctor}
            isUpdating={isUpdating}
            userRole={user?.role}
          />
        );
      })}
    </div>
  );
} 