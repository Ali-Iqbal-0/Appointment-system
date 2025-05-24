import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Contact2,
  Book,
  File,
  Phone,
  FileText,
  SendToBack,
  ClipboardCheck,
  User,
  ShoppingBag,
  PhoneCall,
} from "lucide-react";

const Sidebar = ({ isSidebarOpen, setIsSidebarOpen }) => {
  const sidebarRef = useRef(null);
  const location = useLocation();
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const handleResize = () => {
      const isCurrentlyMobile = window.innerWidth < 768;
      setIsMobile(isCurrentlyMobile);
      setIsSidebarOpen(!isCurrentlyMobile);
    };

    handleResize(); // Initial setup
    window.addEventListener("resize", handleResize);

    return () => window.removeEventListener("resize", handleResize);
  }, [setIsSidebarOpen]);

  // Close sidebar when clicking outside (only on mobile)
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        if (isMobile && isSidebarOpen) {
          setIsSidebarOpen(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside); // Fix for mobile

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [setIsSidebarOpen, isMobile, isSidebarOpen]);

  const menuItems = [
    { label: "Appointments", icon: <Home />, link: "/" },
    { label: "Calls", icon: <PhoneCall />, link: "/calls" }, // Fixed icon
    { label: "Workflows", icon: <Book />, link: "/flows" },
    { label: "Recruiters", icon: <ClipboardCheck />, link: "/recruit" },
    { label: "Booking Pages", icon: <User />, link: "/pages" },
    { label: "Profile", icon: <User />, link: "/profile" },

  ];

  return (
    <>
      {/* Sidebar */}
      <div
        ref={sidebarRef}
        className={`bg-gray-200 text-gray-700 min-h-screen fixed top-0 left-0 transition-all duration-300 shadow-lg z-50
          ${isSidebarOpen ? "w-64" : "w-16"}
          ${isMobile ? "h-full z-[101]" : "z-50"}
        `}
      >
        {/* Sidebar Header */}
        <div className="py-4 px-6 flex justify-between items-center mt-16">
          <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
            {/* {isSidebarOpen ? <ChevronLeft /> : <ChevronRight />} */}
          </button>
        </div>

        <nav className="">
          <ul>
            {menuItems.map((item) => {
              const isActive = location.pathname === item.link;
              return (
                <li key={item.label} className="py-1 px-2">
                  <Link
                    to={item.link}
                    className={`flex items-center py-2 px-2 transition duration-200
                      ${isActive ? "bg-gray-300 text-gray-900 border-l-4 border-red-950" : "hover:bg-gray-200 hover:text-gray-900"}
                    `}
                  >
                    <span className="w-6 h-6">{item.icon}</span>
                    {isSidebarOpen && <span className="ml-2">{item.label}</span>}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>

      {/* Overlay for mobile */}
      {isSidebarOpen && isMobile && (
        <div
          className="fixed inset-0 bg-black opacity-50 z-[100]"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}
    </>
  );
};

export default Sidebar;
