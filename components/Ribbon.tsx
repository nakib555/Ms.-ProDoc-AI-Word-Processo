
import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { RibbonTab } from '../types';
import { RibbonTabBar } from './ribbon/RibbonTabBar';
import { Loader2 } from 'lucide-react';

// Helper for safe lazy loading
const safeLazy = (importPromise: Promise<any>, name: string) => 
    React.lazy(() => importPromise.then(m => ({ default: m[name] || (() => <div className="p-2 text-xs text-red-500">Failed to load {name}</div>) })));

// Lazy Load Tabs
const HomeTab = safeLazy(import('./ribbon/tabs/HomeTab/HomeTab'), 'HomeTab');
const InsertTab = safeLazy(import('./ribbon/tabs/InsertTab/InsertTab'), 'InsertTab');
const ViewTab = safeLazy(import('./ribbon/tabs/ViewTab/ViewTab'), 'ViewTab');
const FileTab = safeLazy(import('./ribbon/tabs/FileTab/FileTab'), 'FileTab');
const LayoutTab = safeLazy(import('./ribbon/tabs/LayoutTab/LayoutTab'), 'LayoutTab');
const ReferencesTab = safeLazy(import('./ribbon/tabs/ReferencesTab/ReferencesTab'), 'ReferencesTab');
const MailingsTab = safeLazy(import('./ribbon/tabs/MailingsTab/MailingsTab'), 'MailingsTab');
const AIAssistantTab = safeLazy(import('./ribbon/tabs/AIAssistantTab/AIAssistantTab'), 'AIAssistantTab');
const DrawTab = safeLazy(import('./ribbon/tabs/DrawTab/DrawTab'), 'DrawTab');
const DesignTab = safeLazy(import('./ribbon/tabs/DesignTab/DesignTab'), 'DesignTab');
const ReviewTab = safeLazy(import('./ribbon/tabs/ReviewTab/ReviewTab'), 'ReviewTab');
const TableDesignTab = safeLazy(import('./ribbon/tabs/InsertTab/tables/tabledesign_subTab/tabledesign'), 'TableDesignTab');
const TableLayoutTab = safeLazy(import('./ribbon/tabs/InsertTab/tables/tablelayout_subTab/tablelayout'), 'TableLayoutTab');
const EquationTab = safeLazy(import('./ribbon/tabs/InsertTab/symbols/equation_subTab/EquationTab'), 'EquationTab');
const HeaderFooterTab = safeLazy(import('./ribbon/tabs/HeaderFooterTab/HeaderFooterTab'), 'HeaderFooterTab');

interface RibbonProps {
  activeTab: RibbonTab | null;
  onTabChange: (tab: RibbonTab) => void;
}

const TabLoading = () => (
  <div className="flex items-center justify-center h-20 w-full text-slate-400 gap-2">
    <Loader2 className="animate-spin" size={16} />
    <span className="text-xs">Loading tools...</span>
  </div>
);

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
        // Using slightly delayed height calc to allow Suspense to resolve if quick
        const timer = setTimeout(() => {
            if (contentRef.current) {
                const contentHeight = contentRef.current.scrollHeight;
                setHeight(Math.max(contentHeight, 96));
            }
        }, 50);
        return () => clearTimeout(timer);
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
        if (el.scrollWidth > el.clientWidth) {
           e.preventDefault();
           el.scrollLeft += e.deltaY;
        }
      };
      el.addEventListener('wheel', onWheel, { passive: false });
      return () => el.removeEventListener('wheel', onWheel);
    }
  }, [activeTab]); 

  // Memoize tab content
  const tabContent = useMemo(() => {
    return (
      <Suspense fallback={<TabLoading />}>
        {(() => {
          switch (activeTab) {
            case RibbonTab.HOME: return <HomeTab />;
            case RibbonTab.INSERT: return <InsertTab />;
            case RibbonTab.DRAW: return <DrawTab />;
            case RibbonTab.DESIGN: return <DesignTab />;
            case RibbonTab.LAYOUT: return <LayoutTab />;
            case RibbonTab.REFERENCES: return <ReferencesTab />;
            case RibbonTab.MAILINGS: return <MailingsTab />;
            case RibbonTab.REVIEW: return <ReviewTab />;
            case RibbonTab.VIEW: return <ViewTab />;
            case RibbonTab.FILE: return <FileTab />;
            case RibbonTab.AI_ASSISTANT: return <AIAssistantTab />;
            case RibbonTab.TABLE_DESIGN: return <TableDesignTab />;
            case RibbonTab.TABLE_LAYOUT: return <TableLayoutTab />;
            case RibbonTab.EQUATION: return <EquationTab />;
            case RibbonTab.HEADER_FOOTER: return <HeaderFooterTab />;
            default: return activeTab ? <div className="flex items-center justify-center w-full h-full text-slate-400 italic text-xs">Tools coming soon...</div> : null;
          }
        })()}
      </Suspense>
    );
  }, [activeTab]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    // Allow interactions with inputs
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
      return;
    }
    // Prevent focus loss
    e.preventDefault();
  };

  return (
    <div 
      onMouseDown={handleMouseDown}
      className="flex flex-col z-20 no-print relative shadow-sm bg-slate-900 dark:bg-slate-950 transition-colors duration-300"
    >
      <RibbonTabBar activeTab={activeTab} onTabChange={onTabChange} />

      <div 
        className={`bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 relative z-10 transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] overflow-hidden ${activeTab ? 'opacity-100' : 'opacity-0'}`}
        style={{ height: activeTab ? `${Math.max(height, 96)}px` : '0px' }}
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
         
         <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white dark:from-slate-800 to-transparent pointer-events-none md:hidden"></div>
      </div>
    </div>
  );
};

export default React.memo(Ribbon);
