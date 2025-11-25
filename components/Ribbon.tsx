import React, { useRef, useEffect, useState, useMemo } from 'react';
import { RibbonTab } from '../types';
import { RibbonTabBar } from './ribbon/RibbonTabBar';
import { HomeTab } from './ribbon/tabs/HomeTab/HomeTab';
import { InsertTab } from './ribbon/tabs/InsertTab/InsertTab';
import { ViewTab } from './ribbon/tabs/ViewTab/ViewTab';
import { FileTab } from './ribbon/tabs/FileTab/FileTab';
import { LayoutTab } from './ribbon/tabs/LayoutTab/LayoutTab';
import { ReferencesTab } from './ribbon/tabs/ReferencesTab/ReferencesTab';
import { MailingsTab } from './ribbon/tabs/MailingsTab/MailingsTab';
import { AIAssistantTab } from './ribbon/tabs/AIAssistantTab/AIAssistantTab';
import { DrawTab } from './ribbon/tabs/DrawTab/DrawTab';
import { DesignTab } from './ribbon/tabs/DesignTab/DesignTab';
import { ReviewTab } from './ribbon/tabs/ReviewTab/ReviewTab';
import { TableDesignTab } from './ribbon/tabs/InsertTab/tables/tabledesign_subTab/tabledesign';
import { TableLayoutTab } from './ribbon/tabs/InsertTab/tables/tablelayout_subTab/tablelayout';

interface RibbonProps {
  activeTab: RibbonTab | null;
  onTabChange: (tab: RibbonTab) => void;
}

const Ribbon: React.FC<RibbonProps> = ({ 
  activeTab, 
  onTabChange 
}) => {
  const [height, setHeight] = useState<number>(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
     if (activeTab && contentRef.current) {
        // Calculate height with a minimum to prevent layout shifts for smaller tabs
        const contentHeight = contentRef.current.scrollHeight;
        setHeight(Math.max(contentHeight, 96));
     } else {
        setHeight(0);
     }
  }, [activeTab]);

  // Handle horizontal scrolling via mouse wheel
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      const onWheel = (e: WheelEvent) => {
        if (e.deltaY === 0) return;
        // Check if content actually overflows
        if (el.scrollWidth > el.clientWidth) {
           e.preventDefault();
           el.scrollLeft += e.deltaY;
        }
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, [activeTab]); // Re-bind if tab changes to ensure dims are correct

  // Memoize tab content to prevent re-construction on every render
  const tabContent = useMemo(() => {
    switch (activeTab) {
      case RibbonTab.HOME:
        return <HomeTab />;
      case RibbonTab.INSERT:
        return <InsertTab />;
      case RibbonTab.DRAW:
        return <DrawTab />;
      case RibbonTab.DESIGN:
        return <DesignTab />;
      case RibbonTab.LAYOUT:
        return <LayoutTab />;
      case RibbonTab.REFERENCES:
        return <ReferencesTab />;
      case RibbonTab.MAILINGS:
        return <MailingsTab />;
      case RibbonTab.REVIEW:
        return <ReviewTab />;
      case RibbonTab.VIEW:
        return <ViewTab />;
      case RibbonTab.FILE:
        return <FileTab />;
      case RibbonTab.AI_ASSISTANT:
        return <AIAssistantTab />;
      case RibbonTab.TABLE_DESIGN:
        return <TableDesignTab />;
      case RibbonTab.TABLE_LAYOUT:
        return <TableLayoutTab />;
      default:
        return activeTab ? <div className="flex items-center justify-center w-full h-full text-slate-400 italic text-xs">Tools coming soon...</div> : null;
    }
  }, [activeTab]);

  return (
    <div className="flex flex-col z-20 no-print relative shadow-sm bg-slate-900 dark:bg-slate-950 transition-colors duration-300">
      <RibbonTabBar activeTab={activeTab} onTabChange={onTabChange} />

      {/* Toolbar Container with Smooth Transition */}
      <div 
        className={`bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 relative z-10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${activeTab ? 'opacity-100' : 'opacity-0'}`}
        style={{ height: activeTab ? `${height}px` : '0px' }}
      >
         <div 
            ref={scrollContainerRef}
            className="h-full w-full overflow-x-auto no-scrollbar"
         >
            <div 
                ref={contentRef}
                className="flex h-full min-w-max items-center px-1 md:px-3 py-1 animate-in slide-in-from-top-2 duration-300 fill-mode-forwards"
            >
                {activeTab && tabContent}
            </div>
         </div>
         
         {/* Fade mask for scroll indication on mobile */}
         <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-800 to-transparent pointer-events-none md:hidden"></div>
      </div>
    </div>
  );
};

export default React.memo(Ribbon);