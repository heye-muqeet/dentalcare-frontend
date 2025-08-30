import React, { useState } from 'react';
import { FiPaperclip, FiX, FiUpload, FiCpu, FiCheck, FiAlertCircle, FiChevronDown } from 'react-icons/fi';
import { aiAnalysisService } from '../../lib/api/services/aiAnalysis';
import type { AIAnalysisResult } from '../../lib/api/services/aiAnalysis';
import { getAllCategories, getTestsByCategory, getTestById } from '../../lib/constants/dentalTests';
// import type { DentalTest } from '../../lib/constants/dentalTests';
import { cloudinaryUploadService } from '../../lib/services/cloudinaryUpload';
import type { CloudinaryUploadResult } from '../../lib/services/cloudinaryUpload';
import { toast } from 'react-hot-toast';

interface AttachReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (reportData: ReportData) => void;
}

export interface ReportData {
  testName: string;
  result: string;
  image?: File | null;
  imageUrl?: string; // Cloudinary URL for existing images
  imagePublicId?: string; // Cloudinary public ID for existing images
  aiAnalysis?: AIAnalysisResult;
}

export const AttachReportModal: React.FC<AttachReportModalProps> = ({ isOpen, onClose, onSubmit }) => {
  const [selectedTestId, setSelectedTestId] = useState('');
  const [customTestName, setCustomTestName] = useState('');
  const [isCustomTest, setIsCustomTest] = useState(false);
  const [result, setResult] = useState('');
  const [reportImage, setReportImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState<AIAnalysisResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showAiResults, setShowAiResults] = useState(false);

  const clearAIAnalysis = () => {
    setAiAnalysis(null);
    setShowAiResults(false);
    setIsAnalyzing(false);
  };

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setReportImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      
      // Clear AI analysis immediately when new image is selected
      clearAIAnalysis();
    } else {
      setReportImage(null);
      setImagePreview(null);
      clearAIAnalysis();
    }
  };

  const handleImageRemove = () => {
    setReportImage(null);
    setImagePreview(null);
    clearAIAnalysis();
    const fileInput = document.getElementById('report-image-upload') as HTMLInputElement;
    if(fileInput) fileInput.value = '';
  };

  const handleAIAnalysis = async () => {
    if (!reportImage) {
      toast.error('Please upload an image first');
      return;
    }

    // Validate image type
    const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff'];
    if (!validImageTypes.includes(reportImage.type)) {
      toast.error('Please upload a valid image file (JPEG, PNG, BMP, or TIFF)');
      return;
    }

    // Check file size (max 20MB)
    const maxSize = 20 * 1024 * 1024; // 20MB
    if (reportImage.size > maxSize) {
      toast.error('Image file is too large. Please upload an image smaller than 20MB.');
      return;
    }

    setIsAnalyzing(true);
    setShowAiResults(false); // Hide previous results while analyzing
    
    try {
      // Use the new enhanced AI analysis that auto-detects image type
      const analysis = await aiAnalysisService.analyzeDentalImage(reportImage, 'auto-detect');
      setAiAnalysis(analysis);
      setShowAiResults(true);
      
      // Auto-populate findings if result field is empty
      if (!result.trim()) {
        setResult(analysis.findings);
      }

      // Auto-suggest test type based on AI analysis if no test is selected
      if (!isCustomTest && !selectedTestId) {
        const suggestedTestId = getSuggestedTestId(analysis.imageType);
        if (suggestedTestId) {
          setSelectedTestId(suggestedTestId);
          toast.success(`💡 Suggested test type: ${getTestById(suggestedTestId)?.name}`);
        }
      }
      
      // Show success message with detected image type
      const imageTypeLabels = {
        'dental-xray': 'Dental X-ray',
        'intraoral-photo': 'Intraoral Photo',
        'extraoral-photo': 'Extraoral Photo',
        'gum-assessment': 'Gum Assessment',
        'teeth-condition': 'Teeth Condition',
        'oral-pathology': 'Oral Pathology',
        'orthodontic-photo': 'Orthodontic Photo',
        'periodontal-photo': 'Periodontal Photo',
        'unknown': 'Unknown'
      };
      
      const detectedTypeLabel = imageTypeLabels[analysis.imageType] || 'Dental Image';
      toast.success(`✅ ${detectedTypeLabel} analyzed successfully!`);
    } catch (error: any) {
      console.error('AI Analysis Error:', error);
      
      // Provide specific error messages
      if (error.message.includes('does not appear to be a dental-related image')) {
        toast.error('❌ Invalid Image: This doesn\'t appear to be a dental-related image. Please upload a dental X-ray, clinical photo, or oral cavity image.');
      } else if (error.message.includes('does not appear to be a dental X-ray')) {
        toast.error('❌ Invalid Image: This doesn\'t appear to be a dental X-ray. Please upload a valid dental radiograph showing teeth or oral structures.');
      } else if (error.message.includes('Gemini API key')) {
        toast.error('🔑 API Key Required: Please configure your Gemini API key in the .env file.');
      } else if (error.message.includes('API request failed')) {
        toast.error('🔑 API Error: Please check your Gemini API key configuration. See console for details.');
      } else if (error.message.includes('rate limit') || error.message.includes('quota')) {
        toast.error('⏱️ Rate Limit: API quota exceeded. Please wait and try again later.');
      } else if (error.message.includes('401') || error.message.includes('403')) {
        toast.error('🔐 Authentication Error: Invalid API key or access denied.');
      } else {
        toast.error(`🤖 AI Analysis Failed: ${error.message || 'Unknown error occurred'}`);
      }
      
      // Clear analysis state on error
      clearAIAnalysis();
    } finally {
      setIsAnalyzing(false);
    }
  };

  const useAIFindings = () => {
    if (aiAnalysis) {
      setResult(aiAnalysis.findings);
      toast.success('AI findings applied to result field');
    }
  };

  const getTestName = (): string => {
    if (isCustomTest) {
      return customTestName;
    }
    const selectedTest = getTestById(selectedTestId);
    return selectedTest ? selectedTest.name : '';
  };

  const getSuggestedTestId = (imageType: string): string | null => {
    // Map AI detected image types to dental test IDs
    const typeToTestMap: Record<string, string> = {
      'dental-xray': 'bitewing-xray',
      'intraoral-photo': 'intraoral-photos',
      'extraoral-photo': 'extraoral-photos',
      'gum-assessment': 'gum-assessment',
      'teeth-condition': 'comprehensive-exam',
      'oral-pathology': 'lesion-examination',
      'orthodontic-photo': 'model-analysis',
      'periodontal-photo': 'periodontal-charting'
    };
    
    return typeToTestMap[imageType] || null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const testName = getTestName();
    if (!testName || !result) {
        // Basic validation
        alert('Test Name and Result are required.');
        return;
    }

    try {
      let cloudinaryData: CloudinaryUploadResult | undefined;
      
      // Upload image to Cloudinary if present
      if (reportImage) {
        toast.loading('Uploading image to Cloudinary...', { id: 'image-upload' });
        cloudinaryData = await cloudinaryUploadService.uploadDentalReportImage(reportImage, testName);
        toast.success('Image uploaded successfully!', { id: 'image-upload' });
      }

      onSubmit({ 
        testName, 
        result, 
        image: reportImage,
        imageUrl: cloudinaryData?.secure_url,
        imagePublicId: cloudinaryData?.public_id,
        aiAnalysis: aiAnalysis || undefined
      });

      // Reset form and close modal
      setSelectedTestId('');
      setCustomTestName('');
      setIsCustomTest(false);
      setResult('');
      setReportImage(null);
      setImagePreview(null);
      clearAIAnalysis();
      onClose();
    } catch (error: any) {
      console.error('Error submitting report:', error);
      toast.error(`Failed to submit report: ${error.message}`);
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setSelectedTestId('');
    setCustomTestName('');
    setIsCustomTest(false);
    setResult('');
    setReportImage(null);
    setImagePreview(null);
    clearAIAnalysis();
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-white/10 backdrop-blur-md z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg max-h-[90vh] flex flex-col transform transition-all duration-300 ease-out">
        {/* Fixed Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 flex-shrink-0">
          <h2 className="text-xl font-bold text-[#0A0F56] flex items-center">
            <FiPaperclip className="mr-2" /> Attach Report
          </h2>
          <button onClick={handleClose} className="text-gray-500 hover:text-red-600 transition-colors p-1 rounded-full">
            <FiX size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="flex-1 overflow-y-auto">
          <form onSubmit={handleSubmit} className="p-6 space-y-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Test Name</label>
              
              {/* Toggle between predefined and custom test */}
              <div className="flex items-center gap-4 mb-2">
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={!isCustomTest}
                    onChange={() => setIsCustomTest(false)}
                    className="mr-2 accent-[#0A0F56]"
                  />
                  <span className="text-sm text-gray-700">Select from list</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    checked={isCustomTest}
                    onChange={() => setIsCustomTest(true)}
                    className="mr-2 accent-[#0A0F56]"
                  />
                  <span className="text-sm text-gray-700">Custom test</span>
                </label>
              </div>

              {!isCustomTest ? (
                <div className="relative">
                  <select
                    value={selectedTestId}
                    onChange={(e) => setSelectedTestId(e.target.value)}
                    className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56] appearance-none pr-10"
                    required
                  >
                    <option value="">Select a dental test...</option>
                    {getAllCategories().map(category => (
                      <optgroup key={category} label={category}>
                        {getTestsByCategory(category).map(test => (
                          <option key={test.id} value={test.id}>
                            {test.name}
                          </option>
                        ))}
                      </optgroup>
                    ))}
                  </select>
                  <FiChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none" />
                  
                  {/* Show description for selected test */}
                  {selectedTestId && (
                    <p className="text-xs text-gray-500 mt-1">
                      {getTestById(selectedTestId)?.description}
                    </p>
                  )}
                </div>
              ) : (
                <input
                  type="text"
                  value={customTestName}
                  onChange={(e) => setCustomTestName(e.target.value)}
                  placeholder="Enter custom test name..."
                  className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56]"
                  required
                />
              )}
            </div>

            <div>
              <label htmlFor="result" className="block text-sm font-semibold text-gray-700 mb-1">Result / Findings</label>
              <textarea
                id="result"
                value={result}
                onChange={(e) => setResult(e.target.value)}
                placeholder="Enter test results or findings..."
                rows={4}
                className="w-full border border-gray-300 rounded-lg px-4 py-2 text-sm bg-gray-50 focus:outline-none focus:ring-2 focus:ring-[#0A0F56] resize-none"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Upload Image (Optional)</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-[#0A0F56] transition-colors bg-gray-50">
                <div className="space-y-1 text-center">
                  {imagePreview ? (
                    <div className="relative group">
                      <img src={imagePreview} alt="Report preview" className="mx-auto h-32 w-auto rounded-md object-contain" />
                      <button 
                        type="button"
                        onClick={handleImageRemove}
                        className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <FiX size={14}/>
                      </button>
                    </div>
                  ) : (
                    <FiUpload className="mx-auto h-10 w-10 text-gray-400" />
                  )}
                  <div className="flex text-sm text-gray-600">
                    <label
                      htmlFor="report-image-upload"
                      className="relative cursor-pointer font-semibold text-[#0A0F56] hover:text-[#232a7c] focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-[#0A0F56] px-1"
                    >
                      <span>Upload a file</span>
                      <input id="report-image-upload" name="report-image-upload" type="file" className="sr-only" onChange={handleImageChange} accept="image/*" />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG, GIF up to 20MB</p>
                </div>
              </div>
              {reportImage && (
                <p className="text-xs text-gray-500 mt-1">Selected: {reportImage.name}</p>
              )}
            </div>

            {/* AI Analysis Section */}
            {reportImage && (
              <div className="border-t border-gray-200 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-gray-700 flex items-center">
                    <FiCpu className="mr-2 text-blue-600" />
                    AI-Powered Analysis
                  </h3>
                  <button
                    type="button"
                    onClick={handleAIAnalysis}
                    disabled={isAnalyzing}
                    className="flex items-center px-3 py-1.5 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isAnalyzing ? (
                      <>
                        <div className="animate-spin rounded-full h-3 w-3 border-t-2 border-b-2 border-white mr-2"></div>
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <FiCpu className="mr-1" />
                        Analyze Image
                      </>
                    )}
                  </button>
                </div>

                {/* AI Info Banner */}
                {!showAiResults && !isAnalyzing && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                    <div className="flex items-start">
                      <FiCpu className="text-blue-600 mt-0.5 mr-2 flex-shrink-0" />
                      <div className="text-xs text-blue-800">
                        <p className="font-semibold mb-1">AI Dental Image Analysis</p>
                        <p>Upload any dental-related image and our AI will analyze it:</p>
                        <ul className="mt-1 ml-2 space-y-0.5">
                          <li>• <strong>X-rays:</strong> Radiographic assessment & pathology detection</li>
                          <li>• <strong>Clinical Photos:</strong> Tooth & gum condition analysis</li>
                          <li>• <strong>Gum Assessment:</strong> Periodontal health evaluation</li>
                          <li>• <strong>Oral Pathology:</strong> Lesion & abnormality detection</li>
                          <li>• <strong>Orthodontic:</strong> Alignment & treatment progress</li>
                        </ul>
                        <p className="mt-2 text-blue-600 font-medium">
                          🤖 AI automatically detects image type and provides specialized analysis
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* AI Analysis Results */}
                {showAiResults && aiAnalysis && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 space-y-3 max-h-80 overflow-y-auto">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <h4 className="text-sm font-semibold text-blue-900 mr-2">AI Analysis Results</h4>
                        {aiAnalysis.imageType && (
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                            {aiAnalysis.imageType.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center text-xs text-blue-700">
                        <FiCheck className="mr-1" />
                        {aiAnalysis.confidence}% Confidence
                      </div>
                    </div>

                    <div>
                      <h5 className="text-xs font-semibold text-blue-800 mb-1">Findings:</h5>
                      <div className="text-xs text-blue-700 bg-white rounded p-2 border border-blue-200 max-h-32 overflow-y-auto">
                        {aiAnalysis.findings}
                      </div>
                    </div>

                    {aiAnalysis.detectedConditions.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-blue-800 mb-1">Detected Conditions:</h5>
                        <div className="flex flex-wrap gap-1">
                          {aiAnalysis.detectedConditions.map((condition, index) => (
                            <span
                              key={index}
                              className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200"
                            >
                              <FiAlertCircle className="mr-1 h-3 w-3" />
                              {condition}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    {aiAnalysis.recommendations.length > 0 && (
                      <div>
                        <h5 className="text-xs font-semibold text-blue-800 mb-1">Recommendations:</h5>
                        <div className="max-h-24 overflow-y-auto">
                          <ul className="text-xs text-blue-700 space-y-1">
                            {aiAnalysis.recommendations.map((rec, index) => (
                              <li key={index} className="flex items-start">
                                <span className="mr-2">•</span>
                                <span>{rec}</span>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}

                    <div className="flex justify-end pt-2 border-t border-blue-200">
                      <button
                        type="button"
                        onClick={useAIFindings}
                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 underline"
                      >
                        Use AI findings in result field
                      </button>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isAnalyzing && (
                  <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-600 mx-auto mb-2"></div>
                    <p className="text-sm text-gray-600">AI is analyzing your dental image...</p>
                    <p className="text-xs text-gray-500 mt-1">Detecting image type and performing specialized analysis</p>
                  </div>
                )}
              </div>
            )}
          </form>
        </div>

        {/* Fixed Footer */}
        <div className="flex justify-end px-6 py-4 border-t border-gray-200 space-x-3 flex-shrink-0 bg-gray-50">
          <button
            type="button"
            onClick={handleClose}
            className="px-6 py-2.5 text-sm font-semibold text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            form="report-form"
            onClick={handleSubmit}
            className="px-6 py-2.5 text-sm font-semibold text-white bg-[#0A0F56] hover:bg-[#232a7c] rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-[#0A0F56] shadow-md hover:shadow-lg"
          >
            Attach Report
          </button>
        </div>
      </div>
    </div>
  );
}; 