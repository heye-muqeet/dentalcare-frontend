import React from "react";
import { images } from "../assets"; // Import your centralized assets

interface ImageProps {
  name: keyof typeof images;
  width?: string;  // Tailwind's width class, e.g., 'w-64'
  height?: string; // Tailwind's height class, e.g., 'h-40'
  alt?: string;
}

const ImageDisplay: React.FC<ImageProps> = ({ name, width = "w-64", height = "h-40", alt = "" }) => {
  const image = images[name]; // Access the image dynamically from the object
  return <img src={image} alt={alt} className={`${width} ${height} object-cover`} />;
};

export default ImageDisplay;
