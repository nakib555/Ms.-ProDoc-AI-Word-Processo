import React from 'react';

declare module 'react' {
  namespace JSX {
    interface IntrinsicElements {
      'math-field': React.DetailedHTMLProps<React.HTMLAttributes<HTMLElement>, HTMLElement> & {
        'read-only'?: boolean;
        placeholder?: string;
      };
    }
  }
}

export interface DocumentState {
  content: string;
  wordCount: number;
  charCount: number;
  lastSaved: Date | null;
  zoom: number;
  isSaved: boolean;
}

export interface EditorConfig {
  fontFamily: string;
  fontSize: string;
  bold: boolean;
  italic: boolean;
  underline: boolean;
  alignment: 'justifyLeft' | 'justifyCenter' | 'justifyRight' | 'justifyFull';
}

export enum RibbonTab {
  FILE = 'File',
  HOME = 'Home',
  INSERT = 'Insert',
  DRAW = 'Draw',
  DESIGN = 'Design',
  LAYOUT = 'Layout',
  REFERENCES = 'References',
  MAILINGS = 'Mailings',
  REVIEW = 'Review',
  VIEW = 'View',
  AI_ASSISTANT = '🤖 AI Assistant',
  // Contextual Tabs
  TABLE_DESIGN = 'Table Design',
  TABLE_LAYOUT = 'Table Layout',
  EQUATION = 'Equation'
}

export interface AIResponse {
  text: string;
  error?: string;
}

export type AIOperation = 
  | 'summarize' 
  | 'fix_grammar' 
  | 'make_professional' 
  | 'expand' 
  | 'shorten'
  | 'simplify'
  | 'tone_friendly'
  | 'tone_confident'
  | 'tone_casual'
  | 'continue_writing'
  | 'generate_content'
  | 'translate_es'
  | 'translate_fr'
  | 'translate_de'
  | 'generate_outline';

export type ViewMode = 'print' | 'web' | 'read';

export type SaveStatus = 'saved' | 'saving' | 'unsaved';

export type PageSize = 'Letter' | 'Legal' | 'Executive' | 'A3' | 'A4' | 'A5' | 'B4 (JIS)' | 'B5 (JIS)' | 'Statement' | 'Tabloid' | 'Note' | 'Envelope #10' | 'Envelope DL' | 'Custom';
export type PageOrientation = 'portrait' | 'landscape';
export type PageBackground = 'none' | 'ruled' | 'grid';
export type VerticalAlignment = 'top' | 'center' | 'justify' | 'bottom';
export type MultiplePagesType = 'normal' | 'mirrorMargins' | 'twoPagesPerSheet' | 'bookFold';
export type ApplyToType = 'wholeDocument' | 'thisSection' | 'thisPointForward';
export type SheetsPerBookletType = 'all' | '16' | '8' | '4' | '2';

export type MarginPreset = 'normal' | 'narrow' | 'moderate' | 'wide' | 'mirrored' | 'office2003' | 'custom';

export interface MarginValues {
  top: number;    // inches
  bottom: number; // inches
  left: number;   // inches (or Inside if mirrored)
  right: number;  // inches (or Outside if mirrored)
  gutter: number; // inches
}

export interface PageConfig {
  size: PageSize;
  orientation: PageOrientation;
  margins: MarginValues;      // The explicit numeric values
  marginPreset: MarginPreset; // The active preset name
  background: PageBackground;
  pageColor?: string;
  watermark?: string;
  
  // Advanced Layout - Page Setup Dialog
  headerDistance: number; // inches from edge
  footerDistance: number; // inches from edge
  verticalAlign: VerticalAlignment;
  customWidth?: number; // For custom size
  customHeight?: number; // For custom size
  gutterPosition?: 'left' | 'top';
  sectionStart?: 'newpage' | 'continuous' | 'even' | 'odd';
  differentOddEven?: boolean;
  differentFirstPage?: boolean;
  multiplePages?: MultiplePagesType; // MS Word style page layout
  mirrorMargins?: boolean; // Legacy helper, derived from multiplePages usually
  applyTo?: ApplyToType;
  sheetsPerBooklet?: SheetsPerBookletType;
  
  // Paper Source
  paperSourceFirstPage?: string;
  paperSourceOtherPages?: string;
}

export interface CustomStyle {
  id: string;
  name: string;
  styles: React.CSSProperties;
  tagName: string; // e.g., 'SPAN', 'P', 'H1'
}

export interface PaginatorResult {
  pages: string[];
  pageHeight: number;
  pageWidth: number;
}

export interface ReadModeConfig {
  theme: 'light' | 'sepia' | 'dark';
  columns: 1 | 2;
  textScale: number; // 1 is default (100%)
}

export type ActiveElementType = 'text' | 'table' | 'image' | 'equation' | 'none';