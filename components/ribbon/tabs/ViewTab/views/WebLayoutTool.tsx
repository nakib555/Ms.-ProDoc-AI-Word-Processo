
import React, { useLayoutEffect } from 'react';
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
  const { isKeyboardLocked, selectionMode } = useEditor();
  
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

  return (
    <div 
        className="flex-1 w-full h-full relative"
        onClick={onPageClick}
        onMouseDown={(e) => {
            // Prevent focus loss if clicking background (unless clicking specific interactive elements)
            if (e.target === e.currentTarget) {
                e.preventDefault();
                // If currently not focused, focus editor
                if (document.activeElement !== editorRef.current && editorRef.current && !isKeyboardLocked) {
                    editorRef.current.focus();
                }
            }
        }}
    >
         <style>{`
            /* Web Layout Specific Overrides for Responsiveness */
            .prodoc-editor-web table { width: 100% !important; max-width: 100%; table-layout: auto; }
            .prodoc-editor-web img { max-width: 100%; height: auto; }
            .prodoc-editor-web { word-wrap: break-word; overflow-wrap: break-word; }
         `}</style>

         {/* Fluid Container Wrapper */}
         <div style={webLayoutStyle} className="relative transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] origin-top-left">
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
                className={`prodoc-editor prodoc-editor-web w-full outline-none text-lg leading-loose text-slate-900 dark:text-slate-200 z-10 relative ${showFormattingMarks ? 'show-formatting-marks' : ''} ${isKeyboardLocked && !selectionMode ? 'cursor-default' : 'cursor-text'}`}
                contentEditable={!isKeyboardLocked || selectionMode}
                inputMode={selectionMode ? "none" : undefined}
                onInput={onInput}
                onPaste={onPaste}
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
