// src/components/EmailTemplateModal.js
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronDown } from 'lucide-react';
import JoditEditor from 'jodit-react';

const VariableInserter = ({ onInsert }) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const variables = {
    Business: ['Business Name', 'Business Contact Number'],
    Staff: ['Staff Name', 'Staff Email', 'Staff Contact Number', 'Staff Timezone'],
    Workspace: ['Workspace Booking URL', 'Workspace'],
    Service: ['IT Consulting Name', /* Renamed from 'Service Name' for clarity */ 'Service Booking URL', 'Service Description', 'Buffer Time', 'Pre-buffer', 'Post-buffer'],
    Customer: ['Customer Name', 'Customer Email', 'Customer Contact Number', 'Customer First Name', 'Customer Last Name'],
    Appointment: ['Appointment From Date', 'Appointment To Date', 'Booking Id', 'Booking Summary URL', 'Booknow Link', 'Meeting Details', 'Meeting Info', 'Meeting Key', 'Meeting Joinlink', 'Meeting Startlink', 'In-person Location Name', 'In-person Location Details'],
  };

  const formatVariable = (label) => `%${label.toLowerCase().replace(/\s+/g, '')}%`;

  const handleInsert = (label) => {
    onInsert(formatVariable(label));
    setIsOpen(false);
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);


  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div>
        <button
          type="button"
          className="inline-flex justify-center items-center rounded-md border border-transparent shadow-sm px-3 py-1.5 bg-indigo-600 text-xs font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          onClick={() => setIsOpen(!isOpen)}
        >
          Insert Variable
          <ChevronDown className="-mr-0.5 ml-1 h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      {isOpen && (
        <div className="origin-top-right absolute right-0 mt-2 w-72 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50 max-h-72 overflow-y-auto">
          <div className="py-1" role="menu" aria-orientation="vertical" aria-labelledby="options-menu">
            {Object.entries(variables).map(([category, items]) => (
              <div key={category}>
                <p className="px-3 py-1.5 text-xs font-semibold text-gray-500 bg-gray-50 sticky top-0 z-10">{category}</p>
                {items.map(item => (
                  <a
                    key={item}
                    href="#"
                    onClick={(e) => { e.preventDefault(); handleInsert(item); }}
                    className="block px-3 py-1.5 text-xs text-gray-700 hover:bg-indigo-50 hover:text-indigo-600"
                    role="menuitem"
                  >
                    {item}
                  </a>
                ))}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};


const EmailTemplateModal = ({ isOpen, onClose, initialDetails, onSave }) => {
  const [senderEmailConfig, setSenderEmailConfig] = useState('');
  const [replyToEmailConfig, setReplyToEmailConfig] = useState('');
  const [subject, setSubject] = useState('');
  const [bodyHtml, setBodyHtml] = useState('');
  const [dateFormat, setDateFormat] = useState('dd-MMM-yyyy');
  
  const editorRef = useRef(null); // Changed from 'editor' to 'editorRef' for clarity with Jodit instance
  const subjectInputRef = useRef(null);

  const joditConfig = {
    readonly: false,
    height: 350, // Adjusted height
    // toolbarAdaptive: false, // Makes toolbar always visible, but can take space. Default is true.
    // theme: 'default', // Options: default, dark
    buttons: [
        'source', '|',
        'paragraph', 'bold', 'italic', 'underline', 'strikethrough', '|',
        'font', 'fontsize', '|',
        'brush', 'background', '|', // brush is text color, background is highlight color
        'align', 'outdent', 'indent', '|',
        'ul', 'ol', '|',
        'link', 'image', 'video', 'table', 'hr', '|', // Added video, table, hr
        'superscript', 'subscript', '|',
        'find', 'selectall', 'cut', 'copy', 'paste', 'copyformat', 'undo', 'redo', '|',
        'fullsize', 'print', 'about'
    ],
    buttonsXS: [
        'bold', 'italic', '|', 'brush', '|', 'align', 'ul', 'ol', '|', 'link', '|', 'source', 'fullsize',
    ],
    controls: {
        font: {
            list: {
                'Arial,Helvetica,sans-serif': 'Arial',
                'Georgia,serif': 'Georgia',
                'Impact,Charcoal,sans-serif': 'Impact',
                'Tahoma,Geneva,sans-serif': 'Tahoma',
                'Times New Roman,Times,serif': 'Times New Roman',
                'Verdana,Geneva,sans-serif': 'Verdana',
                // Add more web-safe fonts if needed
            }
        },
        fontsize: {
            list: [8, 10, 12, 14, 15, 18, 24, 36] // Matching video
        }
    },
    placeholder: 'Start typing your email message here...',
    uploader: {
        insertImageAsBase64URI: true // Simplifies image handling without a backend uploader for images
    },
    image: {
        dialogUpdateUrl: false, // Use simpler dialog for image URL
        openOnDblClick: false, // Avoids opening dialog on double click, users can use toolbar
    },
    showCharsCounter: false,
    showWordsCounter: false,
    showXPathInStatusbar: false,
  };

  useEffect(() => {
    if (isOpen && initialDetails) {
      setSenderEmailConfig(initialDetails.senderEmailConfig || 'super_admin');
      setReplyToEmailConfig(initialDetails.replyToEmailConfig || 'allocated_it_specialist');
      setSubject(initialDetails.subject || 'Thanks for your appointment');
      // Default message as seen in the video
      setBodyHtml(initialDetails.bodyHtml || `<p>Hi %customername%,</p><p>Thank you for taking the time to attend the %servicename% appointment. If you have any questions or need more information, please feel free to reach out.</p><p>Regards,<br>%businessname%</p>`);
      setDateFormat(initialDetails.dateFormat || 'dd-MMM-yyyy');
    }
  }, [initialDetails, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    onSave({
      senderEmailConfig,
      replyToEmailConfig,
      subject,
      bodyHtml,
      dateFormat,
    });
  };
  
  const handleInsertVariableInSubject = (variable) => {
    if (subjectInputRef.current) {
        const currentSubject = subjectInputRef.current.value;
        const cursorPosStart = subjectInputRef.current.selectionStart;
        const cursorPosEnd = subjectInputRef.current.selectionEnd;
        
        const newSubject = 
            currentSubject.substring(0, cursorPosStart) + 
            variable + 
            currentSubject.substring(cursorPosEnd);
            
        setSubject(newSubject);
        
        // Focus and set cursor position after insertion
        setTimeout(() => {
          if (subjectInputRef.current) {
            subjectInputRef.current.focus();
            const newCursorPos = cursorPosStart + variable.length;
            subjectInputRef.current.setSelectionRange(newCursorPos, newCursorPos);
          }
        }, 0);
    }
  };

  const handleInsertVariableInBody = (variable) => {
    if (editorRef.current) { // Jodit instance is often available on editorRef.current.editor
      const joditInstance = editorRef.current.editor || editorRef.current;
      if (joditInstance && joditInstance.selection) {
        joditInstance.selection.insertHTML(variable);
        joditInstance.focus();
      }
    }
  };

  const senderOptions = [
    { value: 'super_admin', label: 'Super Admin Email (fairchanceform...)' },
    { value: 'allocated_it_specialist', label: "Allocated IT Specialist's Email Address" },
    { value: 'default_bookings_email', label: "Default Bookings email (notification@zohobookings.com)" },
  ];

  const replyToOptions = [
    { value: 'allocated_it_specialist', label: "Allocated IT Specialist's Email Address" },
    { value: 'super_admin', label: 'Super Admin (fairchanceform1024@outlook.com)' },
  ];

  const dateFormatOptions = [
    { value: 'dd-MMM-yyyy', label: 'dd-MMM-yyyy (23-May-2025)' },
    { value: 'MM/dd/yyyy', label: 'MM/dd/yyyy (05/23/2025)' },
    { value: 'yyyy-MM-dd', label: 'yyyy-MM-dd (2025-05-23)' },
    { value: 'MMM dd, yyyy', label: 'MMM dd, yyyy (May 23, 2025)' },
    { value: 'dd MMM, yyyy', label: 'dd MMM, yyyy (23 May, 2025)' },
    { value: 'E, MMM dd, yyyy', label: 'E, MMM dd, yyyy (Fri, May 23, 2025)' },
    { value: 'E, dd MMM, yyyy', label: 'E, dd MMM, yyyy (Fri, 23 May, 2025)' },
    { value: 'dd.MM.yyyy', label: 'dd.MM.yyyy (23.05.2025)' },
    { value: 'MM-dd-yy', label: 'MM-dd-yy (05-23-25)' },
    { value: 'dd-MM-yy', label: 'dd-MM-yy (23-05-25)' },
    { value: 'MM/dd/yy', label: 'MM/dd/yy (05/23/25)' },
    { value: 'MMMM dd, yy', label: 'MMMM dd, yy (May 23, 25)'},
    { value: 'dd MMMM, yy', label: 'dd MMMM, yy (23 May, 25)'},
    { value: 'yy.MM.dd', label: 'yy.MM.dd (25.05.23)'},
    { value: 'yyyy.MM.dd', label: 'yyyy.MM.dd (2025.05.23)'},
    { value: 'MM.dd.yyyy', label: 'MM.dd.yyyy (05.23.2025)'},
  ];
  
  const currentTemplateName = initialDetails?.templateName || "Thank you";

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[1000] p-4 transition-opacity duration-300 ease-out"
         style={{ opacity: isOpen ? 1 : 0 }}>
      <div 
        className={`bg-white rounded-lg shadow-xl w-full max-w-3xl transform transition-all duration-300 ease-out
                    ${isOpen ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 -translate-y-10 scale-95'}`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h3 className="text-lg font-medium text-gray-900">Customize Email Template</h3>
          <button onClick={onClose} className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
            <X size={22} />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[calc(100vh-12rem)] overflow-y-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div>
              <label htmlFor="senderEmailConfig" className="block text-xs font-medium text-gray-700 mb-1">Sender Email</label>
              <select
                id="senderEmailConfig"
                name="senderEmailConfig"
                value={senderEmailConfig}
                onChange={(e) => setSenderEmailConfig(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              >
                {senderOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="replyToEmailConfig" className="block text-xs font-medium text-gray-700 mb-1">Reply To *</label>
              <select
                id="replyToEmailConfig"
                name="replyToEmailConfig"
                value={replyToEmailConfig}
                onChange={(e) => setReplyToEmailConfig(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
              >
                {replyToOptions.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="currentTemplateDisplay" className="block text-xs font-medium text-gray-700 mb-1">Templates</label>
              <input
                type="text"
                id="currentTemplateDisplay"
                value={currentTemplateName} 
                readOnly
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-sm text-gray-700 cursor-default"
              />
            </div>
          </div>
          
          <div className="relative">
            <label htmlFor="subject" className="block text-xs font-medium text-gray-700 mb-1">Subject</label>
            <div className="flex items-center">
              <input
                ref={subjectInputRef}
                type="text"
                id="subject"
                name="subject"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="flex-grow px-3 py-2 border border-gray-300 rounded-l-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-sm"
                placeholder="Thanks for your appointment"
              />
              <div className="border-t border-b border-r border-gray-300 rounded-r-md p-[1px] bg-gray-50">
                <VariableInserter onInsert={handleInsertVariableInSubject} />
              </div>
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-1.5 flex-wrap gap-2">
                <label className="block text-xs font-medium text-gray-700">Messages</label>
                <div className="flex items-center space-x-2">
                    <label htmlFor="dateFormat" className="block text-xs font-medium text-gray-700 whitespace-nowrap">Select Date Format For Mail:</label>
                    <select
                        id="dateFormat"
                        name="dateFormat"
                        value={dateFormat}
                        onChange={(e) => setDateFormat(e.target.value)}
                        className="px-2 py-1.5 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-1 focus:ring-indigo-500 text-xs"
                        style={{maxWidth: '210px'}}
                    >
                        {dateFormatOptions.map(format => <option key={format.value} value={format.value}>{format.label}</option>)}
                    </select>
                    <VariableInserter onInsert={handleInsertVariableInBody} />
                </div>
            </div>
            <JoditEditor
                ref={editorRef}
                value={bodyHtml}
                config={joditConfig}
                tabIndex={1}
                onBlur={newContent => setBodyHtml(newContent)}
                // onChange={newContent => {}} // Using onBlur is generally better for performance with rich text editors
            />
          </div>
        </div>

        <div className="flex justify-end items-center p-4 border-t border-gray-200 space-x-3 bg-gray-50 rounded-b-lg">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="bg-indigo-700 text-white px-6 py-2 rounded-md text-sm font-medium hover:bg-indigo-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
};

export default EmailTemplateModal;