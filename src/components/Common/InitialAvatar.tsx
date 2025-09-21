import React from 'react';

interface InitialAvatarProps {
  initials: string;
  size?: number; // e.g., 24 for w-24 h-24, or specific pixel value for style
  bgColor?: string; // Tailwind CSS background color class e.g., 'bg-blue-500'
  textColor?: string; // Tailwind CSS text color class e.g., 'text-white'
  className?: string; // Allow additional custom classes
}

const InitialAvatar: React.FC<InitialAvatarProps> = ({
  initials,
  size = 24, // Default to match w-24 h-24 like in AppointmentDetails
  bgColor = 'bg-gray-300', // Default background color
  textColor = 'text-gray-700', // Default text color
  className = ''
}) => {
  const sizeClass = `w-${size} h-${size}`;

  return (
    <div
      className={`rounded-full flex items-center justify-center object-cover border-4 border-white shadow-lg ${sizeClass} ${bgColor} ${textColor} ${className}`}
      aria-label={`Avatar for ${initials}`}
      title={initials}
    >
      <span className="text-md"> {/* Adjust text size as needed based on avatar size */} 
        {initials}
      </span>
    </div>
  );
};

export default InitialAvatar; 