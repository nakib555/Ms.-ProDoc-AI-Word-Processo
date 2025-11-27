
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { FileText } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';
import { PageConfig } from '../../../../../types';
import { Ruler } from '../../../../Ruler';
import { EditorPage } from '../../../../EditorPage';
import { paginateContent } from '../../../../../utils/layoutEngine';
import { PAGE_SIZES } from '../../../../../constants';

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
  const { setTotalPages, setCurrentPage } = useEditor();
  // Initialize state with synchronous pagination to prevent flash
  const [pages, setPages] = useState<string[]>(() => paginateContent(content, pageConfig).pages);
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
        // Update the global page count context
        setTotalPages(result.pages.length);
      }, 10);
    };

    runPagination();
    return () => { isMounted = false; };
  }, [content, pageConfig, setTotalPages]);

  // Sync Ruler scroll and detect current page
  useEffect(() => {
      const el = listOuterRef.current;
      if (el) {
          // Pass the outer ref to the parent container registration logic (for fit-to-width etc)
          containerRef(el);

          const handleScroll = () => {
              // 1. Sync Ruler
              if (rulerContainerRef.current) {
                  rulerContainerRef.current.scrollLeft = el.scrollLeft;
              }

              // 2. Detect Current Page
              const { scrollTop, clientHeight } = el;
              
              // Determine page height in pixels based on configuration and zoom
              let pageHeightPx = 0;
              if (pageConfig.size === 'Custom' && pageConfig.customWidth && pageConfig.customHeight) {
                  const h = pageConfig.orientation === 'portrait' ? pageConfig.customHeight : pageConfig.customWidth;
                  pageHeightPx = h * 96;
              } else {
                  const base = PAGE_SIZES[pageConfig.size as string] || PAGE_SIZES['Letter'];
                  const h = pageConfig.orientation === 'portrait' ? base.height : base.width;
                  pageHeightPx = h;
              }
              
              const scale = zoom / 100;
              const scaledPageHeight = pageHeightPx * scale;
              
              // 32px vertical padding (py-8) at top of container + 32px gap (gap-8) between pages
              const gap = 32; 
              const initialOffset = 32;
              const totalItemHeight = scaledPageHeight + gap;
              
              // Calculate the page that is roughly in the center of the viewport
              const viewCenter = scrollTop + (clientHeight / 2);
              
              // Solve for index: viewCenter = initialOffset + index * totalItemHeight + (scaledPageHeight/2)
              // This is an approximation assuming all pages are same size (which they are in this editor)
              let pageIndex = Math.floor((viewCenter - initialOffset) / totalItemHeight);
              
              // Clamp index
              pageIndex = Math.max(0, Math.min(pageIndex, pages.length - 1));
              
              setCurrentPage(pageIndex + 1);
          };
          
          el.addEventListener('scroll', handleScroll);
          // Run once to set initial state
          handleScroll();
          
          return () => {
              el.removeEventListener('scroll', handleScroll);
              containerRef(null);
          };
      }
  }, [containerRef, zoom, pageConfig, pages.length, setCurrentPage]);

  // Handle updates from specific pages
  const handlePageUpdate = useCallback((newHtml: string, pageIndex: number) => {
    setPages(currentPages => {
        const updatedPages = [...currentPages];
        updatedPages[pageIndex] = newHtml;
        const fullContent = updatedPages.join('');
        setContent(fullContent);
        return updatedPages;
    });
  }, [setContent]);

  // Allow pages to set themselves as active on focus (click/typing)
  const handlePageFocus = useCallback((index: number) => {
      setCurrentPage(index + 1);
  }, [setCurrentPage]);

  const handleBackgroundMouseDown = (e: React.MouseEvent) => {
      // If clicking on the gray background (not the page itself or its contents)
      // prevent default to avoid blurring the active editor
      if (e.target === e.currentTarget || (e.target as HTMLElement).classList.contains('page-container-wrapper')) {
          e.preventDefault();
      }
  };

  return (
    <div className="w-full h-full flex flex-col relative">
       {/* Sticky Ruler Container */}
       {showRuler && (
         <div 
            ref={rulerContainerRef}
            className="w-full overflow-hidden bg-[#f1f5f9] border-b border-slate-200 z-20 shrink-0 flex justify-center"
            style={{ height: '25px' }}
            onMouseDown={(e) => e.preventDefault()} // Ruler shouldn't steal focus
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
            onMouseDown={handleBackgroundMouseDown}
       >
           <div className="flex flex-col items-center py-8 gap-8 min-h-full page-container-wrapper">
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
                            onFocus={() => handlePageFocus(index)}
                        />
                    </div>
                ))}
           </div>
       </div>
    </div>
  );
};
