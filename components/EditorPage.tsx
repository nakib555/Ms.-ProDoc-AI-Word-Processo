
import React, { useRef, useLayoutEffect, useEffect, useState } from 'react';
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
  
  // Different First Page Support
  firstHeaderContent?: string;
  setFirstHeaderContent?: (html: string) => void;
  firstFooterContent?: string;
  setFirstFooterContent?: (html: string) => void;
}

// ... (ResizerOverlay remains same as original)
const ResizerOverlay: React.FC<{
    target: HTMLElement;
    container: HTMLElement;
    scale: number;
    onUpdate: () => void;
    onClear: () => void;
}> = ({ target, container, scale, onUpdate, onClear }) => {
    const [rect, setRect] = useState(target.getBoundingClientRect());
    const [isResizing, setIsResizing] = useState(false);

    useEffect(() => {
        const updateRect = () => {
            const containerRect = container.getBoundingClientRect();
            const targetRect = target.getBoundingClientRect();
            
            setRect({
                top: (targetRect.top - containerRect.top) / scale,
                left: (targetRect.left - containerRect.left) / scale,
                width: targetRect.width / scale,
                height: targetRect.height / scale,
                bottom: 0, right: 0, x: 0, y: 0, toJSON: () => {}
            });
        };
        updateRect();
        window.addEventListener('resize', updateRect);
        return () => window.removeEventListener('resize', updateRect);
    }, [target, container, scale, isResizing]);

    const handleMouseDown = (e: React.MouseEvent, direction: string) => {
        e.preventDefault();
        e.stopPropagation();
        setIsResizing(true);
        
        const startX = e.clientX;
        const startY = e.clientY;
        const startWidth = target.clientWidth;
        const startHeight = target.clientHeight;
        const aspectRatio = startWidth / startHeight;

        const handleMouseMove = (ev: MouseEvent) => {
            const deltaX = (ev.clientX - startX) / scale;
            const deltaY = (ev.clientY - startY) / scale;

            let newWidth = startWidth;
            let newHeight = startHeight;

            if (direction.includes('e')) newWidth = startWidth + deltaX;
            if (direction.includes('w')) newWidth = startWidth - deltaX;
            if (direction.includes('s')) newHeight = startHeight + deltaY;
            if (direction.includes('n')) newHeight = startHeight - deltaY;

            if (direction.length === 2) { 
                 if (Math.abs(deltaX) > Math.abs(deltaY)) {
                     newHeight = newWidth / aspectRatio;
                 } else {
                     newWidth = newHeight * aspectRatio;
                 }
            }

            target.style.width = `${Math.max(20, newWidth)}px`;
            target.style.height = `${Math.max(20, newHeight)}px`;
            setRect(prev => ({ ...prev, width: Math.max(20, newWidth), height: Math.max(20, newHeight) }));
        };

        const handleMouseUp = () => {
            setIsResizing(false);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseup', handleMouseUp);
            onUpdate();
        };

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div 
            className="absolute border-2 border-blue-500 z-50 pointer-events-none"
            style={{
                top: rect.top,
                left: rect.left,
                width: rect.width,
                height: rect.height,
            }}
        >
            {['nw', 'ne', 'sw', 'se'].map(dir => (
                <div 
                    key={dir}
                    onMouseDown={(e) => handleMouseDown(e, dir)}
                    className="absolute w-3 h-3 bg-white border border-blue-600 rounded-full pointer-events-auto"
                    style={{
                        top: dir.includes('n') ? -6 : 'auto',
                        bottom: dir.includes('s') ? -6 : 'auto',
                        left: dir.includes('w') ? -6 : 'auto',
                        right: dir.includes('e') ? -6 : 'auto',
                        cursor: `${dir}-resize`
                    }}
                />
            ))}
        </div>
    );
};

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
  setFooterContent,
  firstHeaderContent = '',
  setFirstHeaderContent,
  firstFooterContent = '',
  setFirstFooterContent
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLDivElement>(null);
  const scale = zoom / 100;
  const { isKeyboardLocked, selectionMode, undo, redo } = useEditor();

  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);

  // Smart Selection Refs
  const wordPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const longPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const superLongPressTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const pointerStartRef = useRef<{ x: number, y: number, time: number } | null>(null);
  const smartSelectionTriggeredRef = useRef(false);

  const isHeaderFooterMode = activeEditingArea === 'header' || activeEditingArea === 'footer';
  const isFirstPage = pageNumber === 1;
  const useDifferentFirstPage = config.differentFirstPage;

  // Determine active header/footer content based on page number and config
  const activeHeaderContent = (useDifferentFirstPage && isFirstPage) ? firstHeaderContent : headerContent;
  const activeFooterContent = (useDifferentFirstPage && isFirstPage) ? firstFooterContent : footerContent;
  
  // Determine setter for header/footer
  const handleHeaderInput = (e: React.FormEvent<HTMLDivElement>) => {
      const val = e.currentTarget.innerHTML;
      if (useDifferentFirstPage && isFirstPage) {
          if (setFirstHeaderContent) setFirstHeaderContent(val);
      } else {
          if (setHeaderContent) setHeaderContent(val);
      }
  };

  const handleFooterInput = (e: React.FormEvent<HTMLDivElement>) => {
      const val = e.currentTarget.innerHTML;
      if (useDifferentFirstPage && isFirstPage) {
          if (setFirstFooterContent) setFirstFooterContent(val);
      } else {
          if (setFooterContent) setFooterContent(val);
      }
  };
  
  // Dimensions in Inches
  let widthIn = 0;
  let heightIn = 0;
  
  if (config.size === 'Custom' && config.customWidth && config.customHeight) {
      widthIn = config.customWidth;
      heightIn = config.customHeight;
  } else {
      const base = PAGE_SIZES[config.size as keyof typeof PAGE_SIZES] || PAGE_SIZES['Letter'];
      widthIn = config.orientation === 'portrait' ? base.width / 96 : base.height / 96;
      heightIn = config.orientation === 'portrait' ? base.height / 96 : base.width / 96;
  }

  // Minimum body gap (approx 2 inches) used for safe header/footer max height calculation
  const MIN_BODY_GAP_IN = 2; 

  useMathLive(content, editorRef);

  // --- Image Handling ---
  const handleEditorClick = (e: React.MouseEvent) => {
     if (selectionMode) handleSmartClick(e);
     const target = e.target as HTMLElement;
     if (target.tagName === 'IMG') {
         setSelectedImage(target);
         e.stopPropagation();
     } else {
         setSelectedImage(null);
     }
  };

  const handleImageUpdate = () => {
      if (editorRef.current && onContentChange) {
          onContentChange(editorRef.current.innerHTML, pageNumber - 1);
      }
  };

  // ... (Cursor helpers: getCaretCharacterOffsetWithin, setCaretPosition remain same)
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
      } catch (e) {}
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
              while (i--) nodeStack.push(node.childNodes[i]);
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

  // Sync content to editable div
  useLayoutEffect(() => {
    if (editorRef.current) {
      const activeEl = document.activeElement;
      const isMathFieldFocused = activeEl && activeEl.tagName.toLowerCase() === 'math-field' && editorRef.current.contains(activeEl);
      if (isMathFieldFocused) return;
      if (selectedImage) return;

      if (editorRef.current.innerHTML !== content) {
        const isFocused = document.activeElement === editorRef.current || editorRef.current.contains(document.activeElement);
        let savedOffset = 0;
        if (isFocused) savedOffset = getCaretCharacterOffsetWithin(editorRef.current);

        editorRef.current.innerHTML = content;

        if (isFocused) {
            const newContentLength = getTextLength(editorRef.current);
            if (savedOffset <= newContentLength) {
                editorRef.current.focus();
                try { setCaretPosition(editorRef.current, savedOffset); } catch (e) {}
            }
        }
      }
    }
  }, [content, pageNumber, totalPages, selectedImage]);

  // Sync Header
  useEffect(() => {
      if (headerRef.current) {
          const isFocused = document.activeElement === headerRef.current;
          if (!isFocused && headerRef.current.innerHTML !== activeHeaderContent) {
              headerRef.current.innerHTML = activeHeaderContent;
          }
      }
  }, [activeHeaderContent]);

  // Sync Footer
  useEffect(() => {
      if (footerRef.current) {
          const displayHtml = activeFooterContent.replace(/\[Page \d+\]/g, `[Page ${pageNumber}]`)
                                                 .replace(/<span class="page-number-placeholder">\d+<\/span>/g, `<span class="page-number-placeholder">${pageNumber}</span>`);
          
          const isFocused = document.activeElement === footerRef.current;
          if (!isFocused && footerRef.current.innerHTML !== displayHtml) {
              footerRef.current.innerHTML = displayHtml;
          }
      }
  }, [activeFooterContent, pageNumber]);

  // Observer for main content
  useEffect(() => {
    if (!editorRef.current || readOnly || !onContentChange || selectedImage) return;
    const observer = new MutationObserver(() => {
        if (editorRef.current) onContentChange(editorRef.current.innerHTML, pageNumber - 1);
    });
    observer.observe(editorRef.current, { characterData: true, childList: true, subtree: true, attributes: true });
    return () => observer.disconnect();
  }, [onContentChange, pageNumber, readOnly, selectedImage]);

  const handleInput = (e: React.FormEvent<HTMLDivElement>) => {
    if (onContentChange) onContentChange(e.currentTarget.innerHTML, pageNumber - 1);
  };

  // ... (Table Nav, Keyboard, Smart Selection Logic - Keeping as is, simplified for brevity in XML if possible, but including full block for correctness)
  const selectCellContent = (cell: HTMLTableCellElement) => {
      const range = document.createRange();
      range.selectNodeContents(cell);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      cell.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  };

  const handleTableNavigation = (e: React.KeyboardEvent): boolean => {
      if (e.key !== 'Tab') return false;
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return false;
      let node = sel.anchorNode;
      let cell: HTMLTableCellElement | null = null;
      while (node && node !== editorRef.current) {
          if (node.nodeName === 'TD' || node.nodeName === 'TH') { cell = node as HTMLTableCellElement; break; }
          node = node.parentNode;
      }
      if (!cell) return false;
      e.preventDefault();
      const row = cell.parentElement as HTMLTableRowElement;
      const table = row.parentElement?.closest('table') as HTMLTableElement;
      if (!table || !row) return true;
      const allRows = Array.from(table.rows);
      const currentRowIndex = allRows.indexOf(row);
      const cells = Array.from(row.cells);
      const currentCellIndex = cell.cellIndex;

      if (!e.shiftKey) {
          if (currentCellIndex < cells.length - 1) selectCellContent(cells[currentCellIndex + 1]);
          else if (currentRowIndex < allRows.length - 1) {
              const nextRow = allRows[currentRowIndex + 1];
              if (nextRow.cells.length > 0) selectCellContent(nextRow.cells[0]);
          } else {
              const newRow = row.cloneNode(true) as HTMLTableRowElement;
              Array.from(newRow.cells).forEach(c => c.innerHTML = '<br>');
              row.parentElement?.appendChild(newRow);
              selectCellContent(newRow.cells[0]);
              if (onContentChange && editorRef.current) onContentChange(editorRef.current.innerHTML, pageNumber - 1);
          }
      } else {
          if (currentCellIndex > 0) selectCellContent(cells[currentCellIndex - 1]);
          else if (currentRowIndex > 0) {
              const prevRow = allRows[currentRowIndex - 1];
              if (prevRow.cells.length > 0) selectCellContent(prevRow.cells[prevRow.cells.length - 1]);
          }
      }
      return true;
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (readOnly) return;
    if (handleTableNavigation(e)) return;
    if (isKeyboardLocked && !selectionMode && !['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Home', 'End', 'PageUp', 'PageDown'].includes(e.key) && !(e.ctrlKey || e.metaKey)) {
         e.preventDefault(); return;
    }
    if ((e.ctrlKey || e.metaKey) && !e.altKey) {
        if (e.key.toLowerCase() === 'z') { e.preventDefault(); e.shiftKey ? redo() : undo(); return; }
        if (e.key.toLowerCase() === 'y') { e.preventDefault(); redo(); return; }
    }
    const selection = window.getSelection();
    if (!selection || !selection.rangeCount || !editorRef.current) return;
    const range = selection.getRangeAt(0);

    if (e.key === 'ArrowDown') {
        const editorRect = editorRef.current.getBoundingClientRect();
        const rangeRect = range.getBoundingClientRect();
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
  };

  // Smart Selection Logic (Simplified for brevity but functional)
  const selectWord = () => { const sel = window.getSelection(); if (sel?.modify) { sel.modify('move', 'backward', 'word'); sel.modify('extend', 'forward', 'word'); } };
  const selectSentence = () => { const sel = window.getSelection(); if (sel?.modify) try { sel.modify('move', 'backward', 'sentence'); sel.modify('extend', 'forward', 'sentence'); } catch(e) { sel.modify('move', 'backward', 'line'); sel.modify('extend', 'forward', 'line'); } };
  const selectParagraph = (target: EventTarget | null) => {
      const sel = window.getSelection(); if (!sel) return;
      let node = target as Node | null;
      if (node?.nodeType === Node.TEXT_NODE) node = node.parentNode;
      while (node && node !== editorRef.current && (node as HTMLElement).tagName) {
          const el = node as HTMLElement;
          if (['P', 'H1', 'H2', 'H3', 'LI', 'DIV'].includes(el.tagName)) {
              const range = document.createRange(); range.selectNodeContents(el); sel.removeAllRanges(); sel.addRange(range); return;
          }
          node = node.parentNode;
      }
      if (sel.modify) { sel.modify('move', 'backward', 'paragraph'); sel.modify('extend', 'forward', 'paragraph'); }
  };
  const selectPage = () => { if (editorRef.current) { const range = document.createRange(); range.selectNodeContents(editorRef.current); window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range); } };

  const handleSmartPointerDown = (e: React.PointerEvent) => {
      if (!selectionMode) return;
      smartSelectionTriggeredRef.current = false;
      if (!isHeaderFooterMode && document.caretRangeFromPoint) {
          const range = document.caretRangeFromPoint(e.clientX, e.clientY);
          if (range && editorRef.current?.contains(range.startContainer)) { window.getSelection()?.removeAllRanges(); window.getSelection()?.addRange(range); }
      }
      pointerStartRef.current = { x: e.clientX, y: e.clientY, time: Date.now() };
      if (wordPressTimerRef.current) clearTimeout(wordPressTimerRef.current);
      if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current);
      if (superLongPressTimerRef.current) clearTimeout(superLongPressTimerRef.current);
      const target = e.target;
      wordPressTimerRef.current = setTimeout(() => { selectWord(); smartSelectionTriggeredRef.current = true; if (navigator.vibrate) navigator.vibrate(20); }, 1000);
      longPressTimerRef.current = setTimeout(() => { selectParagraph(target); smartSelectionTriggeredRef.current = true; if (navigator.vibrate) navigator.vibrate(50); }, 2000);
      superLongPressTimerRef.current = setTimeout(() => { selectPage(); smartSelectionTriggeredRef.current = true; if (navigator.vibrate) navigator.vibrate([50, 50, 50]); }, 3000);
  };
  const handleSmartPointerMove = (e: React.PointerEvent) => { if (!selectionMode || !pointerStartRef.current) return; if (Math.hypot(e.clientX - pointerStartRef.current.x, e.clientY - pointerStartRef.current.y) > 10) { if (wordPressTimerRef.current) clearTimeout(wordPressTimerRef.current); if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); if (superLongPressTimerRef.current) clearTimeout(superLongPressTimerRef.current); pointerStartRef.current = null; } };
  const handleSmartPointerUp = (e: React.PointerEvent) => { if (!selectionMode) return; if (wordPressTimerRef.current) clearTimeout(wordPressTimerRef.current); if (longPressTimerRef.current) clearTimeout(longPressTimerRef.current); if (superLongPressTimerRef.current) clearTimeout(superLongPressTimerRef.current); pointerStartRef.current = null; };
  const handleSmartClick = (e: React.MouseEvent) => { if (!selectionMode) return; if (smartSelectionTriggeredRef.current) { e.preventDefault(); e.stopPropagation(); return; } if (e.detail === 2) { selectSentence(); e.preventDefault(); e.stopPropagation(); } };

  const handlePageClick = (e: React.MouseEvent) => {
      if (e.target !== selectedImage) setSelectedImage(null);
      if (selectionMode) return;
      if (editorRef.current && !editorRef.current.contains(e.target as Node) && !isHeaderFooterMode) {
          editorRef.current.focus();
          const rect = editorRef.current.getBoundingClientRect();
          const range = document.createRange();
          range.selectNodeContents(editorRef.current);
          range.collapse(e.clientY > rect.bottom ? false : true);
          window.getSelection()?.removeAllRanges();
          window.getSelection()?.addRange(range);
      }
  };

  // Margins & Styles
  const getMarginsInches = () => {
    const m = config.margins;
    let top = Math.max(m.top, config.headerDistance || 0);
    let bottom = Math.max(m.bottom, config.footerDistance || 0);
    let left = m.left;
    let right = m.right;
    const gutter = m.gutter || 0;
    const isMirroredOrBookFold = ['mirrorMargins', 'bookFold'].includes(config.multiplePages || '');
    if (isMirroredOrBookFold) {
       const inside = m.left; const outside = m.right;
       const isOdd = pageNumber % 2 !== 0; 
       if (isOdd) { left = inside + (config.gutterPosition === 'left' ? gutter : 0); right = outside; } 
       else { left = outside; right = inside + (config.gutterPosition === 'left' ? gutter : 0); }
    } else {
        if (config.gutterPosition === 'top') top += gutter; else left += gutter;
    }
    return { top, right, bottom, left };
  };
  const margins = getMarginsInches();

  const getBackgroundStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = { backgroundColor: config.pageColor || '#ffffff' };
      if (config.background === 'ruled') return { ...base, backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px)', backgroundSize: '100% 0.33in' };
      else if (config.background === 'grid') return { ...base, backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)', backgroundSize: '0.2in 0.2in' };
      return base;
  };
  const getVerticalAlignStyle = (): React.CSSProperties => {
      const style: React.CSSProperties = { display: 'flex', flexDirection: 'column' };
      let justifyContent: 'center' | 'flex-end' | 'space-between' | 'flex-start' = 'flex-start';
      if (config.verticalAlign === 'center') justifyContent = 'center';
      else if (config.verticalAlign === 'bottom') justifyContent = 'flex-end';
      else if (config.verticalAlign === 'justify') justifyContent = 'space-between';
      return { ...style, justifyContent };
  };

  const onHeaderDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (setActiveEditingArea && !isKeyboardLocked && !selectionMode) {
          setActiveEditingArea('header');
          setTimeout(() => { if (headerRef.current) { headerRef.current.focus(); document.execCommand('selectAll', false, ''); } }, 10);
      }
  };
  const onFooterDoubleClick = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (setActiveEditingArea && !isKeyboardLocked && !selectionMode) {
          setActiveEditingArea('footer');
          setTimeout(() => { if (footerRef.current) { footerRef.current.focus(); document.execCommand('selectAll', false, ''); } }, 10);
      }
  };
  const onBodyDoubleClick = (e: React.MouseEvent) => {
      if (activeEditingArea !== 'body' && setActiveEditingArea && !isKeyboardLocked && !selectionMode) {
          e.stopPropagation();
          setActiveEditingArea('body');
          setTimeout(() => { if (editorRef.current) editorRef.current.focus(); }, 10);
      }
  };

  const safeMaxHeaderHeight = (heightIn - MIN_BODY_GAP_IN) / 2;
  const safeMaxFooterHeight = (heightIn - MIN_BODY_GAP_IN) / 2;
  const isBodyEditable = true; 
  const isHeaderFooterEditable = true;
  let cursorStyle = 'cursor-text';
  if (selectionMode) cursorStyle = 'cursor-crosshair';
  else if (isKeyboardLocked) cursorStyle = 'cursor-default';

  return (
    <div 
        className="relative group transition-all duration-300 ease-[cubic-bezier(0.2,0,0,1)] mx-auto origin-top"
        style={{ width: `${widthIn * scale}in`, height: `${heightIn * scale}in` }}
    >
        <div 
            className={`prodoc-page-sheet absolute inset-0 bg-white overflow-hidden ${cursorStyle} ${selectionMode ? 'smart-selection-active' : ''}`}
            style={{
                transform: `scale(${scale})`, transformOrigin: 'top left',
                width: `${widthIn}in`, height: `${heightIn}in`,
                boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -1px rgba(0,0,0,0.06), 0 0 0 1px rgba(0,0,0,0.05)',
                paddingTop: `${margins.top}in`, paddingBottom: `${margins.bottom}in`,
                paddingLeft: `${margins.left}in`, paddingRight: `${margins.right}in`,
                boxSizing: 'border-box', ...getBackgroundStyle()
            }}
            onMouseDown={handlePageClick}
        >
            {/* Header Area */}
            <div 
                className={`absolute left-0 right-0 z-30 ${isHeaderFooterMode ? 'z-50' : ''}`}
                style={{ top: 0, height: `${margins.top}in`, maxHeight: `${safeMaxHeaderHeight}in`, paddingTop: `${config.headerDistance || 0.5}in`, paddingLeft: `${margins.left}in`, paddingRight: `${margins.right}in` }}
                onDoubleClick={onHeaderDoubleClick} onMouseDown={(e) => e.stopPropagation()} 
            >
                <div className={`w-full h-full relative ${isHeaderFooterMode ? 'border-b-2 border-dashed border-indigo-500' : 'hover:bg-slate-50/50'}`}>
                    {isHeaderFooterMode && <div className="header-footer-label bg-indigo-600 text-white" style={{ left: 0, bottom: -2, transform: 'translateY(100%)' }}>{isFirstPage && useDifferentFirstPage ? "First Page Header" : "Header"}</div>}
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

            {config.watermark && (
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none overflow-hidden z-0">
                     <div className="transform -rotate-45 text-slate-300/40 font-bold text-[8rem] whitespace-nowrap select-none" style={{ color: 'rgba(0,0,0,0.08)' }}>{config.watermark}</div>
                 </div>
            )}

            {/* Body */}
            <div 
                className={`relative w-full h-full overflow-hidden transition-opacity duration-300 ${isHeaderFooterMode ? 'opacity-50' : 'opacity-100'}`}
                style={{ ...getVerticalAlignStyle() }}
                onDoubleClick={onBodyDoubleClick} onMouseDown={(e) => e.stopPropagation()} 
            >
                <div
                    id={`prodoc-editor-${pageNumber}`}
                    ref={editorRef}
                    className={`prodoc-editor w-full outline-none text-lg leading-loose break-words z-10 ${showFormattingMarks ? 'show-formatting-marks' : ''} ${isHeaderFooterMode ? 'pointer-events-none select-none' : ''}`}
                    contentEditable={isBodyEditable}
                    inputMode={isKeyboardLocked || selectionMode ? "none" : "text"}
                    onInput={handleInput} onKeyDown={handleKeyDown} onFocus={onFocus} onClick={handleEditorClick}
                    onContextMenu={(e) => selectionMode && e.preventDefault()}
                    onPointerDown={handleSmartPointerDown} onPointerMove={handleSmartPointerMove} onPointerUp={handleSmartPointerUp} onPointerCancel={handleSmartPointerUp}
                    suppressContentEditableWarning={true}
                    style={{ fontFamily: 'Calibri, Inter, sans-serif', color: '#000000', flex: config.verticalAlign === 'justify' ? '1 1 auto' : undefined, minHeight: '100%' }}
                />
                {selectedImage && editorRef.current && (
                    <ResizerOverlay target={selectedImage} container={editorRef.current} scale={1} onUpdate={handleImageUpdate} onClear={() => setSelectedImage(null)} />
                )}
            </div>

            {/* Footer Area */}
            <div 
                className={`absolute left-0 right-0 z-30 ${isHeaderFooterMode ? 'z-50' : ''}`}
                style={{ bottom: 0, height: `${margins.bottom}in`, maxHeight: `${safeMaxFooterHeight}in`, paddingBottom: `${config.footerDistance || 0.5}in`, paddingLeft: `${margins.left}in`, paddingRight: `${margins.right}in` }}
                onDoubleClick={onFooterDoubleClick} onMouseDown={(e) => e.stopPropagation()} 
            >
                 <div className={`w-full h-full relative flex flex-col justify-end ${isHeaderFooterMode ? 'border-t-2 border-dashed border-indigo-500' : 'hover:bg-slate-50/50'}`}>
                    {isHeaderFooterMode && <div className="header-footer-label footer-tag bg-indigo-600 text-white" style={{ left: 0, top: -2, transform: 'translateY(-100%)' }}>{isFirstPage && useDifferentFirstPage ? "First Page Footer" : "Footer"}</div>}
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
        prev.firstHeaderContent === next.firstHeaderContent &&
        prev.firstFooterContent === next.firstFooterContent &&
        prev.config.size === next.config.size &&
        prev.config.orientation === next.config.orientation &&
        prev.config.margins.top === next.config.margins.top &&
        prev.config.margins.bottom === next.config.margins.bottom &&
        prev.config.margins.left === next.config.margins.left &&
        prev.config.margins.right === next.config.margins.right &&
        prev.config.differentFirstPage === next.config.differentFirstPage &&
        prev.config.headerDistance === next.config.headerDistance &&
        prev.config.footerDistance === next.config.footerDistance &&
        prev.config.pageColor === next.config.pageColor &&
        prev.config.watermark === next.config.watermark &&
        prev.config.background === next.config.background
    );
};

export const EditorPage = React.memo(EditorPageComponent, arePropsEqual);
