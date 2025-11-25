import React from 'react';
import { Plus } from 'lucide-react';

export const AddPenTool: React.FC = () => {
  return (
    <div className="h-full flex items-center pl-2">
         <button 
            className="flex flex-col items-center justify-center w-8 h-8 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-full border border-slate-200 hover:border-blue-300 transition-colors shadow-sm"
            title="Add Pen"
            onClick={() => alert('Add Pen Dialog')}
         >
             <Plus size={16} />
         </button>
    </div>
  );
};