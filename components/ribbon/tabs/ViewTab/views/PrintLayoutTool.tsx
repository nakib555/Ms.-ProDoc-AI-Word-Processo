import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';
import { PageConfig } from '../../../../../types';
import { Ruler } from '../../../../Ruler';
import { EditorPage } from '../../../../EditorPage';
import { paginateContent } from '../../../../../utils/layoutEngine';

export const PrintLayoutTool: React.FC = () => {
  const { viewMode, setViewMode } = useEditor();
  return (
    <RibbonButton 
        icon={FileText} 
        label="Print Layout" 
        onClick={() => setViewMode('print')} 
        className={viewMode === 'print' ? 'bg-slate-100 text-blue-700' : ''}
    />
  );
};

interface PrintLayoutViewProps {
  content: string;
  setContent: (content: string) => void;
  pageConfig: PageConfig;
  zoom: number;
  showRuler: boolean;
  showFormattingMarks: boolean;
}

export const PrintLayoutView: React.FC<PrintLayoutViewProps> = ({
  content,
  setContent,
  pageConfig,
  zoom,
  showRuler,
  showFormattingMarks
}) => {
  // Initialize state with synchronous pagination to prevent flash
  const [pages, setPages] = useState<string[]>(() => paginateContent(content, pageConfig).pages);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [isPaginating, setIsPaginating] = useState(false);
  const activePageRef = useRef<number>(0);
  const scale = zoom / 100;

  // Pagination Effect: Runs when content or config changes
  useEffect(() => {
    let isMounted = true;
    const runPagination = async () => {
      if (!isMounted) return;
      setIsPaginating(true);
      // Use a timeout to allow React to render and unblock the main thread
      // This mimics the "incremental layout" of Word
      setTimeout(() => {
        if (!isMounted) return;
        const result = paginateContent(content, pageConfig);
        setPages(result.pages);
        setIsPaginating(false);
      }, 10);
    };

    runPagination();
    return () => { isMounted = false; };
  }, [content, pageConfig]);

  // Handle updates from specific pages
  const handlePageUpdate = useCallback((newHtml: string, pageIndex: number) => {
    setPages(currentPages => {
        const updatedPages = [...currentPages];
        updatedPages[pageIndex] = newHtml;
        const fullContent = updatedPages.join('');
        
        // We update the global content context. 
        // This will trigger the Pagination Effect above (debounced via setTimeout).
        setContent(fullContent);
        
        return updatedPages;
    });
    
    activePageRef.current = pageIndex;
  }, [setContent]);

  return (
    <div className="flex flex-col items-center min-h-full pt-8 pb-20">
       {showRuler && (
         <div 
           className="sticky top-0 z-20 mb-6 origin-top transition-all duration-300" 
           style={{ 
             transform: `scale(${scale})`,
             marginBottom: `${24 * scale}px`
           }}
         >
           <Ruler />
         </div>
       )}

       {pages.map((pageContent, index) => (
         <EditorPage
            key={`page-${index}`}
            pageNumber={index + 1}
            totalPages={pages.length}
            content={pageContent}
            config={pageConfig}
            zoom={zoom}
            showFormattingMarks={showFormattingMarks}
            onContentChange={handlePageUpdate}
            onFocus={() => { activePageRef.current = index; }}
         />
       ))}
       
       {/* Click area below pages to focus last page */}
       <div 
         className="flex-1 w-full min-h-[200px] cursor-text" 
         onClick={() => {
            // Logic to focus the last page would go here
         }}
       ></div>
    </div>
  );
};