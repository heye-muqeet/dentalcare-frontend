// Mock implementation for duplicate patient checking
// This should be replaced with actual backend API call

import type { Patient } from '../services/patients';

export interface DuplicateCheckData {
  name: string;
  phone: string;
  dateOfBirth: string;
  email?: string;
}

export interface DuplicateCheckResponse {
  success: boolean;
  data: {
    hasDuplicates: boolean;
    potentialDuplicates: Patient[];
    similarityScore: number;
  };
}

// Mock similarity calculation
const calculateSimilarity = (patient1: DuplicateCheckData, patient2: Patient): number => {
  let score = 0;
  let factors = 0;

  // Name similarity (40% weight)
  if (patient1.name && patient2.name) {
    const name1 = patient1.name.toLowerCase().trim();
    const name2 = patient2.name.toLowerCase().trim();
    
    if (name1 === name2) {
      score += 40;
    } else if (name1.includes(name2) || name2.includes(name1)) {
      score += 25;
    } else {
      // Check for similar words
      const words1 = name1.split(' ');
      const words2 = name2.split(' ');
      const commonWords = words1.filter(word => words2.includes(word));
      if (commonWords.length > 0) {
        score += (commonWords.length / Math.max(words1.length, words2.length)) * 20;
      }
    }
    factors++;
  }

  // Phone similarity (30% weight)
  if (patient1.phone && patient2.phone) {
    const phone1 = patient1.phone.replace(/\D/g, '');
    const phone2 = patient2.phone.replace(/\D/g, '');
    
    if (phone1 === phone2) {
      score += 30;
    } else if (phone1.includes(phone2) || phone2.includes(phone1)) {
      score += 15;
    }
    factors++;
  }

  // Date of birth similarity (20% weight)
  if (patient1.dateOfBirth && patient2.dateOfBirth) {
    if (patient1.dateOfBirth === patient2.dateOfBirth) {
      score += 20;
    } else {
      // Check if dates are close (within 1 year)
      const date1 = new Date(patient1.dateOfBirth);
      const date2 = new Date(patient2.dateOfBirth);
      const diffInDays = Math.abs(date1.getTime() - date2.getTime()) / (1000 * 60 * 60 * 24);
      
      if (diffInDays <= 365) {
        score += 10;
      }
    }
    factors++;
  }

  // Email similarity (10% weight)
  if (patient1.email && patient2.email) {
    const email1 = patient1.email.toLowerCase().trim();
    const email2 = patient2.email.toLowerCase().trim();
    
    if (email1 === email2) {
      score += 10;
    } else if (email1.includes(email2) || email2.includes(email1)) {
      score += 5;
    }
    factors++;
  }

  return factors > 0 ? Math.round(score / factors) : 0;
};

// Mock patient data for testing
const mockPatients: Patient[] = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1234567890',
    dateOfBirth: '1990-01-15',
    gender: 'male',
    area: 'Downtown',
    city: 'New York',
    medicalHistory: {
      allergies: [],
      medications: [],
      conditions: [],
      previousSurgeries: []
    },
    branchId: { _id: 'branch1', name: 'Main Branch' },
    organizationId: { _id: 'org1', name: 'Dental Care' },
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-01T00:00:00Z'
  },
  {
    _id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1234567890', // Same phone as John
    dateOfBirth: '1985-05-20',
    gender: 'female',
    area: 'Uptown',
    city: 'New York',
    medicalHistory: {
      allergies: [],
      medications: [],
      conditions: [],
      previousSurgeries: []
    },
    branchId: { _id: 'branch1', name: 'Main Branch' },
    organizationId: { _id: 'org1', name: 'Dental Care' },
    isActive: true,
    createdAt: '2024-01-02T00:00:00Z',
    updatedAt: '2024-01-02T00:00:00Z'
  },
  {
    _id: '3',
    name: 'Johnny Doe',
    email: 'johnny.doe@example.com',
    phone: '+9876543210',
    dateOfBirth: '1990-01-15', // Same DOB as John
    gender: 'male',
    area: 'Midtown',
    city: 'New York',
    medicalHistory: {
      allergies: [],
      medications: [],
      conditions: [],
      previousSurgeries: []
    },
    branchId: { _id: 'branch1', name: 'Main Branch' },
    organizationId: { _id: 'org1', name: 'Dental Care' },
    isActive: true,
    createdAt: '2024-01-03T00:00:00Z',
    updatedAt: '2024-01-03T00:00:00Z'
  }
];

export const checkDuplicatePatientsMock = async (
  branchId: string,
  patientData: DuplicateCheckData
): Promise<DuplicateCheckResponse> => {
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));

  console.log('🔍 Mock duplicate check for:', { branchId, patientData });

  // For testing purposes, use all mock patients regardless of branch ID
  // In real implementation, this would be filtered by branch
  const branchPatients = mockPatients.map(p => ({
    ...p,
    branchId: { _id: branchId, name: 'Current Branch' }
  }));

  // Calculate similarity scores for all patients
  const patientsWithScores = branchPatients.map(patient => ({
    patient,
    score: calculateSimilarity(patientData, patient)
  }));

  // Filter patients with similarity score >= 30%
  const potentialDuplicates = patientsWithScores
    .filter(item => item.score >= 30)
    .sort((a, b) => b.score - a.score)
    .map(item => item.patient);

  const hasDuplicates = potentialDuplicates.length > 0;
  const maxSimilarityScore = hasDuplicates 
    ? Math.max(...patientsWithScores.map(item => item.score))
    : 0;

  console.log('🔍 Mock duplicate check results:', {
    hasDuplicates,
    potentialDuplicates: potentialDuplicates.length,
    maxSimilarityScore
  });

  return {
    success: true,
    data: {
      hasDuplicates,
      potentialDuplicates,
      similarityScore: maxSimilarityScore
    }
  };
};
