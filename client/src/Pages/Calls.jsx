// src/Pages/Calls.js (or ITConsultingListPage.js)
import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
// import axios from 'axios'; // If you prefer axios
import { BASE_URL } from '../BaseUrl'; // Ensure this path is correct
import { toast,Bounce} from 'react-toastify';
// --- SVG Icon Helper ---
const createSvgIcon = (pathContent, defaultClasses, viewBox = "0 0 24 24", fill = "none", strokeWidth = "1.5") => {
  return ({ className: propClassName = '' }) => (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={viewBox}
      fill={fill}
      strokeWidth={fill === 'none' ? strokeWidth : undefined}
      stroke={fill === 'none' ? "currentColor" : undefined}
      className={`${defaultClasses} ${propClassName}`}
    >
      {pathContent}
    </svg>
  );
};

// --- SVG Icons ---
const SearchIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-5 h-5 text-gray-400"> <path strokeLinecap="round" strokeLinejoin="round" d="m21 21-5.197-5.197m0 0A7.5 7.5 0 1 0 5.196 5.196a7.5 7.5 0 0 0 10.607 10.607Z" /> </svg> );
const ShareIcon = ({ className: propClassName = '' }) => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className={`w-4 h-4 ${propClassName}`}> <path strokeLinecap="round" strokeLinejoin="round" d="M7.217 10.907a2.25 2.25 0 1 0 0 4.5 2.25 2.25 0 0 0 0-4.5ZM11.94 12.133L7.217 10.907m0 4.5l4.723-1.226m0 0a2.25 2.25 0 1 0 4.5 0 2.25 2.25 0 0 0-4.5 0ZM11.94 12.133l4.723 1.226M11.94 12.133A2.25 2.25 0 1 0 11.94 12.133Zm2.25-1.226a2.25 2.25 0 1 0 0-4.5 2.25 2.25 0 0 0 0 4.5Z" /> </svg> );
const UserPlaceholderIconSolid = () => ( <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-7 h-7 text-gray-400 hover:text-gray-500"> <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653ZM12 15a3 3 0 100-6 3 3 0 000 6Z" clipRule="evenodd" /> </svg> );
const ChevronDownIcon = () => ( <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-4 h-4 text-gray-500 hover:text-gray-700 cursor-pointer"> <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" /> </svg> );
const EllipsisVerticalIcon = createSvgIcon( <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 12.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5ZM12 18.75a.75.75 0 1 1 0-1.5.75.75 0 0 1 0 1.5Z" />, "w-5 h-5" );
const PencilSquareIcon = createSvgIcon( <path strokeLinecap="round" strokeLinejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10" />, "w-4 h-4" );
const LinkIcon = createSvgIcon( <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />, "w-4 h-4" );
const DocumentDuplicateIcon = createSvgIcon( <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 0 1-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 0 1 1.5.124m7.5 10.376H3.375M15.75 17.25H18v-9.75A2.25 2.25 0 0 0 15.75 5.25H5.25A2.25 2.25 0 0 0 3 7.5v9.75c0 1.242 1.008 2.25 2.25 2.25H15.75Z" />, "w-4 h-4" );
const ArrowPathIcon = createSvgIcon( <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 0 0-3.7-3.7 4.875 4.875 0 0 0-7.324 0 4.006 4.006 0 0 0-3.7 3.7c-.092 1.209-.138 2.43-.138 3.662a4.006 4.006 0 0 0 3.7 3.7 4.875 4.875 0 0 0 7.324 0 4.006 4.006 0 0 0 3.7-3.7Zm-16.5 0c0-2.485 2.015-4.5 4.5-4.5h7.5c2.485 0 4.5 2.015 4.5 4.5s-2.015 4.5-4.5 4.5h-7.5c-2.485 0-4.5-2.015-4.5-4.5Z" />, "w-4 h-4" );
const TrashIcon = createSvgIcon( <path fillRule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 01-.22 1.196h-.064c-.336.092-.673.183-.998.273V18a2.25 2.25 0 01-2.25 2.25H8.25A2.25 2.25 0 016 18V6.173c-.325-.09-.662-.181-.998-.273h-.063a48.816 48.816 0 01-.22-1.196V4.478h11.476zM18 3a.75.75 0 00-.75-.75H6.75A.75.75 0 006 3v.227c0 .061.007.121.021.181L6.02 4.97A25.032 25.032 0 004.044 6H3.75A.75.75 0 003 6.75v1.5c0 .414.336.75.75.75h16.5a.75.75 0 00.75-.75v-1.5a.75.75 0 00-.75-.75h-.294c-.681-.422-1.322-.907-1.906-1.435L18.02 3.408A.722.722 0 0018 3.227V3z" clipRule="evenodd" />, "w-4 h-4", "0 0 24 24", "currentColor" );
const XMarkIcon = createSvgIcon( <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />, "w-6 h-6" );
const ClipboardDocumentIcon = createSvgIcon( <path strokeLinecap="round" strokeLinejoin="round" d="M15.666 3.888A2.25 2.25 0 0013.5 2.25h-3c-1.03 0-1.9.693-2.166 1.638m7.332 0c.055.194.084.4.084.612v3.75m0 0a2.25 2.25 0 01-2.25 2.25h-1.5a2.25 2.25 0 01-2.25-2.25V6.75m0 0A2.25 2.25 0 006.75 4.5h-3A2.25 2.25 0 001.5 6.75v10.5A2.25 2.25 0 003.75 21h10.5a2.25 2.25 0 002.25-2.25V6.75a2.25 2.25 0 00-2.25-2.25H13.5m0 0V3.375c0-.621-.504-1.125-1.125-1.125h-1.5c-.621 0-1.125.504-1.125 1.125V4.5m0 0h3.75m-3.75 0a2.25 2.25 0 00-2.25 2.25V21m0 0h12.75m-12.75 0H3.75M17.25 6H21m-3.75 0v10.75M17.25 6a2.25 2.25 0 012.25 2.25v7.5a2.25 2.25 0 01-2.25 2.25H6.75" />, "w-5 h-5" );
const CheckIcon = createSvgIcon( <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />, "w-5 h-5" );

// --- Helper Functions ---
const getInitials = (name) => { if (!name) return '??'; const words = name.split(' '); if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase(); return (name.substring(0, 2)).toUpperCase(); };
const formatEventType = (eventType, bookingCadence) => { let typeText = ""; if (eventType === 'one-on-one') typeText = "One-on-One"; else if (eventType === 'group') typeText = "Group Booking"; else if (eventType === 'collective') typeText = "Collective Booking"; else if (eventType === 'resource') typeText = "Resource"; return `${typeText}${bookingCadence === 'recurring' ? ' (Recurring)' : ''}`; };
const formatDuration = (hours, minutes) => { let parts = []; if (hours && parseInt(hours) > 0) parts.push(`${hours} hr${parseInt(hours) > 1 ? 's' : ''}`); if (minutes && parseInt(minutes) > 0) parts.push(`${minutes} mins`); return parts.join(' ') || 'N/A'; };

// --- ShareModal Component --- (Copied from previous response)
const ShareModal = ({ isOpen, onClose, event }) => {
    const [activeTab, setActiveTab] = useState('link');
    const [linkCopied, setLinkCopied] = useState(false);
    const [embedCopied, setEmbedCopied] = useState(false);

    if (!isOpen || !event) return null;

    const initials = getInitials(event.consultingName);
    let initialsBgColor = 'bg-gray-400';
    if (event.eventType === 'one-on-one') initialsBgColor = 'bg-indigo-500';
    else if (event.eventType === 'group') initialsBgColor = 'bg-emerald-400';
    else if (event.eventType === 'collective') initialsBgColor = 'bg-rose-500';
    else if (event.eventType === 'resource') initialsBgColor = 'bg-amber-500';


    const shareLink = `${window.location.origin}/booking-page/${event._id}`; // Example link
    const embedCode = `<iframe width="100%" height="750px" src="${window.location.origin}/calls/embed/${event._id}" frameborder="0" allowfullscreen></iframe>`;

    const copyToClipboard = (textToCopy, type) => {
        navigator.clipboard.writeText(textToCopy).then(() => {
            if (type === 'link') {
                setLinkCopied(true);
                setTimeout(() => setLinkCopied(false), 2000);
            } else if (type === 'embed') {
                setEmbedCopied(true);
                setTimeout(() => setEmbedCopied(false), 2000);
            }
        }).catch(err => {
            console.error('Failed to copy: ', err);
            toast.error('Failed to copy. Please copy manually.', {
                position: "top-right",
                autoClose: 5000,
                hideProgressBar: false,
                closeOnClick: false,
                pauseOnHover: true,
                draggable: true,
                progress: undefined,
                theme: "light",
                transition: Bounce,
                });
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ease-in-out" onClick={onClose}>
            <div
                className="bg-white rounded-lg shadow-xl w-full max-w-xl overflow-hidden transform transition-all duration-300 ease-in-out scale-100" // max-w-xl for a bit wider modal
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-800">Share Booking Link</h3>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
                        <XMarkIcon />
                    </button>
                </div>
                <div className="p-6 space-y-6">
                    <div className="flex items-start space-x-3 p-3 bg-gray-50 rounded-md">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${initialsBgColor} flex-shrink-0`}>
                            {initials}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-gray-800 truncate">{event.consultingName}</h4>
                            <p className="text-xs text-gray-500">
                                {formatDuration(event.durationHours, event.durationMinutes)} | {formatEventType(event.eventType, event.bookingCadence)}
                            </p>
                        </div>
                    </div>
                    <div className="flex border-b border-gray-200">
                        <button
                            onClick={() => setActiveTab('link')}
                            className={`py-2 px-4 text-sm font-medium focus:outline-none ${activeTab === 'link' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Share Link
                        </button>
                        <button
                            onClick={() => setActiveTab('embed')}
                            className={`py-2 px-4 text-sm font-medium focus:outline-none ${activeTab === 'embed' ? 'border-b-2 border-purple-600 text-purple-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Embed as Widget
                        </button>
                    </div>
                    <div>
                        {activeTab === 'link' && (
                            <div className="space-y-3">
                                <input
                                    type="text"
                                    readOnly
                                    value={shareLink}
                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button
                                    onClick={() => copyToClipboard(shareLink, 'link')}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 flex items-center justify-center border border-purple-300" // Adjusted button style
                                >
                                    {linkCopied ? <CheckIcon className="mr-2 text-green-500" /> : <ClipboardDocumentIcon className="mr-2" />}
                                    {linkCopied ? 'Link Copied!' : 'Copy Link'}
                                </button>
                            </div>
                        )}
                        {activeTab === 'embed' && (
                            <div className="space-y-3">
                                <textarea
                                    readOnly
                                    value={embedCode}
                                    rows="4"
                                    className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700 font-mono focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                                />
                                <button
                                    onClick={() => copyToClipboard(embedCode, 'embed')}
                                    className="px-4 py-2 bg-purple-100 text-purple-700 text-sm font-medium rounded-md hover:bg-purple-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-1 flex items-center justify-center border border-purple-300" // Adjusted button style
                                >
                                    {embedCopied ? <CheckIcon className="mr-2 text-green-500" /> : <ClipboardDocumentIcon className="mr-2" />}
                                    {embedCopied ? 'Code Copied!' : 'Copy Code'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};


/**
 * EventCard component
 */
const EventCard = ({ event }) => {
    const [isCardHovered, setIsCardHovered] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [isShareModalOpen, setIsShareModalOpen] = useState(false); // State for Share Modal
    const [selectedEventForModal, setSelectedEventForModal] = useState(null); // To pass correct event to modal

    const dropdownContainerRef = useRef(null);
    const hoverTimeoutRef = useRef(null);

    const initials = getInitials(event.consultingName);
    let initialsBgColor = 'bg-gray-400';
    if (event.eventType === 'one-on-one') initialsBgColor = 'bg-indigo-500';
    else if (event.eventType === 'group') initialsBgColor = 'bg-emerald-400';
    else if (event.eventType === 'collective') initialsBgColor = 'bg-rose-500';
    else if (event.eventType === 'resource') initialsBgColor = 'bg-amber-500';

    const toggleDropdownOnClick = () => setIsDropdownOpen(prev => !prev);
    const openDropdownOnHover = () => { clearTimeout(hoverTimeoutRef.current); setIsDropdownOpen(true); };
    const closeDropdownWithDelay = () => { hoverTimeoutRef.current = setTimeout(() => setIsDropdownOpen(false), 200); };

    const openShareModal = (e) => {
        e.preventDefault(); // Prevent Link navigation if share button is inside it
        e.stopPropagation();
        setSelectedEventForModal(event); // Set the current event
        setIsShareModalOpen(true);
        setIsDropdownOpen(false); // Close dropdown if open
    };

    const handleActionClick = (action) => {
        setIsDropdownOpen(false); // Close dropdown first
        if (action === 'Share') {
            setSelectedEventForModal(event);
            setIsShareModalOpen(true);
        } else {
            console.log(`${action} clicked for event: ${event.consultingName}`);
            // Handle other actions like Edit, Delete etc.
        }
    };

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownContainerRef.current && !dropdownContainerRef.current.contains(e.target)) {
                setIsDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => {
            document.removeEventListener("mousedown", handleClickOutside);
            clearTimeout(hoverTimeoutRef.current);
        };
    }, []);

    // Determine if the standalone Share button should be shown
    // Show for 'acccc' and 'Project Meeting' as per your first image example,
    // but not for 'accc Copy' which uses the dropdown.
    // This logic might need to be more dynamic based on your data.
    const showStandaloneShareButton = ['acccc', 'Project Meeting'].includes(event.consultingName);


    return (
        <>
            <div // Changed Link to div to manage click events more carefully
                className="block bg-white border border-gray-200 rounded-lg shadow-sm p-4 hover:shadow-md transition-shadow duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-opacity-50 relative"
                onMouseEnter={() => setIsCardHovered(true)}
                onMouseLeave={() => setIsCardHovered(false)}
            >
                <div className="flex flex-col justify-between h-full">
                    <div>
                        <div className="flex items-start justify-between mb-3">
                            <Link to={`/consulting-details/${event._id}`} className="flex items-start space-x-3 flex-1 min-w-0 group">
                                <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold text-sm ${initialsBgColor} flex-shrink-0`}>
                                    {initials}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="text-base font-semibold text-gray-800 group-hover:text-purple-600 leading-tight truncate" title={event.consultingName}>
                                        {event.consultingName}
                                    </h3>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {formatDuration(event.durationHours, event.durationMinutes)} | {formatEventType(event.eventType, event.bookingCadence)}
                                    </p>
                                </div>
                            </Link>

                            <div
                                ref={dropdownContainerRef}
                                className="relative flex-shrink-0 ml-2"
                                onMouseEnter={openDropdownOnHover}
                                onMouseLeave={closeDropdownWithDelay}
                            >
                                {(isCardHovered || isDropdownOpen) && !showStandaloneShareButton && ( // Only show 3-dots if not showing standalone share
                                    <button
                                        type="button"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); toggleDropdownOnClick(); }}
                                        className="p-1.5 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                                        aria-haspopup="true" aria-expanded={isDropdownOpen} aria-label="Options"
                                    >
                                        <EllipsisVerticalIcon className="text-gray-500" />
                                    </button>
                                )}
                                {isDropdownOpen && !showStandaloneShareButton && (
                                    <div
                                        className="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none py-1 z-20"
                                        onClick={(e) => { e.preventDefault(); e.stopPropagation(); }}
                                    >
                                        <button onClick={() => handleActionClick('Edit')} className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                                            <PencilSquareIcon className="mr-3 text-gray-500 group-hover:text-gray-600" /> Edit
                                        </button>
                                        <button onClick={() => handleActionClick('Booking page')} className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                                            <LinkIcon className="mr-3 text-gray-500 group-hover:text-gray-600" /> Booking page
                                        </button>
                                        <button onClick={() => handleActionClick('Make a copy')} className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                                            <DocumentDuplicateIcon className="mr-3 text-gray-500 group-hover:text-gray-600" /> Make a copy
                                        </button>
                                        <button onClick={() => handleActionClick('Move')} className="group flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900">
                                            <ArrowPathIcon className="mr-3 text-gray-500 group-hover:text-gray-600" /> Move
                                        </button>
                                        <div className="my-1 h-px bg-gray-200"></div>
                                        <button onClick={() => handleActionClick('Delete')} className="group flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 hover:text-red-700">
                                            <TrashIcon className="mr-3 text-red-500 group-hover:text-red-600" /> Delete
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="min-h-[40px] mb-1 text-xs text-gray-600 space-y-1">
                            {/* Logic for displaying UserPlaceholderIconSolid or assignedSpecialists from your first image */}
                            {(event.consultingName === 'accc Copy' || event.consultingName === 'acccc') && !event.assignedSpecialists?.length && (
                                <div className="flex -space-x-2 overflow-hidden mt-2">
                                    <UserPlaceholderIconSolid />
                                    <UserPlaceholderIconSolid />
                                </div>
                            )}
                            {event.consultingName === 'Project Meeting' && event.assignedSpecialists?.length === 1 && (
                                <div className="flex items-center space-x-1.5 mt-2">
                                    <UserPlaceholderIconSolid />
                                    <span className="text-xs text-gray-700">{event.assignedSpecialists[0].name}</span>
                                </div>
                            )}

                            {/* Original specialist display logic if placeholders above don't apply */}
                            {event.assignedSpecialists && event.assignedSpecialists.length > 0 && 
                             !((event.consultingName === 'Project Meeting' && event.assignedSpecialists?.length === 1)) && // Avoid double display
                            (
                                <div className="mt-1">
                                    <p className="font-medium">Specialists:</p>
                                    <ul className="list-disc list-inside pl-1">
                                        {event.assignedSpecialists.slice(0, 2).map(specialist => (
                                            <li key={specialist._id} className="truncate" title={specialist.name}>{specialist.name}</li>
                                        ))}
                                        {event.assignedSpecialists.length > 2 && (
                                            <li className="text-gray-500">...and {event.assignedSpecialists.length - 2} more</li>
                                        )}
                                    </ul>
                                </div>
                            )}
                            {/* Other event specific details */}
                            {event.eventType === 'group' && event.numberOfSeats && (<p>Seats: {event.numberOfSeats}</p>)}
                        </div>
                    </div>
                    <button
          onClick={() => handleActionClick('Share')}
          className="absolute bottom-2 right-2 bg-purple-600 text-white px-2 py-1 rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          <ShareIcon className="w-4 h-4 inline-block mr-1" /> Share
        </button>
                    {/* Standalone Share Button */}
                    {showStandaloneShareButton && (
                        <div className="mt-auto pt-2 flex justify-end">
                            <button
                                onClick={openShareModal}
                                className="inline-flex items-center px-2.5 py-1 border border-gray-300 shadow-sm text-xs font-medium rounded text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500"
                            >
                                <ShareIcon className="mr-1.5" /> Share
                            </button>
                        </div>
                    )}
                </div>
            </div>
            {selectedEventForModal && (
                 <ShareModal
                    isOpen={isShareModalOpen}
                    onClose={() => { setIsShareModalOpen(false); setSelectedEventForModal(null); }}
                    event={selectedEventForModal}
                />
            )}
        </>
    );
};

/**
 * MainContent component
 */
const MainContent = () => {
    const [consultingEvents, setConsultingEvents] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");

    // Adjusted dummy data to better reflect the image scenarios for testing Share button logic
    const initialDummyEvents = [
        { _id: 'c1', consultingName: 'accc Copy', durationMinutes: '30', eventType: 'one-on-one', bookingCadence: 'one-time' /* No assignedSpecialists to show placeholders, 3-dot menu */ },
        { _id: 'c2', consultingName: 'acccc', durationMinutes: '30', eventType: 'one-on-one', bookingCadence: 'one-time' /* No assignedSpecialists to show placeholders, standalone Share */ },
        { _id: 'c3', consultingName: 'Project Meeting', durationMinutes: '30', eventType: 'one-on-one', bookingCadence: 'one-time', assignedSpecialists: [{ _id: 's1', name: 'Ali Iqbal' }] /* Standalone Share */ },
        // ... your other original dummy data ...
        { _id: 's4', consultingName: 'Tech Strategy Session', durationHours: '1', durationMinutes: '30', eventType: 'one-on-one', bookingCadence: 'one-time', meetingMode: 'online', priceType: 'paid', priceAmount: '150', assignedSpecialists: [{ _id: 's1a', name: 'Alice Wonderland' }, { _id: 's2b', name: 'Bob The Builder' }] },
        { _id: 's5', consultingName: 'Recurring Support Call', durationMinutes: '45', eventType: 'one-on-one', bookingCadence: 'recurring', meetingMode: 'phone', priceType: 'free', assignedSpecialists: [{ _id: 's1c', name: 'Alice Wonderland' }, { _id: 's4d', name: 'Diana Prince' }, { _id: 's5e', name: 'Edward Scissorhands' }, {_id: 's6f', name: 'Frank Castle'}] },
    ];


    useEffect(() => {
        const fetchEvents = async () => {
            setIsLoading(true);
            setError(null);
            try {
                const response = await fetch(`${BASE_URL}/api/consulting-events/get`);
                if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
                const result = await response.json();
                if (result.success && result.data?.length) {
                    setConsultingEvents(result.data);
                } else {
                    console.warn(result.message || 'API did not return success or data, using dummy data.');
                    setConsultingEvents(initialDummyEvents);
                }
            } catch (err) {
                console.error("Failed to fetch events:", err);
                setError(err.message + " - Using dummy data as fallback.");
                 setConsultingEvents(initialDummyEvents);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEvents();
    }, []);

    const filteredEvents = consultingEvents.filter(event =>
        event.consultingName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        event.eventType.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (event.assignedSpecialists && event.assignedSpecialists.some(s => s.name.toLowerCase().includes(searchTerm.toLowerCase())))
    );

    return (
        <div className="p-6 bg-slate-50 min-h-screen">
            <div className="flex flex-wrap justify-between items-center mb-6 gap-4">
                <div className="flex items-center space-x-1 cursor-pointer">
                    <h2 className="text-xl font-semibold text-gray-800">All IT Consulting</h2> {/* Changed to All as per image */}
                    <span className="text-lg text-gray-500 font-medium">({filteredEvents.length})</span>
                    <ChevronDownIcon />
                </div>
                <div className="flex items-center space-x-3 sm:space-x-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIcon /></div>
                        <input
                            type="text"
                            placeholder="Search IT Consulting"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full sm:w-56 pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-400 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                    <div className="flex items-center border border-gray-300 rounded-md">
                        <button aria-label="Grid view" className="p-1.5 border-r border-gray-300 text-gray-500 hover:bg-gray-100 focus:outline-none focus:bg-purple-100 focus:text-purple-600 rounded-l-md">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M4.25 2A2.25 2.25 0 002 4.25v2.5A2.25 2.25 0 004.25 9h2.5A2.25 2.25 0 009 6.75v-2.5A2.25 2.25 0 006.75 2h-2.5zm0 9A2.25 2.25 0 002 13.25v2.5A2.25 2.25 0 004.25 18h2.5A2.25 2.25 0 009 15.75v-2.5A2.25 2.25 0 006.75 11h-2.5zm9-9A2.25 2.25 0 0011 4.25v2.5A2.25 2.25 0 0013.25 9h2.5A2.25 2.25 0 0018 6.75v-2.5A2.25 2.25 0 0015.75 2h-2.5zm0 9A2.25 2.25 0 0011 13.25v2.5A2.25 2.25 0 0013.25 18h2.5A2.25 2.25 0 0018 15.75v-2.5A2.25 2.25 0 0015.75 11h-2.5z" clipRule="evenodd" /></svg>
                        </button>
                        <button aria-label="List view" className="p-1.5 bg-purple-100 text-purple-600 hover:bg-gray-100 focus:outline-none rounded-r-md">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5"><path fillRule="evenodd" d="M2 4.75A.75.75 0 012.75 4h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 4.75zm0 10.5a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75a.75.75 0 01-.75-.75zM2 10a.75.75 0 01.75-.75h14.5a.75.75 0 010 1.5H2.75A.75.75 0 012 10z" clipRule="evenodd" /></svg>
                        </button>
                    </div>
                    <Link
                        to="/new-consulting"
                        className="bg-purple-600 text-white px-3 py-1.5 rounded-md hover:bg-purple-700 text-sm font-medium flex items-center space-x-1.5 whitespace-nowrap"
                    >
                        <span className="text-xl font-semibold leading-none">+</span>
                        <span>New IT Consulting</span>
                    </Link>
                </div>
            </div>
            {isLoading && <p className="text-center text-gray-600 py-8">Loading events...</p>}
            {error && !isLoading && <p className="text-center text-red-500 py-8">Error: {error}</p>}
            {!isLoading && !error && filteredEvents.length === 0 && (
                <p className="text-center text-gray-600 py-8">
                    {searchTerm ? `No consulting events found for "${searchTerm}".` : "No consulting events found."}
                </p>
            )}
            {!isLoading && filteredEvents.length > 0 && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"> {/* Adjusted to 3 columns */}
                    {filteredEvents.map((event) => (
                        <EventCard key={event._id} event={event} />
                    ))}
                </div>
            )}
        </div>
    );
};

const Calls = () => <MainContent />;
export default Calls;