export const getInitials = (name: string = ''): string => {
  if (!name || typeof name !== 'string') {
    return '#'; // Default for invalid input
  }

  const words = name.trim().split(/\s+/);
  if (words.length === 0 || words[0] === '') {
    return '#'; // Default for empty or whitespace-only names
  }

  if (words.length === 1) {
    return words[0].substring(0, 2).toUpperCase(); // Take first two letters if single word
  }

  // Take the first letter of the first two words
  const firstInitial = words[0][0];
  const secondInitial = words[words.length > 1 ? 1 : 0][0]; // Use first word again if only one word somehow slipped through, though covered above
  
  return `${firstInitial}${secondInitial}`.toUpperCase();
}; 