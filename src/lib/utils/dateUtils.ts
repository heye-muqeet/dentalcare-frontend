/**
 * Calculates age from a date of birth
 * @param dateOfBirth The date of birth as string or Date object
 * @returns The calculated age as a number
 */
export function calculateAge(dateOfBirth: string | Date | undefined): number {
  if (!dateOfBirth) return 0;
  
  const dob = new Date(dateOfBirth);
  const today = new Date();
  
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  
  // Adjust age if birthday hasn't occurred yet this year
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  
  return age;
}