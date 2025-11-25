
import React from 'react';
import { SkipBack, ChevronLeft, ChevronRight, SkipForward } from 'lucide-react';

export const RecordNavigationTool: React.FC = () => (
    <div className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded p-0.5">
         <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500"><SkipBack size={12}/></button>
         <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500"><ChevronLeft size={12}/></button>
         <input className="w-8 h-4 text-[10px] text-center border border-slate-300 rounded mx-1 outline-none text-slate-600" defaultValue="0" />
         <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500"><ChevronRight size={12}/></button>
         <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500"><SkipForward size={12}/></button>
    </div>
);
