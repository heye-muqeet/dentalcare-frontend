import Navbar from "./Header";
import Home from "./Home"; // Your sidebar component

const Layout = ({ children }) => {
  return (
    <div className="h-screen flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Sidebar & Main Content */}
      <div className="flex flex-1">
        {/* Sidebar */}
        <Home />

        {/* Main Content Area */}
        <main className="flex-1 bg-gray-100 p-6 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
