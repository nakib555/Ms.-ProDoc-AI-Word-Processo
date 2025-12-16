
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
    className={`flex items-center w-full px-2 py-1 text-left hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm group transition-colors gap-3 ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
    title={label}
  >
    <Icon size={14} className={`${iconClassName || 'text-slate-500 dark:text-slate-400'} group-hover:text-slate-700 dark:group-hover:text-slate-200 shrink-0`} />
    <span className="text-[11px] font-medium text-slate-600 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white truncate leading-tight flex-1">{label}</span>
    {hasArrow && <ChevronDown size={8} className="text-slate-400 group-hover:text-slate-600 shrink-0 ml-1" />}
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
    className="flex items-center gap-2.5 px-2 py-1 w-full hover:bg-slate-100 dark:hover:bg-slate-800 rounded-sm group"
  >
    <div 
        className={`w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors shrink-0 ${checked ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-900 border-slate-400 dark:border-slate-500 group-hover:border-slate-500 dark:group-hover:border-slate-400'}`}
        style={{ backgroundColor: checked ? undefined : 'transparent' }}
    >
        {checked && <Check size={10} className="text-white" strokeWidth={3} />}
    </div>
    <span className="text-[11px] font-medium text-slate-700 dark:text-slate-300 group-hover:text-slate-900 dark:group-hover:text-white leading-tight select-none">{label}</span>
  </button>
);
