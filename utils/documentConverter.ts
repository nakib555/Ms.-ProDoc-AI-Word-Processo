
import { PageConfig } from '../types';
import { ptToPx } from './textUtils';

// Helper to convert camelCase to kebab-case
const camelToKebab = (str: string) => str.replace(/[A-Z]/g, letter => `-${letter.toLowerCase()}`);

// Helper to resolve numeric font sizes specifically (Numbers = Points -> Pixels)
const resolveFontSize = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number') {
        // Assume number input for font size is Points (PT), convert to PX
        const px = ptToPx(val);
        // Round to 2 decimals for cleaner CSS
        return `${parseFloat(px.toFixed(2))}px`;
    }
    return val;
};

// Helper to resolve units (numbers become px, strings stay as is)
const resolveUnit = (val: string | number | undefined | null): string => {
    if (val === undefined || val === null) return '';
    if (typeof val === 'number') return `${val}px`;
    return val;
};

// Helper to convert style objects to CSS string
const styleToString = (style: any): string => {
  if (!style) return '';
  return Object.entries(style).map(([k, v]) => {
    const key = camelToKebab(k);
    
    // Special handling for font-size to convert PT to PX if it's a raw number
    if (key.includes('font-size') && typeof v === 'number') {
        return `${key}: ${resolveFontSize(v)}`;
    }

    // Add units if missing for common numeric properties
    const val = (typeof v === 'number' && ['width', 'height', 'margin', 'padding', 'border-width', 'top', 'bottom', 'left', 'right', 'spacing', 'letter-spacing', 'indent'].some(p => key.includes(p))) 
      ? `${v}px` 
      : v;
    
    // Handle boolean styles
    if (v === true) {
        if (key === 'bold') return 'font-weight: bold';
        if (key === 'italic') return 'font-style: italic';
    }
    
    return `${key}: ${val}`;
  }).join('; ');
};

const resolveBorders = (borders: any): string => {
  if (!borders) return '';
  const css: string[] = [];
  ['top', 'bottom', 'left', 'right'].forEach(side => {
    const b = borders[side];
    if (b) {
      const width = resolveUnit(b.width || 1);
      const style = b.style || 'solid';
      const color = b.color || '#000000';
      css.push(`border-${side}: ${width} ${style} ${color}`);
    }
  });
  return css.join('; ');
};

const resolvePadding = (padding: any): string => {
    if (!padding) return '';
    if (typeof padding === 'number' || typeof padding === 'string') return `padding: ${resolveUnit(padding)}`;
    const top = resolveUnit(padding.top || 0);
    const right = resolveUnit(padding.right || 0);
    const bottom = resolveUnit(padding.bottom || 0);
    const left = resolveUnit(padding.left || 0);
    return `padding: ${top} ${right} ${bottom} ${left}`;
};

const resolveIndent = (indent: any): string => {
    if (!indent) return '';
    const css: string[] = [];
    if (indent.left) css.push(`margin-left: ${resolveUnit(indent.left)}`);
    if (indent.right) css.push(`margin-right: ${resolveUnit(indent.right)}`);
    if (indent.firstLine) css.push(`text-indent: ${resolveUnit(indent.firstLine)}`);
    return css.join('; ');
};

const renderInlineContent = (contentItems: any): string => {
  if (!contentItems) return '';
  
  if (typeof contentItems === 'string') return contentItems;

  if (!Array.isArray(contentItems)) {
      contentItems = [contentItems];
  }
  
  return contentItems.map((item: any) => {
    if (typeof item === 'string') return item;

    if (item.type === 'field') {
       const text = item.code === 'PAGE_NUMBER' ? '#' : 
                    item.code === 'TOTAL_PAGES' ? '##' : 
                    item.code === 'CURRENT_DATE' ? new Date().toLocaleDateString() : 
                    `[${item.code}]`;
       return `<span class="prodoc-field" data-field-code="${item.code}" style="background:#f1f5f9; border-radius:2px; padding:0 2px; color:#64748b; font-size:0.9em;">${text}</span>`;
    }

    if (item.type === 'image') {
        return `<img src="${item.src}" alt="${item.alt || ''}" style="display:inline-block; vertical-align:middle; ${styleToString(item.style)}" />`;
    }

    let text = item.text || '';
    
    // Skip empty text unless it has styles (like a spacer) or is a specific type
    if (!text && !item.type) return '';

    // Apply inline styles
    const styles: string[] = [];
    if (item.bold) styles.push('font-weight: bold');
    if (item.italic) styles.push('font-style: italic');
    
    const decorations = [];
    if (item.underline) {
        if (item.underline === 'wavy') styles.push('text-decoration-style: wavy');
        decorations.push('underline');
    }
    if (item.strikethrough) {
        if (item.strikethrough === 'double') {
             styles.push('text-decoration-style: double');
        }
        decorations.push('line-through');
    }
    
    if (decorations.length > 0) styles.push(`text-decoration-line: ${decorations.join(' ')}`);
    if (item.underlineColor) styles.push(`text-decoration-color: ${item.underlineColor}`);

    if (item.color) styles.push(`color: ${item.color}`);
    if (item.highlight) styles.push(`background-color: ${item.highlight}`);
    if (item.fontFamily) styles.push(`font-family: "${item.fontFamily}"`);
    
    // Use special resolution for font size
    if (item.fontSize) styles.push(`font-size: ${resolveFontSize(item.fontSize)}`);
    
    if (item.letterSpacing) styles.push(`letter-spacing: ${resolveUnit(item.letterSpacing)}`);
    if (item.textShadow) styles.push(`text-shadow: ${item.textShadow}`);
    
    // Merge explicit style object
    if (item.style) styles.push(styleToString(item.style));

    let contentHtml = text;

    if (item.subscript) return `<sub style="${styles.join('; ')}">${text}</sub>`;
    if (item.superscript) return `<sup style="${styles.join('; ')}">${text}</sup>`;
    
    if (item.link) {
       contentHtml = `<a href="${item.link}" style="color: ${item.color || '#2563eb'}; text-decoration: underline; ${styles.join('; ')}">${contentHtml}</a>`;
    } else if (styles.length > 0) {
       contentHtml = `<span style="${styles.join('; ')}">${contentHtml}</span>`;
    }

    return contentHtml;
  }).join('');
};

export const renderBlock = (block: any): string => {
    const baseStyle = block.style || {};
    let cssStr = styleToString(baseStyle);
    
    // Advanced Paragraph Styling
    if (block.paragraphStyle) {
        const ps = block.paragraphStyle;
        const paraCss = [];
        if (ps.alignment) paraCss.push(`text-align: ${ps.alignment}`);
        if (ps.spacingBefore) paraCss.push(`margin-top: ${resolveUnit(ps.spacingBefore)}`);
        if (ps.spacingAfter) paraCss.push(`margin-bottom: ${resolveUnit(ps.spacingAfter)}`);
        if (ps.lineSpacing) paraCss.push(`line-height: ${ps.lineSpacing}`);
        if (ps.indent) paraCss.push(resolveIndent(ps.indent));
        if (ps.padding) paraCss.push(resolvePadding(ps.padding));
        if (ps.borders) paraCss.push(resolveBorders(ps.borders));
        if (ps.backgroundColor) paraCss.push(`background-color: ${ps.backgroundColor}`);
        
        cssStr += '; ' + paraCss.join('; ');
    }

    // Sanitize positioning to avoid layout breaks in editor flow
    if (['heading', 'paragraph', 'list', 'code', 'equation', 'blockquote'].includes(block.type)) {
        if (cssStr.includes('position: absolute') || cssStr.includes('position: fixed')) {
            cssStr = cssStr.replace(/position:\s*(absolute|fixed);?/g, '');
            cssStr = cssStr.replace(/(top|left|right|bottom):\s*[^;]+;?/g, '');
        }
    }

    switch (block.type) {
        case 'heading':
            const level = Math.min(Math.max(block.level || 1, 1), 6);
            return `<h${level} id="${block.id || ''}" style="${cssStr}">${renderInlineContent(block.content)}</h${level}>`;
        
        case 'paragraph':
            return `<p style="${cssStr}">${renderInlineContent(block.content)}</p>`;
            
        case 'image':
            return `<div style="text-align: center; margin: 1em 0;">
                <img src="${block.src}" alt="${block.alt || ''}" style="${styleToString(block.style)}" />
            </div>`;
            
        case 'code':
            // Using pre/code structure for syntax highlighting compatibility
            return `<pre style="background-color: #1e293b; color: #e2e8f0; padding: 1em; border-radius: 4px; overflow-x: auto; font-family: monospace; ${cssStr}"><code class="language-${block.language || 'text'}">${typeof block.content === 'string' ? block.content : renderInlineContent(block.content)}</code></pre>`;
            
        case 'equation':
             // Editor uses MathLive components
             return `<div style="text-align: center; ${cssStr}"><span class="equation-wrapper" contenteditable="false"><span class="equation-handle">⋮⋮</span><math-field>${block.latex}</math-field><span class="equation-dropdown">▼</span></span></div>`;
             
        case 'list':
            const tag = block.listType === 'ordered' ? 'ol' : 'ul';
            let listStyle = cssStr;
            
            // Support for custom marker styles (e.g., decimal, upper-roman, square)
            if (block.markerStyle) {
                // If markerStyle is explicitly provided, use it. 
                // If it's ordered and no style provided, default to decimal. 
                listStyle += `; list-style-type: ${block.markerStyle}`;
            } else if (block.listType === 'ordered') {
                listStyle += `; list-style-type: decimal`;
            } else {
                listStyle += `; list-style-type: disc`;
            }
            
            let itemsHtml = '';
            if (block.items && Array.isArray(block.items)) {
                itemsHtml = block.items.map((item: any) => {
                    let content = '';
                    let subItems = '';
                    
                    if (typeof item === 'string') {
                        content = item;
                    } else {
                        content = renderInlineContent(item.content || item);
                        if (item.subItems) {
                             // Recursive rendering for nested lists
                             if (item.subItems.type === 'list') {
                                 subItems = renderBlock(item.subItems);
                             } else if (Array.isArray(item.subItems)) {
                                 // If subItems is just an array of items, wrap it in a list of same type (or default)
                                 subItems = renderBlock({ type: 'list', listType: block.listType, items: item.subItems });
                             }
                        }
                    }
                    return `<li>${content}${subItems}</li>`;
                }).join('');
            }
            return `<${tag} style="${listStyle}">${itemsHtml}</${tag}>`;
            
        case 'table':
            let colGroup = '';
            if (block.config && block.config.columnWidths) {
                colGroup = `<colgroup>${block.config.columnWidths.map((w: string) => `<col style="width:${w}">`).join('')}</colgroup>`;
            }
            
            let rowsHtml = '';
            if (block.rows) {
                block.rows.forEach((row: any, rIndex: number) => {
                    let cellsHtml = '';
                    if (row.cells) {
                        row.cells.forEach((cell: any) => {
                            // Merge specific cell styles with table defaults
                            const cellStyleObj = {
                                padding: '8px',
                                border: `1px solid ${block.config?.borderColor || '#cbd5e1'}`,
                                textAlign: 'left',
                                verticalAlign: 'top',
                                backgroundColor: block.config?.hasHeaderRow && rIndex === 0 ? '#f1f5f9' : (block.config?.bandedRows && rIndex % 2 === 0 ? '#f8fafc' : 'transparent'),
                                ...(cell.style || {})
                            };
                            
                            const cellStyle = styleToString(cellStyleObj);
                            const content = renderInlineContent(cell.content);
                            const attrs = [];
                            if (cell.colSpan) attrs.push(`colspan="${cell.colSpan}"`);
                            if (cell.rowSpan) attrs.push(`rowspan="${cell.rowSpan}"`);
                            
                            const cellTag = (block.config?.hasHeaderRow && rIndex === 0) ? 'th' : 'td';
                            
                            cellsHtml += `<${cellTag} ${attrs.join(' ')} style="${cellStyle}">${content}</${cellTag}>`;
                        });
                    }
                    rowsHtml += `<tr>${cellsHtml}</tr>`;
                });
            }
            
            // Default table styles if not overridden
            if (!cssStr.includes('border-collapse')) cssStr += '; border-collapse: collapse';
            if (!cssStr.includes('width')) cssStr += '; width: 100%';
            if (!cssStr.includes('margin')) cssStr += '; margin: 1em 0';
            
            return `<table style="${cssStr}">${colGroup}${rowsHtml}</table>`;
            
        case 'sectionBreak':
            const configJson = block.config ? encodeURIComponent(JSON.stringify(block.config)) : '';
            const breakLabel = block.config?.orientation ? `${block.config.orientation.toUpperCase()} Section` : 'Section Break';
            return `<div class="prodoc-section-break" data-config="${configJson}" style="page-break-before: always; border-top: 2px dashed #94a3b8; margin: 20px 0; padding-top: 5px; text-align: center; color: #64748b; font-size: 10px; user-select: none; font-family: sans-serif; background: repeating-linear-gradient(45deg, #f1f5f9, #f1f5f9 10px, #e2e8f0 10px, #e2e8f0 20px); opacity: 0.7;">--- ${breakLabel} ---</div>`;
        
        case 'pageBreak':
            return `<div class="prodoc-page-break" style="page-break-after: always; height: 0; width: 100%; display: block;"></div>`;

        default:
             if (block.content) {
                 // Fallback for generic or unknown blocks
                 return `<div style="${cssStr}">${renderInlineContent(block.content)}</div>`;
             }
             return '';
    }
};

export const jsonToHtml = (jsonData: any): string => {
  if (!jsonData) return '';
  if (typeof jsonData === 'string') return `<p>${jsonData}</p>`;

  let blocks: any[] = [];
  
  // Handle various root shapes that the AI might return
  if (jsonData.document && Array.isArray(jsonData.document.blocks)) {
      blocks = jsonData.document.blocks;
  } else if (jsonData.blocks && Array.isArray(jsonData.blocks)) {
      blocks = jsonData.blocks;
  } else if (Array.isArray(jsonData)) {
      blocks = jsonData;
  } else if (jsonData.type && (jsonData.content || jsonData.items || jsonData.rows)) {
      // Single block object
      blocks = [jsonData];
  } else if (jsonData.content && Array.isArray(jsonData.content)) {
      // Legacy format
      blocks = jsonData.content;
  } else {
      // Best effort fallback for flat data
      if (Object.keys(jsonData).length > 0) {
          const fallbackBlocks = [];
          if (jsonData.title) fallbackBlocks.push({type: 'heading', level: 1, content: [{text: jsonData.title}]});
          if (jsonData.summary) fallbackBlocks.push({type: 'paragraph', content: [{text: jsonData.summary}]});
          
          // If we found something structure-like, use it. Otherwise dump values.
          if (fallbackBlocks.length > 0) {
              return fallbackBlocks.map(renderBlock).join('');
          }
          
          const textValues = Object.values(jsonData).filter(v => typeof v === 'string');
          if (textValues.length > 0) return `<p>${textValues.join(' ')}</p>`;
      }
      return '';
  }

  return blocks.map(renderBlock).join('');
};
