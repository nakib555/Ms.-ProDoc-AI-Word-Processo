
import React from 'react';
import { FilePlus } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useFileTab } from '../FileTabContext';
import { DEFAULT_CONTENT } from '../../../../../constants';

const RESUME_TEMPLATE = `
<h1 style="text-align: center;">Your Name</h1>
<p style="text-align: center;">123 Main Street | city, state | email@example.com</p>
<hr/>
<h3>Professional Summary</h3>
<p>Experienced professional with a proven track record...</p>
<h3>Experience</h3>
<p><strong>Job Title</strong> - <em>Company Name</em> (2020 - Present)</p>
<ul><li>Key achievement or responsibility.</li></ul>
<h3>Education</h3>
<p><strong>Degree Name</strong> - <em>University</em></p>
`;

const LETTER_TEMPLATE = `
<p><strong>Your Name</strong><br/>Your Address<br/>City, State, Zip</p>
<p>${new Date().toLocaleDateString()}</p>
<p><strong>Recipient Name</strong><br/>Title<br/>Company Name</p>
<p>Dear Recipient,</p>
<p>I am writing to you today regarding...</p>
<p><br></p>
<p>Sincerely,</p>
<p>Your Name</p>
`;

export const NewModal: React.FC = () => {
  const { setContent, setDocumentTitle } = useEditor();
  const { closeModal } = useFileTab();

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      <button 
        onClick={() => { setContent(DEFAULT_CONTENT); setDocumentTitle('Untitled Document'); closeModal(); }}
        className="group text-left"
      >
        <div className="bg-white aspect-[3/4] border border-slate-200 shadow-sm group-hover:shadow-md group-hover:ring-2 ring-blue-500 transition-all flex items-center justify-center mb-3 rounded-lg overflow-hidden">
          <FilePlus size={32} className="text-slate-300 group-hover:text-blue-500 transition-colors" strokeWidth={1.5} />
        </div>
        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Blank Document</span>
      </button>

      <button 
        onClick={() => { setContent(RESUME_TEMPLATE); setDocumentTitle('Resume'); closeModal(); }}
        className="group text-left"
      >
        <div className="bg-white aspect-[3/4] border border-slate-200 shadow-sm group-hover:shadow-md group-hover:ring-2 ring-blue-500 transition-all p-3 mb-3 rounded-lg overflow-hidden relative">
          <div className="w-full h-3 bg-slate-100 mb-3 rounded-sm"></div>
          <div className="w-2/3 h-2 bg-slate-50 mb-2 rounded-sm"></div>
          <div className="w-full h-1 bg-slate-50 mb-1 rounded-sm"></div>
          <div className="w-full h-1 bg-slate-50 mb-6 rounded-sm"></div>
          <div className="w-1/2 h-2 bg-slate-100 mb-2 rounded-sm"></div>
          <div className="w-full h-1 bg-slate-50 mb-1 rounded-sm"></div>
        </div>
        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Resume</span>
      </button>

      <button 
        onClick={() => { setContent(LETTER_TEMPLATE); setDocumentTitle('Cover Letter'); closeModal(); }}
        className="group text-left"
      >
        <div className="bg-white aspect-[3/4] border border-slate-200 shadow-sm group-hover:shadow-md group-hover:ring-2 ring-blue-500 transition-all p-4 mb-3 rounded-lg overflow-hidden relative">
          <div className="w-1/3 h-2 bg-slate-100 mb-6 ml-auto rounded-sm"></div>
          <div className="w-1/4 h-2 bg-slate-100 mb-6 rounded-sm"></div>
          <div className="w-full h-1 bg-slate-50 mb-2 rounded-sm"></div>
          <div className="w-full h-1 bg-slate-50 mb-2 rounded-sm"></div>
          <div className="w-3/4 h-1 bg-slate-50 mb-2 rounded-sm"></div>
        </div>
        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600">Cover Letter</span>
      </button>
    </div>
  );
};
