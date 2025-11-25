
import React, { useMemo } from 'react';
import { useEditor } from '../contexts/EditorContext';

export const Ruler: React.FC = React.memo(() => {
  const { pageDimensions, zoom, pageConfig, viewMode } = useEditor();
  
  // Ruler is only relevant for Print Layout where fixed inch dimensions matter
  if (viewMode !== 'print') return null;

  // Width in px (96 DPI)
  const width = pageDimensions.width;
  const scale = zoom / 100;
  
  // Calculate margins in pixels
  const margins = useMemo(() => {
    let left = 96;
    let right = 96;
    
    if (pageConfig.margins === 'narrow') {
      left = 48;
      right = 48;
    } else if (pageConfig.margins === 'wide') {
      left = 192;
      right = 192;
    }
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
          className={`absolute top-0 border-l border-slate-400 ${height}`} 
          style={{ left: `${pos}px` }}
        >
          {isInch && i > 0 && (
            <span className="absolute top-2.5 -left-1 text-[8px] font-semibold text-slate-500 select-none">
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
      className="h-6 bg-[#f1f5f9] border-b border-slate-200 flex items-end relative select-none no-print z-10 shadow-sm transition-transform duration-100 ease-out origin-top-left"
      style={{ 
        width: `${width}px`,
        transform: `scale(${scale})`,
        marginRight: `${marginRight}px`,
        marginBottom: '0px' 
      }}
    >
      {/* White writable area representation */}
      <div 
        className="absolute top-0 bottom-0 bg-white border-x border-slate-300 h-full z-0"
        style={{
          left: `${margins.left}px`,
          right: `${margins.right}px`
        }}
      ></div>

      {/* Ticks Container */}
      <div className="w-full h-full bg-transparent relative overflow-hidden z-10">
        {ticks}
        
        {/* Left Indent Markers */}
        <div 
          className="absolute top-0 h-full w-3 cursor-ew-resize group z-20 hover:brightness-110 transition-all"
          style={{ left: `${margins.left - 6}px` }}
        >
            {/* Hanging Indent (Top Triangle) */}
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-t-[6px] border-t-blue-600 absolute top-0 left-0 drop-shadow-sm" title="First Line Indent"></div>
            {/* Left Indent (Bottom Triangle) */}
            <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[6px] border-b-blue-600 absolute top-[8px] left-0 drop-shadow-sm" title="Hanging Indent"></div>
            {/* Left Indent (Square) */}
            <div className="w-[10px] h-[5px] bg-blue-600 absolute top-[14px] left-0 drop-shadow-sm" title="Left Indent"></div>
        </div>
        
        {/* Right Indent Marker */}
        <div 
           className="absolute top-0 h-full w-3 cursor-ew-resize group z-20 hover:brightness-110 transition-all"
           style={{ left: `${width - margins.right - 5}px` }}
        >
             <div className="w-0 h-0 border-l-[5px] border-l-transparent border-r-[5px] border-r-transparent border-b-[8px] border-b-blue-600 absolute top-[11px] left-0 drop-shadow-sm" title="Right Indent"></div>
        </div>
      </div>
    </div>
  );
});
