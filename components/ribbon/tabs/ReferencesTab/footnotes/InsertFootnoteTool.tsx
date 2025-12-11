
import React from 'react';
import { useEditor } from '../../../../../contexts/EditorContext';

export const InsertFootnoteTool: React.FC = () => {
  const { executeCommand } = useEditor();

  const insertFootnote = () => {
      const id = Date.now();
      executeCommand('insertHTML', `<sup style="color: #2563eb; font-weight: bold; cursor: pointer;">[${Math.floor(Math.random() * 5) + 1}]</sup>`);
  };

  return (
     <button 
         className="flex flex-col items-center justify-center px-2 py-1 h-full rounded-lg hover:bg-slate-100 hover:text-blue-700 text-slate-600 transition-all gap-1 min-w-[68px]"
         onClick={insertFootnote}
         title="Insert Footnote (Alt+Ctrl+F)"
     >
         <div className="relative transform scale-110 mb-1">
            <span className="text-2xl font-serif font-bold">AB</span>
            <sup className="absolute -top-1 -right-2 text-sm font-bold text-blue-600">1</sup>
         </div>
         <span className="text-xs font-medium mt-auto">Insert Footnote</span>
     </button>
  );
};
