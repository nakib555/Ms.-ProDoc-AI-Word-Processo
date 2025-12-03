
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useHomeTab } from '../HomeTabContext';

export interface DropdownButtonProps {
  id: string;
  icon: any;
  title: string;
  className?: string;
  color?: string;
}

export const DropdownToolBtn: React.FC<DropdownButtonProps> = React.memo(({ 
  id, icon: Icon, title, className, color 
}) => {
  const { activeMenu, toggleMenu, registerTrigger } = useHomeTab();
  
  return (
    <button 
      ref={(el) => registerTrigger(id, el)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => { e.stopPropagation(); toggleMenu(id); }}
      className={`
        p-1 rounded-md flex items-center justify-center transition-all w-8 h-7 relative group
        ${activeMenu === id ? 'bg-indigo-100 dark:bg-slate-700 text-indigo-700 dark:text-indigo-400' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'}
        ${className || ''}
      `} 
      title={title}
    >
      <Icon className="w-4 h-4" strokeWidth={2} />
      {color && (
        <div 
          className="h-[3px] w-[16px] absolute bottom-0.5 rounded-full ring-1 ring-white dark:ring-slate-800" 
          style={{ backgroundColor: color }}
        />
      )}
      <ChevronDown size={8} className="ml-0.5 text-slate-400 dark:text-slate-500" />
    </button>
  );
});

export const ToolBtn: React.FC<{ 
  icon: any, 
  onClick: () => void, 
  title: string, 
  active?: boolean, 
  color?: string,
  className?: string,
  disabled?: boolean
}> = React.memo(({ icon: Icon, onClick, title, active, color, className, disabled }) => (
  <button 
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    disabled={disabled} 
    className={`
      p-1 rounded-md flex items-center justify-center transition-all w-7 h-7 relative group
      ${active ? 'bg-indigo-100 dark:bg-indigo-900/50 text-indigo-700 dark:text-indigo-300' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-indigo-600 dark:hover:text-indigo-400'}
      ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-600 dark:hover:text-slate-300' : ''}
      ${className || ''}
    `} 
    title={title}
  >
    <Icon className="w-4 h-4" strokeWidth={2} />
    {color && (
      <div 
        className="h-[3px] w-[16px] absolute bottom-0.5 rounded-full ring-1 ring-white dark:ring-slate-800" 
        style={{ backgroundColor: color }}
      />
    )}
  </button>
));

export const GroupRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-1">{children}</div>
);