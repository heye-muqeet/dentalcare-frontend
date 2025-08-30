/**
 * Common dental tests and examinations
 */

export interface DentalTest {
  id: string;
  name: string;
  category: string;
  description: string;
}

export const DENTAL_TEST_CATEGORIES = {
  RADIOGRAPHIC: 'Radiographic',
  CLINICAL: 'Clinical Examination',
  LABORATORY: 'Laboratory Tests',
  PERIODONTAL: 'Periodontal Assessment',
  ORTHODONTIC: 'Orthodontic Analysis',
  PATHOLOGY: 'Oral Pathology',
  ENDODONTIC: 'Endodontic Tests',
  PROSTHETIC: 'Prosthetic Assessment'
} as const;

export const DENTAL_TESTS: DentalTest[] = [
  // Radiographic Tests
  {
    id: 'bitewing-xray',
    name: 'Bitewing X-ray',
    category: DENTAL_TEST_CATEGORIES.RADIOGRAPHIC,
    description: 'Radiograph showing crowns of upper and lower teeth'
  },
  {
    id: 'periapical-xray',
    name: 'Periapical X-ray',
    category: DENTAL_TEST_CATEGORIES.RADIOGRAPHIC,
    description: 'Radiograph showing entire tooth and surrounding bone'
  },
  {
    id: 'panoramic-xray',
    name: 'Panoramic X-ray (OPG)',
    category: DENTAL_TEST_CATEGORIES.RADIOGRAPHIC,
    description: 'Wide view radiograph of entire mouth'
  },
  {
    id: 'cephalometric-xray',
    name: 'Cephalometric X-ray',
    category: DENTAL_TEST_CATEGORIES.RADIOGRAPHIC,
    description: 'Side view radiograph for orthodontic analysis'
  },
  {
    id: 'cbct-scan',
    name: 'CBCT Scan',
    category: DENTAL_TEST_CATEGORIES.RADIOGRAPHIC,
    description: 'Cone beam computed tomography 3D imaging'
  },
  {
    id: 'occlusal-xray',
    name: 'Occlusal X-ray',
    category: DENTAL_TEST_CATEGORIES.RADIOGRAPHIC,
    description: 'Radiograph showing roof or floor of mouth'
  },

  // Clinical Examinations
  {
    id: 'comprehensive-exam',
    name: 'Comprehensive Oral Examination',
    category: DENTAL_TEST_CATEGORIES.CLINICAL,
    description: 'Complete clinical assessment of oral health'
  },
  {
    id: 'intraoral-photos',
    name: 'Intraoral Photography',
    category: DENTAL_TEST_CATEGORIES.CLINICAL,
    description: 'Clinical photographs of teeth and oral structures'
  },
  {
    id: 'extraoral-photos',
    name: 'Extraoral Photography',
    category: DENTAL_TEST_CATEGORIES.CLINICAL,
    description: 'Facial and profile photographs'
  },
  {
    id: 'bite-analysis',
    name: 'Bite Analysis',
    category: DENTAL_TEST_CATEGORIES.CLINICAL,
    description: 'Assessment of occlusion and bite relationship'
  },
  {
    id: 'tmj-examination',
    name: 'TMJ Examination',
    category: DENTAL_TEST_CATEGORIES.CLINICAL,
    description: 'Temporomandibular joint assessment'
  },

  // Laboratory Tests
  {
    id: 'saliva-test',
    name: 'Saliva Test',
    category: DENTAL_TEST_CATEGORIES.LABORATORY,
    description: 'Analysis of saliva composition and flow rate'
  },
  {
    id: 'bacterial-culture',
    name: 'Bacterial Culture',
    category: DENTAL_TEST_CATEGORIES.LABORATORY,
    description: 'Identification of oral bacteria'
  },
  {
    id: 'biopsy',
    name: 'Oral Biopsy',
    category: DENTAL_TEST_CATEGORIES.LABORATORY,
    description: 'Tissue sample analysis for pathology'
  },
  {
    id: 'genetic-test',
    name: 'Genetic Susceptibility Test',
    category: DENTAL_TEST_CATEGORIES.LABORATORY,
    description: 'Genetic markers for periodontal disease'
  },

  // Periodontal Assessment
  {
    id: 'periodontal-charting',
    name: 'Periodontal Charting',
    category: DENTAL_TEST_CATEGORIES.PERIODONTAL,
    description: 'Measurement of gum pocket depths'
  },
  {
    id: 'gum-assessment',
    name: 'Gum Health Assessment',
    category: DENTAL_TEST_CATEGORIES.PERIODONTAL,
    description: 'Evaluation of gum condition and inflammation'
  },
  {
    id: 'bleeding-index',
    name: 'Bleeding Index',
    category: DENTAL_TEST_CATEGORIES.PERIODONTAL,
    description: 'Assessment of gum bleeding tendency'
  },
  {
    id: 'mobility-test',
    name: 'Tooth Mobility Test',
    category: DENTAL_TEST_CATEGORIES.PERIODONTAL,
    description: 'Evaluation of tooth movement and stability'
  },

  // Orthodontic Analysis
  {
    id: 'model-analysis',
    name: 'Dental Model Analysis',
    category: DENTAL_TEST_CATEGORIES.ORTHODONTIC,
    description: 'Study of dental casts and impressions'
  },
  {
    id: 'space-analysis',
    name: 'Space Analysis',
    category: DENTAL_TEST_CATEGORIES.ORTHODONTIC,
    description: 'Assessment of available space for teeth'
  },
  {
    id: 'growth-assessment',
    name: 'Growth Assessment',
    category: DENTAL_TEST_CATEGORIES.ORTHODONTIC,
    description: 'Evaluation of facial growth patterns'
  },

  // Oral Pathology
  {
    id: 'lesion-examination',
    name: 'Oral Lesion Examination',
    category: DENTAL_TEST_CATEGORIES.PATHOLOGY,
    description: 'Assessment of oral lesions and abnormalities'
  },
  {
    id: 'cancer-screening',
    name: 'Oral Cancer Screening',
    category: DENTAL_TEST_CATEGORIES.PATHOLOGY,
    description: 'Examination for signs of oral cancer'
  },
  {
    id: 'tissue-biopsy',
    name: 'Tissue Biopsy',
    category: DENTAL_TEST_CATEGORIES.PATHOLOGY,
    description: 'Microscopic examination of tissue sample'
  },

  // Endodontic Tests
  {
    id: 'pulp-vitality',
    name: 'Pulp Vitality Test',
    category: DENTAL_TEST_CATEGORIES.ENDODONTIC,
    description: 'Assessment of tooth nerve health'
  },
  {
    id: 'cold-test',
    name: 'Cold Sensitivity Test',
    category: DENTAL_TEST_CATEGORIES.ENDODONTIC,
    description: 'Evaluation of tooth response to cold'
  },
  {
    id: 'electric-pulp-test',
    name: 'Electric Pulp Test',
    category: DENTAL_TEST_CATEGORIES.ENDODONTIC,
    description: 'Electrical stimulation to test nerve response'
  },
  {
    id: 'percussion-test',
    name: 'Percussion Test',
    category: DENTAL_TEST_CATEGORIES.ENDODONTIC,
    description: 'Tapping test to assess tooth sensitivity'
  },

  // Prosthetic Assessment
  {
    id: 'impression-analysis',
    name: 'Dental Impression Analysis',
    category: DENTAL_TEST_CATEGORIES.PROSTHETIC,
    description: 'Assessment of dental impressions for prosthetics'
  },
  {
    id: 'shade-matching',
    name: 'Shade Matching',
    category: DENTAL_TEST_CATEGORIES.PROSTHETIC,
    description: 'Color matching for dental restorations'
  },
  {
    id: 'fit-assessment',
    name: 'Prosthetic Fit Assessment',
    category: DENTAL_TEST_CATEGORIES.PROSTHETIC,
    description: 'Evaluation of prosthetic device fit and function'
  }
];

// Helper functions
export const getTestsByCategory = (category: string): DentalTest[] => {
  return DENTAL_TESTS.filter(test => test.category === category);
};

export const getTestById = (id: string): DentalTest | undefined => {
  return DENTAL_TESTS.find(test => test.id === id);
};

export const getAllCategories = (): string[] => {
  return Object.values(DENTAL_TEST_CATEGORIES);
}; 