
import React from 'react';

export const StyleTool: React.FC = () => (
    <div className="flex items-center px-2 py-[1px] text-xs">
         <span className="text-slate-500 mr-2 w-8">Style:</span>
         <select className="bg-transparent border border-slate-200 rounded text-slate-700 text-[10px] p-0.5 w-full focus:ring-1 focus:ring-blue-500 outline-none">
             <option>APA</option>
             <option>MLA</option>
             <option>Chicago</option>
             <option>IEEE</option>
         </select>
    </div>
);
