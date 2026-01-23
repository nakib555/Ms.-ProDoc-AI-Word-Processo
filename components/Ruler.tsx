
import React, { useMemo } from 'react';
import { PageConfig } from '../types';
import { PAGE_SIZES, PAGE_MARGIN_PADDING } from '../constants';

interface RulerProps {
  pageConfig: PageConfig;
  zoom: number;
  onDoubleClick?: () => void;
}

export const Ruler: React.FC<RulerProps> = React.memo(({ pageConfig, zoom, onDoubleClick }) => {
  
  // Width in px (96 DPI)
  const width = useMemo(() => {
      if (pageConfig.size === 'Custom' && pageConfig.customWidth) {
          return pageConfig.customWidth * 96;
      }
      const base = PAGE_SIZES[pageConfig.size as string] || PAGE_SIZES['Letter'];
      return pageConfig.orientation === 'portrait' ? base.width : base.height;
  }, [pageConfig.size, pageConfig.orientation, pageConfig.customWidth]);

  const scale = zoom / 100;
  
  // Calculate margins in pixels based on explicit config
  const margins = useMemo(() => {
    const m = pageConfig.margins;
    let left = m.left * 96;
    let right = m.right * 96;
    
    // Add gutter to left for simplified global ruler view
    left += m.gutter * 96;

    return { left, right };
  }, [pageConfig.margins]);

  // Generate ticks
  // 1 inch = 96px
  const ticks = useMemo(() => {
    const totalInches = Math.ceil(width / 96);
    return Array.from({ length: totalInches * 8 + 1 }).map((_, i) => {
      const pos = i * (96 / 8); // 1/8th inch increments
      if (pos > width) return null;
      
      const isInch = i % 8 === 0;
      const isHalf = i % 4 === 0;
      const isQuarter = i % 2 === 0;
      
      let height = 'h-1';
      if (isInch) height = 'h-2.5';
      else if (isHalf) height = 'h-1.5';
      else if (isQuarter) height = 'h-1';
      
      return (
        <div 
          key={i} 
          className={`absolute top-0 border-l border-slate-500 ${height}`} 
          style={{ left: `${pos}px` }}
        >
          {isInch && i > 0 && (
            <span className="absolute top-2.5 -left-1 text-[8px] font-semibold text-slate-600 select-none">
              {i / 8}
            </span>
          )}
        </div>
      );
    });
  }, [width]);

  // Fix layout footprint
  const marginRight = -(width * (1 - scale));

  return (
    <div 
      onDoubleClick={onDoubleClick}
      className="h-6 bg-[#D1D5DB] border-b border-slate-300 flex items-end relative select-none no-print z-10 shadow-sm transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] origin-top-left cursor-default"
      title="Double-click to open Page Setup"
      style={{ 
        width: `${width}px`,
        transform: `scale(${scale})`,
        marginRight: `${marginRight}px`,
        marginBottom: '0px' 
      }}
    >
      {/* White writable area representation */}
      <div 
        className="absolute top-0 bottom-0 bg-white border-x border-slate-300 h-full z-0 pointer-events-none"
        style={{
          left: `${margins.left}px`,
          right: `${margins.right}px`
        }}
      ></div>

      {/* Ticks Container */}
      <div className="w-full h-full bg-transparent relative overflow-hidden z-10 pointer-events-none">
        {ticks}
        
        {/* Left Indent Markers - made interactive later, currently visual only but receive double click */}
        <div 
          className="absolute top-0 h-full w-3 cursor-ew-resize group z-20 hover:brightness-110 transition-all pointer-events-auto"
          style={{ left: `${margins.left - 6}px` }}
          onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(); }}
        >
            {/* Hanging Indent (Top Triangle) */}
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-[#4b5563] absolute top-0 left-0 drop-shadow-sm" title="First Line Indent"></div>
            {/* Left Indent (Bottom Triangle) */}
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-[#4b5563] absolute top-[8px] left-0 drop-shadow-sm" title="Hanging Indent"></div>
            {/* Left Indent (Square) */}
            <div className="w-[10px] h-[5px] bg-[#4b5563] absolute top-[14px] left-0 drop-shadow-sm" title="Left Indent"></div>
        </div>
        
        {/* Right Indent Marker */}
        <div 
           className="absolute top-0 h-full w-3 cursor-ew-resize group z-20 hover:brightness-110 transition-all pointer-events-auto"
           style={{ left: `${width - margins.right - 5}px` }}
           onDoubleClick={(e) => { e.stopPropagation(); onDoubleClick?.(); }}
        >
             <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-[#4b5563] absolute top-[11px] left-0 drop-shadow-sm" title="Right Indent"></div>
        </div>
      </div>
    </div>
  );
});
