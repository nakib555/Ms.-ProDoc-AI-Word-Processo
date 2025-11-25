import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { PageConfig } from '../types';

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
  // We use useLayoutEffect to prevent flash of empty content on mount
  useLayoutEffect(() => {
    if (editorRef.current) {
      // Only update innerHTML if it differs from the prop.
      // This prevents resetting the cursor position during normal typing where 
      // the DOM is already ahead or in sync with the React state.
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content]);

  // Use MutationObserver to detect changes from Ribbon commands (execCommand) 
  // which might not always trigger standard input events or React handlers immediately.
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
    switch(config.margins) {
      case 'narrow': return '48px'; // 0.5in
      case 'wide': return '96px 192px'; // 1in V, 2in H
      case 'normal': default: return '96px'; // 1in
    }
  };

  const getBackgroundStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
          backgroundColor: config.pageColor || '#ffffff',
      };
      
      if (config.background === 'ruled') {
          base.backgroundImage = 'linear-gradient(#e2e8f0 1px, transparent 1px)';
          base.backgroundSize = '100% 2rem';
      } else if (config.background === 'grid') {
          base.backgroundImage = 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)';
          base.backgroundSize = '20px 20px';
      }
      return base;
  };

  // Calculate Dimensions based on config (Letter vs A4)
  const width = config.orientation === 'portrait' 
    ? (config.size === 'A4' ? 794 : 816) 
    : (config.size === 'A4' ? 1123 : 1056);
    
  const height = config.orientation === 'portrait' 
    ? (config.size === 'A4' ? 1123 : 1056)
    : (config.size === 'A4' ? 794 : 816);

  return (
    <div 
        className="relative group transition-all duration-300 ease-out"
        style={{
            width: `${width * scale}px`,
            height: `${height * scale}px`,
            marginBottom: '2rem'
        }}
    >
        {/* Page Shadow & Background Layer */}
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
            {/* Header Area (Visual Placeholder) */}
            <div className="absolute top-0 left-0 right-0 h-[48px] pointer-events-none flex items-end justify-center pb-2 opacity-50 hover:opacity-100 transition-opacity">
                <span className="text-[10px] text-slate-400 uppercase tracking-widest">Header</span>
            </div>

            {/* Watermark Layer */}
            {config.watermark && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                     <div className="transform -rotate-45 text-slate-300/40 font-bold text-[8rem] whitespace-nowrap select-none" style={{ color: 'rgba(0,0,0,0.08)' }}>
                        {config.watermark}
                     </div>
                 </div>
            )}

            {/* Body Frame (Content) */}
            <div 
                className="relative w-full h-full"
                style={{ padding: getMargins() }}
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
                        color: '#000000'
                    }}
                />
            </div>

            {/* Footer Area */}
            <div className="absolute bottom-0 left-0 right-0 h-[48px] pointer-events-none flex items-start justify-center pt-2 opacity-50">
                 <span className="text-[10px] text-slate-400 font-mono">Page {pageNumber} of {totalPages}</span>
            </div>
        </div>
    </div>
  );
};