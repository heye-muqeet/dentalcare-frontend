import { useAppSelector } from '../../lib/hooks';
import type { RootState } from '../../lib/store/store';

export function Topbar() {
  const { user } = useAppSelector((state: RootState) => state.auth);
  console.log('Redux user:', user);

  return (
    <nav className="bg-[#0A0F56] text-white px-6 py-0.75 flex items-center justify-between shadow-md">
      
    {/* Left: Clinic Info */}
    <div className="flex items-center space-x-2 bg-[#1E2358] px-4 py-2 rounded-lg">
      <img 
        src="https://www.creativefabrica.com/wp-content/uploads/2019/05/Medical-healthy-clinic-logo-concept-by-DEEMKA-STUDIO-1-580x406.jpg" 
        alt="Clinic Logo" 
        className="w-8 h-8 rounded-full"
      />
      <div className="text-sm">
        <p className="font-medium">{user?.organization?.name || 'Clinic Name'}</p>
        <p className="text-gray-300">{user?.organization?.address || 'Clinic Address'}</p>
      </div>
      <button className="text-gray-300 ml-2">▼</button>
    </div>

    {/* Right: Icons & Profile */}
    <div className="flex items-center space-x-4">
      
      {/* Chat & Notification Icons */}
      {/* <button className="bg-[#1E2358] p-2 rounded-md">
        💬
      </button>
      <button className="bg-[#1E2358] p-2 rounded-md">
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
          <p className="font-medium">{user?.name || 'Guest'}</p>
          <p className="text-gray-300 text-xs">{user?.email || 'Not logged in'}</p>
        </div>
      </div>

      {/* More Options */}
      <button className="bg-[#1E2358] p-2 rounded-md">⋯</button>

    </div>
  </nav>
  );
} 