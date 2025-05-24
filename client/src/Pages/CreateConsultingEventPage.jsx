// src/Pages/CreateConsultingEventPage.js
import React, { useState, useEffect, useCallback, useRef } from 'react'; // Added useRef
import { useParams, useNavigate } from 'react-router-dom';
import { BASE_URL } from '../BaseUrl';
import { toast,Bounce} from 'react-toastify';
// --- SVG Icons ---
const CameraIcon = ({ className = "w-10 h-10 text-purple-600" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"> <path d="M2 6a2 2 0 012-2h1.172a2 2 0 011.414.586l.828.828A2 2 0 009.172 6H10.5a2 2 0 012 2v3.5H11a.5.5 0 000 1h1.5V14a2 2 0 01-2 2H4a2 2 0 01-2-2V6zm5 4a2 2 0 100-4 2 2 0 000 4z"></path> <path d="M15.354 7.646a.5.5 0 00-.708 0L13 9.293V7.5a.5.5 0 00-1 0v3a.5.5 0 00.5.5h3a.5.5 0 000-1h-1.793l1.646-1.646a.5.5 0 000-.708z"></path> </svg> );
const ChevronDownIcon = ({ className = "w-4 h-4" }) => ( <svg className={className} fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg"><path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"></path></svg> );
const CloseIcon = ({ className = "w-5 h-5 text-gray-500 hover:text-gray-700" }) => ( <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg> );
const SearchIconSolid = ({ className = "w-5 h-5 text-gray-400" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor"> <path fillRule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clipRule="evenodd" /> </svg> );
const UserCircleIcon = ({ className = "w-8 h-8 text-gray-400" }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor"> <path fillRule="evenodd" d="M18.685 19.097A9.723 9.723 0 0021.75 12c0-5.385-4.365-9.75-9.75-9.75S2.25 6.615 2.25 12a9.723 9.723 0 003.065 7.097A9.716 9.716 0 0012 21.75a9.716 9.716 0 006.685-2.653ZM12 15a3 3 0 100-6 3 3 0 000 6Z" clipRule="evenodd" /> </svg> );

// --- Reusable Form Components ---
const FormField = ({ label, required, children, className = "" }) => ( <div className={`mb-5 ${className}`}> <label className="block text-sm font-medium text-gray-700 mb-1"> {label} {required && <span className="text-red-500">*</span>} </label> {children} </div> );
const TextInput = (props) => ( <input type="text" {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" /> );
const NumberInput = (props) => ( <input type="number" {...props} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" /> );
const SelectDropdown = ({ options, value, onChange, name, ...props }) => ( <div className="relative"> <select name={name} value={value} onChange={onChange} {...props} className="appearance-none mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm pr-8"> {options.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)} </select> <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700"> <ChevronDownIcon /> </div> </div> );
const ToggleButtonGroup = ({ name, options, selectedValue, onChange }) => ( <div className="flex space-x-1 border border-gray-300 rounded-md p-0.5 max-w-min"> {options.map(opt => ( <button key={opt.value} type="button" onClick={() => onChange(name, opt.value)} className={`px-4 py-1.5 text-sm rounded-md transition-colors duration-150 ${selectedValue === opt.value ? 'bg-purple-100 text-purple-700 font-medium ring-1 ring-purple-500' : 'text-gray-600 hover:bg-gray-100'}`}> {opt.label} </button> ))} </div> );

// --- New SearchableSelect Component ---
const SearchableSelect = ({
  options,
  value,
  onChange,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  disabled = false,
  className = "", // For applying margin like mt-1 if needed at instance level
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const dropdownRef = useRef(null);

  const selectedOption = options.find(opt => opt.value === value);
  const displayLabel = selectedOption ? selectedOption.label : placeholder;

  const filteredOptions = options.filter(opt =>
    opt.label.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectOption = (optionValue) => {
    onChange(optionValue); // This onChange expects just the value
    setIsOpen(false);
    setSearchTerm("");
  };

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
    <button
  type="button"
  onClick={() => !disabled && setIsOpen(!isOpen)}
  disabled={disabled}
  className={`w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm sm:text-sm
              text-left focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500
              flex justify-between items-center
              ${disabled ? 'bg-gray-100 cursor-not-allowed text-gray-500' : 'hover:border-gray-400'}`}
>

        <span>{displayLabel}</span>
        <ChevronDownIcon className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`} />
      </button>
      {isOpen && !disabled && (
        <div className="absolute z-20 mt-1 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto">
          <div className="p-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <SearchIconSolid className="w-4 h-4 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                autoFocus
                className="block w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-sm
                           focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              />
            </div>
          </div>
          <ul>
            {filteredOptions.length > 0 ? (
              filteredOptions.map(opt => (
                <li
                  key={opt.value}
                  onClick={() => handleSelectOption(opt.value)}
                  className="px-3 py-2 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer"
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className="px-3 py-2 text-sm text-gray-500 text-center">
                {searchTerm ? `No results for "${searchTerm}"` : "No options available."}
              </li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
};


/**
 * CreateConsultingEventPage component for creating a new IT consulting event.
 * It's a multi-step form: Step 1 for event details, Step 2 for assigning specialists.
 */
const CreateConsultingEventPage = () => {
  const { eventType, bookingCadence } = useParams();
  const navigate = useNavigate();

  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    consultingName: '', durationHours: '0', durationMinutes: '30',
    priceType: 'free', priceAmount: '0', 
    meetingMode: 'online', // Default for one-on-one/collective
    onlineMeetingProvider: 'none', // NEW: For the tool/location dropdown
    eventDate: '', eventTime: '', numberOfSeats: '',
    pricedForHours: '0', pricedForMinutes: '30',
    assignedSpecialists: [], 
  });

  const [allSpecialists, setAllSpecialists] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const [isFetchingSpecialists, setIsFetchingSpecialists] = useState(false);

  useEffect(() => {
    const initialMeetingMode = (eventType === 'one-on-one' || eventType === 'collective') ? 'online' : 'none';
    setFormData(prev => ({
      ...prev, 
      consultingName: '',
      durationHours: '0', durationMinutes: '30',
      priceType: 'free', priceAmount: '0',
      meetingMode: initialMeetingMode,
      onlineMeetingProvider: 'none', // Reset this as well
      eventDate: '', eventTime: '',
      numberOfSeats: eventType === 'group' ? '1' : (eventType === 'one-on-one' || eventType === 'collective') ? '1' : '0',
      pricedForHours: eventType === 'resource' ? '1' : '0',
      pricedForMinutes: eventType === 'resource' ? '0' : '30',
    }));
    setCurrentStep(1);
  }, [eventType, bookingCadence]);


  const fetchSpecialists = useCallback(async () => {
    setIsFetchingSpecialists(true);
    try {
      const response = await fetch(`${BASE_URL}/api/users/getUsers`);
      if (!response.ok) throw new Error('Failed to fetch specialists');
      const result = await response.json();
      if (result.success) {
        setAllSpecialists(result.data);
      } else {
        console.error("Error fetching specialists:", result.message);
        setAllSpecialists([]);
      }
    } catch (error) {
      console.error("Error fetching specialists:", error);
      setAllSpecialists([]);
    } finally {
      setIsFetchingSpecialists(false);
    }
  }, []); 

  useEffect(() => {
    if (currentStep === 2 && allSpecialists.length === 0) {
      fetchSpecialists();
    }
  }, [currentStep, allSpecialists.length, fetchSpecialists]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleOnlineMeetingProviderChange = (value) => {
    setFormData(prev => ({ ...prev, onlineMeetingProvider: value }));
  };

  const handleToggleChange = (name, value) => {
    setFormData(prev => {
      const newState = { ...prev, [name]: value };
      if (name === 'priceType' && value === 'free') {
        newState.priceAmount = '0';
      }
      // If meetingMode changes, and it's not 'online', reset the onlineMeetingProvider
      if (name === 'meetingMode' && value !== 'online') {
        newState.onlineMeetingProvider = 'none'; 
      }
      return newState;
    });
  };

  const handleSpecialistToggle = (specialistId) => {
    setFormData(prev => {
      const newAssignedSpecialists = prev.assignedSpecialists.includes(specialistId)
        ? prev.assignedSpecialists.filter(id => id !== specialistId)
        : [...prev.assignedSpecialists, specialistId];
      return { ...prev, assignedSpecialists: newAssignedSpecialists };
    });
  };

  const handleSelectAllSpecialists = (e) => {
    const isChecked = e.target.checked;
    if (isChecked) {
      const allFilteredIds = filteredSpecialists.map(s => s._id);
      setFormData(prev => ({ ...prev, assignedSpecialists: allFilteredIds }));
    } else {
      setFormData(prev => ({ ...prev, assignedSpecialists: [] }));
    }
  };

  const handleNextStep = (e) => {
    e.preventDefault();
    if (!formData.consultingName.trim()) {
      toast.warn("Please enter the IT Consulting Name.", {
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
        return;
    }
    setCurrentStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    const submissionData = { ...formData, eventType, bookingCadence };
    console.log("Final Form Submitted Data:", submissionData);

    try {
      const response = await fetch(`${BASE_URL}/api/consulting-events/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submissionData),
      });
      const result = await response.json();

      if (result.success) {
        toast.success("Event created successfully!", {
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
        navigate('/calls'); 
      } else {
        toast.error('Could not create event.', {
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
      }
    } catch (error) {
      toast.error('An error occurred while creating the event.', {
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
    } finally {
      setIsLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStep === 2) {
      setCurrentStep(1);
    } else {
      navigate(-1); 
    }
  };

  const handleClose = () => navigate('/calls'); 

  const filteredSpecialists = allSpecialists.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const isSelectAllChecked = filteredSpecialists.length > 0 &&
                             formData.assignedSpecialists.length === filteredSpecialists.length &&
                             filteredSpecialists.every(s => formData.assignedSpecialists.includes(s._id));

  const getPageTitleAndTag = () => {
    let title = "Create IT Consulting"; 
    let typeText = "";
    if (eventType === 'one-on-one') typeText = "One-on-One";
    else if (eventType === 'group') typeText = "Group Booking";
    else if (eventType === 'collective') typeText = "Collective Booking";
    else if (eventType === 'resource') typeText = "Resource";

    let tag = typeText;
    if (bookingCadence === 'recurring') tag += " (Recurring)";
    return { title: `${title}: ${typeText}`, tag: tag.trim() }; 
  };
  const { title: pageTitle, tag: pageTag } = getPageTitleAndTag();

  const durationOptions = Array.from({ length: 24 }, (_, i) => ({ value: i.toString(), label: `${i} Hours` }));
  const minuteOptions = Array.from({ length: 12 }, (_, i) => ({ value: (i * 5).toString(), label: `${i * 5} Minutes` }));
  const timeSlotOptions = () => {
      const slots = [];
      for (let h = 0; h < 24; h++) {
          for (let m = 0; m < 60; m += 30) { 
              const hour = h.toString().padStart(2, '0');
              const minute = m.toString().padStart(2, '0');
              const timeValue = `${hour}:${minute}`;
              const ampm = h < 12 ? 'AM' : 'PM';
              const displayHour = h % 12 === 0 ? 12 : h % 12;
              slots.push({ value: timeValue, label: `${displayHour.toString().padStart(2, '0')}:${minute} ${ampm}` });
          }
      }
      return slots;
  };

  const priceOptions = [{ value: 'free', label: 'Free' }, { value: 'paid', label: 'Paid' }];
  
  // Use all three options for meetingMode toggle group
  const meetingModeOptions = [ 
    { value: 'online', label: 'Online' }, 
    { value: 'offline', label: 'Offline' }, 
  ];

  // Options for the new SearchableSelect (online meeting provider)
  const onlineMeetingProviderOptions = [
    { value: 'none', label: 'None' },
    // Placeholder for future:
    // { value: 'zoom', label: 'Zoom Meeting' },
    // { value: 'gmeet', label: 'Google Meet' },
    // { value: 'custom_location', label: 'Custom Location (Specify)' } 
  ];


  const showMeetingMode = eventType === 'one-on-one' || eventType === 'collective';
  const showGroupFields = eventType === 'group';
  const showResourcePricingDuration = eventType === 'resource';
  const showStandardDuration = !showResourcePricingDuration; 
  const showEventDateTimeForGroupOneTime = showGroupFields && bookingCadence === 'one-time';


  return (
    <div className="min-h-screen bg-slate-100 py-8 px-4 sm:px-6 lg:px-8 flex flex-col items-center">
      <div className="fixed top-4 right-4 z-50"><button onClick={handleClose} className="p-2 rounded-full hover:bg-slate-200 transition-colors"><CloseIcon /></button></div>
      <div className="w-full max-w-2xl">
        <div className="bg-white shadow sm:rounded-lg p-6 mb-6 flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-lg"><CameraIcon className="w-8 h-8 text-purple-600" /></div>
          <div>
            <h1 className="text-lg font-semibold text-gray-800">{pageTitle}</h1>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">{pageTag}</span>
          </div>
        </div>

        <div className="bg-white shadow sm:rounded-lg p-6 sm:p-8">
          {currentStep === 1 && (
            <form onSubmit={handleNextStep}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-6 border-b pb-2">IT CONSULTING DETAILS</h2>
              <FormField label="IT Consulting Name" required><TextInput name="consultingName" value={formData.consultingName} onChange={handleInputChange} placeholder="e.g., Project Kickoff Meeting" required /></FormField>
              
              {showStandardDuration && (
                <FormField label="Event Duration">
                    <div className="flex space-x-3">
                        <div className="flex-1"><SelectDropdown name="durationHours" value={formData.durationHours} onChange={handleInputChange} options={durationOptions} /></div>
                        <div className="flex-1"><SelectDropdown name="durationMinutes" value={formData.durationMinutes} onChange={handleInputChange} options={minuteOptions} /></div>
                    </div>
                </FormField>
              )}
              
              <FormField label="Price">
                <div className="flex items-center space-x-4">
                    <ToggleButtonGroup name="priceType" options={priceOptions} selectedValue={formData.priceType} onChange={handleToggleChange} />
                    {formData.priceType === 'paid' && (
                        <div className="flex items-center">
                            <span className="text-gray-500 mr-1 text-sm">Rs</span>
                            <NumberInput name="priceAmount" value={formData.priceAmount} onChange={handleInputChange} min="0" className="w-24" placeholder="0" />
                        </div>
                    )}
                </div>
              </FormField>
              
              {showMeetingMode && (
                <FormField label="Meeting Mode">
                  <div className="flex items-start space-x-3 mt-1"> {/* Added mt-1 for consistency with other inputs after label */}
                    <div className="flex-shrink-0">
                      <ToggleButtonGroup
                        name="meetingMode"
                        options={meetingModeOptions} // Using all 3 options
                        selectedValue={formData.meetingMode}
                        onChange={handleToggleChange}
                      />
                    </div>
                    {/* Conditionally render SearchableSelect based on meetingMode */}
                    {(formData.meetingMode === 'online' || formData.meetingMode === 'offline') && (
                      <div className="flex-grow">
                        <SearchableSelect
                          options={onlineMeetingProviderOptions}
                          value={formData.onlineMeetingProvider}
                          onChange={handleOnlineMeetingProviderChange}
                          disabled={formData.meetingMode === 'offline'} // Disabled if 'offline'
                          placeholder="Select Tool / Info"
                          searchPlaceholder="Search..."
                        />
                      </div>
                    )}
                  </div>
                </FormField>
              )}
              
              {showEventDateTimeForGroupOneTime && (
                <FormField label="Event Date & Time">
                    <div className="flex space-x-3">
                        <div className="flex-1 relative">
                            <input type="date" name="eventDate" value={formData.eventDate} onChange={handleInputChange} className="mt-1 block w-full px-3 py-2 bg-white border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm" />
                        </div>
                        <div className="flex-1">
                            <SelectDropdown name="eventTime" value={formData.eventTime} onChange={handleInputChange} options={timeSlotOptions()} placeholder="Select time" />
                        </div>
                    </div>
                </FormField>
              )}
              
              {showGroupFields && (
                <FormField label="Number of Seats">
                    <NumberInput name="numberOfSeats" value={formData.numberOfSeats} onChange={handleInputChange} min="1" placeholder="1" />
                </FormField>
              )}
              
              {showResourcePricingDuration && (
                <FormField label="Resource Priced For (Duration)">
                    <div className="flex space-x-3">
                        <div className="flex-1"><SelectDropdown name="pricedForHours" value={formData.pricedForHours} onChange={handleInputChange} options={durationOptions} /></div>
                        <div className="flex-1"><SelectDropdown name="pricedForMinutes" value={formData.pricedForMinutes} onChange={handleInputChange} options={minuteOptions} /></div>
                    </div>
                </FormField>
              )}

              <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">Back</button>
                <button type="submit" className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">Next</button>
              </div>
            </form>
          )}

          {currentStep === 2 && (
            <form onSubmit={handleSubmit}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-1 border-b pb-2">ASSIGN IT SPECIALISTS</h2>
                <div className="my-4">
                    <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><SearchIconSolid /></div>
                        <input
                            type="text"
                            placeholder="Search IT Specialists by name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
                        />
                    </div>
                </div>

                {isFetchingSpecialists && <p className="text-sm text-gray-500 text-center py-4">Loading specialists...</p>}
                {!isFetchingSpecialists && allSpecialists.length === 0 && <p className="text-sm text-gray-500 text-center py-4">No specialists available to assign.</p>}

                {!isFetchingSpecialists && allSpecialists.length > 0 && (
                    <div className="max-h-72 overflow-y-auto border border-gray-200 rounded-md">
                         <div className="flex justify-between items-center p-3 border-b bg-gray-50 sticky top-0 z-10">
                            <span className="text-sm font-medium text-gray-700">Specialist</span>
                            <label htmlFor="selectAllSpecialists" className="flex items-center space-x-2 text-sm text-gray-700 cursor-pointer">
                                <span>Select All (Visible)</span>
                                <input
                                    type="checkbox"
                                    id="selectAllSpecialists"
                                    checked={isSelectAllChecked}
                                    onChange={handleSelectAllSpecialists}
                                    disabled={filteredSpecialists.length === 0} 
                                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                            </label>
                        </div>
                        {filteredSpecialists.map(specialist => (
                            <div key={specialist._id} className="flex items-center justify-between p-3 border-b border-gray-100 hover:bg-gray-50">
                                <div className="flex items-center space-x-3">
                                    <UserCircleIcon className="w-7 h-7 text-gray-400" />
                                    <span className="text-sm text-gray-800">{specialist.name}</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={formData.assignedSpecialists.includes(specialist._id)}
                                    onChange={() => handleSpecialistToggle(specialist._id)}
                                    className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                                />
                            </div>
                        ))}
                        {filteredSpecialists.length === 0 && searchTerm && (
                            <p className="p-3 text-sm text-gray-500 text-center">No specialists match your search "{searchTerm}".</p>
                        )}
                         {filteredSpecialists.length === 0 && !searchTerm && allSpecialists.length > 0 && (
                            <p className="p-3 text-sm text-gray-500 text-center">No specialists found. Try a different search term.</p>
                        )}
                    </div>
                )}

              <div className="mt-10 pt-6 border-t border-gray-200 flex justify-end space-x-3">
                <button type="button" onClick={handleBack} className="px-6 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500">Back</button>
                <button type="submit" disabled={isLoading} className="px-6 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 disabled:opacity-50">
                    {isLoading ? 'Creating...' : 'Create IT Consulting'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default CreateConsultingEventPage;