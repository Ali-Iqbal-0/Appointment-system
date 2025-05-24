// src/components/WorkflowItem.js
import React, { useState, useRef, useEffect } from 'react';
import { Mail, MessageSquare, MoreHorizontal, Edit2, ToggleLeft, ToggleRight, Trash2 } from 'lucide-react';

const WorkflowItem = ({ workflow, onEditEmail, onEditDetails, onDelete, onToggleActive }) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const getEventTypeDisplay = (events) => {
    if (!events || events.length === 0) return 'N/A';
    const firstEvent = events[0];
    // Assuming consultingName is populated
    const initials = firstEvent.consultingName?.substring(0, 2).toUpperCase() || 'N/A'; 
    const name = firstEvent.consultingName || 'Unknown Event';
    const count = events.length > 1 ? ` +${events.length - 1}` : '';
    return (
      <div className="flex items-center" title={events.map(e => e.consultingName).join(', ')}>
        <span className="mr-2 inline-flex items-center justify-center h-6 w-6 rounded-full bg-indigo-100 text-indigo-700 text-xs font-semibold">
          {initials}
        </span>
        <span className="truncate">{name}</span>
        {count && <span className="ml-1 text-gray-500">{count}</span>}
      </div>
    );
  };

  const getTriggerConditionDisplay = (wf) => {
    const triggerText = wf.trigger === 'Appointment ends' ? 'appointment ends' : wf.trigger;
    if (wf.occurrence.condition === 'Immediately') {
      return `Immediately after ${triggerText}`;
    }
    return `${wf.occurrence.value} ${wf.occurrence.unit?.toLowerCase()} after ${triggerText}`;
  };

  const Icon = workflow.action === 'Send email' ? Mail : MessageSquare; // Or more complex logic

  return (
    <div 
      className="grid grid-cols-[3fr_2fr_2fr_auto] items-center gap-4 p-4 border-b border-gray-200 hover:bg-gray-50 transition-colors duration-150 group"
      // onClick={() => workflow.action === 'Send email' ? onEditEmail(workflow) : null} // Click whole row to edit email
      // Or make only name clickable for email edit
    >
      <div className="flex items-center space-x-3 cursor-pointer" onClick={() => workflow.action === 'Send email' ? onEditEmail(workflow) : null}>
        <Icon size={20} className="text-indigo-600 flex-shrink-0" />
        <span className="font-medium text-gray-800 truncate" title={workflow.name}>{workflow.name}</span>
      </div>
      <div className="text-sm text-gray-600 truncate">
        {getEventTypeDisplay(workflow.consultingEventIds)}
      </div>
      <div className="text-sm text-gray-600 truncate">
        {getTriggerConditionDisplay(workflow)}
      </div>
      <div className="relative opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsMenuOpen(prev => !prev);
          }}
          className="p-1.5 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-200"
        >
          <MoreHorizontal size={20} />
        </button>
        {isMenuOpen && (
          <div
            ref={menuRef}
            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-xl z-20 border border-gray-200 py-1"
          >
            <button
              onClick={(e) => { e.stopPropagation(); onEditDetails(workflow); setIsMenuOpen(false); }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              <Edit2 size={16} className="mr-2" /> Edit
            </button>
            {/* Replace with actual toggle functionality */}
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleActive(workflow); setIsMenuOpen(false); }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
            >
              {workflow.isActive === false ? <ToggleRight size={16} className="mr-2 text-green-500" /> : <ToggleLeft size={16} className="mr-2" />} 
              {workflow.isActive === false ? 'Mark as Active' : 'Mark as Inactive'}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onDelete(workflow._id); setIsMenuOpen(false); }}
              className="w-full text-left flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <Trash2 size={16} className="mr-2" /> Delete
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WorkflowItem;