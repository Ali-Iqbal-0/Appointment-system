import { useState, useEffect, useRef } from "react";
import {
  Bell, // Kept if you plan to add notifications back later
  Home,
  LogOut,
  Search,
  User,
  X,
  // User2, // Replaced by UserCircle for profile icon
  SettingsIcon, // You had this, good for settings link
  // User2Icon, // This was for the bell button, replacing with profile icon
  UserCircle2, // Better for profile avatar
  CreditCard, // For Subscription/Manage
  Users, // For IT Specialists or Community
  Briefcase, // For Workspaces
  Archive, // For Resources
  Presentation, // For Webinars (Lucide: MonitorPlay)
  Newspaper, // For What's New
  BookOpen, // For Help Guide
  Code2, // For Developer API
  Trash2, // For Delete My Account
  HelpCircle, // For bottom Help button
  BookUser, // For bottom User Guide button
  Crown, // For Premium Trial Badge
  MonitorPlay, // Lucide version for Webinars
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast,Bounce } from "react-toastify";

const Navbar = () => {
  // const [isProfileOpen, setProfileOpen] = useState(false); // Old state, replaced by isPanelOpen
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false); // For the new Profile/Settings Panel

  const panelRef = useRef(null); // Ref for the new panel
  const searchInputRef = useRef(null);
  const profileButtonRef = useRef(null); // Ref for the button that opens the panel

  const navigate = useNavigate();

  // Hardcoded data for the panel based on your screenshot
  const userData = {
    name: "Ali Iqbal",
    email: "fairchanceforcrm124@outlook.com",
    timezone: "Asia/Karachi",
    avatarUrl: "", // Placeholder for actual avatar image URL
    subscription: {
      type: "Premium Trial",
      itSpecialists: { current: 2, max: 10 },
      workspaces: { current: 1, max: 3 },
      resources: { current: 0, max: 10 },
    },
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      // Close panel if click is outside of it AND not on the button that opens it
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsPanelOpen(false);
      }
      // Close search if click is outside
      if (
        isSearchOpen &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        event.target !== document.querySelector(".search-icon-button") // Ensure not clicking the search toggle
      ) {
        setSearchOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen, isPanelOpen]); // Added isPanelOpen dependency

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsPanelOpen(false); // Close panel on logout
    navigate("/login");
  };

  const toggleSearch = () => {
    setSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus(); // Added optional chaining
      }, 100);
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };

  return (
    <>
      <nav className="shadow-md z-[999] fixed w-full p-4 bg-blue-950 flex items-center justify-between">
        <div className="text-xl font-bold text-white">
          <Link to="/">FairForse Bookings</Link>
        </div>

        <div
          className={`absolute md:left-3/4 lg:left-3/4 left-1/2 transform -translate-x-1/2 transition-all duration-300 ease-in-out ${
            isSearchOpen ? "w-1/3 md:w-1/5 p-2" : "w-0 overflow-hidden p-0"
          }`}
        >
          <input
            type="text"
            ref={searchInputRef}
            placeholder="Search..."
            className="w-full p-2 rounded-[46px] bg-white text-gray-800 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-4">
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200 search-icon-button"
            onClick={toggleSearch}
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <Link
            to={"/settings"} // Assuming settings page route
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5 text-gray-700" />
          </Link>

          {/* Profile Button that opens the panel */}
          <button
            ref={profileButtonRef}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={togglePanel}
            title="Profile & Settings"
          >
            {/* Using UserCircle2 for a filled avatar-like icon */}
            <UserCircle2 className="w-6 h-6 text-gray-700" />
          </button>
        </div>
      </nav>

      {/* Profile & Settings Panel */}
      <div
        ref={panelRef}
        className={`fixed top-0 right-0 z-[1000] w-full max-w-sm h-full bg-white shadow-2xl border-l border-gray-200 p-0 transition-transform duration-300 ease-in-out flex flex-col
          ${isPanelOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        {/* Panel Header - Trial Info & Close Button */}
        <div className="bg-indigo-700 text-white text-center py-3 text-sm relative">
          Your trial ends in 14 days
          <button
            onClick={togglePanel}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-indigo-200 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Content Area */}
        <div className="flex-grow overflow-y-auto p-5">
          {/* User Info Section */}
          <div className="text-center mb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3 border-2 border-indigo-400">
              {/* Placeholder for avatar image or initials */}
              {userData.avatarUrl ? (
                <img
                  src={userData.avatarUrl}
                  alt={userData.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <User className="w-12 h-12 text-gray-400" /> // Generic user icon
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {userData.name}
            </h2>
            <p className="text-sm text-gray-500">{userData.email}</p>
            <p className="text-xs text-gray-400 mt-1">{userData.timezone}</p>
            <Link
              to="/org-details"
              onClick={togglePanel}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2 inline-block"
            >
              View Org Details
            </Link>
          </div>

          {/* My Account / Sign Out Buttons */}
          <div className="flex border border-gray-200 rounded-lg mb-8">
            <Link
              to="/my-account"
              onClick={togglePanel}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-l-lg"
            >
              <User className="w-4 h-4" /> My Account
            </Link>
            <button
              onClick={handleLogout}
              className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-red-600 hover:bg-red-50 border-l border-gray-200 rounded-r-lg"
            >
              <LogOut className="w-4 h-4" /> Sign Out{" "}
              {/* Using Lucide's LogOut */}
            </button>
          </div>

          {/* Subscription Section */}
          <div className="mb-8 p-4 border border-gray-200 rounded-lg relative">
            <div className="absolute top-4 left-0 w-1 h-6 bg-indigo-600 rounded-r-full"></div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold text-gray-800 pl-3">
                Subscription
              </h3>
              <Link
                to="/manage-subscription"
                onClick={togglePanel}
                className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
              >
                Manage
              </Link>
            </div>
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-md inline-flex items-center gap-1 mb-4">
              <Crown className="w-3 h-3" /> {userData.subscription.type}
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2">
                <Users className="w-4 h-4 text-gray-500" /> IT Specialists -{" "}
                {userData.subscription.itSpecialists.current}/
                {userData.subscription.itSpecialists.max}
              </li>
              <li className="flex items-center gap-2">
                <Briefcase className="w-4 h-4 text-gray-500" /> Workspaces -{" "}
                {userData.subscription.workspaces.current}/
                {userData.subscription.workspaces.max}
              </li>
              <li className="flex items-center gap-2">
                <Archive className="w-4 h-4 text-gray-500" /> Resources -{" "}
                {userData.subscription.resources.current}/
                {userData.subscription.resources.max}
              </li>
            </ul>
          </div>

          {/* Need Help Section */}
          <div className="mb-8 p-4 border border-gray-200 rounded-lg relative">
            <div className="absolute top-4 left-0 w-1 h-6 bg-indigo-600 rounded-r-full"></div>
            <h3 className="text-md font-semibold text-gray-800 mb-4 pl-3">
              Need Help?
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Link
                to="/webinars"
                onClick={togglePanel}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
              >
                <MonitorPlay className="w-5 h-5 text-gray-500" /> Webinars
              </Link>
              <Link
                to="/whats-new"
                onClick={togglePanel}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
              >
                <Newspaper className="w-5 h-5 text-gray-500" /> What's New?
              </Link>
              <Link
                to="/help-guide"
                onClick={togglePanel}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
              >
                <BookOpen className="w-5 h-5 text-gray-500" /> Help Guide
              </Link>
              <Link
                to="/community"
                onClick={togglePanel}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
              >
                <Users className="w-5 h-5 text-gray-500" /> Community
              </Link>
              <Link
                to="/developer-api"
                onClick={togglePanel}
                className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"
              >
                <Code2 className="w-5 h-5 text-gray-500" /> Developer API
              </Link>
            </div>
          </div>

          {/* Delete Account (outside the bordered box, but still within scrollable area) */}
          <button
            onClick={() => {
              /* Implement delete account logic */ toast.warn(
                "Delete account clicked!",
                {
                  position: "top-right",
                  autoClose: 5000,
                  hideProgressBar: false,
                  closeOnClick: false,
                  pauseOnHover: true,
                  draggable: true,
                  progress: undefined,
                  theme: "light",
                  transition: Bounce,
                }
              );
              togglePanel();
            }}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-800 py-3"
          >
            <Trash2 className="w-4 h-4" /> Delete My Account
          </button>
        </div>

        {/* Panel Footer - Help & User Guide */}
        <div className="border-t border-gray-200 p-4 flex items-center justify-around text-xs">
          <Link
            to="/help"
            onClick={togglePanel}
            className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium"
          >
            <HelpCircle className="w-4 h-4" /> Help
          </Link>
          <Link
            to="/user-guide"
            onClick={togglePanel}
            className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium"
          >
            <BookUser className="w-4 h-4" /> User Guide
          </Link>
          {/* You can add a third item here if needed, like the icon in your screenshot that I couldn't clearly identify */}
        </div>
      </div>
    </>
  );
};

export default Navbar;
