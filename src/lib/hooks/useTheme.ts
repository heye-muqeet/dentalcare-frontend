import { useAppSelector } from './index';
import { getThemeByRole, getThemeClasses, type PortalTheme } from '../theme/portalThemes';
import type { RootState } from '../store/store';

export const useTheme = (): { theme: PortalTheme; classes: ReturnType<typeof getThemeClasses> } => {
  const user = useAppSelector((state: RootState) => state.auth.user);
  const role = user?.role || 'super_admin';
  
  const theme = getThemeByRole(role);
  const classes = getThemeClasses(role);
  
  return { theme, classes };
};

export default useTheme;
