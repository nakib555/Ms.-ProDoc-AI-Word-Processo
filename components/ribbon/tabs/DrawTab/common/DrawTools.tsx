
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useDrawTab } from '../DrawTabContext';

interface DropdownButtonProps {
  id: string;
  icon: any;
  label: string;
  hasArrow?: boolean;
}

export const DropdownRibbonButton: React.FC<DropdownButtonProps> = ({ 
  id, icon: Icon, label, hasArrow = true 
}) => {
  const { activeMenu, toggleMenu, registerTrigger } = useDrawTab();

  return (
    <button
      ref={(el) => registerTrigger(id, el)}
      className={`flex flex-col items-center justify-center px-2 py-1 min-w-[60px] md:min-w-[68px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 flex-shrink-0 ${activeMenu === id ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white ring-1 ring-slate-300 dark:ring-slate-600' : ''}`}
      onClick={(e) => { e.stopPropagation(); toggleMenu(id); }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="p-1.5 rounded-md transition-all mb-1">
          <Icon className={`w-6 h-6 ${activeMenu === id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} strokeWidth={1.5} />
      </div>
      <div className="flex items-center justify-center w-full px-0.5">
          <span className="text-xs font-medium leading-tight text-center text-slate-500 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-white">{label}</span>
          {hasArrow && <ChevronDown size={12} className={`ml-0.5 text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-300 shrink-0 ${activeMenu === id ? 'rotate-180' : ''}`} />}
      </div>
    </button>
  );
};
