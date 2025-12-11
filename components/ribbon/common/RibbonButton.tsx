
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface RibbonButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
  title?: string;
  command?: string; 
  hasArrow?: boolean;
  disabled?: boolean;
}

export const RibbonButton: React.FC<RibbonButtonProps> = React.memo(({
  icon: Icon,
  label,
  onClick,
  className,
  title,
  hasArrow,
  disabled
}) => (
  <button
    className={`flex flex-col items-center justify-center px-2 py-1 min-w-[60px] md:min-w-[68px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-400 flex-shrink-0 ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-white/5 active:bg-indigo-100 dark:active:bg-white/10'}`}
    onClick={disabled ? undefined : onClick}
    onMouseDown={(e) => e.preventDefault()}
    title={title || label}
    disabled={disabled}
  >
    <div className={`p-1.5 rounded-md transition-all mb-1 ${disabled ? '' : 'group-hover:bg-white/60 dark:group-hover:bg-transparent group-hover:shadow-sm dark:group-hover:shadow-none group-active:scale-95'}`}>
        <Icon className={`w-6 h-6 text-slate-500 dark:text-slate-400 transition-colors ${disabled ? '' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-300'}`} strokeWidth={1.5} />
    </div>
    <div className="flex items-center justify-center w-full px-0.5">
        <span className={`text-xs font-medium leading-tight text-center text-slate-500 dark:text-slate-400 ${disabled ? '' : 'group-hover:text-indigo-700 dark:group-hover:text-indigo-300'}`}>{label}</span>
        {hasArrow && <ChevronDown size={12} className={`ml-0.5 text-slate-400 dark:text-slate-500 shrink-0 ${disabled ? '' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-300'}`} />}
    </div>
  </button>
));
