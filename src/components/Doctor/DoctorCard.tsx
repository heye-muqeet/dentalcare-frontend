import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { EditDoctorModal } from './EditDoctorModal';
import type { User } from '../../lib/api/services/users';
import InitialAvatar from '../Common/InitialAvatar';
import { getInitials } from '../../lib/utils/stringUtils';

interface DoctorCardProps {
  doctor: User;
  onEdit: (id: string, doctorData: any, onSuccess: () => void) => void;
  isUpdating?: boolean;
  userRole?: string;
}

export function DoctorCard({ doctor, onEdit, isUpdating, userRole }: DoctorCardProps) {
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const navigate = useNavigate();

  const isReceptionist = userRole === 'receptionist';

  const handleEdit = (id: string, doctorData: any) => {
    onEdit(id, doctorData, () => setIsEditModalOpen(false));
  };

  return (
    <>
      <div className="flex items-center bg-white rounded-lg shadow-sm p-3 mb-3">
        {doctor.profileImage ? (
          <img 
            src={doctor.profileImage}
            alt={doctor.name} 
            className="w-16 h-16 rounded-full mr-5 object-cover"
          />
        ) : (
          <InitialAvatar 
            initials={getInitials(doctor.name || '')} 
            size={16}
            bgColor="bg-indigo-500"
            textColor="text-white"
            className="mr-5 text-xl"
          />
        )}
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-gray-900 text-lg capitalize">{doctor.name}</div>
              <div className="text-xs text-indigo-700 font-medium mb-1">{doctor.specialization || 'General Dentist'}</div>
              <div className="text-xs text-gray-500">
                {doctor.availability?.length ? 'Available' : 'Not available'} 
                <span className="mx-1">•</span> {doctor.email}
              </div>
              <div className="text-xs text-gray-500 mt-1">
                {doctor.education || 'Professional dental care provider'}
              </div>
              <div className="text-xs text-gray-500 mt-1 capitalize">
                {doctor.gender || 'Not specified'} • 
                {doctor.dateOfBirth ? 
                  new Date(doctor.dateOfBirth).toLocaleDateString() : 
                  'DOB not specified'} • 
                {doctor.experience || 0} years experience
              </div>
            </div>
            <div className="flex flex-col space-y-2">
              <button 
                onClick={() => navigate(`/appointments?doctorId=${doctor.id}`)}
                className="bg-blue-900 text-white px-4 py-1 rounded text-sm font-medium hover:bg-[#0A0F56] transition"
              >
                View Appointments
              </button>
              <button 
                onClick={() => !isReceptionist && setIsEditModalOpen(true)}
                disabled={isReceptionist}
                className={`border px-4 py-1 rounded text-sm font-medium transition ${
                  isReceptionist 
                    ? 'border-gray-300 text-gray-400 cursor-not-allowed opacity-50' 
                    : 'border-[#0A0F56] text-[#0A0F56] hover:bg-indigo-50'
                }`}
                title={isReceptionist ? 'Receptionists cannot edit doctors' : 'Edit doctor details'}
              >
                Edit Doctor
              </button>
            </div>
          </div>
        </div>
      </div>

      <EditDoctorModal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        onSubmit={handleEdit}
        isSubmitting={isUpdating}
        doctor={doctor}
      />
    </>
  );
} 