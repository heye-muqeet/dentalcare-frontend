import { useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../../lib/hooks';
import { fetchDoctors, updateDoctor } from '../../lib/store/slices/doctorsSlice';
import { DoctorCard } from './DoctorCard';
import type { RootState } from '../../lib/store/store';
import type { User } from '../../lib/api/services/users';
import { toast } from 'react-hot-toast';

export function DoctorList() {
  const dispatch = useAppDispatch();
  const { doctors, isLoading, error, isUpdating } = useAppSelector((state: RootState) => state.doctors);
  const user = useAppSelector((state: RootState) => state.auth.user);

  useEffect(() => {
    dispatch(fetchDoctors());
  }, [dispatch]);

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

  if (doctors?.length === 0) {
    return (
      <div className="text-gray-500 p-4 bg-gray-50 rounded-md">
        No doctors found. Add a new doctor by clicking the "Add Doctor" button.
      </div>
    );
  }

  return (
    <div>
      {Array.isArray(doctors) && doctors.filter(doctor => doctor && doctor.id).map((doctor: User) => (
        <DoctorCard
          key={doctor.id}
          doctor={doctor}
          onEdit={handleEditDoctor}
          isUpdating={isUpdating}
          userRole={user?.role}
        />
      ))}
    </div>
  );
} 