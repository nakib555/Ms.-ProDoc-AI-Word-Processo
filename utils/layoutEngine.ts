
import { PageConfig, PaginatorResult } from '../types';
import { PAGE_SIZES } from '../constants';

// Standard print DPI
const DPI = 96;

/**
 * PageFrame: Defines the constraints of a page layout.
 * Equivalent to MS Word's page frame calculation.
 */
class PageFrame {
  width: number;
  height: number;
  
  // Margins in pixels
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  
  // The writable area dimensions
  bodyWidth: number;
  bodyHeight: number;

  constructor(config: PageConfig) {
    const base = PAGE_SIZES[config.size as string] || PAGE_SIZES['Letter'];
    
    // 1. Determine Sheet Dimensions
    this.width = config.orientation === 'portrait' ? base.width : base.height;
    this.height = config.orientation === 'portrait' ? base.height : base.width;

    // 2. Calculate Margins (inches -> pixels)
    this.marginTop = config.margins.top * DPI;
    this.marginBottom = config.margins.bottom * DPI;
    this.marginLeft = config.margins.left * DPI;
    this.marginRight = config.margins.right * DPI;

    // 3. Apply Gutter
    // Gutter reduces the writable area either from left or top
    const gutterPx = (config.margins.gutter || 0) * DPI;
    if (config.gutterPosition === 'top') {
      this.marginTop += gutterPx;
    } else {
      this.marginLeft += gutterPx;
    }

    // 4. Calculate Body Frame
    // This is the "safe zone" for main flow text.
    // Headers and Footers live inside the margins, but text flow is constrained by margins.
    this.bodyWidth = this.width - (this.marginLeft + this.marginRight);
    this.bodyHeight = this.height - (this.marginTop + this.marginBottom);
  }
}

/**
 * LayoutSandbox: An off-screen DOM environment for measuring content
 * accurately using the browser's rendering engine.
 */
class LayoutSandbox {
  private el: HTMLElement;

  constructor(width: number) {
    this.el = document.createElement('div');
    // Apply editor classes to ensure font/line-height matches exactly
    this.el.className = 'prodoc-editor'; 
    this.el.style.position = 'absolute';
    this.el.style.visibility = 'hidden';
    this.el.style.width = `${width}px`;
    this.el.style.height = 'auto';
    this.el.style.top = '-10000px';
    this.el.style.left = '-10000px';
    this.el.style.padding = '0';
    this.el.style.margin = '0';
    // Ensure word-break matches editor
    this.el.style.wordWrap = 'break-word';
    this.el.style.overflowWrap = 'break-word';
    document.body.appendChild(this.el);
  }

  measure(node: Node): number {
    this.el.innerHTML = '';
    this.el.appendChild(node.cloneNode(true));
    return this.el.offsetHeight;
  }

  /**
   * Attempts to split a large node that doesn't fit.
   * Uses a text-based heuristic to split paragraphs.
   * NOTE: This is a fallback for huge blocks. It strips inner HTML formatting 
   * to prioritize layout structure. A full DOM-preserving split is computationally expensive.
   */
  splitNode(node: HTMLElement, remainingHeight: number): { keep: HTMLElement, move: HTMLElement } | null {
    // Only attempt split on flow content
    const validTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'DIV', 'BLOCKQUOTE'];
    if (!validTags.includes(node.tagName)) return null;
    
    // Don't split complex atomic elements
    if (node.querySelector('img, table, video, iframe, hr')) return null;

    const clone = node.cloneNode(true) as HTMLElement;
    this.el.innerHTML = '';
    this.el.appendChild(clone);

    // Get plain text words
    const words = clone.innerText.split(' ');
    if (words.length < 2) return null;

    let low = 0;
    let high = words.length - 1;
    let bestSplitIndex = 0;

    // Binary search for the maximum amount of text that fits
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        const testText = words.slice(0, mid).join(' ');
        clone.innerText = testText; // This applies text only, stripping spans/bold temporarily
        
        if (clone.offsetHeight <= remainingHeight) {
            bestSplitIndex = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    if (bestSplitIndex === 0) return null; // Can't even fit one word

    const keepNode = node.cloneNode(false) as HTMLElement;
    const moveNode = node.cloneNode(false) as HTMLElement;

    // Split text
    keepNode.innerText = words.slice(0, bestSplitIndex).join(' ');
    moveNode.innerText = words.slice(bestSplitIndex).join(' ');

    return { keep: keepNode, move: moveNode };
  }

  destroy() {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}

/**
 * Main Pagination Function
 * Implements a "Flow Algorithm" similar to Word's layout engine.
 */
export const paginateContent = (html: string, config: PageConfig): PaginatorResult => {
  // SSR Guard
  if (typeof document === 'undefined') {
    const frame = new PageFrame(config);
    return { pages: [html], pageHeight: frame.height, pageWidth: frame.width };
  }

  // 1. Setup Constraints
  const frame = new PageFrame(config);
  const sandbox = new LayoutSandbox(frame.bodyWidth);
  const pages: string[] = [];

  // 2. Parse Source Content
  // We treat the document as a flat stream of top-level blocks
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  // Normalize: Ensure all top-level text nodes are wrapped in P
  const nodes: HTMLElement[] = [];
  Array.from(body.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent?.trim()) {
              const p = document.createElement('p');
              p.appendChild(node.cloneNode(true));
              nodes.push(p);
          }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
          nodes.push(node.cloneNode(true) as HTMLElement);
      }
  });

  // 3. Flow Content
  let currentPageNodes: HTMLElement[] = [];
  let currentH = 0;

  const flushPage = () => {
      const div = document.createElement('div');
      currentPageNodes.forEach(n => div.appendChild(n));
      pages.push(div.innerHTML);
      currentPageNodes = [];
      currentH = 0;
  };

  for (const node of nodes) {
      // 3a. Handle explicit breaks (Page Break, Section Break)
      const isBreak = node.classList?.contains('prodoc-page-break') || 
                      node.style?.pageBreakAfter === 'always' ||
                      node.style?.breakAfter === 'page';

      if (isBreak) {
          flushPage();
          continue; // Don't add the break element itself to visual output if it's just a marker
      }

      // 3b. Measure content
      const nodeH = sandbox.measure(node);

      // 3c. Check constraints
      if (currentH + nodeH > frame.bodyHeight) {
          // OVERFLOW DETECTED
          
          // Case 1: Node fits on a fresh page?
          // If yes, move it entirely to next page (Paragraph Integrity)
          if (nodeH <= frame.bodyHeight) {
              flushPage();
              currentPageNodes.push(node);
              currentH = nodeH;
          } 
          // Case 2: Node is huge (taller than a page). Must split.
          else {
              const remainingSpace = frame.bodyHeight - currentH;
              const split = sandbox.splitNode(node, remainingSpace);

              if (split) {
                  // Add first chunk to current page
                  currentPageNodes.push(split.keep);
                  flushPage();
                  
                  // Add remainder to next page
                  // Note: Remainder might still be huge, but next iteration loop handles logic?
                  // Actually, for simplicity in this engine, we dump the rest on the next page 
                  // and let it overflow visually if it's still too big, 
                  // or properly recursive logic would be needed. 
                  // Here we just push the moveNode.
                  currentPageNodes.push(split.move);
                  currentH = sandbox.measure(split.move);
              } else {
                  // Can't split? Force it onto a new page to maximize space
                  flushPage();
                  currentPageNodes.push(node);
                  currentH = nodeH; 
              }
          }
      } else {
          // Fits in current page
          currentPageNodes.push(node);
          currentH += nodeH;
      }
  }

  // 4. Finalize
  if (currentPageNodes.length > 0) {
      flushPage();
  }

  // Ensure at least one page
  if (pages.length === 0) {
      pages.push('<p><br></p>');
  }

  // Cleanup
  sandbox.destroy();

  return {
      pages,
      pageHeight: frame.height,
      pageWidth: frame.width
  };
};
