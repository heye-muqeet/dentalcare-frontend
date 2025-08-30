export function UserProfile() {
  return (
    <div className="flex items-center space-x-3">
      <img
        src="https://randomuser.me/api/portraits/men/32.jpg"
        alt="User Avatar"
        className="w-10 h-10 rounded-full border"
      />
      <div className="flex flex-col">
        <span className="font-medium text-gray-900">Abu Fahim</span>
        <span className="text-xs text-gray-500">hello@fahim.com</span>
      </div>
    </div>
  );
} 