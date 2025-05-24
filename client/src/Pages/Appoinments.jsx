// src/Pages/Appointments.jsx
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { BASE_URL } from '../BaseUrl';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, parse, startOfDay, endOfDay, addMinutes, differenceInDays, isValid } from 'date-fns';
import { toast,Bounce} from 'react-toastify';
// --- SVG Icons ---
const PlusIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
  </svg>
);

const CalendarIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const XMarkIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
  </svg>
);

const ChevronLeftIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
  </svg>
);

const ChevronRightIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
  </svg>
);

const UserPlusIconSVG = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M19 7.5v3m0 0v3m0-3h3m-3 0h-3m-2.25-4.125a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zM4 19.235v-.11a6.375 6.375 0 0112.75 0v.109A12.318 12.318 0 0110.374 21c-2.331 0-4.512-.645-6.374-1.766z" />
  </svg>
);

const PencilSquareIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12.56 0c.34-.059.678-.112 1.017-.165m11.543 0c-1.278 0-2.516.090-3.709.255m-9.834 0c.624-.09 1.273-.152 1.943-.19C6.784 5.559 8.94 5.332 11.25 5.332c2.308 0 4.465.226 6.217.457a48.098 48.098 0 011.943.191" />
  </svg>
);

const ClockIcon = ({ className }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

// --- Helper Functions ---
const getInitials = (name) => {
  if (!name) return '??';
  const words = name.split(' ');
  if (words.length > 1) return (words[0][0] + words[1][0]).toUpperCase();
  return (name.substring(0, 2)).toUpperCase();
};

const formatDuration = (hours, minutes) => {
  let parts = [];
  if (hours && parseInt(hours) > 0) parts.push(`${hours} hr${parseInt(hours) > 1 ? 's' : ''}`);
  if (minutes && parseInt(minutes) > 0) parts.push(`${minutes} mins`);
  return parts.join(' ') || 'N/A';
};

const countryCodes = [
  { code: "+1", name: "USA", flag: "🇺🇸" },
  { code: "+44", name: "UK", flag: "🇬🇧" },
  { code: "+91", name: "India", flag: "🇮🇳" },
  { code: "+92", name: "Pakistan", flag: "🇵🇰" },
  { code: "+61", name: "Australia", flag: "🇦🇺" },
  { code: "+86", name: "China", flag: "🇨🇳" },
];

const Appointments = () => {
  const [activeTab, setActiveTab] = useState('upcoming');
  const [isNewAppointmentPanelOpen, setIsNewAppointmentPanelOpen] = useState(false);

  const [allConsultingEvents, setAllConsultingEvents] = useState([]);
  const [allSpecialists, setAllSpecialists] = useState([]);
  const [allCustomers, setAllCustomers] = useState([]);

  const [selectedConsultingEvent, setSelectedConsultingEvent] = useState(null);
  const [selectedSpecialist, setSelectedSpecialist] = useState(null);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedTimeSlot, setSelectedTimeSlot] = useState('');

  const [isConsultingDropdownOpen, setIsConsultingDropdownOpen] = useState(false);
  const [isSpecialistDropdownOpen, setIsSpecialistDropdownOpen] = useState(false);
  const [isCustomerDropdownOpen, setIsCustomerDropdownOpen] = useState(false);
  const [isDateTimePickerOpen, setIsDateTimePickerOpen] = useState(false);
  const [isAddCustomerModalOpen, setIsAddCustomerModalOpen] = useState(false);

  const [consultingSearchTerm, setConsultingSearchTerm] = useState('');
  const [specialistSearchTerm, setSpecialistSearchTerm] = useState('');
  const [customerSearchTerm, setCustomerSearchTerm] = useState('');

  const [newCustomerName, setNewCustomerName] = useState('');
  const [newCustomerEmail, setNewCustomerEmail] = useState('');
  const [newCustomerCountryCode, setNewCustomerCountryCode] = useState('+92');
  const [newCustomerContact, setNewCustomerContact] = useState('');
  const [isSubmittingCustomer, setIsSubmittingCustomer] = useState(false);
  const [customerModalError, setCustomerModalError] = useState('');

  const [isNotesOpen, setIsNotesOpen] = useState(false);
  const [appointmentNotes, setAppointmentNotes] = useState('');
  const NOTES_MAX_LENGTH = 2000;

  const [paymentStatus, setPaymentStatus] = useState('due');
  const [paymentAmountInput, setPaymentAmountInput] = useState('');

  const [appointmentsData, setAppointmentsData] = useState([]);
  const [isLoadingAppointments, setIsLoadingAppointments] = useState(false);

  const [customStartDate, setCustomStartDate] = useState(null);
  const [customEndDate, setCustomEndDate] = useState(null);
  const [isCustomDatePanelOpen, setIsCustomDatePanelOpen] = useState(false);
  const customDateInputRef = useRef(null);
  const customDatePanelRef = useRef(null);

  const [isReschedulePanelOpen, setIsReschedulePanelOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);
  const [currentAppointmentToEdit, setCurrentAppointmentToEdit] = useState(null);
  const [activeAppointmentActions, setActiveAppointmentActions] = useState(null);
  const actionDropdownRef = useRef(null);

  const consultingDropdownRef = useRef(null);
  const specialistDropdownRef = useRef(null);
  const customerDropdownRef = useRef(null);
  const dateTimePickerRef = useRef(null);

  // --- Data Fetching ---
  const fetchConsultingEvents = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/consulting-events/get`);
      const result = await response.json();
      if (result.success) setAllConsultingEvents(result.data || []);
      else console.error("Failed to fetch consulting events:", result.message);
    } catch (error) {
      console.error("Error fetching consulting events:", error);
    }
  };

  const fetchSpecialists = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/users/getUsers`);
      const result = await response.json();
      if (result.success) setAllSpecialists(result.data || []);
      else console.error("Failed to fetch specialists:", result.message);
    } catch (error) {
      console.error("Error fetching specialists:", error);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/customers/get`);
      const result = await response.json();
      if (result.success) setAllCustomers(result.data || []);
      else {
        console.error("Failed to fetch customers:", result.message);
        setAllCustomers([]);
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
      setAllCustomers([]);
    }
  };

  // --- Form and Panel Management ---
  const resetFormStates = () => {
    setSelectedConsultingEvent(null);
    setSelectedSpecialist(null);
    setSelectedDate(new Date());
    setSelectedTimeSlot('');
    setConsultingSearchTerm('');
    setSpecialistSearchTerm('');
    setCustomerSearchTerm('');
    setIsNotesOpen(false);
    setAppointmentNotes('');
    setPaymentStatus('due');
    setPaymentAmountInput('');
  };

  const toggleNewAppointmentPanel = (open) => {
    setIsNewAppointmentPanelOpen(open);
    if (open) {
      resetFormStates();
      setCurrentAppointmentToEdit(null);
      setIsReschedulePanelOpen(false);

      if (allConsultingEvents.length === 0) fetchConsultingEvents();
      if (allSpecialists.length === 0) fetchSpecialists();
      if (allCustomers.length === 0) fetchCustomers();
    }
  };

  // --- Appointments Data & Filtering ---
  const fetchAppointmentsCallback = useCallback(async () => {
    setIsLoadingAppointments(true);
    let url = `${BASE_URL}/api/appointments/get`;
    const params = new URLSearchParams();

    if (activeTab === 'upcoming') params.append('type', 'upcoming');
    else if (activeTab === 'past') params.append('type', 'past');
    else if (activeTab === 'custom' && customStartDate && customEndDate) {
      if (isValid(customStartDate) && isValid(customEndDate)) {
        params.append('startDate', format(customStartDate, 'yyyy-MM-dd'));
        params.append('endDate', format(customEndDate, 'yyyy-MM-dd'));
      } else {
        setIsLoadingAppointments(false);
        setAppointmentsData([]);
        return;
      }
    } else if (activeTab === 'custom' && (!customStartDate || !customEndDate)) {
      setIsLoadingAppointments(false);
      setAppointmentsData([]);
      return;
    }

    if (params.toString()) url += `?${params.toString()}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      if (result.success) setAppointmentsData(result.data || []);
      else {
        console.error("Failed to fetch appointments:", result.message);
        setAppointmentsData([]);
      }
    } catch (error) {
      console.error("Error fetching appointments:", error);
      setAppointmentsData([]);
    } finally {
      setIsLoadingAppointments(false);
    }
  }, [activeTab, customStartDate, customEndDate, BASE_URL]);

  useEffect(() => {
    fetchAppointmentsCallback();
  }, [fetchAppointmentsCallback]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (consultingDropdownRef.current && !consultingDropdownRef.current.contains(event.target))
        setIsConsultingDropdownOpen(false);
      if (specialistDropdownRef.current && !specialistDropdownRef.current.contains(event.target))
        setIsSpecialistDropdownOpen(false);
      if (customerDropdownRef.current && !customerDropdownRef.current.contains(event.target))
        setIsCustomerDropdownOpen(false);
      if (dateTimePickerRef.current && !dateTimePickerRef.current.contains(event.target))
        setIsDateTimePickerOpen(false);
      if (
        customDatePanelRef.current &&
        !customDatePanelRef.current.contains(event.target) &&
        customDateInputRef.current &&
        !customDateInputRef.current.contains(event.target)
      )
        setIsCustomDatePanelOpen(false);
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target))
        setActiveAppointmentActions(null);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    const currentEventForForm = isReschedulePanelOpen && currentAppointmentToEdit ? currentAppointmentToEdit.itConsultingId : selectedConsultingEvent;
    if (currentEventForForm && currentEventForForm.priceType === 'paid') {
      if (isReschedulePanelOpen && currentAppointmentToEdit && currentAppointmentToEdit.pricePaid !== undefined) {
        setPaymentAmountInput(String(currentAppointmentToEdit.pricePaid));
      } else {
        setPaymentAmountInput(currentEventForForm.priceAmount || '0');
      }
    } else {
      setPaymentAmountInput('');
    }
  }, [selectedConsultingEvent, isReschedulePanelOpen, currentAppointmentToEdit]);

  const filteredConsultingEvents = allConsultingEvents.filter(event =>
    event.consultingName.toLowerCase().includes(consultingSearchTerm.toLowerCase())
  );
  const filteredSpecialists = allSpecialists.filter(specialist =>
    specialist.name.toLowerCase().includes(specialistSearchTerm.toLowerCase())
  );
  const filteredCustomers = allCustomers.filter(
    customer =>
      (customer.customerName && customer.customerName.toLowerCase().includes(customerSearchTerm.toLowerCase())) ||
      (customer.emailAddress && customer.emailAddress.toLowerCase().includes(customerSearchTerm.toLowerCase()))
  );

  const daysOfWeek = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];
  const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const getDaysInMonth = (year, month) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year, month) => new Date(year, month, 1).getDay();
  const currentYear = selectedDate.getFullYear();
  const currentMonth = selectedDate.getMonth();
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOfCurrentMonth = getFirstDayOfMonth(currentYear, currentMonth);
  const timeSlots = [
    "09:00 AM", "09:15 AM", "09:30 AM", "09:45 AM", "10:00 AM", "10:15 AM", "10:30 AM", "10:45 AM",
    "11:00 AM", "11:15 AM", "11:30 AM", "11:45 AM", "12:00 PM", "12:15 PM", "12:30 PM", "12:45 PM",
    "01:00 PM", "01:15 PM", "01:30 PM", "01:45 PM", "02:00 PM", "02:15 PM", "02:30 PM", "02:45 PM",
    "03:00 PM", "03:15 PM", "03:30 PM", "03:45 PM", "04:00 PM", "04:15 PM", "04:30 PM", "04:45 PM", "05:00 PM"
  ];
  const handlePrevMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1));
  const handleNextMonth = () => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1));
  const handleDateClick = (day) => setSelectedDate(new Date(currentYear, currentMonth, day));

  const handleOpenAddCustomerModal = () => {
    setIsAddCustomerModalOpen(true);
    setIsCustomerDropdownOpen(false);
    setNewCustomerName('');
    setNewCustomerEmail('');
    setNewCustomerCountryCode('+92');
    setNewCustomerContact('');
    setCustomerModalError('');
  };

  const handleAddCustomerSubmit = async (e) => {
    e.preventDefault();
    setCustomerModalError('');
    if (!newCustomerName || !newCustomerEmail || !newCustomerCountryCode || !newCustomerContact) {
      setCustomerModalError('All fields are required.');
      return;
    }
    setIsSubmittingCustomer(true);
    try {
      const response = await fetch(`${BASE_URL}/api/customers/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customerName: newCustomerName,
          emailAddress: newCustomerEmail,
          countryCode: newCustomerCountryCode,
          contactNumber: newCustomerContact,
        }),
      });
      const result = await response.json();
      if (result.success && result.data) {
        setAllCustomers(prev => [...prev, result.data]);
        setSelectedCustomer(result.data);
        setIsAddCustomerModalOpen(false);
      } else {
        setCustomerModalError(result.message || 'Failed to add customer.');
      }
    } catch (error) {
      console.error('Error adding customer:', error);
      setCustomerModalError('An error occurred. Please try again.');
    } finally {
      setIsSubmittingCustomer(false);
    }
  };

  const handleAddAppointment = async () => {
    if (!selectedConsultingEvent || !selectedCustomer || !selectedDate || !selectedTimeSlot) {
      toast.warn("Please fill all required fields: IT Consulting, Customer, Date, and Time.", {
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
    const appointmentPayload = {
      itConsultingId: selectedConsultingEvent._id,
      specialistId: selectedSpecialist ? selectedSpecialist._id : null,
      customerId: selectedCustomer._id,
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      selectedTimeSlot: selectedTimeSlot,
      notes: appointmentNotes,
      paymentStatus: selectedConsultingEvent.priceType === 'paid' ? paymentStatus : 'na',
      paymentAmountInput: selectedConsultingEvent.priceType === 'paid' ? paymentAmountInput : '0',
    };
    try {
      const response = await fetch(`${BASE_URL}/api/appointments/add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(appointmentPayload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Appointment added successfully!", {
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
        toggleNewAppointmentPanel(false);
        fetchAppointmentsCallback();
      } else {
        toast.error(`Failed to add appointment: ${result.message || 'Unknown error'}`, {
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
      toast.error("An error occurred while adding the appointment.", {
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
  };

  const handleRescheduleAppointment = async () => {
    const eventForReschedule = currentAppointmentToEdit?.itConsultingId;
    if (!currentAppointmentToEdit || !eventForReschedule || !selectedDate || !selectedTimeSlot) {
      toast.error("Error: Missing appointment data or new date/time for rescheduling.", {
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
    const reschedulePayload = {
      appointmentDate: format(selectedDate, 'yyyy-MM-dd'),
      selectedTimeSlot: selectedTimeSlot,
      notes: appointmentNotes,
      ...(eventForReschedule && eventForReschedule.priceType === 'paid' && {
        paymentStatus: paymentStatus,
        paymentAmountInput: paymentAmountInput,
      }),
    };
    try {
      const response = await fetch(`${BASE_URL}/api/appointments/update/${currentAppointmentToEdit._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reschedulePayload),
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Appointment rescheduled successfully!", {
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
        setIsReschedulePanelOpen(false);
        setCurrentAppointmentToEdit(null);
        resetFormStates();
        fetchAppointmentsCallback();
      } else {
        toast.error(`Failed to reschedule appointment: ${result.message}`, {
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
      toast.error("An error occurred while rescheduling the appointment.", {
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
  };

  const openReschedulePanel = (appointment) => {
    setCurrentAppointmentToEdit(appointment);
    setSelectedConsultingEvent(appointment.itConsultingId);
    setSelectedSpecialist(appointment.specialistId || null);
    setSelectedCustomer(appointment.customerId);

    const appDateTime = new Date(appointment.appointmentDateTime);
    setSelectedDate(appDateTime);
    setSelectedTimeSlot(format(appDateTime, 'hh:mm aa'));
    setAppointmentNotes(appointment.notes || '');
    setIsNotesOpen(!!appointment.notes);

    if (appointment.itConsultingId && appointment.itConsultingId.priceType === 'paid') {
      setPaymentStatus(appointment.paymentStatus || 'due');
      setPaymentAmountInput(String(appointment.pricePaid !== undefined ? appointment.pricePaid : appointment.originalPrice || '0'));
    } else {
      setPaymentStatus('na');
      setPaymentAmountInput('');
    }

    setIsNewAppointmentPanelOpen(false);
    setIsReschedulePanelOpen(true);
    setActiveAppointmentActions(null);
  };

  const openCancelModal = (appointment) => {
    setCurrentAppointmentToEdit(appointment);
    setIsCancelModalOpen(true);
    setActiveAppointmentActions(null);
  };

  const confirmCancelAppointment = async () => {
    if (!currentAppointmentToEdit) return;
    try {
      const response = await fetch(`${BASE_URL}/api/appointments/cancel/${currentAppointmentToEdit._id}`, {
        method: 'PUT',
      });
      const result = await response.json();
      if (result.success) {
        toast.success("Appointment cancelled successfully!", {
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
        setIsCancelModalOpen(false);
        setCurrentAppointmentToEdit(null);
        fetchAppointmentsCallback();
      } else {
        toast.error(`Failed to cancel appointment: ${result.message}`, {
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
      toast.error("An error occurred while cancelling the appointment.", {
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
  };

  const groupAppointmentsByDate = (appointmentsList) =>
    appointmentsList.reduce((acc, appointment) => {
      const dateObj = new Date(appointment.appointmentDateTime);
      if (!isValid(dateObj)) {
        console.warn("Invalid date for appointment:", appointment);
        return acc;
      }
      const dateStr = format(dateObj, 'dd-MMM-yyyy');
      if (!acc[dateStr]) acc[dateStr] = [];
      acc[dateStr].push(appointment);
      return acc;
    }, {});

  const getRelativeDateLabel = (dateStr) => {
    try {
      const appointmentDate = parse(dateStr, 'dd-MMM-yyyy', new Date());
      const today = startOfDay(new Date());
      const diff = differenceInDays(appointmentDate, today);
      if (diff === 0) return 'TODAY';
      if (diff === 1) return 'TOMORROW';
      if (diff === -1) return 'YESTERDAY';
    } catch (e) {
      return null;
    }
    return null;
  };

  const getConsultingEventDisplayString = (event) => {
    if (!event) return 'N/A';
    let display = formatDuration(event.durationHours, event.durationMinutes);
    if (event.priceType === 'paid' && event.priceAmount && parseFloat(event.priceAmount) > 0) {
      display += ` - Rs ${event.priceAmount}`;
    }
    return display;
  };

  const renderAppointmentTable = (appointmentsToList) => {
    if (isLoadingAppointments)
      return <div className="text-center py-10 text-gray-500">Loading appointments...</div>;
    if (!appointmentsToList || appointmentsToList.length === 0) {
      let message = "No appointments found.";
      if (activeTab === 'upcoming') message = "No upcoming appointments scheduled.";
      else if (activeTab === 'past') message = "No past appointments found.";
      else if (activeTab === 'custom' && (!customStartDate || !customEndDate))
        message = "Please select a date range to view appointments.";
      else if (activeTab === 'custom') message = "No appointments found for the selected dates.";
      return (
        <div className="text-center py-16">
          <CalendarIcon className="w-24 h-24 text-gray-300 mx-auto mb-6" />
          <h2 className="text-2xl font-semibold text-gray-700 mb-2">{message.split('.')[0]}</h2>
          <p className="text-gray-500 mb-8">{message.includes("select a date range") ? "" : "Organize your schedule by adding new appointments."}</p>
          {!message.includes("select a date range") && (
            <button
              onClick={() => toggleNewAppointmentPanel(true)}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all duration-150 ease-in-out flex items-center mx-auto"
            >
              <PlusIcon className="w-5 h-5 mr-2" /> New Appointment
            </button>
          )}
        </div>
      );
    }
    const groupedAppointments = groupAppointmentsByDate(appointmentsToList);
    const tableHeaders = ['Time', 'Booking ID', 'IT Consulting', 'IT Specialist', 'Customer', 'Payment', 'Price', 'Status']; // Added new header

    return (
      <div className="space-y-6">
        {Object.entries(groupedAppointments).map(([dateStr, dateAppointments]) => (
          <div key={dateStr}>
            <div className="flex justify-between items-center mb-2 pb-1 border-b border-gray-200">
              <div className="flex items-center">
                <h3 className="text-sm font-semibold text-gray-700">{dateStr}</h3>
                {getRelativeDateLabel(dateStr) && (
                  <span className="ml-2 text-xs font-bold text-purple-600 bg-purple-100 px-1.5 py-0.5 rounded">
                    {getRelativeDateLabel(dateStr)}
                  </span>
                )}
              </div>
              <span className="text-xs text-gray-500">{dateAppointments.length} Appointment{dateAppointments.length > 1 ? 's' : ''}</span>
            </div>
            <div className="bg-white shadow-sm border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200 table-fixed">
                <thead className="bg-gray-50">
                  <tr>
                    {tableHeaders.map(header => (
                      <th
                        key={header}
                        scope="col"
                        className={`px-4 py-2.5 text-left text-xs font-medium text-gray-500 uppercase tracking-wider ${
                          header === 'Time' ? 'w-28' :
                          header === 'Booking ID' ? 'w-24' :
                          header === 'IT Consulting' ? 'w-48' :
                          header === 'IT Specialist' ? 'w-32' :
                          header === 'Customer' ? 'w-32' :
                          header === 'Payment' ? 'w-24' :
                          header === 'Price' ? 'w-20' :
                          header === 'Status' ? 'w-28' : ''
                        }`}
                      >
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {dateAppointments.map(app => {
                    const appDateTime = new Date(app.appointmentDateTime);
                    const endTime = app.endTime ? new Date(app.endTime) : addMinutes(appDateTime, app.durationMinutes || 0);
                    if (!isValid(appDateTime) || !isValid(endTime)) return null;
                    return (
                      <tr key={app._id}>
                        <td className="px-4 py-3 text-xs text-gray-700">
                          <div className="flex items-center">
                            <ClockIcon className="w-3.5 h-3.5 text-gray-400 mr-1.5" />
                            {format(appDateTime, 'hh:mm aa')} - {format(endTime, 'hh:mm aa')}
                          </div>
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-500 truncate" title={app.bookingId}>
                          {app.bookingId}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {app.itConsultingId ? (
                            <div className="flex items-center">
                              <span className={`w-5 h-5 rounded-sm flex items-center justify-center text-white text-[.6rem] font-semibold mr-1.5 ${app.itConsultingId.eventType === 'one-on-one' ? 'bg-indigo-500' : 'bg-green-500'}`}>
                                {getInitials(app.itConsultingId.consultingName)}
                              </span>
                              <span className="text-gray-800 font-medium truncate" title={app.itConsultingId.consultingName}>
                                {app.itConsultingId.consultingName}
                              </span>
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 truncate" title={app.specialistId ? app.specialistId.name : 'Any Specialist'}>
                          {app.specialistId ? app.specialistId.name : 'Any Specialist'}
                        </td>
                        <td className="px-4 py-3 text-xs text-gray-700 truncate" title={app.customerId ? app.customerId.customerName : 'N/A'}>
                          {app.customerId ? app.customerId.customerName : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-xs">
                          <span
                            className={`capitalize px-2 py-0.5 inline-flex text-[.65rem] leading-5 font-semibold rounded-full ${
                              app.paymentStatus === 'paid' ? 'bg-green-100 text-green-800' :
                              app.paymentStatus === 'due' ? 'bg-yellow-100 text-yellow-800' :
                              app.originalPrice > 0 && app.paymentStatus === 'na' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-blue-100 text-blue-700'
                            }`}
                          >
                            {app.originalPrice === 0 ? 'Free' : app.paymentStatus === 'na' ? 'Due' : app.paymentStatus}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-xs">
                          {app.originalPrice > 0 ? (
                            <span className={`px-1.5 py-0.5 rounded-sm ${app.paymentStatus === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}`}>
                              Rs {app.originalPrice.toFixed(0)}
                            </span>
                          ) : (
                            <span className="px-1.5 py-0.5 rounded-sm bg-gray-100 text-gray-700">Free</span>
                          )}
                        </td>
                        
                        <td className="px-4 py-3 text-xs relative">
                          {app.status === 'upcoming' ? (
                            <div className="relative inline-block">
                              <button
                                onClick={() => setActiveAppointmentActions(activeAppointmentActions === app._id ? null : app._id)}
                                className={`capitalize px-3 py-1 inline-flex items-center text-xs font-medium rounded-md border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-purple-500 shadow-sm`}
                              >
                                {app.status}
                                <ChevronDownIcon className={`-mr-0.5 ml-1.5 h-3 w-3 transition-transform ${activeAppointmentActions === app._id ? 'rotate-180' : ''}`} />
                              </button>
                              {activeAppointmentActions === app._id && (
                                <div
                                  ref={actionDropdownRef}
                                  className="origin-top-left absolute left-0 mt-2 w-40 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-30"
                                >
                                  <div className="py-1" role="menu" aria-orientation="vertical">
                                    <button
                                      onClick={() => openReschedulePanel(app)}
                                      className="w-full text-left flex items-center px-3 py-2 text-xs text-gray-700 hover:bg-gray-100 hover:text-gray-900"
                                      role="menuitem"
                                    >
                                      <span className="w-2 h-2 bg-blue-500 rounded-full mr-2.5 flex-shrink-0"></span> Reschedule
                                    </button>
                                    <button
                                      onClick={() => openCancelModal(app)}
                                      className="w-full text-left flex items-center px-3 py-2 text-xs text-red-600 hover:bg-red-50 hover:text-red-700"
                                      role="menuitem"
                                    >
                                      <span className="w-2 h-2 bg-red-500 rounded-full mr-2.5 flex-shrink-0"></span> Cancel
                                    </button>
                                  </div>
                                </div>
                              )}
                            </div>
                          ) : (
                            <span
                              className={`capitalize px-2 py-0.5 inline-flex text-[.65rem] leading-5 font-semibold rounded-full ${
                                app.status === 'completed' ? 'bg-green-100 text-green-800' :
                                app.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {app.status}
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'upcoming':
      case 'past':
        return renderAppointmentTable(appointmentsData);
      case 'custom':
        return (
          <div>
            <div className="mb-4 relative" ref={customDateInputRef}>
              <input
                type="text"
                readOnly
                value={customStartDate && customEndDate ? `${format(customStartDate, 'dd MMM yyyy')} - ${format(customEndDate, 'dd MMM yyyy')}` : 'Select Date Range'}
                onClick={() => setIsCustomDatePanelOpen(prev => !prev)}
                className="form-input w-full sm:w-72 cursor-pointer py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500"
              />
              {isCustomDatePanelOpen && (
                <div ref={customDatePanelRef} className="absolute z-30 mt-1 bg-white shadow-xl border border-gray-200 rounded-md p-4 w-auto min-w-[300px] sm:min-w-[620px]">
                  <p className="text-sm font-medium text-gray-700 mb-3">Select Date Range</p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">Start Date</label>
                      <DatePicker
                        selected={customStartDate}
                        onChange={(date) => setCustomStartDate(date)}
                        selectsStart
                        startDate={customStartDate}
                        endDate={customEndDate}
                        inline
                        calendarClassName="border-none shadow-none"
                        wrapperClassName="w-full"
                      />
                    </div>
                    <div className="border-l border-gray-200 hidden sm:block"></div>
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-gray-700 mb-1">End Date</label>
                      <DatePicker
                        selected={customEndDate}
                        onChange={(date) => setCustomEndDate(date)}
                        selectsEnd
                        startDate={customStartDate}
                        endDate={customEndDate}
                        minDate={customStartDate}
                        inline
                        calendarClassName="border-none shadow-none"
                        wrapperClassName="w-full"
                      />
                    </div>
                  </div>
                  <div className="mt-4 flex justify-end gap-2 pt-3 border-t border-gray-200">
                    <button
                      onClick={() => {
                        setCustomStartDate(null);
                        setCustomEndDate(null);
                        setIsCustomDatePanelOpen(false);
                        fetchAppointmentsCallback();
                      }}
                      className="px-3 py-1.5 text-xs border border-gray-300 rounded-md hover:bg-gray-50 text-gray-700"
                    >
                      Clear
                    </button>
                    <button
                      onClick={() => {
                        setIsCustomDatePanelOpen(false);
                        fetchAppointmentsCallback();
                      }}
                      className="px-3 py-1.5 text-xs bg-purple-600 text-white rounded-md hover:bg-purple-700"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>
            {renderAppointmentTable(appointmentsData)}
          </div>
        );
      default:
        return null;
    }
  };

  const renderAppointmentFormPanel = (isRescheduleMode = false) => {
    const panelTitle = isRescheduleMode ? "Reschedule Appointment" : "New Appointment";
    const submitButtonText = isRescheduleMode ? "Reschedule Appointment" : "Add Appointment";
    const handleSubmit = isRescheduleMode ? handleRescheduleAppointment : handleAddAppointment;
    const effectiveConsultingEvent = isRescheduleMode && currentAppointmentToEdit ? currentAppointmentToEdit.itConsultingId : selectedConsultingEvent;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-30 z-40"
        onClick={() => {
          isRescheduleMode ? setIsReschedulePanelOpen(false) : toggleNewAppointmentPanel(false);
          if (isRescheduleMode || isNewAppointmentPanelOpen) resetFormStates();
        }}
      >
        <div
          className="fixed top-0 right-0 h-full w-full max-w-md bg-white shadow-xl z-50 transform transition-transform duration-300 ease-in-out flex flex-col"
          style={{ transform: (isNewAppointmentPanelOpen || isReschedulePanelOpen) ? 'translateX(0)' : 'translateX(100%)' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-5 border-b border-gray-200">
            <h3 className="text-xl font-semibold text-gray-800">{panelTitle}</h3>
            <button
              onClick={() => {
                isRescheduleMode ? setIsReschedulePanelOpen(false) : toggleNewAppointmentPanel(false);
                resetFormStates();
              }}
              className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
          </div>
          <div className="p-6 flex-grow overflow-y-auto space-y-6">
            {/* IT Consulting Dropdown */}
            <div className="relative" ref={consultingDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">IT Consulting</label>
              <button
                onClick={() => !isRescheduleMode && setIsConsultingDropdownOpen(prev => !prev)}
                disabled={isRescheduleMode}
                className={`w-full text-left flex justify-between items-center bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${isRescheduleMode ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
              >
                {effectiveConsultingEvent ? (
                  <div className="flex items-center">
                    <span className={`w-6 h-6 rounded-sm flex items-center justify-center text-white text-xs font-semibold mr-2 ${effectiveConsultingEvent.eventType === 'one-on-one' ? 'bg-indigo-500' : 'bg-green-500'}`}>
                      {getInitials(effectiveConsultingEvent.consultingName)}
                    </span>
                    <div>
                      <span className="block font-medium text-gray-800">{effectiveConsultingEvent.consultingName}</span>
                      <span className="block text-xs text-gray-500">{getConsultingEventDisplayString(effectiveConsultingEvent)}</span>
                    </div>
                  </div>
                ) : "Select IT Consulting"}
                {!isRescheduleMode && <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isConsultingDropdownOpen ? 'rotate-180' : ''}`} />}
              </button>
              {isConsultingDropdownOpen && !isRescheduleMode && (
                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search keywords"
                      className="form-input w-full text-sm"
                      value={consultingSearchTerm}
                      onChange={(e) => setConsultingSearchTerm(e.target.value)}
                    />
                  </div>
                  <ul>
                    {filteredConsultingEvents.map(event => (
                      <li
                        key={event._id}
                        onClick={() => {
                          setSelectedConsultingEvent(event);
                          setIsConsultingDropdownOpen(false);
                          setConsultingSearchTerm('');
                        }}
                        className="px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer flex items-center"
                      >
                        <span className={`w-7 h-7 rounded-sm flex items-center justify-center text-white text-xs font-semibold mr-3 ${event.eventType === 'one-on-one' ? 'bg-indigo-500' : 'bg-green-500'}`}>
                          {getInitials(event.consultingName)}
                        </span>
                        <div>
                          <span className="block font-medium">{event.consultingName}</span>
                          <span className="block text-xs text-gray-500">{getConsultingEventDisplayString(event)}</span>
                        </div>
                      </li>
                    ))}
                    {filteredConsultingEvents.length === 0 && (
                      <li className="px-3 py-2 text-sm text-gray-500 text-center">No events found.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            {/* IT Specialist Dropdown */}
            <div className="relative" ref={specialistDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">IT Specialist</label>
              <button
                onClick={() => !isRescheduleMode && setIsSpecialistDropdownOpen(prev => !prev)}
                disabled={isRescheduleMode}
                className={`w-full text-left flex justify-between items-center bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${isRescheduleMode ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
              >
                {selectedSpecialist ? (
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 text-xs font-semibold mr-2">
                      {getInitials(selectedSpecialist.name)}
                    </span>
                    <span className="text-gray-800">{selectedSpecialist.name}</span>
                  </div>
                ) : "Random IT Specialist"}
                {!isRescheduleMode && <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isSpecialistDropdownOpen ? 'rotate-180' : ''}`} />}
              </button>
              {isSpecialistDropdownOpen && !isRescheduleMode && (
                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border rounded-md max-h-60 overflow-auto">
                  <div className="p-2">
                    <input
                      type="text"
                      placeholder="Search keywords"
                      className="form-input w-full text-sm"
                      value={specialistSearchTerm}
                      onChange={(e) => setSpecialistSearchTerm(e.target.value)}
                    />
                  </div>
                  <ul>
                    {filteredSpecialists.map(specialist => (
                      <li
                        key={specialist._id}
                        onClick={() => {
                          setSelectedSpecialist(specialist);
                          setIsSpecialistDropdownOpen(false);
                          setSpecialistSearchTerm('');
                        }}
                        className="px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer flex items-center"
                      >
                        <span className="w-7 h-7 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 text-xs font-semibold mr-3">
                          {getInitials(specialist.name)}
                        </span>
                        {specialist.name}
                      </li>
                    ))}
                    {filteredSpecialists.length === 0 && (
                      <li className="px-3 py-2 text-sm text-gray-500 text-center">No specialists found.</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            {/* Date & Time Picker */}
            <div className="relative" ref={dateTimePickerRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date & Time</label>
              <button
                onClick={() => setIsDateTimePickerOpen(prev => !prev)}
                className="w-full text-left flex justify-between items-center bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500"
              >
                <span>
                  {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                  {selectedTimeSlot && ` at ${selectedTimeSlot}`}
                </span>
                <CalendarIcon className="w-5 h-5 text-gray-400" />
              </button>
              {isDateTimePickerOpen && (
                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border rounded-md p-3 flex flex-col sm:flex-row gap-3">
                  <div className="flex-shrink-0 w-full sm:w-60">
                    <div className="flex justify-between items-center mb-2 px-1">
                      <button onClick={handlePrevMonth} className="p-1.5 rounded-full hover:bg-gray-100">
                        <ChevronLeftIcon className="w-5 h-5 text-gray-600" />
                      </button>
                      <span className="font-semibold text-sm text-gray-700">{months[currentMonth]} {currentYear}</span>
                      <button onClick={handleNextMonth} className="p-1.5 rounded-full hover:bg-gray-100">
                        <ChevronRightIcon className="w-5 h-5 text-gray-600" />
                      </button>
                    </div>
                    <div className="grid grid-cols-7 gap-1 text-center text-xs text-gray-500 mb-1">
                      {daysOfWeek.map(day => <div key={day}>{day}</div>)}
                    </div>
                    <div className="grid grid-cols-7 gap-0.5">
                      {Array.from({ length: firstDayOfCurrentMonth }).map((_, i) => (
                        <div key={`empty-${i}`} className="p-1.5"></div>
                      ))}
                      {Array.from({ length: daysInCurrentMonth }).map((_, day) => (
                        <button
                          key={day + 1}
                          onClick={() => handleDateClick(day + 1)}
                          className={`p-1.5 text-xs rounded-full hover:bg-purple-100 ${
                            selectedDate.getDate() === (day + 1) && selectedDate.getMonth() === currentMonth && selectedDate.getFullYear() === currentYear
                              ? 'bg-purple-500 text-white font-semibold'
                              : 'text-gray-700'
                          }`}
                        >
                          {day + 1}
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="flex-grow border-t sm:border-t-0 sm:border-l border-gray-200 pt-3 sm:pt-0 sm:pl-3 max-h-60 overflow-y-auto">
                    <p className="text-xs font-medium text-gray-600 mb-2 text-center sm:text-left">Available Slots</p>
                    <div className="grid grid-cols-2 gap-2">
                      {timeSlots.map(slot => (
                        <button
                          key={slot}
                          onClick={() => setSelectedTimeSlot(slot)}
                          className={`p-2 text-xs rounded-md border ${
                            selectedTimeSlot === slot ? 'bg-purple-500 text-white border-purple-500' : 'border-gray-300 hover:bg-gray-100 text-gray-700'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
            {/* Customer Dropdown */}
            <div className="relative" ref={customerDropdownRef}>
              <label className="block text-sm font-medium text-gray-700 mb-1">Customer</label>
              <button
                onClick={() => !isRescheduleMode && setIsCustomerDropdownOpen(prev => !prev)}
                disabled={isRescheduleMode}
                className={`w-full text-left flex justify-between items-center bg-white border border-gray-300 rounded-md shadow-sm px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500 focus:border-purple-500 ${isRescheduleMode ? 'bg-gray-100 cursor-not-allowed opacity-70' : ''}`}
              >
                {selectedCustomer ? (
                  <div className="flex items-center">
                    <span className="w-6 h-6 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-semibold mr-2">
                      {getInitials(selectedCustomer.customerName)}
                    </span>
                    <span className="text-gray-800">{selectedCustomer.customerName}</span>
                  </div>
                ) : "Select Customer"}
                {!isRescheduleMode && <ChevronDownIcon className={`w-5 h-5 text-gray-400 transition-transform ${isCustomerDropdownOpen ? 'rotate-180' : ''}`} />}
              </button>
              {isCustomerDropdownOpen && !isRescheduleMode && (
                <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border rounded-md max-h-72 flex flex-col">
                  <div className="p-2 border-b">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="text-sm font-medium text-gray-700 px-1 whitespace-nowrap">Bookings</span>
                      <input
                        type="text"
                        placeholder="Enter to Search"
                        className="form-input flex-grow text-sm !py-1.5"
                        value={customerSearchTerm}
                        onChange={(e) => setCustomerSearchTerm(e.target.value)}
                      />
                    </div>
                    <button
                      onClick={handleOpenAddCustomerModal}
                      className="w-full flex items-center justify-center text-sm text-purple-600 hover:bg-purple-50 py-2 rounded-md font-medium"
                    >
                      <UserPlusIconSVG className="w-4 h-4 mr-2" /> New Customer
                    </button>
                  </div>
                  <ul className="overflow-auto flex-grow">
                    {filteredCustomers.map(customer => (
                      <li
                        key={customer._id}
                        onClick={() => {
                          setSelectedCustomer(customer);
                          setIsCustomerDropdownOpen(false);
                          setCustomerSearchTerm('');
                        }}
                        className="px-3 py-2.5 text-sm text-gray-700 hover:bg-purple-50 hover:text-purple-700 cursor-pointer flex items-center"
                      >
                        <span className="w-7 h-7 rounded-full bg-blue-200 flex items-center justify-center text-blue-700 text-xs font-semibold mr-3">
                          {getInitials(customer.customerName)}
                        </span>
                        <div>
                          <span className="block font-medium">{customer.customerName}</span>
                          <span className="block text-xs text-gray-500">{customer.emailAddress}</span>
                        </div>
                      </li>
                    ))}
                    {filteredCustomers.length === 0 && customerSearchTerm && (
                      <li className="px-3 py-2 text-sm text-gray-500 text-center">No result found.</li>
                    )}
                    {filteredCustomers.length === 0 && !customerSearchTerm && allCustomers.length > 0 && (
                      <li className="px-3 py-2 text-sm text-gray-500 text-center">Search for customers.</li>
                    )}
                    {allCustomers.length === 0 && !customerSearchTerm && (
                      <li className="px-3 py-2 text-sm text-gray-500 text-center">No customers found. Add one!</li>
                    )}
                  </ul>
                </div>
              )}
            </div>
            {/* Payment Details Section */}
            {effectiveConsultingEvent && effectiveConsultingEvent.priceType === 'paid' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Payment Details</label>
                <div className="flex mb-2">
                  {['due', 'paid'].map((status) => (
                    <button
                      key={status}
                      type="button"
                      onClick={() => setPaymentStatus(status)}
                      className={`capitalize px-4 py-1.5 text-sm font-medium rounded-md mr-2 focus:outline-none ${
                        paymentStatus === status ? 'bg-purple-600 text-white shadow-sm' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                      }`}
                    >
                      {status}
                    </button>
                  ))}
                </div>
                <div className="flex items-center">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-gray-300 bg-gray-50 text-gray-500 text-sm">Rs</span>
                  <input
                    type="number"
                    value={paymentAmountInput}
                    onChange={(e) => setPaymentAmountInput(e.target.value)}
                    disabled={paymentStatus === 'paid'}
                    className={`form-input flex-1 min-w-0 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500 ${
                      paymentStatus === 'paid' ? 'bg-gray-100 cursor-not-allowed' : ''
                    }`}
                    placeholder="0.00"
                  />
                  <span className="ml-3 text-sm text-gray-600">
                    To Be Paid: <span className="font-medium">Rs {effectiveConsultingEvent.priceAmount || '0'}</span>
                  </span>
                </div>
              </div>
            )}
            {/* Send Notifications Checkbox */}
            <div className="flex items-center">
              <input
                id="send-notifications"
                name="send-notifications"
                type="checkbox"
                className="h-4 w-4 text-purple-600 border-gray-300 rounded focus:ring-purple-500"
                defaultChecked
              />
              <label htmlFor="send-notifications" className="ml-2 block text-sm text-gray-900">
                Send notifications for customer
              </label>
            </div>
            {/* Notes Section */}
            <div>
              {!isNotesOpen ? (
                <button
                  onClick={() => setIsNotesOpen(true)}
                  className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                >
                  + Add Notes
                </button>
              ) : (
                <>
                  <label htmlFor="appointment-notes" className="block text-sm font-medium text-gray-700 mb-1">
                    Notes
                  </label>
                  <textarea
                    id="appointment-notes"
                    rows="4"
                    className="form-input w-full text-sm border-gray-300 rounded-md shadow-sm focus:border-purple-500 focus:ring-purple-500"
                    placeholder="Enter notes..."
                    value={appointmentNotes}
                    onChange={(e) => {
                      if (e.target.value.length <= NOTES_MAX_LENGTH) setAppointmentNotes(e.target.value);
                    }}
                    maxLength={NOTES_MAX_LENGTH}
                  />
                  <p className="mt-1 text-xs text-gray-500 text-right">
                    ({NOTES_MAX_LENGTH - appointmentNotes.length} characters left)
                  </p>
                </>
              )}
            </div>
          </div>
          <div className="p-5 border-t border-gray-200 bg-gray-50 flex justify-end">
            <button
              type="button"
              onClick={handleSubmit}
              className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2.5 px-6 rounded-lg shadow-md hover:shadow-lg transition-all"
            >
              {submitButtonText}
            </button>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 bg-gray-50 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-800 mb-3 sm:mb-0">Appointments</h1>
        <button
          onClick={() => {
            toggleNewAppointmentPanel(true);
            setIsReschedulePanelOpen(false);
            setCurrentAppointmentToEdit(null);
          }}
          className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-2 px-4 rounded-lg shadow hover:shadow-md transition-colors duration-150 flex items-center"
        >
          <PlusIcon className="w-5 h-5 mr-2" /> New Appointment
        </button>
      </div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="-mb-px flex space-x-6" aria-label="Tabs">
          {['upcoming', 'past', 'custom'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`whitespace-nowrap pb-3 px-1 border-b-2 font-medium text-sm capitalize ${
                activeTab === tab ? 'border-purple-500 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              {tab === 'custom' ? 'Custom Date' : tab}
            </button>
          ))}
        </nav>
      </div>
      <div>{renderMainContent()}</div>
      {(isNewAppointmentPanelOpen || isReschedulePanelOpen) && renderAppointmentFormPanel(isReschedulePanelOpen)}
      {isAddCustomerModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[60] flex items-center justify-center p-4">
          <div
            className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md transform transition-all duration-300 ease-out"
            style={{ transform: isAddCustomerModalOpen ? 'scale(1)' : 'scale(0.95)', opacity: isAddCustomerModalOpen ? 1 : 0 }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-gray-800">Add Customer</h3>
              <button
                onClick={() => setIsAddCustomerModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
              >
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>
            <form onSubmit={handleAddCustomerSubmit} className="space-y-4">
              <div>
                <label htmlFor="newCustomerName" className="block text-sm font-medium text-gray-700">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  id="newCustomerName"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                  className="mt-1 form-input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="newCustomerEmail" className="block text-sm font-medium text-gray-700">
                  Email Address <span className="text-red-500">*</span>
                </label>
                <input
                  type="email"
                  id="newCustomerEmail"
                  value={newCustomerEmail}
                  onChange={(e) => setNewCustomerEmail(e.target.value)}
                  className="mt-1 form-input w-full"
                  required
                />
              </div>
              <div>
                <label htmlFor="newCustomerContact" className="block text-sm font-medium text-gray-700">
                  Contact Number <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-md shadow-sm">
                  <select
                    id="newCustomerCountryCode"
                    value={newCustomerCountryCode}
                    onChange={(e) => setNewCustomerCountryCode(e.target.value)}
                    className="form-select rounded-none rounded-l-md border-r-0 focus:z-10 sm:text-sm"
                  >
                    {countryCodes.map(country => (
                      <option key={country.code} value={country.code}>
                        {country.flag} {country.code}
                      </option>
                    ))}
                  </select>
                  <input
                    type="tel"
                    id="newCustomerContact"
                    value={newCustomerContact}
                    onChange={(e) => setNewCustomerContact(e.target.value)}
                    className="form-input flex-1 min-w-0 block w-full rounded-none rounded-r-md sm:text-sm border-gray-300 focus:border-purple-500 focus:ring-purple-500"
                    placeholder="3001234567"
                    required
                  />
                </div>
              </div>
              {customerModalError && <p className="text-sm text-red-600 text-center">{customerModalError}</p>}
              <div className="flex justify-end space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddCustomerModalOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingCustomer}
                  className="px-4 py-2 text-sm font-medium text-white bg-purple-600 border border-transparent rounded-md shadow-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  {isSubmittingCustomer ? 'Adding...' : 'Add'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {isCancelModalOpen && currentAppointmentToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[70] flex items-center justify-center p-4">
          <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-sm">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-gray-800">Cancel Appointment</h3>
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 p-1"
              >
                <XMarkIcon className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600 mb-2">
              Are you sure you want to cancel the appointment for{' '}
              <span className="font-medium">{currentAppointmentToEdit.itConsultingId?.consultingName || 'this service'}</span>
              {currentAppointmentToEdit.customerId && ` with ${currentAppointmentToEdit.customerId?.customerName || 'this customer'}`}
              {` on ${format(new Date(currentAppointmentToEdit.appointmentDateTime), 'MMM d, yyyy hh:mm aa')}`}?
            </p>
            <p className="text-xs text-gray-500 mb-6">This action cannot be undone.</p>
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setIsCancelModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none"
              >
                Keep Appointment
              </button>
              <button
                type="button"
                onClick={confirmCancelAppointment}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Yes, Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Appointments;