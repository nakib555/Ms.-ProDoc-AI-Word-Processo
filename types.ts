import React from 'react';

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
  TABLE_LAYOUT = 'Table Layout'
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

export type PageSize = 'A4' | 'Letter';
export type PageOrientation = 'portrait' | 'landscape';
export type PageMargins = 'normal' | 'narrow' | 'wide';
export type PageBackground = 'none' | 'ruled' | 'grid';

export interface PageConfig {
  size: PageSize;
  orientation: PageOrientation;
  margins: PageMargins;
  background: PageBackground;
  pageColor?: string;
  watermark?: string;
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

export type ActiveElementType = 'text' | 'table' | 'image' | 'none';