// src/Pages/BookingEmbedPage.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { BASE_URL } from '../BaseUrl';
import {
    UserIcon as UserOutlineIcon,
    CalendarIcon as CalendarOutlineIcon,
    ClockIcon as ClockOutlineIcon,
    ChevronUpIcon,
    ChevronDownIcon,
    ChevronLeftIcon,
    ChevronRightIcon,
    MagnifyingGlassIcon,
    CheckIcon,
    XMarkIcon
} from '@heroicons/react/24/outline';
import { toast,Bounce} from 'react-toastify';
// --- Placeholder for the "wand" like service icon ---
const ServiceIcon = ({ className }) => (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
        {/* Replace with your actual SVG path for the service icon if you have one */}
        <path d="M6.43069 3.95979C6.57499 3.20997 7.20969 2.6308 7.97319 2.52019L8.22669 2.48589C10.7617 2.12919 13.2387 2.12919 15.7737 2.48589L16.0272 2.52019C16.7907 2.6308 17.4254 3.20997 17.5697 3.95979L17.6009 4.13839C18.063 6.64639 18.063 9.35369 17.6009 11.8617L17.5697 12.0403C17.4254 12.7901 16.7907 13.3693 16.0272 13.4799L15.7737 13.5142C13.2387 13.8709 10.7617 13.8709 8.22669 13.5142L7.97319 13.4799C7.20969 13.3693 6.57499 12.7901 6.43069 12.0403L6.39959 11.8617C5.93749 9.35369 5.93749 6.64639 6.39959 4.13839L6.43069 3.95979ZM15.4997 16.4999L12.7067 13.7069C12.3167 13.3169 11.6837 13.3169 11.2927 13.7069L8.49969 16.4999C7.32969 17.6699 7.93869 19.6309 9.41369 19.9159L9.63269 19.9579C11.0877 20.2489 12.7097 20.0339 13.9247 19.2219L14.0747 19.1309C14.5127 18.8659 14.8657 18.5119 15.1307 18.0749L15.2217 17.9249C16.0337 16.7099 15.8177 15.0879 14.9577 13.9249L14.8687 14.0749C14.3187 14.8809 13.4077 15.3489 12.4147 15.3489C11.0007 15.3489 9.84869 14.1969 9.84869 12.7829C9.84869 12.2149 10.0377 11.6869 10.3727 11.2729L12.0007 9.64589L13.6277 11.2729C14.4507 12.0959 14.4507 13.4699 13.6277 14.2929L12.7067 15.2139L14.0407 16.5479L15.4997 16.4999Z"/>
    </svg>
);

// --- Helper to format duration ---
const formatDurationForBooking = (hours, minutes) => {
    let parts = [];
    if (hours && parseInt(hours) > 0) parts.push(`${hours} hr${parseInt(hours) > 1 ? 's' : ''}`);
    if (minutes && parseInt(minutes) > 0) parts.push(`${minutes} min${parseInt(minutes) > 1 ? 's' : ''}`);
    return parts.join(' ') || 'N/A';
};

// --- Helper to get initials for avatar fallback ---
const getInitials = (name) => {
    if (!name) return '??';
    const words = name.trim().split(' ');
    if (words.length === 0 || !words[0]) return '??';
    return words[0][0].toUpperCase();
};

// --- Helper to format event type for display in summary ---
const formatEventTypeDisplay = (eventType) => {
    if (!eventType) return "";
    if (eventType === 'one-on-one') return "One on One";
    if (eventType === 'group') return "Group";
    // Add other types if needed
    return eventType.charAt(0).toUpperCase() + eventType.slice(1);
};

// --- Timezone Data and Helpers ---
const allTimezones = Intl.supportedValuesOf('timeZone');
const getGMTString = (timeZone) => {
    try {
        // Try to get the offset using timeZoneName:'longOffset'
        const formatter = new Intl.DateTimeFormat('en', { timeZoneName:'longOffset', timeZone });
        const parts = formatter.formatToParts(new Date());
        const gmtPart = parts.find(part => part.type === 'timeZoneName');
        if (gmtPart) {
            const match = gmtPart.value.match(/GMT([+-]\d{1,2}(:\d{2})?)/);
            if (match && match[1]) return `GMT${match[1]}`;
        }
        // Fallback if the above fails or doesn't provide a clear offset
        const offsetMinutes = new Date().toLocaleTimeString('en', { timeZoneName:'shortOffset', timeZone }).split('GMT')[1];
         if (offsetMinutes) return `GMT${offsetMinutes}`;


    } catch (e) { /* Fall through to manual calculation if Intl fails */ }

    // Manual fallback if Intl methods are not sufficient or throw error
    const date = new Date();
    const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
    const tzDate = new Date(date.toLocaleString('en-US', { timeZone }));
    const diffMinutes = (tzDate.getTime() - utcDate.getTime()) / 60000;
    const hours = Math.floor(Math.abs(diffMinutes) / 60);
    const minutes = Math.abs(diffMinutes) % 60;
    const sign = diffMinutes >= 0 ? '+' : '-';
    return `GMT${sign}${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}`;
};
const timezonesWithOffsets = allTimezones.map(tz => ({
    value: tz,
    label: `${tz.replace(/_/g, ' ')} (${getGMTString(tz)})`
}));

// --- Time Slot Generation ---
const generateTimeSlots = () => {
    const slots = { morning: [], afternoon: [], evening: [] };
    const formatTime = (date) => date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
    // Morning: 9:00 AM - 11:45 AM
    for (let h = 9; h < 12; h++) for (let m = 0; m < 60; m += 15) slots.morning.push(formatTime(new Date(2000, 0, 1, h, m)));
    // Afternoon: 12:00 PM - 3:45 PM
    for (let h = 12; h < 16; h++) for (let m = 0; m < 60; m += 15) { if (h === 15 && m > 45) continue; slots.afternoon.push(formatTime(new Date(2000, 0, 1, h, m)));}
    // Evening: 4:00 PM - 5:30 PM
    for (let h = 16; h < 18; h++) for (let m = 0; m < 60; m += 15) { if (h === 17 && m > 30) continue; slots.evening.push(formatTime(new Date(2000, 0, 1, h, m)));}
    return slots;
};
const allTimeSlots = generateTimeSlots();

const BookingEmbedPage = () => {
    const { eventId } = useParams();
    const [eventDetails, setEventDetails] = useState(null);
    const [serviceInfo, setServiceInfo] = useState({ name: '', duration: '', price: '' });

    const [availableSpecialists, setAvailableSpecialists] = useState([]);
    const [selectedSpecialist, setSelectedSpecialist] = useState({ id: 'auto', name: 'Auto-assign it specialist' });
    const [isSpecialistDropdownOpen, setIsSpecialistDropdownOpen] = useState(false);

    const [selectedDate, setSelectedDate] = useState(new Date());
    const [currentMonthInCalendar, setCurrentMonthInCalendar] = useState(new Date());
    const [isCalendarOpen, setIsCalendarOpen] = useState(false);

    const [timezoneSearch, setTimezoneSearch] = useState('');
    const [selectedTimezone, setSelectedTimezone] = useState(
        timezonesWithOffsets.find(tz => tz.value === 'Asia/Karachi') || // Try to find specific default
        (timezonesWithOffsets.length > 0 ? timezonesWithOffsets[0] : {value: '', label: 'No Timezone'}) // Fallback if Asia/Karachi not found
    );
    const [isTimezoneDropdownOpen, setIsTimezoneDropdownOpen] = useState(false);
    const filteredTimezones = useMemo(() => timezonesWithOffsets.filter(tz => tz.label.toLowerCase().includes(timezoneSearch.toLowerCase())), [timezoneSearch, timezonesWithOffsets]);

    const [selectedTime, setSelectedTime] = useState(null);
    const [isTimeSlotDropdownOpen, setIsTimeSlotDropdownOpen] = useState(false);

    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    const [isSummaryPanelOpen, setIsSummaryPanelOpen] = useState(false);
    const [userName, setUserName] = useState('');
    const [userEmail, setUserEmail] = useState('');
    const [countryCode, setCountryCode] = useState('+92'); // Default country code
    const [contactNumber, setContactNumber] = useState('');
    const [formError, setFormError] = useState('');

    const specialistRef = useRef(null);
    const calendarRef = useRef(null);
    const timezoneRef = useRef(null);
    const timeSlotRef = useRef(null);
    const summaryPanelRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (specialistRef.current && !specialistRef.current.contains(event.target)) setIsSpecialistDropdownOpen(false);
            if (calendarRef.current && !calendarRef.current.contains(event.target)) setIsCalendarOpen(false);
            if (timezoneRef.current && !timezoneRef.current.contains(event.target)) setIsTimezoneDropdownOpen(false);
            if (timeSlotRef.current && !timeSlotRef.current.contains(event.target)) setIsTimeSlotDropdownOpen(false);
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        const fetchEventData = async () => {
            if (!eventId) { setError("Event ID is missing."); setIsLoading(false); return; }
            setIsLoading(true); setError(null);
            try {
                const response = await fetch(`${BASE_URL}/api/consulting-events/get/${eventId}`);
                if (!response.ok) {
                    const errorData = await response.json().catch(() => ({ message: `HTTP error! status: ${response.status}` }));
                    throw new Error(errorData.message || `Failed to fetch event (Status: ${response.status})`);
                }
                const result = await response.json();
                if (result.success && result.data) {
                    const fetchedEvent = result.data;
                    setEventDetails(fetchedEvent);
                    setServiceInfo({
                        name: fetchedEvent.consultingName,
                        duration: formatDurationForBooking(fetchedEvent.durationHours, fetchedEvent.durationMinutes),
                        price: fetchedEvent.priceType === 'paid' && parseFloat(fetchedEvent.priceAmount) > 0
                            ? `${fetchedEvent.priceAmount || '0'} ${fetchedEvent.currency || 'PKR'}`.trim()
                            : 'Free'
                    });
                    const specialists = (fetchedEvent.assignedSpecialists || [])
                        .filter(sp => sp && sp.name)
                        .map(sp => ({ id: sp._id, name: sp.name, avatarUrl: sp.avatarUrl }));
                    setAvailableSpecialists([{ id: 'auto', name: 'Auto-assign it specialist' }, ...specialists]);
                    setSelectedSpecialist({ id: 'auto', name: 'Auto-assign it specialist' }); // Reset to default
                    
                    if (fetchedEvent.timezone) {
                        const tzObj = timezonesWithOffsets.find(tz => tz.value === fetchedEvent.timezone);
                        if (tzObj) setSelectedTimezone(tzObj);
                    } else { // Reset to default if event has no timezone
                         const defaultTz = timezonesWithOffsets.find(tz => tz.value === 'Asia/Karachi') || (timezonesWithOffsets.length > 0 ? timezonesWithOffsets[0] : {value: '', label: 'No Timezone'});
                         setSelectedTimezone(defaultTz);
                    }
                    setSelectedTime(null); // Always reset time on new event load
                } else {
                    throw new Error(result.message || 'Event data not found or API response was not successful.');
                }
            } catch (err) {
                setError(err.message);
                console.error("Error fetching event data:", err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEventData();
    }, [eventId]);

    const daysOfWeek = ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'];
    const getDaysInMonth = (year, month) => { const date = new Date(year, month, 1); const days = []; while (date.getMonth() === month) { days.push(new Date(date)); date.setDate(date.getDate() + 1); } return days; };
    const calendarDays = useMemo(() => { const year = currentMonthInCalendar.getFullYear(); const month = currentMonthInCalendar.getMonth(); const daysInMonth = getDaysInMonth(year, month); const firstDayOfMonth = daysInMonth[0].getDay(); const offset = (firstDayOfMonth === 0 ? 6 : firstDayOfMonth - 1); return Array(offset).fill(null).concat(daysInMonth); }, [currentMonthInCalendar]);
    const handleDateSelect = (day) => { if (!day) return; setSelectedDate(day); setIsCalendarOpen(false); };
    const changeMonth = (offset) => { setCurrentMonthInCalendar(prev => new Date(prev.getFullYear(), prev.getMonth() + offset, 1)); };

    const openSummaryPanel = () => {
        if (!selectedTime) { toast.warn("Please select a time slot before proceeding.", {
            position: "top-right",
            autoClose: 5000,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            theme: "light",
            transition: Bounce,
            }); return; }
        setFormError(''); setIsSummaryPanelOpen(true);
    };

    const handleFinalSubmit = async (e) => {
        e.preventDefault();
        setFormError('');
        if (!userName.trim() || !userEmail.trim() || !contactNumber.trim()) {
            setFormError('Please fill in all required details.'); return;
        }
        if (!/\S+@\S+\.\S+/.test(userEmail)) {
            setFormError('Please enter a valid email address.'); return;
        }
        setIsSubmitting(true);
        try {
            const customerResponse = await fetch(`${BASE_URL}/api/customers/checkorcreate`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ customerName: userName, emailAddress: userEmail, countryCode, contactNumber }),
            });
            if (!customerResponse.ok) { const errData = await customerResponse.json(); throw new Error(errData.message || 'Failed to process customer.');}
            const customerResult = await customerResponse.json();
            if (!customerResult.success || !customerResult.data._id) throw new Error(customerResult.message || 'Invalid customer data.');
            
            const customerId = customerResult.data._id;
            const appointmentPayload = {
                itConsultingId: eventId,
                specialistId: selectedSpecialist.id === 'auto' ? null : selectedSpecialist.id,
                customerId,
                appointmentDate: selectedDate.toISOString().split('T')[0],
                selectedTimeSlot: selectedTime,
                paymentStatus: eventDetails.priceType === 'paid' && parseFloat(eventDetails.priceAmount) > 0 ? 'due' : 'na',
                paymentAmountInput: eventDetails.priceType === 'paid' ? eventDetails.priceAmount : 0,
            };

            const appointmentResponse = await fetch(`${BASE_URL}/api/appointments/add`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(appointmentPayload),
            });
            if (!appointmentResponse.ok) { const errData = await appointmentResponse.json(); throw new Error(errData.message || 'Failed to book appointment.');}
            const appointmentResult = await appointmentResponse.json();
            if (!appointmentResult.success) throw new Error(appointmentResult.message || 'Booking not successful.');

            console.log('APPOINTMENT BOOKED:', appointmentResult.data);
            toast.success('Appointment Scheduled Successfully!', {
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
            setIsSummaryPanelOpen(false);
            setUserName(''); setUserEmail(''); setCountryCode('+92'); setContactNumber(''); setSelectedTime(null);
            // Optionally reset more: setSelectedSpecialist({ id: 'auto', name: 'Auto-assign it specialist' }); setSelectedDate(new Date());
        } catch (err) {
            console.error("Booking Error:", err);
            setFormError(err.message || "An unexpected error occurred.");
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-screen bg-gray-50"><p>Loading booking portal...</p></div>;
    if (error) return <div className="flex justify-center items-center h-screen bg-gray-50 p-4"><p className="text-red-600 text-center">Error: {error}</p></div>;
    if (!eventDetails) return <div className="flex justify-center items-center h-screen bg-gray-50"><p>Booking information currently unavailable.</p></div>;

    const DropdownArrow = ({ isOpen }) => isOpen ? <ChevronUpIcon className="w-4 h-4 text-gray-500" /> : <ChevronDownIcon className="w-4 h-4 text-gray-500" />;

    return (
        <div className="bg-gray-100 min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 font-[sans-serif] relative overflow-x-hidden">
            {/* Main Booking Form Area */}
            <div className={`w-full max-w-3xl transition-transform duration-500 ease-in-out ${isSummaryPanelOpen ? "md:-translate-x-1/3" : "translate-x-0"}`}>
                <div className="text-left mb-10">
                    <h1 className="text-4xl font-bold text-gray-800">Welcome!</h1>
                    <p className="text-gray-600 mt-2 text-sm">
                        Book your appointment in a few simple steps: Choose a service, pick your date and time, and fill in your details. See you soon!
                    </p>
                </div>
                <div className="space-y-4">
                    {/* Row 1 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Service (Fixed) */}
                        <div className="bg-white p-4 rounded-md shadow-sm flex items-center col-span-1 h-[90px]">
                            <ServiceIcon className="w-7 h-7 text-gray-500 mr-3 flex-shrink-0" />
                            <div>
                                <span className="font-semibold text-gray-700 text-sm">{serviceInfo.name}</span>
                                <p className="text-xs text-gray-500">({serviceInfo.duration} | {serviceInfo.price})</p>
                            </div>
                        </div>
                        {/* Specialist Selector */}
                         <div ref={specialistRef} className="relative col-span-1 h-[90px]">
                            <button onClick={() => setIsSpecialistDropdownOpen(prev => !prev)} className="w-full h-full bg-white p-4 rounded-md shadow-sm flex items-center justify-between text-left">
                                <div className="flex items-center">
                                    <UserOutlineIcon className="w-7 h-7 text-gray-500 mr-3 flex-shrink-0" />
                                    <div>
                                        <span className="font-semibold text-gray-700 text-sm">{selectedSpecialist.name}</span>
                                        {selectedSpecialist.id === 'auto' && <p className="text-xs text-gray-500">Any available specialist will be assigned</p>}
                                    </div>
                                </div>
                                <DropdownArrow isOpen={isSpecialistDropdownOpen} />
                            </button>
                            {isSpecialistDropdownOpen && (
                                <div className="absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 py-1">
                                    {availableSpecialists.map(spec => (
                                        <div key={spec.id} onClick={() => { setSelectedSpecialist(spec); setIsSpecialistDropdownOpen(false); }}
                                            className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex items-center text-sm">
                                            {spec.id !== 'auto' && (spec.avatarUrl ? <img src={spec.avatarUrl} alt={spec.name} className="w-6 h-6 rounded-full mr-2"/> : <span className="w-6 h-6 rounded-full bg-pink-500 text-white flex items-center justify-center text-xs mr-2">{getInitials(spec.name)}</span> )}
                                            {spec.id === 'auto' && <UserOutlineIcon className="w-6 h-6 text-gray-400 mr-2"/>}
                                            <div> {spec.name} {spec.id === 'auto' && <p className="text-xs text-gray-400">Any available specialist will be assigned</p>}</div>
                                        </div>))}
                                </div>)}
                        </div>
                        {/* Date Selector */}
                        <div ref={calendarRef} className="relative col-span-1 h-[90px]">
                            <button onClick={() => setIsCalendarOpen(prev => !prev)} className="w-full h-full bg-white p-4 rounded-md shadow-sm flex items-center justify-between text-left">
                                <div className="flex items-center">
                                    <CalendarOutlineIcon className="w-7 h-7 text-gray-500 mr-3 flex-shrink-0" />
                                    <span className="font-semibold text-gray-700 text-sm">{selectedDate.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                                </div> <DropdownArrow isOpen={isCalendarOpen} />
                            </button>
                            {isCalendarOpen && (
                                <div className="absolute z-20 mt-1 w-72 bg-white rounded-md shadow-lg border border-gray-200 p-3">
                                    <div className="flex justify-between items-center mb-3"> <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronLeftIcon className="w-5 h-5 text-gray-600"/></button> <span className="font-semibold text-sm text-gray-700">{currentMonthInCalendar.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</span> <button onClick={() => changeMonth(1)} className="p-1 hover:bg-gray-100 rounded-full"><ChevronRightIcon className="w-5 h-5 text-gray-600"/></button> </div>
                                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">{daysOfWeek.map(day => <div key={day}>{day}</div>)}</div>
                                    <div className="grid grid-cols-7 gap-1">{calendarDays.map((day, index) => ( <button key={index} onClick={() => handleDateSelect(day)} disabled={!day} className={`p-2 text-xs rounded-md flex items-center justify-center ${!day ? 'bg-transparent' : 'hover:bg-pink-100'} ${day && selectedDate.toDateString() === day.toDateString() ? 'bg-pink-500 text-white hover:bg-pink-600' : 'text-gray-700'} ${day && day.toDateString() === new Date().toDateString() && selectedDate.toDateString() !== day.toDateString() ? 'border border-pink-500' : ''}`}>{day ? day.getDate() : ''}</button>))}</div>
                                    <div className="h-1.5 bg-pink-500 mt-3 -mx-3 -mb-3 rounded-b-md"></div>
                                </div>)}
                        </div>
                    </div>
                     {/* Row 2 */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-stretch">
                        {/* Timezone Selector */}
                        <div ref={timezoneRef} className="relative col-span-1 h-[70px] md:h-auto">
                            <button onClick={() => setIsTimezoneDropdownOpen(prev => !prev)} className="w-full h-full bg-white p-4 rounded-md shadow-sm flex items-center justify-between text-left">
                                <div className="flex items-center min-w-0"> <ClockOutlineIcon className="w-7 h-7 text-gray-500 mr-3 flex-shrink-0" /> <span className="font-semibold text-gray-700 text-sm truncate" title={selectedTimezone.label}>{selectedTimezone.label.split('(')[0].trim()} <span className="text-gray-500 text-xs">{`(${selectedTimezone.label.split('(')[1]}`}</span></span> </div> <DropdownArrow isOpen={isTimezoneDropdownOpen} />
                            </button>
                            {isTimezoneDropdownOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                                <div className="p-2 sticky top-0 bg-white border-b z-10"><div className="relative"><MagnifyingGlassIcon className="w-4 h-4 text-gray-400 absolute left-2 top-1/2 -translate-y-1/2"/><input type="text" placeholder="Search timezone" value={timezoneSearch} onChange={(e) => setTimezoneSearch(e.target.value)} className="w-full pl-7 pr-2 py-1.5 text-sm border border-gray-300 rounded-md focus:ring-pink-500 focus:border-pink-500"/></div></div>
                                {filteredTimezones.map(tz => ( <div key={tz.value} onClick={() => { setSelectedTimezone(tz); setIsTimezoneDropdownOpen(false); setTimezoneSearch(''); }} className={`px-3 py-2 hover:bg-gray-100 cursor-pointer text-sm flex justify-between items-center ${selectedTimezone.value === tz.value ? 'bg-pink-50 text-pink-600' : ''}`}>{tz.label} {selectedTimezone.value === tz.value && <CheckIcon className="w-4 h-4 text-pink-600"/>}</div>))} {filteredTimezones.length === 0 && <p className="px-3 py-2 text-sm text-gray-500">No timezones found.</p>}
                            </div>)}
                        </div>
                        {/* Time Slot Selector */}
                        <div ref={timeSlotRef} className="relative col-span-1 h-[70px] md:h-auto">
                            <button onClick={() => setIsTimeSlotDropdownOpen(prev => !prev)} className="w-full h-full bg-white p-4 rounded-md shadow-sm flex items-center justify-between text-left">
                                <div className="flex items-center"> <ClockOutlineIcon className="w-7 h-7 text-gray-500 mr-3 flex-shrink-0" /> <span className="font-semibold text-gray-700 text-sm">{selectedTime || "Select Time"}</span> </div> <DropdownArrow isOpen={isTimeSlotDropdownOpen} />
                            </button>
                            {isTimeSlotDropdownOpen && (
                            <div className="absolute z-20 mt-1 w-full bg-white rounded-md shadow-lg border border-gray-200 p-3 max-h-72 overflow-y-auto">
                                {Object.entries(allTimeSlots).map(([period, slots]) => (slots.length > 0 && ( <div key={period} className="mb-3"> <p className="text-xs text-gray-500 font-semibold uppercase mb-1.5">{period}</p> <div className="grid grid-cols-3 gap-2">{slots.map(time => ( <button key={time} onClick={() => { setSelectedTime(time); setIsTimeSlotDropdownOpen(false); }} className={`p-2 text-xs rounded-md border ${selectedTime === time ? 'bg-pink-500 text-white border-pink-500' : 'bg-gray-50 text-gray-700 border-gray-200 hover:border-pink-400 hover:text-pink-600'}`}>{time}</button>))}</div></div>)))}
                            </div>)}
                        </div>
                        {/* Book Appointment Button -> Opens Summary Panel */}
                        <button onClick={openSummaryPanel} disabled={!selectedTime || isLoading || isSubmitting}
                            className="w-full col-span-1 bg-pink-500 text-white font-semibold py-2 px-3 rounded-md shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75 disabled:bg-gray-300 disabled:cursor-not-allowed flex items-center justify-center text-sm h-[70px] md:h-auto">
                            {isSubmitting ? "Processing..." : "Book Appointment"}
                        </button>
                    </div>
                </div>
            </div>

            {/* Booking Summary Panel */}
            <div ref={summaryPanelRef}
                className={`fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-2xl transform transition-transform duration-500 ease-in-out p-6 z-30 flex flex-col
                           ${isSummaryPanelOpen ? "translate-x-0" : "translate-x-full"}`}>
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-semibold text-gray-800">Booking Summary</h2>
                    <button onClick={() => setIsSummaryPanelOpen(false)} disabled={isSubmitting} className="text-gray-500 hover:text-gray-700 disabled:opacity-50">
                        <XMarkIcon className="w-6 h-6" />
                    </button>
                </div>

                {/* Service Summary */}
                <div className="bg-gray-50 p-4 rounded-lg mb-6">
                    <div className="flex items-start space-x-3">
                        <div className="w-10 h-10 bg-pink-500 rounded-md flex items-center justify-center text-white font-semibold text-lg">
                            {getInitials(serviceInfo.name)}
                        </div>
                        <div>
                            <h3 className="text-sm font-semibold text-gray-800">{serviceInfo.name}</h3>
                            <p className="text-xs text-gray-500">
                                {serviceInfo.duration} | {serviceInfo.price}
                                {eventDetails?.eventType && ` | ${formatEventTypeDisplay(eventDetails.eventType)}`}
                            </p>
                        </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200 flex items-center text-xs text-gray-600 space-x-4">
                        <div className='flex items-center'>
                            <CalendarOutlineIcon className="w-4 h-4 mr-1.5 text-pink-500" />
                            {selectedDate.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })} {selectedTime}
                        </div>
                        <div className='flex items-center min-w-0'>
                            <ClockOutlineIcon className="w-4 h-4 mr-1.5 text-pink-500" />
                            <span className="truncate" title={selectedTimezone.label.split('(')[1]?.replace(')','')}>
                                {selectedTimezone.label.split('(')[1]?.replace(')','')}
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Details Form */}
                <form onSubmit={handleFinalSubmit} className="space-y-4 flex-grow flex flex-col">
                    <h3 className="text-md font-semibold text-gray-700 mb-1">Please enter your details</h3>
                    <div>
                        <label htmlFor="userName" className="block text-xs font-medium text-gray-700 mb-1">Name <span className="text-red-500">*</span></label>
                        <input type="text" id="userName" value={userName} onChange={(e) => setUserName(e.target.value)} required disabled={isSubmitting}
                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label htmlFor="userEmail" className="block text-xs font-medium text-gray-700 mb-1">Email <span className="text-red-500">*</span></label>
                        <input type="email" id="userEmail" value={userEmail} onChange={(e) => setUserEmail(e.target.value)} required disabled={isSubmitting}
                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-100" />
                    </div>
                    <div>
                        <label htmlFor="userContact" className="block text-xs font-medium text-gray-700 mb-1">Contact Number <span className="text-red-500">*</span></label>
                        <div className="flex">
                             <select 
                                value={countryCode} 
                                onChange={(e) => setCountryCode(e.target.value)} 
                                disabled={isSubmitting}
                                className="px-3 py-2 border border-r-0 border-gray-300 rounded-l-md bg-gray-50 text-gray-700 text-sm focus:ring-pink-500 focus:border-pink-500 disabled:bg-gray-100 appearance-none"
                            >
                                <option value="+92">🇵🇰 +92</option>
                                <option value="+1">🇺🇸 +1</option>
                                <option value="+44">🇬🇧 +44</option>
                                <option value="+91">🇮🇳 +91</option>
                                {/* Add more as needed, or use a library for a comprehensive list */}
                            </select>
                            <input type="tel" id="contactNumber" value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} required disabled={isSubmitting}
                                   placeholder="3001234567"
                                   className="w-full px-3 py-2 border border-gray-300 rounded-r-md shadow-sm focus:ring-pink-500 focus:border-pink-500 text-sm disabled:bg-gray-100" />
                        </div>
                    </div>

                    {eventDetails && eventDetails.priceType === 'paid' && parseFloat(eventDetails.priceAmount) > 0 && (
                        <div>
                            <label className="block text-xs font-medium text-gray-700 mb-1">Payment Amount</label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700">
                                {eventDetails.priceAmount} {eventDetails.currency || 'PKR'}
                            </div>
                        </div>
                    )}
                     {eventDetails && (eventDetails.priceType === 'free' || !(parseFloat(eventDetails.priceAmount) > 0)) && (
                        <div>
                             <label className="block text-xs font-medium text-gray-700 mb-1">Payment Amount</label>
                            <div className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-sm text-gray-700">
                                Free
                            </div>
                        </div>
                    )}

                    {formError && <p className="text-xs text-red-500 mt-2">{formError}</p>}
                    
                    <div className="mt-auto pt-4">
                        <button type="submit"
                                disabled={isSubmitting || isLoading}
                                className="w-full bg-pink-500 text-white font-semibold py-3 px-4 rounded-md shadow-sm hover:bg-pink-600 focus:outline-none focus:ring-2 focus:ring-pink-400 focus:ring-opacity-75 text-sm disabled:bg-gray-400 disabled:cursor-not-allowed">
                            {isSubmitting ? "Scheduling..." : "Schedule Appointment"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default BookingEmbedPage;