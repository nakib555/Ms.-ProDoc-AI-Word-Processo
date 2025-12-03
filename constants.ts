
import { RibbonTab, MarginValues } from './types';

export const FONTS = [
  'Arial', 'Inter', 'Times New Roman', 'Courier New', 'Georgia', 'Verdana', 'Noto Serif'
];

export const FONT_SIZES = [
  '8', '9', '10', '11', '12', '14', '16', '18', '20', '24', '28', '32', '36', '48', '72'
];

export const TABS = [
  RibbonTab.FILE,
  RibbonTab.HOME,
  RibbonTab.INSERT,
  RibbonTab.DRAW,
  RibbonTab.DESIGN,
  RibbonTab.LAYOUT,
  RibbonTab.REFERENCES,
  RibbonTab.MAILINGS,
  RibbonTab.REVIEW,
  RibbonTab.VIEW,
  RibbonTab.AI_ASSISTANT
];

export const DEFAULT_CONTENT = `<p><br></p>`;

// Layout Constants
export const PAGE_MARGIN_PADDING = 24;
export const PAGE_SIZES: Record<string, { width: number, height: number }> = {
  'Letter': { width: 816, height: 1056 },
  'Legal': { width: 816, height: 1344 },
  'Executive': { width: 696, height: 1008 },
  'A3': { width: 1122, height: 1588 },
  'A4': { width: 794, height: 1122 },
  'A5': { width: 560, height: 794 },
  'B4 (JIS)': { width: 945, height: 1334 },
  'B5 (JIS)': { width: 665, height: 945 },
  'Statement': { width: 528, height: 816 },
  'Tabloid': { width: 1056, height: 1632 },
  'Note': { width: 816, height: 1056 },
  'Envelope #10': { width: 396, height: 912 },
  'Envelope DL': { width: 416, height: 831 },
};

export const MARGIN_PRESETS: Record<string, MarginValues> = {
  normal: { top: 1, bottom: 1, left: 1, right: 1, gutter: 0 },
  narrow: { top: 0.5, bottom: 0.5, left: 0.5, right: 0.5, gutter: 0 },
  moderate: { top: 1, bottom: 1, left: 0.75, right: 0.75, gutter: 0 },
  wide: { top: 1, bottom: 1, left: 2, right: 2, gutter: 0 },
  // Mirrored: Left becomes Inside, Right becomes Outside
  mirrored: { top: 1, bottom: 1, left: 1.25, right: 1, gutter: 0 }, 
  office2003: { top: 1, bottom: 1, left: 1.25, right: 1.25, gutter: 0 },
};