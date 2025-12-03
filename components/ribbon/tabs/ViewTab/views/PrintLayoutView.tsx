
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo, createContext, useContext } from 'react';
import { FileText } from 'lucide-react';
import { FixedSizeList as List, ListChildComponentProps, VariableSizeList } from 'react-window';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';
import { PageConfig } from '../../../../../types';
import { Ruler } from '../../../../Ruler';
import { EditorPage } from '../../../../EditorPage';
import { paginateContent, PaginatorResult } from '../../../../../utils/layoutEngine';
import { PAGE_SIZES } from '../../../../../constants';

export const PrintLayoutTool: React.FC = () => {
  const { viewMode, setViewMode } = useEditor();
  return (
    <RibbonButton 
        icon={FileText} 
        label="Print Layout" 
        onClick={() => setViewMode('print')} 
        className={viewMode === 'print' ? 'bg-indigo-100 text-indigo-700' : ''}
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

// --- Layout Context for Virtual List Components ---
const LayoutContext = createContext<{
    listWidth: number;
    rulerRef: React.RefObject<HTMLDivElement | null>;
} | null>(null);

// --- Static Inner Element ---
const InnerElement = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ style, ...rest }, ref) => {
    const ctx = useContext(LayoutContext);
    const width = ctx ? ctx.listWidth : '100%';
    return (
        <div
            ref={ref}
            style={{
                ...style,
                width,
                position: 'relative'
            }}
            {...rest}
        />
    );
});

// --- Static Outer Element ---
const OuterElement = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>((props, ref) => {
    const ctx = useContext(LayoutContext);
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        props.onScroll && props.onScroll(e);
        if (ctx && ctx.rulerRef.current) {
            ctx.rulerRef.current.scrollLeft = e.currentTarget.scrollLeft;
        }
    };
    
    return (
        <div 
            {...props} 
            ref={ref} 
            onScroll={handleScroll} 
            style={{ ...props.style, overflowX: 'auto', overflowY: 'auto' }} 
        />
    );
});


const BLOCK_TAGS = ['P', 'DIV', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'TR', 'BLOCKQUOTE', 'UL', 'OL', 'TABLE'];

const isBlock = (el: HTMLElement) => {
    return BLOCK_TAGS.includes(el.tagName);
};

const getNodeTextLength = (node: Node): number => {
    if (node.nodeType === Node.TEXT_NODE) {
        return (node.nodeValue || "").length;
    }
    
    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break') || el.classList.contains('prodoc-section-break')) {
            return 1;
        }
        if (el.tagName === 'BR') {
            return 1;
        }
        
        let len = 0;
        const childNodes = node.childNodes;
        for (let i = 0; i < childNodes.length; i++) {
            len += getNodeTextLength(childNodes[i]);
        }
        
        if (isBlock(el)) len += 1;
        
        return len;
    }
    
    return 0;
};

const getGlobalCursorPosition = (): number | null => {
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return null;
    const range = sel.getRangeAt(0);
    
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

    for (let i = 1; i < pageIndex; i++) {
        const pEl = document.getElementById(`prodoc-editor-${i}`);
        if (pEl) {
            globalOffset += getNodeTextLength(pEl);
        }
    }

    globalOffset += getOffsetInNode(pageElement, range.startContainer, range.startOffset);

    return globalOffset;
};

const getOffsetInNode = (root: Node, target: Node, targetOffset: number): number => {
    let offset = 0;
    let found = false;

    const walk = (node: Node) => {
        if (found) return;

        if (node === target) {
            if (node.nodeType === Node.TEXT_NODE) {
                offset += targetOffset;
            } else {
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
             if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break') || el.tagName === 'BR' || el.classList.contains('prodoc-section-break')) {
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

const restoreGlobalCursor = (globalOffset: number) => {
    const pages = document.querySelectorAll('[id^="prodoc-editor-"]');
    const totalPages = pages.length;
    
    let currentTotal = 0;
    
    for (let i = 1; i <= totalPages; i++) {
        const el = document.getElementById(`prodoc-editor-${i}`);
        if (!el) continue;
        
        const pageLen = getNodeTextLength(el);
        
        if (globalOffset < currentTotal + pageLen) {
            const localOffset = Math.max(0, globalOffset - currentTotal);
            setCursorInNode(el, localOffset);
            return;
        }
        currentTotal += pageLen;
    }
    
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
            if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break') || el.tagName === 'BR' || el.classList.contains('prodoc-section-break')) {
                if (currentCount + 1 >= offset) {
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
                
                if (isBlock(el)) {
                    currentCount += 1;
                }
            }
        }
    };

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
            
            const rect = range.getBoundingClientRect();
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
        const range = document.createRange();
        range.selectNodeContents(root);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
    }
};

// --- Virtualized Row Component ---
const PageRow = React.memo(({ index, style, data }: ListChildComponentProps) => {
    const { 
        pages, 
        zoom, 
        showFormattingMarks, 
        handlePageUpdate, 
        handlePageFocus, 
        activeEditingArea, 
        setActiveEditingArea, 
        headerContent, 
        setHeaderContent, 
        footerContent, 
        setFooterContent 
    } = data;

    const pageData = pages[index];
    const pageContent = pageData.html;
    const pageConfig = pageData.config;

    return (
        <div style={style} className="w-full flex justify-center">
            <div className="pt-8">
                <div 
                    className="prodoc-page-wrapper box-border shrink-0 transition-all duration-300 relative group"
                    data-page-index={index}
                >
                    <EditorPage
                        pageNumber={index + 1}
                        totalPages={pages.length}
                        content={pageContent}
                        config={pageConfig}
                        zoom={zoom}
                        showFormattingMarks={showFormattingMarks}
                        onContentChange={handlePageUpdate}
                        onFocus={(e) => handlePageFocus(index, e)}
                        activeEditingArea={activeEditingArea}
                        setActiveEditingArea={setActiveEditingArea}
                        headerContent={headerContent}
                        setHeaderContent={setHeaderContent}
                        footerContent={footerContent}
                        setFooterContent={setFooterContent}
                    />
                </div>
            </div>
        </div>
    );
});

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
    currentPage,
    pageMovement,
    activeEditingArea,
    setActiveEditingArea,
    headerContent,
    setHeaderContent,
    footerContent,
    setFooterContent,
    editorRef,
    setZoom
  } = useEditor();
  
  const [pagesData, setPagesData] = useState<{ html: string, config: PageConfig }[]>(() => paginateContent(content, pageConfig).pages);
  const rulerContainerRef = useRef<HTMLDivElement>(null);
  // We use VariableSizeList to handle varying page sizes (like Legal or Landscape mix)
  const listRef = useRef<VariableSizeList>(null);
  
  const cursorRestorationRef = useRef<number | null>(null);

  // Refs for Pinch-to-Zoom
  const touchDistRef = useRef<number>(0);
  const startZoomRef = useRef<number>(0);

  useEffect(() => {
    let isMounted = true;
    
    const timer = setTimeout(() => {
        if (!isMounted) return;
        
        const currentCursor = getGlobalCursorPosition();
        const result = paginateContent(content, pageConfig);
        
        setPagesData(result.pages);
        setTotalPages(result.pages.length);
        
        // Reset cache if sizes changed
        if (listRef.current) {
            listRef.current.resetAfterIndex(0);
        }
        
        if (currentCursor !== null) {
            cursorRestorationRef.current = currentCursor;
        }
        
    }, 40);

    return () => { 
        isMounted = false; 
        clearTimeout(timer);
    };
  }, [content, pageConfig, setTotalPages]);

  useLayoutEffect(() => {
      if (cursorRestorationRef.current !== null) {
          restoreGlobalCursor(cursorRestorationRef.current);
          cursorRestorationRef.current = null;
      }
  }, [pagesData]);

  useEffect(() => {
      const activePageEl = document.getElementById(`prodoc-editor-${currentPage}`);
      if (activePageEl && editorRef) {
          (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = activePageEl as HTMLDivElement;
      }
  }, [currentPage, editorRef, pagesData]);

  // Recalculate item sizes when zoom changes
  useEffect(() => {
      if (listRef.current) {
          listRef.current.resetAfterIndex(0);
      }
  }, [zoom]);

  const handlePageUpdate = useCallback((newHtml: string, pageIndex: number) => {
    setPagesData(currentPages => {
        const updatedPages = [...currentPages];
        if (updatedPages[pageIndex].html !== newHtml) {
            updatedPages[pageIndex] = { ...updatedPages[pageIndex], html: newHtml };
            const fullContent = updatedPages.map(p => p.html).join('');
            setTimeout(() => setContent(fullContent), 0);
            return updatedPages;
        }
        return currentPages;
    });
  }, [setContent]);

  const handlePageFocus = useCallback((index: number, e: React.FocusEvent<HTMLDivElement>) => {
      setCurrentPage(index + 1);
      if (editorRef) {
          (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = e.currentTarget;
      }
  }, [setCurrentPage, editorRef]);

  const itemData = useMemo(() => ({
      pages: pagesData,
      zoom,
      showFormattingMarks,
      handlePageUpdate,
      handlePageFocus,
      activeEditingArea,
      setActiveEditingArea,
      headerContent,
      setHeaderContent,
      footerContent,
      setFooterContent
  }), [pagesData, zoom, showFormattingMarks, handlePageUpdate, handlePageFocus, activeEditingArea, setActiveEditingArea, headerContent, setHeaderContent, footerContent, setFooterContent]);

  // Dynamic Item Size Calculation
  const getItemSize = (index: number) => {
      const config = pagesData[index]?.config || pageConfig;
      let baseH = 0;
      
      if (config.size === 'Custom' && config.customHeight) {
          baseH = config.customHeight * 96;
      } else {
          const base = PAGE_SIZES[config.size as string] || PAGE_SIZES['Letter'];
          baseH = config.orientation === 'portrait' ? base.height : base.width;
      }
      
      const scaledHeight = baseH * (zoom / 100);
      const GAP_SIZE = 32;
      return scaledHeight + GAP_SIZE;
  };

  const handleItemsRendered = useCallback(({ visibleStartIndex }: { visibleStartIndex: number }) => {
      setCurrentPage(visibleStartIndex + 1);
  }, [setCurrentPage]);

  // Calculate max width for scrolling
  const contentWidth = useMemo(() => {
      let maxW = 0;
      pagesData.forEach(p => {
          const config = p.config;
          let baseW = 0;
          if (config.size === 'Custom' && config.customWidth) {
              baseW = config.customWidth * 96;
          } else {
              const base = PAGE_SIZES[config.size as string] || PAGE_SIZES['Letter'];
              baseW = config.orientation === 'portrait' ? base.width : base.height;
          }
          const scaledW = baseW * (zoom / 100);
          if (scaledW > maxW) maxW = scaledW;
      });
      return maxW + 64; 
  }, [pagesData, zoom, pageConfig]);

  const listWidth = Math.max(width, contentWidth);

  const handleOuterScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
      const scrollLeft = e.currentTarget.scrollLeft;
      if (rulerContainerRef.current) {
          rulerContainerRef.current.scrollLeft = scrollLeft;
      }
  }, []);

  // --- Pinch to Zoom Handlers ---
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
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

  const isVertical = pageMovement === 'vertical';

  // Get config for current page for ruler
  const activePageConfig = pagesData[currentPage - 1]?.config || pageConfig;

  // Use Context to pass data to static components
  const layoutContextValue = useMemo(() => ({
      listWidth,
      rulerRef: rulerContainerRef
  }), [listWidth]);

  return (
    <div 
      className="w-full h-full flex flex-col relative bg-[#f1f5f9] dark:bg-slate-950 transition-colors duration-300 touch-pan-x touch-pan-y"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
    >
       {showRuler && (
         <div 
            ref={rulerContainerRef}
            className="w-full overflow-hidden bg-[#f8fafc] border-b border-slate-200 z-20 shrink-0 sticky top-0 shadow-sm"
            style={{ height: '25px' }}
            onMouseDown={(e) => e.preventDefault()}
         >
             <div style={{ width: listWidth, minWidth: '100%', display: 'flex', justifyContent: 'center' }}>
                 <div style={{ transformOrigin: 'top left', display: 'inline-block' }}>
                    <Ruler pageConfig={activePageConfig} zoom={zoom} />
                 </div>
             </div>
         </div>
       )}

       {isVertical ? (
           <LayoutContext.Provider value={layoutContextValue}>
                <VariableSizeList
                        ref={listRef}
                        height={height - (showRuler ? 25 : 0)}
                        itemCount={pagesData.length}
                        itemSize={getItemSize}
                        width={width}
                        className="scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
                        itemData={itemData}
                        outerRef={containerRef}
                        onItemsRendered={handleItemsRendered}
                        outerElementType={OuterElement}
                        innerElementType={InnerElement}
                >
                    {PageRow}
                </VariableSizeList>
           </LayoutContext.Provider>
       ) : (
           <div 
              ref={containerRef}
              className="flex-1 relative overflow-auto scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
              onScroll={(e) => handleOuterScroll(e)}
              onDoubleClick={() => setActiveEditingArea('body')}
           >
               <div 
                    className="min-w-full min-h-full w-fit flex flex-row flex-wrap justify-center content-start py-8 gap-8"
                    onClick={(e) => {
                        if (e.target === e.currentTarget && activeEditingArea !== 'body') {
                            setActiveEditingArea('body');
                        }
                    }}
               >
                    {pagesData.map((pageData, index) => (
                        <div 
                            key={index} 
                            className="prodoc-page-wrapper box-border shrink-0 transition-all duration-300 relative group"
                            data-page-index={index}
                        >
                            <EditorPage
                                pageNumber={index + 1}
                                totalPages={pagesData.length}
                                content={pageData.html}
                                config={pageData.config}
                                zoom={zoom}
                                showFormattingMarks={showFormattingMarks}
                                onContentChange={handlePageUpdate}
                                onFocus={(e) => handlePageFocus(index, e)}
                                activeEditingArea={activeEditingArea}
                                setActiveEditingArea={setActiveEditingArea}
                                headerContent={headerContent}
                                setHeaderContent={setHeaderContent}
                                footerContent={footerContent}
                                setFooterContent={setFooterContent}
                            />
                        </div>
                    ))}
               </div>
           </div>
       )}
    </div>
  );
});
