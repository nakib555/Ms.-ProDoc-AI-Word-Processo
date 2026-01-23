
import React, { createContext, useContext, useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { useEditor as useTipTapEditor, Editor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import Underline from '@tiptap/extension-underline';
import Link from '@tiptap/extension-link';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import TextStyle from '@tiptap/extension-text-style';
import { Color } from '@tiptap/extension-color';
import Highlight from '@tiptap/extension-highlight';
import { Node, mergeAttributes } from '@tiptap/core';

import { SaveStatus, ViewMode, PageConfig, CustomStyle, ReadModeConfig, ActiveElementType, PageMovement, EditingArea } from '../types';
import { useAutoSave } from '../hooks/useAutoSave';
import { DEFAULT_CONTENT, PAGE_SIZES, MARGIN_PRESETS } from '../constants';

// Custom Page Break Extension
const PageBreakExtension = Node.create({
  name: 'pageBreak',
  group: 'block',
  atom: true,
  draggable: true,
  
  parseHTML() {
    return [
      { tag: 'div', getAttrs: (node) => (node as HTMLElement).classList.contains('prodoc-page-break') && null },
      { tag: 'hr', getAttrs: (node) => (node as HTMLElement).style.pageBreakAfter === 'always' && null }
    ];
  },
  
  renderHTML({ HTMLAttributes }) {
    return ['div', mergeAttributes(HTMLAttributes, { class: 'prodoc-page-break', 'data-type': 'page-break' })];
  },
  
  addCommands() {
    return {
      setPageBreak: () => ({ chain }) => {
        return chain().insertContent({ type: this.name }).run();
      },
    };
  },

  addKeyboardShortcuts() {
    return {
      'Mod-Enter': () => this.editor.commands.setPageBreak(),
    }
  },
});

// Define custom types for TipTap integration
export interface EditorContextType {
  editor: Editor | null;
  content: string;
  setContent: (content: string, emitUpdate?: boolean) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  wordCount: number;
  zoom: number;
  setZoom: React.Dispatch<React.SetStateAction<number>>;
  viewMode: ViewMode;
  setViewMode: React.Dispatch<React.SetStateAction<ViewMode>>;
  pageMovement: PageMovement;
  setPageMovement: React.Dispatch<React.SetStateAction<PageMovement>>;
  readConfig: ReadModeConfig;
  setReadConfig: React.Dispatch<React.SetStateAction<ReadModeConfig>>;
  saveStatus: SaveStatus;
  executeCommand: (command: string, value?: string) => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  pageConfig: PageConfig;
  setPageConfig: React.Dispatch<React.SetStateAction<PageConfig>>;
  showPageSetup: boolean;
  setShowPageSetup: React.Dispatch<React.SetStateAction<boolean>>;
  pageDimensions: any;
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
  
  // AI State
  aiState: 'idle' | 'thinking' | 'writing';
  setAiState: React.Dispatch<React.SetStateAction<'idle' | 'thinking' | 'writing'>>;
  isAIProcessing: boolean;
  setIsAIProcessing: (isProcessing: boolean) => void;
  
  // Header/Footer & Editing Area
  activeEditingArea: EditingArea;
  setActiveEditingArea: React.Dispatch<React.SetStateAction<EditingArea>>;
  headerContent: string;
  setHeaderContent: React.Dispatch<React.SetStateAction<string>>;
  footerContent: string;
  setFooterContent: React.Dispatch<React.SetStateAction<string>>;
  
  // First Page Header/Footer (for Different First Page option)
  firstHeaderContent: string;
  setFirstHeaderContent: React.Dispatch<React.SetStateAction<string>>;
  firstFooterContent: string;
  setFirstFooterContent: React.Dispatch<React.SetStateAction<string>>;

  // Keyboard Lock
  isKeyboardLocked: boolean;
  setIsKeyboardLocked: React.Dispatch<React.SetStateAction<boolean>>;

  // Selection Mode
  selectionMode: boolean;
  setSelectionMode: React.Dispatch<React.SetStateAction<boolean>>;
  hasActiveSelection: boolean;
  
  selectionAction: any | null;
  setSelectionAction: React.Dispatch<React.SetStateAction<any | null>>;
}

const EditorContext = createContext<EditorContextType | undefined>(undefined);

export const EditorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [documentTitle, setDocumentTitle] = useState("Untitled Document");
  const [creationDate] = useState(() => new Date());
  const [lastModified, setLastModified] = useState(() => new Date());
  const [wordCount, setWordCount] = useState(0);
  const [zoom, setZoom] = useState(100);
  const [viewMode, setViewMode] = useState<ViewMode>('print'); // 'print' acts as our main view now
  const [pageMovement, setPageMovement] = useState<PageMovement>('vertical');
  const [showRuler, setShowRuler] = useState(true);
  const [showFormattingMarks, setShowFormattingMarks] = useState(false);
  const [activeElementType, setActiveElementType] = useState<ActiveElementType>('text');
  const [showPageSetup, setShowPageSetup] = useState(false);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [showCopilot, setShowCopilot] = useState(false);
  const [aiState, setAiState] = useState<'idle' | 'thinking' | 'writing'>('idle');
  
  const [activeEditingArea, setActiveEditingArea] = useState<EditingArea>('body');
  
  // Default Header/Footer content
  const [headerContent, setHeaderContent] = useState('<p style="color:#94a3b8">Header</p>');
  const [footerContent, setFooterContent] = useState('<p style="color:#94a3b8">Footer - [Page <span class="page-number-placeholder">1</span>]</p>');
  
  // First Page Header/Footer content
  const [firstHeaderContent, setFirstHeaderContent] = useState('<p style="color:#94a3b8">First Page Header</p>');
  const [firstFooterContent, setFirstFooterContent] = useState('<p style="color:#94a3b8">First Page Footer</p>');
  
  const [isKeyboardLocked, setIsKeyboardLocked] = useState(false);
  const [selectionMode, setSelectionMode] = useState(false);
  const [hasActiveSelection, setHasActiveSelection] = useState(false);
  const [selectionAction, setSelectionAction] = useState<any | null>(null);

  const [pageConfig, setPageConfig] = useState<PageConfig>({
    size: 'Letter',
    orientation: 'portrait',
    marginPreset: 'normal',
    margins: MARGIN_PRESETS.normal,
    background: 'none',
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

  const editorRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const { saveStatus, triggerAutoSave, manualSave } = useAutoSave();

  // --- TipTap Initialization ---
  const editor = useTipTapEditor({
    extensions: [
      StarterKit,
      Image.configure({ inline: true, allowBase64: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      Underline,
      Link.configure({ openOnClick: false }),
      Table.configure({ resizable: true }),
      TableRow,
      TableHeader,
      TableCell,
      Placeholder.configure({ placeholder: 'Start typing...' }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      PageBreakExtension,
    ],
    content: DEFAULT_CONTENT,
    onUpdate: ({ editor }) => {
      setWordCount(editor.storage.characterCount?.words?.() || 0);
      setLastModified(new Date());
      triggerAutoSave();
    },
    onSelectionUpdate: ({ editor }) => {
        setHasActiveSelection(!editor.state.selection.empty);
        if (editor.isActive('table')) setActiveElementType('table');
        else if (editor.isActive('image')) setActiveElementType('image');
        else setActiveElementType('text');
    }
  });

  const setContent = useCallback((content: string, emitUpdate = true) => {
    if (editor && emitUpdate) {
        editor.commands.setContent(content);
    }
  }, [editor]);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (!editor) return;

    editor.chain().focus();

    switch (command) {
        case 'bold': editor.chain().focus().toggleBold().run(); break;
        case 'italic': editor.chain().focus().toggleItalic().run(); break;
        case 'underline': editor.chain().focus().toggleUnderline().run(); break;
        case 'strikeThrough': editor.chain().focus().toggleStrike().run(); break;
        case 'justifyLeft': editor.chain().focus().setTextAlign('left').run(); break;
        case 'justifyCenter': editor.chain().focus().setTextAlign('center').run(); break;
        case 'justifyRight': editor.chain().focus().setTextAlign('right').run(); break;
        case 'justifyFull': editor.chain().focus().setTextAlign('justify').run(); break;
        case 'insertUnorderedList': editor.chain().focus().toggleBulletList().run(); break;
        case 'insertOrderedList': editor.chain().focus().toggleOrderedList().run(); break;
        case 'formatBlock': 
            if (value === 'P') editor.chain().focus().setParagraph().run();
            else if (value?.startsWith('H')) editor.chain().focus().toggleHeading({ level: parseInt(value.charAt(1)) as any }).run();
            else if (value === 'BLOCKQUOTE') editor.chain().focus().toggleBlockquote().run();
            break;
        case 'insertImage': editor.chain().focus().setImage({ src: value! }).run(); break;
        case 'createLink': editor.chain().focus().setLink({ href: value! }).run(); break;
        case 'undo': editor.chain().focus().undo().run(); break;
        case 'redo': editor.chain().focus().redo().run(); break;
        case 'foreColor': editor.chain().focus().setColor(value!).run(); break;
        case 'hiliteColor': 
            if (value === 'transparent') editor.chain().focus().unsetHighlight().run();
            else editor.chain().focus().toggleHighlight({ color: value }).run(); 
            break;
        case 'insertHTML': editor.chain().focus().insertContent(value!).run(); break;
        case 'insertText': editor.chain().focus().insertContent(value!).run(); break;
        case 'selectAll': editor.chain().focus().selectAll().run(); break;
        case 'removeFormat': editor.chain().focus().unsetAllMarks().clearNodes().run(); break;
        case 'zoomReset': setZoom(100); break;
        case 'fitPage': setZoom(75); break;
        case 'fitWidth': setZoom(120); break;
        case 'save': manualSave(); break;
        case 'pageBreak': editor.chain().focus().setPageBreak().run(); break;
        case 'cut': 
            document.execCommand('cut');
            break;
        case 'copy':
             document.execCommand('copy');
             break;
        case 'formatPainter':
             // Placeholder for format painter state logic
             break;
        default: console.warn(`Command ${command} not implemented in TipTap mapping`);
    }
  }, [editor, manualSave]);

  // Legacy style compatibility functions
  const applyAdvancedStyle = (styles: React.CSSProperties) => {
      // Basic implementation for demo
      // In a real TipTap integration, this would map CSS to extension attributes
  };

  const applyBlockStyle = (styles: React.CSSProperties) => {
     // Placeholder
  };
  
  const handlePasteSpecial = async () => {}; // TipTap handles paste

  const pageDimensions = { width: 816, height: 1056 }; // Default Letter
  
  const contextValue = {
    editor,
    content: editor?.getHTML() || '',
    setContent,
    undo: () => editor?.chain().focus().undo().run(),
    redo: () => editor?.chain().focus().redo().run(),
    canUndo: editor?.can().undo() || false,
    canRedo: editor?.can().redo() || false,
    wordCount,
    zoom,
    setZoom,
    viewMode,
    setViewMode,
    pageMovement,
    setPageMovement,
    readConfig,
    setReadConfig,
    saveStatus,
    executeCommand,
    editorRef,
    pageConfig,
    setPageConfig,
    showPageSetup,
    setShowPageSetup,
    pageDimensions,
    registerContainer: (node: HTMLDivElement | null) => { containerRef.current = node; },
    showRuler,
    setShowRuler,
    documentTitle,
    setDocumentTitle,
    lastModified,
    setLastModified,
    creationDate,
    showFormattingMarks,
    setShowFormattingMarks,
    customStyles: [],
    addCustomStyle: () => {},
    applyCustomStyle: () => {},
    applyAdvancedStyle,
    applyBlockStyle,
    handlePasteSpecial,
    activeElementType,
    currentPage,
    setCurrentPage,
    totalPages,
    setTotalPages,
    showCopilot,
    setShowCopilot,
    aiState,
    setAiState,
    isAIProcessing: aiState !== 'idle',
    setIsAIProcessing: (v: boolean) => setAiState(v ? 'thinking' : 'idle'),
    activeEditingArea,
    setActiveEditingArea,
    headerContent,
    setHeaderContent,
    footerContent,
    setFooterContent,
    firstHeaderContent,
    setFirstHeaderContent,
    firstFooterContent,
    setFirstFooterContent,
    isKeyboardLocked,
    setIsKeyboardLocked,
    selectionMode,
    setSelectionMode,
    hasActiveSelection,
    selectionAction,
    setSelectionAction
  };

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
