
import React from 'react';
import { AlignCenter, Group, RotateCcw } from 'lucide-react';

export const AlignmentTools: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-center gap-0.5 px-1 border-l border-slate-100">
        <button className="flex items-center gap-1.5 px-1 py-1 hover:bg-slate-100 rounded group w-full text-left">
            <AlignCenter size={14} className="text-slate-500 group-hover:text-blue-600"/>
            <span className="text-[10px] text-slate-600">Align</span>
        </button>
        <button className="flex items-center gap-1.5 px-1 py-1 hover:bg-slate-100 rounded group w-full text-left">
            <Group size={14} className="text-slate-500 group-hover:text-blue-600"/>
            <span className="text-[10px] text-slate-600">Group</span>
        </button>
        <button className="flex items-center gap-1.5 px-1 py-1 hover:bg-slate-100 rounded group w-full text-left">
            <RotateCcw size={14} className="text-slate-500 group-hover:text-blue-600"/>
            <span className="text-[10px] text-slate-600">Rotate</span>
        </button>
    </div>
  );
};
