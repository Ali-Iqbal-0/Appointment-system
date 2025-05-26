import React, { useState, useEffect, useCallback, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import {
  Users,
  LayoutGrid,
  Cable,
  Palette,
  DatabaseZap,
  ArrowLeft,
  Search,
  ChevronRight,
  X,
  Edit,
  CheckCircle2,
  Video,
  Info,
  Clock,
  Globe,
  KeyRound,
  Package,
  MapPin,
  Users2,
  BarChart3,
  Plus as PlusIcon,
  UserCircle2 as UserIconPlaceholder,
  MoreVertical,
  Edit3,
  ToggleLeft,
  ToggleRight,
  Trash2,
} from "lucide-react"; // Added MoreVertical, Edit3, ToggleLeft, ToggleRight, Trash2
import { motion, AnimatePresence } from "framer-motion";
import Swal from "sweetalert2"; // Import SweetAlert2
import { BASE_URL } from "../BaseUrl";

const USER_API_BASE_URL = `${BASE_URL}/api/users`;
const CUSTOMER_API_BASE_URL = `${BASE_URL}/api/customers`;

// --- InputField (Simplified for the Edit Panel) ---
const PanelInputField = ({
  label,
  name,
  value,
  onChange,
  as = "input",
  children,
  disabled = false,
  required = false,
}) => {
  const commonClasses =
    "w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-purple-500 focus:border-purple-500 text-xs disabled:bg-gray-100 disabled:cursor-not-allowed";
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-xs font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {as === "select" ? (
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={commonClasses}
        >
          {children}
        </select>
      ) : (
        <input
          type="text"
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          disabled={disabled}
          className={commonClasses}
        />
      )}
    </div>
  );
};

// --- Recruiters View (IT Specialists) ---
const RecruitersView = () => {
  const [specialists, setSpecialists] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // State for Edit Panel
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);
  const [editingSpecialist, setEditingSpecialist] = useState(null);
  const [editFormData, setEditFormData] = useState({ role: "", workspace: "" }); // Added workspace

  // State for dropdown menu
  const [activeDropdown, setActiveDropdown] = useState(null); // Stores ID of specialist whose dropdown is open
  const dropdownRef = useRef(null);

  const fetchSpecialists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${USER_API_BASE_URL}/getUsers`);
      if (!response.ok) {
        const d = await response.json().catch(() => ({}));
        throw new Error(d.message || `E: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) setSpecialists(result.data);
      else setError(result.message || "Failed to fetch specialists.");
    } catch (err) {
      console.error("E fetch:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  // Close dropdown if clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setActiveDropdown(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleEdit = (specialist) => {
    setEditingSpecialist(specialist);
    setEditFormData({
      role: specialist.role || "Staff",
      workspace: specialist.workspace || "", // Initialize workspace
    });
    setIsEditPanelOpen(true);
    setActiveDropdown(null);
  };

  const handleEditFormChange = (e) => {
    const { name, value } = e.target;
    setEditFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdateSpecialist = async (e) => {
    e.preventDefault();
    if (!editingSpecialist) return;

    const payload = {
      role: editFormData.role,
      workspace: editFormData.workspace, // Include workspace in payload
    };
    // Super Admins cannot have their role changed from the UI
    if (
      editingSpecialist.role === "Super Admin" &&
      payload.role !== "Super Admin"
    ) {
      Swal.fire("Error", "Super Admin role cannot be changed.", "error");
      return;
    }

    try {
      const response = await fetch(
        `${USER_API_BASE_URL}/update/${editingSpecialist._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update specialist.");
      }
      Swal.fire("Success", "Specialist updated successfully!", "success");
      setIsEditPanelOpen(false);
      setEditingSpecialist(null);
      fetchSpecialists(); // Refresh list
    } catch (err) {
      console.error("Update error:", err);
      Swal.fire("Error", err.message, "error");
    }
  };

  const toggleStatus = async (specialist) => {
    setActiveDropdown(null);
    if (specialist.role === "Super Admin") {
      Swal.fire(
        "Action Denied",
        "Super Admin status cannot be changed.",
        "warning"
      );
      return;
    }
    const newStatus = specialist.status === "Active" ? "Inactive" : "Active";
    try {
      const response = await fetch(
        `${USER_API_BASE_URL}/update/${specialist._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ status: newStatus }),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to update status.");
      Swal.fire("Success", `Specialist marked as ${newStatus}.`, "success");
      fetchSpecialists();
    } catch (err) {
      console.error("Status toggle error:", err);
      Swal.fire("Error", err.message, "error");
    }
  };

  const handleDelete = (specialist) => {
    setActiveDropdown(null);
    if (specialist.role === "Super Admin") {
      Swal.fire("Action Denied", "Super Admins cannot be deleted.", "warning");
      return;
    }
    Swal.fire({
      title: "Are you sure?",
      text: `Delete ${specialist.name}? This cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      confirmButtonText: "Yes, delete it!",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const response = await fetch(
            `${USER_API_BASE_URL}/${specialist._id}`,
            { method: "DELETE" }
          ); // Corrected endpoint
          const resData = await response.json();
          if (!response.ok || !resData.success)
            throw new Error(resData.message || "Failed to delete.");
          Swal.fire(
            "Deleted!",
            `${specialist.name} has been deleted.`,
            "success"
          );
          fetchSpecialists();
        } catch (err) {
          Swal.fire("Error!", err.message || "Could not delete.", "error");
        }
      }
    });
  };

  const filteredSpecialists = specialists.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  const getInitialsForWorkspace = (name) => {
    if (!name) return "";
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 pb-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-xs shadow-sm"
            />
          </div>
          <motion.button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3.5 rounded-md flex items-center text-xs shadow-sm whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon size={16} className="mr-1.5" /> New IT Specialist
          </motion.button>
        </div>
      </div>
      {isLoading && (
        <div className="text-center py-6">
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-3 rounded-md text-red-700 mb-4 text-xs">
          <p>Error: {error}</p>
        </div>
      )}
      {!isLoading && !error && (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200/70 text-xs">
            <thead className="bg-gray-50/80">
              <tr>
                <th className="px-5 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider">
                  User
                </th>
                <th className="px-5 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-5 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Assigned Workspaces
                </th>
                <th className="px-5 py-2.5 text-left font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="relative px-5 py-2.5">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200/70">
              {filteredSpecialists.length > 0 ? (
                filteredSpecialists.map((specialist) => (
                  <tr
                    key={specialist._id}
                    className="hover:bg-gray-50/50 group transition-colors relative"
                  >
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-8 w-8">
                          <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                            <UserIconPlaceholder size={18} />
                          </div>
                        </div>
                        <div className="ml-3">
                          <div className="font-medium text-gray-900">
                            {specialist.name}
                          </div>
                          <div className="text-gray-500">
                            {specialist.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-gray-500">
                      {specialist.role}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      {specialist.workspace ? (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-full font-medium bg-red-100 text-red-700">
                          <span className="font-semibold mr-1">
                            {getInitialsForWorkspace(specialist.workspace)}
                          </span>
                          {specialist.workspace.split(" ").slice(1).join(" ")}
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-full font-medium ${
                          specialist.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-yellow-100 text-yellow-700"
                        }`}
                      >
                        <span
                          className={`h-1.5 w-1.5 rounded-full mr-1.5 ${
                            specialist.status === "Active"
                              ? "bg-green-500"
                              : "bg-yellow-500"
                          }`}
                        ></span>
                        {specialist.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                      <div className="relative inline-block text-left">
                        <button
                          onClick={() =>
                            setActiveDropdown(
                              activeDropdown === specialist._id
                                ? null
                                : specialist._id
                            )
                          }
                          className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-gray-200 text-gray-500 focus:outline-none transition-opacity"
                        >
                          <MoreVertical size={16} />
                        </button>
                        {activeDropdown === specialist._id && (
                          <div
                            ref={dropdownRef}
                            className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-20"
                          >
                            <div
                              className="py-1"
                              role="menu"
                              aria-orientation="vertical"
                              aria-labelledby="options-menu"
                            >
                              <button
                                onClick={() => handleEdit(specialist)}
                                className="w-full text-left flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                role="menuitem"
                              >
                                <Edit3 size={14} className="mr-2" /> Edit
                              </button>
                              {specialist.role !== "Super Admin" && (
                                <>
                                  <button
                                    onClick={() => toggleStatus(specialist)}
                                    className="w-full text-left flex items-center px-4 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                    role="menuitem"
                                  >
                                    {specialist.status === "Active" ? (
                                      <ToggleLeft
                                        size={14}
                                        className="mr-2 text-red-500"
                                      />
                                    ) : (
                                      <ToggleRight
                                        size={14}
                                        className="mr-2 text-green-500"
                                      />
                                    )}{" "}
                                    Mark As{" "}
                                    {specialist.status === "Active"
                                      ? "Inactive"
                                      : "Active"}
                                  </button>
                                  <button
                                    onClick={() => handleDelete(specialist)}
                                    className="w-full text-left flex items-center px-4 py-2 text-xs text-red-500 hover:bg-red-50 hover:text-red-700"
                                    role="menuitem"
                                  >
                                    <Trash2 size={14} className="mr-2" /> Delete
                                  </button>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-gray-500"
                  >
                    No IT specialists found
                    {searchTerm ? " matching your search." : "."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* Edit Specialist Panel */}
      <AnimatePresence>
        {isEditPanelOpen && editingSpecialist && (
          <motion.div
            className="fixed inset-0 bg-black bg-opacity-50 z-40"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setIsEditPanelOpen(false)} // Close on backdrop click
          />
        )}
        {isEditPanelOpen && editingSpecialist && (
          <motion.div
            className="fixed top-0 right-0 h-full w-full max-w-sm bg-white shadow-xl z-50 flex flex-col"
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          >
            <div className="flex justify-between items-center p-4 border-b border-gray-200">
              <h3 className="text-md font-semibold text-gray-800">
                Edit IT Specialist
              </h3>
              <button
                onClick={() => setIsEditPanelOpen(false)}
                className="p-1 rounded-full hover:bg-gray-100 text-gray-500"
              >
                <X size={20} />
              </button>
            </div>
            <form
              onSubmit={handleUpdateSpecialist}
              className="flex-grow p-4 space-y-4 overflow-y-auto"
            >
              <div className="flex flex-col items-center mb-4">
                <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 text-2xl mb-2">
                  <UserIconPlaceholder size={40} />
                </div>
                <p className="text-sm font-medium text-gray-700">
                  {editingSpecialist.name}
                </p>
                <p className="text-xs text-gray-500">
                  {editingSpecialist.email}
                </p>
              </div>

              <PanelInputField
                label="Role"
                name="role"
                as="select"
                value={editFormData.role}
                onChange={handleEditFormChange}
                disabled={editingSpecialist.role === "Super Admin"}
              >
                <option value="Staff">Staff</option>
                <option value="Admin">Admin</option>
                {/* Only show Super Admin if current role is Super Admin, to prevent accidental assignment to it, unless specifically designed */}
                {editingSpecialist.role === "Super Admin" && (
                  <option value="Super Admin">Super Admin</option>
                )}
                {/* Add other roles like Manager if needed from your screenshot */}
                <option value="Manager">Manager</option>
                <option value="Workspace Admin">Workspace Admin</option>
              </PanelInputField>

              {/* Workspace field - using a simple text input for existing 'workspace' string. 
                        Replace with a proper multi-select component if you have a Workspace model and API */}
              <PanelInputField
                label="Workspaces Assigned"
                name="workspace"
                value={editFormData.workspace}
                onChange={handleEditFormChange}
                placeholder="e.g., Tech, Sales (comma-separated)"
              />
              <p className="text-xs text-gray-500 mt-1">
                For multiple, separate by comma. This is a placeholder for a
                proper multi-select component based on available workspaces.
              </p>

              {/* Placeholder for "1 workspace selected" type of UI if you had a real multi-select */}
            </form>
            <div className="p-4 border-t border-gray-200 flex justify-end space-x-2">
              <motion.button
                type="button"
                onClick={() => setIsEditPanelOpen(false)}
                className="px-4 py-2 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Cancel
              </motion.button>
              <motion.button
                type="submit"
                form="edit-specialist-form"
                onClick={handleUpdateSpecialist}
                className="px-4 py-2 text-xs font-medium text-white bg-purple-600 hover:bg-purple-700 rounded-md"
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
              >
                Save
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

// --- Customers View ---
const CustomersView = () => {
  /* ... same as before ... */ const [customers, setCustomers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchCustomers = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${CUSTOMER_API_BASE_URL}/get`);
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(
          errData.message || `HTTP error! status: ${response.status}`
        );
      }
      const result = await response.json();
      if (result.success) {
        setCustomers(result.data);
      } else {
        setError(result.message || "Failed to fetch customers.");
      }
    } catch (err) {
      console.error("Error fetching customers:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);
  useEffect(() => {
    fetchCustomers();
  }, [fetchCustomers]);
  const filteredCustomers = customers.filter(
    (c) =>
      (c.customerName &&
        c.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (c.emailAddress &&
        c.emailAddress.toLowerCase().includes(searchTerm.toLowerCase()))
  );
  return (
    <>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-5 pb-3">
        <div className="flex items-center space-x-3 w-full sm:w-auto justify-end">
          <div className="relative flex-grow sm:flex-grow-0">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full sm:w-56 pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:ring-purple-500 focus:border-purple-500 text-xs shadow-sm"
            />
          </div>
          <motion.button
            className="bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 px-3.5 rounded-md flex items-center text-xs shadow-sm whitespace-nowrap"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PlusIcon size={16} className="mr-1.5" /> New Customer
          </motion.button>
        </div>
      </div>
      {isLoading && (
        <div className="text-center py-10">
          <p className="text-gray-500 text-sm">Loading customers...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-50 p-4 rounded-md text-red-700 mb-4 text-xs">
          <p>Error: {error}</p>
        </div>
      )}
      {!isLoading &&
        !error &&
        (filteredCustomers.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {filteredCustomers.map((customer) => (
              <motion.div
                key={customer._id}
                className="bg-white p-4 rounded-lg border border-gray-200/80 shadow-md hover:shadow-lg transition-shadow duration-200"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
              >
                <div className="flex items-center mb-3">
                  <div className="w-9 h-9 rounded-full bg-gray-200 flex items-center justify-center text-gray-500 mr-3">
                    <UserIconPlaceholder size={20} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-800">
                      {customer.customerName}
                    </h3>
                    <p className="text-xs text-gray-500">
                      {customer.emailAddress}
                    </p>
                  </div>
                </div>
                <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
                  <span className="px-2 py-0.5 text-xs font-medium text-gray-600 bg-gray-100 rounded-full">
                    Guest
                  </span>
                  <motion.button
                    className="text-purple-600 hover:text-purple-700 font-medium text-xs py-1 px-2.5 rounded-md border border-purple-200 hover:bg-purple-50 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Schedule
                  </motion.button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10">
            <p className="text-gray-500 text-sm">
              No customers found{searchTerm ? " matching your search." : "."}
            </p>
          </div>
        ))}
    </>
  );
};

// --- Other Components (Modal, BusinessHoursCard, ALL_SIDEBAR_ITEMS, SidebarNavItem) remain the same ---
const Modal = ({ isOpen, onClose, children, title }) => {
  /* ... same ... */ return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          onClick={onClose}
        >
          <motion.div
            className="bg-white p-6 rounded-xl shadow-2xl max-w-lg w-full mx-4 relative"
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: 50, opacity: 0 }}
            transition={{
              type: "spring",
              stiffness: 300,
              damping: 30,
              duration: 0.3,
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-5">
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <motion.button
                onClick={onClose}
                className="text-gray-500 hover:text-purple-600 p-1 rounded-full hover:bg-gray-100"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.9 }}
              >
                <X size={20} />
              </motion.button>
            </div>
            <div className="text-sm text-gray-700">{children}</div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};
const BusinessHoursCard = ({
  title,
  description,
  buttonText,
  onButtonClick,
  children,
}) => {
  /* ... same ... */ const [isAccordionOpen, setIsAccordionOpen] =
    useState(false);
  return (
    <motion.div
      className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 mt-3 first:mt-0"
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className="flex justify-between items-center cursor-pointer group"
        onClick={() => setIsAccordionOpen(!isAccordionOpen)}
      >
        <div className="flex items-center">
          <motion.div
            animate={{ rotate: isAccordionOpen ? 90 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <ChevronRight
              size={18}
              className="text-gray-500 group-hover:text-purple-600 mr-2.5"
            />
          </motion.div>
          <div>
            <h3 className="text-md font-semibold text-gray-800 group-hover:text-purple-700">
              {title}
            </h3>
            <p className="text-xs text-gray-600">{description}</p>
          </div>
        </div>
        <motion.button
          onClick={(e) => {
            e.stopPropagation();
            onButtonClick();
          }}
          className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-xs"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          {buttonText}
        </motion.button>
      </div>
      <AnimatePresence>
        {isAccordionOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
            className="mt-3 pt-3 border-t border-gray-200 overflow-hidden text-sm text-gray-700"
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};
const ALL_SIDEBAR_ITEMS = [
  {
    name: "Organization",
    key: "organization",
    icon: <Users size={18} />,
    subItems: [
      { name: "Basic Information", key: "organization-basic-information" },
      { name: "Business Hours", key: "organization-business-hours" },
      { name: "Custom Domain", key: "organization-custom-domain" },
      { name: "IT Specialists", key: "organization-it-specialists" },
      {
        name: "Domain Authentication",
        key: "organization-domain-authentication",
      },
    ],
  },
  {
    name: "Modules",
    key: "modules",
    icon: <LayoutGrid size={18} />,
    subItems: [
      { name: "Workspaces", key: "modules-workspaces" },
      { name: "Customer Module", key: "modules-customer" },
      { name: "In-person Locations", key: "modules-in-person-locations" },
      { name: "Customers", key: "modules-customers" },
      { name: "Reports", key: "modules-reports" },
    ],
  },
  {
    name: "Integrations",
    key: "integrations",
    icon: <Cable size={18} />,
    subItems: [
      { name: "Most Popular", key: "most-popular" },
      { name: "Calendars", key: "integrations-calendars" },
      { name: "Video Conferencing", key: "integrations-video-conferencing" },
      { name: "CRM & Sales", key: "integrations-crm-sales" },
      { name: "Payments", key: "integrations-payments" },
      { name: "SMS", key: "sms-integrations" },
      { name: "Support", key: "integration-support" },
    ],
  },
  {
    name: "Product Customizations",
    key: "product-customizations",
    icon: <Palette size={18} />,
    subItems: [
      { name: "In Product Notifications", key: "in-product-notififcations" },
      { name: "Custom Labels", key: "customizations-labels" },
      { name: "Roles & Permissions", key: "roles-permissions" },
    ],
  },
  {
    name: "Data Administration",
    key: "data-administration",
    icon: <DatabaseZap size={18} />,
    subItems: [
      { name: "Privacy & Security", key: "data-privacy" },
      { name: "Exports", key: "data-exports" },
    ],
  },
];
const SidebarNavItem = React.memo(
  ({
    item,
    expandedMainTab,
    setExpandedMainTab,
    activeSubTab,
    onTabChange,
  }) => {
    /* ... same ... */ const isExpanded = expandedMainTab === item.key;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isCurrentActiveLeaf = !hasSubItems && activeSubTab === item.key;
    const isParentOfActiveChild =
      hasSubItems && item.subItems.some((sub) => sub.key === activeSubTab);
    const handleParentClick = useCallback(() => {
      setExpandedMainTab(isExpanded ? null : item.key);
      if (!hasSubItems) {
        onTabChange(item.key);
      }
    }, [isExpanded, item.key, hasSubItems, onTabChange, setExpandedMainTab]);
    const handleSubItemClick = useCallback(
      (e, subItemKey) => {
        e.stopPropagation();
        onTabChange(subItemKey);
      },
      [onTabChange]
    );
    return (
      <motion.li layout>
        <div
          className={`flex items-center justify-between p-2.5 rounded-lg cursor-pointer transition-colors duration-150 group ${
            isCurrentActiveLeaf
              ? "bg-purple-100 text-purple-700 font-medium"
              : isParentOfActiveChild
              ? "text-purple-600 font-medium"
              : "text-gray-700 hover:bg-gray-100"
          } text-sm`}
          onClick={handleParentClick}
        >
          {item.icon && (
            <span className="mr-2.5 flex-shrink-0">
              {React.cloneElement(item.icon, {
                className:
                  isCurrentActiveLeaf || isParentOfActiveChild
                    ? "text-purple-600"
                    : "text-gray-500 group-hover:text-purple-600",
              })}
            </span>
          )}
          <span>{item.name}</span>
          {hasSubItems && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight
                size={16}
                className={
                  isExpanded || isParentOfActiveChild
                    ? "text-purple-500"
                    : "text-gray-500"
                }
              />
            </motion.div>
          )}
        </div>
        <AnimatePresence>
          {hasSubItems && isExpanded && (
            <motion.ul
              className="pl-7 mt-1 space-y-0.5 overflow-hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {item.subItems.map((subItem, index) => (
                <motion.li
                  key={subItem.key}
                  className={`block p-1.5 rounded-md cursor-pointer transition-colors duration-150 text-xs ${
                    activeSubTab === subItem.key
                      ? "bg-purple-50 text-purple-600 font-medium"
                      : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                  }`}
                  onClick={(e) => handleSubItemClick(e, subItem.key)}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05, duration: 0.2 }}
                >
                  {subItem.name}
                </motion.li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </motion.li>
    );
  }
);

// --- Main AdminCenter Component ---
function AdminCenter() {
  const location = useLocation();
  const navigate = useNavigate();
  const sidebarItems = ALL_SIDEBAR_ITEMS;
  const [expandedMainTab, setExpandedMainTab] = useState(null);
  const [activeSubTab, setActiveSubTab] = useState(null);
  const handleTabChange = useCallback(
    (newTabKey) => {
      if (newTabKey === activeSubTab) return;
      setActiveSubTab(newTabKey);
      let parentKeyToExpand = null;
      for (const item of sidebarItems) {
        if (item.key === newTabKey && !item.subItems) {
          parentKeyToExpand = item.key;
          break;
        }
        if (item.subItems?.some((subItem) => subItem.key === newTabKey)) {
          parentKeyToExpand = item.key;
          break;
        }
      }
      if (parentKeyToExpand) {
        setExpandedMainTab(parentKeyToExpand);
      }
      navigate(`${location.pathname}?tab=${newTabKey}`, { replace: true });
    },
    [navigate, location.pathname, activeSubTab, sidebarItems]
  );
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tabFromQuery = params.get("tab");
    if (tabFromQuery) {
      if (tabFromQuery !== activeSubTab) {
        setActiveSubTab(tabFromQuery);
        let parentKeyToExpand = null;
        for (const item of sidebarItems) {
          if (item.key === tabFromQuery && !item.subItems) {
            parentKeyToExpand = item.key;
            break;
          }
          if (item.subItems?.some((subItem) => subItem.key === tabFromQuery)) {
            parentKeyToExpand = item.key;
            break;
          }
        }
        if (parentKeyToExpand) {
          setExpandedMainTab(parentKeyToExpand);
        } else {
          if (sidebarItems.length > 0) {
            const defaultParentFallback = sidebarItems[0].key;
            const defaultChildFallback = sidebarItems[0].subItems
              ? sidebarItems[0].subItems[0].key
              : sidebarItems[0].key;
            setExpandedMainTab(defaultParentFallback);
            setActiveSubTab(defaultChildFallback);
            navigate(`${location.pathname}?tab=${defaultChildFallback}`, {
              replace: true,
            });
          }
        }
      }
    } else if (sidebarItems.length > 0 && !activeSubTab) {
      const defaultParentInitial = sidebarItems[0].key;
      const defaultChildInitial = sidebarItems[0].subItems
        ? sidebarItems[0].subItems[0].key
        : sidebarItems[0].key;
      setExpandedMainTab(defaultParentInitial);
      setActiveSubTab(defaultChildInitial);
      navigate(`${location.pathname}?tab=${defaultChildInitial}`, {
        replace: true,
      });
    }
  }, [
    location.search,
    navigate,
    location.pathname,
    activeSubTab,
    sidebarItems,
  ]);
  const [basicInfo, setBasicInfo] = useState({
    businessName: "Fairforse",
    email: "-",
    contactNumber: "-",
    timeZone: "Asia/Karachi - PKT (+05:00)",
    currency: "PKR",
    startOfWeek: "Monday",
    timeFormat: "12 Hours",
    FairForseBranding: "Enabled",
  });
  const [isEditingBasicInfo, setIsEditingBasicInfo] = useState(false);
  const handleBasicInfoChange = useCallback((e) => {
    const { name, value, type, checked } = e.target;
    setBasicInfo((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (checked ? "Enabled" : "Disabled") : value,
    }));
  }, []);
  const handleSaveBasicInfo = useCallback(
    () => setIsEditingBasicInfo(false),
    []
  );
  const handleCancelBasicInfo = useCallback(
    () => setIsEditingBasicInfo(false),
    []
  );
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalType, setModalType] = useState("");
  const openModal = useCallback((type) => {
    setModalType(type);
    setIsModalOpen(true);
  }, []);
  const closeModal = useCallback(() => {
    setIsModalOpen(false);
    setTimeout(() => setModalType(""), 300);
  }, []);
  const IntegrationCard = ({ icon, title, description, status }) => (
    <motion.div
      className="bg-white p-5 rounded-xl shadow-lg border border-gray-200 flex flex-col items-start text-left h-full hover:shadow-xl"
      whileHover={{ y: -4, scale: 1.015 }}
      transition={{ type: "spring", stiffness: 300, damping: 15 }}
    >
      <div className="flex items-center mb-3">
        {icon && (
          <div className="p-2.5 bg-purple-100 rounded-lg mr-3">
            {React.cloneElement(icon, {
              size: 20,
              className: "text-purple-600",
            })}
          </div>
        )}
        <h3 className="text-md font-semibold text-gray-800">{title}</h3>
      </div>
      <p className="text-xs text-gray-600 mb-4 flex-grow">{description}</p>
      {status === "connected" ? (
        <div className="flex items-center text-green-600 font-medium text-xs mt-auto bg-green-50 px-2.5 py-1 rounded-full">
          <CheckCircle2 size={14} className="mr-1.5" /> Connected
        </div>
      ) : (
        <motion.button
          className="px-4 py-1.5 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-xs mt-auto"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Connect
        </motion.button>
      )}
    </motion.div>
  );
  const getActiveTabName = useCallback(() => {
    if (!activeSubTab) return "Admin Center";
    const foundItem = ALL_SIDEBAR_ITEMS.flatMap(
      (i) => i.subItems || [{ key: i.key, name: i.name }]
    ).find((i) => i.key === activeSubTab);
    return foundItem
      ? foundItem.name
      : activeSubTab
          .replace(/-/g, " ")
          .replace(/\b\w/g, (l) => l.toUpperCase());
  }, [activeSubTab]);

  const renderContent = useCallback(() => {
    if (!activeSubTab)
      return (
        <div className="p-6 text-center text-gray-500 text-sm">
          Select an option from the sidebar.
        </div>
      );
    if (activeSubTab === "organization-it-specialists")
      return <RecruitersView />;
    if (activeSubTab === "modules-customers") return <CustomersView />;
    switch (activeSubTab) {
      case "organization-basic-information":
        return (
          <motion.div
            className="bg-white p-5 md:p-6 rounded-xl shadow-xl border border-gray-200"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 pb-3 border-b border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-2 sm:mb-0">
                Basic Information
              </h2>
              {isEditingBasicInfo ? (
                <div className="space-x-2">
                  {" "}
                  <motion.button
                    onClick={handleSaveBasicInfo}
                    className="px-3 py-1.5 bg-green-600 text-white rounded-md hover:bg-green-700 text-xs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {" "}
                    Save{" "}
                  </motion.button>{" "}
                  <motion.button
                    onClick={handleCancelBasicInfo}
                    className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 text-xs"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {" "}
                    Cancel{" "}
                  </motion.button>{" "}
                </div>
              ) : (
                <motion.button
                  onClick={() => setIsEditingBasicInfo(true)}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-md hover:bg-purple-700 flex items-center text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {" "}
                  <Edit size={14} className="mr-1.5" /> Edit{" "}
                </motion.button>
              )}
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-6 text-sm">
              {[
                { label: "Business Name", name: "businessName", type: "text" },
                { label: "Email", name: "email", type: "email" },
                {
                  label: "Contact Number",
                  name: "contactNumber",
                  type: "text",
                },
                { label: "Time Zone", name: "timeZone", type: "text" },
                { label: "Currency", name: "currency", type: "text" },
                {
                  label: "Start of the Week",
                  name: "startOfWeek",
                  type: "text",
                },
                { label: "Time Format", name: "timeFormat", type: "text" },
              ].map((field) => (
                <div key={field.name}>
                  {" "}
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    {field.label}
                  </label>{" "}
                  {isEditingBasicInfo ? (
                    <input
                      type={field.type}
                      name={field.name}
                      value={basicInfo[field.name]}
                      onChange={handleBasicInfoChange}
                      className="mt-0.5 block w-full rounded-md border-gray-300 shadow-sm focus:border-purple-500 focus:ring-purple-500 sm:text-xs p-2"
                    />
                  ) : (
                    <p className="mt-0.5 text-gray-800 font-medium text-sm py-1.5 px-1">
                      {basicInfo[field.name] || "-"}
                    </p>
                  )}{" "}
                </div>
              ))}
              <div>
                {" "}
                <label className="block text-xs font-medium text-gray-500 mb-1">
                  FairForse Bookings Branding
                </label>{" "}
                {isEditingBasicInfo ? (
                  <div className="flex items-center mt-1.5">
                    {" "}
                    <input
                      type="checkbox"
                      id="FairForseBranding"
                      name="FairForseBranding"
                      checked={basicInfo.FairForseBranding === "Enabled"}
                      onChange={handleBasicInfoChange}
                      className="h-4 w-4 text-purple-600 focus:ring-purple-500 border-gray-300 rounded cursor-pointer"
                    />{" "}
                    <label
                      htmlFor="FairForseBranding"
                      className="ml-2 text-gray-800 cursor-pointer select-none text-xs"
                    >
                      {" "}
                      {basicInfo.FairForseBranding}{" "}
                    </label>{" "}
                  </div>
                ) : (
                  <div className="mt-0.5 py-1.5">
                    {" "}
                    <span
                      className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                        basicInfo.FairForseBranding === "Enabled"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {" "}
                      {basicInfo.FairForseBranding}{" "}
                    </span>{" "}
                  </div>
                )}{" "}
              </div>
            </div>
          </motion.div>
        );
      case "organization-business-hours":
        return (
          <>
            {" "}
            <BusinessHoursCard
              title="Working Hours"
              description="Weekly operating days and hours."
              buttonText="Customize"
              onButtonClick={() => openModal("customizeWorkingHours")}
            >
              {" "}
              <div className="text-xs space-y-1">
                <p>
                  <strong>Mon-Fri:</strong> 9AM-5PM
                </p>
                <p>
                  <strong>Sat-Sun:</strong> Closed
                </p>
              </div>{" "}
            </BusinessHoursCard>{" "}
            <BusinessHoursCard
              title="Special Working Hours"
              description="Extra available days or hours."
              buttonText="+ Add Special"
              onButtonClick={() => openModal("addSpecialHours")}
            >
              {" "}
              <div className="text-xs">
                <p>No special hours configured.</p>
              </div>{" "}
            </BusinessHoursCard>{" "}
            <BusinessHoursCard
              title="Unavailability"
              description="Mark business closure (holidays)."
              buttonText="+ Add Period"
              onButtonClick={() => openModal("addUnavailability")}
            >
              {" "}
              <div className="text-xs">
                <p>No unavailability configured.</p>
              </div>{" "}
            </BusinessHoursCard>{" "}
            <Modal
              isOpen={isModalOpen && modalType === "customizeWorkingHours"}
              onClose={closeModal}
              title="Customize Working Hours"
            >
              {" "}
              <p className="text-xs text-gray-600 mb-3">
                Set standard weekly availability.
              </p>{" "}
              <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                {" "}
                Weekly Calendar{" "}
              </div>{" "}
              <div className="mt-5 flex justify-end space-x-2">
                {" "}
                <motion.button
                  onClick={closeModal}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>{" "}
                <motion.button
                  onClick={closeModal}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save
                </motion.button>{" "}
              </div>{" "}
            </Modal>
            <Modal
              isOpen={isModalOpen && modalType === "addSpecialHours"}
              onClose={closeModal}
              title="Add Special Working Hours"
            >
              <p className="text-xs text-gray-600 mb-3">
                Add specific dates or periods with adjusted working hours.
              </p>
              <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                Special Hours Configuration Form
              </div>
              <div className="mt-5 flex justify-end space-x-2">
                <motion.button
                  onClick={closeModal}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={closeModal}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save
                </motion.button>
              </div>
            </Modal>
            <Modal
              isOpen={isModalOpen && modalType === "addUnavailability"}
              onClose={closeModal}
              title="Add Unavailability Period"
            >
              <p className="text-xs text-gray-600 mb-3">
                Mark a period when your business will be closed (e.g.,
                holidays).
              </p>
              <div className="h-32 bg-gray-100 rounded-md flex items-center justify-center text-gray-400 text-xs">
                Unavailability Configuration Form
              </div>
              <div className="mt-5 flex justify-end space-x-2">
                <motion.button
                  onClick={closeModal}
                  className="px-3 py-1.5 bg-gray-200 text-gray-700 rounded-md text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Cancel
                </motion.button>
                <motion.button
                  onClick={closeModal}
                  className="px-3 py-1.5 bg-purple-600 text-white rounded-md text-xs"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save
                </motion.button>
              </div>
            </Modal>
          </>
        );
      case "integrations-video-conferencing":
        return (
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, staggerChildren: 0.1 }}
          >
            {" "}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {" "}
              <IntegrationCard
                icon={<Video />}
                title="FairForse Meeting"
                description="Auto-create FairForse Meeting."
                status="connected"
              />{" "}
              <IntegrationCard
                icon={<Video />}
                title="Google Meet"
                description="Auto-create Google Meet."
                status="connected"
              />{" "}
              <IntegrationCard
                icon={<Video />}
                title="Microsoft Teams"
                description="Auto-create MS Teams."
                status="connect"
              />{" "}
              <IntegrationCard
                icon={<Video />}
                title="Zoom"
                description="Auto-create Zoom Meeting."
                status="connect"
              />{" "}
            </div>{" "}
          </motion.div>
        );
      case "modules-workspaces":
        return (
          <div className="p-5 bg-white rounded-xl shadow-lg text-sm">
            <h3 className="text-md font-semibold">Workspaces Settings</h3>
            <p className="text-gray-600 mt-1.5 text-xs">
              Configure workspace preferences.
            </p>
          </div>
        );
      case "data-privacy":
        return (
          <div className="p-5 bg-white rounded-xl shadow-lg text-sm">
            <h3 className="text-md font-semibold">Data Privacy & Security</h3>
            <p className="text-gray-600 mt-1.5 text-xs">
              Manage data privacy and security.
            </p>
          </div>
        );
      default:
        const mainCategoryKey = activeSubTab?.split("-")[0];
        const mainCategory = sidebarItems.find(
          (item) =>
            item.key === mainCategoryKey ||
            item.subItems?.some((sub) => sub.key === activeSubTab)
        );
        return (
          <motion.div
            className="bg-white p-6 rounded-xl shadow-xl border border-gray-200 text-sm"
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {" "}
            <h2 className="text-lg font-semibold text-gray-800 mb-3">
              {" "}
              {mainCategory ? mainCategory.name : "Section"} -{" "}
              {getActiveTabName()}{" "}
            </h2>{" "}
            <p className="text-gray-600 text-xs">
              {" "}
              Content for "{getActiveTabName()}" is under development.{" "}
            </p>{" "}
          </motion.div>
        );
    }
  }, [
    activeSubTab,
    basicInfo,
    isEditingBasicInfo,
    modalType,
    isModalOpen,
    getActiveTabName,
    openModal,
    closeModal,
    handleBasicInfoChange,
    handleSaveBasicInfo,
    handleCancelBasicInfo,
    sidebarItems,
  ]);

  return (
    <div className="flex flex-col gap-3 h-screen lg:h-[calc(100vh-100px)] lg:flex-row overflow-hidden p-1.5 sm:p-2 md:p-3">
      <aside className="w-full lg:w-72 h-full max-h-[calc(100vh-56px)] lg:max-h-full border rounded-xl overflow-hidden bg-white flex flex-col shadow-xl border-gray-200">
        <div className="p-4 border-b border-gray-200">
          <header className="flex items-center space-x-2 mb-4">
            <motion.button
              onClick={() => navigate(-1)}
              className="p-1.5 rounded-full hover:bg-gray-100 text-gray-600 hover:text-purple-600"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft size={18} />
            </motion.button>
            <h1 className="text-lg font-bold text-gray-800"> Admin Center </h1>
          </header>
          <div className="relative">
            <input
              type="text"
              placeholder="Search settings..."
              className="w-full pl-8 pr-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-xs shadow-sm"
            />
            <Search
              size={14}
              className="text-gray-400 absolute left-2.5 top-1/2 transform -translate-y-1/2"
            />
          </div>
        </div>
        <nav className="flex-1 overflow-y-auto p-2 custom-scrollbar">
          <ul className="space-y-1">
            {sidebarItems.map((item) => (
              <SidebarNavItem
                key={item.key}
                item={item}
                expandedMainTab={expandedMainTab}
                setExpandedMainTab={setExpandedMainTab}
                activeSubTab={activeSubTab}
                onTabChange={handleTabChange}
              />
            ))}
          </ul>
        </nav>
      </aside>
      <main className="flex-1 flex flex-col h-full max-h-[calc(100vh-56px)] lg:max-h-full border rounded-xl overflow-hidden bg-white shadow-xl border-gray-200">
        <header className="p-4 bg-white border-b border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between sticky top-0 z-10">
          <h1 className="text-md md:text-lg font-semibold text-gray-800 capitalize mb-2 sm:mb-0">
            {getActiveTabName()}
          </h1>
        </header>
        <div className="flex-1 overflow-y-auto p-3 md:p-4 bg-gray-50 custom-scrollbar">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeSubTab || "loading"}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="h-full"
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f0f0f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #c1c1c1;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #a8a8a8;
        }
      `}</style>
    </div>
  );
}

export default AdminCenter;
