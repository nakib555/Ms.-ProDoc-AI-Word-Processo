
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
    className={`flex flex-col items-center justify-center px-1 py-1 min-w-[52px] md:min-w-[60px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-300 flex-shrink-0 ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:text-indigo-700 dark:hover:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 active:bg-indigo-100 dark:active:bg-indigo-900/50'}`}
    onClick={disabled ? undefined : onClick}
    onMouseDown={(e) => e.preventDefault()}
    title={title || label}
    disabled={disabled}
  >
    <div className={`p-1 rounded-md transition-all mb-0.5 ${disabled ? '' : 'group-hover:bg-white/60 dark:group-hover:bg-slate-800 group-hover:shadow-sm group-active:scale-95'}`}>
        <Icon className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-colors ${disabled ? '' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} strokeWidth={1.5} />
    </div>
    <div className="flex items-center justify-center w-full px-0.5">
        <span className={`text-[10px] font-medium leading-tight text-center text-slate-500 dark:text-slate-400 ${disabled ? '' : 'group-hover:text-indigo-700 dark:group-hover:text-indigo-400'}`}>{label}</span>
        {hasArrow && <ChevronDown size={8} className={`ml-0.5 text-slate-400 dark:text-slate-500 shrink-0 ${disabled ? '' : 'group-hover:text-indigo-600 dark:group-hover:text-indigo-400'}`} />}
    </div>
  </button>
));