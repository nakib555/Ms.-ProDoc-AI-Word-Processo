
import React from 'react';
import { Menu, MoreHorizontal, Cloud } from 'lucide-react';
import { useEditor } from '../../contexts/EditorContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

interface RibbonHeaderProps {
  toggleSidebar: () => void;
}

export const RibbonHeader: React.FC<RibbonHeaderProps> = ({ toggleSidebar }) => {
  const { saveStatus, documentTitle, setDocumentTitle } = useEditor();
  
  const renderSaveStatus = () => {
    switch (saveStatus) {
      case 'saving':
        return (
          <span className="font-medium tracking-wide flex items-center text-slate-400 text-[10px] uppercase animate-pulse">
            <LoadingSpinner className="w-3 h-3 mr-1.5" />
            <span className="hidden sm:inline">Saving...</span>
          </span>
        );
      case 'unsaved':
        return (
          <span className="font-medium tracking-wide flex items-center text-amber-400 text-[10px] uppercase" title="Unsaved changes">
             <div className="w-1.5 h-1.5 rounded-full bg-amber-400 mr-1.5 animate-pulse shadow-[0_0_6px_rgba(250,204,21,0.6)]"></div>
             <span className="hidden sm:inline">Unsaved</span>
          </span>
        );
      case 'saved':
      default:
        return (
          <span className="font-medium tracking-wide flex items-center text-slate-400 text-[10px] uppercase transition-colors duration-300 group-hover:text-slate-300">
             <Cloud size={12} className="mr-1.5" />
             <span className="hidden sm:inline">Saved</span>
          </span>
        );
    }
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
      return;
    }
    e.preventDefault();
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      className="h-12 bg-[#0f172a] dark:bg-[#0f172a]/80 dark:backdrop-blur-xl text-white flex items-center justify-between px-4 select-none z-30 shadow-sm border-b border-white/10 dark:border-white/5 shrink-0 relative transition-colors duration-300"
    >
       <div className="flex items-center gap-4">
           <button 
              onClick={toggleSidebar} 
              className="hover:bg-white/10 p-2 rounded-lg transition-all duration-200 text-slate-300 hover:text-white active:scale-95"
           >
             <Menu size={20} />
           </button>
           
           <div className="flex items-center gap-4">
             <div className="flex items-center gap-2.5 group cursor-pointer">
                <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg flex items-center justify-center shadow-lg ring-1 ring-white/10 group-hover:ring-white/20 transition-all duration-300 group-hover:scale-105 group-hover:shadow-indigo-500/20">
                  <span className="font-serif font-bold italic text-lg text-white">P</span>
                </div>
                <h1 className="font-semibold text-sm tracking-tight text-slate-100 group-hover:text-white transition-colors hidden md:block">ProDoc AI</h1>
             </div>
             
             <div className="h-5 w-[1px] bg-slate-700/50 hidden sm:block"></div>
             
             <div className="flex flex-col justify-center group">
                <div className="flex items-center gap-3">
                  <input 
                    type="text" 
                    value={documentTitle}
                    onChange={(e) => setDocumentTitle(e.target.value)}
                    className="bg-transparent border-none outline-none font-medium text-sm text-slate-200 hover:text-white focus:text-white transition-colors w-32 md:w-48 placeholder-slate-500 truncate focus:ring-0 p-0"
                  />
                  {renderSaveStatus()}
                </div>
             </div>
           </div>
       </div>

       <div className="flex items-center gap-3">
           <div className="hidden md:flex items-center bg-slate-800/50 backdrop-blur-sm rounded-full px-3 py-1 border border-slate-700/50 cursor-pointer hover:bg-slate-800 transition-colors group">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2 shadow-[0_0_8px_rgba(16,185,129,0.5)] group-hover:shadow-[0_0_12px_rgba(16,185,129,0.8)] transition-shadow"></div>
              <span className="text-[10px] font-medium text-slate-300 group-hover:text-white">Online</span>
           </div>
           
           <button className="p-2 hover:bg-white/10 rounded-full text-slate-400 hover:text-white transition-colors md:hidden">
              <MoreHorizontal size={20} />
           </button>
           
           <div className="flex items-center gap-1.5 pl-4 border-l border-slate-700/50 ml-2">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-xs font-bold text-white shadow-inner cursor-pointer hover:ring-2 ring-indigo-500 ring-offset-2 ring-offset-[#0f172a] transition-all transform hover:scale-105">
                JD
              </div>
           </div>
       </div>
    </div>
  );
};
