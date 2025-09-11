import { useState, useEffect } from 'react';
import { generateRandomPassword } from '../../lib/utils/passwordUtils';
import { FiRefreshCw } from 'react-icons/fi';

interface AddDoctorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (doctorData: DoctorFormData) => void;
  isSubmitting?: boolean;
}

export interface DoctorFormData {
  email: string;
  name: string;
  gender: string;
  dateOfBirth: string;
  experience: number;
  specialization: string;
  licenseNumber: string;
  phone: string;
  password: string;
}

export function AddDoctorModal({ isOpen, onClose, onSubmit, isSubmitting }: AddDoctorModalProps) {
  const [formData, setFormData] = useState<DoctorFormData>({
    email: '',
    name: '',
    gender: '',
    dateOfBirth: '',
    experience: 0,
    specialization: '',
    licenseNumber: '',
    phone: '',
    password: '',
  });

  // Generate a random password when the modal opens
  useEffect(() => {
    if (isOpen) {
      const randomPassword = generateRandomPassword(10);
      setFormData(current => ({
        ...current,
        password: randomPassword
      }));
    }
  }, [isOpen]);

  const handleGenerateNewPassword = () => {
    const randomPassword = generateRandomPassword(10);
    setFormData(current => ({
      ...current,
      password: randomPassword
    }));
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-gray-100 relative animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Add New Doctor</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
            aria-label="Close modal"
            disabled={isSubmitting}
          >
            ×
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-2">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="">Select Gender</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                required
                max={new Date().toISOString().split('T')[0]}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
                value={formData.dateOfBirth}
                onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                disabled={isSubmitting}
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Experience (years)</label>
              <input
                type="number"
                required
                min="0"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
                value={formData.experience}
                onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) })}
                disabled={isSubmitting}
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Specialization</label>
            <select
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              value={formData.specialization}
              onChange={(e) => setFormData({ ...formData, specialization: e.target.value })}
              disabled={isSubmitting}
            >
              <option value="">Select Specialization</option>
              <option value="General Dentist">General Dentist</option>
              <option value="Orthodontist">Orthodontist</option>
              <option value="Endodontist">Endodontist</option>
              <option value="Periodontist">Periodontist</option>
              <option value="Pediatric Dentist">Pediatric Dentist</option>
              <option value="Oral Surgeon">Oral Surgeon</option>
              <option value="Prosthodontist">Prosthodontist</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">License Number</label>
            <input
              type="text"
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50"
              value={formData.licenseNumber}
              onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
              disabled={isSubmitting}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Password</label>
            <div className="relative">
              <input
                type="text"
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0A0F56] bg-gray-50 pr-14"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isSubmitting}
                minLength={6}
                placeholder="Auto-generated password"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  handleGenerateNewPassword();
                }}
                disabled={isSubmitting}
                className="absolute right-2 top-1/2 transform -translate-y-1/2 text-[#0A0F56] hover:text-blue-700 p-1 rounded focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
                title="Generate new password"
              >
                <FiRefreshCw size={18} />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1 flex justify-between items-center">
              <span>Auto-generated secure password</span>
              <span className="font-medium">Length: {formData.password.length} chars</span>
            </p>
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 border border-gray-300 rounded-lg text-gray-700 bg-white hover:bg-gray-100 transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-[#0A0F56] text-white rounded-lg font-semibold shadow hover:bg-[#232a7c] transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Adding...' : 'Add Doctor'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 