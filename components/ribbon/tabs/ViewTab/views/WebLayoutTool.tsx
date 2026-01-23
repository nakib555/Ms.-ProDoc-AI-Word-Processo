
import React, { useLayoutEffect, useRef, useEffect, useCallback } from 'react';
import { Globe } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';
import { PageConfig } from '../../../../../types';
import { useMathLive } from '../../../../../hooks/useMathLive';

export const WebLayoutTool: React.FC = () => {
  const { viewMode, setViewMode, isAIProcessing } = useEditor();
  return (
    <div className={isAIProcessing ? "opacity-50 cursor-not-allowed" : ""}>
        <RibbonButton 
            icon={Globe} 
            label="Web Layout" 
            onClick={() => !isAIProcessing && setViewMode('web')} 
            className={viewMode === 'web' ? 'bg-slate-100 text-blue-700' : ''}
            iconClassName="text-indigo-600"
        />
    </div>
  );
};

interface WebLayoutViewProps {
  editorRef: React.RefObject<HTMLDivElement | null>;
  content: string;
  onInput: (e: React.FormEvent<HTMLDivElement>) => void;
  onPaste: (e: React.ClipboardEvent) => void;
  onPageClick: (e: React.MouseEvent) => void;
  pageConfig: PageConfig;
  zoom: number;
  showFormattingMarks: boolean;
  backgroundStyle: React.CSSProperties;
}

export const WebLayoutView: React.FC<WebLayoutViewProps> = React.memo(({
  editorRef,
  content,
  onInput,
  onPaste,
  onPageClick,
  pageConfig,
  zoom,
  showFormattingMarks,
  backgroundStyle
}) => {
  const scale = zoom / 100;
  const { isKeyboardLocked, selectionMode, setZoom } = useEditor();
  
  // Refs for Pinch-to-Zoom and Wheel
  const touchDistRef = useRef<number>(0);
  const startZoomRef = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Initialize MathLive for any equations
  useMathLive(content, editorRef);

  // In Web Layout, we scale the container but compensate width to fill viewport
  const webLayoutStyle: React.CSSProperties = {
    minHeight: '100%',
    width: `${100 / scale}%`, // Compensate width reduction from scale
    transform: `scale(${scale})`,
    transformOrigin: 'top left',
    padding: '2rem 3rem', // Relaxed web padding
    ...backgroundStyle
  };

  // Sync content to editable div without losing cursor
  useLayoutEffect(() => {
    if (editorRef.current) {
      // Protection: If focus is inside a math-field, do not enforce content sync from props.
      const activeEl = document.activeElement;
      const isMathFieldFocused = activeEl && activeEl.tagName.toLowerCase() === 'math-field' && editorRef.current.contains(activeEl);
      
      if (isMathFieldFocused) {
          return;
      }

      // Only update innerHTML if it differs from the prop.
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content, editorRef]);

  // --- Zoom Logic (Ctrl+Wheel) ---
  useEffect(() => {
      const el = containerRef.current;
      if (!el) return;

      const handleWheel = (e: WheelEvent) => {
          if (e.ctrlKey) {
              e.preventDefault();
              const delta = e.deltaY > 0 ? 0.9 : 1.1;
              setZoom(prev => Math.min(500, Math.max(10, prev * delta)));
          }
      };

      el.addEventListener('wheel', handleWheel, { passive: false });
      return () => el.removeEventListener('wheel', handleWheel);
  }, [setZoom]);

  // --- Pinch to Zoom Logic ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
        // Calculate initial distance
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );
        touchDistRef.current = dist;
        startZoomRef.current = zoom;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
        e.preventDefault(); // Prevent native browser zoom/scroll
        const dist = Math.hypot(
            e.touches[0].clientX - e.touches[1].clientX,
            e.touches[0].clientY - e.touches[1].clientY
        );

        if (touchDistRef.current > 0) {
            const ratio = dist / touchDistRef.current;
            const newZoom = Math.min(500, Math.max(10, startZoomRef.current * ratio));
            setZoom(newZoom);
        }
    }
  };

  return (
    <div 
        ref={containerRef}
        className="flex-1 w-full h-full relative touch-pan-x touch-pan-y"
        onClick={onPageClick}
        onMouseDown={(e) => {
            // Prevent focus loss if clicking background (unless clicking specific interactive elements)
            if (e.target === e.currentTarget) {
                e.preventDefault();
                // If currently not focused, focus editor
                if (document.activeElement !== editorRef.current && editorRef.current) {
                    editorRef.current.focus();
                }
            }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
    >
         <style>{`
            /* Web Layout Specific Overrides for Responsiveness */
            .prodoc-editor-web table { width: 100% !important; max-width: 100%; table-layout: auto; }
            .prodoc-editor-web img { max-width: 100%; height: auto; }
            .prodoc-editor-web { word-wrap: break-word; overflow-wrap: break-word; }
         `}</style>

         {/* Fluid Container Wrapper */}
         <div style={webLayoutStyle} className="relative transition-all duration-75 ease-linear origin-top-left">
             {/* Watermark Layer */}
             {pageConfig.watermark && (
                 <div className="fixed inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0 opacity-60">
                     <div className="transform -rotate-45 text-slate-300/20 font-bold text-[8rem] whitespace-nowrap select-none">
                        {pageConfig.watermark}
                     </div>
                 </div>
             )}

             <div
                key="editor-web"
                ref={editorRef}
                className={`prodoc-editor prodoc-editor-web w-full outline-none text-lg leading-loose text-slate-900 dark:text-slate-200 z-10 relative ${showFormattingMarks ? 'show-formatting-marks' : ''} ${selectionMode ? 'cursor-crosshair' : isKeyboardLocked ? 'cursor-default' : 'cursor-text'}`}
                
                // Key Change: Allow contentEditable so interactions work, but use inputMode="none" to suppress keyboard
                contentEditable={true}
                inputMode={isKeyboardLocked || selectionMode ? "none" : "text"}
                
                onInput={onInput}
                onPaste={onPaste}
                onKeyDown={(e) => {
                    // Prevent typing if locked (handles physical keyboards)
                    if (isKeyboardLocked && !selectionMode) {
                        // Allow navigation keys
                        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key) && !(e.ctrlKey || e.metaKey)) {
                             e.preventDefault();
                             return;
                        }
                    }

                    // Undo / Redo Shortcuts
                    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
                        if (e.key.toLowerCase() === 'z') {
                            e.preventDefault();
                            if (e.shiftKey) {
                                document.execCommand('redo');
                            } else {
                                document.execCommand('undo');
                            }
                            return;
                        }
                        if (e.key.toLowerCase() === 'y') {
                            e.preventDefault();
                            document.execCommand('redo');
                            return;
                        }
                    }
                }}
                suppressContentEditableWarning={true}
                style={{
                    fontFamily: 'Calibri, Inter, sans-serif',
                    minHeight: '80vh'
                }}
            />
         </div>
    </div>
  );
});
