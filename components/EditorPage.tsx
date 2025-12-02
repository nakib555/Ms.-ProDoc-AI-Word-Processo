
import React, { useRef, useLayoutEffect, useEffect } from 'react';
import { PageConfig, EditingArea } from '../types';
import { PAGE_SIZES } from '../constants';
import { useMathLive } from '../hooks/useMathLive';
import { useEditor } from '../contexts/EditorContext';

interface EditorPageProps {
  content: string;
  pageNumber: number;
  totalPages: number;
  config: PageConfig;
  zoom: number;
  readOnly?: boolean;
  onContentChange?: (html: string, pageIndex: number) => void;
  onFocus?: (e: React.FocusEvent<HTMLDivElement>) => void;
  showFormattingMarks: boolean;
  
  // Header/Footer Props
  activeEditingArea?: EditingArea;
  setActiveEditingArea?: (area: EditingArea) => void;
  headerContent?: string;
  setHeaderContent?: (html: string) => void;
  footerContent?: string;
  setFooterContent?: (html: string) => void;
}

// Helper to calculate text length consistent with cursor logic
const getTextLength = (node: Node): number => {
    if (node.nodeType === Node.TEXT_NODE) return (node.nodeValue || "").length;
    if (node.nodeType === Node.ELEMENT_NODE) {
        const el = node as HTMLElement;
        if (el.tagName === 'MATH-FIELD' || el.classList.contains('prodoc-page-break') || el.tagName === 'BR') return 1;
    }
    let len = 0;
    node.childNodes.forEach(c => len += getTextLength(c));
    return len;
};

const EditorPageComponent: React.FC<EditorPageProps> = ({
  content,
  pageNumber,
  totalPages,
  config,
  zoom,
  readOnly,
  onContentChange,
  onFocus,
  showFormattingMarks,
  activeEditingArea = 'body',
  setActiveEditingArea,
  headerContent = '',
  setHeaderContent,
  footerContent = '',
  setFooterContent
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const scale = zoom / 100;
  const { isKeyboardLocked, selectionMode } = useEditor();

  const isHeaderFooterMode = activeEditingArea === 'header' || activeEditingArea === 'footer';
  const MIN_BODY_GAP = 192; // 2 inches minimum body gap @ 96 DPI

  // Initialize MathLive handling for any equations on this page
  useMathLive(content, editorRef);

  // --- Cursor Management Helpers ---
  const getCaretCharacterOffsetWithin = (element: HTMLElement) => {
    let caretOffset = 0;
    const doc = element.ownerDocument || document;
    const win = doc.defaultView || window;
    const sel = win.getSelection();
    if (sel && sel.rangeCount > 0) {
      try {
        const range = sel.getRangeAt(0);
        if (element.contains(range.startContainer)) {
            const preCaretRange = range.cloneRange();
            preCaretRange.selectNodeContents(element);
            preCaretRange.setEnd(range.endContainer, range.endOffset);
            caretOffset = preCaretRange.toString().length;
        }
      } catch (e) {
        // Fallback or ignore if selection is invalid for this element
      }
    }
    return caretOffset;
  };

  const setCaretPosition = (element: HTMLElement, offset: number): boolean => {
      let charIndex = 0;
      const range = document.createRange();
      range.setStart(element, 0);
      range.collapse(true);
      
      const nodeStack: Node[] = [element];
      let node: Node | undefined;
      let found = false;

      while (!found && (node = nodeStack.pop())) {
          if (node.nodeType === 3) {
              const nextCharIndex = charIndex + (node.nodeValue || "").length;
              if (offset >= charIndex && offset <= nextCharIndex) {
                  range.setStart(node, offset - charIndex);
                  range.collapse(true);
                  found = true;
              }
              charIndex = nextCharIndex;
          } else {
              let i = node.childNodes.length;
              while (i--) {
                  nodeStack.push(node.childNodes[i]);
              }
          }
      }

      if (found) {
          const sel = window.getSelection();
          if (sel) {
              sel.removeAllRanges();
              sel.addRange(range);
          }
      }
      return found;
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

      // Only update if significantly different to avoid cursor jumps
      if (editorRef.current.innerHTML !== content) {
        // Check if focused to save cursor
        const isFocused = document.activeElement === editorRef.current || editorRef.current.contains(document.activeElement);
        let savedOffset = 0;
        
        if (isFocused) {
            savedOffset = getCaretCharacterOffsetWithin(editorRef.current);
        }

        editorRef.current.innerHTML = content;

        if (isFocused) {
            // Check if the saved offset is within bounds of the NEW content
            // If content moved to next page, this page's content is shorter.
            const newContentLength = getTextLength(editorRef.current);
            
            if (savedOffset <= newContentLength) {
                editorRef.current.focus();
                try {
                    setCaretPosition(editorRef.current, savedOffset);
                } catch (e) {
                    // Ignore cursor errors
                }
            }
        }
      }
    }
  }, [content, pageNumber, totalPages]);

  // Sync Header Content across pages
  useEffect(() => {
      if (headerRef.current) {
          const isFocused = document.activeElement === headerRef.current;
          if (!isFocused && headerRef.current.innerHTML !== headerContent) {
              headerRef.current.innerHTML = headerContent;
          }
      }
  }, [headerContent]);

  // Sync Footer Content across pages
  useEffect(() => {
      if (footerRef.current) {
          // Replace placeholder page number for display
          const displayHtml = footerContent.replace(/\[Page \d+\]/g, `[Page ${pageNumber}]`)
                                           .replace(/<span class="page-number-placeholder">\d+<\/span>/g, `<span class="page-number-placeholder">${pageNumber}</span>`);
          
          const isFocused = document.activeElement === footerRef.current;
          if (!isFocused && footerRef.current.innerHTML !== displayHtml) {
              footerRef.current.innerHTML = displayHtml;
          }
      }
  }, [footerContent, pageNumber]);

  useEffect(() => {
    if (!editorRef.current || readOnly || !onContentChange) return;

    // Use MutationObserver for robust change detection (e.g. from command execution)
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

  const handleHeaderInput = (e: React.FormEvent<HTMLDivElement>) => {
      if (setHeaderContent) setHeaderContent(e.currentTarget.innerHTML);
  };

  const handleFooterInput = (e: React.FormEvent<HTMLDivElement>) => {
      if (setFooterContent) setFooterContent(e.currentTarget.innerHTML);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;

    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !editorRef.current) return;
    const range = selection.getRangeAt(0);

    if (e.key === 'ArrowDown') {
        const editorRect = editorRef.current.getBoundingClientRect();
        const rangeRect = range.getBoundingClientRect();
        
        // Check if we are visually at the bottom area (within 40px of bottom)
        const cursorBottom = rangeRect.bottom !== 0 ? rangeRect.bottom : editorRect.bottom;

        if (editorRect.bottom - cursorBottom < 40) {
            if (pageNumber < totalPages) {
                e.preventDefault();
                const nextPage = document.getElementById(`prodoc-editor-${pageNumber + 1}`);
                if (nextPage) {
                    nextPage.focus();
                    const r = document.createRange();
                    r.selectNodeContents(nextPage);
                    r.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(r);
                    nextPage.scrollIntoView({ behavior: 'smooth', block: 'start' });
                }
            }
        }
    }
    
    if (e.key === 'ArrowUp') {
        const editorRect = editorRef.current.getBoundingClientRect();
        const rangeRect = range.getBoundingClientRect();
        const cursorTop = rangeRect.top !== 0 ? rangeRect.top : editorRect.top;
        
        // Check if we are visually at the top line
        if (cursorTop - editorRect.top < 40) {
            if (pageNumber > 1) {
                e.preventDefault();
                const prevPage = document.getElementById(`prodoc-editor-${pageNumber - 1}`);
                if (prevPage) {
                    prevPage.focus();
                    const r = document.createRange();
                    r.selectNodeContents(prevPage);
                    r.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(r);
                }
            }
        }
    }

    if (e.key === 'ArrowRight') {
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        
        if (preCaretRange.toString().length === editorRef.current.innerText.length) {
             if (pageNumber < totalPages) {
                e.preventDefault();
                const nextPage = document.getElementById(`prodoc-editor-${pageNumber + 1}`);
                if (nextPage) {
                    nextPage.focus();
                    const r = document.createRange();
                    r.selectNodeContents(nextPage);
                    r.collapse(true);
                    selection.removeAllRanges();
                    selection.addRange(r);
                    nextPage.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
             }
        }
    }

    if (e.key === 'ArrowLeft') {
        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(editorRef.current);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        
        if (preCaretRange.toString().length === 0) {
             if (pageNumber > 1) {
                e.preventDefault();
                const prevPage = document.getElementById(`prodoc-editor-${pageNumber - 1}`);
                if (prevPage) {
                    prevPage.focus();
                    const r = document.createRange();
                    r.selectNodeContents(prevPage);
                    r.collapse(false);
                    selection.removeAllRanges();
                    selection.addRange(r);
                }
             }
        }
    }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
      // Smart Select Mode Logic
      if (selectionMode && editorRef.current) {
          e.preventDefault();
          e.stopPropagation();
          
          const target = e.target as Node;
          
          // Helper to find the closest block-level parent within the editor
          const findBlockParent = (node: Node): Node | null => {
              let curr: Node | null = node;
              while (curr && curr !== editorRef.current) {
                  if (curr.nodeType === Node.ELEMENT_NODE) {
                      const el = curr as HTMLElement;
                      // Common block elements in rich text
                      if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'DIV', 'TR', 'BLOCKQUOTE'].includes(el.tagName)) {
                          return el;
                      }
                  }
                  curr = curr.parentNode;
              }
              return null; // Fallback if direct text node in root or similar
          };

          const block = findBlockParent(target);
          if (block) {
              const range = document.createRange();
              range.selectNodeContents(block);
              const sel = window.getSelection();
              if (sel) {
                  sel.removeAllRanges();
                  sel.addRange(range);
              }
          }
      }
  };

  const handlePageClick = (e: React.MouseEvent) => {
      // Do not process page margin clicks if selection mode is on, let handleEditorClick capture inside
      if (selectionMode) return;

      // Improve margin clicking experience
      if (editorRef.current && !editorRef.current.contains(e.target as Node) && !isHeaderFooterMode) {
          editorRef.current.focus();
          
          const editorRect = editorRef.current.getBoundingClientRect();
          const clickY = e.clientY;
          
          // Clicked below content
          if (clickY > editorRect.bottom) {
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(false);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
          } 
          // Clicked above content
          else if (clickY < editorRect.top) {
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(true);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
          }
          // Clicked side margins - try to find nearest line
          else {
              let range: Range | null = null;
              // @ts-ignore
              if (document.caretPositionFromPoint) {
                  // Firefox
                  // @ts-ignore
                  const pos = document.caretPositionFromPoint(e.clientX, e.clientY);
                  if (pos) {
                      range = document.createRange();
                      range.setStart(pos.offsetNode, pos.offset);
                      range.collapse(true);
                  }
              } else if (document.caretRangeFromPoint) {
                  // WebKit / Standard
                  range = document.caretRangeFromPoint(e.clientX, e.clientY);
              }
              
              if (range && editorRef.current.contains(range.startContainer)) {
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
              }
          }
      }
  };

  const getMargins = () => {
    const m = config.margins;
    let top = Math.max(m.top, config.headerDistance || 0) * 96;
    let bottom = Math.max(m.bottom, config.footerDistance || 0) * 96;
    let left = m.left * 96;
    let right = m.right * 96;
    const gutterPx = (m.gutter || 0) * 96;
    
    const isMirroredOrBookFold = ['mirrorMargins', 'bookFold'].includes(config.multiplePages || '');
    if (isMirroredOrBookFold) {
       const inside = m.left * 96;
       const outside = m.right * 96;
       const isOdd = pageNumber % 2 !== 0; 
       if (isOdd) {
           left = inside + (config.gutterPosition === 'left' ? gutterPx : 0);
           right = outside;
       } else {
           left = outside;
           right = inside + (config.gutterPosition === 'left' ? gutterPx : 0);
       }
    } else {
        if (config.gutterPosition === 'top') {
            top += gutterPx;
        } else {
            left += gutterPx;
        }
    }
    return { top, right, bottom, left, gutterPx };
  };

  const getBackgroundStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
          backgroundColor: config.pageColor || '#ffffff',
      };
      if (config.background === 'ruled') {
          return {
              ...base,
              backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px)',
              backgroundSize: '100% 2rem'
          };
      } else if (config.background === 'grid') {
          return {
              ...base,
              backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '20px 20px'
          };
      }
      return base;
  };

  let width, height;
  if (config.size === 'Custom' && config.customWidth && config.customHeight) {
      width = config.customWidth * 96;
      height = config.customHeight * 96;
  } else {
      const base = PAGE_SIZES[config.size as keyof typeof PAGE_SIZES] || PAGE_SIZES['Letter'];
      width = config.orientation === 'portrait' ? base.width : base.height;
      height = config.orientation === 'portrait' ? base.height : base.width;
  }

  const margins = getMargins();
  const gutterTop = config.gutterPosition === 'top' && !['mirrorMargins', 'bookFold'].includes(config.multiplePages || '') ? margins.gutterPx : 0;

  const getVerticalAlignStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = {
          display: 'flex',
          flexDirection: 'column'
      };
      let justifyContent: 'center' | 'flex-end' | 'space-between' | 'flex-start' = 'flex-start';
      if (config.verticalAlign === 'center') justifyContent = 'center';
      else if (config.verticalAlign === 'bottom') justifyContent = 'flex-end';
      else if (config.verticalAlign === 'justify') justifyContent = 'space-between';
      return { ...style, justifyContent };
  };

  const onHeaderDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Ensure we don't enter header mode if keyboard/editing is locked
      if (setActiveEditingArea && !isKeyboardLocked && !selectionMode) {
          setActiveEditingArea('header');
          setTimeout(() => {
              if (headerRef.current) {
                  headerRef.current.focus();
                  // Ensure cursor is at start (left)
                  const range = document.createRange();
                  const firstChild = headerRef.current.firstChild;
                  if (firstChild) {
                      range.setStart(firstChild, 0);
                  } else {
                      range.setStart(headerRef.current, 0);
                  }
                  range.collapse(true);
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
              }
          }, 10);
      }
  };

  const onFooterDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      // Ensure we don't enter footer mode if keyboard/editing is locked
      if (setActiveEditingArea && !isKeyboardLocked && !selectionMode) {
          setActiveEditingArea('footer');
          setTimeout(() => {
              if (footerRef.current) {
                  footerRef.current.focus();
                  const range = document.createRange();
                  const firstChild = footerRef.current.firstChild;
                  if (firstChild) {
                      range.setStart(firstChild, 0);
                  } else {
                      range.setStart(footerRef.current, 0);
                  }
                  range.collapse(true);
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
              }
          }, 10);
      }
  };

  const onBodyDoubleClick = (e: React.MouseEvent) => {
      if (activeEditingArea !== 'body' && setActiveEditingArea && !isKeyboardLocked && !selectionMode) {
          e.stopPropagation();
          setActiveEditingArea('body');
          setTimeout(() => {
              if (editorRef.current) {
                  editorRef.current.focus();
              }
          }, 10);
      }
  };

  const visualHeaderDist = (config.headerDistance || 0.5) * 96;
  const visualFooterDist = (config.footerDistance || 0.5) * 96;
  const safeMaxHeaderHeight = (height - MIN_BODY_GAP) / 2;
  const safeMaxFooterHeight = (height - MIN_BODY_GAP) / 2;

  const bodyWidth = width - margins.left - margins.right;
  const bodyHeight = height - margins.top - margins.bottom - gutterTop;

  // Determine effective contentEditable state
  // Even if keyboard is locked, selection should be possible, so contentEditable must be "true" for robust native selection in some browsers
  // but we intercept input events. However, making it false + user-select: text is safer for "ReadOnly" mode.
  // BUT Smart Select needs to work. If contentEditable is false, range selection works fine.
  
  const isBodyEditable = !readOnly && !isHeaderFooterMode && !isKeyboardLocked;
  const isHeaderFooterEditable = isHeaderFooterMode && !isKeyboardLocked;

  // Cursor style logic
  let cursorStyle = 'cursor-text';
  if (selectionMode) cursorStyle = 'cursor-pointer'; // or cursor-cell / cursor-context-menu
  else if (isKeyboardLocked) cursorStyle = 'cursor-default';

  return (
    <div 
        className="relative group transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] mx-auto origin-top"
        style={{
            width: `${width * scale}px`,
            height: `${height * scale}px`,
        }}
    >
        <div 
            className={`absolute inset-0 bg-white overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${cursorStyle}`}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${width}px`,
                height: `${height}px`,
                boxShadow: '0 0 0 1px #d1d5db, 0 10px 20px -5px rgba(0,0,0,0.15)',
                ...getBackgroundStyle()
            }}
            onMouseDown={handlePageClick}
        >
            {/* Header Area */}
            <div 
                className={`absolute left-0 right-0 z-30 ${isHeaderFooterMode ? 'z-50' : ''}`}
                style={{ 
                    top: 0, 
                    minHeight: `${margins.top}px`, 
                    maxHeight: `${safeMaxHeaderHeight}px`,
                    paddingTop: `${visualHeaderDist}px`, 
                    paddingLeft: `${margins.left}px`,
                    paddingRight: `${margins.right}px`,
                }}
                onDoubleClick={onHeaderDoubleClick}
                onMouseDown={(e) => e.stopPropagation()} 
            >
                <div className={`w-full h-full relative ${isHeaderFooterMode ? 'border-b-2 border-dashed border-blue-500' : 'hover:bg-slate-50/50'}`}>
                    {isHeaderFooterMode && (
                        <div className="header-footer-label" style={{ left: 0, bottom: -2, transform: 'translateY(100%)' }}>Header</div>
                    )}
                    <div 
                        ref={headerRef}
                        className={`prodoc-header w-full min-h-full outline-none ${isHeaderFooterEditable ? 'cursor-text pointer-events-auto' : 'cursor-default pointer-events-none'}`}
                        contentEditable={isHeaderFooterEditable}
                        suppressContentEditableWarning
                        onInput={handleHeaderInput}
                        onFocus={() => setActiveEditingArea && setActiveEditingArea('header')}
                        style={{ minHeight: '1em' }}
                    />
                </div>
            </div>

            {/* Watermark */}
            {config.watermark && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                     <div className="transform -rotate-45 text-slate-300/40 font-bold text-[8rem] whitespace-nowrap select-none" style={{ color: 'rgba(0,0,0,0.08)' }}>
                        {config.watermark}
                     </div>
                 </div>
            )}

            {/* Body Container (Writable Area) - Strict Absolute Positioning */}
            <div 
                className={`absolute overflow-hidden transition-opacity duration-300 ${isHeaderFooterMode ? 'opacity-50' : 'opacity-100'}`}
                style={{ 
                    top: `${margins.top + gutterTop}px`,
                    left: `${margins.left}px`,
                    width: `${bodyWidth}px`,
                    height: `${bodyHeight}px`,
                    ...getVerticalAlignStyle()
                }}
                onDoubleClick={onBodyDoubleClick}
                onMouseDown={(e) => e.stopPropagation()} 
            >
                <div
                    id={`prodoc-editor-${pageNumber}`}
                    ref={editorRef}
                    className={`prodoc-editor w-full outline-none text-lg leading-loose break-words z-10 ${showFormattingMarks ? 'show-formatting-marks' : ''} ${isHeaderFooterMode ? 'pointer-events-none select-none' : ''}`}
                    contentEditable={isBodyEditable}
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={onFocus}
                    onClick={handleEditorClick}
                    suppressContentEditableWarning={true}
                    style={{
                        fontFamily: 'Calibri, Inter, sans-serif',
                        color: '#000000',
                        flex: config.verticalAlign === 'justify' ? '1 1 auto' : undefined,
                        minHeight: '100%' 
                    }}
                />
            </div>

            {/* Footer Area */}
            <div 
                className={`absolute left-0 right-0 z-30 ${isHeaderFooterMode ? 'z-50' : ''}`}
                style={{
                    bottom: 0,
                    minHeight: `${margins.bottom}px`, 
                    maxHeight: `${safeMaxFooterHeight}px`,
                    paddingBottom: `${visualFooterDist}px`, 
                    paddingLeft: `${margins.left}px`,
                    paddingRight: `${margins.right}px`,
                }}
                onDoubleClick={onFooterDoubleClick}
                onMouseDown={(e) => e.stopPropagation()} 
            >
                 <div className={`w-full h-full relative flex flex-col justify-end ${isHeaderFooterMode ? 'border-t-2 border-dashed border-blue-500' : 'hover:bg-slate-50/50'}`}>
                    {isHeaderFooterMode && (
                        <div className="header-footer-label footer-tag" style={{ left: 0, top: -2, transform: 'translateY(-100%)' }}>Footer</div>
                    )}
                    <div 
                        ref={footerRef}
                        className={`prodoc-footer w-full min-h-full outline-none ${isHeaderFooterEditable ? 'cursor-text pointer-events-auto' : 'cursor-default pointer-events-none'}`}
                        contentEditable={isHeaderFooterEditable}
                        suppressContentEditableWarning
                        onInput={handleFooterInput}
                        onFocus={() => setActiveEditingArea && setActiveEditingArea('footer')}
                        style={{ minHeight: '1em' }}
                    />
                 </div>
            </div>
        </div>
    </div>
  );
};

const arePropsEqual = (prev: EditorPageProps, next: EditorPageProps) => {
    return (
        prev.content === next.content &&
        prev.pageNumber === next.pageNumber &&
        prev.totalPages === next.totalPages &&
        prev.zoom === next.zoom &&
        prev.readOnly === next.readOnly &&
        prev.showFormattingMarks === next.showFormattingMarks &&
        prev.activeEditingArea === next.activeEditingArea &&
        prev.headerContent === next.headerContent &&
        prev.footerContent === next.footerContent &&
        prev.config.size === next.config.size &&
        prev.config.orientation === next.config.orientation &&
        prev.config.margins.top === next.config.margins.top &&
        prev.config.margins.bottom === next.config.margins.bottom &&
        prev.config.margins.left === next.config.margins.left &&
        prev.config.margins.right === next.config.margins.right &&
        prev.config.headerDistance === next.config.headerDistance &&
        prev.config.footerDistance === next.config.footerDistance &&
        prev.config.pageColor === next.config.pageColor &&
        prev.config.watermark === next.config.watermark &&
        prev.config.background === next.config.background
    );
};

export const EditorPage = React.memo(EditorPageComponent, arePropsEqual);
