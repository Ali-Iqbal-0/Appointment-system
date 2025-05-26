import React, { useState, useEffect, useRef, useCallback } from "react"; // Added useCallback
import {
  format, addMonths, subMonths, addDays, subDays, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek, isSameMonth, isSameDay, getDate, isWeekend,
  eachDayOfInterval, getHours, getMinutes, setHours, setMinutes, differenceInMinutes,
  getYear, getMonth, setYear, setMonth, isSameYear,
  parseISO // To parse date strings from API
} from 'date-fns';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Search, User, Check, X
} from 'lucide-react';
import { BASE_URL } from "../BaseUrl"; // Adjust path if needed

const APPOINTMENT_API_BASE_URL = `${BASE_URL}/api/appointments`;

// --- 1. CalendarsList Component with Search (Modified to use API appointments) ---
const CalendarsList = ({ appointments, onSearchSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredAppointments, setFilteredAppointments] = useState([]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredAppointments([]);
      return;
    }
    // Assuming appointments from API have customerName and consultingName populated
    const filtered = appointments.filter(app =>
      (app.customerId?.customerName?.toLowerCase() || '').includes(searchQuery.toLowerCase()) ||
      (app.itConsultingId?.consultingName?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );
    setFilteredAppointments(filtered);
  }, [searchQuery, appointments]);

  const handleClearSearch = () => {
    setSearchQuery('');
    setFilteredAppointments([]);
  };

  const handleResultClick = (app) => {
    onSearchSelect(parseISO(app.appointmentDateTime)); // Use parsed date
    setSearchQuery('');
    setFilteredAppointments([]);
  };

  return (
    <div className="pt-4 mt-auto">
      <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 px-1">CALENDARS (1)</h3>
      <div className="relative mb-4">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search size={16} className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search by customer/event"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="block w-full pl-9 pr-10 py-2 border border-gray-300 rounded-md text-sm placeholder-gray-400 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"
        />
        {searchQuery && (
          <button onClick={handleClearSearch} className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600">
            <X size={16} />
          </button>
        )}
      </div>
      {filteredAppointments.length > 0 && (
        <div className="mb-4 max-h-40 overflow-y-auto border border-gray-200 rounded-md shadow-sm">
          {filteredAppointments.map(app => (
            <button
              key={app._id} // Use _id from MongoDB
              onClick={() => handleResultClick(app)}
              className="w-full text-left px-3 py-2 hover:bg-indigo-50 transition-colors border-b last:border-b-0 border-gray-200 flex items-center justify-between"
            >
              <div>
                <div className="text-sm font-medium text-gray-800">{app.itConsultingId?.consultingName || 'Event'} - {app.customerId?.customerName || 'Customer'}</div>
                <div className="text-xs text-gray-500">{format(parseISO(app.appointmentDateTime), 'dd MMM, yyyy - hh:mm aa')}</div>
              </div>
              {/* Add a color indicator if your appointments have a color property */}
              {/* <div className={`w-3 h-3 rounded-sm ${app.color || 'bg-blue-500'}`}></div> */}
            </button>
          ))}
        </div>
      )}
      <div> {/* Placeholder for logged-in user's calendar */}
        <button className="flex items-center justify-between w-full p-2.5 rounded-md bg-indigo-600 text-white hover:bg-indigo-700 transition-colors duration-150">
          <div className="flex items-center">
            <span className="inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-400 mr-2.5">
              <User size={16} className="text-indigo-100" />
            </span>
            <span className="text-sm font-medium">My Calendar</span>
          </div>
          <Check size={20} className="text-indigo-200" />
        </button>
      </div>
    </div>
  );
};

// --- 2. MonthView Component (Mini Calendar - No changes needed from previous version) ---
const MonthView = ({ currentDisplayDate, selectedDate, onDateSelect, onMonthYearChange, miniCalendarView, setMiniCalendarView }) => { /* ... Same as before ... */ const daysOfWeek = ['M', 'T', 'W', 'T', 'F', 'S', 'S']; const handlePrev = () => { if (miniCalendarView === 'days') { onMonthYearChange(subMonths(currentDisplayDate, 1)); } else if (miniCalendarView === 'months') { onMonthYearChange(subMonths(currentDisplayDate, 12)); } else if (miniCalendarView === 'years') { onMonthYearChange(subMonths(currentDisplayDate, 12 * 10)); } }; const handleNext = () => { if (miniCalendarView === 'days') { onMonthYearChange(addMonths(currentDisplayDate, 1)); } else if (miniCalendarView === 'months') { onMonthYearChange(addMonths(currentDisplayDate, 12)); } else if (miniCalendarView === 'years') { onMonthYearChange(addMonths(currentDisplayDate, 12 * 10)); } }; const selectMonth = (monthIndex) => { const newDate = setMonth(currentDisplayDate, monthIndex); onMonthYearChange(newDate); setMiniCalendarView('days'); }; const selectYear = (year) => { const newDate = setYear(currentDisplayDate, year); onMonthYearChange(newDate); setMiniCalendarView('months'); }; const renderDaysView = () => { const monthStart = startOfMonth(currentDisplayDate); const startDate = startOfWeek(monthStart, { weekStartsOn: 1 }); const calendarDays = eachDayOfInterval({ start: startDate, end: addDays(startDate, 41) }); return (<div className="grid grid-cols-7">{calendarDays.map((dayInstance, index) => { const isCurrentMonthDay = isSameMonth(dayInstance, currentDisplayDate); const isSelDate = isSameDay(dayInstance, selectedDate); const dayNumber = getDate(dayInstance); const isWknd = isWeekend(dayInstance); let dayClasses = "text-xs flex items-center justify-center rounded-full w-7 h-7 mx-auto transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-indigo-300 focus:ring-opacity-50 "; if (!isCurrentMonthDay) dayClasses += "text-gray-300 cursor-default hover:bg-transparent"; else if (isSelDate) dayClasses += "bg-indigo-600 text-white font-bold cursor-pointer shadow-md"; else { dayClasses += isWknd ? "text-red-600 " : "text-gray-700 "; dayClasses += "hover:bg-gray-200 cursor-pointer"; } return (<div key={index} className="flex justify-center items-center h-9"><button onClick={() => isCurrentMonthDay && onDateSelect(dayInstance)} className={dayClasses} disabled={!isCurrentMonthDay}>{dayNumber}</button></div>); })}</div>); }; const renderMonthsView = () => { const months = Array.from({ length: 12 }, (_, i) => format(setMonth(new Date(), i), 'MMM')); const currentSelectedMonth = getMonth(currentDisplayDate); return (<div className="grid grid-cols-3 gap-2 p-1">{months.map((monthName, index) => (<button key={monthName} onClick={() => selectMonth(index)} className={`p-2 text-xs rounded-md hover:bg-indigo-100 transition-colors ${index === currentSelectedMonth ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'bg-gray-50 text-gray-700'}`}>{monthName}</button>))}</div>); }; const renderYearsView = () => { const currentYear = getYear(currentDisplayDate); const startYear = Math.floor(currentYear / 10) * 10 - 1; const years = Array.from({ length: 12 }, (_, i) => startYear + i); return (<div className="grid grid-cols-3 gap-2 p-1">{years.map((year) => (<button key={year} onClick={() => selectYear(year)} className={`p-2 text-xs rounded-md hover:bg-indigo-100 transition-colors ${year === currentYear ? 'bg-indigo-600 text-white font-semibold shadow-sm' : 'bg-gray-50 text-gray-700'}`}>{year}</button>))}</div>); }; return (<div className="select-none"><div className="flex items-center justify-between mb-3 px-1"><div className="flex items-center space-x-2"><button onClick={() => setMiniCalendarView('months')} className="text-sm font-semibold text-gray-800 hover:text-indigo-600 p-1 rounded transition-colors" aria-label="Select month">{format(currentDisplayDate, 'MMMM')}</button><button onClick={() => setMiniCalendarView('years')} className="text-sm font-semibold text-gray-800 hover:text-indigo-600 p-1 rounded transition-colors" aria-label="Select year">{format(currentDisplayDate, 'yyyy')}</button></div><div className="flex space-x-1"><button onClick={handlePrev} className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors" aria-label="Previous"><ChevronLeft size={16} /></button><button onClick={handleNext} className="p-1.5 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100 transition-colors" aria-label="Next"><ChevronRight size={16} /></button></div></div>{miniCalendarView === 'days' && (<div className="grid grid-cols-7 gap-px text-center text-xs text-gray-600 mb-2">{daysOfWeek.map((d, i) => <div key={i} className="font-medium py-1">{d}</div>)}</div>)}{miniCalendarView === 'days' && renderDaysView()}{miniCalendarView === 'months' && renderMonthsView()}{miniCalendarView === 'years' && renderYearsView()}</div>);};

// --- 3. LeftSidebar Component (No changes needed) ---
const LeftSidebar = ({ currentDisplayDate, selectedDate, onDateSelect, onMonthYearChange, miniCalendarView, setMiniCalendarView, appointments, onSearchSelect }) => { /* ... Same as before ... */ return (<div className="w-full h-full p-4 flex flex-col"><MonthView {...{ currentDisplayDate, selectedDate, onDateSelect, onMonthYearChange, miniCalendarView, setMiniCalendarView }} /><CalendarsList appointments={appointments} onSearchSelect={onSearchSelect} /></div>);};


// --- 4. DayView Component (Modified to use API appointment structure) ---
const DayView = ({ selectedDate, appointments }) => {
  const hourRowHeight = 60; // pixels
  const displayHours = Array.from({ length: 24 }, (_, i) => format(setHours(new Date(), i), "hh:00 aa"));
  const diagonalPatternStyle = { backgroundImage: `repeating-linear-gradient(-45deg, transparent, transparent 7px, rgba(229, 231, 235, 0.5) 7px, rgba(229, 231, 235, 0.5) 8px)`, backgroundSize: '14px 14px',};
  const dayViewBodyRef = useRef(null);
  
  // Filter appointments for the selected day and parse dates
  const appointmentsForDay = appointments
    .map(app => ({
      ...app,
      appointmentDateTime: parseISO(app.appointmentDateTime), // Ensure date is a Date object
      endTime: app.endTime ? parseISO(app.endTime) : addDays(parseISO(app.appointmentDateTime), app.durationMinutes / (24*60) ) // Calculate end time if not present from API
    }))
    .filter(app => isSameDay(app.appointmentDateTime, selectedDate));


  useEffect(() => { // Scroll to 8 AM logic
    if (dayViewBodyRef.current) {
      const eightAmSlot = dayViewBodyRef.current.querySelector('[data-hour="08:00 AM"]');
      if (eightAmSlot) dayViewBodyRef.current.scrollTop = eightAmSlot.offsetTop - dayViewBodyRef.current.offsetTop - Math.floor(hourRowHeight * 1.5); // Scroll slightly above 8 AM
      else dayViewBodyRef.current.scrollTop = 0;
    }
  }, [selectedDate]);

  const getAppointmentColor = (app) => {
    // Example: Derive color from eventType or a predefined color in the appointment
    if (app.itConsultingId?.eventType === 'one-on-one') return 'bg-sky-500 border-sky-600 from-sky-500 to-sky-600';
    if (app.itConsultingId?.eventType === 'group') return 'bg-green-500 border-green-600 from-green-500 to-green-600';
    return 'bg-indigo-500 border-indigo-600 from-indigo-500 to-indigo-600'; // Default
  };

  return (
    <div className="flex-1 flex flex-col bg-white overflow-hidden">
      <div className="flex items-stretch border-b border-gray-200 sticky top-0 bg-white z-20 h-[73px] flex-shrink-0 shadow-sm">
        <div className="w-24 flex flex-col items-center justify-center px-2 text-center border-r border-gray-200">
          <div className="text-xs font-semibold text-gray-700">PKT</div>
          <div className="text-[0.7rem] text-gray-500">(+05:00)</div>
        </div>
        <div className="flex-1 flex items-center justify-end px-4">
          <div className="text-right">
            <div className="text-lg font-semibold text-gray-800">{format(selectedDate, 'EEEE')}</div>
            <div className="text-3xl font-bold text-indigo-600 leading-none mt-0.5">{format(selectedDate, 'd')}</div>
          </div>
        </div>
      </div>
      <div ref={dayViewBodyRef} className="flex-1 relative overflow-y-auto">
        {displayHours.map((hourLabel, hourIndex) => (
          <div key={hourLabel} data-hour={hourLabel} className="flex border-b border-dashed border-gray-200" style={{ minHeight: `${hourRowHeight}px` }}>
            <div className="w-24 text-xs text-gray-500 p-2 pr-3 text-right flex items-start justify-end pt-1.5 flex-shrink-0">{hourLabel}</div>
            <div className="flex-1 border-l border-dashed border-gray-200 relative" style={diagonalPatternStyle}>
              {appointmentsForDay.map(app => {
                if (getHours(app.appointmentDateTime) !== hourIndex) return null;
                
                const startMinutes = getMinutes(app.appointmentDateTime);
                // Use app.durationMinutes if endTime is not directly available from backend or virtual
                const durationInMinutes = app.durationMinutes || differenceInMinutes(app.endTime, app.appointmentDateTime);

                const topOffset = (startMinutes / 60) * hourRowHeight;
                const appointmentHeight = (durationInMinutes / 60) * hourRowHeight;
                const colorClasses = getAppointmentColor(app);

                return (
                  <div
                    key={app._id} // Use _id from MongoDB
                    className={`absolute text-white text-[0.7rem] px-1.5 py-0.5 rounded shadow-md overflow-hidden mx-0.5 ${colorClasses} z-10 border`}
                    style={{ top: `${topOffset + 1}px`, left: '1px', right: '1px', height: `${Math.max(appointmentHeight - 2, 20)}px` }}
                    title={`${app.itConsultingId?.consultingName || 'Event'} - ${app.customerId?.customerName || 'Customer'} (${format(app.appointmentDateTime, 'p')} - ${format(app.endTime, 'p')})`}
                  >
                    <div className="font-semibold truncate leading-tight">{app.itConsultingId?.consultingName || 'Appointment'}</div>
                    <div className="truncate leading-tight text-white/80">{app.customerId?.customerName || 'Customer'}</div>
                    <div className="truncate leading-tight text-white/70 text-[0.65rem]">{format(app.appointmentDateTime, 'p')} - {format(app.endTime, 'p')}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};


// --- 5. Main FullCalendarWithAppointments Component ---
const FullCalendarWithAppointments = () => {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 24)); // Default to your example date
  const [currentDisplayDateInMiniCalendar, setCurrentDisplayDateInMiniCalendar] = useState(startOfMonth(new Date(2025, 4, 24)));
  const [miniCalendarView, setMiniCalendarView] = useState('days');
  const [allAppointments, setAllAppointments] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(true);
  // eslint-disable-next-line no-unused-vars
  const [errorAppointments, setErrorAppointments] = useState(null);


  const fetchAppointments = useCallback(async (currentSelectedDate) => {
    setIsLoadingAppointments(true);
    setErrorAppointments(null);
    try {
      // Fetch appointments for a range around the selectedDate for efficiency if needed,
      // or fetch all and filter client-side if dataset is small.
      // For now, fetching all appointments.
      const response = await fetch(`${APPOINTMENT_API_BASE_URL}/get`);
      // Example: Fetch for the current month of selectedDate
      // const monthStart = format(startOfMonth(currentSelectedDate), 'yyyy-MM-dd');
      // const monthEnd = format(endOfMonth(currentSelectedDate), 'yyyy-MM-dd');
      // const response = await fetch(`${APPOINTMENT_API_BASE_URL}/get?startDate=${monthStart}&endDate=${monthEnd}`);

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to fetch appointments: ${response.status}`);
      }
      const result = await response.json();
      if (result.success) {
        setAllAppointments(result.data);
      } else {
        throw new Error(result.message || 'Could not process appointments data.');
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setErrorAppointments(error.message);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, []);

  useEffect(() => {
    fetchAppointments(selectedDate);
  }, [selectedDate, fetchAppointments]); // Re-fetch when selectedDate changes (or implement more granular fetching)


  const handleDateSelect = (day) => {
    setSelectedDate(day);
    if (!isSameMonth(day, currentDisplayDateInMiniCalendar)) {
      setCurrentDisplayDateInMiniCalendar(startOfMonth(day));
    }
    setMiniCalendarView('days');
  };

  const handleMiniCalendarMonthYearChange = (newDate) => {
    setCurrentDisplayDateInMiniCalendar(newDate);
    // If changing month/year in mini calendar, update the main selected date to the first of that month
    // if it's not already in that month to keep views somewhat synced.
    if (!isSameMonth(newDate, selectedDate) || !isSameYear(newDate, selectedDate)) {
        const firstDayOfNewMonth = startOfMonth(newDate);
        setSelectedDate(firstDayOfNewMonth); // This will trigger re-fetch of appointments via its useEffect
    }
  };
  

  const handlePrevDayForDayView = () => {
    const newDate = subDays(selectedDate, 1);
    handleDateSelect(newDate); // Use handleDateSelect to keep logic consistent
  };

  const handleNextDayForDayView = () => {
    const newDate = addDays(selectedDate, 1);
    handleDateSelect(newDate); // Use handleDateSelect
  };

  const handleSearchSelect = (date) => {
    handleDateSelect(date); // Use handleDateSelect
  };

  // Sync mini-calendar if selectedDate's month/year changes (e.g., via prev/next day buttons)
  useEffect(() => {
    if (getYear(selectedDate) !== getYear(currentDisplayDateInMiniCalendar) ||
        getMonth(selectedDate) !== getMonth(currentDisplayDateInMiniCalendar)) {
      if (miniCalendarView === 'days') { // Only if the mini-calendar is in days view, otherwise user is picking month/year
        setCurrentDisplayDateInMiniCalendar(startOfMonth(selectedDate));
      }
    }
  }, [selectedDate, miniCalendarView, currentDisplayDateInMiniCalendar]);

  return (
    <div className="flex flex-col h-[calc(100vh-60px)] md:h-[calc(100vh-80px)] font-sans bg-slate-100 text-gray-800 overflow-hidden"> {/* Adjusted height for potential navbar */}
      <header className="flex items-center justify-between p-3.5 border-b border-slate-300 bg-white shadow-sm flex-shrink-0">
        <div className="flex items-center">
          <button className="mr-3 p-1.5 text-slate-600 hover:text-slate-900 rounded-full hover:bg-slate-200 transition-colors" aria-label="Back" onClick={() => window.history.back()}>
            <ArrowLeft size={24} strokeWidth={1.5} />
          </button>
          <h1 className="text-xl font-semibold text-slate-800">Calendar</h1>
        </div>
        <div className="flex items-center space-x-2">
          <button onClick={handlePrevDayForDayView} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors" aria-label="Previous day">
            <ChevronLeft size={20} strokeWidth={2} />
          </button>
          {/* Today Button */}
          <button 
            onClick={() => handleDateSelect(new Date())}
            className="px-3 py-1 text-xs font-medium text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-md border border-slate-300 transition-colors"
          >
            Today
          </button>
          <span className="text-sm font-medium text-slate-700 w-32 text-center tabular-nums">{format(selectedDate, 'dd MMM, yyyy')}</span>
          <button onClick={handleNextDayForDayView} className="p-1.5 text-slate-500 hover:text-slate-800 rounded-full hover:bg-slate-200 transition-colors" aria-label="Next day">
            <ChevronRight size={20} strokeWidth={2} />
          </button>
        </div>
        {/* Add more header controls here if needed, like view switchers (Day/Week/Month) */}
      </header>
      <main className="flex-1 grid grid-cols-[280px_1fr] overflow-hidden">
        <aside className="bg-white border-r border-slate-200 overflow-y-auto custom-scrollbar">
          <LeftSidebar
            currentDisplayDate={currentDisplayDateInMiniCalendar}
            selectedDate={selectedDate}
            onDateSelect={handleDateSelect}
            onMonthYearChange={handleMiniCalendarMonthYearChange}
            miniCalendarView={miniCalendarView}
            setMiniCalendarView={setMiniCalendarView}
            appointments={allAppointments} // Pass all fetched appointments for search
            onSearchSelect={handleSearchSelect}
          />
        </aside>
        <section className="bg-white overflow-hidden flex flex-col">
          {isLoadingAppointments ? 
            <div className="flex-1 flex items-center justify-center"><p className="text-gray-500">Loading appointments...</p></div> :
            <DayView selectedDate={selectedDate} appointments={allAppointments} />
          }
        </section>
      </main>
       {/* Global styles for scrollbar if needed outside AdminCenter's scope */}
       <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f5f9; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #cbd5e1; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #94a3b8; }
      `}</style>
    </div>
  );
};

export default FullCalendarWithAppointments;