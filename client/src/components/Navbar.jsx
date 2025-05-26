import { useState, useEffect, useRef } from "react";
import {
  Bell,
  Home,
  LogOut,
  Search,
  User,
  X,
  SettingsIcon,
  UserCircle2,
  CreditCard,
  Users,
  Briefcase,
  Archive,
  Presentation,
  Newspaper,
  BookOpen,
  Code2,
  Trash2,
  HelpCircle,
  BookUser,
  Crown,
  MonitorPlay,
  CalendarDays,
  Clock,
  Building,
  Phone,
  UserCog,
  Workflow,
  Plus,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { toast, Bounce } from "react-toastify";
import { BASE_URL } from "../BaseUrl"; // Assuming BaseUrl.js is in the parent directory
import { Calendar } from "lucide-react";
const Navbar = () => {
  const [isSearchOpen, setSearchOpen] = useState(false);
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isAddMenuOpen, setAddMenuOpen] = useState(false);

  const panelRef = useRef(null);
  const searchInputRef = useRef(null);
  const profileButtonRef = useRef(null);
  const addMenuRef = useRef(null);
  
  const navigate = useNavigate();

  // State for Super Admin's dynamic data
  const [superAdminDisplay, setSuperAdminDisplay] = useState({
    name: "Loading...",
    email: "Fetching data...",
  });
  const [isLoadingPanelData, setIsLoadingPanelData] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [panelDataError, setPanelDataError] = useState(null); // Kept for future use if needed

  // Static part of the panel data (timezone, subscription details)
  const staticPanelData = {
    timezone: "Asia/Karachi", // This could also be fetched if available on user model
    avatarUrl: "", // Placeholder for actual avatar image URL
    subscription: {
      type: "Premium Trial",
      itSpecialists: { current: 2, max: 10 },
      workspaces: { current: 1, max: 3 },
      resources: { current: 0, max: 10 },
    },
  };

  const addMenuItems = [
    { name: "Appointment", icon: <CalendarDays className="w-5 h-5" />, color: "text-orange-500", bgColor: "bg-orange-100" },
    { name: "Unavailability", icon: <Clock className="w-5 h-5" />, color: "text-blue-500", bgColor: "bg-blue-100" },
    { name: "Special Working Hours", icon: <Clock className="w-5 h-5" />, color: "text-purple-500", bgColor: "bg-purple-100" },
    { name: "Workspace", icon: <Building className="w-5 h-5" />, color: "text-green-500", bgColor: "bg-green-100" },
    { name: "Call", icon: <Phone className="w-5 h-5" />, color: "text-pink-500", bgColor: "bg-pink-100" },
    { name: "Recruiter", icon: <UserCog className="w-5 h-5" />, color: "text-teal-500", bgColor: "bg-teal-100" },
    { name: "Customer", icon: <Users className="w-5 h-5" />, color: "text-red-500", bgColor: "bg-red-100" },
    { name: "Workflow", icon: <Workflow className="w-5 h-5" />, color: "text-indigo-500", bgColor: "bg-indigo-100" },
  ];
  
  // Fetch Super Admin data on component mount
  useEffect(() => {
    const fetchSuperAdmin = async () => {
      setIsLoadingPanelData(true);
      setPanelDataError(null);
      try {
        const response = await fetch(`${BASE_URL}/api/users/getUsers`); 
        if (!response.ok) {
          const errorData = await response.json().catch(() => ({})); // Try to parse error, default to empty object
          throw new Error(errorData.message || `Failed to fetch users. Status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success && result.data) {
          const admin = result.data.find(user => user.role === 'Super Admin');
          if (admin) {
            setSuperAdminDisplay({
              name: admin.name,
              email: admin.email,
            });
          } else {
            setPanelDataError('Super Admin user not found.');
            setSuperAdminDisplay({ name: "Super Admin", email: "Not configured" }); // Fallback
          }
        } else {
          throw new Error(result.message || 'Failed to process user data');
        }
      } catch (error) {
        console.error("Error fetching Super Admin data:", error);
        setPanelDataError(error.message);
        setSuperAdminDisplay({ name: "Error", email: "Could not load data" }); // Error fallback
      } finally {
        setIsLoadingPanelData(false);
      }
    };

    fetchSuperAdmin();
  }, []); // Empty dependency array to run once on mount

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsPanelOpen(false);
      }
      if (
        isSearchOpen &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        !event.target.closest(".search-icon-button") // Check closest for SVG clicks
      ) {
        setSearchOpen(false);
      }
       if (addMenuRef.current && !addMenuRef.current.contains(event.target) && !event.target.closest(".add-menu-button")) { // Check closest for SVG clicks
        setAddMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isSearchOpen, isPanelOpen, isAddMenuOpen]);


  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsPanelOpen(false);
    navigate("/login");
  };

  const toggleSearch = () => {
    setSearchOpen(!isSearchOpen);
    if (!isSearchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 100);
    }
  };

  const togglePanel = () => {
    setIsPanelOpen(!isPanelOpen);
  };
  const getInitials = (name) => {
    if (isLoadingPanelData || !name || name === "Loading..." || name === "Error") return "?";
    const names = name.split(' ');
    if (names.length === 1) return names[0].charAt(0).toUpperCase();
    return (names[0].charAt(0) + (names.length > 1 ? names[names.length - 1].charAt(0) : '')).toUpperCase();
  };


  return (
    <>
      <nav className="shadow-md z-[999] fixed w-full p-4 bg-blue-950 flex items-center justify-between">
        <div className="text-xl font-bold text-white">
          <Link to="/">Fairforse Bookings</Link>
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
            title="Search"
          >
            <Search className="w-5 h-5 text-gray-700" />
          </button>
          <div className="relative" ref={addMenuRef}>
          <button
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={() => setAddMenuOpen(!isAddMenuOpen)}
          >
            <Plus />
          </button>

          {isAddMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg py-2 z-10">
              <div className="px-4 py-2 text-gray-600 text-sm font-semibold">Add New</div>
              {addMenuItems.map((item, index) => (
                <div
                  key={index}
                  className="flex items-center px-4 py-2 hover:bg-gray-100 cursor-pointer"
                  onClick={() => {
                    console.log(`Clicked on ${item.name}`);
                    setAddMenuOpen(false);
                  }}
                >
                  <div className={`p-2 rounded-full ${item.bgColor} mr-3`}>
                    {item.icon}
                  </div>
                  <span className="text-gray-800">{item.name}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        <Link to={'/calender'} className="p-2 rounded-full bg-gray-100 hover:bg-gray-200" >
          <Calendar/>
        </Link>
          <Link
            to={"/settings"}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            title="Settings"
          >
            <SettingsIcon className="w-5 h-5 text-gray-700" />
          </Link>

          <button
            ref={profileButtonRef}
            className="p-2 rounded-full bg-gray-100 hover:bg-gray-200"
            onClick={togglePanel}
            title="Profile & Settings"
          >
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
        <div className="bg-indigo-700 text-white text-center py-3 text-sm relative">
          Your trial ends in 14 days
          <button
            onClick={togglePanel}
            className="absolute top-1/2 right-4 transform -translate-y-1/2 text-indigo-200 hover:text-white"
            aria-label="Close panel"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-grow overflow-y-auto p-5">
          <div className="text-center mb-6">
            <div className="mx-auto w-24 h-24 rounded-full bg-gray-200 flex items-center justify-center mb-3 border-2 border-indigo-400 text-3xl font-semibold text-indigo-600">
              {isLoadingPanelData ? (
                 <div className="animate-pulse w-12 h-12 bg-gray-300 rounded-full"></div>
              ) : staticPanelData.avatarUrl ? (
                <img src={staticPanelData.avatarUrl} alt={superAdminDisplay.name} className="w-full h-full rounded-full object-cover"/>
              ) : (
                getInitials(superAdminDisplay.name)
              )}
            </div>
            <h2 className="text-xl font-semibold text-gray-800">
              {isLoadingPanelData ? <div className="h-6 bg-gray-300 rounded w-3/4 mx-auto animate-pulse"></div> : superAdminDisplay.name}
            </h2>
            <p className="text-sm text-gray-500">
              {isLoadingPanelData ? <div className="h-4 bg-gray-300 rounded w-1/2 mx-auto mt-1 animate-pulse"></div> : superAdminDisplay.email}
            </p>
            <p className="text-xs text-gray-400 mt-1">{staticPanelData.timezone}</p>
            <Link
              to="/org-details"
              onClick={togglePanel}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium mt-2 inline-block"
            >
              View Org Details
            </Link>
          </div>

          <div className="flex border border-gray-200 rounded-lg mb-8">
            <Link to="/my-account" onClick={togglePanel} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-l-lg">
              <User className="w-4 h-4" /> My Account
            </Link>
            <button onClick={handleLogout} className="flex-1 flex items-center justify-center gap-2 py-3 text-sm text-red-600 hover:bg-red-50 border-l border-gray-200 rounded-r-lg">
              <LogOut className="w-4 h-4" /> Sign Out
            </button>
          </div>

          <div className="mb-8 p-4 border border-gray-200 rounded-lg relative">
            <div className="absolute top-4 left-0 w-1 h-6 bg-indigo-600 rounded-r-full"></div>
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-md font-semibold text-gray-800 pl-3">Subscription</h3>
              <Link to="/manage-subscription" onClick={togglePanel} className="text-sm text-indigo-600 hover:text-indigo-800 font-medium">Manage</Link>
            </div>
            <div className="bg-yellow-100 border border-yellow-300 text-yellow-700 text-xs font-semibold px-3 py-1.5 rounded-md inline-flex items-center gap-1 mb-4">
              <Crown className="w-3 h-3" /> {staticPanelData.subscription.type}
            </div>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-center gap-2"><Users className="w-4 h-4 text-gray-500" /> IT Specialists - {staticPanelData.subscription.itSpecialists.current}/{staticPanelData.subscription.itSpecialists.max}</li>
              <li className="flex items-center gap-2"><Briefcase className="w-4 h-4 text-gray-500" /> Workspaces - {staticPanelData.subscription.workspaces.current}/{staticPanelData.subscription.workspaces.max}</li>
              <li className="flex items-center gap-2"><Archive className="w-4 h-4 text-gray-500" /> Resources - {staticPanelData.subscription.resources.current}/{staticPanelData.subscription.resources.max}</li>
            </ul>
          </div>

          <div className="mb-8 p-4 border border-gray-200 rounded-lg relative">
            <div className="absolute top-4 left-0 w-1 h-6 bg-indigo-600 rounded-r-full"></div>
            <h3 className="text-md font-semibold text-gray-800 mb-4 pl-3">Need Help?</h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-3 text-sm">
              <Link to="/webinars" onClick={togglePanel} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"><MonitorPlay className="w-5 h-5 text-gray-500" /> Webinars</Link>
              <Link to="/whats-new" onClick={togglePanel} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"><Newspaper className="w-5 h-5 text-gray-500" /> What's New?</Link>
              <Link to="/help-guide" onClick={togglePanel} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"><BookOpen className="w-5 h-5 text-gray-500" /> Help Guide</Link>
              <Link to="/community" onClick={togglePanel} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"><Users className="w-5 h-5 text-gray-500" /> Community</Link>
              <Link to="/developer-api" onClick={togglePanel} className="flex items-center gap-2 text-gray-700 hover:text-indigo-600"><Code2 className="w-5 h-5 text-gray-500" /> Developer API</Link>
            </div>
          </div>

          <button onClick={() => { toast.warn("Delete account clicked!",{ position: "top-right", autoClose: 3000, hideProgressBar: false, closeOnClick: true, pauseOnHover: true, draggable: true, theme: "light", transition: Bounce, }); togglePanel();}}
            className="w-full flex items-center justify-center gap-2 text-sm text-red-600 hover:text-red-800 py-3"
          >
            <Trash2 className="w-4 h-4" /> Delete My Account
          </button>
        </div>

        <div className="border-t border-gray-200 p-4 flex items-center justify-around text-xs">
          <Link to="/help" onClick={togglePanel} className="flex items-center gap-1.5 text-indigo-600 hover:text-indigo-800 font-medium"><HelpCircle className="w-4 h-4" /> Help</Link>
          <Link to="/user-guide" onClick={togglePanel} className="flex items-center gap-1.5 text-gray-600 hover:text-gray-800 font-medium"><BookUser className="w-4 h-4" /> User Guide</Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;