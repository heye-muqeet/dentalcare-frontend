import React from 'react';
import {
  FiHome,
  FiUsers,
  FiBarChart,
  FiCalendar,
  FiFileText,
  FiDollarSign,
  FiCreditCard,
  FiUser,
  FiLogOut,
  FiActivity,
  FiShield,
  FiSettings,
  FiDatabase,
  FiTrendingUp,
  FiUserCheck,
  FiClipboard,
  FiHeart,
  FiGrid,
  FiTag
} from 'react-icons/fi';

// Icon mapping for sidebar navigation
const iconMap = {
  // Dashboard & Overview
  'bar_chart': FiBarChart,
  'dashboard': FiHome,
  
  // User Management
  'user': FiUser,
  'users': FiUsers,
  'user_check': FiUserCheck,
  
  // Clinical Management
  'calendar': FiCalendar,
  'calender_add': FiCalendar, // Legacy support
  'vase': FiClipboard, // Appointments - using clipboard as better representation
  'appointments': FiCalendar,
  'treatments': FiHeart,
  'stethoscope': FiActivity, // Using activity icon as substitute
  
  // Business Management
  'document_chart': FiFileText,
  'documents': FiFileText,
  'invoices': FiDollarSign,
  'expenses': FiCreditCard,
  'billing': FiDollarSign,
  
  // System Management
  'building': FiGrid, // Using grid icon as substitute for building
  'organizations': FiGrid,
  'shield': FiShield,
  'security': FiShield,
  'settings': FiSettings,
  'database': FiDatabase,
  'analytics': FiTrendingUp,
  'activity': FiActivity,
  'tag': FiTag, // Categories
  
  // Actions
  'logout': FiLogOut,
} as const;

export type SidebarIconName = keyof typeof iconMap;

interface SidebarIconProps {
  name: string;
  className?: string;
  size?: number;
}

const SidebarIcon: React.FC<SidebarIconProps> = ({ 
  name, 
  className = "w-5 h-5", 
  size = 20 
}) => {
  // Get the icon component from the mapping
  const IconComponent = iconMap[name as SidebarIconName];
  
  // Fallback to a default icon if not found
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found in iconMap. Using default icon.`);
    return <FiFileText className={className} size={size} />;
  }
  
  return <IconComponent className={className} size={size} />;
};

export default SidebarIcon;
