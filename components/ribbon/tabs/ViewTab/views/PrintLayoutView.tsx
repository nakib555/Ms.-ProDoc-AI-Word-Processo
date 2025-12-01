
import React, { useState, useRef, useEffect, useCallback, useLayoutEffect, useMemo } from 'react';
import { FileText } from 'lucide-react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
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

// --- Robust Global Cursor Tracking Helpers ---

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
        if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break')) {
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
            if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break') || el.tagName === 'BR') {
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
        config, 
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

    const pageContent = pages[index];

    return (
        <div style={style} className="w-full flex justify-center">
            {/* Added padding wrapper to handle the gap logic visually */}
            <div className="pt-8">
                <div 
                    className="prodoc-page-wrapper box-border shrink-0 transition-all duration-300 relative group"
                    data-page-index={index}
                >
                    <EditorPage
                        pageNumber={index + 1}
                        totalPages={pages.length}
                        content={pageContent}
                        config={config}
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
                    {/* Visual separation logic mostly handled by gap/padding now, but keeping for consistency if needed */}
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
    editorRef
  } = useEditor();
  
  const [pages, setPages] = useState<string[]>(() => paginateContent(content, pageConfig).pages);
  const rulerContainerRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<List>(null);
  
  const cursorRestorationRef = useRef<number | null>(null);

  // Pagination Effect
  useEffect(() => {
    let isMounted = true;
    
    const timer = setTimeout(() => {
        if (!isMounted) return;
        
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
  }, [pages]);

  useEffect(() => {
      const activePageEl = document.getElementById(`prodoc-editor-${currentPage}`);
      if (activePageEl && editorRef) {
          (editorRef as React.MutableRefObject<HTMLDivElement | null>).current = activePageEl as HTMLDivElement;
      }
  }, [currentPage, editorRef, pages]);

  const handlePageUpdate = useCallback((newHtml: string, pageIndex: number) => {
    setPages(currentPages => {
        const updatedPages = [...currentPages];
        if (updatedPages[pageIndex] !== newHtml) {
            updatedPages[pageIndex] = newHtml;
            const fullContent = updatedPages.join('');
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

  // Virtualization Items Props
  const itemData = useMemo(() => ({
      pages,
      config: pageConfig,
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
  }), [pages, pageConfig, zoom, showFormattingMarks, handlePageUpdate, handlePageFocus, activeEditingArea, setActiveEditingArea, headerContent, setHeaderContent, footerContent, setFooterContent]);

  // Calculate Page Size for Virtualization
  const itemSize = useMemo(() => {
      let baseH = 0;
      if (pageConfig.size === 'Custom' && pageConfig.customHeight) {
          baseH = pageConfig.customHeight * 96;
      } else {
          const base = PAGE_SIZES[pageConfig.size as string] || PAGE_SIZES['Letter'];
          baseH = pageConfig.orientation === 'portrait' ? base.height : base.width;
      }
      
      const scaledHeight = baseH * (zoom / 100);
      const GAP_SIZE = 32; // py-8 equivalent
      return scaledHeight + GAP_SIZE;
  }, [pageConfig.size, pageConfig.orientation, pageConfig.customHeight, zoom]);

  const handleItemsRendered = useCallback(({ visibleStartIndex }: { visibleStartIndex: number }) => {
      setCurrentPage(visibleStartIndex + 1);
  }, [setCurrentPage]);

  // Handle Scroll Sync for Ruler
  const onScroll = useCallback(({ scrollOffset }: { scrollOffset: number, scrollUpdateWasRequested: boolean }) => {
      // Typically vertical scroll doesn't affect horizontal ruler scroll, 
      // but if we had horizontal scrolling on the outer container, we'd need to sync.
      // FixedSizeList handles vertical scrolling. 
      // If the content is wider than viewport, FixedSizeList allows horizontal overflow via `style={{ overflow: 'auto' }}` on outer element?
      // react-window list usually handles one direction.
      // For print layout, horizontal scroll is usually needed.
      // FixedSizeList creates a container of `width`. If page is wider, we need `width` to match content or `overflow: auto`.
      // We set List `width={width}` which is the AutoSizer width (viewport width).
      // The Row inner content centers the page. If page > viewport, centering might clip or require scroll.
      // To support horizontal scroll with react-window, we typically rely on the inner elements being wide,
      // but react-window clips overflow. 
      // Ideally, `width` passed to List should be `Math.max(viewportWidth, pageScaledWidth + padding)`.
      // But AutoSizer gives viewport width.
  }, []);

  // Compute actual content width for horizontal scrolling support
  const contentWidth = useMemo(() => {
      let baseW = 0;
      if (pageConfig.size === 'Custom' && pageConfig.customWidth) {
          baseW = pageConfig.customWidth * 96;
      } else {
          const base = PAGE_SIZES[pageConfig.size as string] || PAGE_SIZES['Letter'];
          baseW = pageConfig.orientation === 'portrait' ? base.width : base.height;
      }
      return baseW * (zoom / 100) + 64; // + padding
  }, [pageConfig, zoom]);

  const listWidth = Math.max(width, contentWidth);

  // Sync horizontal scroll for ruler
  const handleOuterScroll = useCallback((e: React.UIEvent<HTMLElement>) => {
      const scrollLeft = e.currentTarget.scrollLeft;
      if (rulerContainerRef.current) {
          rulerContainerRef.current.scrollLeft = scrollLeft;
      }
  }, []);

  const isVertical = pageMovement === 'vertical';

  return (
    <div className="w-full h-full flex flex-col relative bg-[#E3E5E8] dark:bg-slate-900 transition-colors duration-300">
       {showRuler && (
         <div 
            ref={rulerContainerRef}
            className="w-full overflow-hidden bg-[#F0F0F0] border-b border-slate-300 z-20 shrink-0 flex justify-center sticky top-0 shadow-sm"
            style={{ height: '25px' }}
            onMouseDown={(e) => e.preventDefault()}
         >
             <div style={{ transformOrigin: 'top left', display: 'inline-block' }}>
                <Ruler pageConfig={pageConfig} zoom={zoom} />
             </div>
         </div>
       )}

       {isVertical ? (
           <List
                ref={listRef}
                height={height - (showRuler ? 25 : 0)}
                itemCount={pages.length}
                itemSize={itemSize}
                width={width}
                className="scrollbar-thin scrollbar-thumb-slate-400 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
                itemData={itemData}
                outerRef={containerRef}
                onItemsRendered={handleItemsRendered}
                outerElementType={React.forwardRef((props, ref: any) => (
                    <div {...props} ref={ref} onScroll={(e) => {
                        props.onScroll && props.onScroll(e);
                        handleOuterScroll(e);
                    }} style={{ ...props.style, overflowX: 'auto', overflowY: 'auto' }} />
                ))}
                innerElementType={React.forwardRef(({ style, ...rest }: any, ref: any) => (
                    <div
                        ref={ref}
                        style={{
                            ...style,
                            width: listWidth, // Force inner width to allow horizontal scroll
                            position: 'relative'
                        }}
                        {...rest}
                    />
                ))}
           >
               {PageRow}
           </List>
       ) : (
           /* Fallback for Side-to-Side (non-virtualized for grid complexity) */
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
                    {pages.map((pageContent, index) => (
                        <div 
                            key={index} 
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
                    ))}
               </div>
           </div>
       )}
    </div>
  );
});
