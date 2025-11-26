
import React from 'react';
import { FileText, FileType, Printer, Settings2, Check, ChevronDown } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useFileTab } from '../FileTabContext';

export const PrintModal: React.FC = () => {
  const { content } = useEditor();
  const { closeModal } = useFileTab();

  return (
    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 h-full lg:h-[70vh]">
      {/* Controls Column */}
      <div className="w-full lg:w-[320px] space-y-6 flex flex-col order-2 lg:order-1">
        
        {/* Print Button */}
        <button 
          onClick={() => { window.print(); closeModal(); }}
          className="w-full py-3.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-bold text-sm shadow-lg shadow-blue-200 hover:shadow-xl transition-all active:scale-[0.98] flex items-center justify-center gap-3 group"
        >
          <div className="p-1.5 bg-white/20 rounded-lg group-hover:bg-white/30 transition-colors">
             <Printer size={20} className="text-white" />
          </div>
          <div className="flex flex-col items-start leading-tight">
             <span>Print</span>
             <span className="text-[10px] font-normal opacity-80">Default Printer</span>
          </div>
        </button>

        {/* Settings Panel */}
        <div className="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex-1 flex flex-col">
          <div className="px-4 py-3 bg-slate-50 border-b border-slate-100 flex justify-between items-center">
             <span className="text-xs font-bold text-slate-500 uppercase tracking-wide">Settings</span>
             <Settings2 size={14} className="text-slate-400"/>
          </div>
          
          <div className="p-4 space-y-4">
             <div className="space-y-1">
                 <label className="text-[11px] font-semibold text-slate-500">Printer</label>
                 <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors text-sm font-medium text-slate-700 shadow-sm">
                     <div className="flex items-center gap-2">
                         <Printer size={16} className="text-slate-400"/>
                         <span>System Default</span>
                     </div>
                     <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-bold uppercase tracking-wide">Ready</span>
                 </button>
             </div>

             <div className="space-y-1">
                 <label className="text-[11px] font-semibold text-slate-500">Pages</label>
                 <button className="w-full flex items-center justify-between px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors text-sm font-medium text-slate-700 shadow-sm group">
                     <div className="flex items-center gap-2">
                         <FileText size={16} className="text-slate-400"/>
                         <span>Print All Pages</span>
                     </div>
                     <ChevronDown size={14} className="text-slate-300 group-hover:text-slate-500"/>
                 </button>
             </div>

             <div className="grid grid-cols-2 gap-3">
                 <button className="flex flex-col items-start gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors text-sm font-medium text-slate-700 shadow-sm">
                     <FileType size={16} className="text-slate-400"/>
                     <span className="text-xs">Portrait</span>
                 </button>
                 <button className="flex flex-col items-start gap-1.5 px-3 py-2.5 bg-white border border-slate-200 rounded-lg hover:border-blue-400 transition-colors text-sm font-medium text-slate-700 shadow-sm">
                     <FileText size={16} className="text-slate-400"/>
                     <span className="text-xs">Letter</span>
                 </button>
             </div>
             
             <div className="space-y-1 pt-2 border-t border-slate-100">
                 <label className="text-[11px] font-semibold text-slate-500">Copies</label>
                 <div className="flex items-center gap-2">
                     <input type="number" defaultValue="1" min="1" className="w-20 px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold text-slate-700 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all"/>
                     <span className="text-xs text-slate-400">copy</span>
                 </div>
             </div>
          </div>
        </div>
      </div>

      {/* Preview Area - Premium Skeumorphic Look */}
      <div className="flex-1 bg-[#525659] rounded-xl p-6 lg:p-10 flex items-center justify-center overflow-hidden relative shadow-inner order-1 lg:order-2 min-h-[400px] group perspective-1000 border border-[#404446]">
        {/* Background Texture */}
        <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'radial-gradient(#fff 1px, transparent 1px)', backgroundSize: '20px 20px' }}></div>
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 to-transparent pointer-events-none"></div>
        
        {/* Paper */}
        <div className="bg-white shadow-[0_20px_50px_-12px_rgba(0,0,0,0.7),0_0_0_1px_rgba(0,0,0,0.02)] w-[65%] md:w-[340px] lg:w-[380px] aspect-[8.5/11] flex flex-col text-[4px] md:text-[5px] overflow-hidden select-none pointer-events-none transition-all duration-500 origin-center group-hover:scale-[1.02] group-hover:-translate-y-2 relative">
          <div className="absolute inset-0 p-8 md:p-12 opacity-90">
             <div dangerouslySetInnerHTML={{ __html: content }} />
          </div>
          {/* Lighting Effects */}
          <div className="absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-black/5 pointer-events-none"></div>
          <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-b from-white/20 to-transparent pointer-events-none"></div>
        </div>

        {/* Page Indicator */}
        <div className="absolute bottom-6 flex items-center gap-4 bg-black/60 backdrop-blur-md rounded-full px-4 py-2 text-white text-xs font-medium shadow-lg border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <button className="hover:text-blue-300 transition-colors">&larr;</button>
            <span>1 of 1</span>
            <button className="hover:text-blue-300 transition-colors">&rarr;</button>
        </div>
      </div>
    </div>
  );
};
