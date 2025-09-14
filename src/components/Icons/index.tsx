import React from "react";
import { icons } from "../../assets"; // Import your centralized assets

interface IconProps {
    name: keyof typeof icons;
    width?: string;  // Tailwind's width class, e.g., 'w-64'
    height?: string; // Tailwind's height class, e.g., 'h-40'
    alt?: string;
}

const Icon: React.FC<IconProps> = ({ name, width = "w-6", height = "h-4", alt = "" }) => {
    const icon = icons[name]; // Access the icon dynamically from the object
    return <img src={icon} alt={alt} className={`${width} ${height} object-contain`} />;
};

export default Icon;
