/**
 * Generates a random alphanumeric password of specified length
 * @param length Length of the password to generate (default: 10)
 * @returns Random alphanumeric password string
 */
export function generateRandomPassword(length: number = 10): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let password = '';
  
  // Ensure we have at least one uppercase, one lowercase, and one number
  password += chars.charAt(Math.floor(Math.random() * 26)); // uppercase
  password += chars.charAt(26 + Math.floor(Math.random() * 26)); // lowercase
  password += chars.charAt(52 + Math.floor(Math.random() * 10)); // number
  
  // Fill the rest with random characters
  for (let i = 3; i < length; i++) {
    password += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  // Shuffle the password characters
  return password.split('').sort(() => 0.5 - Math.random()).join('');
}
