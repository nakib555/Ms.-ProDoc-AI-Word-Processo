
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLayoutTab } from '../LayoutTabContext';

interface DropdownButtonProps {
  id: string;
  icon: any;
  label: string;
  disabled?: boolean;
  hasArrow?: boolean;
  iconClassName?: string;
}

export const DropdownButton: React.FC<DropdownButtonProps> = React.memo(({ 
  id, icon: Icon, label, disabled = false, hasArrow = true, iconClassName
}) => {
   const { activeMenu, toggleMenu, registerTrigger } = useLayoutTab();

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
                  <span className="text-xs font-medium leading-tight text-center group-hover:text-slate-900 dark:group-hover:text-white">{label}</span>
                  {hasArrow && <ChevronDown size={12} className={`ml-0.5 ${activeMenu === id ? 'rotate-180' : ''} transition-transform text-slate-400 group-hover:text-slate-600 shrink-0`} />}
              </div>
          </button>
      </div>
   );
});

export const ParagraphInput: React.FC<{ label: string, value: string, icon: any, onChange?: (val: string) => void }> = React.memo(({ label, value, icon: Icon, onChange }) => (
    <div className="flex items-center gap-2 h-7">
        <div className="flex items-center justify-end w-[64px] gap-1.5 opacity-90">
             <Icon size={13} className="text-slate-500 stroke-[1.5]" />
             <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">{label}:</span>
        </div>
        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg hover:border-slate-400 dark:hover:border-slate-600 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all h-7 w-20 relative overflow-hidden group shadow-sm">
            <input 
                type="text" 
                className="w-full h-full text-[11px] font-medium text-slate-800 dark:text-slate-200 outline-none bg-transparent pl-2.5 pr-6" 
                defaultValue={value}
                onBlur={(e) => onChange && onChange(e.target.value)}
            />
            <div className="flex flex-col border-l border-slate-200 dark:border-slate-700 w-5 h-full absolute right-0 bg-slate-50 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onMouseDown={(e) => e.preventDefault()} className="flex-1 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 transition-colors border-b border-slate-200 dark:border-slate-700">
                    <ChevronUp size={8} strokeWidth={2.5} />
                </button>
                <button onMouseDown={(e) => e.preventDefault()} className="flex-1 flex items-center justify-center hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 hover:text-slate-700 transition-colors">
                    <ChevronDown size={8} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    </div>
));
