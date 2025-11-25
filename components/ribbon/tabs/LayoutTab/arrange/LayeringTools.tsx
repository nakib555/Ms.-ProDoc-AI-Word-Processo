
import React from 'react';
import { BringToFront, SendToBack, Layers } from 'lucide-react';

export const LayeringTools: React.FC = () => {
  return (
    <div className="flex flex-col h-full justify-center gap-0.5 px-1 min-w-[90px]">
        <button className="flex items-center gap-2 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded w-full text-left">
            <BringToFront size={12} className="text-slate-400"/> Bring Forward
        </button>
        <button className="flex items-center gap-2 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded w-full text-left">
            <SendToBack size={12} className="text-slate-400"/> Send Backward
        </button>
        <button className="flex items-center gap-2 px-2 py-0.5 text-[10px] text-slate-600 hover:bg-slate-100 hover:text-blue-600 rounded w-full text-left">
            <Layers size={12} className="text-slate-400"/> Selection Pane
        </button>
    </div>
  );
};
