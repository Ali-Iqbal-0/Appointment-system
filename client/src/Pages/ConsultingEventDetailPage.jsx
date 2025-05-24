// src/Pages/ConsultingEventDetailPage.jsx
import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../BaseUrl';
import { toast, Bounce } from 'react-toastify'; // Import react-toastify

// --- SVG Icon Helper ---
const createSvgIcon = (pathOrJsx, defaultClasses, viewBox = "0 0 24 24", svgFill = "none", svgStrokeWidth = "1.5") => {
  return ({ className: propClassName = '' }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill={svgFill}
      strokeWidth={svgFill === 'none' ? svgStrokeWidth : undefined}
      stroke={svgFill === 'none' ? "currentColor" : undefined}
      className={`${defaultClasses} ${propClassName}`}
    >
      {typeof pathOrJsx === 'string' ? <path strokeLinecap="round" strokeLinejoin="round" d={pathOrJsx} /> : pathOrJsx}
    </svg>
  );
};

// --- Icons ---
const ShareIcon = createSvgIcon(
  "M7.217 10.907a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM11.94 12.133L7.217 10.907m0 4.5l4.723-1.226m0 0a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0ZM11.94 12.133l4.723 1.226M11.94 12.133A2.25 2.25 0 1 0 11.94 12.133Zm2.25-1.226a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z",
  "w-5 h-5"
);
const EllipsisVerticalIcon = createSvgIcon(
  "M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z",
  "w-5 h-5"
);
const XMarkIcon = createSvgIcon(
  "M6 18 18 6M6 6l12 12",
  "w-6 h-6"
);
const PencilSquareIcon = createSvgIcon(
  "m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10",
  "w-5 h-5"
);
const InformationCircleIcon = createSvgIcon(
  "m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z",
  "w-5 h-5 text-gray-400"
);
const Cog8ToothIcon = createSvgIcon(
  "M4.5 12a7.5 7.5 0 0 0 15 0m-15 0a7.5 7.5 0 1 1 15 0m-15 0H3m16.5 0H21m-1.5 0H12m0 0V2.25m0 19.5V12M12 12l1.624.812a2.25 2.25 0 0 1 1.104 3.138l-.52 1.04a2.25 2.25 0 0 0 3.138 1.103L18 16.5m-6-4.5-1.624-.812a2.25 2.25 0 0 0-1.104-3.138l.52-1.04A2.25 2.25 0 0 1 6.896 5.55l2.088 1.044m5.52-.492.52-1.04a2.25 2.25 0 0 1 3.138-1.104l1.624.812m0 0M21 12c0 4.142-3.358 7.5-7.5 7.5S6 16.142 6 12s3.358-7.5 7.5-7.5 7.5 3.358 7.5 7.5Zm-7.5 5.25v-2.625M12 6.75V9.375",
  "w-5 h-5"
);
const UsersIcon = createSvgIcon(
  "M15 19.128a9.38 9.38 0 0 0 2.625.372 9.337 9.337 0 0 0 4.121-.952 4.125 4.125 0 0 0-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 0 1 8.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0 1 11.964-3.07M12 6.375a3.375 3.375 0 1 1-6.75 0 3.375 3.375 0 0 1 6.75 0Zm8.25 2.25a2.625 2.625 0 1 1-5.25 0 2.625 2.625 0 0 1 5.25 0Z",
  "w-5 h-5"
);
const ClockIcon = createSvgIcon(
  "M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z",
  "w-5 h-5"
);
const CalendarDaysIcon = createSvgIcon(
  "M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5",
  "w-5 h-5"
);
const BellIcon = createSvgIcon(
  "M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0",
  "w-5 h-5"
);
const ClipboardDocumentListIcon = createSvgIcon(
  "M16.5 8.25V6a2.25 2.25 0 0 0-2.25-2.25H6A2.25 2.25 0 0 0 3.75 6v8.25A2.25 2.25 0 0 0 6 16.5h2.25m8.25-8.25H18a2.25 2.25 0 0 1 2.25 2.25V18A2.25 2.25 0 0 1 18 20.25h-7.5A2.25 2.25 0 0 1 8.25 18v-1.5m8.25-8.25h-6a2.25 2.25 0 0 0-2.25 2.25v6",
  "w-5 h-5"
);
const UserPlusIcon = createSvgIcon("M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0Zm-4 7a7 7 0 0 0-7 7h14a7 7 0 0 0-7-7Zm8-4h-2.001M18 10V8", "w-5 h-5");
const MagnifyingGlassIcon = createSvgIcon("m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z", "w-5 h-5");

// --- Helper Functions ---
const getInitials = (name) => { if (!name) return '??'; const words = name.split(' '); if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase(); return (name.substring(0, 2)).toUpperCase(); };
const formatDuration = (hours, minutes) => { let parts = []; if (hours && parseInt(hours) > 0) parts.push(`${hours} hr${parseInt(hours) > 1 ? 's' : ''}`); if (minutes && parseInt(minutes) > 0) parts.push(`${minutes} mins`); return parts.join(' ') || 'N/A'; };

// --- Options for dropdowns ---
const hoursOptions = Array.from({ length: 13 }, (_, i) => ({ value: i.toString(), label: `${i} Hours` }));
const minutesOptions = Array.from({ length: 12 }, (_, i) => ({ value: (i * 5).toString(), label: `${i * 5} Minutes` }));
const paymentTypeOptions = [
    { value: 'optional', label: 'Optional' },
    { value: 'full_payment', label: 'Full Payment' },
    { value: 'deposit', label: 'Deposit' },
];
const meetingModeOptions = [
    {value: 'online', label: 'Online'},
    {value: 'offline', label: 'Offline'},
    {value: 'phone', label: 'Phone'},
    {value: 'none', label: 'None'},
];


const ConsultingEventDetailPage = () => {
    const { eventId } = useParams();
    const navigate = useNavigate();
    const [eventData, setEventData] = useState(null);
    const [isLoading, setIsLoading] = useState(true); 
    const [error, setError] = useState(null); // For initial fetch error display
    const [activeSection, setActiveSection] = useState('details');
    const [isTopDropdownOpen, setIsTopDropdownOpen] = useState(false);
    const topDropdownRef = useRef(null);

    const [isEditing, setIsEditing] = useState(false); 
    const [formData, setFormData] = useState({}); 

    const [assignedSpecialistsDetails, setAssignedSpecialistsDetails] = useState([]); 
    const [allAvailableSpecialists, setAllAvailableSpecialists] = useState([]); 
    const [isAssignSpecialistPanelOpen, setIsAssignSpecialistPanelOpen] = useState(false);
    const [specialistsToAddNewly, setSpecialistsToAddNewly] = useState(new Set()); 
    const [specialistsSearchTerm, setSpecialistsSearchTerm] = useState('');
    const [isLoadingSpecialists, setIsLoadingSpecialists] = useState(false); 

    const toastConfig = {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: false, // As per your requirement
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "light",
        transition: Bounce,
    };

    const sidebarItems = [
        { id: 'details', Icon: Cog8ToothIcon, title: 'IT Consulting Details', description: 'Set the duration, payment type, and meeting mode.' },
        { id: 'specialists', Icon: UsersIcon, title: 'Assigned IT Specialists', description: 'View IT Specialists who offer this event type.' },
        { id: 'availability', Icon: ClockIcon, title: 'Availability', description: 'Set the date and time for this IT Consulting.' },
        { id: 'schedulingRules', Icon: CalendarDaysIcon, title: 'Scheduling Rules', description: 'Set buffers, notices, and intervals.' },
        { id: 'notifications', Icon: BellIcon, title: 'Notification Preferences', description: 'Configure email, SMS, and calendar notifications.' },
        { id: 'bookingForm', Icon: ClipboardDocumentListIcon, title: 'Booking Form', description: 'Collect customer information during booking.' },
    ];

    const fetchEventDetails = async () => {
        if (!eventId) return;
        setIsLoading(true); setError(null);
        try {
            const response = await fetch(`${BASE_URL}/api/consulting-events/get/${eventId}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            if (result.success && result.data) {
                setEventData(result.data);
                setFormData(result.data);
                
                const specialistsFromServer = result.data.assignedSpecialists || [];
                const validAssignedSpecialists = specialistsFromServer.filter(
                    s => s && typeof s === 'object' && s._id && s.name 
                );
                setAssignedSpecialistsDetails(validAssignedSpecialists);

            } else {
                throw new Error(result.message || 'Failed to fetch event details or data is missing');
            }
        } catch (err) {
            console.error("Failed to fetch event details:", err);
            setError(err.message); // Set error state for display
            toast.error(err.message || "Failed to fetch event details.", toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEventDetails();
    }, [eventId]);

    useEffect(() => {
        const fetchAllSpecialists = async () => {
            setIsLoadingSpecialists(true);
            try {
                const response = await fetch(`${BASE_URL}/api/users/getUsers`); 
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({}));
                    throw new Error(errorData.message || `Failed to fetch available specialists. Status: ${response.status}`);
                }
                const result = await response.json();
                if (result.success && Array.isArray(result.data)) {
                    setAllAvailableSpecialists(result.data);
                } else {
                    console.error("Error fetching all specialists or data is not an array from /api/users/getUsers:", result.message || result);
                    setAllAvailableSpecialists([]);
                    toast.warn("Could not fully load available specialists.", toastConfig);
                }
            } catch (err) {
                console.error("Error in fetchAllSpecialists (api/users/getUsers):", err);
                setAllAvailableSpecialists([]);
                toast.error(err.message || "Failed to load available specialists.", toastConfig);
            } finally {
                setIsLoadingSpecialists(false);
            }
        };

        if (isAssignSpecialistPanelOpen) {
            if (allAvailableSpecialists.length === 0 && !isLoadingSpecialists) {
                 fetchAllSpecialists();
            }
            setSpecialistsToAddNewly(new Set());
        }
    }, [isAssignSpecialistPanelOpen]); 

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (topDropdownRef.current && !topDropdownRef.current.contains(e.target)) {
                setIsTopDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleEditToggle = () => {
        if (!isEditing && eventData) {
            setFormData({ ...eventData });
        } else if (isEditing && eventData) {
            setFormData({...eventData}); // Reset to original if cancelling edit
        }
        setIsEditing(!isEditing);
    };

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSelectChange = (name, selectedValue) => {
        setFormData(prev => ({
            ...prev,
            [name]: selectedValue
        }));
    };

    const handleSaveDetailsForm = async () => {
        setIsLoading(true);
        try {
            const response = await fetch(`${BASE_URL}/api/consulting-events/update/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData) 
            });
            const result = await response.json();
            if (!response.ok || !result.success) {
                throw new Error(result.message || 'Failed to save changes.');
            }
            setEventData(result.data); 
            setFormData(result.data);   
            setIsEditing(false);
            toast.success('Changes saved successfully!', toastConfig);
        } catch (err) {
            console.error("Error saving event details:", err);
            toast.error(err.message || 'Failed to save changes.', toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    const handleToggleSpecialistSelectionInPanel = (specialistId) => {
        setSpecialistsToAddNewly(prev => {
            const newSet = new Set(prev);
            if (newSet.has(specialistId)) newSet.delete(specialistId);
            else newSet.add(specialistId);
            return newSet;
        });
    };

    const handleAssignSpecialistsUpdate = async () => {
        if (!eventData) {
            toast.warn("Event data not loaded. Cannot assign specialists.", toastConfig);
            return;
        }
        setIsLoading(true); 
        try {
            const currentAssignedIds = new Set(
                (eventData.assignedSpecialists || []).map(s => s._id || s.$oid).filter(Boolean)
            );
            const newlySelectedIds = Array.from(specialistsToAddNewly);
            newlySelectedIds.forEach(id => currentAssignedIds.add(id)); // This logic might need review based on whether you allow unassigning.
                                                                        // For now, it only adds. If unassigning is needed, the payload needs to be just the final set.
            const finalAssignedSpecialistIds = Array.from(currentAssignedIds);

            const payload = {
                assignedSpecialists: finalAssignedSpecialistIds 
            };

            const response = await fetch(`${BASE_URL}/api/consulting-events/update/${eventId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const result = await response.json();
            if (!response.ok || !result.success || !result.data) {
                throw new Error(result.message || 'Failed to update specialists or invalid response.');
            }
            
            setEventData(result.data); 
            setFormData(prev => ({...prev, assignedSpecialists: result.data.assignedSpecialists || []}));

            const updatedSpecialistsFromServer = result.data.assignedSpecialists || [];
            const validUpdatedSpecialists = updatedSpecialistsFromServer.filter(
                s => s && typeof s === 'object' && s._id && s.name
            );

            setAssignedSpecialistsDetails(validUpdatedSpecialists);
            setIsAssignSpecialistPanelOpen(false);
            setSpecialistsToAddNewly(new Set());
            toast.success('Specialists updated successfully!', toastConfig);

        } catch (err) {
            console.error("Error assigning specialists:", err);
            toast.error(err.message || 'Failed to update specialists.', toastConfig);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading && !eventData && !isEditing) return <div className="flex justify-center items-center h-screen"><p className="text-xl">Loading event details...</p></div>;
    if (error && !eventData && !isEditing) return <div className="flex justify-center items-center h-screen"><p className="text-xl text-red-500">Initial Load Error: {error}</p></div>; // Display initial load error
    if (!eventData && !isEditing) return <div className="flex justify-center items-center h-screen"><p className="text-xl">No event data found, or event ID is invalid.</p></div>;
    
    const currentDisplayData = eventData || {};
    const currentFormData = formData || {};

    const initials = getInitials((isEditing && activeSection === 'details') ? currentFormData.consultingName : currentDisplayData.consultingName);
    const initialsBgColor = ((isEditing && activeSection === 'details') ? currentFormData.eventType : currentDisplayData.eventType) === 'one-on-one' ? 'bg-indigo-500' : 'bg-gray-400';

    const currentlyAssignedIdsSet = new Set(assignedSpecialistsDetails.map(s => s._id));
    
    const specialistsAvailableForPanel = allAvailableSpecialists.filter(
        availableSpecialist => availableSpecialist._id && !currentlyAssignedIdsSet.has(availableSpecialist._id)
    );

    const filteredPanelSpecialists = specialistsSearchTerm
        ? specialistsAvailableForPanel.filter(specialist =>
            (specialist.name && specialist.name.toLowerCase().includes(specialistsSearchTerm.toLowerCase())) ||
            (specialist.email && specialist.email.toLowerCase().includes(specialistsSearchTerm.toLowerCase()))
          )
        : specialistsAvailableForPanel;


    const renderContent = () => {
        if (activeSection === 'specialists') {
            return (
                <div className="bg-white p-6 md:p-8 rounded-lg shadow min-h-[300px]">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-lg font-semibold text-gray-800">
                            Assigned IT Specialists ({assignedSpecialistsDetails.length})
                        </h2>
                        <button
                            onClick={() => setIsAssignSpecialistPanelOpen(true)}
                            className="flex items-center space-x-2 px-3 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium"
                        >
                            <UserPlusIcon className="w-4 h-4" />
                            <span>Assign IT Specialists</span>
                        </button>
                    </div>
                    { (isLoading && assignedSpecialistsDetails.length === 0 && !eventData) && <p className="text-gray-500">Loading assigned specialists...</p> }
                    { (!isLoading || eventData) && assignedSpecialistsDetails.length === 0 ? (
                        <p className="text-gray-500 text-center py-8">No IT specialists assigned to this event type yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {assignedSpecialistsDetails.map(specialist => (
                                <li key={specialist._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50">
                                    <div className="flex items-center space-x-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${initialsBgColor}`}> {/* Consider a different color or consistent one */}
                                            {getInitials(specialist.name)}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium text-gray-800">{specialist.name || 'N/A'}</p>
                                            <p className="text-xs text-gray-500">{specialist.email || 'N/A'}</p>
                                        </div>
                                    </div>
                                    {/* Add unassign button if needed here */}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>
            );
        }
        else if (activeSection === 'details') {
            if (isEditing) {
            return (
                <div className="bg-white p-6 md:p-8 rounded-lg shadow">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center space-x-4">
                            <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-semibold text-2xl ${initialsBgColor}`}>
                                {initials}
                            </div>
                            <div>
                                <input
                                    type="text"
                                    name="consultingName"
                                    value={currentFormData.consultingName || ''}
                                    onChange={handleInputChange}
                                    className="text-2xl font-semibold text-gray-800 border-b-2 border-gray-300 focus:border-purple-500 outline-none w-full"
                                    placeholder="Event Type Name"
                                />
                            </div>
                        </div>
                        <div className="flex space-x-2">
                            <button onClick={handleSaveDetailsForm} disabled={isLoading} className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium disabled:opacity-50">
                                {isLoading ? 'Saving...' : 'Save'}
                            </button>
                            <button onClick={handleEditToggle} className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm font-medium">
                                Cancel
                            </button>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                        <div>
                            <label className="block text-gray-500 mb-1">Duration</label>
                            <div className="flex space-x-2">
                                <select name="durationHours" value={currentFormData.durationHours || '0'} onChange={handleInputChange} className="form-select flex-1">
                                    {hoursOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                <select name="durationMinutes" value={currentFormData.durationMinutes || '0'} onChange={handleInputChange} className="form-select flex-1">
                                    {minutesOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Price</label>
                            <div className="flex items-center space-x-2">
                                <button type="button" onClick={() => handleSelectChange('priceType', 'paid')} className={`px-3 py-1.5 border rounded-md ${currentFormData.priceType === 'paid' ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-300 hover:border-purple-400'}`}>Paid</button>
                                <button type="button" onClick={() => handleSelectChange('priceType', 'free')} className={`px-3 py-1.5 border rounded-md ${currentFormData.priceType === 'free' ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-300 hover:border-purple-400'}`}>Free</button>
                                {currentFormData.priceType === 'paid' && (
                                    <input type="number" name="priceAmount" value={currentFormData.priceAmount || ''} onChange={handleInputChange} className="form-input w-20 text-right" placeholder="0" min="0" />
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Meeting Mode</label>
                            <select name="meetingMode" value={currentFormData.meetingMode || 'none'} onChange={handleInputChange} className="form-select w-full">
                                {meetingModeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                            </select>
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Visibility</label>
                            <div className="flex space-x-2">
                                <button type="button" onClick={() => handleSelectChange('visibility', 'public')} className={`px-3 py-1.5 border rounded-md ${currentFormData.visibility === 'public' ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-300 hover:border-purple-400'}`}>Public</button>
                                <button type="button" onClick={() => handleSelectChange('visibility', 'private')} className={`px-3 py-1.5 border rounded-md ${currentFormData.visibility === 'private' ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-300 hover:border-purple-400'}`}>Private</button>
                            </div>
                        </div>
                        <div>
                            <label className="block text-gray-500 mb-1">Status</label>
                            <div className="flex space-x-2">
                                <button type="button" onClick={() => handleSelectChange('status', 'active')} className={`px-3 py-1.5 border rounded-md ${currentFormData.status === 'active' ? 'bg-green-500 text-white border-green-500' : 'border-gray-300 hover:border-green-400'}`}>Active</button>
                                <button type="button" onClick={() => handleSelectChange('status', 'inactive')} className={`px-3 py-1.5 border rounded-md ${currentFormData.status === 'inactive' ? 'bg-red-500 text-white border-red-500' : 'border-gray-300 hover:border-red-400'}`}>Inactive</button>
                            </div>
                        </div>
                        {currentFormData.priceType === 'paid' && (
                            <div>
                                <label className="block text-gray-500 mb-1">Payment Option</label>
                                <select name="paymentTypeOption" value={currentFormData.paymentTypeOption || 'optional'} onChange={handleInputChange} className="form-select w-full">
                                    {paymentTypeOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                                </select>
                                {currentFormData.paymentTypeOption === 'deposit' && (
                                     <input type="number" name="depositAmount" value={currentFormData.depositAmount || ''} onChange={handleInputChange} className="form-input w-full mt-2 text-right" placeholder="Deposit Amount" min="0"/>
                                )}
                            </div>
                        )}
                        <div className="md:col-span-2">
                            <label htmlFor="description" className="block text-gray-500 mb-1">Description</label>
                            <textarea id="description" name="description" rows="3" value={currentFormData.description || ''} onChange={handleInputChange} className="form-textarea w-full" placeholder="Add a description for your event..."></textarea>
                        </div>
                         <div className="md:col-span-2">
                            <label htmlFor="zohoAssist" className="flex items-center text-gray-500">
                                <input type="checkbox" id="zohoAssist" name="zohoAssist" checked={!!currentFormData.zohoAssist} onChange={handleInputChange} className="form-checkbox h-4 w-4 text-purple-600 border-gray-300 rounded mr-2"/>
                                Zoho Assist Integrated
                            </label>
                        </div>
                    </div>
                </div>
            );
            } else {
                if (!currentDisplayData || Object.keys(currentDisplayData).length === 0) {
                     return <div className="flex justify-center items-center min-h-[300px]"><p>Loading details...</p></div>;
                }
                return (
                    <div className="bg-white p-6 md:p-8 rounded-lg shadow">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center space-x-4">
                                <div className={`w-16 h-16 rounded-lg flex items-center justify-center text-white font-semibold text-2xl ${initialsBgColor}`}>
                                    {initials}
                                </div>
                                <div><h2 className="text-2xl font-semibold text-gray-800">{currentDisplayData.consultingName}</h2></div>
                            </div>
                            <button onClick={handleEditToggle} className="flex items-center space-x-2 px-4 py-2 border border-purple-600 text-purple-600 rounded-md hover:bg-purple-50 text-sm font-medium">
                                <PencilSquareIcon className="w-4 h-4" /><span>Edit</span>
                            </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6 text-sm">
                            <div><p className="text-gray-500 mb-1">Event Type Name</p><p className="text-gray-800 font-medium">{currentDisplayData.consultingName}</p></div>
                            <div><p className="text-gray-500 mb-1">Duration</p><p className="text-gray-800 font-medium">{formatDuration(currentDisplayData.durationHours, currentDisplayData.durationMinutes)}</p></div>
                            <div><p className="text-gray-500 mb-1">Price</p><p className="text-gray-800 font-medium capitalize">{currentDisplayData.priceType === 'paid' ? `Rs ${currentDisplayData.priceAmount}` : currentDisplayData.priceType || 'Free'}</p></div>
                            <div><p className="text-gray-500 mb-1">Meeting Mode</p><p className="text-gray-800 font-medium capitalize">{currentDisplayData.meetingMode || '-'}</p></div>
                            <div><p className="text-gray-500 mb-1">Visibility</p><p className="text-gray-800 font-medium capitalize">{currentDisplayData.visibility || 'Public'}</p></div>
                            <div><p className="text-gray-500 mb-1">Status</p><p className={`font-medium px-2.5 py-0.5 rounded-full inline-block text-xs ${currentDisplayData.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{currentDisplayData.status ? currentDisplayData.status.charAt(0).toUpperCase() + currentDisplayData.status.slice(1) : 'N/A'}</p></div>
                            {currentDisplayData.priceType === 'paid' && currentDisplayData.paymentTypeOption && (
                                <div><p className="text-gray-500 mb-1">Payment Option</p><p className="text-gray-800 font-medium capitalize">{paymentTypeOptions.find(opt => opt.value === currentDisplayData.paymentTypeOption)?.label || currentDisplayData.paymentTypeOption}</p></div>
                            )}
                            {currentDisplayData.priceType === 'paid' && currentDisplayData.paymentTypeOption === 'deposit' && currentDisplayData.depositAmount && (
                                 <div><p className="text-gray-500 mb-1">Deposit Amount</p><p className="text-gray-800 font-medium">Rs {currentDisplayData.depositAmount}</p></div>
                            )}
                            <div className="md:col-span-2"><p className="text-gray-500 mb-1">Description</p><p className="text-gray-800 font-medium whitespace-pre-wrap">{currentDisplayData.description || '-'}</p></div>
                            <div className="md:col-span-2"><p className="text-gray-500 mb-1">Zoho Assist</p><p className="text-gray-800 font-medium">{currentDisplayData.zohoAssist ? 'Integrated' : 'Not Integrated'}</p></div>
                        </div>
                    </div>
                );
            }
        }
        else {
            const currentSectionDef = sidebarItems.find(item => item.id === activeSection);
            return (
                <div className="bg-white p-6 md:p-8 rounded-lg shadow min-h-[300px] flex items-center justify-center">
                    <p className="text-xl text-gray-500">Content for {currentSectionDef?.title || 'Selected Section'} (Not Implemented)</p>
                </div>
            );
        }
    };
    
    const dataForSidebarHeader = (isEditing && activeSection === 'details') ? currentFormData : currentDisplayData;

    return (
        <div className="min-h-screen bg-gray-100 flex flex-col">
            <div className="bg-white shadow-sm py-3 px-4 md:px-6 flex justify-between items-center sticky top-0 z-20">
            {dataForSidebarHeader && Object.keys(dataForSidebarHeader).length > 0 && dataForSidebarHeader.consultingName && (
                <div className="p-4 hidden md:block"> {/* Adjusted padding here for consistency with sidebar if needed */}
                    <div className="flex items-center space-x-3">
                        <div className={`w-10 h-10 rounded-md flex items-center justify-center text-white font-semibold text-sm ${initialsBgColor}`}>
                            {getInitials(dataForSidebarHeader.consultingName)}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800 truncate max-w-[200px] lg:max-w-[300px]" title={dataForSidebarHeader.consultingName}>
                                {dataForSidebarHeader.consultingName}
                            </h3>
                            <p className="text-xs text-gray-500">{dataForSidebarHeader.eventType ? dataForSidebarHeader.eventType.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('-') : 'N/A'}</p>
                        </div>
                    </div>
                </div>
            )}
                <div className="flex-grow"></div> {/* This will push the right content to the right */}
                <div className="flex items-center space-x-3">
                    <button className="flex items-center space-x-1.5 px-3 py-1.5 border border-gray-300 rounded-md text-xs text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-1 focus:ring-indigo-500">
                        <ShareIcon className="w-4 h-4"/><span>Share</span>
                    </button>
                    <div ref={topDropdownRef} className="relative">
                        <button onClick={() => setIsTopDropdownOpen(prev => !prev)} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                            <EllipsisVerticalIcon />
                        </button>
                        {isTopDropdownOpen && (
                            <div className="origin-top-right absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-30">
                                <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Preview</Link>
                                <Link to="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">Embed</Link>
                                <Link to="#" className="block px-4 py-2 text-sm text-red-600 hover:bg-red-50">Deactivate</Link>
                            </div>
                        )}
                    </div>
                    <button onClick={() => navigate('/calls')} className="p-1.5 rounded-full hover:bg-gray-100 text-gray-500 hover:text-gray-700">
                        <XMarkIcon />
                    </button>
                </div>
            </div>


            <div className="flex-grow flex flex-col md:flex-row p-4 md:p-6 gap-6">
                <div className="w-full md:w-72 lg:w-80 flex-shrink-0 bg-white rounded-lg shadow p-1 md:p-0">
                    <nav className="py-2 md:py-4 px-2 md:px-0"> {/* Adjusted padding for sidebar nav */}
                        <ul>
                            {sidebarItems.map(item => (
                                <li key={item.id}>
                                    <button
                                        onClick={() => {
                                            if (activeSection === 'details' && isEditing) setIsEditing(false); // Cancel edit if switching from details
                                            setActiveSection(item.id);
                                        }}
                                        className={`w-full flex items-start space-x-3 p-3 md:px-4 md:py-3 rounded-md text-left hover:bg-purple-50 group ${
                                            activeSection === item.id ? 'bg-purple-100 text-purple-700 font-semibold' : 'text-gray-700 hover:text-purple-700'
                                        }`}
                                    >
                                        <item.Icon className={`mt-0.5 flex-shrink-0 w-5 h-5 ${activeSection === item.id ? 'text-purple-600' : 'text-gray-400 group-hover:text-purple-600'}`} />
                                        <div className="flex-1">
                                            <span className={`text-sm ${activeSection === item.id ? 'text-purple-700' : 'text-gray-800 group-hover:text-purple-700'}`}>{item.title}</span>
                                            <p className={`text-xs mt-0.5 ${activeSection === item.id ? 'text-purple-600' : 'text-gray-500 group-hover:text-purple-500'}`}>{item.description}</p>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </nav>
                </div>

                <div className="flex-grow">
                    <div className="flex items-center mb-4">
                        <h1 className="text-xl font-semibold text-gray-900">
                            {sidebarItems.find(item => item.id === activeSection)?.title || 'Details'}
                        </h1>
                        {activeSection === 'details' && !isEditing && <InformationCircleIcon className="ml-2 w-5 h-5 text-gray-400" />}
                    </div>
                    {renderContent()}
                </div>
            </div>

            {/* Specialist Assignment Panel */}
            {isAssignSpecialistPanelOpen && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-30 z-30 transition-opacity duration-300 ease-in-out"
                    onClick={() => setIsAssignSpecialistPanelOpen(false)} // Close on overlay click
                >
                    <div
                        className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-40 transform transition-transform duration-300 ease-in-out flex flex-col"
                        style={{ transform: isAssignSpecialistPanelOpen ? 'translateX(0)' : 'translateX(100%)' }}
                        onClick={(e) => e.stopPropagation()} // Prevent close on panel click
                    >
                        <div className="flex justify-between items-center p-4 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-800">Assign IT Specialists</h3>
                            <button onClick={() => setIsAssignSpecialistPanelOpen(false)} className="text-gray-500 hover:text-gray-700 p-1 rounded-full hover:bg-gray-100">
                                <XMarkIcon className="w-5 h-5"/>
                            </button>
                        </div>
                        <div className="p-4 flex-grow overflow-y-auto">
                            <div className="mb-4 relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search unassigned specialists..."
                                    className="form-input w-full pl-10"
                                    value={specialistsSearchTerm}
                                    onChange={(e) => setSpecialistsSearchTerm(e.target.value)}
                                />
                            </div>
                            {isLoadingSpecialists && <p className="text-gray-500 text-center py-4">Loading available specialists...</p>}
                            
                            {!isLoadingSpecialists && allAvailableSpecialists.length === 0 && (
                                <p className="text-gray-500 text-center py-4">No specialists found in the system to assign.</p>
                            )}

                            {!isLoadingSpecialists && allAvailableSpecialists.length > 0 && filteredPanelSpecialists.length === 0 && (
                                <p className="text-gray-500 text-center py-4">
                                    {specialistsSearchTerm 
                                        ? `No unassigned specialists found matching "${specialistsSearchTerm}".` 
                                        : "All available specialists are already assigned."}
                                </p>
                            )}

                            {!isLoadingSpecialists && filteredPanelSpecialists.length > 0 && (
                                <ul className="space-y-2">
                                    {filteredPanelSpecialists.map(specialist => (
                                        <li key={specialist._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-md hover:bg-gray-50 transition-colors">
                                            <div className="flex items-center space-x-3">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm bg-gray-400`}>
                                                    {getInitials(specialist.name)}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-gray-800">{specialist.name}</p>
                                                    <p className="text-xs text-gray-500">{specialist.email}</p>
                                                </div>
                                            </div>
                                            <input
                                                type="checkbox"
                                                className="form-checkbox h-5 w-5 text-purple-600 border-gray-300 rounded focus:ring-purple-500 cursor-pointer"
                                                checked={specialistsToAddNewly.has(specialist._id)}
                                                onChange={() => handleToggleSpecialistSelectionInPanel(specialist._id)}
                                            />
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <div className="p-4 border-t border-gray-200 flex justify-end space-x-3 bg-gray-50">
                            <button
                                onClick={() => setIsAssignSpecialistPanelOpen(false)}
                                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 text-sm font-medium"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAssignSpecialistsUpdate}
                                disabled={isLoading || specialistsToAddNewly.size === 0} 
                                className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 text-sm font-medium disabled:opacity-50 flex items-center"
                            >
                                {isLoading && !isLoadingSpecialists ? ( // Show spinner only if the main loading state is true and specialist list isn't loading
                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                ) : null}
                                {(isLoading && !isLoadingSpecialists) ? 'Assigning...' : `Assign (${specialistsToAddNewly.size})`}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ConsultingEventDetailPage;