/**
 * Cloudinary upload service for dental report images
 */

export interface CloudinaryUploadResult {
  public_id: string;
  secure_url: string;
  url: string;
  width: number;
  height: number;
  format: string;
  resource_type: string;
  bytes: number;
}

export interface CloudinaryError {
  message: string;
  http_code: number;
}

class CloudinaryUploadService {
  private readonly cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
  private readonly uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;
  private readonly apiKey = import.meta.env.VITE_CLOUDINARY_API_KEY;

  constructor() {
    console.log('🔧 Cloudinary Configuration:');
    console.log('- Cloud Name:', this.cloudName);
    console.log('- Upload Preset:', this.uploadPreset);
    console.log('- API Key exists:', !!this.apiKey);

    if (!this.cloudName || !this.uploadPreset) {
      console.error('❌ Cloudinary configuration missing. Please set VITE_CLOUDINARY_CLOUD_NAME and VITE_CLOUDINARY_UPLOAD_PRESET in your .env file');
    }
  }

  /**
   * Upload an image file to Cloudinary
   */
  async uploadImage(
    file: File, 
    options: {
      folder?: string;
      tags?: string[];
      transformation?: string;
      context?: Record<string, string>;
    } = {}
  ): Promise<CloudinaryUploadResult> {
    try {
      if (!this.cloudName || !this.uploadPreset) {
        throw new Error('Cloudinary configuration is missing. Please check your environment variables.');
      }

      // Validate file type
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/bmp', 'image/tiff', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        throw new Error('Invalid file type. Please upload a valid image file (JPEG, PNG, BMP, TIFF, or WebP).');
      }

      // Check file size (max 10MB for images)
      const maxSize = 10 * 1024 * 1024; // 10MB
      if (file.size > maxSize) {
        throw new Error('File size too large. Please upload an image smaller than 10MB.');
      }

      const formData = new FormData();
      formData.append('file', file);
      formData.append('upload_preset', this.uploadPreset);
      
      // Optional parameters
      if (options.folder) {
        formData.append('folder', options.folder);
      }
      
      if (options.tags && options.tags.length > 0) {
        formData.append('tags', options.tags.join(','));
      }

      if (options.transformation) {
        formData.append('transformation', options.transformation);
      }

      if (options.context) {
        formData.append('context', Object.entries(options.context).map(([key, value]) => `${key}=${value}`).join('|'));
      }

      // Add timestamp for better organization
      formData.append('context', `upload_time=${new Date().toISOString()}`);

      const uploadUrl = `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`;

      console.log('📤 Uploading image to Cloudinary...');
      
      const response = await fetch(uploadUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(`Cloudinary upload failed: ${response.status} ${errorData.error?.message || response.statusText}`);
      }

      const result: CloudinaryUploadResult = await response.json();
      
      console.log('✅ Image uploaded successfully to Cloudinary');
      console.log('📍 Image URL:', result.secure_url);
      
      return result;

    } catch (error) {
      console.error('❌ Cloudinary upload failed:', error);
      
      if (error instanceof Error) {
        throw error;
      }
      
      throw new Error('Failed to upload image. Please try again.');
    }
  }

  /**
   * Upload dental report image with specific settings
   */
  async uploadDentalReportImage(file: File, testName: string): Promise<CloudinaryUploadResult> {
    const sanitizedTestName = testName.replace(/[^a-zA-Z0-9\s]/g, '').replace(/\s+/g, '_').toLowerCase();
    const timestamp = Date.now();
    
    return this.uploadImage(file, {
      folder: 'dental-reports',
      tags: ['dental', 'report', sanitizedTestName],
    //   transformation: 'q_auto,f_auto,c_limit,w_1920,h_1920', // Auto quality/format, max 1920px
      context: {
        test_name: testName,
        upload_date: new Date().toISOString(),
        file_name: `${sanitizedTestName}_${timestamp}`
      }
    });
  }

  /**
   * Delete an image from Cloudinary using public_id
   */
  async deleteImage(publicId: string): Promise<boolean> {
    try {
      if (!this.cloudName || !this.apiKey) {
        console.warn('Cannot delete image: Cloudinary configuration incomplete');
        return false;
      }

      // Note: For deletion, you typically need to implement server-side deletion
      // using your API key and secret. This is just a placeholder for the structure.
      console.log('🗑️ Image deletion requested for:', publicId);
      console.log('Note: Implement server-side deletion for security');
      
      return true;
    } catch (error) {
      console.error('Failed to delete image:', error);
      return false;
    }
  }

  /**
   * Generate optimized image URL with transformations
   */
  generateOptimizedUrl(
    publicId: string, 
    options: {
      width?: number;
      height?: number;
      quality?: string;
      format?: string;
      crop?: string;
    } = {}
  ): string {
    if (!this.cloudName) {
      return '';
    }

    const baseUrl = `https://res.cloudinary.com/${this.cloudName}/image/upload`;
    const transformations: string[] = [];

    if (options.width) transformations.push(`w_${options.width}`);
    if (options.height) transformations.push(`h_${options.height}`);
    if (options.quality) transformations.push(`q_${options.quality}`);
    if (options.format) transformations.push(`f_${options.format}`);
    if (options.crop) transformations.push(`c_${options.crop}`);

    // Default optimizations
    if (transformations.length === 0) {
      transformations.push('q_auto', 'f_auto');
    }

    const transformationString = transformations.join(',');
    return `${baseUrl}/${transformationString}/${publicId}`;
  }

  /**
   * Extract public_id from Cloudinary URL
   */
  extractPublicIdFromUrl(url: string): string | null {
    try {
      const match = url.match(/\/v\d+\/(.+)\.[a-zA-Z]+$/);
      return match ? match[1] : null;
    } catch {
      return null;
    }
  }
}

export const cloudinaryUploadService = new CloudinaryUploadService(); 