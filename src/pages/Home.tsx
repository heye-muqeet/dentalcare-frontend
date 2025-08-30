import { icons } from "../assets";
import Icon from "../components/Icons";

interface MenuItemProps {
  icon: keyof typeof icons; // 'icon' will be a key from the 'icons' object
  text: string;
}


function Home() {
  return (
    <div className="bg-white w-64 h-screen rounded-lg m-5 mt-10 drop-shadow-md p-4">
      {/* Sidebar Title */}
      <div className="flex items-center pb-3 justify-self-center">
        <span className="text-lg font-semibold text-gray-900">Medic</span>
      </div>
      <div className="bg-gray-200 h-0.5 w-full mb-4"></div>

      {/* Menu Items */}
      <div className="space-y-1">
        <MenuItem icon="bar_chart" text="Dashboard" />
        <MenuItem icon="calender_add" text="Doctor Appointment" />
        <MenuItem icon="vase" text="Lab Appointment" />
        <MenuItem icon="users" text="Patients List" />

        <div className="bg-gray-200 h-0.5 w-full my-2"></div>

        <MenuItem icon="document_chart" text="Billing" />
        <MenuItem icon="user" text="Account" />

        <div className="bg-gray-200 h-0.5 w-full my-2"></div>

        <MenuItem icon="settings" text="Settings" />
        <MenuItem icon="logout" text="Log Out" />
      </div>
    </div>
  );
}

// Reusable Menu Item Component
function MenuItem({ icon, text }: MenuItemProps) {
  return (
    <div
      className="flex items-center space-x-3 p-3 rounded-lg cursor-pointer 
      text-gray-700 text-[13px] font-medium hover:bg-blue-100 transition-all duration-200"
    >
      <Icon name={icon} width="w-4" height="h-4" />
      <span>{text}</span>
    </div>
  );
}

export default Home;
