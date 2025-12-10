
import React, { useRef, useEffect, useState, memo, useCallback } from 'react';
import { RibbonTab } from '../../types';
import { useEditor } from '../../contexts/EditorContext';
import { 
  ChevronLeft, ChevronRight,
  FileText, Home, Blocks, PenTool, Palette,
  Layout, BookOpen, Mail, CheckSquare,
  Eye, Sparkles, Table, PaintBucket, Sigma, LayoutPanelTop
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

interface TabButtonProps {
    tabId: string;
    icon: any;
    label: string;
    isActive: boolean;
    onClick: () => void;
    isContextual?: boolean;
    colorClass?: string;
}

const TabButton = memo(({ tabId, icon: Icon, label, isActive, onClick, isContextual, colorClass = 'text-amber-600' }: TabButtonProps) => {
    const baseColor = isContextual ? `${colorClass} dark:text-amber-400 hover:text-amber-700` : 'text-slate-400 hover:text-slate-100';
    const activeColor = isContextual ? 'text-amber-700 dark:text-amber-300' : 'text-indigo-600 dark:text-indigo-400';
    
    // Updated dark mode backgrounds for active tab to match the ribbon body color (#1e293b)
    const activeBg = 'bg-white dark:bg-[#1e293b]';

    return (
        <button
            onClick={onClick}
            onMouseDown={(e) => e.preventDefault()}
            className={`
              px-3 py-2.5 text-sm font-medium rounded-t-lg transition-all duration-200 whitespace-nowrap relative group flex-shrink-0 flex items-center gap-2
              ${isActive 
                ? `${activeBg} ${activeColor} z-10 translate-y-[1px] pb-3 font-semibold shadow-[0_-1px_3px_rgba(0,0,0,0.05)] dark:shadow-none` 
                : `${baseColor} hover:bg-slate-800/50 dark:hover:bg-slate-800/50 mb-0.5`}
              ${isContextual ? 'border-t-2 border-t-current' : ''}
            `}
        >
            {Icon && (
              <Icon 
                size={16} 
                className={`transition-colors duration-200 ${isActive ? activeColor : 'text-slate-500 group-hover:text-slate-300'} ${isContextual && isActive ? 'text-current' : ''}`}
                strokeWidth={isActive ? 2.5 : 2}
              />
            )}
            <span>{label}</span>
            
            {isActive && (
               <>
                 {/* Corner smoothing */}
                 <div className="absolute bottom-0 left-0 right-0 h-3 bg-white dark:bg-[#1e293b] z-20"></div>
                 <div className="absolute bottom-0 -left-2 w-2 h-2 bg-transparent shadow-[2px_2px_0_#fff] dark:shadow-[2px_2px_0_#1e293b] rounded-br-full z-20 pointer-events-none"></div>
                 <div className="absolute bottom-0 -right-2 w-2 h-2 bg-transparent shadow-[-2px_2px_0_#fff] dark:shadow-[-2px_2px_0_#1e293b] rounded-bl-full z-20 pointer-events-none"></div>
               </>
            )}
        </button>
    );
});

export const RibbonTabBar: React.FC<RibbonTabBarProps> = React.memo(({ activeTab, onTabChange }) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const { activeElementType, viewMode, activeEditingArea } = useEditor();
  const prevElementTypeRef = useRef(activeElementType);
  const prevEditingAreaRef = useRef(activeEditingArea);

  const checkScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      setShowLeftArrow(scrollLeft > 0);
      setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
    }
  }, []);

  useEffect(() => {
    checkScroll();
    window.addEventListener('resize', checkScroll);
    return () => window.removeEventListener('resize', checkScroll);
  }, [checkScroll]);

  const scroll = useCallback((direction: 'left' | 'right') => {
    if (scrollContainerRef.current) {
      const scrollAmount = 200;
      scrollContainerRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth'
      });
    }
  }, []);

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

  // Manage contextual tab visibility
  useEffect(() => {
      let timeoutId: ReturnType<typeof setTimeout>;
      const prevType = prevElementTypeRef.current;
      const prevArea = prevEditingAreaRef.current;

      if ((activeEditingArea === 'header' || activeEditingArea === 'footer') && (prevArea !== 'header' && prevArea !== 'footer')) {
          onTabChange(RibbonTab.HEADER_FOOTER);
      } else if ((prevArea === 'header' || prevArea === 'footer') && (activeEditingArea !== 'header' && activeEditingArea !== 'footer')) {
          onTabChange(RibbonTab.HOME);
      }
      else if (activeElementType === 'equation' && prevType !== 'equation') {
          onTabChange(RibbonTab.EQUATION);
      } 
      else if (activeElementType === 'table' && prevType !== 'table') {
          onTabChange(RibbonTab.TABLE_DESIGN);
      } 
      else {
          if (activeTab === RibbonTab.EQUATION && activeElementType !== 'equation') {
              timeoutId = setTimeout(() => onTabChange(RibbonTab.HOME), 200);
          }
          else if ((activeTab === RibbonTab.TABLE_DESIGN || activeTab === RibbonTab.TABLE_LAYOUT) && activeElementType !== 'table') {
              timeoutId = setTimeout(() => onTabChange(RibbonTab.HOME), 200);
          }
      }

      prevElementTypeRef.current = activeElementType;
      prevEditingAreaRef.current = activeEditingArea;
      
      return () => clearTimeout(timeoutId);
  }, [activeElementType, activeEditingArea, activeTab, onTabChange]);

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
      setTimeout(checkScroll, 50);

      return () => {
        el.removeEventListener('wheel', onWheel);
        el.removeEventListener('scroll', onScroll);
      };
    }
  }, [activeElementType, activeEditingArea, checkScroll]);

  const isHeaderFooterMode = activeEditingArea === 'header' || activeEditingArea === 'footer';

  return (
    <div className="relative flex items-end bg-[#0f172a] dark:bg-[#0f172a] pt-1 flex-shrink-0 z-20 w-full group select-none border-b border-white/10 dark:border-slate-800">
       <div 
          className={`absolute left-0 top-0 bottom-0 z-30 flex items-center pl-1 pr-8 bg-gradient-to-r from-[#0f172a] dark:from-[#0f172a] via-[#0f172a]/90 dark:via-[#0f172a]/90 to-transparent transition-opacity duration-200 ${showLeftArrow ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
       >
           <button 
              onClick={() => scroll('left')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1.5 rounded-full bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 dark:border-slate-700 shadow-lg active:scale-95 mb-0.5 transition-all"
              aria-label="Scroll left"
           >
              <ChevronLeft size={16} strokeWidth={2.5} />
           </button>
       </div>

      <div 
        ref={scrollContainerRef}
        className="flex px-2 md:px-4 overflow-x-auto overflow-y-hidden no-scrollbar w-full items-end gap-1 scroll-smooth"
      >
        {Object.keys(TAB_CONFIG).map((key) => {
          const tab = key as RibbonTab;
          
          if (tab === RibbonTab.AI_ASSISTANT && viewMode === 'web') return null;

          const config = TAB_CONFIG[tab];
          return (
            <TabButton 
                key={tab}
                tabId={tab}
                icon={config.icon}
                label={config.label || tab}
                isActive={activeTab === tab}
                onClick={() => onTabChange(tab)}
            />
          );
        })}
        
        { isHeaderFooterMode && (
            <>
                <div className="w-[1px] h-6 bg-slate-700 mx-1 mb-2"></div>
                <TabButton tabId={RibbonTab.HEADER_FOOTER} icon={LayoutPanelTop} label="Header & Footer" isActive={activeTab === RibbonTab.HEADER_FOOTER} onClick={() => onTabChange(RibbonTab.HEADER_FOOTER)} isContextual colorClass="text-cyan-500" />
            </>
        )}

        {activeElementType === 'table' && (
            <>
                <div className="w-[1px] h-6 bg-slate-700 mx-1 mb-2"></div>
                <TabButton tabId={RibbonTab.TABLE_DESIGN} icon={PaintBucket} label="Table Design" isActive={activeTab === RibbonTab.TABLE_DESIGN} onClick={() => onTabChange(RibbonTab.TABLE_DESIGN)} isContextual colorClass="text-amber-600" />
                <TabButton tabId={RibbonTab.TABLE_LAYOUT} icon={Table} label="Table Layout" isActive={activeTab === RibbonTab.TABLE_LAYOUT} onClick={() => onTabChange(RibbonTab.TABLE_LAYOUT)} isContextual colorClass="text-amber-600" />
            </>
        )}

        {activeElementType === 'equation' && (
            <>
                <div className="w-[1px] h-6 bg-slate-700 mx-1 mb-2"></div>
                <TabButton tabId={RibbonTab.EQUATION} icon={Sigma} label="Equation" isActive={activeTab === RibbonTab.EQUATION} onClick={() => onTabChange(RibbonTab.EQUATION)} isContextual colorClass="text-blue-500" />
            </>
        )}

        <div className="w-8 flex-shrink-0 h-1"></div> 
      </div>

       <div 
          className={`absolute right-0 top-0 bottom-0 z-30 flex items-center pr-1 pl-8 bg-gradient-to-l from-[#0f172a] dark:from-[#0f172a] via-[#0f172a]/90 dark:via-[#0f172a]/90 to-transparent transition-opacity duration-200 ${showRightArrow ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
       >
           <button 
              onClick={() => scroll('right')}
              onMouseDown={(e) => e.preventDefault()}
              className="p-1.5 rounded-full bg-slate-800 dark:bg-slate-800 hover:bg-slate-700 dark:hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-600 dark:border-slate-700 shadow-lg active:scale-95 mb-0.5 transition-all"
              aria-label="Scroll right"
           >
              <ChevronRight size={16} strokeWidth={2.5} />
           </button>
       </div>
    </div>
  );
});
