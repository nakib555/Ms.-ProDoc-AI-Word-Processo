import React from 'react';
import { MousePointer2 } from 'lucide-react';
import { useDrawTab } from '../DrawTabContext';

export const SelectTool: React.FC = () => {
  const { activeTool, setActiveTool } = useDrawTab();
  const isActive = activeTool === 'select';

  return (
    <button 
        className={`flex flex-col items-center justify-center p-1 w-12 h-full rounded-md transition-all ${isActive ? 'bg-slate-200 text-blue-700 shadow-inner' : 'hover:bg-slate-100 text-slate-600'}`}
        onClick={() => setActiveTool('select')}
        title="Select Objects"
    >
        <MousePointer2 size={20} />
        <span className="text-[10px] mt-1 font-medium">Select</span>
    </button>
  );
};