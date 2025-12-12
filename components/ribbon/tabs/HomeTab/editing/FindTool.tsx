
import React from 'react';
import { Search } from 'lucide-react';

export const FindTool: React.FC<{ onClick: () => void }> = ({ onClick }) => (
    <button 
        className="flex items-center px-2 py-0.5 hover:bg-slate-100 rounded text-slate-600 hover:text-blue-600 text-[11px] transition-colors group text-left" 
        onClick={onClick}
    >
       <Search className="w-3.5 h-3.5 mr-2 text-rose-500 group-hover:text-rose-600" /> Find
    </button>
);
