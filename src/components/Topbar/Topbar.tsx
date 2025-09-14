import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppSelector, useAppDispatch } from '../../lib/hooks';
import { logoutUser } from '../../lib/store/slices/authSlice';
import type { RootState } from '../../lib/store/store';

export function Topbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  
  const [isClinicDropdownOpen, setIsClinicDropdownOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const clinicDropdownRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Get clinic/system name based on user role
  const getClinicName = () => {
    if (user?.role === 'super_admin') {
      return 'Dental Care Management System';
    }
    return user?.organization?.name || (user as any)?.location?.name || 'Dental Clinic';
  };

  const getClinicAddress = () => {
    if (user?.role === 'super_admin') {
      return 'System Administration';
    }
    return user?.organization?.address || (user as any)?.location?.address || '123 Main St, City';
  };

  const clinicName = getClinicName();
  const clinicAddress = getClinicAddress();

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (clinicDropdownRef.current && !clinicDropdownRef.current.contains(event.target as Node)) {
        setIsClinicDropdownOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    }

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      // Even if logout fails, redirect to login
      navigate('/login');
    }
  };

  return (
    <nav className="bg-[#0A0F56] text-white px-6 py-3 flex items-center justify-between shadow-md">
      
    {/* Left: Clinic Info */}
    <div className="relative" ref={clinicDropdownRef}>
      <div 
        className="flex items-center space-x-2 bg-[#1E2358] px-4 py-2 rounded-lg cursor-pointer hover:bg-[#252A66] transition-colors"
        onClick={() => setIsClinicDropdownOpen(!isClinicDropdownOpen)}
      >
        <img 
          src="https://www.creativefabrica.com/wp-content/uploads/2019/05/Medical-healthy-clinic-logo-concept-by-DEEMKA-STUDIO-1-580x406.jpg" 
          alt="Clinic Logo" 
          className="w-8 h-8 rounded-full"
        />
        <div className="text-sm">
          <p className="font-medium">{clinicName}</p>
          <p className="text-gray-300">{clinicAddress}</p>
        </div>
        <button className={`text-gray-300 ml-2 transition-transform ${isClinicDropdownOpen ? 'rotate-180' : ''}`}>
          ▼
        </button>
      </div>

      {/* Clinic/System Dropdown Menu */}
      {isClinicDropdownOpen && (
        <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
          <div className="p-4">
            <div className="flex items-center space-x-3 mb-3">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center">
                {user?.role === 'super_admin' ? (
                  <span className="text-white font-bold text-lg">⚡</span>
                ) : (
                  <img 
                    src="https://www.creativefabrica.com/wp-content/uploads/2019/05/Medical-healthy-clinic-logo-concept-by-DEEMKA-STUDIO-1-580x406.jpg" 
                    alt="Clinic Logo" 
                    className="w-12 h-12 rounded-full"
                  />
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">{clinicName}</h3>
                <p className="text-sm text-gray-600">{clinicAddress}</p>
              </div>
            </div>
            <div className="border-t pt-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Status</p>
                  <p className="font-medium text-green-600">Active</p>
                </div>
                <div>
                  <p className="text-gray-500">Your Role</p>
                  <p className="font-medium text-blue-600">{user?.role?.replace('_', ' ').toUpperCase()}</p>
                </div>
                {user?.role === 'super_admin' && (
                  <>
                    <div>
                      <p className="text-gray-500">System Access</p>
                      <p className="font-medium text-purple-600">Full Control</p>
                    </div>
                    <div>
                      <p className="text-gray-500">Scope</p>
                      <p className="font-medium text-orange-600">All Organizations</p>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Right: Icons & Profile */}
    <div className="flex items-center space-x-4">
      
      {/* Chat & Notification Icons - Commented out for now */}
      {/* <button className="bg-[#1E2358] p-2 rounded-md hover:bg-[#252A66] transition-colors">
        💬
      </button>
      <button className="bg-[#1E2358] p-2 rounded-md hover:bg-[#252A66] transition-colors">
        🔔
      </button> */}

      {/* Divider */}
      <div className="h-6 w-[1px] bg-gray-500"></div>

      {/* User Profile */}
      <div className="flex items-center space-x-2">
        <img 
          src={user?.profileImage || "https://e7.pngegg.com/pngimages/550/169/png-clipart-user-profile-computer-icons-user-interface-female-symbol-miscellaneous-purple-thumbnail.png"} 
          alt="User Avatar" 
          className="w-8 h-8 rounded-full"
        />
        <div className="text-sm">
          <p className="font-medium">{user?.firstName || user?.name || 'Guest'}</p>
          <p className="text-gray-300 text-xs">{user?.email || 'Not logged in'}</p>
        </div>
      </div>

      {/* More Options - Three Dots Menu */}
      <div className="relative" ref={userMenuRef}>
        <button 
          className="bg-[#1E2358] p-2 rounded-md hover:bg-[#252A66] transition-colors"
          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
        >
          ⋯
        </button>

        {/* User Menu Dropdown */}
        {isUserMenuOpen && (
          <div className="absolute top-full right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-50">
            <div className="py-1">
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/profile');
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3">👤</span>
                Profile Settings
              </button>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  navigate('/settings');
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
              >
                <span className="mr-3">⚙️</span>
                Settings
              </button>
              <div className="border-t border-gray-100 my-1"></div>
              <button
                onClick={() => {
                  setIsUserMenuOpen(false);
                  handleLogout();
                }}
                className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 transition-colors"
              >
                <span className="mr-3">🚪</span>
                Logout
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  </nav>
  );
}