
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

  // Smart Selection Refs
  const wordPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const superLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
  const smartSelectionTriggeredRef = useRef(false);

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
    
    // Prevent typing if locked (for physical keyboards)
    if (isKeyboardLocked && !selectionMode) {
        // Allow navigation keys
        if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key) && !(e.ctrlKey || e.metaKey)) {
             e.preventDefault();
             return;
        }
    }

    // Explicit Undo/Redo Handling to prevent conflicts and ensure support
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

  // --- SMART SELECTION LOGIC ---

  const selectWord = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0 && sel.modify) {
          // Use 'modify' which handles word boundaries nicely across most browsers
          // Move backward to start of word, then extend forward to end of word
          sel.modify('move', 'backward', 'word');
          sel.modify('extend', 'forward', 'word');
      }
  };

  const selectSentence = () => {
      const sel = window.getSelection();
      if (!sel || sel.rangeCount === 0 || !sel.modify) return;
      
      try {
          sel.modify('move', 'backward', 'sentence');
          sel.modify('extend', 'forward', 'sentence');
      } catch (e) {
          sel.modify('move', 'backward', 'line');
          sel.modify('extend', 'forward', 'line');
      }
  };

  const selectParagraph = (target: EventTarget | null) => {
      const sel = window.getSelection();
      if (!sel) return;
      
      // Try to find the block element (P, H1, DIV, etc.)
      let node = target as Node | null;
      
      if (node && node.nodeType === Node.TEXT_NODE) {
          node = node.parentNode;
      }

      while (node && node !== editorRef.current && (node as HTMLElement).tagName) {
          const el = node as HTMLElement;
          const display = window.getComputedStyle(el).display;
          if (display === 'block' || display === 'flex' || ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'DIV', 'BLOCKQUOTE'].includes(el.tagName)) {
              const range = document.createRange();
              range.selectNodeContents(el);
              sel.removeAllRanges();
              sel.addRange(range);
              return;
          }
          node = node.parentNode;
      }
      
      if (sel.modify) {
          sel.modify('move', 'backward', 'paragraph');
          sel.modify('extend', 'forward', 'paragraph');
      }
  };

  const selectPage = () => {
      if (!editorRef.current) return;
      const range = document.createRange();
      range.selectNodeContents(editorRef.current);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
  };

  const handleSmartPointerDown = (e: React.PointerEvent) => {
      if (!selectionMode) return;
      
      // Reset trigger flag on new touch
      smartSelectionTriggeredRef.current = false;
      
      // Force cursor placement at touch point to ensure selection starts correctly
      if (!isHeaderFooterMode) {
          if (document.caretRangeFromPoint) {
              const range = document.caretRangeFromPoint(e.clientX, e.clientY);
              if (range && editorRef.current?.contains(range.startContainer)) {
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
              }
          } else if ((document as any).caretPositionFromPoint) {
              const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
              if (pos && editorRef.current?.contains(pos.offsetNode)) {
                  const range = document.createRange();
                  range.setStart(pos.offsetNode, pos.offset);
                  range.collapse(true);
                  const sel = window.getSelection();
                  sel?.removeAllRanges();
                  sel?.addRange(range);
              }
          }
      }
      
      pointerStartRef.current = {
          x: e.clientX,
          y: e.clientY,
          time: Date.now()
      };

      // Clear existing timers
      if (wordPressTimerRef.current) clearTimeout(wordPressTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (superLongPressTimerRef.current) clearTimeout(superLongPressTimerRef.current);

      const target = e.target;

      // 1s Timer: Select Word
      wordPressTimerRef.current = setTimeout(() => {
          selectWord();
          smartSelectionTriggeredRef.current = true;
          if (navigator.vibrate) navigator.vibrate(20);
      }, 1000);

      // 2s Timer: Select Paragraph
      longPressTimerRef.current = setTimeout(() => {
          selectParagraph(target);
          smartSelectionTriggeredRef.current = true;
          if (navigator.vibrate) navigator.vibrate(50);
      }, 2000);

      // 3s Timer: Select Page
      superLongPressTimerRef.current = setTimeout(() => {
          selectPage();
          smartSelectionTriggeredRef.current = true;
          if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
      }, 3000);
  };

  const handleSmartPointerMove = (e: React.PointerEvent) => {
      if (!selectionMode || !pointerStartRef.current) return;

      const dist = Math.hypot(e.clientX - pointerStartRef.current.x, e.clientY - pointerStartRef.current.y);
      
      // If moved more than 10px, assume scrolling and cancel timers
      if (dist > 10) {
          if (wordPressTimerRef.current) clearTimeout(wordPressTimerRef.current);
          if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
          if (superLongPressTimerRef.current) clearTimeout(superLongPressTimerRef.current);
          pointerStartRef.current = null;
      }
  };

  const handleSmartPointerUp = (e: React.PointerEvent) => {
      if (!selectionMode) return;

      if (wordPressTimerRef.current) clearTimeout(wordPressTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (superLongPressTimerRef.current) clearTimeout(superLongPressTimerRef.current);
      pointerStartRef.current = null;
  };

  const handleSmartClick = (e: React.MouseEvent) => {
      if (!selectionMode) return;
      
      // If a smart selection (timer based) occurred, stop the click from resetting it
      if (smartSelectionTriggeredRef.current) {
          e.preventDefault();
          e.stopPropagation();
          return;
      }

      if (e.detail === 2) {
          // Double Click: Select Sentence
          selectSentence();
          // Prevent native double-click word selection
          e.preventDefault();
          e.stopPropagation();
      }
  };

  const handleEditorClick = (e: React.MouseEvent) => {
      if (selectionMode) {
          handleSmartClick(e);
      }
  };

  const handlePageClick = (e: React.MouseEvent) => {
      if (selectionMode) return;

      if (editorRef.current && !editorRef.current.contains(e.target as Node) && !isHeaderFooterMode) {
          editorRef.current.focus();
          
          const editorRect = editorRef.current.getBoundingClientRect();
          const clickY = e.clientY;
          
          if (clickY > editorRect.bottom) {
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(false);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
          } 
          else if (clickY < editorRect.top) {
              const range = document.createRange();
              range.selectNodeContents(editorRef.current);
              range.collapse(true);
              const sel = window.getSelection();
              sel?.removeAllRanges();
              sel?.addRange(range);
          }
          else {
              let range: Range | null = null;
              if ((document as any).caretPositionFromPoint) {
                  const pos = (document as any).caretPositionFromPoint(e.clientX, e.clientY);
                  if (pos) {
                      range = document.createRange();
                      range.setStart(pos.offsetNode, pos.offset);
                      range.collapse(true);
                  }
              } else if (document.caretRangeFromPoint) {
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

  // Determine effective contentEditable state - Keep true to allow selection, use inputMode="none" for read-only feel
  const isBodyEditable = true; 
  const isHeaderFooterEditable = true;

  // Cursor style logic
  let cursorStyle = 'cursor-text';
  if (selectionMode) cursorStyle = 'cursor-crosshair'; // Visual cue for selection mode
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
            className={`absolute inset-0 bg-white overflow-hidden transition-transform duration-300 ease-[cubic-bezier(0.2,0,0,1)] ${cursorStyle} ${selectionMode ? 'smart-selection-active' : ''}`}
            style={{
                transform: `scale(${scale})`,
                transformOrigin: 'top left',
                width: `${width}px`,
                height: `${height}px`,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)', // Refined realistic shadow
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
                <div className={`w-full h-full relative ${isHeaderFooterMode ? 'border-b-2 border-dashed border-indigo-500' : 'hover:bg-slate-50/50'}`}>
                    {isHeaderFooterMode && (
                        <div className="header-footer-label bg-indigo-600 text-white" style={{ left: 0, bottom: -2, transform: 'translateY(100%)' }}>Header</div>
                    )}
                    <div 
                        ref={headerRef}
                        className={`prodoc-header w-full min-h-full outline-none ${isHeaderFooterEditable ? 'cursor-text pointer-events-auto' : 'cursor-default pointer-events-none'}`}
                        contentEditable={isHeaderFooterEditable}
                        inputMode={isKeyboardLocked || selectionMode ? "none" : "text"}
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

            {/* Body Container (Writable Area) */}
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
                    inputMode={isKeyboardLocked || selectionMode ? "none" : "text"}
                    
                    onInput={handleInput}
                    onKeyDown={handleKeyDown}
                    onFocus={onFocus}
                    onClick={handleEditorClick}
                    onContextMenu={(e) => selectionMode && e.preventDefault()}
                    
                    onPointerDown={handleSmartPointerDown}
                    onPointerMove={handleSmartPointerMove}
                    onPointerUp={handleSmartPointerUp}
                    onPointerCancel={handleSmartPointerUp}

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
                 <div className={`w-full h-full relative flex flex-col justify-end ${isHeaderFooterMode ? 'border-t-2 border-dashed border-indigo-500' : 'hover:bg-slate-50/50'}`}>
                    {isHeaderFooterMode && (
                        <div className="header-footer-label footer-tag bg-indigo-600 text-white" style={{ left: 0, top: -2, transform: 'translateY(-100%)' }}>Footer</div>
                    )}
                    <div 
                        ref={footerRef}
                        className={`prodoc-footer w-full min-h-full outline-none ${isHeaderFooterEditable ? 'cursor-text pointer-events-auto' : 'cursor-default pointer-events-none'}`}
                        contentEditable={isHeaderFooterEditable}
                        inputMode={isKeyboardLocked || selectionMode ? "none" : "text"}
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
