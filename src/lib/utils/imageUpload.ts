/**
 * Utility functions for handling image uploads and conversions
 */

/**
 * Convert a File object to base64 string
 */
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result);
    };
    reader.onerror = error => reject(error);
  });
};

/**
 * Convert base64 string back to a File object
 */
export const base64ToFile = (base64: string, filename: string, mimeType: string): File => {
  const byteCharacters = atob(base64.split(',')[1]);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new File([byteArray], filename, { type: mimeType });
};

/**
 * Get file extension from base64 data URL
 */
export const getFileExtensionFromBase64 = (base64: string): string => {
  const mimeType = base64.split(';')[0].split(':')[1];
  switch (mimeType) {
    case 'image/jpeg':
      return 'jpg';
    case 'image/png':
      return 'png';
    case 'image/gif':
      return 'gif';
    case 'image/bmp':
      return 'bmp';
    case 'image/tiff':
      return 'tiff';
    default:
      return 'jpg';
  }
};

/**
 * Validate if a string is a valid base64 data URL
 */
export const isValidBase64DataUrl = (str: string): boolean => {
  try {
    return str.startsWith('data:image/') && str.includes('base64,');
  } catch {
    return false;
  }
}; 