import { RibbonTab } from './types';

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

export const DEFAULT_CONTENT = `
<h1 style="text-align: center;">Welcome to ProDoc AI</h1>
<p>This is a modern, web-based rich text editor demonstrating the power of React and Tailwind CSS.</p>
<p><br></p>
<h3>Key Features:</h3>
<ul>
  <li><strong>Rich Text Editing:</strong> Format text with familiar tools.</li>
  <li><strong>Modern Interface:</strong> Ribbon-style toolbar and clean design.</li>
  <li><strong>AI Powered:</strong> Integrated Gemini AI for writing assistance.</li>
  <li><strong>Responsive:</strong> Works on desktop and tablets.</li>
</ul>
<p><br></p>
<p>Try selecting this text and using the <strong>AI Assistant</strong> tab to summarize or rewrite it!</p>
`;

// Layout Constants
export const PAGE_MARGIN_PADDING = 24;
export const PAGE_SIZES = {
  Letter: { width: 816, height: 1056 },
  A4: { width: 794, height: 1123 }
};