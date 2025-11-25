import React from 'react';
import { LucideIcon, ChevronDown } from 'lucide-react';

interface RibbonButtonProps {
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  className?: string;
  title?: string;
  command?: string; 
  hasArrow?: boolean;
}

export const RibbonButton: React.FC<RibbonButtonProps> = ({
  icon: Icon,
  label,
  onClick,
  className,
  title,
  hasArrow
}) => (
  <button
    className={`flex flex-col items-center justify-center px-1 py-1 min-w-[52px] md:min-w-[60px] h-full rounded-lg transition-all duration-200 group relative text-slate-600 dark:text-slate-300 hover:text-blue-700 dark:hover:text-blue-400 hover:bg-slate-50 dark:hover:bg-slate-700/50 active:bg-blue-50/80 dark:active:bg-slate-700 flex-shrink-0 ${className || ''}`}
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    title={title || label}
  >
    <div className="p-1 rounded-md group-hover:bg-white dark:group-hover:bg-slate-700 group-hover:shadow-sm transition-all mb-0.5">
        <Icon className="w-4 h-4 text-slate-500 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" strokeWidth={1.5} />
    </div>
    <div className="flex items-center justify-center w-full px-0.5">
        <span className="text-[10px] font-medium leading-tight text-center text-slate-500 dark:text-slate-400 group-hover:text-blue-700 dark:group-hover:text-blue-400">{label}</span>
        {hasArrow && <ChevronDown size={8} className="ml-0.5 text-slate-400 dark:text-slate-500 group-hover:text-blue-600 dark:group-hover:text-blue-400 shrink-0" />}
    </div>
  </button>
);