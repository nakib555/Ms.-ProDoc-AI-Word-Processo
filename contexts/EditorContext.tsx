
import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { SaveStatus, ViewMode, PageConfig, CustomStyle, ReadModeConfig, ActiveElementType } from '../types';
import { useAutoSave } from '../hooks/useAutoSave';
import { DEFAULT_CONTENT, PAGE_SIZES, PAGE_MARGIN_PADDING, MARGIN_PRESETS } from '../constants';
import { handleMathInput } from '../utils/mathAutoCorrect';

interface PageDimensions {
  width: number;
  height: number;
}

interface EditorContextType {
  content: string;
  setContent: (content: string) => void;
  wordCount: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  readConfig: ReadModeConfig;
  setReadConfig: React.Dispatch<React.SetStateAction<ReadModeConfig>>;
  saveStatus: SaveStatus;
  executeCommand: (command: string, value?: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  pageConfig: PageConfig;
  setPageConfig: React.Dispatch<React.SetStateAction<PageConfig>>;
  pageDimensions: PageDimensions;
  registerContainer: (node: HTMLDivElement | null) => void;
  showRuler: boolean;
  setShowRuler: React.Dispatch<React.SetStateAction<boolean>>;
  documentTitle: string;
  setDocumentTitle: React.Dispatch<React.SetStateAction<string>>;
  lastModified: Date;
  creationDate: Date;
  setLastModified: React.Dispatch<React.SetStateAction<Date>>;
  showFormattingMarks: boolean;
  setShowFormattingMarks: React.Dispatch<React.SetStateAction<boolean>>;
  customStyles: CustomStyle[];
  addCustomStyle: (name: string) => void;
  applyCustomStyle: (style: CustomStyle) => void;
  applyAdvancedStyle: (styles: React.CSSProperties) => void;
  applyBlockStyle: (styles: React.CSSProperties) => void;
  handlePasteSpecial: (type: 'keep-source' | 'merge' | 'text-only') => Promise<void>;
  activeElementType: ActiveElementType;
  currentPage: number;
  setCurrentPage: React.Dispatch<React.SetStateAction<number>>;
  totalPages: number;
  setTotalPages: React.Dispatch<React.SetStateAction<number>>;
  showCopilot: boolean;
  setShowCopilot: React.Dispatch<React.SetStateAction<boolean>>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [content, setHtmlContent] = useState(DEFAULT_CONTENT);
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [creationDate] = useState(() => new Date());
  const [lastModified, setLastModified] = useState(() => new Date());
  
  const [wordCount, setWordCount] = useState(0);
  const [zoom, setZoom] = useState(35); // Default zoom reduced to show full page on start
  const [viewMode, setViewMode] = useState<ViewMode>('print');
  const [showRuler, setShowRuler] = useState(false);
  const [showFormattingMarks, setShowFormattingMarks] = useState(false);
  const [activeElementType, setActiveElementType] = useState<ActiveElementType>('text');
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCopilot, setShowCopilot] = useState(false);
  
  const [pageConfig, setPageConfig] = useState<PageConfig>({
    size: 'Letter',
    orientation: 'portrait',
    marginPreset: 'normal',
    margins: MARGIN_PRESETS.normal,
    background: 'none',
    pageColor: undefined,
    watermark: undefined,
    headerDistance: 0.5,
    footerDistance: 0.5,
    verticalAlign: 'top',
    sectionStart: 'newpage',
    differentOddEven: false,
    differentFirstPage: false,
    gutterPosition: 'left',
    multiplePages: 'normal',
    applyTo: 'wholeDocument',
    sheetsPerBooklet: 'all'
  });

  const [readConfig, setReadConfig] = useState<ReadModeConfig>({
    theme: 'light',
    columns: 1,
    textScale: 1.2
  });
  
  const [customStyles, setCustomStyles] = useState<CustomStyle[]>([]);

  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  const { saveStatus, triggerAutoSave, manualSave } = useAutoSave();

  // Stable content setter
  const setContent = useCallback((html: string) => {
    setHtmlContent(html);
    setLastModified(new Date());
    triggerAutoSave();
  }, [triggerAutoSave]);

  // Word Count Calculation (Main Thread)
  useEffect(() => {
    const handler = setTimeout(() => {
      const text = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      setWordCount(text ? text.split(' ').filter(w => w.length > 0).length : 0);
    }, 500);

    return () => clearTimeout(handler);
  }, [content]);

  // Selection Detection Logic
  useEffect(() => {
    const checkSelection = () => {
      // Priority check for MathLive active element (Shadow DOM focus)
      if (document.activeElement && document.activeElement.tagName === 'MATH-FIELD') {
          setActiveElementType('equation');
          return;
      }

      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) {
        return;
      }

      let node = selection.anchorNode;
      if (node && node.nodeType === Node.TEXT_NODE) {
        node = node.parentElement;
      }

      let type: ActiveElementType = 'text';
      let current = node as HTMLElement | null;
      let depth = 0;

      while (current && depth < 50) {
        if (current.nodeType === Node.ELEMENT_NODE) {
            if (current === editorRef.current || current.classList.contains('prodoc-editor')) {
                break;
            }
            if (current.tagName === 'MATH-FIELD' || current.classList.contains('prodoc-equation')) {
                type = 'equation';
                break;
            }
            if (['TABLE', 'TD', 'TH', 'TR', 'TBODY', 'THEAD'].includes(current.tagName)) {
                type = 'table';
                break;
            }
            if (current.tagName === 'IMG') {
                type = 'image';
                break;
            }
        }
        current = current.parentElement;
        depth++;
      }
      setActiveElementType(type);
    };

    document.addEventListener('selectionchange', checkSelection);
    document.addEventListener('mouseup', checkSelection);
    document.addEventListener('keyup', checkSelection);
    document.addEventListener('click', checkSelection);
    // Add focusin to detect focus changes into web components/shadow DOM
    document.addEventListener('focusin', checkSelection);

    return () => {
      document.removeEventListener('selectionchange', checkSelection);
      document.removeEventListener('mouseup', checkSelection);
      document.removeEventListener('keyup', checkSelection);
      document.removeEventListener('click', checkSelection);
      document.removeEventListener('focusin', checkSelection);
    };
  }, []);

  // Keyboard Handler for Math AutoCorrect
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
        // Only run if we are in an equation context
        if (activeElementType === 'equation') {
            const handled = handleMathInput(e, window.getSelection());
            if (handled) {
                // If the math engine handled it, trigger a save/update
                if (editorRef.current) {
                    // Slight delay to ensure DOM is settled if needed, though handleMathInput is synchronous
                    setTimeout(() => {
                        setContent(editorRef.current?.innerHTML || '');
                    }, 0);
                }
            }
        }
    };

    const element = editorRef.current;
    if (element) {
        element.addEventListener('keydown', handleKeyDown);
    }
    // Also listen globally if focus is inside editor but we missed attaching
    document.addEventListener('keydown', handleKeyDown);

    return () => {
        if (element) element.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeElementType, setContent]);

  const registerContainer = useCallback((node: HTMLDivElement | null) => {
    containerRef.current = node;
  }, []);

  const pageDimensions = useMemo(() => {
    let width, height;
    if (pageConfig.size === 'Custom' && pageConfig.customWidth && pageConfig.customHeight) {
      width = pageConfig.customWidth * 96;
      height = pageConfig.customHeight * 96;
    } else {
      const base = PAGE_SIZES[pageConfig.size as string] || PAGE_SIZES['Letter'];
      width = base.width;
      height = base.height;
    }
    return pageConfig.orientation === 'portrait' 
      ? { width, height }
      : { width: height, height: width };
  }, [pageConfig.size, pageConfig.orientation, pageConfig.customWidth, pageConfig.customHeight]);

  const calculateFitZoom = useCallback((type: 'width' | 'page') => {
    if (!containerRef.current) return;
    const container = containerRef.current;
    const { clientWidth, clientHeight } = container;
    const { width, height } = pageDimensions;
    const availableWidth = Math.max(0, clientWidth - PAGE_MARGIN_PADDING * 2);
    const availableHeight = Math.max(0, clientHeight - PAGE_MARGIN_PADDING * 2);

    if (type === 'width') {
      const ratio = availableWidth / width;
      setZoom(Math.floor(ratio * 100));
    } else {
      const wRatio = availableWidth / width;
      const hRatio = availableHeight / height;
      setZoom(Math.floor(Math.min(wRatio, hRatio) * 100));
    }
  }, [pageDimensions]);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (command === 'zoomIn') {
        setZoom(p => Math.min(500, p + 10));
        return;
    }
    if (command === 'zoomOut') {
        setZoom(p => Math.max(10, p - 10));
        return;
    }
    if (command === 'zoomReset') {
        setZoom(100);
        return;
    }
    if (command === 'fitWidth') {
        calculateFitZoom('width');
        return;
    }
    if (command === 'fitPage') {
        calculateFitZoom('page');
        return;
    }
    if (command === 'save') {
        manualSave();
        return;
    }
    if (command === 'export') {
        alert('Use File > Export to save the document.');
        return;
    }
    if (command === 'growFont') {
        document.execCommand('increaseFontSize', false, undefined);
    } else if (command === 'shrinkFont') {
        document.execCommand('decreaseFontSize', false, undefined);
    } else {
        document.execCommand(command, false, value);
    }
    
    if (viewMode === 'web' && editorRef.current) {
      editorRef.current.focus();
      setHtmlContent(editorRef.current.innerHTML);
    }
  }, [manualSave, calculateFitZoom, viewMode]);

  const addCustomStyle = useCallback((name: string) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    const anchorNode = selection.anchorNode;
    const element = anchorNode?.nodeType === Node.TEXT_NODE ? anchorNode.parentElement : anchorNode as HTMLElement;
    if (!element) return;
    const computed = window.getComputedStyle(element);
    const styles: React.CSSProperties = {
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        fontStyle: computed.fontStyle,
        textDecoration: computed.textDecoration,
        color: computed.color,
        backgroundColor: computed.backgroundColor !== 'rgba(0, 0, 0, 0)' ? computed.backgroundColor : undefined,
        letterSpacing: computed.letterSpacing,
    };
    const newStyle: CustomStyle = {
        id: Date.now().toString(),
        name,
        styles,
        tagName: element.tagName
    };
    setCustomStyles(prev => [...prev, newStyle]);
  }, []);

  const applyCustomStyle = useCallback((style: CustomStyle) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const span = document.createElement('span');
      Object.assign(span.style, style.styles);
      if (['H1', 'H2', 'H3', 'P', 'BLOCKQUOTE'].includes(style.tagName)) {
         document.execCommand('formatBlock', false, style.tagName);
      }
      const range = selection.getRangeAt(0);
      const contents = range.extractContents();
      span.appendChild(contents);
      range.insertNode(span);
      if (viewMode === 'web' && editorRef.current) {
          editorRef.current.normalize();
          setHtmlContent(editorRef.current.innerHTML);
      }
  }, [viewMode]);

  const applyAdvancedStyle = useCallback((styles: React.CSSProperties) => {
      const selection = window.getSelection();
      if (!selection || selection.rangeCount === 0) return;
      const range = selection.getRangeAt(0);
      const span = document.createElement('span');
      Object.assign(span.style, styles);
      if (range.collapsed) {
         const text = document.createTextNode('\u200B');
         span.appendChild(text);
         range.insertNode(span);
         range.setStart(text, 1);
         range.collapse(true);
         selection.removeAllRanges();
         selection.addRange(range);
      } else {
         try {
            const contents = range.extractContents();
            span.appendChild(contents);
            range.insertNode(span);
         } catch (e) {
            console.error("Could not apply style", e);
         }
      }
      if (viewMode === 'web' && editorRef.current) {
          setHtmlContent(editorRef.current.innerHTML);
          editorRef.current.focus();
      }
  }, [viewMode]);

  const applyBlockStyle = useCallback((styles: React.CSSProperties) => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) return;
    let node = selection.anchorNode;
    let depth = 0;
    while (node && depth < 50) {
        if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = (node as HTMLElement).tagName;
            if ((node as HTMLElement).classList.contains('prodoc-editor')) break;
            if (['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'DIV', 'LI', 'BLOCKQUOTE', 'TD', 'TH'].includes(tagName)) {
                Object.assign((node as HTMLElement).style, styles);
                if (viewMode === 'web' && editorRef.current) {
                    setHtmlContent(editorRef.current.innerHTML);
                }
                return;
            }
        }
        node = node.parentNode;
        depth++;
    }
    document.execCommand('formatBlock', false, 'P');
  }, [viewMode]);

  const handlePasteSpecial = useCallback(async (type: 'keep-source' | 'merge' | 'text-only') => {
    try {
        if (type === 'text-only') {
            const text = await navigator.clipboard.readText();
            document.execCommand('insertText', false, text);
        } else {
            const items = await navigator.clipboard.read();
            for (const item of items) {
                if (item.types.includes('text/html')) {
                    const blob = await item.getType('text/html');
                    const html = await blob.text();
                    if (type === 'merge') {
                        const doc = new DOMParser().parseFromString(html, 'text/html');
                        doc.body.querySelectorAll('*').forEach(el => {
                            el.removeAttribute('class');
                            el.removeAttribute('style');
                        });
                        document.execCommand('insertHTML', false, doc.body.innerHTML);
                    } else {
                        document.execCommand('insertHTML', false, html);
                    }
                    return;
                }
            }
            const text = await navigator.clipboard.readText();
            document.execCommand('insertText', false, text);
        }
    } catch (err) {
        console.error('Failed to paste:', err);
        alert('Browser security blocked clipboard access. Please use keyboard shortcuts (Ctrl+V or Cmd+V) to paste.');
    }
  }, []);

  const contextValue = useMemo(() => ({
    content,
    setContent,
    wordCount,
    zoom,
    setZoom,
    viewMode,
    setViewMode,
    readConfig,
    setReadConfig,
    saveStatus,
    executeCommand,
    editorRef,
    pageConfig,
    setPageConfig,
    pageDimensions,
    registerContainer,
    showRuler,
    setShowRuler,
    documentTitle,
    setDocumentTitle,
    lastModified,
    setLastModified,
    creationDate,
    showFormattingMarks,
    setShowFormattingMarks,
    customStyles,
    addCustomStyle,
    applyCustomStyle,
    applyAdvancedStyle,
    applyBlockStyle,
    handlePasteSpecial,
    activeElementType,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    showCopilot,
    setShowCopilot
  }), [
    content,
    wordCount,
    zoom,
    viewMode,
    readConfig,
    saveStatus,
    pageConfig,
    pageDimensions,
    showRuler,
    documentTitle,
    lastModified,
    creationDate,
    setContent,
    executeCommand,
    registerContainer,
    calculateFitZoom,
    showFormattingMarks,
    customStyles,
    addCustomStyle,
    applyCustomStyle,
    applyAdvancedStyle,
    applyBlockStyle,
    handlePasteSpecial,
    activeElementType,
    currentPage,
    totalPages,
    showCopilot
  ]);

  return (
    <EditorContext.Provider value={contextValue}>
      {children}
    </EditorContext.Provider>
  );
};

export const useEditor = () => {
  const context = useContext(EditorContext);
  if (!context) {
    throw new Error('useEditor must be used within an EditorProvider');
  }
  return context;
};
