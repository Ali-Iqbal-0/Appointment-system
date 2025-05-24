// src/components/WorkflowEditPanel.js
import React, { useState, useEffect, useRef } from 'react';
import { X, Search, ChevronDown, ChevronUp } from 'lucide-react';
import { BASE_URL } from '../BaseUrl'; // Assuming BaseUrl is in src/
import { toast,Bounce} from 'react-toastify';

const WorkflowEditPanel = ({ isOpen, onClose, workflowToEdit, onSave, allConsultingEvents: initialConsultingEvents }) => {
  const [formState, setFormState] = useState(null);
  const [allConsultingEvents, setAllConsultingEvents] = useState(initialConsultingEvents || []);
  const [isConsultingDropdownOpen, setIsConsultingDropdownOpen] = useState(false);
  const [consultingSearchTerm, setConsultingSearchTerm] = useState('');
  const consultingDropdownRef = useRef(null);

  useEffect(() => {
    if (workflowToEdit) {
      // Deep copy to prevent direct mutation, ensure occurrence is copied properly
      const copiedWorkflow = JSON.parse(JSON.stringify(workflowToEdit));
      setFormState({
        ...copiedWorkflow,
        consultingEventIds: copiedWorkflow.consultingEventIds.map(event => event._id || event), // Store only IDs
        occurrence: { // Ensure all parts of occurrence are present
            condition: copiedWorkflow.occurrence?.condition || 'After',
            value: copiedWorkflow.occurrence?.value || 15,
            unit: copiedWorkflow.occurrence?.unit || 'Minutes',
        }
      });
    } else {
      setFormState(null);
    }
  }, [workflowToEdit]);
  
  useEffect(() => { // Fetch consulting events if not provided or empty
    if (isOpen && (!allConsultingEvents || allConsultingEvents.length === 0)) {
      fetchConsultingEventsInternal();
    }
  }, [isOpen, allConsultingEvents]);


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (consultingDropdownRef.current && !consultingDropdownRef.current.contains(event.target)) {
        setIsConsultingDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchConsultingEventsInternal = async () => {
    try {
      const response = await fetch(`${BASE_URL}/api/consulting-events/get`);
      if (!response.ok) throw new Error('Failed to fetch');
      const data = await response.json();
      if (data.success) setAllConsultingEvents(data.data);
    } catch (error) {
      console.error("Error fetching consulting events for panel:", error);
    }
  };

  if (!isOpen || !formState) return null;

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({ ...prev, [name]: value }));
  };

  const handleOccurrenceChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => {
      const newOccurrence = { ...prev.occurrence, [name]: value };
      if (name === 'condition' && value === 'Immediately') {
        newOccurrence.value = '';
        newOccurrence.unit = 'Minutes';
      } else if (name === 'condition' && value === 'After' && (prev.occurrence.condition === 'Immediately' || !prev.occurrence.value)) {
        newOccurrence.value = 15; // Default if switching back
        newOccurrence.unit = 'Minutes';
      }
      return { ...prev, occurrence: newOccurrence };
    });
  };

  const handleConsultingEventSelect = (eventId) => {
    setFormState(prev => ({
      ...prev,
      consultingEventIds: prev.consultingEventIds.includes(eventId)
        ? prev.consultingEventIds.filter(id => id !== eventId)
        : [...prev.consultingEventIds, eventId],
    }));
  };

  const getSelectedConsultingNames = () => {
    if (!allConsultingEvents.length || !formState.consultingEventIds.length) {
      return 'Select IT Consulting';
    }
    return formState.consultingEventIds
      .map(id => allConsultingEvents.find(e => e._id === id)?.consultingName)
      .filter(Boolean)
      .join(', ') || 'Select IT Consulting';
  };

  const filteredConsultingEvents = allConsultingEvents.filter(event =>
    event.consultingName.toLowerCase().includes(consultingSearchTerm.toLowerCase())
  );

  const isOccurrenceAfter = formState.occurrence?.condition === 'After';

  const handleSubmit = (e) => {
    e.preventDefault();
     // Basic Validations
    if (!formState.name.trim()) {
      toast.warn('Workflow Name is required.', {
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
    if (formState.occurrence.condition === 'After' && (!formState.occurrence.value || parseInt(formState.occurrence.value, 10) <= 0)) {
      toast.warn('Please enter a valid number for Occurrence if "After" is selected.', {
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
    if (formState.consultingEventIds.length === 0) {
      toast.warn('Please select at least one IT Consulting event.', {
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
    onSave(formState);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-40 flex justify-end">
      <div className={`w-full max-w-md h-full bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Workflow Information</h2>
          <button onClick={onClose} className="p-1 text-gray-500 hover:text-gray-700 rounded-full"><X size={20} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto h-[calc(100%-120px)]">
          <div>
            <label htmlFor="panel_workflowName" className="block text-sm font-medium text-gray-700 mb-1">Workflow Name *</label>
            <input
              type="text" id="panel_workflowName" name="name"
              value={formState.name} onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Occurrence *</label>
            <div className="flex items-center space-x-2">
              <select name="condition" value={formState.occurrence.condition} onChange={handleOccurrenceChange}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-indigo-500">
                <option value="After">After</option>
                <option value="Immediately">Immediately</option>
              </select>
              <input name="value" type="number" min="1" value={formState.occurrence.value} onChange={handleOccurrenceChange}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-md ${!isOccurrenceAfter ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!isOccurrenceAfter} />
              <select name="unit" value={formState.occurrence.unit} onChange={handleOccurrenceChange}
                className={`flex-1 px-3 py-2 border border-gray-300 rounded-md ${!isOccurrenceAfter ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                disabled={!isOccurrenceAfter}>
                <option value="Minutes">Minutes</option>
                <option value="Hours">Hours</option>
              </select>
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Perform Action *</label>
            <select 
                name="action" 
                value={formState.action} 
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            >
                <option value="Send email">Send email</option>
                <option value="Send SMS">Send SMS</option>
                {/* Add other actions if any */}
            </select>
          </div>


          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Triggers When *</label>
            <input type="text" name="trigger" value={formState.trigger} readOnly
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-100 cursor-not-allowed" />
          </div>

          <div className="relative" ref={consultingDropdownRef}>
            <label className="block text-sm font-medium text-gray-700 mb-1">Associated IT Consulting *</label>
            <div onClick={() => setIsConsultingDropdownOpen(!isConsultingDropdownOpen)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md bg-white cursor-pointer flex justify-between items-center">
              <span>{getSelectedConsultingNames()}</span>
              {isConsultingDropdownOpen ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
            </div>
            {isConsultingDropdownOpen && (
              <div className="absolute z-20 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-48 overflow-y-auto">
                <div className="p-2 sticky top-0 bg-white border-b">
                  <input type="text" placeholder="Search..." value={consultingSearchTerm} onChange={e => setConsultingSearchTerm(e.target.value)}
                    className="w-full pl-8 pr-2 py-1.5 border border-gray-300 rounded-md text-sm" />
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" style={{top: '1.3rem'}}/>
                </div>
                {allConsultingEvents.length === 0 ? <p className="p-2 text-sm text-gray-500">Loading...</p> :
                 filteredConsultingEvents.map(event => (
                  <label key={event._id} className="flex items-center px-3 py-2 hover:bg-gray-100 cursor-pointer">
                    <input type="checkbox" value={event._id}
                      checked={formState.consultingEventIds.includes(event._id)}
                      onChange={() => handleConsultingEventSelect(event._id)}
                      className="form-checkbox h-4 w-4 text-indigo-600 mr-2" />
                    <span className="text-sm">{event.consultingName}</span>
                  </label>
                ))}
                 {filteredConsultingEvents.length === 0 && allConsultingEvents.length > 0 && <p className="p-2 text-sm text-gray-500">No results.</p>}
              </div>
            )}
          </div>
        </form>
        <div className="p-4 border-t flex justify-end space-x-2">
          <button type="button" onClick={onClose}
            className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
          <button type="submit" onClick={handleSubmit}
            className="px-4 py-2 text-sm bg-indigo-600 text-white rounded-md hover:bg-indigo-700">Save</button>
        </div>
      </div>
    </div>
  );
};

export default WorkflowEditPanel;