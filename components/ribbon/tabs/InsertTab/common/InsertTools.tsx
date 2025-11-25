import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useInsertTab } from '../InsertTabContext';

interface DropdownButtonProps {
  id: string;
  icon: any;
  label: string;
  disabled?: boolean;
  hasArrow?: boolean;
  variant?: 'large' | 'small';
}

export const DropdownButton: React.FC<DropdownButtonProps> = ({ 
  id, icon: Icon, label, disabled = false, hasArrow = true, variant = 'large' 
}) => {
   const { activeMenu, toggleMenu, registerTrigger } = useInsertTab();

   if (variant === 'small') {
      return (
        <div 
            ref={(el) => registerTrigger(id, el)}
            className={`relative w-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
            <button
                onClick={(e) => { e.stopPropagation(); !disabled && toggleMenu(id); }}
                onMouseDown={(e) => e.preventDefault()}
                className={`flex items-center w-full px-2 py-[1px] text-left hover:bg-slate-100 rounded-sm group transition-colors ${activeMenu === id ? 'bg-slate-100 text-blue-700' : ''}`}
            >
                <Icon size={14} className={`mr-2 ${activeMenu === id ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} />
                <span className={`text-[11px] font-medium truncate flex-1 leading-tight ${activeMenu === id ? 'text-blue-700' : 'text-slate-600 group-hover:text-blue-700'}`}>{label}</span>
                {hasArrow && <ChevronDown size={8} className={`ml-1 ${activeMenu === id ? 'rotate-180' : ''} transition-transform text-slate-400`} />}
            </button>
        </div>
      );
   }

   return (
      <div 
          ref={(el) => registerTrigger(id, el)}
          className={`relative h-full ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      >
          <button
              onClick={(e) => { e.stopPropagation(); !disabled && toggleMenu(id); }}
              onMouseDown={(e) => e.preventDefault()}
              className={`flex flex-col items-center justify-center px-1 py-1 min-w-[52px] md:min-w-[60px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 hover:text-blue-700 hover:bg-slate-50 ${activeMenu === id ? 'bg-slate-100 text-blue-700 shadow-inner ring-1 ring-slate-200' : ''}`}
          >
              <div className="p-1 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all mb-0.5">
                  <Icon className={`w-4 h-4 ${activeMenu === id ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} strokeWidth={1.5} />
              </div>
              <div className="flex items-center justify-center w-full px-0.5">
                  <span className="text-[10px] font-medium leading-tight text-center">{label}</span>
                  {hasArrow && <ChevronDown size={8} className={`ml-0.5 ${activeMenu === id ? 'rotate-180' : ''} transition-transform text-slate-400 shrink-0`} />}
              </div>
          </button>
      </div>
   );
};

export const SmallRibbonButton: React.FC<{ icon: any, label: string, onClick: () => void, className?: string }> = ({ icon: Icon, label, onClick, className }) => (
  <button 
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className={`flex items-center w-full px-2 py-[1px] text-left hover:bg-slate-100 rounded-sm group transition-colors ${className || ''}`}
    title={label}
  >
    <Icon size={14} className="text-slate-500 group-hover:text-blue-600 mr-2 shrink-0" />
    <span className="text-[11px] font-medium text-slate-600 group-hover:text-blue-700 truncate leading-tight">{label}</span>
  </button>
);