export interface PortalTheme {
  name: string;
  primary: {
    from: string;
    to: string;
    bg: string;
    text: string;
    accent: string;
  };
  secondary: {
    bg: string;
    text: string;
    accent: string;
  };
  accent: {
    bg: string;
    text: string;
    hover: string;
  };
  button: {
    primary: string;
    primaryHover: string;
    secondary: string;
    secondaryHover: string;
  };
  card: {
    bg: string;
    border: string;
    shadow: string;
  };
  input: {
    border: string;
    focus: string;
    focusBorder: string;
  };
  status: {
    success: string;
    warning: string;
    error: string;
    info: string;
  };
  icon: string;
  gradient: string;
}

export const portalThemes: Record<string, PortalTheme> = {
  super_admin: {
    name: 'Super Admin',
    primary: {
      from: 'purple-900',
      to: 'blue-900',
      bg: 'bg-gradient-to-b from-purple-900 to-blue-900',
      text: 'text-white',
      accent: 'text-purple-200'
    },
    secondary: {
      bg: 'bg-white/10',
      text: 'text-white/90',
      accent: 'text-purple-200/80'
    },
    accent: {
      bg: 'bg-purple-500',
      text: 'text-white',
      hover: 'hover:bg-purple-600'
    },
    button: {
      primary: 'bg-purple-600 hover:bg-purple-700',
      primaryHover: 'hover:bg-purple-700',
      secondary: 'bg-white/20 hover:bg-white/30',
      secondaryHover: 'hover:bg-white/30'
    },
    card: {
      bg: 'bg-white',
      border: 'border-gray-200',
      shadow: 'shadow-sm'
    },
    input: {
      border: 'border-gray-300',
      focus: 'focus:ring-purple-500',
      focusBorder: 'focus:border-transparent'
    },
    status: {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100'
    },
    icon: '⚡',
    gradient: 'from-purple-900 to-blue-900'
  },
  organization_admin: {
    name: 'Organization Admin',
    primary: {
      from: 'blue-900',
      to: 'cyan-900',
      bg: 'bg-gradient-to-b from-blue-900 to-cyan-900',
      text: 'text-white',
      accent: 'text-cyan-200'
    },
    secondary: {
      bg: 'bg-white/10',
      text: 'text-white/90',
      accent: 'text-cyan-200/80'
    },
    accent: {
      bg: 'bg-blue-500',
      text: 'text-white',
      hover: 'hover:bg-blue-600'
    },
    button: {
      primary: 'bg-blue-600 hover:bg-blue-700',
      primaryHover: 'hover:bg-blue-700',
      secondary: 'bg-white/20 hover:bg-white/30',
      secondaryHover: 'hover:bg-white/30'
    },
    card: {
      bg: 'bg-white',
      border: 'border-gray-200',
      shadow: 'shadow-sm'
    },
    input: {
      border: 'border-gray-300',
      focus: 'focus:ring-blue-500',
      focusBorder: 'focus:border-transparent'
    },
    status: {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100'
    },
    icon: '🏥',
    gradient: 'from-blue-900 to-cyan-900'
  },
  branch_admin: {
    name: 'Branch Admin',
    primary: {
      from: 'green-900',
      to: 'emerald-900',
      bg: 'bg-gradient-to-b from-green-900 to-emerald-900',
      text: 'text-white',
      accent: 'text-emerald-200'
    },
    secondary: {
      bg: 'bg-white/10',
      text: 'text-white/90',
      accent: 'text-emerald-200/80'
    },
    accent: {
      bg: 'bg-emerald-500',
      text: 'text-white',
      hover: 'hover:bg-emerald-600'
    },
    button: {
      primary: 'bg-emerald-600 hover:bg-emerald-700',
      primaryHover: 'hover:bg-emerald-700',
      secondary: 'bg-white/20 hover:bg-white/30',
      secondaryHover: 'hover:bg-white/30'
    },
    card: {
      bg: 'bg-white',
      border: 'border-gray-200',
      shadow: 'shadow-sm'
    },
    input: {
      border: 'border-gray-300',
      focus: 'focus:ring-emerald-500',
      focusBorder: 'focus:border-transparent'
    },
    status: {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100'
    },
    icon: '🏢',
    gradient: 'from-green-900 to-emerald-900'
  },
  doctor: {
    name: 'Doctor',
    primary: {
      from: 'indigo-900',
      to: 'purple-900',
      bg: 'bg-gradient-to-b from-indigo-900 to-purple-900',
      text: 'text-white',
      accent: 'text-purple-200'
    },
    secondary: {
      bg: 'bg-white/10',
      text: 'text-white/90',
      accent: 'text-purple-200/80'
    },
    accent: {
      bg: 'bg-indigo-500',
      text: 'text-white',
      hover: 'hover:bg-indigo-600'
    },
    button: {
      primary: 'bg-indigo-600 hover:bg-indigo-700',
      primaryHover: 'hover:bg-indigo-700',
      secondary: 'bg-white/20 hover:bg-white/30',
      secondaryHover: 'hover:bg-white/30'
    },
    card: {
      bg: 'bg-white',
      border: 'border-gray-200',
      shadow: 'shadow-sm'
    },
    input: {
      border: 'border-gray-300',
      focus: 'focus:ring-indigo-500',
      focusBorder: 'focus:border-transparent'
    },
    status: {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100'
    },
    icon: '👨‍⚕️',
    gradient: 'from-indigo-900 to-purple-900'
  },
  receptionist: {
    name: 'Receptionist',
    primary: {
      from: 'teal-900',
      to: 'cyan-900',
      bg: 'bg-gradient-to-b from-teal-900 to-cyan-900',
      text: 'text-white',
      accent: 'text-cyan-200'
    },
    secondary: {
      bg: 'bg-white/10',
      text: 'text-white/90',
      accent: 'text-cyan-200/80'
    },
    accent: {
      bg: 'bg-teal-500',
      text: 'text-white',
      hover: 'hover:bg-teal-600'
    },
    button: {
      primary: 'bg-teal-600 hover:bg-teal-700',
      primaryHover: 'hover:bg-teal-700',
      secondary: 'bg-white/20 hover:bg-white/30',
      secondaryHover: 'hover:bg-white/30'
    },
    card: {
      bg: 'bg-white',
      border: 'border-gray-200',
      shadow: 'shadow-sm'
    },
    input: {
      border: 'border-gray-300',
      focus: 'focus:ring-teal-500',
      focusBorder: 'focus:border-transparent'
    },
    status: {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100'
    },
    icon: '👩‍💼',
    gradient: 'from-teal-900 to-cyan-900'
  },
  patient: {
    name: 'Patient',
    primary: {
      from: 'teal-900',
      to: 'cyan-900',
      bg: 'bg-gradient-to-b from-teal-900 to-cyan-900',
      text: 'text-white',
      accent: 'text-cyan-200'
    },
    secondary: {
      bg: 'bg-white/10',
      text: 'text-white/90',
      accent: 'text-cyan-200/80'
    },
    accent: {
      bg: 'bg-teal-500',
      text: 'text-white',
      hover: 'hover:bg-teal-600'
    },
    button: {
      primary: 'bg-teal-600 hover:bg-teal-700',
      primaryHover: 'hover:bg-teal-700',
      secondary: 'bg-white/20 hover:bg-white/30',
      secondaryHover: 'hover:bg-white/30'
    },
    card: {
      bg: 'bg-white',
      border: 'border-gray-200',
      shadow: 'shadow-sm'
    },
    input: {
      border: 'border-gray-300',
      focus: 'focus:ring-teal-500',
      focusBorder: 'focus:border-transparent'
    },
    status: {
      success: 'text-green-600 bg-green-100',
      warning: 'text-yellow-600 bg-yellow-100',
      error: 'text-red-600 bg-red-100',
      info: 'text-blue-600 bg-blue-100'
    },
    icon: '👤',
    gradient: 'from-teal-900 to-cyan-900'
  }
};

export const getThemeByRole = (role: string): PortalTheme => {
  return portalThemes[role] || portalThemes.super_admin;
};

export const getThemeClasses = (role: string) => {
  const theme = getThemeByRole(role);
  return {
    primaryButton: `px-4 py-2 ${theme.button.primary} text-white rounded-lg transition-colors`,
    secondaryButton: `px-4 py-2 ${theme.button.secondary} ${theme.primary.text} rounded-lg transition-colors`,
    input: `w-full px-3 py-2 border ${theme.input.border} rounded-lg ${theme.input.focus} ${theme.input.focusBorder}`,
    card: `${theme.card.bg} rounded-lg ${theme.card.shadow} ${theme.card.border} border`,
    modalHeader: `bg-gradient-to-r ${theme.primary.from} ${theme.primary.to} text-white p-4`,
    statusSuccess: `${theme.status.success} px-2 py-1 rounded-full text-xs font-medium`,
    statusWarning: `${theme.status.warning} px-2 py-1 rounded-full text-xs font-medium`,
    statusError: `${theme.status.error} px-2 py-1 rounded-full text-xs font-medium`,
    statusInfo: `${theme.status.info} px-2 py-1 rounded-full text-xs font-medium`
  };
};
