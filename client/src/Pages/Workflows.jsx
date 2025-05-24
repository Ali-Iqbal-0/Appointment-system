// src/pages/Workflows.js
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, Plus, HelpCircle, Mail, MessageSquare, ArrowRight, X, ChevronDown, Settings, Zap, MessageCircle as MessageCircleIcon, ArrowLeft, Check } from 'lucide-react';
import { BASE_URL } from '../BaseUrl';
import { toast, Bounce } from 'react-toastify';
import EmailTemplateModal from './EmailTemplateModal'; // Adjusted path
import WorkflowItem from '../components/WorkflowItem'; // Assuming this exists
import WorkflowEditPanel from '../components/WorkflowEditPanel'; // Assuming this exists
import Swal from "sweetalert2";
// --- SVG Icons and Static Components ---
const NoWorkflowsIcon = () => (
    <svg width="120" height="120" viewBox="0 0 150 150" fill="none" xmlns="http://www.w3.org/2000/svg" className="mx-auto mb-6">
        <circle cx="75" cy="75" r="70" fill="#F3F4F6"/>
        <rect x="40" y="55" width="70" height="40" rx="8" fill="white" stroke="#E5E7EB" strokeWidth="2"/>
        <path d="M50 65H75" stroke="#A5B4FC" strokeWidth="2" strokeLinecap="round"/>
        <path d="M50 75H70" stroke="#C7D2FE" strokeWidth="2" strokeLinecap="round"/>
        <circle cx="95" cy="65" r="5" fill="#A5B4FC"/>
        <circle cx="95" cy="85" r="5" fill="#C7D2FE"/>
        <path d="M75 55V45L85 50L75 55Z" fill="#A5B4FC"/>
        <path d="M65 95V105L55 100L65 95Z" fill="#C7D2FE"/>
        <path d="M30 50 L32 50 M31 49 L31 51" stroke="#C7D2FE" strokeWidth="1.5"/>
        <path d="M120 50 L122 50 M121 49 L121 51" stroke="#A5B4FC" strokeWidth="1.5"/>
        <path d="M35 100 L37 100 M36 99 L36 101" stroke="#A5B4FC" strokeWidth="1.5"/>
        <path d="M115 100 L117 100 M116 99 L116 101" stroke="#C7D2FE" strokeWidth="1.5"/>
        <path d="M75 30 L77 30 M76 29 L76 31" stroke="#A5B4FC" strokeWidth="1.5"/>
        <path d="M75 120 L77 120 M76 119 L76 121" stroke="#C7D2FE" strokeWidth="1.5"/>
    </svg>
);

const TemplateCard = ({ icon: Icon, title, onClick }) => (
  <button
    onClick={onClick}
    className="bg-white p-6 rounded-xl shadow-lg hover:shadow-xl transition-shadow duration-200 text-center w-full border border-gray-200 hover:border-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 flex flex-col items-center justify-center h-full"
  >
    <div className="p-3 bg-indigo-100 rounded-lg mb-4 inline-block">
      <Icon className="w-7 h-7 text-indigo-600" />
    </div>
    <h3 className="text-sm font-semibold text-gray-700">{title}</h3>
  </button>
);

// --- Default Templates ---
const defaultThankYouEmailTemplate = {
  senderEmailConfig: 'super_admin',
  replyToEmailConfig: 'allocated_it_specialist',
  subject: 'Thanks for your appointment, %customername%!',
  bodyHtml: `<p>Hi %customername%,</p>
<p>Thank you for taking the time to attend the %servicename% appointment with %businessname%. We hope it was valuable for you.</p>
<p>If you have any immediate questions, please feel free to reach out.</p>
<p>Regards,<br>%businessname%</p>`,
  dateFormat: 'dd-MMM-yyyy',
};

const defaultFeedbackEmailTemplate = {
  senderEmailConfig: 'super_admin',
  replyToEmailConfig: 'allocated_it_specialist',
  subject: 'We value your feedback on your recent %servicename% appointment!',
  bodyHtml: `<p>Hi %customername%,</p>
<p>We hope you had a productive %servicename% appointment with %businessname%.</p>
<p>We are always looking to improve our services and would greatly appreciate it if you could take a few moments to share your feedback. Please click the link below to access a short survey: <br>[SURVEY_LINK_PLACEHOLDER]</p>
<p>Thank you for your time and input!</p>
<p>Regards,<br>%businessname%</p>`,
  dateFormat: 'dd-MMM-yyyy',
};

const defaultFollowUpEmailTemplate = {
  senderEmailConfig: 'super_admin',
  replyToEmailConfig: 'allocated_it_specialist',
  subject: 'Following up on your %servicename% appointment',
  bodyHtml: `<p>Hi %customername%,</p>
<p>Just a friendly follow-up regarding your recent %servicename% appointment with %businessname%.</p>
<p>We wanted to see if you have any further questions or if there's anything else we can assist you with at this time. Don't hesitate to reply to this email if you need anything.</p>
<p>We look forward to connecting with you again soon.</p>
<p>Regards,<br>%businessname%</p>`,
  dateFormat: 'dd-MMM-yyyy',
};

const defaultSmsTemplate = { body: "Hi %customername%, this is a reminder about your %servicename% appointment with %businessname%." };
const defaultCustomFunctionData = { functionName: "", parameters: {} };

const initialWorkflowFormState = {
  name: '',
  trigger: '',
  occurrence: {
    condition: '',
    value: 15,
    unit: 'Minutes'
  },
  consultingEventIds: [],
  action: '',
  emailTemplate: { ...defaultThankYouEmailTemplate },
  smsTemplate: { ...defaultSmsTemplate },
  customFunctionData: { ...defaultCustomFunctionData },
  isActive: true,
};

const triggerOptions = [
    { value: 'Booked', label: 'Booked' },
    { value: 'Rescheduled', label: 'Rescheduled' },
    { value: 'Cancelled', label: 'Cancelled' },
    { value: 'Appointment starts', label: 'Appointment starts' },
    { value: 'Appointment ends', label: 'Appointment ends' },
    { value: 'Marked as complete', label: 'Marked as complete' },
];
const occurrenceConditionOptions = [
    { value: 'Immediately', label: 'Immediately' },
    { value: 'After', label: 'After' },
    { value: 'Before', label: 'Before' },
];
const occurrenceUnitOptions = [
    { value: 'Minutes', label: 'Minutes' },
    { value: 'Hours', label: 'Hours' },
    { value: 'Days', label: 'Days' },
];
const actionOptions = [
    { value: 'Send email', label: 'Send email', icon: Mail },
    { value: 'Send SMS', label: 'Send SMS', icon: MessageCircleIcon },
    { value: 'Execute custom functions', label: 'Execute custom functions', icon: Zap },
];


const Workflows = () => {
  const [currentView, setCurrentView] = useState('list');
  const [activeTab, setActiveTab] = useState('email');
  const [searchTermList, setSearchTermList] = useState('');
  const [workflowForm, setWorkflowForm] = useState(initialWorkflowFormState);
  const [allConsultingEvents, setAllConsultingEvents] = useState([]);
  const [allWorkflows, setAllWorkflows] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedWorkflowForEmailEdit, setSelectedWorkflowForEmailEdit] = useState(null);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [selectedWorkflowForDetailsEdit, setSelectedWorkflowForDetailsEdit] = useState(null);
  const [isEditPanelOpen, setIsEditPanelOpen] = useState(false);

  const [isTriggerDropdownOpen, setIsTriggerDropdownOpen] = useState(false);
  const [triggerSearchTerm, setTriggerSearchTerm] = useState('');
  const triggerDropdownRef = useRef(null);
  const [isOccurrenceDropdownOpen, setIsOccurrenceDropdownOpen] = useState(false);
  const occurrenceDropdownRef = useRef(null);
  const [isActionDropdownOpen, setIsActionDropdownOpen] = useState(false);
  const actionDropdownRef = useRef(null);
  const [isCreateConsultingDropdownOpen, setIsCreateConsultingDropdownOpen] = useState(false);
  const [createConsultingSearchTerm, setCreateConsultingSearchTerm] = useState('');
  const createConsultingDropdownRef = useRef(null);

  const toastConfig = {
    position: "top-right",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: false,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
    theme: "light",
    transition: Bounce,
  };

  const fetchAllWorkflows = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/workflows/get`);
      if (!response.ok) throw new Error('Failed to fetch workflows');
      const data = await response.json();
      setAllWorkflows(data.success ? (data.data || []) : []);
    } catch (error) { 
        console.error("Error fetching workflows:", error); 
        setAllWorkflows([]); 
        toast.error("Could not load workflows.", toastConfig);
    }
    finally { setIsLoading(false); }
  }, [BASE_URL]);

  useEffect(() => { if (currentView === 'list') fetchAllWorkflows(); }, [currentView, fetchAllWorkflows]);

  const fetchConsultingEventsForForms = useCallback(async () => {
    if (allConsultingEvents.length > 0 && (currentView === 'workflow_form' || isEditPanelOpen)) return;
    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/consulting-events/get`);
      if (!response.ok) throw new Error('Failed to fetch consulting events');
      const data = await response.json();
      setAllConsultingEvents(data.success && Array.isArray(data.data) ? data.data : []);
    } catch (error) { 
        console.error('Error fetching consulting events:', error); 
        setAllConsultingEvents([]); 
        toast.error("Could not load consulting events.", toastConfig);
    }
    finally { setIsLoading(false); }
  }, [allConsultingEvents.length, currentView, isEditPanelOpen, BASE_URL]);

  useEffect(() => { if (currentView === 'workflow_form' || isEditPanelOpen) fetchConsultingEventsForForms(); }, [currentView, isEditPanelOpen, fetchConsultingEventsForForms]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (triggerDropdownRef.current && !triggerDropdownRef.current.contains(event.target)) setIsTriggerDropdownOpen(false);
      if (occurrenceDropdownRef.current && !occurrenceDropdownRef.current.contains(event.target)) setIsOccurrenceDropdownOpen(false);
      if (actionDropdownRef.current && !actionDropdownRef.current.contains(event.target)) setIsActionDropdownOpen(false);
      if (createConsultingDropdownRef.current && !createConsultingDropdownRef.current.contains(event.target)) setIsCreateConsultingDropdownOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const switchToCreateOptionsView = () => { setCurrentView('create_options'); setWorkflowForm(initialWorkflowFormState); };
  const switchToListView = () => {
    setCurrentView('list'); setWorkflowForm(initialWorkflowFormState); setIsEmailModalOpen(false); setIsEditPanelOpen(false);
    setSelectedWorkflowForEmailEdit(null); setSelectedWorkflowForDetailsEdit(null);
    setIsTriggerDropdownOpen(false); setTriggerSearchTerm(''); setIsOccurrenceDropdownOpen(false); setIsActionDropdownOpen(false);
    setIsCreateConsultingDropdownOpen(false); setCreateConsultingSearchTerm('');
  };

  const handleInputChange = (e) => { const { name, value } = e.target; setWorkflowForm((prev) => ({ ...prev, [name]: value })); };
  const handleNestedInputChange = (field, subField, value) => { setWorkflowForm(prev => ({ ...prev, [field]: { ...prev[field], [subField]: value }})); };
  const handleOccurrenceValueUnitChange = (subField, value) => { setWorkflowForm(prev => ({ ...prev, occurrence: { ...prev.occurrence, [subField]: subField === 'value' ? (value === '' ? '' : parseInt(value,10) || 0) : value }})); };
  const handleConsultingEventSelectForCreate = (eventId) => { setWorkflowForm((prev) => ({ ...prev, consultingEventIds: prev.consultingEventIds.includes(eventId) ? prev.consultingEventIds.filter((id) => id !== eventId) : [...prev.consultingEventIds, eventId]})); };
  const getSelectedConsultingNamesForCreate = () => { if (!allConsultingEvents.length || !workflowForm.consultingEventIds.length) return ''; return workflowForm.consultingEventIds.map(id => allConsultingEvents.find(e => e._id === id)?.consultingName).filter(Boolean).join(', ') || ''; };

  const handleSaveNewWorkflow = async () => {
    if (!workflowForm.name.trim()) { toast.warn('Workflow Name is required.', toastConfig); return; }
    if (!workflowForm.trigger) { toast.warn('Trigger condition is required.', toastConfig); return; }
    if (!workflowForm.occurrence.condition) { toast.warn('Occurrence condition is required.', toastConfig); return; }
    if ((workflowForm.occurrence.condition === 'After' || workflowForm.occurrence.condition === 'Before') && (workflowForm.occurrence.value == null || parseInt(workflowForm.occurrence.value, 10) <= 0 || !workflowForm.occurrence.unit )) {
        toast.warn('For "After" or "Before" occurrence, a valid positive value and a unit (Minutes/Hours/Days) are required.', toastConfig); return;
    }
    if (workflowForm.consultingEventIds.length === 0) { toast.warn('Please select at least one IT Consulting event.', toastConfig); return; }
    if (!workflowForm.action) { toast.warn('Perform action is required.', toastConfig); return; }
    if (workflowForm.action === 'Send email' && (!workflowForm.emailTemplate?.subject?.trim() || !workflowForm.emailTemplate?.bodyHtml?.trim())) { toast.warn('Email subject and body are required for email actions.', toastConfig); return; }
    if (workflowForm.action === 'Send SMS' && !workflowForm.smsTemplate?.body?.trim()) { toast.warn('SMS body is required for SMS actions.', toastConfig); return; }
    if (workflowForm.action === 'Execute custom functions' && !workflowForm.customFunctionData?.functionName?.trim()) { toast.warn('Function name is required for custom function actions.', toastConfig); return; }

    const payload = { ...workflowForm };
    if (payload.occurrence.condition === 'Immediately') {
        delete payload.occurrence.value; delete payload.occurrence.unit;
    } else if (payload.occurrence.value !== undefined) { payload.occurrence.value = parseInt(payload.occurrence.value, 10); }
    if (payload.action !== 'Send email') delete payload.emailTemplate;
    if (payload.action !== 'Send SMS') delete payload.smsTemplate;
    if (payload.action !== 'Execute custom functions') delete payload.customFunctionData;

    setIsLoading(true);
    try {
      const response = await fetch(`${BASE_URL}/api/workflows/create`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload) });
      const data = await response.json();
      if (response.ok && data.success) { 
        toast.success('Workflow created successfully!', toastConfig); 
        setAllWorkflows(prev => [data.data, ...prev].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))); 
        switchToListView(); 
      }
      else { toast.error(`Failed to create workflow: ${data.message || 'Unknown error'}`, toastConfig); }
    } catch (error) { 
        console.error('Error saving new workflow:', error); 
        toast.error('Server error while saving workflow.', toastConfig); 
    }
    finally { setIsLoading(false); }
  };

  const handleEditEmailContent = (workflow) => {
    setSelectedWorkflowForEmailEdit({
      _id: workflow._id,
      name: workflow.name, 
      emailTemplate: workflow.emailTemplate || defaultThankYouEmailTemplate,
    });
    setIsEmailModalOpen(true);
  };
  
  const handleSaveEmailTemplateUpdate = async (workflowId, updatedEmailTemplateData) => {
    setIsLoading(true);
    try {
      // Actual API call (replace with your backend logic)
      const response = await fetch(`${BASE_URL}/api/workflows/update/${workflowId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ emailTemplate: updatedEmailTemplateData }) 
      });
      const data = await response.json();
      if (response.ok && data.success) {
        toast.success('Email template updated successfully!', toastConfig);
        setAllWorkflows(prev => prev.map(wf => wf._id === workflowId ? { ...wf, emailTemplate: updatedEmailTemplateData } : wf));
      } else {
        toast.error(`Failed to update email template: ${data.message || 'Unknown error'}`, toastConfig);
      }
    } catch (error) {
      console.error('Error updating email template:', error);
      toast.error('Server error while updating email template.', toastConfig);
    } finally {
      setIsEmailModalOpen(false);
      setSelectedWorkflowForEmailEdit(null);
      setIsLoading(false);
    }
  };

  const handleEditWorkflowDetails = (workflow) => { setSelectedWorkflowForDetailsEdit(workflow); setIsEditPanelOpen(true); };
  
  const handleSaveWorkflowDetailUpdate = async (updatedWorkflowData) => { 
      setIsLoading(true);
      try {
          const response = await fetch(`${BASE_URL}/api/workflows/update/${updatedWorkflowData._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(updatedWorkflowData)
          });
          const data = await response.json();
          if (response.ok && data.success) {
              toast.success('Workflow details updated successfully!', toastConfig);
              setAllWorkflows(prev => prev.map(wf => wf._id === data.data._id ? data.data : wf).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)));
              setIsEditPanelOpen(false);
              setSelectedWorkflowForDetailsEdit(null);
          } else {
              toast.error(`Failed to update workflow: ${data.message || 'Unknown error'}`, toastConfig);
          }
      } catch (error) {
          console.error('Error updating workflow details:', error);
          toast.error('Server error while updating workflow details.', toastConfig);
      } finally {
          setIsLoading(false);
      }
  };

  const handleDeleteWorkflow = async (workflowId) => {
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "You won't be able to revert this!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Yes, delete it!',
      cancelButtonText: 'No, cancel'
    });
  
    if (result.isConfirmed) {
      setIsLoading(true);
      try {
        const response = await fetch(`${BASE_URL}/api/workflows/delete/${workflowId}`, {
          method: 'DELETE',
        });
        const data = await response.json();
  
        if (response.ok && data.success) {
          toast.success('Workflow deleted successfully.', {
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
          setAllWorkflows(prev => prev.filter(wf => wf._id !== workflowId));
        } else {
          Swal.fire('Error!', data.message || 'Failed to delete workflow.', 'error');
        }
      } catch (error) {
        toast.error('Server error while deleting workflow.', {
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
    } else if (result.dismiss === Swal.DismissReason.cancel) {
      toast.info('Your workflow is safe :)', {
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

  const handleToggleWorkflowActive = async (workflow) => {
      const updatedWorkflow = { ...workflow, isActive: !workflow.isActive };
      setIsLoading(true);
      try {
          const response = await fetch(`${BASE_URL}/api/workflows/update/${workflow._id}`, {
              method: 'PUT',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ isActive: updatedWorkflow.isActive }) 
          });
          const data = await response.json();
          if (response.ok && data.success) {
              toast.success(`Workflow ${updatedWorkflow.isActive ? 'activated' : 'deactivated'} successfully!`, toastConfig);
              setAllWorkflows(prev => prev.map(wf => wf._id === workflow._id ? { ...wf, isActive: updatedWorkflow.isActive } : wf));
          } else {
              toast.error(`Failed to toggle workflow status: ${data.message || 'Unknown error'}`, toastConfig);
          }
      } catch (error) {
          console.error('Error toggling workflow status:', error);
          toast.error('Server error while toggling workflow status.', toastConfig);
      } finally {
          setIsLoading(false);
      }
  };

  const handleTemplateSelect = (templateType) => {
    let newWorkflowName = ''; 
    let newEmailTemplate = null; 
    let newSmsTemplate = null; 
    let newAction = 'Send email';
    
    switch (templateType) {
      case 'thank-you-email': newWorkflowName = 'Send Thank You Email'; newEmailTemplate = { ...defaultThankYouEmailTemplate }; break;
      case 'feedback-email': newWorkflowName = 'Send Feedback Email'; newEmailTemplate = { ...defaultFeedbackEmailTemplate }; break;
      case 'follow-up-email': newWorkflowName = 'Send Follow-up Email'; newEmailTemplate = { ...defaultFollowUpEmailTemplate }; break;
      case 'thank-you-sms': case 'feedback-sms': case 'follow-up-sms':
        newAction = 'Send SMS';
        newWorkflowName = templateType.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()); 
        newSmsTemplate = { ...defaultSmsTemplate, body: `Hi %customername%, this is a ${newWorkflowName.toLowerCase()} for your %servicename% appointment with %businessname%.` };
        newEmailTemplate = null; 
        break;
      default: toast.warn(`Template type "${templateType}" setup is not fully implemented.`, toastConfig); return;
    }
    setWorkflowForm({ 
        ...initialWorkflowFormState, 
        name: newWorkflowName, 
        action: newAction, 
        emailTemplate: newEmailTemplate, 
        smsTemplate: newSmsTemplate,   
        trigger: 'Appointment ends', 
        occurrence: {condition: 'After', value: 15, unit: 'Minutes'}
    });
    setCurrentView('workflow_form');
  };

  const handleCreateCustomWorkflow = () => {
    setWorkflowForm({ ...initialWorkflowFormState, name: "", trigger: '', occurrence: {condition: '', value: 15, unit: 'Minutes'}, action: '', consultingEventIds: [], emailTemplate: null, smsTemplate: null, customFunctionData: null });
    setCurrentView('workflow_form');
  };

  const TabButton = ({ id, label }) => ( <button onClick={() => setActiveTab(id)} className={`px-4 py-2 text-sm font-medium rounded-md transition-colors duration-150 ${activeTab === id ? 'text-indigo-700 border-b-2 border-indigo-700' : 'text-gray-600 hover:text-gray-800'}`}>{label}</button> );
  const filteredWorkflowsForDisplay = allWorkflows.filter(wf => (activeTab === 'email' ? wf.action === 'Send email' : activeTab === 'sms' ? wf.action === 'Send SMS' : activeTab === 'custom' ? !['Send email', 'Send SMS'].includes(wf.action) : true) && wf.name.toLowerCase().includes(searchTermList.toLowerCase()));

  // ======================== RENDER LOGIC ========================
  if (currentView === 'create_options') {
    return (
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen flex flex-col items-center justify-center">
            <div className="w-full max-w-3xl">
                <div className="flex justify-end w-full mb-4 md:mb-8">
                    <button onClick={switchToListView} className="p-2 text-gray-500 hover:text-gray-700 rounded-full hover:bg-gray-100" aria-label="Close"> <X size={24} /> </button>
                </div>
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-800 mb-10 md:mb-12 text-center">How would you like to create your workflow?</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12">
                    <TemplateCard icon={Mail} title="Send Thank You Email" onClick={() => handleTemplateSelect('thank-you-email')} />
                    <TemplateCard icon={Mail} title="Send Feedback Email" onClick={() => handleTemplateSelect('feedback-email')} />
                    <TemplateCard icon={Mail} title="Send Follow-up Email" onClick={() => handleTemplateSelect('follow-up-email')} />
                    <TemplateCard icon={MessageSquare} title="Send Thank You SMS" onClick={() => handleTemplateSelect('thank-you-sms')} />
                    <TemplateCard icon={MessageSquare} title="Send Feedback SMS" onClick={() => handleTemplateSelect('feedback-sms')} />
                    <TemplateCard icon={MessageSquare} title="Send Follow-up SMS" onClick={() => handleTemplateSelect('follow-up-sms')} />
                </div>
                <div className="text-center">
                    <p className="text-sm text-gray-600 mb-3">Not looking for any of these workflows?</p>
                    <button onClick={handleCreateCustomWorkflow} className="text-indigo-600 hover:text-indigo-800 font-medium text-sm inline-flex items-center group">
                        Create new workflow <ArrowRight size={16} className="ml-1.5 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                </div>
            </div>
        </div>
    );
  }

  if (currentView === 'workflow_form') {
    const getSelectedLabel = (value, options, placeholder = "Select") => { const selected = options.find(opt => opt.value === value); return selected ? selected.label : placeholder; };
    const isOccurrenceAfterOrBefore = workflowForm.occurrence.condition === 'After' || workflowForm.occurrence.condition === 'Before';
    const filteredConsultingEventsForCreate = allConsultingEvents.filter(event => event.consultingName.toLowerCase().includes(createConsultingSearchTerm.toLowerCase()));

    return (
       <>
        <div className="p-6 md:p-8 bg-gray-50 min-h-screen flex items-center justify-center">
          <div className="bg-white shadow-xl rounded-lg w-full max-w-2xl p-6 sm:p-8">
            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={switchToCreateOptionsView}
                    className="text-sm font-medium text-gray-700 hover:text-indigo-600 flex items-center"
                >
                    <ArrowLeft size={18} className="mr-1.5" />
                    Back to Workflow Templates
                </button>
                <button
                    onClick={switchToListView}
                    className="p-1.5 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
                    aria-label="Close"
                >
                    <X size={20} />
                </button>
            </div>

            <h1 className="text-2xl font-bold text-gray-900 text-center mb-8">
                { workflowForm.action === 'Send email' && workflowForm.emailTemplate?.subject ? workflowForm.name : 'Create a New Workflow' }
            </h1>

            <div className="space-y-5">
              <div>
                <label htmlFor="workflowName" className="block text-sm font-medium text-gray-700 mb-1">Workflow Name <span className="text-red-500">*</span></label>
                <input type="text" id="workflowName" name="name" value={workflowForm.name} onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="E.g., Post-Appointment Thank You" />
              </div>

              <div className="relative" ref={triggerDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Triggers When <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setIsTriggerDropdownOpen(prev => !prev)}
                  className="w-full flex justify-between items-center text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 sm:text-sm">
                  <span className={!workflowForm.trigger ? 'text-gray-500' : 'text-gray-900'}>
                    {getSelectedLabel(workflowForm.trigger, triggerOptions, "Select Trigger")}
                  </span>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform ${isTriggerDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isTriggerDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-60 overflow-auto py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <div className="p-2 border-b border-gray-200">
                        <input type="text" placeholder="Search triggers..." value={triggerSearchTerm} onChange={e => setTriggerSearchTerm(e.target.value)}
                               className="w-full px-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"/>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                      {triggerOptions.filter(opt => opt.label.toLowerCase().includes(triggerSearchTerm.toLowerCase())).map(option => (
                        <li key={option.value} onClick={() => { setWorkflowForm(prev => ({...prev, trigger: option.value})); setIsTriggerDropdownOpen(false); setTriggerSearchTerm(''); }}
                          className="text-gray-900 cursor-pointer select-none relative py-2 px-4 hover:bg-indigo-50 hover:text-indigo-700">{option.label}</li> ))}
                       {triggerOptions.filter(opt => opt.label.toLowerCase().includes(triggerSearchTerm.toLowerCase())).length === 0 && <li className="text-gray-500 cursor-default select-none relative py-2 px-4">No triggers found.</li>}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative" ref={occurrenceDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Occurrence <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setIsOccurrenceDropdownOpen(prev => !prev)}
                  className="w-full flex justify-between items-center text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 sm:text-sm">
                  <span className={!workflowForm.occurrence.condition ? 'text-gray-500' : 'text-gray-900'}>
                    {getSelectedLabel(workflowForm.occurrence.condition, occurrenceConditionOptions, "Select Occurrence")}
                  </span>
                   <ChevronDown size={20} className={`text-gray-400 transition-transform ${isOccurrenceDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isOccurrenceDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-60 overflow-auto py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <ul className="max-h-48 overflow-y-auto">
                      {occurrenceConditionOptions.map(option => (
                        <li key={option.value} onClick={() => {
                            handleNestedInputChange('occurrence', 'condition', option.value);
                            if (option.value === 'Immediately') { handleOccurrenceValueUnitChange('value', ''); handleOccurrenceValueUnitChange('unit', 'Minutes'); } 
                            else if (!workflowForm.occurrence.value || workflowForm.occurrence.value <=0 || workflowForm.occurrence.condition === 'Immediately') { handleOccurrenceValueUnitChange('value', 15); handleOccurrenceValueUnitChange('unit', 'Minutes'); }
                            setIsOccurrenceDropdownOpen(false); }}
                          className="text-gray-900 cursor-pointer select-none relative py-2 px-4 hover:bg-indigo-50 hover:text-indigo-700">{option.label}</li> ))}
                    </ul>
                  </div>
                )}
              </div>
              {isOccurrenceAfterOrBefore && (
                <div className="grid grid-cols-2 gap-x-4">
                  <div>
                    <input type="number" id="occurrenceValue" name="value" min="1" value={workflowForm.occurrence.value} onChange={(e) => handleOccurrenceValueUnitChange('value', e.target.value)}
                           className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="Value (e.g. 15)" />
                  </div>
                  <div>
                    <select id="occurrenceUnit" name="unit" value={workflowForm.occurrence.unit} onChange={(e) => handleOccurrenceValueUnitChange('unit', e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm bg-white">
                      {occurrenceUnitOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                  </div>
                </div>
              )}

              <div className="relative" ref={createConsultingDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Choose IT Consulting <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setIsCreateConsultingDropdownOpen(prev => !prev)}
                  className="w-full flex justify-between items-center text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 sm:text-sm">
                  <span className={`${workflowForm.consultingEventIds.length === 0 ? "text-gray-500" : "text-gray-900"} truncate pr-2`}>
                    {getSelectedConsultingNamesForCreate() || "Select IT Consulting Event(s)"}
                  </span>
                  <ChevronDown size={20} className={`text-gray-400 transition-transform flex-shrink-0 ${isCreateConsultingDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isCreateConsultingDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-60 overflow-auto py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                    <div className="p-2 border-b border-gray-200 sticky top-0 bg-white z-10">
                        <div className="relative">
                            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
                            <input type="text" placeholder="Search IT Consulting events..." value={createConsultingSearchTerm} onChange={e => setCreateConsultingSearchTerm(e.target.value)}
                                   className="w-full pl-8 pr-3 py-1.5 border border-gray-300 rounded-md text-xs focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500"/>
                        </div>
                    </div>
                    <ul className="max-h-48 overflow-y-auto">
                    {isLoading && allConsultingEvents.length === 0 && <li className="text-gray-500 cursor-default select-none relative py-2 px-4">Loading events...</li>}
                    {!isLoading && allConsultingEvents.length === 0 && <li className="text-gray-500 cursor-default select-none relative py-2 px-4">No consulting events available. Create one first.</li>}
                    {!isLoading && filteredConsultingEventsForCreate.map(event => (
                      <li key={event._id} onClick={() => handleConsultingEventSelectForCreate(event._id)}
                          className={`cursor-pointer select-none relative py-2 px-4 flex items-center justify-between hover:bg-indigo-50 hover:text-indigo-700 ${workflowForm.consultingEventIds.includes(event._id) ? 'bg-indigo-100 text-indigo-700 font-semibold' : 'text-gray-900'}`}>
                        <span>{event.consultingName}</span>
                        {workflowForm.consultingEventIds.includes(event._id) && <Check size={16} className="text-indigo-600" />}
                      </li>
                    ))}
                    {!isLoading && filteredConsultingEventsForCreate.length === 0 && allConsultingEvents.length > 0 && (
                        <li className="text-gray-500 cursor-default select-none relative py-2 px-4">No events match "{createConsultingSearchTerm}".</li>
                    )}
                    </ul>
                  </div>
                )}
              </div>

              <div className="relative" ref={actionDropdownRef}>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perform Action <span className="text-red-500">*</span></label>
                <button type="button" onClick={() => setIsActionDropdownOpen(prev => !prev)}
                  className="w-full flex justify-between items-center text-left px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-indigo-500 sm:text-sm">
                    {workflowForm.action ?
                        (<span className="flex items-center text-gray-900">
                            {React.createElement(actionOptions.find(opt => opt.value === workflowForm.action)?.icon || Settings, {className: "w-4 h-4 mr-2 text-gray-500"})}
                            {getSelectedLabel(workflowForm.action, actionOptions, "Select Action")}
                        </span>)
                        : <span className="text-gray-500">Select Action</span>
                    }
                  <ChevronDown size={20} className={`text-gray-400 transition-transform ${isActionDropdownOpen ? 'rotate-180' : ''}`} />
                </button>
                {isActionDropdownOpen && (
                  <div className="absolute z-20 mt-1 w-full bg-white shadow-lg border border-gray-300 rounded-md max-h-60 overflow-auto py-1 text-base ring-1 ring-black ring-opacity-5 focus:outline-none sm:text-sm">
                     <ul className="max-h-48 overflow-y-auto">
                      {actionOptions.map(option => (
                        <li key={option.value} onClick={() => {
                            setWorkflowForm(prev => {
                                let newFormState = {...prev, action: option.value};
                                if (option.value === 'Send email' && !prev.emailTemplate) newFormState.emailTemplate = {...defaultThankYouEmailTemplate};
                                else if (option.value !== 'Send email') newFormState.emailTemplate = null;

                                if (option.value === 'Send SMS' && !prev.smsTemplate) newFormState.smsTemplate = {...defaultSmsTemplate};
                                else if (option.value !== 'Send SMS') newFormState.smsTemplate = null;
                                
                                if (option.value === 'Execute custom functions' && !prev.customFunctionData?.functionName) newFormState.customFunctionData = {...defaultCustomFunctionData};
                                else if (option.value !== 'Execute custom functions') newFormState.customFunctionData = null;
                                
                                return newFormState;
                            });
                            setIsActionDropdownOpen(false);
                        }} className="text-gray-900 cursor-pointer select-none relative py-2 px-4 hover:bg-indigo-50 hover:text-indigo-700 flex items-center">
                          {React.createElement(option.icon || Settings, {className: "w-4 h-4 mr-2 text-gray-500"})} {option.label}</li> ))}
                    </ul>
                  </div>
                )}
              </div>

              {workflowForm.action === 'Send email' && workflowForm.emailTemplate && (
                <div className="pt-1">
                  <button type="button" onClick={() => {
                        setSelectedWorkflowForEmailEdit({ _id: 'new', name: workflowForm.name }); 
                        setIsEmailModalOpen(true); 
                    }}
                    className="w-full flex justify-center py-2 px-4 border border-indigo-600 rounded-md shadow-sm text-sm font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Customize Email Template
                  </button>
                </div>
              )}
              {workflowForm.action === 'Send SMS' && workflowForm.smsTemplate && (
                 <div className="pt-1 space-y-2">
                    <label htmlFor="smsBody" className="block text-sm font-medium text-gray-700">SMS Message Body</label>
                    <textarea id="smsBody" name="body" rows="3" value={workflowForm.smsTemplate.body} onChange={(e) => handleNestedInputChange('smsTemplate', 'body', e.target.value)}
                              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 sm:text-sm"
                              placeholder="Hi %customername%, reminder for %servicename%..."></textarea>
                    <p className="text-xs text-gray-500">Use placeholders like %customername%, %servicename%.</p>
                </div>
              )}
              {workflowForm.action === 'Execute custom functions' && workflowForm.customFunctionData && (
                <div className="space-y-3 pt-1">
                    <div>
                        <label htmlFor="customFunctionName" className="block text-sm font-medium text-gray-700 mb-1">Function Name <span className="text-red-500">*</span></label>
                        <input type="text" id="customFunctionName" value={workflowForm.customFunctionData.functionName} onChange={(e) => handleNestedInputChange('customFunctionData', 'functionName', e.target.value)}
                               className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm" placeholder="e.g., updateZohoLeadStatus" />
                    </div>
                    <div>
                        <label htmlFor="customFunctionParams" className="block text-sm font-medium text-gray-700 mb-1">Parameters (JSON)</label>
                        <textarea id="customFunctionParams" rows="3" value={typeof workflowForm.customFunctionData.parameters === 'string' ? workflowForm.customFunctionData.parameters : JSON.stringify(workflowForm.customFunctionData.parameters || {}, null, 2) } onChange={(e) => {
                            try {
                                const parsed = JSON.parse(e.target.value);
                                handleNestedInputChange('customFunctionData', 'parameters', parsed);
                            } catch (err) {
                                handleNestedInputChange('customFunctionData', 'parameters', e.target.value); 
                            }
                        }}
                                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm font-mono text-xs" placeholder='{ "status": "Contacted", "leadId": "%customerid%" }' />
                        <p className="text-xs text-gray-500 mt-1">Enter valid JSON. Use placeholders if your function handles them.</p>
                    </div>
                </div>
              )}
              <div className="pt-5">
                <button onClick={handleSaveNewWorkflow} disabled={isLoading}
                  className="w-full flex justify-center py-2.5 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Creating...' : 'Create Workflow'}
                </button>
              </div>
            </div>
          </div>
        </div>
        {isEmailModalOpen && selectedWorkflowForEmailEdit?._id === 'new' && workflowForm.emailTemplate && (
            <EmailTemplateModal 
                isOpen={isEmailModalOpen} 
                onClose={() => { setIsEmailModalOpen(false); setSelectedWorkflowForEmailEdit(null);}}
                initialDetails={{
                    ...(workflowForm.emailTemplate), 
                    templateName: workflowForm.name || "New Email Template" 
                }}
                onSave={(updatedTemplate) => { 
                    setWorkflowForm(prev => ({...prev, emailTemplate: updatedTemplate})); 
                    setIsEmailModalOpen(false); 
                    setSelectedWorkflowForEmailEdit(null); 
                }} 
            />
        )}
       </>
    );
  }

  // Main List View
  return (
    <div className="p-6 md:p-8 bg-white min-h-screen">
      <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
        <h1 className="text-xl font-semibold text-gray-800">Workflows</h1>
        <div className="flex items-center gap-3 md:gap-4 w-full md:w-auto">
          <div className="relative flex-grow md:flex-grow-0 md:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input type="text" placeholder="Search Workflows" value={searchTermList} onChange={(e) => setSearchTermList(e.target.value)}
              className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500" />
          </div>
          <button onClick={switchToCreateOptionsView} className="btn-primary flex items-center gap-2 whitespace-nowrap text-sm py-2 px-4 rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
            <Plus size={18} /> Create Workflow
          </button>
          <button className="p-2 text-gray-500 hover:text-gray-700" aria-label="Help"><HelpCircle size={20} /></button>
        </div>
      </div>
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex space-x-1 -mb-px">
          <TabButton id="email" label="Email Workflows" />
          <TabButton id="sms" label="SMS Workflows" />
          <TabButton id="custom" label="Custom Workflows" />
        </nav>
      </div>
      <div className="grid grid-cols-[auto_minmax(0,3fr)_minmax(0,2fr)_minmax(0,2fr)_auto] items-center gap-4 px-4 py-2.5 border-b border-gray-200 bg-gray-50 text-xs font-medium text-gray-500 uppercase sticky top-0 z-10">
        <span className="w-8"></span> 
        <span>Workflow Name</span> <span>Event Types</span> <span>Trigger Condition</span> <span className="text-right">Actions</span>
      </div>
      <div className="mt-0">
        {isLoading && allWorkflows.length === 0 ? <p className="text-center py-10 text-gray-500">Loading workflows...</p> :
         filteredWorkflowsForDisplay.length === 0 ? (
          <div className="text-center py-16 md:py-24 flex flex-col items-center">
            <NoWorkflowsIcon />
            <h2 className="text-xl font-semibold text-gray-700 mb-2">No {activeTab} workflows found{searchTermList ? ' for "'+searchTermList+'"' : ''}.</h2>
            <p className="text-sm text-gray-500 mb-6">Create a new workflow to get started or try a different filter.</p>
            <button onClick={switchToCreateOptionsView} className="flex items-center gap-2 text-sm py-2 px-4 rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500">
              <Plus size={18} /> New Workflow
            </button>
          </div>
        ) : ( <div className="divide-y divide-gray-100">{filteredWorkflowsForDisplay.map(workflow => ( <WorkflowItem key={workflow._id} workflow={workflow} onEditEmail={handleEditEmailContent} onEditDetails={handleEditWorkflowDetails} onDelete={handleDeleteWorkflow} onToggleActive={handleToggleWorkflowActive} allConsultingEvents={allConsultingEvents} /> ))}</div> )}
      </div>
      {isEmailModalOpen && selectedWorkflowForEmailEdit && selectedWorkflowForEmailEdit._id !== 'new' && (
        <EmailTemplateModal
            isOpen={isEmailModalOpen}
            onClose={() => { setIsEmailModalOpen(false); setSelectedWorkflowForEmailEdit(null); }}
            initialDetails={{ 
                ...(selectedWorkflowForEmailEdit.emailTemplate || defaultThankYouEmailTemplate),
                templateName: selectedWorkflowForEmailEdit.name || "Edit Email Template"
            }}
            onSave={(updatedTemplate) => handleSaveEmailTemplateUpdate(selectedWorkflowForEmailEdit._id, updatedTemplate)}
        />
      )}
      {isEditPanelOpen && selectedWorkflowForDetailsEdit && ( <WorkflowEditPanel isOpen={isEditPanelOpen} onClose={() => { setIsEditPanelOpen(false); setSelectedWorkflowForDetailsEdit(null); }} workflowToEdit={selectedWorkflowForDetailsEdit} onSave={handleSaveWorkflowDetailUpdate} allConsultingEvents={allConsultingEvents} triggerOptions={triggerOptions} occurrenceConditionOptions={occurrenceConditionOptions} occurrenceUnitOptions={occurrenceUnitOptions} actionOptions={actionOptions} /> )}
    </div>
  );
};

export default Workflows;