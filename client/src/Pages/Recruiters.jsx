import React, { useState, useEffect, useCallback } from "react";
import { BASE_URL } from "../BaseUrl";
import Swal from "sweetalert2"; // Import SweetAlert2

// --- Icon Components ---
const PlusIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M12 6v6m0 0v6m0-6h6m-6 0H6"
    />
  </svg>
);
const SearchIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
    />
  </svg>
);
const ShareIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
    />
  </svg>
);
const ChevronLeftIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
  </svg>
);
const XIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M6 18L18 6M6 6l12 12"
    />
  </svg>
);
const DotsHorizontalIcon = ({ className }) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M5 12h.01M12 12h.01M19 12h.01M5 12a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2zm7 0a1 1 0 110-2 1 1 0 010 2z"
    />
  </svg>
);
const TrashIcon = (
  { className } // New Delete Icon
) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
    />
  </svg>
);
const PencilIcon = (
  { className } // Edit Icon
) => (
  <svg
    className={className}
    fill="none"
    viewBox="0 0 24 24"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"
    />
  </svg>
);

const USER_API_BASE_URL = `${BASE_URL}/api/users`;
const CONSULTING_API_BASE_URL = `${BASE_URL}/api/consulting-events`;

// --- InputField Component ---
const InputField = ({
  label,
  name,
  value,
  onChange,
  type = "text",
  placeholder = "",
  required = false,
  as = "input",
  children,
  disabled = false,
  className = "",
  ...rest
}) => {
  const commonInputClassName = `w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm disabled:bg-gray-100 disabled:text-gray-500 disabled:cursor-not-allowed ${className}`;
  let Element;
  if (as === "select")
    Element = (
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={commonInputClassName}
        {...rest}
      >
        {children}
      </select>
    );
  else if (as === "textarea")
    Element = (
      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={commonInputClassName}
        {...rest}
      />
    );
  else
    Element = (
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        className={commonInputClassName}
        {...rest}
      />
    );
  return (
    <div>
      <label
        htmlFor={name}
        className="block text-sm font-medium text-gray-700 mb-1"
      >
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      {Element}
    </div>
  );
};

// --- Main Recruiters Component ---
const Recruiters = () => {
  const [view, setView] = useState("list");
  const [specialists, setSpecialists] = useState([]);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState(null);

  const fetchSpecialists = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${USER_API_BASE_URL}/getUsers`);
      if (!response.ok) {
        const errData = await response
          .json()
          .catch(() => ({ message: `HTTP error! status: ${response.status}` }));
        throw new Error(
          errData.message || `HTTP error! status: ${response.status}`
        );
      }
      const result = await response.json();
      if (result.success) setSpecialists(result.data);
      else setError(result.message || "Failed to fetch specialists.");
    } catch (err) {
      console.error("Error fetching specialists:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSpecialists();
  }, [fetchSpecialists]);

  const handleViewProfile = (specialist) => {
    setSelectedSpecialist(specialist);
    setView("profile");
  };
  const handleBackToList = () => {
    setView("list");
    setSelectedSpecialist(null);
    fetchSpecialists(); /* Refresh list after potential delete */
  };
  const handleInviteSuccess = () => {
    setIsInviteModalOpen(false);
    fetchSpecialists();
  };
  const handleProfileUpdate = (updatedUser) => {
    setSelectedSpecialist(updatedUser);
    fetchSpecialists(); /* Parent view remains 'profile' */
  };

  const filteredSpecialists = specialists.filter(
    (s) =>
      (s.name && s.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (s.email && s.email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="flex-1 p-4 md:p-6 bg-gray-50 min-h-screen">
      {view === "list" && (
        <>
          <div className="flex flex-col sm:flex-row justify-between sm:items-center mb-6">
            <div className="mb-4 sm:mb-0">
              <h1 className="text-xl md:text-2xl font-semibold text-gray-800">
                Active IT Specialists
              </h1>
              <p className="text-sm text-gray-500">
                {filteredSpecialists.length} Specialist
                {filteredSpecialists.length !== 1 ? "s" : ""}
              </p>
            </div>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-3 sm:space-y-0 sm:space-x-3">
              <div className="relative flex-grow sm:flex-grow-0">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <SearchIcon className="h-5 w-5 text-gray-400" />
                </span>
                <input
                  type="text"
                  placeholder="Search Specialists"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 shadow-sm"
                />
              </div>
              <button
                onClick={() => setIsInviteModalOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md flex items-center justify-center shadow-sm hover:shadow-md transition-shadow"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                New IT Specialist
              </button>
            </div>
          </div>
          {isLoading && (
            <div className="text-center py-10">
              <p className="text-gray-600">Loading specialists...</p>
            </div>
          )}
          {error && (
            <div className="bg-red-50 p-4 rounded-md text-red-700">
              <p>Error: {error}</p>
            </div>
          )}
          {!isLoading &&
            !error &&
            (filteredSpecialists.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredSpecialists.map((specialist) => (
                  <SpecialistCard
                    key={specialist._id}
                    specialist={specialist}
                    onViewProfile={handleViewProfile}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-10">
                <p className="text-gray-600">
                  No IT specialists found
                  {searchTerm ? " matching your search." : "."}
                </p>
              </div>
            ))}
        </>
      )}
      {view === "profile" && selectedSpecialist && (
        <SpecialistProfile
          key={selectedSpecialist._id}
          specialist={selectedSpecialist}
          onBack={handleBackToList}
          onProfileUpdate={handleProfileUpdate}
          userApiBaseUrl={USER_API_BASE_URL}
        />
      )}
      {isInviteModalOpen && (
        <InviteModal
          isOpen={isInviteModalOpen}
          onClose={() => setIsInviteModalOpen(false)}
          onInviteSuccess={handleInviteSuccess}
          apiBaseUrl={USER_API_BASE_URL}
        />
      )}
    </div>
  );
};

// --- SpecialistCard Component ---
const SpecialistCard = ({ specialist, onViewProfile }) => {
  const getInitials = (name) => {
    if (!name) return "?";
    const n = name.split(" ");
    return (
      n[0].charAt(0) + (n.length > 1 ? n[n.length - 1].charAt(0) : "")
    ).toUpperCase();
  };
  return (
    <div
      className="bg-white p-5 rounded-lg shadow-md cursor-pointer hover:shadow-lg transition-shadow"
      onClick={() => onViewProfile(specialist)}
    >
      <div className="flex items-center mb-4">
        <div
          className={`w-12 h-12 rounded-full text-white flex items-center justify-center text-xl font-semibold mr-4 ${
            specialist.status === "Active" ? "bg-blue-500" : "bg-gray-400"
          }`}
        >
          {getInitials(specialist.name)}
        </div>
        <div className="truncate">
          <h3
            className="text-lg font-semibold text-gray-800 truncate"
            title={specialist.name}
          >
            {specialist.name}
          </h3>
          <p
            className="text-sm text-gray-500 truncate"
            title={specialist.email}
          >
            {specialist.email}
          </p>
        </div>
      </div>
      <div className="flex justify-between items-center">
        <span
          className={`px-3 py-1 text-xs font-semibold rounded-full ${
            specialist.role === "Admin"
              ? "bg-green-100 text-green-700"
              : specialist.role === "Super Admin"
              ? "bg-purple-100 text-purple-700"
              : "bg-blue-100 text-blue-700"
          }`}
        >
          {specialist.role || "Staff"}
        </span>
        <button
          onClick={(e) => e.stopPropagation()}
          className="text-gray-500 hover:text-gray-700 flex items-center text-sm p-1 rounded hover:bg-gray-100"
        >
          <ShareIcon className="h-4 w-4 mr-1" /> Share
        </button>
      </div>
    </div>
  );
};

// --- InviteModal Component ---
const InviteModal = ({ isOpen, onClose, onInviteSuccess, apiBaseUrl }) => {
  const [emails, setEmails] = useState("");
  const [role, setRole] = useState("Staff");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
  const handleSubmit = async (e) => {
    /* ... same as before ... */ e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);
    const emailArray = emails
      .split(/[\s,]+/)
      .filter(
        (em) => em.trim() !== "" && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em.trim())
      );
    if (emailArray.length === 0) {
      setError("Please enter at least one valid email address.");
      setIsSubmitting(false);
      return;
    }
    let allSuccess = true,
      successfulInvites = 0,
      firstErrorMessage = "";
    for (const email of emailArray) {
      try {
        const response = await fetch(`${apiBaseUrl}/invite`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, role }),
        });
        const result = await response.json();
        if (!response.ok || !result.success) {
          allSuccess = false;
          if (!firstErrorMessage)
            firstErrorMessage = result.message || `Failed to invite ${email}.`;
        } else {
          successfulInvites++;
        }
      } catch (err) {
        allSuccess = false;
        console.error("Error inviting user:", err);
        if (!firstErrorMessage)
          firstErrorMessage =
            err.message || `Network error while inviting ${email}.`;
      }
    }
    setIsSubmitting(false);
    if (successfulInvites > 0) {
      let message = `${successfulInvites} user(s) invited successfully.`;
      if (!allSuccess) {
        message += ` However, some invites failed. First error: ${firstErrorMessage}`;
        setError(message);
        setSuccessMessage(null);
      } else {
        setSuccessMessage(message + " Awaiting acceptance.");
        setError(null);
      }
      setEmails("");
      if (allSuccess) {
        setTimeout(() => {
          onInviteSuccess();
          setSuccessMessage(null);
        }, 2000);
      }
    } else if (!allSuccess) {
      setError(firstErrorMessage || "All invitations failed.");
    }
  };
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold text-gray-800">
            Invite IT Specialists
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <XIcon className="h-6 w-6" />
          </button>
        </div>
        {error && (
          <p className="text-red-600 text-sm mb-3 p-2 bg-red-50 rounded-md">
            {error}
          </p>
        )}{" "}
        {successMessage && (
          <p className="text-green-600 text-sm mb-3 p-2 bg-green-50 rounded-md">
            {successMessage}
          </p>
        )}
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label
              htmlFor="emails-invite"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Emails <span className="text-red-500">*</span>
            </label>
            <textarea
              id="emails-invite"
              name="emails"
              rows="3"
              value={emails}
              onChange={(e) => setEmails(e.target.value)}
              placeholder="Enter email addresses separated by a space or comma"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-sm"
              required
            />
          </div>
          <div className="mb-6">
            <label
              htmlFor="role-invite"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Role <span className="text-red-500">*</span>
            </label>
            <select
              id="role-invite"
              name="role"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white text-sm"
              required
            >
              <option value="Staff">Staff</option>
              <option value="Admin">Admin</option>
            </select>
          </div>
          <div className="flex justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Inviting..." : "Invite"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// --- SpecialistProfile Component ---
const SpecialistProfile = ({
  specialist,
  onBack,
  onProfileUpdate,
  userApiBaseUrl,
}) => {
  const [formData, setFormData] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [profileError, setProfileError] = useState(null);
  const [activeTab, setActiveTab] = useState("Profile");
  const [formMode, setFormMode] = useState("profile"); // 'profile' or 'edit'

  const isEditingSuperAdmin = specialist.role === "Super Admin";

  useEffect(() => {
    if (specialist) {
      setFormData({
        name: specialist.name || "",
        phone: specialist.phone || "",
        role: specialist.role || "Staff",
        gender: specialist.gender || "",
        designation: specialist.designation || "",
        dateOfBirth: specialist.dateOfBirth
          ? new Date(specialist.dateOfBirth).toISOString().split("T")[0]
          : "",
        status: specialist.status || "Active",
        additionalInformation: specialist.additionalInformation || "",
        workspace: specialist.workspace || "",
      });
    }
    setFormMode("profile");
    setActiveTab("Profile");
  }, [specialist]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const handleStatusChange = (newStatus) =>
    setFormData((prev) => ({ ...prev, status: newStatus }));

  const handleProfileFormSubmit = async (e) => {
    e.preventDefault();
    if (isEditingSuperAdmin && formData.role !== "Super Admin") {
      setProfileError("Super Admin's role cannot be changed.");
      return;
    }
    setIsSubmitting(true);
    setProfileError(null);
    const payload = { ...formData };
    if (payload.dateOfBirth === "") payload.dateOfBirth = null;
    try {
      const response = await fetch(
        `${userApiBaseUrl}/update/${specialist._id}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        }
      );
      const result = await response.json();
      if (!response.ok || !result.success)
        throw new Error(result.message || "Failed to update profile.");
      onProfileUpdate(result.data);
      setFormMode("profile");
      setActiveTab("Profile");
    } catch (err) {
      console.error("Error updating profile:", err);
      setProfileError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteSpecialist = async () => {
    Swal.fire({
      title: "Are you sure?",
      text: `You are about to delete ${specialist.name}. This action cannot be undone.`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Yes, delete it!",
      customClass: {
        popup: "text-sm", // Example of custom class for smaller text
      },
    }).then(async (result) => {
      if (result.isConfirmed) {
        setIsSubmitting(true); // Show loading/disabled state on buttons if any visible
        try {
          const response = await fetch(`${userApiBaseUrl}/delete/${specialist._id}`, {
            method: "DELETE",
          });
          const resData = await response.json();
          if (!response.ok || !resData.success) {
            throw new Error(resData.message || "Failed to delete specialist.");
          }
          Swal.fire(
            "Deleted!",
            `${specialist.name} has been deleted.`,
            "success"
          );
          onBack(); // Navigate back to the list and refresh
        } catch (err) {
          console.error("Error deleting specialist:", err);
          Swal.fire(
            "Error!",
            err.message || "Could not delete specialist.",
            "error"
          );
        } finally {
          setIsSubmitting(false);
        }
      }
    });
  };

  const getInitials = (name) => {
    if (!name) return "?";
    const n = name.split(" ");
    return (
      n[0].charAt(0) + (n.length > 1 ? n[n.length - 1].charAt(0) : "")
    ).toUpperCase();
  };
  const DetailItem = ({ label, value, className = "" }) => (
    <div className={className}>
      <p className="text-xs sm:text-sm text-gray-500">{label}</p>
      <p className="text-sm sm:text-base text-gray-800 break-words">
        {value || "-"}
      </p>
    </div>
  );
  const handleTabClick = (tabName) => {
    setActiveTab(tabName);
    if (formMode === "edit" && tabName !== "Profile") setFormMode("profile");
  };
  const tabs = [
    "Profile",
    "Availability",
    "Assigned IT Consulting",
    "Integrations",
  ];

  return (
    <div className="bg-white p-4 md:p-6 rounded-lg shadow-lg">
      <div className="mb-6">
        {" "}
        {/* Header section with Back button, specialist info, and action buttons */}
        <div className="flex justify-between items-start">
          {" "}
          {/* Top line: Back button and action buttons */}
          <button
            onClick={onBack}
            className="text-blue-600 hover:text-blue-800 flex items-center text-sm -ml-1 sm:ml-0 mb-2"
          >
            <ChevronLeftIcon className="h-5 w-5 mr-1" />Back {" "}
            {/* Back to Specialist Name */}
          </button>
          <div className="flex items-center space-x-2 sm:space-x-3">
            {formMode === "profile" && ( // Share and Delete only in profile view mode
              <>
                <button
                  onClick={() => {
                    /* Share logic */
                  }}
                  className="text-gray-600 hover:text-blue-600 flex items-center p-2 border border-gray-300 hover:border-blue-400 rounded-md text-sm bg-white shadow-sm"
                >
                  <ShareIcon className="h-4 w-4 sm:mr-2" />{" "}
                  <span className="hidden sm:inline">Share</span>
                </button>
                {specialist.role !== "Super Admin" && (
                  <button
                    onClick={handleDeleteSpecialist}
                    title="Delete Specialist"
                    disabled={isSubmitting}
                    className="text-red-500 hover:text-red-700 disabled:opacity-50 flex items-center p-2 border border-gray-300 hover:border-red-400 rounded-md text-sm bg-white shadow-sm"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                )}
              </>
            )}
          </div>
        </div>
        <div className="flex items-center mt-2 mb-4 sm:mb-0">
          {" "}
          {/* User Avatar and Basic Info */}
          <div
            className={`w-16 h-16 rounded-full text-white flex items-center justify-center text-2xl font-semibold mr-4 ${
              specialist.status === "Active" ? "bg-blue-500" : "bg-gray-400"
            }`}
          >
            {getInitials(specialist.name)}
          </div>
          <div>
            <h2 className="text-xl md:text-2xl font-semibold text-gray-800">
              {specialist.name}
            </h2>
            <p className="text-sm text-gray-500">{specialist.email}</p>
            <span
              className={`mt-1 inline-block px-2 py-0.5 text-xs font-semibold rounded-full ${
                specialist.role === "Admin"
                  ? "bg-green-100 text-green-700"
                  : specialist.role === "Super Admin"
                  ? "bg-purple-100 text-purple-700"
                  : "bg-blue-100 text-blue-700"
              }`}
            >
              {specialist.role || "Staff"}
            </span>
          </div>
        </div>
      </div>

      <div className="border-b border-gray-200 mb-6">
        {" "}
        {/* Tabs Navigation */}
        <nav className="-mb-px flex space-x-6 sm:space-x-8 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => handleTabClick(tab)}
              className={`py-3 sm:py-4 px-1 border-b-2 text-sm whitespace-nowrap ${
                activeTab === tab
                  ? "border-blue-500 font-medium text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {activeTab === "Profile" /* Profile Tab Content */ && (
        <>
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-base md:text-lg font-medium text-gray-900">
              Personal Information
            </h3>
            {formMode === "profile" && (
              <button
                onClick={() => setFormMode("edit")}
                className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold py-2 px-4 rounded-md border border-blue-300 text-sm flex items-center"
              >
                <PencilIcon className="h-4 w-4 mr-2" /> Edit
              </button>
            )}
          </div>
          {profileError && formMode === "edit" && (
            <p className="text-red-600 text-sm mb-4 bg-red-50 p-3 rounded-md">
              {profileError}
            </p>
          )}
          <form onSubmit={handleProfileFormSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
              {formMode === "profile" ? (
                <>
                  <DetailItem label="Name" value={specialist.name} />{" "}
                  <DetailItem label="Email" value={specialist.email} />
                  <DetailItem
                    label="Phone Number"
                    value={specialist.phone}
                  />{" "}
                  <DetailItem label="Role" value={specialist.role} />
                  <DetailItem
                    label="Designation"
                    value={specialist.designation}
                  />{" "}
                  <DetailItem label="Gender" value={specialist.gender} />
                  <DetailItem
                    label="Date of Birth"
                    value={
                      specialist.dateOfBirth
                        ? new Date(specialist.dateOfBirth).toLocaleDateString()
                        : "-"
                    }
                  />
                  <div>
                    <p className="text-xs sm:text-sm text-gray-500">Status</p>
                    <span
                      className={`px-3 py-1 text-xs font-semibold rounded-full ${
                        specialist.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {specialist.status}
                    </span>
                  </div>
                  <DetailItem
                    label="Workspace"
                    value={specialist.workspace || "-"}
                  />
                  <DetailItem
                    label="Additional Information"
                    value={specialist.additionalInformation}
                    className="md:col-span-2"
                  />
                </>
              ) : (
                /* Edit Mode for Profile */
                <>
                  <InputField
                    key="name"
                    name="name"
                    label="Name"
                    value={formData.name || ""}
                    onChange={handleChange}
                    required
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email
                    </label>
                    <p className="text-sm text-gray-700 bg-gray-50 p-2.5 border border-gray-200 rounded-md">
                      {specialist.email}
                    </p>
                  </div>
                  <InputField
                    key="phone"
                    name="phone"
                    label="Phone Number"
                    value={formData.phone || ""}
                    onChange={handleChange}
                    placeholder="+1234567890"
                  />
                  <InputField
                    key="role"
                    name="role"
                    label="Role"
                    as="select"
                    value={formData.role || "Staff"}
                    onChange={handleChange}
                    disabled={isEditingSuperAdmin}
                  >
                    <option value="Staff">Staff</option>
                    <option value="Admin">Admin</option>
                  </InputField>
                  <InputField
                    key="designation"
                    name="designation"
                    label="Designation"
                    value={formData.designation || ""}
                    onChange={handleChange}
                  />
                  <InputField
                    key="gender"
                    name="gender"
                    label="Gender"
                    as="select"
                    value={formData.gender || ""}
                    onChange={handleChange}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </InputField>
                  <InputField
                    key="dateOfBirth"
                    name="dateOfBirth"
                    label="Date of Birth"
                    type="date"
                    value={formData.dateOfBirth || ""}
                    onChange={handleChange}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Status
                    </label>
                    <div className="flex space-x-2 sm:space-x-4">
                      <button
                        type="button"
                        onClick={() => handleStatusChange("Active")}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md border ${
                          formData.status === "Active"
                            ? "bg-green-500 text-white border-green-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Active
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStatusChange("Inactive")}
                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm rounded-md border ${
                          formData.status === "Inactive"
                            ? "bg-yellow-500 text-white border-yellow-500"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                        }`}
                      >
                        Inactive
                      </button>
                    </div>
                  </div>
                  <InputField
                    key="workspace"
                    name="workspace"
                    label="Workspace"
                    value={formData.workspace || ""}
                    onChange={handleChange}
                    placeholder="e.g., abc, development"
                  />
                  <div className="md:col-span-2">
                    <InputField
                      key="additionalInformation"
                      name="additionalInformation"
                      label="Additional Information"
                      as="textarea"
                      rows="3"
                      value={formData.additionalInformation || ""}
                      onChange={handleChange}
                    />
                  </div>
                </>
              )}
            </div>
            {formMode === "edit" && (
              <div className="mt-8 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setFormMode("profile")}
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md border border-gray-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : "Save"}
                </button>
              </div>
            )}
          </form>
        </>
      )}
      {activeTab === "Availability" && (
        <div className="p-4 text-gray-600">
          Availability content for {specialist.name}.
        </div>
      )}
      {activeTab === "Assigned IT Consulting" && (
        <AssignedITConsultingTab specialistId={specialist._id} />
      )}
      {activeTab === "Integrations" && (
        <div className="p-4 text-gray-600">
          Integrations content for {specialist.name}.
        </div>
      )}
    </div>
  );
};

// --- AssignedITConsultingTab Component ---
const AssignedITConsultingTab = ({ specialistId }) => {
  const [events, setEvents] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const fetchAssignedEvents = useCallback(async () => {
    /* ... same as before ... */ setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(`${CONSULTING_API_BASE_URL}/get`);
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
        const specialistEvents = result.data.filter(
          (event) =>
            event.assignedSpecialists &&
            event.assignedSpecialists.some(
              (s) => s === specialistId || (s._id && s._id === specialistId)
            )
        );
        setEvents(specialistEvents);
      } else {
        setError(result.message || "Failed to fetch consulting events.");
      }
    } catch (err) {
      console.error("Error fetching assigned consulting events:", err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [specialistId]);
  useEffect(() => {
    fetchAssignedEvents();
  }, [fetchAssignedEvents]);
  const getEventInitials = (name) => {
    if (!name) return "EV";
    const w = name.split(/\s+/);
    return w.length === 1
      ? w[0].substring(0, 2).toUpperCase()
      : (w[0].charAt(0) + (w[1] ? w[1].charAt(0) : "")).toUpperCase();
  };
  const formatDuration = (h, m) => {
    let p = [];
    if (h > 0) p.push(`${h} hr${h > 1 ? "s" : ""}`);
    if (m > 0) p.push(`${m} min${m > 1 ? "s" : ""}`);
    return p.join(" ") || "N/A";
  };
  const filteredEvents = events.filter((event) =>
    event.consultingName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  const getInitialColor = (name) => {
    let h = 0;
    for (let i = 0; i < name.length; i++)
      h = name.charCodeAt(i) + ((h << 5) - h);
    const c = [
      "bg-purple-200 text-purple-700",
      "bg-green-200 text-green-700",
      "bg-blue-200 text-blue-700",
      "bg-yellow-200 text-yellow-700",
      "bg-pink-200 text-pink-700",
      "bg-indigo-200 text-indigo-700",
    ];
    return c[Math.abs(h) % c.length];
  };
  return (
    <div>
      <div className="flex flex-col sm:flex-row justify-between items-center mb-4">
        <h3 className="text-lg font-medium text-gray-900 mb-2 sm:mb-0">
          Assigned IT Consulting{" "}
          <span className="text-sm bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full">
            {filteredEvents.length}
          </span>
        </h3>
        <div className="flex items-center space-x-3">
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <SearchIcon className="h-5 w-5 text-gray-400" />
            </span>
            <input
              type="text"
              placeholder="Search events"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 text-sm shadow-sm"
            />
          </div>
          <button className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md flex items-center text-sm shadow-sm">
            <PlusIcon className="h-5 w-5 mr-1 sm:mr-2" />
            <span className="hidden sm:inline">Assign</span>
            <span className="sm:hidden">+</span>
          </button>
        </div>
      </div>
      {isLoading && (
        <div className="text-center py-6">
          <p className="text-gray-500">Loading assigned events...</p>
        </div>
      )}{" "}
      {error && (
        <div className="bg-red-50 p-3 rounded-md text-red-700 mb-4">
          <p>Error: {error}</p>
        </div>
      )}
      {!isLoading && !error && (
        <div className="overflow-x-auto bg-white rounded-md shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Event Type Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Type
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Duration
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Price
                </th>
                <th scope="col" className="relative px-6 py-3">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <tr key={event._id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div
                          className={`w-9 h-9 rounded-md flex items-center justify-center text-sm font-semibold mr-3 ${getInitialColor(
                            event.consultingName || "Event"
                          )}`}
                        >
                          {getEventInitials(event.consultingName)}
                        </div>
                        <div className="text-sm font-medium text-gray-900">
                          {event.consultingName}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {event.bookingCadence === "one-on-one"
                        ? "One-on-One"
                        : event.bookingCadence === "group"
                        ? "Group"
                        : event.bookingCadence || "N/A"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {formatDuration(
                        event.durationHours,
                        event.durationMinutes
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      Rs{" "}
                      {event.priceAmount != null
                        ? event.priceAmount.toLocaleString()
                        : "0"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600 p-1">
                        <DotsHorizontalIcon className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="px-6 py-10 text-center text-sm text-gray-500"
                  >
                    No IT consulting events assigned to this specialist
                    {searchTerm ? " matching your search." : "."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Recruiters;
