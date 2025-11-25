import React from 'react';

interface RibbonSectionProps {
  title: string;
  children: React.ReactNode;
}

export const RibbonSection: React.FC<RibbonSectionProps> = ({ title, children }) => (
  <div className="flex flex-col h-full px-3 relative group py-1 after:content-[''] after:absolute after:right-0 after:top-2 after:bottom-2 after:w-[1px] after:bg-slate-200 dark:after:bg-slate-700 after:rounded-full last:after:hidden">
    <div className="flex flex-1 items-center justify-center space-x-1 min-h-0">
      {children}
    </div>
    <div className="h-4 flex items-end justify-center pt-0.5 mt-0.5">
      <div className="text-[10px] leading-none text-slate-500 dark:text-slate-400 text-center font-medium tracking-wide select-none opacity-80 whitespace-nowrap overflow-hidden text-ellipsis px-1">
        {title}
      </div>
    </div>
  </div>
);