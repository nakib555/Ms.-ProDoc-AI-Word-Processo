
import React from 'react';
import { FileText, FileType, Printer } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useFileTab } from '../FileTabContext';

export const PrintModal: React.FC = () => {
  const { content } = useEditor();
  const { closeModal } = useFileTab();

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full lg:h-[60vh]">
      <div className="w-full lg:w-1/3 space-y-4 md:space-y-6 flex flex-col order-2 lg:order-1">
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3">
          <div className="flex justify-between items-center pb-2 border-b border-slate-200">
            <span className="text-sm font-semibold text-slate-700">Printer</span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Ready</span>
          </div>
          <div className="text-sm text-slate-600">System Default Printer</div>
        </div>

        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 space-y-3 flex-1">
          <div className="text-sm font-semibold text-slate-700 pb-2 border-b border-slate-200">Settings</div>
          <div className="space-y-2 text-sm text-slate-600">
            <div className="flex items-center gap-2"><FileText size={14}/> Print All Pages</div>
            <div className="flex items-center gap-2"><FileType size={14}/> Portrait Orientation</div>
            <div className="flex items-center gap-2"><FileText size={14}/> Letter</div>
          </div>
        </div>

        <button 
          onClick={() => { window.print(); closeModal(); }}
          className="w-full py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-sm flex items-center justify-center gap-2 mt-auto shrink-0"
        >
          <Printer size={18} /> Print Now
        </button>
      </div>

      <div className="flex-1 bg-slate-200 rounded-lg p-4 lg:p-8 flex items-center justify-center overflow-hidden relative border border-slate-300 shadow-inner order-1 lg:order-2 min-h-[300px]">
        <div className="bg-white shadow-2xl w-[65%] md:w-[300px] lg:w-[340px] aspect-[8.5/11] flex flex-col p-4 md:p-8 text-[4px] md:text-[5px] overflow-hidden select-none pointer-events-none transition-transform origin-center">
          <div dangerouslySetInnerHTML={{ __html: content }} />
        </div>
        <div className="absolute bottom-4 right-4 bg-black/50 text-white text-xs px-2 py-1 rounded backdrop-blur-sm">Preview</div>
      </div>
    </div>
  );
};
