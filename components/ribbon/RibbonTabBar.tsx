import React, { useRef, useEffect, useState } from 'react';
import { RibbonTab } from '../../types';
import { 
  ChevronLeft, ChevronRight,
  FileText, Home, Blocks, PenTool, Palette,
  Layout, BookOpen, Mail, CheckSquare,
  Eye, Sparkles
} from 'lucide-react';

interface RibbonTabBarProps {
  activeTab: RibbonTab | null;
  onTabChange: (tab: RibbonTab) => void;
}

const TAB_CONFIG: Record<string, { icon: React.ElementType, label?: string }> = {
  [RibbonTab.FILE]: { icon: FileText },
  [RibbonTab.HOME]: { icon: Home },
  [RibbonTab.INSERT]: { icon: Blocks },
  [RibbonTab.DRAW]: { icon: PenTool },
  [RibbonTab.DESIGN]: { icon: Palette },
  [RibbonTab.LAYOUT]: { icon: Layout },
  [RibbonTab.REFERENCES]: { icon: BookOpen },
  [RibbonTab.MAILINGS]: { icon: Mail },
  [RibbonTab.REVIEW]: { icon: CheckSquare },
  [RibbonTab.VIEW]: { icon: Eye },
  [RibbonTab.AI_ASSISTANT]: { icon: Sparkles, label: "AI Assistant" }
};

export const RibbonTabBar: React.FC<RibbonTabBarProps> = ({ activeTab, onTabChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);

  const checkScroll = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  };

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, []);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  };

  useEffect(() => {
    if (activeTab && scrollContainerRef.current) {
      const buttons = Array.from(scrollContainerRef.current.children) as HTMLElement[];
      const labelToFind = TAB_CONFIG[activeTab]?.label || activeTab;
      const activeButton = buttons.find(btn => btn.textContent?.includes(labelToFind));
      
      if (activeButton) {
        activeButton.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
      }
    }
  }, [activeTab]);

  // Handle horizontal scrolling via mouse wheel & update arrows on scroll
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
      
      const onScroll = () => checkScroll();

      el.addEventListener('wheel', onWheel, { passive: false });
      el.addEventListener('scroll', onScroll);
      
      // Delay check slightly to ensure layout is complete
      setTimeout(checkScroll, 50);

      return () => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('scroll', onScroll);
      };
    }
  }, []);

  const renderTabButton = (tabId: string, Icon: any, label: string, isContextual = false) => {
      const isActive = activeTab === tabId;
      const baseColor = isContextual ? 'text-amber-600 dark:text-amber-400 hover:text-amber-700' : 'text-slate-400 hover:text-slate-200';
      const activeColor = isContextual ? 'text-amber-700 dark:text-amber-300' : 'text-blue-900 dark:text-blue-200';
      const activeBg = 'bg-white dark:bg-slate-800';
      
      return (
          <button
            key={tabId}
            onClick={() => onTabChange(tabId as RibbonTab)}
            className={`
              px-3 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap relative group flex-shrink-0 flex items-center gap-2
              ${isActive 
                ? `${activeBg} ${activeColor} z-10 translate-y-[1px] pb-3 font-semibold` 
                : `${baseColor} hover:bg-slate-800/50 dark:hover:bg-slate-800/30 mb-0.5`}
              ${isContextual ? 'border-t-2 border-t-amber-500' : ''}
            `}
          >
            {Icon && (
              <Icon 
                size={16} 
                className={`transition-colors duration-200 ${isActive ? activeColor : 'text-slate-500 group-hover:text-slate-300'} ${isContextual && isActive ? 'text-amber-600' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            )}
            <span>{label}</span>
            
            {isActive && (
               <>
                 {/* Corner smoothing for the active tab effect */}
                 <div className="absolute bottom-0 left-0 right-0 h-3 bg-white dark:bg-slate-800 z-20"></div>
                 <div className="absolute bottom-0 -left-2 w-2 h-2 bg-transparent shadow-[2px_2px_0_#fff] dark:shadow-[2px_2px_0_#1e293b] rounded-br-full z-20 pointer-events-none"></div>
                 <div className="absolute bottom-0 -right-2 w-2 h-2 bg-transparent shadow-[-2px_2px_0_#fff] dark:shadow-[-2px_2px_0_#1e293b] rounded-bl-full z-20 pointer-events-none"></div>
               </>
            )}
          </button>
      );
  };

  return (
    <div className="relative flex items-end bg-slate-900 dark:bg-slate-950 pt-1 flex-shrink-0 z-20 w-full group select-none border-b border-slate-800 dark:border-slate-900">
       {/* Left Navigation Arrow */}
       <div 
          className={`absolute left-0 top-0 bottom-0 z-30 flex items-center pl-1 pr-8 bg-gradient-to-r from-slate-900 dark:from-slate-950 via-slate-900/90 dark:via-slate-950/90 to-transparent transition-opacity duration-200 ${showLeftArrow ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
       >
           <button 
              onClick={() => scroll('left')}
              className="p-1.5 rounded-full bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-600 dark:border-slate-700 shadow-lg active:scale-95 mb-0.5 transition-all"
              aria-label="Scroll left"
           >
              <ChevronLeft size={16} strokeWidth={2.5} />
           </button>
       </div>

      <div 
        ref={scrollContainerRef}
        className="flex px-2 md:px-4 overflow-x-auto overflow-y-hidden no-scrollbar w-full items-end space-x-1 scroll-smooth"
      >
        {/* Standard Tabs */}
        {Object.keys(TAB_CONFIG).map((key) => {
          const tab = key as RibbonTab;
          const config = TAB_CONFIG[tab];
          return renderTabButton(tab, config.icon, config.label || tab);
        })}

        {/* Spacer */}
        <div className="w-8 flex-shrink-0 h-1"></div> 
      </div>

      {/* Right Navigation Arrow */}
       <div 
          className={`absolute right-0 top-0 bottom-0 z-30 flex items-center pr-1 pl-8 bg-gradient-to-l from-slate-900 dark:from-slate-950 via-slate-900/90 dark:via-slate-950/90 to-transparent transition-opacity duration-200 ${showRightArrow ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
       >
           <button 
              onClick={() => scroll('right')}
              className="p-1.5 rounded-full bg-slate-800 dark:bg-slate-900 hover:bg-slate-700 dark:hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-600 dark:border-slate-700 shadow-lg active:scale-95 mb-0.5 transition-all"
              aria-label="Scroll right"
           >
              <ChevronRight size={16} strokeWidth={2.5} />
           </button>
       </div>
    </div>
  );
};