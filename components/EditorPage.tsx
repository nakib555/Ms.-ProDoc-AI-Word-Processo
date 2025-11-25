import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { PageConfig } from '../types';
import { PAGE_SIZES } from '../constants';

interface EditorPageProps {
  content: string;
  pageNumber: number;
  totalPages: number;
  config: PageConfig;
  zoom: number;
  readOnly?: boolean;
  onContentChange?: (html: string, pageIndex: number) => void;
  onFocus?: () => void;
  showFormattingMarks: boolean;
}

export const EditorPage: React.FC<EditorPageProps> = ({
  content,
  pageNumber,
  totalPages,
  config,
  zoom,
  readOnly,
  onContentChange,
  onFocus,
  showFormattingMarks
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const scale = zoom / 100;

  // Sync content to editable div without losing cursor
  useLayoutEffect(() => {
    if (editorRef.current) {
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  useEffect(() => {
    if (!editorRef.current || readOnly || !onContentChange) return;

    const observer = new MutationObserver(() => {
        if (editorRef.current) {
            onContentChange(editorRef.current.innerHTML, pageNumber - 1);
        }
    });

    observer.observe(editorRef.current, {
        characterData: true,
        childList: true,
        subtree: true,
        attributes: true
    });

    return () => observer.disconnect();
  }, [onContentChange, pageNumber, readOnly]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (onContentChange) {
      onContentChange(e.currentTarget.innerHTML, pageNumber - 1);
    }
  };

  const getMargins = () => {
    const m = config.margins;
    
    // 96px per inch
    const top = m.top * 96;
    const bottom = m.bottom * 96;
    
    let left = m.left * 96;
    let right = m.right * 96;
    const gutterPx = (m.gutter || 0) * 96;
    
    // Handle Multiple Pages Modes (Mirror Margins / Book Fold)
    const isSpread = config.multiplePages === 'mirrorMargins' || config.multiplePages === 'bookFold';
    
    if (isSpread) {
       // If Mirror Margins is set:
       // config.margins.left is treated as "Inside"
       // config.margins.right is treated as "Outside"
       const inside = m.left * 96;
       const outside = m.right * 96;
       
       const isOdd = pageNumber % 2 !== 0;
       
       if (isOdd) {
           // Odd Page (Right side of spread): Binding is on Left (Inside)
           left = inside + gutterPx; // Gutter adds to Inside (Left)
           right = outside;
       } else {
           // Even Page (Left side of spread): Binding is on Right (Inside)
           left = outside;
           right = inside + gutterPx; // Gutter adds to Inside (Right)
       }
    } else {
        // Standard or 2 Pages Per Sheet
        // Gutter adds to Left unless Top is specified
        if (config.gutterPosition === 'top') {
            // Top gutter handled via return value gutterTop logic below
        } else {
            left += gutterPx;
        }
    }

    return { top, right, bottom, left, gutterPx };
  };

  const getBackgroundStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
          backgroundColor: config.pageColor || '#ffffff',
      };
      
      if (config.background === 'ruled') {
          return {
              ...base,
              backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px)',
              backgroundSize: '100% 2rem'
          };
      } else if (config.background === 'grid') {
          return {
              ...base,
              backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '20px 20px'
          };
      }
      return base;
  };

  // Calculate Dimensions
  let width, height;
  if (config.size === 'Custom' && config.customWidth && config.customHeight) {
      width = config.customWidth * 96;
      height = config.customHeight * 96;
  } else {
      const base = PAGE_SIZES[config.size as keyof typeof PAGE_SIZES] || PAGE_SIZES['Letter'];
      
      width = config.orientation === 'portrait' ? base.width : base.height;
      height = config.orientation === 'portrait' ? base.height : base.width;
  }

  const margins = getMargins();
  const gutterTop = (!['mirrorMargins', 'bookFold'].includes(config.multiplePages || '') && config.gutterPosition === 'top') ? margins.gutterPx : 0;

  // Vertical Alignment
  const getVerticalAlignStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {
          display: 'flex',
          flexDirection: 'column'
      };
      
      let justifyContent: 'center' | 'flex-end' | 'space-between' | 'flex-start' = 'flex-start';

      if (config.verticalAlign === 'center') justifyContent = 'center';
      else if (config.verticalAlign === 'bottom') justifyContent = 'flex-end';
      else if (config.verticalAlign === 'justify') justifyContent = 'space-between';
      
      return { ...style, justifyContent };
  };

  return (
    <div 
        className="relative group transition-all duration-300 ease-out page-shadow"
        style={{
            width: `${width * scale}px`,
            height: `${height * scale}px`,
            marginBottom: '2rem'
        }}
    >
        {/* Page Container */}
        <div 
            className="absolute inset-0 bg-white shadow-[rgba(0,0,0,0.06)_0px_4px_12px,rgba(0,0,0,0.04)_0px_0px_0px_1px] transition-shadow group-hover:shadow-[rgba(0,0,0,0.1)_0px_10px_20px,rgba(0,0,0,0.04)_0px_0px_0px_1px]"
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${width}px`,
                height: `${height}px`,
                ...getBackgroundStyle()
            }}
        >
            {/* Header Area */}
            <div 
                className="absolute left-0 right-0 pointer-events-none flex items-end justify-center border-b border-transparent hover:border-slate-200 transition-colors z-20"
                style={{ 
                    top: 0, 
                    height: `${(config.headerDistance || 0.5) * 96}px`,
                    paddingBottom: '4px'
                }}
            >
                <div className="w-full px-8 text-center relative">
                    <span className="text-[10px] text-slate-400 uppercase tracking-widest opacity-0 group-hover:opacity-50 transition-opacity absolute top-1 left-1/2 -translate-x-1/2">Header</span>
                </div>
            </div>

            {/* Watermark */}
            {config.watermark && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                     <div className="transform -rotate-45 text-slate-300/40 font-bold text-[8rem] whitespace-nowrap select-none" style={{ color: 'rgba(0,0,0,0.08)' }}>
                        {config.watermark}
                     </div>
                 </div>
            )}

            {/* Body Frame */}
            <div 
                className="relative w-full h-full"
                style={{ 
                    padding: `${margins.top + gutterTop}px ${margins.right}px ${margins.bottom}px ${margins.left}px`,
                    ...getVerticalAlignStyle()
                }}
            >
                <div
                    ref={editorRef}
                    className={`prodoc-editor w-full h-full outline-none text-lg leading-loose break-words z-10 ${showFormattingMarks ? 'show-formatting-marks' : ''}`}
                    contentEditable={!readOnly}
                    onInput={handleInput}
                    onFocus={onFocus}
                    suppressContentEditableWarning={true}
                    style={{
                        fontFamily: 'Calibri, Inter, sans-serif',
                        color: '#000000',
                        // Ensure flex children (if vertical align justify) work
                        flex: config.verticalAlign === 'justify' ? '1 1 auto' : undefined 
                    }}
                />
            </div>

            {/* Footer Area */}
            <div 
                className="absolute left-0 right-0 pointer-events-none flex items-start justify-center border-t border-transparent hover:border-slate-200 transition-colors z-20"
                style={{
                    bottom: 0,
                    height: `${(config.footerDistance || 0.5) * 96}px`,
                    paddingTop: '4px'
                }}
            >
                 <span className="text-[10px] text-slate-400 font-mono opacity-50">Page {pageNumber} of {totalPages}</span>
            </div>
        </div>
    </div>
  );
};