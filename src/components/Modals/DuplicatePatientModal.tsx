import React from 'react';
import { X, User, Phone, Calendar, Mail, AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import type { Patient } from '../../lib/api/services/patients';

interface DuplicatePatientModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  onSelectExisting: (patient: Patient) => void;
  potentialDuplicates: Patient[];
  newPatientData: {
    name: string;
    phone: string;
    dateOfBirth: string;
    email?: string;
  };
  similarityScore: number;
}

export default function DuplicatePatientModal({
  isOpen,
  onClose,
  onConfirm,
  onSelectExisting,
  potentialDuplicates,
  newPatientData,
  similarityScore
}: DuplicatePatientModalProps) {
  if (!isOpen) return null;

  const getSimilarityColor = (score: number) => {
    if (score >= 80) return 'text-red-600 bg-red-50 border-red-200';
    if (score >= 60) return 'text-orange-600 bg-orange-50 border-orange-200';
    return 'text-yellow-600 bg-yellow-50 border-yellow-200';
  };

  const getSimilarityText = (score: number) => {
    if (score >= 80) return 'High similarity - Likely duplicate';
    if (score >= 60) return 'Medium similarity - Possible duplicate';
    return 'Low similarity - Probably different person';
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-white/20 rounded-lg">
                <AlertTriangle className="h-6 w-6" />
              </div>
              <div>
                <h2 className="text-xl font-bold">Potential Duplicate Patient</h2>
                <p className="text-white/80 text-sm">We found similar patients in your system</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* New Patient Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
              <User className="h-5 w-5" />
              New Patient Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-blue-700">Name</label>
                <p className="text-blue-900 font-medium">{newPatientData.name}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-700">Phone</label>
                <p className="text-blue-900 font-medium">{newPatientData.phone}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-blue-700">Date of Birth</label>
                <p className="text-blue-900 font-medium">{newPatientData.dateOfBirth}</p>
              </div>
              {newPatientData.email && (
                <div>
                  <label className="text-sm font-medium text-blue-700">Email</label>
                  <p className="text-blue-900 font-medium">{newPatientData.email}</p>
                </div>
              )}
            </div>
          </div>

          {/* Similarity Score */}
          <div className={`border rounded-lg p-4 ${getSimilarityColor(similarityScore)}`}>
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5" />
              <span className="font-semibold">Similarity Score: {similarityScore}%</span>
            </div>
            <p className="text-sm">{getSimilarityText(similarityScore)}</p>
          </div>

          {/* Potential Duplicates */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Similar Patients Found ({potentialDuplicates.length})
            </h3>
            <div className="space-y-3 max-h-60 overflow-y-auto">
              {potentialDuplicates.map((patient, index) => (
                <div
                  key={patient._id}
                  className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        <div>
                          <h4 className="font-semibold text-gray-900">{patient.name}</h4>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1">
                              <Phone className="h-4 w-4" />
                              {patient.phone}
                            </div>
                            <div className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {patient.dateOfBirth}
                            </div>
                            {patient.email && (
                              <div className="flex items-center gap-1">
                                <Mail className="h-4 w-4" />
                                {patient.email}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="text-sm text-gray-500">
                        <p>Area: {patient.area} • City: {patient.city}</p>
                        <p>Gender: {patient.gender} • Created: {new Date(patient.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => onSelectExisting(patient)}
                      className="px-3 py-1.5 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                      Select This Patient
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Instructions */}
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold text-gray-900 mb-2">What should you do?</h4>
            <div className="space-y-2 text-sm text-gray-700">
              <div className="flex items-start gap-2">
                <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span><strong>If this is the same person:</strong> Click "Select This Patient" to use the existing record</span>
              </div>
              <div className="flex items-start gap-2">
                <XCircle className="h-4 w-4 text-blue-600 mt-0.5 flex-shrink-0" />
                <span><strong>If this is a different person:</strong> Click "Create New Patient" to proceed with registration</span>
              </div>
              <div className="flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                <span><strong>Family members:</strong> It's common for family members to share phone numbers. You can create separate records for each person.</span>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-200 flex justify-between">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
          >
            Cancel
          </button>
          <div className="flex gap-3">
            <button
              onClick={onConfirm}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
            >
              Create New Patient
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
