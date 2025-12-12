
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
  iconClassName?: string;
}

export const DropdownButton: React.FC<DropdownButtonProps> = React.memo(({ 
  id, icon: Icon, label, disabled = false, hasArrow = true, variant = 'large', iconClassName
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
                className={`flex items-center w-full px-2 py-[1px] text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm group transition-colors ${activeMenu === id ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white' : ''}`}
            >
                <Icon size={16} className={`mr-2 ${iconClassName || ''} ${activeMenu === id ? 'text-slate-900 dark:text-white' : 'text-slate-500 dark:text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} />
                <span className={`text-[11px] font-medium truncate flex-1 leading-tight ${activeMenu === id ? 'text-slate-900 dark:text-white' : 'text-slate-600 dark:text-slate-300 group-hover:text-slate-800 dark:group-hover:text-slate-100'}`}>{label}</span>
                {hasArrow && <ChevronDown size={10} className={`ml-1 ${activeMenu === id ? 'rotate-180' : ''} transition-transform text-slate-400`} />}
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
              className={`flex flex-col items-center justify-center px-2 py-1 min-w-[60px] md:min-w-[68px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 ${activeMenu === id ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-white shadow-inner ring-1 ring-slate-300 dark:ring-slate-600' : ''}`}
          >
              <div className="p-1.5 rounded-md transition-all mb-1">
                  <Icon className={`w-6 h-6 ${iconClassName || 'text-slate-500 dark:text-slate-400'} ${activeMenu === id ? 'text-slate-900 dark:text-white' : 'group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} strokeWidth={1.5} />
              </div>
              <div className="flex items-center justify-center w-full px-0.5">
                  <span className="text-xs font-medium leading-tight text-center group-hover:text-slate-900 dark:group-hover:text-slate-100">{label}</span>
                  {hasArrow && <ChevronDown size={12} className={`ml-0.5 ${activeMenu === id ? 'rotate-180' : ''} transition-transform text-slate-400 group-hover:text-slate-600 shrink-0`} />}
              </div>
          </button>
      </div>
   );
});

export const SmallRibbonButton: React.FC<{ icon: any, label: string, onClick: () => void, className?: string, iconClassName?: string }> = React.memo(({ icon: Icon, label, onClick, className, iconClassName }) => (
  <button 
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className={`flex items-center w-full px-2 py-[1px] text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm group transition-colors ${className || ''}`}
    title={label}
  >
    <Icon size={16} className={`${iconClassName || 'text-slate-500 dark:text-slate-400'} group-hover:text-slate-700 dark:group-hover:text-slate-200 mr-2 shrink-0`} />
    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate leading-tight">{label}</span>
  </button>
));
