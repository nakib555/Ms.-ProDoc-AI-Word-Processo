
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { FileText } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';
import { PageConfig } from '../../../../../types';
import { Ruler } from '../../../../Ruler';
import { EditorPage } from '../../../../EditorPage';
import { paginateContent } from '../../../../../utils/layoutEngine';

export const PrintLayoutTool: React.FC = () => {
  const { viewMode, setViewMode, isAIProcessing } = useEditor();
  return (
    <div className={isAIProcessing ? "opacity-50 cursor-not-allowed" : ""}>
        <RibbonButton 
            icon={FileText} 
            label="Print Layout" 
            onClick={() => !isAIProcessing && setViewMode('print')} 
            className={viewMode === 'print' ? 'bg-indigo-100 text-indigo-700' : ''}
        />
    </div>
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

// --- Robust Global Cursor Tracking Helpers ---

const BLOCK_TAGS = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TR', 'BLOCKQUOTE', 'UL', 'OL', 'TABLE'];

const isBlock = (el: HTMLElement) => {
    return BLOCK_TAGS.includes(el.tagName);
};

// 1. Get Text Length of a Node (Normalized for our Cursor Logic)
// We treat block boundaries as a "virtual character" (length 1) to distinguish 
// between "End of Para 1" and "Start of Para 2".
const getNodeTextLength = (node: Node): number => {
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.nodeValue || "").length;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        // Atomic elements that act as a single character/block
        if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break')) {
            return 1;
        }
        // BR tags are effectively 1 character (newline)
        if (el.tagName === 'BR') {
            return 1;
        }
        
        let len = 0;
        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            len += getNodeTextLength(childNodes[i]);
        }
        
        // Add 1 for block boundary to disambiguate positions between blocks
        if (isBlock(el)) len += 1;
        
        return len;
    }
    
    return 0;
};

// 2. Get Global Offset
const getGlobalCursorPosition = (): number | null => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const range = sel.getRangeAt(0);
    
    // Determine which page we are on
    let pageElement: HTMLElement | null = null;
    let pageIndex = -1;
    let curr: Node | null = range.startContainer;

    while(curr) {
        if (curr.nodeType === Node.ELEMENT_NODE) {
            const el = curr as HTMLElement;
            if (el.id && el.id.startsWith('prodoc-editor-')) {
                pageElement = el;
                pageIndex = parseInt(el.id.replace('prodoc-editor-', ''), 10);
                break;
            }
        }
        curr = curr.parentNode;
    }

    if (!pageElement || pageIndex === -1) return null;

    let globalOffset = 0;

    // Sum previous pages
    // We query DOM directly to ensure we get the state right before the update
    for (let i = 1; i < pageIndex; i++) {
        const pEl = document.getElementById(`prodoc-editor-${i}`);
        if (pEl) {
            globalOffset += getNodeTextLength(pEl);
        }
    }

    // Add local offset
    globalOffset += getOffsetInNode(pageElement, range.startContainer, range.startOffset);

    return globalOffset;
};

// Helper to calculate offset within a root node up to a specific target node/offset
const getOffsetInNode = (root: Node, target: Node, targetOffset: number): number => {
    let offset = 0;
    let found = false;

    const walk = (node: Node) => {
        if (found) return;

        if (node === target) {
            if (node.nodeType === Node.TEXT_NODE) {
                offset += targetOffset;
            } else {
                // If cursor is on Element, targetOffset is child index
                for(let i=0; i<targetOffset; i++) {
                    offset += getNodeTextLength(node.childNodes[i]);
                }
            }
            found = true;
            return;
        }

        if (node.nodeType === Node.TEXT_NODE) {
            offset += (node.nodeValue || "").length;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
             const el = node as HTMLElement;
             if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break') || el.tagName === 'BR') {
                 offset += 1;
             } else {
                 for (let i = 0; i < node.childNodes.length; i++) {
                    walk(node.childNodes[i]);
                    if (found) return;
                 }
                 if (isBlock(el)) offset += 1;
             }
        }
    };

    if (root === target) {
         for(let i=0; i<targetOffset; i++) {
            offset += getNodeTextLength(root.childNodes[i]);
         }
         return offset;
    }

    for (let i = 0; i < root.childNodes.length; i++) {
        walk(root.childNodes[i]);
        if (found) break;
    }
    
    return offset;
};

// 3. Restore Cursor
const restoreGlobalCursor = (globalOffset: number) => {
    // Find total pages currently in DOM
    const pages = document.querySelectorAll('[id^="prodoc-editor-"]');
    const totalPages = pages.length;
    
    let currentTotal = 0;
    
    for (let i = 1; i <= totalPages; i++) {
        const el = document.getElementById(`prodoc-editor-${i}`);
        if (!el) continue;
        
        const pageLen = getNodeTextLength(el);
        
        // Logic: If offset falls in this page.
        // We use < instead of <= to prefer the START of the next page if we are exactly on the boundary
        // and that boundary represents a new block/page.
        if (globalOffset < currentTotal + pageLen) {
            const localOffset = Math.max(0, globalOffset - currentTotal);
            setCursorInNode(el, localOffset);
            return;
        }
        currentTotal += pageLen;
    }
    
    // If we overshoot or hit exact end of document, put at end of last page
    const lastPage = document.getElementById(`prodoc-editor-${totalPages}`);
    if (lastPage) {
        const lastLen = getNodeTextLength(lastPage);
        setCursorInNode(lastPage, lastLen);
    }
};

const setCursorInNode = (root: HTMLElement, offset: number) => {
    let currentCount = 0;
    let found = false;
    const range = document.createRange();

    const walk = (node: Node) => {
        if (found) return;

        if (node.nodeType === Node.TEXT_NODE) {
            const len = (node.nodeValue || "").length;
            if (currentCount + len >= offset) {
                range.setStart(node, offset - currentCount);
                range.collapse(true);
                found = true;
                return;
            }
            currentCount += len;
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break') || el.tagName === 'BR') {
                if (currentCount + 1 >= offset) {
                    // For BR/Atomic, place cursor after it
                    range.setStartAfter(node);
                    range.collapse(true);
                    found = true;
                    return;
                }
                currentCount += 1;
            } else {
                for (let i = 0; i < node.childNodes.length; i++) {
                    walk(node.childNodes[i]);
                    if (found) return;
                }
                
                // Account for block boundary
                if (isBlock(el)) {
                    // If offset targets exactly this virtual boundary, it usually means 
                    // start of next node, so we let the loop continue or next sibling pick it up.
                    currentCount += 1;
                }
            }
        }
    };

    // Edge case: empty root or offset 0
    if (offset === 0) {
        range.setStart(root, 0);
        range.collapse(true);
        found = true;
    } else {
        walk(root);
    }

    if (found) {
        root.focus(); 
        const sel = window.getSelection();
        if (sel) {
            sel.removeAllRanges();
            sel.addRange(range);
            
            // Scroll into view logic
            const rect = range.getBoundingClientRect();
            // If rect is 0 (hidden or collapsed in empty), fallback to container
            if (rect.top === 0 && rect.height === 0) {
                 const el = range.startContainer.nodeType === Node.TEXT_NODE 
                    ? range.startContainer.parentElement 
                    : range.startContainer as HTMLElement;
                 el?.scrollIntoView({ behavior: 'auto', block: 'nearest' });
            } else if (rect.top < 50 || rect.bottom > window.innerHeight - 50) {
                 const el = range.startContainer.nodeType === Node.TEXT_NODE 
                    ? range.startContainer.parentElement 
                    : range.startContainer as HTMLElement;
                 el?.scrollIntoView({ behavior: 'auto', block: 'center' });
            }
        }
    } else {
        // Fallback: If not found (e.g. due to weird mismatch), set to end
        const range = document.createRange();
        range.selectNodeContents(root);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    }
};

export const PrintLayoutView: React.FC<PrintLayoutViewProps> = React.memo(({
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
  const { 
    setTotalPages, 
    setCurrentPage, 
    pageMovement,
    activeEditingArea,
    setActiveEditingArea,
    headerContent,
    setHeaderContent,
    footerContent,
    setFooterContent,
  } = useEditor();
  
  const [pages, setPages] = useState<{ html: string, config: PageConfig }[]>(() => paginateContent(content, pageConfig).pages);
  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  
  // Ref to hold the cursor position we want to restore after a layout effect
  const cursorRestorationRef = useRef<number | null>(null);

  // Pagination Effect
  useEffect(() => {
    let isMounted = true;
    
    const timer = setTimeout(() => {
        if (!isMounted) return;
        
        // 1. Capture Global Cursor BEFORE pagination changes the DOM structure
        const currentCursor = getGlobalCursorPosition();
        
        const result = paginateContent(content, pageConfig);
        
        setPages(result.pages);
        setTotalPages(result.pages.length);
        
        if (currentCursor !== null) {
            cursorRestorationRef.current = currentCursor;
        }
        
    }, 40);

    return () => { 
        isMounted = false; 
        clearTimeout(timer);
    };
  }, [content, pageConfig, setTotalPages]);

  // Restore Cursor AFTER Render
  useLayoutEffect(() => {
      if (cursorRestorationRef.current !== null) {
          restoreGlobalCursor(cursorRestorationRef.current);
          cursorRestorationRef.current = null;
      }
  }, [pages]); // Runs when pages structure updates

  const handlePageUpdate = useCallback((newHtml: string, pageIndex: number) => {
    setPages(currentPages => {
        const updatedPages = [...currentPages];
        if (updatedPages[pageIndex].html !== newHtml) {
            updatedPages[pageIndex] = { ...updatedPages[pageIndex], html: newHtml };
            const fullContent = updatedPages.map(p => p.html).join('');
            // Defer setContent to next tick to let React render current changes
            setTimeout(() => setContent(fullContent), 0);
            return updatedPages;
        }
        return currentPages;
    });
  }, [setContent]);

  const handlePageFocus = useCallback((index: number) => {
      setCurrentPage(index + 1);
  }, [setCurrentPage]);

  // Unified scroll handler
  const handleScroll = useCallback((e: React.UIEvent<HTMLDivElement>) => {
      const container = e.currentTarget;
      
      // Sync Ruler
      if (rulerContainerRef.current) {
          rulerContainerRef.current.scrollLeft = container.scrollLeft;
      }

      // Determine active page
      const containerRect = container.getBoundingClientRect();
      const centerY = containerRect.top + containerRect.height / 2;
      const centerX = containerRect.left + containerRect.width / 2;

      const pageWrappers = Array.from(container.getElementsByClassName('prodoc-page-wrapper')) as HTMLElement[];
      
      let closestPage = 1;
      let minDistance = Infinity;

      for (const wrapper of pageWrappers) {
          const rect = wrapper.getBoundingClientRect();
          const wrapperCenterX = rect.left + rect.width / 2;
          const wrapperCenterY = rect.top + rect.height / 2;
          
          const dist = Math.hypot(wrapperCenterX - centerX, wrapperCenterY - centerY);
          
          if (dist < minDistance) {
              minDistance = dist;
              const pageIndex = Number(wrapper.getAttribute('data-page-index'));
              if (!isNaN(pageIndex)) closestPage = pageIndex + 1;
          }
      }
      
      setCurrentPage(closestPage);
  }, [setCurrentPage]);

  const setRefs = useCallback((node: HTMLDivElement | null) => {
      scrollContainerRef.current = node;
      containerRef(node);
  }, [containerRef]);

  const handleBackgroundClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && activeEditingArea !== 'body') {
          setActiveEditingArea('body');
      } else if (e.target === e.currentTarget) {
          // Clicked outside pages, focus last page end
          const lastPageId = `prodoc-editor-${pages.length}`;
          const lastPage = document.getElementById(lastPageId);
          if (lastPage) {
              lastPage.focus();
              const range = document.createRange();
              range.selectNodeContents(lastPage);
              range.collapse(false);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
          }
      }
  };

  const isVertical = pageMovement === 'vertical';

  return (
    <div className="w-full h-full flex flex-col relative bg-[#f1f5f9] dark:bg-slate-950 transition-colors duration-300">
       {showRuler && (
         <div 
            ref={rulerContainerRef}
            className="w-full overflow-hidden bg-[#F8F9FA] border-b border-slate-200 z-20 shrink-0 flex justify-center sticky top-0 shadow-sm"
            style={{ height: '25px' }}
            onMouseDown={(e) => e.preventDefault()}
         >
             <div style={{ transformOrigin: 'top left', display: 'inline-block' }}>
                <Ruler pageConfig={pageConfig} zoom={zoom} />
             </div>
         </div>
       )}

       <div 
          ref={setRefs}
          className="flex-1 relative overflow-auto scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
          onScroll={handleScroll}
          onDoubleClick={() => setActiveEditingArea('body')}
       >
           <div 
                className={`min-w-full min-h-full w-fit flex ${isVertical ? 'flex-col items-center justify-start py-8 gap-8' : 'flex-row flex-wrap justify-center content-start py-8 gap-8'}`}
                onClick={handleBackgroundClick}
           >
                {pages.map((pageData, index) => (
                    <div 
                        key={index} 
                        className="prodoc-page-wrapper box-border shrink-0 transition-all duration-300 relative group"
                        data-page-index={index}
                    >
                        <EditorPage
                            pageNumber={index + 1}
                            totalPages={pages.length}
                            content={pageData.html}
                            config={pageData.config}
                            zoom={zoom}
                            showFormattingMarks={showFormattingMarks}
                            onContentChange={handlePageUpdate}
                            onFocus={() => handlePageFocus(index)}
                            activeEditingArea={activeEditingArea}
                            setActiveEditingArea={setActiveEditingArea}
                            headerContent={headerContent}
                            setHeaderContent={setHeaderContent}
                            footerContent={footerContent}
                            setFooterContent={setFooterContent}
                        />
                        {index < pages.length - 1 && isVertical && (
                            <div className="absolute left-0 right-0 -bottom-8 h-8 opacity-0 group-hover:opacity-100 flex items-center justify-center pointer-events-none transition-opacity">
                                <div className="h-[1px] bg-slate-400 w-12"></div>
                            </div>
                        )}
                    </div>
                ))}
           </div>
       </div>
    </div>
  );
});