import React, { useState, useEffect } from 'react';
import type { Patient, CreatePatientData } from '../../lib/api/services/patients';

interface EditPatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (id: string, patientData: Partial<CreatePatientData>) => void;
  patient: Patient | null;
  isSubmitting?: boolean;
}

export const EditPatientModal: React.FC<EditPatientModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  patient,
  isSubmitting = false
}) => {
  const [formData, setFormData] = useState<Partial<CreatePatientData>>({
    name: '',
    email: '',
    phone: '',
    gender: 'male',
    dob: '',
    address: '',
    medicalHistory: '',
    allergies: ''
  });

  useEffect(() => {
    if (patient) {
      setFormData({
        name: patient.name,
        email: patient.email,
        phone: patient.phone,
        gender: patient.gender,
        dob: patient.dob,
        address: patient.address,
        medicalHistory: patient.medicalHistory || '',
        allergies: patient.allergies || ''
      });
    }
  }, [patient]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (patient) {
      onSubmit(patient.id, formData);
    }
  };

  if (!isOpen || !patient) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-full max-w-lg border border-gray-100 relative animate-fadeIn max-h-[90vh] overflow-y-auto custom-scrollbar">
        <div className="flex justify-between items-center mb-2">
          <h2 className="text-2xl font-bold text-gray-900">Edit Patient</h2>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-gray-700 text-2xl font-bold px-2 py-1 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
            aria-label="Close modal"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-2">
          {/* Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
              placeholder="Enter patient name"
              required
            />
          </div>

          {/* Gender & Date of Birth in one row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Gender</label>
              <select
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
                required
              >
                <option value="male">Male</option>
                <option value="female">Female</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Date of Birth</label>
              <input
                type="date"
                name="dob"
                value={formData.dob}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
                required
              />
            </div>
          </div>

          {/* Email & Phone in one row */}
          <div className="flex gap-4">
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
                placeholder="Enter email address"
                required
              />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-semibold text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
                placeholder="Enter phone number"
                required
              />
            </div>
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
              placeholder="Enter address"
              required
            />
          </div>

          {/* Medical History */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Medical History</label>
            <textarea
              name="medicalHistory"
              value={formData.medicalHistory}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
              placeholder="Enter medical history (optional)"
              rows={3}
            />
          </div>

          {/* Allergies */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Allergies</label>
            <textarea
              name="allergies"
              value={formData.allergies}
              onChange={handleChange}
              className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
              placeholder="Enter allergies (optional)"
              rows={3}
            />
          </div>

          {/* Submit Button */}
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
              className="px-5 py-2 bg-[#0A0F56] text-white rounded-lg font-semibold shadow hover:bg-[#232a7c] transition disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Updating...' : 'Update Patient'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}; 