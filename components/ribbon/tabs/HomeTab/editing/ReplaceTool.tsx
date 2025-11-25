
import React from 'react';
import { Replace } from 'lucide-react';

export const ReplaceTool: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        className="flex items-center px-2 py-0.5 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 text-[11px] transition-colors" 
        onClick={onClick}
    >
       <Replace className="w-3.5 h-3.5 mr-2" /> Replace
    </button>
);
