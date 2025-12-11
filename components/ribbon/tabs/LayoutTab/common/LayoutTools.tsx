
import React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { useLayoutTab } from '../LayoutTabContext';

interface DropdownButtonProps {
  id: string;
  icon: any;
  label: string;
  disabled?: boolean;
  hasArrow?: boolean;
}

export const DropdownButton: React.FC<DropdownButtonProps> = React.memo(({ 
  id, icon: Icon, label, disabled = false, hasArrow = true 
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
              className={`flex flex-col items-center justify-center px-2 py-1 min-w-[60px] md:min-w-[68px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 hover:text-blue-700 hover:bg-slate-50 ${activeMenu === id ? 'bg-slate-100 text-blue-700 shadow-inner ring-1 ring-slate-200' : ''}`}
          >
              <div className="p-1.5 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all mb-1">
                  <Icon className={`w-6 h-6 ${activeMenu === id ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} strokeWidth={1.5} />
              </div>
              <div className="flex items-center justify-center w-full px-0.5">
                  <span className="text-xs font-medium leading-tight text-center">{label}</span>
                  {hasArrow && <ChevronDown size={12} className={`ml-0.5 ${activeMenu === id ? 'rotate-180' : ''} transition-transform text-slate-400 shrink-0`} />}
              </div>
          </button>
      </div>
   );
});

export const ParagraphInput: React.FC<{ label: string, value: string, icon: any, onChange?: (val: string) => void }> = React.memo(({ label, value, icon: Icon, onChange }) => (
    <div className="flex items-center gap-2 h-7">
        <div className="flex items-center justify-end w-[64px] gap-1.5 opacity-90">
             <Icon size={13} className="text-slate-400 stroke-[1.5]" />
             <span className="text-[11px] font-medium text-slate-600">{label}:</span>
        </div>
        <div className="flex items-center bg-white border border-slate-300 rounded-lg hover:border-blue-400 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-100 transition-all h-7 w-20 relative overflow-hidden group shadow-sm">
            <input 
                type="text" 
                className="w-full h-full text-[11px] font-medium text-slate-800 outline-none bg-transparent pl-2.5 pr-6" 
                defaultValue={value}
                onBlur={(e) => onChange && onChange(e.target.value)}
            />
            <div className="flex flex-col border-l border-slate-200 w-5 h-full absolute right-0 bg-slate-50 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onMouseDown={(e) => e.preventDefault()} className="flex-1 flex items-center justify-center hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors border-b border-slate-200">
                    <ChevronUp size={8} strokeWidth={2.5} />
                </button>
                <button onMouseDown={(e) => e.preventDefault()} className="flex-1 flex items-center justify-center hover:bg-blue-100 text-slate-500 hover:text-blue-600 transition-colors">
                    <ChevronDown size={8} strokeWidth={2.5} />
                </button>
            </div>
        </div>
    </div>
));
