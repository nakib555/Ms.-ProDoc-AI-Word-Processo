import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useAIAssistantTab } from '../AIAssistantTabContext';

export const SmallRibbonButton: React.FC<{ 
  icon: any, 
  label: string, 
  onClick: () => void, 
  className?: string,
  disabled?: boolean
}> = ({ icon: Icon, label, onClick, className, disabled }) => (
  <button 
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    disabled={disabled}
    className={`flex items-center w-full px-2 py-[1px] text-left hover:bg-slate-100 rounded-sm group transition-colors ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={label}
  >
    <Icon size={14} className="text-slate-500 group-hover:text-blue-600 mr-2 shrink-0" />
    <span className="text-[11px] font-medium text-slate-600 group-hover:text-blue-700 truncate leading-tight flex-1">{label}</span>
  </button>
);

interface DropdownButtonProps {
  id: string;
  icon: any;
  label: string;
  hasArrow?: boolean;
}

export const DropdownRibbonButton: React.FC<DropdownButtonProps> = ({ 
  id, icon: Icon, label, hasArrow = true 
}) => {
  const { activeMenu, toggleMenu, registerTrigger } = useAIAssistantTab();

  return (
    <button
      ref={(el) => registerTrigger(id, el)}
      className={`flex flex-col items-center justify-center px-1 py-1 min-w-[52px] md:min-w-[60px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 hover:text-blue-700 hover:bg-slate-50 flex-shrink-0 ${activeMenu === id ? 'bg-slate-100 text-blue-700 ring-1 ring-slate-200' : ''}`}
      onClick={(e) => { e.stopPropagation(); toggleMenu(id); }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="p-1 rounded-md group-hover:bg-white group-hover:shadow-sm transition-all mb-0.5">
          <Icon className={`w-4 h-4 ${activeMenu === id ? 'text-blue-600' : 'text-slate-500 group-hover:text-blue-600'}`} strokeWidth={1.5} />
      </div>
      <div className="flex items-center justify-center w-full px-0.5">
          <span className="text-[10px] font-medium leading-tight text-center text-slate-500 group-hover:text-blue-700">{label}</span>
          {hasArrow && <ChevronDown size={8} className={`ml-0.5 text-slate-400 group-hover:text-blue-600 shrink-0 ${activeMenu === id ? 'rotate-180' : ''}`} />}
      </div>
    </button>
  );
};