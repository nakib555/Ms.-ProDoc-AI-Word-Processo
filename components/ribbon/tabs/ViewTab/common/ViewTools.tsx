
import React from 'react';
import { Check, ChevronDown } from 'lucide-react';

export const SmallRibbonButton: React.FC<{ 
  icon: any, 
  label: string, 
  onClick: () => void, 
  disabled?: boolean,
  className?: string,
  hasArrow?: boolean,
  iconClassName?: string
}> = ({ icon: Icon, label, onClick, disabled, className, hasArrow, iconClassName }) => (
  <button 
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    disabled={disabled}
    className={`flex items-center w-full px-2 py-[1px] text-left hover:bg-slate-100 rounded-sm group transition-colors ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={label}
  >
    <Icon size={14} className={`${iconClassName || 'text-slate-500'} group-hover:text-blue-600 mr-2 shrink-0`} />
    <span className="text-[11px] font-medium text-slate-600 group-hover:text-blue-700 truncate leading-tight flex-1">{label}</span>
    {hasArrow && <ChevronDown size={8} className="text-slate-400 group-hover:text-blue-600 shrink-0 ml-1" />}
  </button>
);

export const CheckboxItem: React.FC<{
  label: string;
  checked: boolean;
  onChange: () => void;
}> = ({ label, checked, onChange }) => (
  <button 
    onClick={onChange}
    onMouseDown={(e) => e.preventDefault()}
    className="flex items-center gap-2 px-2 py-0.5 w-full hover:bg-slate-100 rounded-sm group"
  >
    <div 
        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-400 group-hover:border-slate-500'}`}
        style={{ backgroundColor: checked ? undefined : '#ffffff' }}
    >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-[11px] font-medium text-slate-700 group-hover:text-slate-900 leading-tight select-none">{label}</span>
  </button>
);
