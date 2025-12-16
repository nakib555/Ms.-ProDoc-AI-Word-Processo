
import React from 'react';
import { ChevronDown } from 'lucide-react';

interface RibbonButtonProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
  className?: string;
  iconClassName?: string;
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
  iconClassName,
  title,
  hasArrow,
  disabled
}) => (
  <button
    className={`flex flex-col items-center justify-between px-2 py-1.5 min-w-[60px] md:min-w-[68px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-400 flex-shrink-0 select-none ${className || ''} ${disabled ? 'opacity-50 cursor-not-allowed' : 'hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100 active:bg-slate-200 dark:active:bg-slate-700'}`}
    onClick={disabled ? undefined : onClick}
    onMouseDown={(e) => e.preventDefault()}
    title={title || label}
    disabled={disabled}
  >
    <div className={`flex-1 flex items-center justify-center w-full transition-all ${disabled ? '' : 'group-active:scale-95'}`}>
        <Icon className={`w-6 h-6 transition-colors ${iconClassName || 'text-slate-500 dark:text-slate-400'} ${disabled ? '' : 'group-hover:text-slate-700 dark:group-hover:text-slate-200'}`} strokeWidth={1.5} />
    </div>
    <div className="flex items-start justify-center w-full h-[32px] pt-0.5">
        <span className={`text-[11px] font-medium leading-tight text-center line-clamp-2 ${disabled ? '' : 'group-hover:text-slate-900 dark:group-hover:text-slate-100'}`}>{label}</span>
        {hasArrow && <ChevronDown size={10} className={`ml-0.5 mt-0.5 opacity-70 shrink-0 ${disabled ? '' : 'group-hover:text-slate-900 dark:group-hover:text-slate-100'}`} />}
    </div>
  </button>
));
