// src/Pages/NewConsulting.js
import React from 'react';
import { useNavigate } from 'react-router-dom';

// --- SVG Icon Components ---
const OneOnOneIconSVG = ({ className = "w-9 h-9 text-purple-600" }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <circle cx="7" cy="9.5" r="2.5" /> <path d="M7 12.5C4.79086 12.5 3 14.2909 3 16.5V17.5H11V16.5C11 14.2909 9.20914 12.5 7 12.5Z" /> <circle cx="17" cy="9.5" r="2.5" opacity="0.6" /> <path d="M17 12.5C14.7909 12.5 13 14.2909 13 16.5V17.5H21V16.5C21 14.2909 19.2091 12.5 17 12.5Z" opacity="0.6" /> <rect x="5" y="11.5" width="14" height="1.5" rx="0.75" fill="currentColor" opacity="0.4" /> </svg> );
const GroupBookingIconSVG = ({ className = "w-9 h-9 text-purple-600" }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> <circle cx="12" cy="5" r="2.5" /> <path d="M12 7.5C9.79086 7.5 8 9.29086 8 11.5V12H16V11.5C16 9.29086 14.2091 7.5 12 7.5Z" /> <path d="M12 12V13.5M12 13.5L8.5 15M12 13.5L15.5 15" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/> {[6, 12, 18].map(cx => ( <React.Fragment key={cx}> <circle cx={cx} cy="17.5" r="1.5" opacity="0.7" /> <path d={`M${cx} 19c-0.8284 0-1.5 0.6716-1.5 1.5v0.5h3V20.5c0-0.8284-0.6716-1.5-1.5-1.5Z`} opacity="0.7" /> </React.Fragment> ))} </svg> );
const CollectiveBookingIconSVG = ({ className = "w-9 h-9 text-purple-600" }) => ( <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg"> {[6, 12, 18].map(cx => ( <React.Fragment key={cx}> <circle cx={cx} cy="6.5" r="1.5" opacity="0.7" /> <path d={`M${cx} 8c-0.8284 0-1.5 0.6716-1.5 1.5v0.5h3V9.5c0-0.8284-0.6716-1.5-1.5-1.5Z`} opacity="0.7" /> </React.Fragment> ))} <path d="M8.5 11L12 12.5M15.5 11L12 12.5M12 12.5V14" stroke="currentColor" strokeWidth="1" strokeLinecap="round"/> <circle cx="12" cy="16.5" r="2.5" /> <path d="M12 19C9.79086 19 8 20.7909 8 23V23.5H16V23C16 20.7909 14.2091 19 12 19Z" /> </svg> );
const ResourceIconSVG = ({ className = "w-9 h-9 text-purple-600" }) => ( <svg className={className} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"> <rect x="3" y="6" width="18" height="10" rx="1.5" fill="currentColor" opacity="0.4"/> <rect x="8" y="17" width="8" height="1.5" rx="0.75" fill="currentColor" /> </svg> );
const InfoIconSVG = ({ className = "w-4 h-4 text-gray-400" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path> </svg> );
const CloseIconSVG = ({ className = "w-6 h-6 text-gray-500" }) => ( <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" xmlns="http://www.w3.org/2000/svg"> <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /> </svg> );

// --- Data for Consulting Options ---
const consultingOptionsData = [
  { id: 'one-on-one', icon: <OneOnOneIconSVG />, title: 'One-on-One', description: 'Ideal for support calls, client meetings, and any one-to-one meetings.', showButtons: true, },
  { id: 'group', icon: <GroupBookingIconSVG />, title: 'Group Booking', description: 'Ideal for workshops, webinars, and classes.', showButtons: true, },
  { id: 'collective', icon: <CollectiveBookingIconSVG />, title: 'Collective Booking', description: 'Ideal for panel interviews, board meetings, and any many-to-one meetings.', showButtons: true, },
  { id: 'resource', icon: <ResourceIconSVG />, title: 'Resource', description: 'Ideal for conference room bookings and equipment rentals.', showButtons: false, },
];

/**
 * ConsultingOptionCard component displays a single consulting type option.
 * @param {object} props - Component props.
 * @param {React.ReactNode} props.icon - Icon for the card.
 * @param {string} props.title - Title of the consulting option.
 * @param {string} props.description - Description of the option.
 * @param {boolean} props.showButtons - Whether to show "One Time" / "Recurring" buttons.
 * @param {string} props.id - Identifier for the option.
 * @param {(id: string) => void} props.onOneTimeClick - Handler for "One Time" button.
 * @param {(id: string) => void} props.onRecurringClick - Handler for "Recurring" button.
 * @param {(id: string) => void} props.onDirectNavigate - Handler for direct navigation (e.g., "Configure").
 */
const ConsultingOptionCard = ({ icon, title, description, showButtons, id, onOneTimeClick, onRecurringClick, onDirectNavigate }) => {
  return (
    <div className="bg-white p-6 shadow-lg rounded-xl flex items-start space-x-5 hover:shadow-xl transition-shadow duration-200">
      <div className="bg-purple-50 p-3.5 rounded-lg flex-shrink-0 mt-1">
        {React.cloneElement(icon, { className: "w-9 h-9 text-purple-600" })}
      </div>
      <div className="flex-1">
        <div className="flex items-center">
          <h2 className="text-lg font-semibold text-gray-800">{title}</h2>
          <InfoIconSVG className="w-4 h-4 text-gray-400 ml-1.5" />
        </div>
        <p className="text-sm text-gray-600 mt-1.5 leading-relaxed">{description}</p>
        {showButtons && (
          <div className="mt-5 flex flex-wrap gap-3">
            <button
              onClick={() => onOneTimeClick(id)}
              className="px-5 py-2 border border-purple-300 text-purple-700 text-sm font-medium rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors"
            >
              One Time
            </button>
            <button
              onClick={() => onRecurringClick(id)}
              className="px-5 py-2 border border-purple-300 text-purple-700 text-sm font-medium rounded-md hover:bg-purple-50 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors"
            >
              Recurring
            </button>
          </div>
        )}
        {!showButtons && (
            <div className="mt-5">
                 <button
                    onClick={() => onDirectNavigate(id)}
                    className="px-5 py-2 bg-purple-600 text-white text-sm font-medium rounded-md hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-opacity-50 transition-colors"
                >
                    Configure
                </button>
            </div>
        )}
      </div>
    </div>
  );
};

/**
 * NewConsulting page component for selecting the type of IT Consulting event to create.
 */
const NewConsulting = () => {
  const navigate = useNavigate();

  /**
   * Handles click on "One Time" button for an option.
   * @param {string} optionId - The ID of the selected consulting option.
   */
  const handleOneTimeClick = (optionId) => {
    console.log(`One Time clicked for: ${optionId}`);
    navigate(`/create-event/${optionId}/one-time`);
  };

  /**
   * Handles click on "Recurring" button for an option.
   * @param {string} optionId - The ID of the selected consulting option.
   */
  const handleRecurringClick = (optionId) => {
    console.log(`Recurring clicked for: ${optionId}`);
    navigate(`/create-event/${optionId}/recurring`);
  };

  /**
   * Handles direct navigation for options without "One Time"/"Recurring" choices (e.g., Resource).
   * @param {string} optionId - The ID of the selected consulting option.
   */
  const handleDirectNavigate = (optionId) => {
    console.log(`Direct navigate for: ${optionId}`);
    // For 'resource', it's treated as 'one-time' for the initial form setup.
    navigate(`/create-event/${optionId}/one-time`);
  };

  /**
   * Handles closing the NewConsulting selection page.
   */
  const handleClose = () => {
    navigate('/calls'); // Navigate back to the main calls/events list page
    console.log("Closing NewConsulting selection page");
  };

  return (
    <div className="min-h-screen bg-slate-50 py-10 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8 px-1">
          <h1 className="text-2xl font-semibold text-gray-900">Create New IT Consulting</h1>
          <button
            onClick={handleClose}
            aria-label="Close"
            className="p-1 rounded-full hover:bg-gray-200 transition-colors"
          >
            <CloseIconSVG className="w-6 h-6 text-gray-500 hover:text-gray-700" />
          </button>
        </div>

        {/* Options List */}
        <div className="space-y-5">
          {consultingOptionsData.map(option => (
            <ConsultingOptionCard
              key={option.id}
              {...option}
              onOneTimeClick={handleOneTimeClick}
              onRecurringClick={handleRecurringClick}
              onDirectNavigate={handleDirectNavigate}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default NewConsulting;