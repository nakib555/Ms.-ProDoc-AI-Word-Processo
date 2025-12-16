
import React from 'react';
import { ChevronDown } from 'lucide-react';
import { useHomeTab } from '../HomeTabContext';

export interface DropdownButtonProps {
  id: string;
  icon: any;
  title: string;
  className?: string;
  color?: string;
  iconClass?: string;
}

export const DropdownToolBtn: React.FC<DropdownButtonProps> = React.memo(({ 
  id, icon: Icon, title, className, color, iconClass
}) => {
  const { activeMenu, toggleMenu, registerTrigger } = useHomeTab();
  
  return (
    <button 
      ref={(el) => registerTrigger(id, el)}
      onMouseDown={(e) => e.preventDefault()}
      onClick={(e) => { e.stopPropagation(); toggleMenu(id); }}
      className={`
        p-0.5 rounded-md flex items-center justify-center transition-all w-9 h-8 relative group gap-0.5
        ${activeMenu === id ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
        ${className || ''}
      `} 
      title={title}
    >
      <div className="flex items-center justify-center relative">
          <Icon className={`w-4 h-4 ${iconClass || ''}`} strokeWidth={2} />
          {color && (
            <div 
              className="h-[3px] w-full absolute -bottom-1 left-0 rounded-full ring-1 ring-white dark:ring-slate-800" 
              style={{ backgroundColor: color }}
            />
          )}
      </div>
      <ChevronDown size={10} className="text-slate-400 dark:text-slate-500 group-hover:text-slate-600 dark:group-hover:text-slate-400" strokeWidth={2.5} />
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
  disabled?: boolean,
  iconClass?: string
}> = React.memo(({ icon: Icon, onClick, title, active, color, className, disabled, iconClass }) => (
  <button 
    onClick={onClick}
    onMouseDown={(e) => e.preventDefault()}
    disabled={disabled} 
    className={`
      flex items-center justify-center transition-all w-8 h-8 rounded-md relative group
      ${active ? 'bg-slate-200 dark:bg-slate-700 text-slate-900 dark:text-slate-100 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100'}
      ${disabled ? 'opacity-40 cursor-not-allowed hover:bg-transparent hover:text-slate-600 dark:hover:text-slate-300' : ''}
      ${className || ''}
    `} 
    title={title}
  >
    <div className="relative flex items-center justify-center">
        <Icon className={`w-4 h-4 ${iconClass || ''}`} strokeWidth={2} />
        {color && (
        <div 
            className="h-[3px] w-full absolute -bottom-1.5 left-0 rounded-full ring-1 ring-white dark:ring-slate-800" 
            style={{ backgroundColor: color }}
        />
        )}
    </div>
  </button>
));

export const GroupRow: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div className="flex items-center gap-0.5">{children}</div>
);
