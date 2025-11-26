
import React from 'react';
import { ChevronDown } from 'lucide-react';

export const SmallRibbonButton: React.FC<{ 
  icon: any, 
  label: string, 
  onClick: () => void, 
  className?: string,
  hasArrow?: boolean
}> = React.memo(({ icon: Icon, label, onClick, className, hasArrow }) => (
  <button 
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    className={`flex items-center w-full px-2 py-[1px] text-left hover:bg-slate-100 rounded-sm group transition-colors ${className || ''}`}
    title={label}
  >
    <Icon size={14} className="text-slate-500 group-hover:text-blue-600 mr-2 shrink-0" />
    <span className="text-[11px] font-medium text-slate-600 group-hover:text-blue-700 truncate leading-tight flex-1">{label}</span>
    {hasArrow && <ChevronDown size={8} className="text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />}
  </button>
));
