
import React, { useLayoutEffect } from 'react';
import { Globe } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';
import { PageConfig } from '../../../../../types';

export const WebLayoutTool: React.FC = () => {
  const { viewMode, setViewMode } = useEditor();
  return (
    <RibbonButton 
        icon={Globe} 
        label="Web Layout" 
        onClick={() => setViewMode('web')} 
        className={viewMode === 'web' ? 'bg-slate-100 text-blue-700' : ''}
    />
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

export const WebLayoutView: React.FC<WebLayoutViewProps> = ({
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
      // Only update innerHTML if it differs from the prop.
      // This prevents resetting the cursor position during normal typing where 
      // the DOM is already ahead or in sync with the React state.
      if (editorRef.current.innerHTML !== content) {
        editorRef.current.innerHTML = content;
      }
    }
  }, [content, editorRef]);

  return (
    <div 
        className="flex-1 w-full h-full relative"
        onClick={onPageClick}
    >
         <style>{`
            /* Web Layout Specific Overrides for Responsiveness */
            .prodoc-editor-web table { width: 100% !important; max-width: 100%; table-layout: auto; }
            .prodoc-editor-web img { max-width: 100%; height: auto; }
            .prodoc-editor-web { word-wrap: break-word; overflow-wrap: break-word; }
         `}</style>

         {/* Fluid Container Wrapper */}
         <div style={webLayoutStyle} className="relative transition-transform duration-200 origin-top-left">
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
                className={`prodoc-editor prodoc-editor-web w-full outline-none text-lg leading-loose text-slate-900 dark:text-slate-200 z-10 relative ${showFormattingMarks ? 'show-formatting-marks' : ''}`}
                contentEditable={true}
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
};
