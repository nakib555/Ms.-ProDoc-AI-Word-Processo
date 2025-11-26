
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
  width: number;
  height: number;
  content: string;
  setContent: (content: string) => void;
  pageConfig: PageConfig;
  zoom: number;
  showRuler: boolean;
  showFormattingMarks: boolean;
  containerRef: (node: HTMLDivElement | null) => void;
}

export const PrintLayoutView: React.FC<PrintLayoutViewProps> = ({
  width,
  height,
  content,
  setContent,
  pageConfig,
  zoom,
  showRuler,
  showFormattingMarks,
  containerRef
}) => {
  // Initialize state with synchronous pagination to prevent flash
  const [pages, setPages] = useState<string[]>(() => paginateContent(content, pageConfig).pages);
  const activePageRef = useRef<number>(0);
  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const listOuterRef = useRef<HTMLDivElement>(null);

  // Pagination Effect: Runs when content or config changes
  useEffect(() => {
    let isMounted = true;
    const runPagination = async () => {
      if (!isMounted) return;
      // Use a timeout to allow React to render and unblock the main thread
      setTimeout(() => {
        if (!isMounted) return;
        const result = paginateContent(content, pageConfig);
        setPages(result.pages);
      }, 10);
    };

    runPagination();
    return () => { isMounted = false; };
  }, [content, pageConfig]);

  // Sync Ruler scroll with List scroll
  useEffect(() => {
      const el = listOuterRef.current;
      if (el) {
          // Pass the outer ref to the parent container registration logic (for fit-to-width etc)
          containerRef(el);

          const handleScroll = () => {
              if (rulerContainerRef.current) {
                  rulerContainerRef.current.scrollLeft = el.scrollLeft;
              }
          };
          
          el.addEventListener('scroll', handleScroll);
          return () => {
              el.removeEventListener('scroll', handleScroll);
              containerRef(null);
          };
      }
  }, [containerRef]);

  // Handle updates from specific pages
  const handlePageUpdate = useCallback((newHtml: string, pageIndex: number) => {
    setPages(currentPages => {
        const updatedPages = [...currentPages];
        updatedPages[pageIndex] = newHtml;
        const fullContent = updatedPages.join('');
        setContent(fullContent);
        return updatedPages;
    });
    activePageRef.current = pageIndex;
  }, [setContent]);

  const setActivePage = useCallback((index: number) => {
      activePageRef.current = index;
  }, []);

  return (
    <div className="w-full h-full flex flex-col relative">
       {/* Sticky Ruler Container */}
       {showRuler && (
         <div 
            ref={rulerContainerRef}
            className="w-full overflow-hidden bg-[#f1f5f9] border-b border-slate-200 z-20 shrink-0 flex justify-center"
            style={{ height: '25px' }}
         >
             <div style={{ transformOrigin: 'top left', display: 'inline-block' }}>
                <Ruler pageConfig={pageConfig} zoom={zoom} />
             </div>
         </div>
       )}

       {/* Scrollable Page Container */}
       <div 
            ref={listOuterRef}
            className="flex-1 relative overflow-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent bg-[#F8F9FA] dark:bg-slate-950"
            style={{
                height: height - (showRuler ? 25 : 0),
            }}
       >
           <div className="flex flex-col items-center py-8 gap-8 min-h-full">
                {pages.map((pageContent, index) => (
                    <div key={index} className="flex justify-center w-full shrink-0">
                        <EditorPage
                            pageNumber={index + 1}
                            totalPages={pages.length}
                            content={pageContent}
                            config={pageConfig}
                            zoom={zoom}
                            showFormattingMarks={showFormattingMarks}
                            onContentChange={handlePageUpdate}
                            onFocus={() => setActivePage(index)}
                        />
                    </div>
                ))}
           </div>
       </div>
    </div>
  );
};
