export interface AIAnalysisResult {
  findings: string;
  confidence: number;
  recommendations: string[];
  detectedConditions: string[];
  imageType: DentalImageType;
}

export interface AIAnalysisRequest {
  image: File;
  analysisType: 'dental-xray' | 'clinical-photo' | 'auto-detect';
}

export type DentalImageType = 
  | 'dental-xray' 
  | 'intraoral-photo' 
  | 'extraoral-photo' 
  | 'gum-assessment' 
  | 'teeth-condition' 
  | 'oral-pathology' 
  | 'orthodontic-photo'
  | 'periodontal-photo'
  | 'unknown';

class AIAnalysisService {
  private readonly geminiApiKey = import.meta.env.VITE_GEMINI_API_KEY;

  constructor() {
    console.log('🔧 AI Service Configuration:');
    console.log('- Gemini API Key exists:', !!this.geminiApiKey);
    
    if (!this.geminiApiKey || this.geminiApiKey === 'your_gemini_api_key_here') {
      console.error('❌ Gemini API key not configured. Please set VITE_GEMINI_API_KEY in your .env file');
      throw new Error('Gemini API key is required. Please configure VITE_GEMINI_API_KEY in your .env file.');
    }
  }

  // Main analysis method that auto-detects image type and analyzes accordingly
  async analyzeDentalImage(imageFile: File, analysisType: 'auto-detect' | 'dental-xray' | 'clinical-photo' = 'auto-detect'): Promise<AIAnalysisResult> {
    try {
      console.log('🤖 Using Gemini for dental image analysis...');
      
      // Convert image to base64
      const base64Image = await this.fileToBase64(imageFile);
      
      let detectedImageType: DentalImageType;
      
      if (analysisType === 'auto-detect') {
        // First, detect what type of dental image this is
        detectedImageType = await this.detectDentalImageType(base64Image);
        if (detectedImageType === 'unknown') {
          throw new Error('🚫 The uploaded image does not appear to be a dental-related image. Please upload a dental X-ray, clinical photo, or oral cavity image.');
        }
      } else if (analysisType === 'dental-xray') {
        detectedImageType = 'dental-xray';
      } else {
        detectedImageType = await this.detectDentalImageType(base64Image);
      }
      
      // Perform specialized analysis based on image type
      const result = await this.performSpecializedAnalysis(base64Image, detectedImageType);
      console.log('✅ Successfully analyzed dental image with Gemini');
      return { ...result, imageType: detectedImageType };
      
    } catch (error) {
      console.error('Gemini AI Analysis failed:', error);
      if (error instanceof Error) {
        throw error;
      }
      throw new Error('Failed to analyze dental image. Please try again.');
    }
  }

  // Legacy method for backward compatibility
  async analyzeDentalXray(imageFile: File): Promise<AIAnalysisResult> {
    return this.analyzeDentalImage(imageFile, 'dental-xray');
  }

  private async fileToBase64(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove data:image/jpeg;base64, prefix
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  }

  private async detectDentalImageType(base64Image: string): Promise<DentalImageType> {
    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              {
                text: `Analyze this image and determine what type of dental image it is. Respond with ONLY ONE of these exact terms:

- "dental-xray" - for X-rays, radiographs, or any black/white dental imaging
- "intraoral-photo" - for photos taken inside the mouth showing teeth, gums, or oral structures
- "extraoral-photo" - for photos of the face, jaw, or external oral structures
- "gum-assessment" - for close-up photos specifically focused on gum condition, gingivitis, or periodontal issues
- "teeth-condition" - for photos specifically showing tooth condition, cavities, restorations, or dental work
- "oral-pathology" - for images showing lesions, ulcers, or other oral pathological conditions
- "orthodontic-photo" - for images related to braces, aligners, or orthodontic treatment
- "periodontal-photo" - for images specifically showing periodontal pockets, bone loss, or gum disease
- "unknown" - if this is not a dental-related image

Be precise in your classification. Look for:
- X-rays: Black/white/gray radiographic images
- Clinical photos: Color photographs of teeth, gums, or oral cavity
- Gum focus: Images primarily showing gum tissue, inflammation, or bleeding
- Teeth focus: Images primarily showing tooth surfaces, cavities, or restorations
- Pathology: Unusual lesions, growths, or abnormal tissue`
              },
              {
                inline_data: {
                  mime_type: "image/jpeg",
                  data: base64Image
                }
              }
            ]
          }]
        })
      });

      if (!response.ok) {
        console.error('Gemini image type detection failed:', response.status);
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Gemini detection failed: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      const result = data.candidates[0].content.parts[0].text.trim().toLowerCase();
      
      // Map the response to our DentalImageType
      const validTypes: DentalImageType[] = [
        'dental-xray', 'intraoral-photo', 'extraoral-photo', 'gum-assessment', 
        'teeth-condition', 'oral-pathology', 'orthodontic-photo', 'periodontal-photo'
      ];
      
      const detectedType = validTypes.find(type => result.includes(type)) || 'unknown';
      console.log(`🔍 Detected image type: ${detectedType}`);
      return detectedType;
    } catch (error) {
      console.error('Gemini image type detection failed:', error);
      throw error;
    }
  }

  private async performSpecializedAnalysis(base64Image: string, imageType: DentalImageType): Promise<Omit<AIAnalysisResult, 'imageType'>> {
    const analysisPrompts = {
      'dental-xray': `You are a dental radiologist AI. Analyze this dental X-ray image and provide a structured analysis in JSON format:

{
  "findings": "Detailed radiographic findings including dental structures, bone density, and pathology",
  "confidence": 85,
  "detectedConditions": ["condition1", "condition2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Focus on: Dental structures, bone density, periodontal health, caries, infections, impactions, root canal treatments, restorations.`,

      'intraoral-photo': `You are a dental clinician AI. Analyze this intraoral photograph and provide a structured clinical assessment in JSON format:

{
  "findings": "Clinical observations of teeth, gums, oral tissues, and any visible pathology",
  "confidence": 85,
  "detectedConditions": ["condition1", "condition2"],
  "recommendations": ["recommendation1", "recommendation2"]
}

Focus on: Tooth condition, gum health, oral hygiene, visible caries, restorations, soft tissue health, color changes.`,

      'gum-assessment': `You are a periodontal specialist AI. Analyze this gum/periodontal image and provide a detailed assessment in JSON format:

{
  "findings": "Detailed assessment of gum condition, inflammation, bleeding, recession, and periodontal health",
  "confidence": 85,
  "detectedConditions": ["gingivitis", "periodontitis", "gum recession"],
  "recommendations": ["periodontal therapy", "improved oral hygiene", "follow-up assessment"]
}

Focus on: Gum inflammation, bleeding, recession, pocket depth indicators, plaque/calculus, tissue color and texture.`,

      'teeth-condition': `You are a restorative dentistry AI. Analyze this tooth condition image and provide a detailed assessment in JSON format:

{
  "findings": "Assessment of tooth structure, cavities, restorations, discoloration, and dental work",
  "confidence": 85,
  "detectedConditions": ["dental caries", "worn restorations", "tooth discoloration"],
  "recommendations": ["restorative treatment", "preventive care", "follow-up examination"]
}

Focus on: Tooth structure integrity, cavities, existing restorations, discoloration, wear patterns, fractures.`,

      'oral-pathology': `You are an oral pathology specialist AI. Analyze this oral pathology image and provide a detailed assessment in JSON format:

{
  "findings": "Description of lesions, abnormal tissue, ulcerations, or pathological conditions",
  "confidence": 85,
  "detectedConditions": ["oral lesion", "tissue abnormality"],
  "recommendations": ["biopsy consideration", "specialist referral", "monitoring"]
}

Focus on: Lesion characteristics, tissue abnormalities, ulcerations, growths, color changes, suspicious areas.`,

      'orthodontic-photo': `You are an orthodontic specialist AI. Analyze this orthodontic image and provide an assessment in JSON format:

{
  "findings": "Assessment of tooth alignment, bite relationship, orthodontic appliances, and treatment progress",
  "confidence": 85,
  "detectedConditions": ["malocclusion", "crowding", "spacing"],
  "recommendations": ["orthodontic treatment", "appliance adjustment", "retention"]
}

Focus on: Tooth alignment, bite relationship, crowding, spacing, orthodontic appliances, treatment progress.`,

      'periodontal-photo': `You are a periodontal specialist AI. Analyze this periodontal condition image and provide an assessment in JSON format:

{
  "findings": "Assessment of periodontal health, bone levels, gum attachment, and disease progression",
  "confidence": 85,
  "detectedConditions": ["periodontal disease", "bone loss", "attachment loss"],
  "recommendations": ["periodontal therapy", "surgical intervention", "maintenance therapy"]
}

Focus on: Periodontal pocket depth, bone levels, gum attachment, inflammation, calculus deposits.`,

      'extraoral-photo': `You are a maxillofacial specialist AI. Analyze this extraoral/facial image and provide an assessment in JSON format:

{
  "findings": "Assessment of facial symmetry, jaw relationship, external oral structures, and visible abnormalities",
  "confidence": 85,
  "detectedConditions": ["facial asymmetry", "jaw deviation"],
  "recommendations": ["clinical examination", "imaging studies", "specialist consultation"]
}

Focus on: Facial symmetry, jaw position, external swelling, skin conditions, lip health, facial proportions.`
    };

    const prompt = analysisPrompts[imageType as keyof typeof analysisPrompts] || analysisPrompts['intraoral-photo'];

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${this.geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inline_data: {
                mime_type: "image/jpeg",
                data: base64Image
              }
            }
          ]
        }]
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`Gemini API request failed: ${response.status} ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    const analysisText = data.candidates[0].content.parts[0].text;
    
    return this.parseAIResponse(analysisText);
  }

  // Legacy validation method for backward compatibility
//   private async validateDentalXray(base64Image: string): Promise<boolean> {
//     const imageType = await this.detectDentalImageType(base64Image);
//     return imageType === 'dental-xray';
//   }

//   private async geminiVisionAnalysis(base64Image: string): Promise<AIAnalysisResult> {
//     // This method is kept for backward compatibility
//     const result = await this.performSpecializedAnalysis(base64Image, 'dental-xray');
//     return { ...result, imageType: 'dental-xray' };
//   }

  private parseAIResponse(analysisText: string): Omit<AIAnalysisResult, 'imageType'> {
    try {
      // Try to parse as JSON first
      const jsonMatch = analysisText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        return {
          findings: parsed.findings || analysisText,
          confidence: parsed.confidence || 85,
          recommendations: Array.isArray(parsed.recommendations) ? parsed.recommendations : ["Clinical correlation recommended"],
          detectedConditions: Array.isArray(parsed.detectedConditions) ? parsed.detectedConditions : []
        };
      }
    } catch (error) {
      console.warn('Failed to parse JSON response, using text parsing');
    }

    // Fallback to text parsing
    const lines = analysisText.split('\n').filter(line => line.trim());
    const findings = lines.find(line => line.toLowerCase().includes('finding')) || analysisText;
    
    // Extract confidence if mentioned
    const confidenceMatch = analysisText.match(/(\d+)%?\s*confidence/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 85;

    // Extract recommendations
    const recommendations = lines
      .filter(line => line.toLowerCase().includes('recommend') || line.includes('•') || line.includes('-'))
      .slice(0, 3)
      .map(line => line.replace(/^[•\-\d\.]\s*/, '').trim())
      .filter(rec => rec.length > 10);

    return {
      findings: findings.length > 50 ? findings : analysisText,
      confidence: Math.min(Math.max(confidence, 70), 95),
      recommendations: recommendations.length > 0 ? recommendations : ["Clinical correlation recommended", "Follow-up as needed"],
      detectedConditions: []
    };
  }
}

export const aiAnalysisService = new AIAnalysisService(); 