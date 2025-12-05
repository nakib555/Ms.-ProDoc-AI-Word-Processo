
import { PageConfig } from '../types';
import { PAGE_SIZES } from '../constants';

// Standard print DPI
const DPI = 96;

// Result now includes config per page
export interface PaginatorResult {
    pages: { html: string, config: PageConfig }[];
    pageHeight: number; // Kept for compatibility, represents first page
    pageWidth: number; // Kept for compatibility, represents first page
}

/**
 * PageFrame: Defines the constraints of a page layout.
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
    
    // Handle custom sizes or presets
    let baseW = base.width;
    let baseH = base.height;
    if (config.size === 'Custom' && config.customWidth && config.customHeight) {
        baseW = config.customWidth * DPI;
        baseH = config.customHeight * DPI;
    }

    if (config.orientation === 'portrait') {
        this.width = baseW;
        this.height = baseH;
    } else {
        this.width = baseH;
        this.height = baseW;
    }

    const headerDistPx = (config.headerDistance || 0) * DPI;
    const footerDistPx = (config.footerDistance || 0) * DPI;

    this.marginTop = Math.max(config.margins.top * DPI, headerDistPx);
    this.marginBottom = Math.max(config.margins.bottom * DPI, footerDistPx);
    
    this.marginLeft = config.margins.left * DPI;
    this.marginRight = config.margins.right * DPI;

    const gutterPx = (config.margins.gutter || 0) * DPI;
    if (config.gutterPosition === 'top') {
      this.marginTop += gutterPx;
    } else {
      this.marginLeft += gutterPx;
    }

    // Precision calculation for body dimensions
    this.bodyWidth = Math.max(0, this.width - (this.marginLeft + this.marginRight));
    this.bodyHeight = Math.max(0, this.height - (this.marginTop + this.marginBottom));
  }
}

/**
 * LayoutSandbox: An off-screen DOM environment for measuring content.
 */
class LayoutSandbox {
  el: HTMLElement;

  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'prodoc-editor'; 
    // EXACT match of editor CSS to ensure 1:1 measurement
    this.el.style.position = 'absolute';
    this.el.style.visibility = 'hidden';
    this.el.style.height = 'auto';
    this.el.style.top = '-10000px';
    this.el.style.left = '-10000px';
    this.el.style.padding = '0';
    this.el.style.margin = '0';
    // Font styles must match EditorPage styles
    this.el.style.fontFamily = 'Calibri, Inter, sans-serif';
    this.el.style.fontSize = '11pt';
    this.el.style.lineHeight = '1.5';
    this.el.style.color = '#000000';
    this.el.style.wordWrap = 'break-word';
    this.el.style.overflowWrap = 'break-word';
    this.el.style.whiteSpace = 'pre-wrap';
    this.el.style.boxSizing = 'border-box';
    
    document.body.appendChild(this.el);
  }

  setWidth(width: number) {
      this.el.style.width = `${width}px`;
  }

  measure(node: Node): number {
    this.el.innerHTML = '';
    this.el.appendChild(node.cloneNode(true));
    return this.el.getBoundingClientRect().height;
  }

  destroy() {
    if (this.el.parentNode) {
      this.el.parentNode.removeChild(this.el);
    }
  }
}

const isAtomic = (node: Node): boolean => {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const el = node as HTMLElement;
    return ['IMG', 'VIDEO', 'IFRAME', 'HR', 'MATH-FIELD', 'TR'].includes(el.tagName) ||
           el.classList.contains('equation-wrapper') ||
           el.classList.contains('prodoc-page-break') ||
           el.classList.contains('prodoc-section-break');
};

const splitBlock = (
    originalNode: HTMLElement, 
    remainingHeight: number, 
    sandbox: LayoutSandbox
): { keep: HTMLElement | null, move: HTMLElement | null } => {
    
    if (isAtomic(originalNode)) {
        return { keep: null, move: originalNode.cloneNode(true) as HTMLElement };
    }

    sandbox.el.innerHTML = '';
    const keepNode = originalNode.cloneNode(false) as HTMLElement;
    sandbox.el.appendChild(keepNode);
    const moveNode = originalNode.cloneNode(false) as HTMLElement;

    const findBinarySplitIndex = (text: string, parent: HTMLElement): number => {
        let low = 0;
        let high = text.length;
        let best = 0;
        
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const sub = text.substring(0, mid);
            const tempNode = document.createTextNode(sub);
            parent.appendChild(tempNode);
            
            const h = keepNode.getBoundingClientRect().height;
            parent.removeChild(tempNode);
            
            if (h <= remainingHeight) {
                best = mid;
                low = mid + 1;
            } else {
                high = mid - 1;
            }
        }
        return best;
    };

    const moveSiblings = (nodes: Node[], startIdx: number, target: HTMLElement) => {
        for (let i = startIdx; i < nodes.length; i++) {
            target.appendChild(nodes[i].cloneNode(true));
        }
    };

    const processNodes = (nodes: Node[], parentKeep: HTMLElement, parentMove: HTMLElement): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            const child = nodes[i];
            const childClone = child.cloneNode(true);
            parentKeep.appendChild(childClone);
            
            const currentHeight = keepNode.getBoundingClientRect().height;
            
            if (currentHeight <= remainingHeight) {
                continue;
            }
            
            parentKeep.removeChild(childClone);
            
            if (isAtomic(child)) {
                parentMove.appendChild(child.cloneNode(true));
                moveSiblings(nodes, i + 1, parentMove);
                return true;
            }
            
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent || '';
                const splitIndex = findBinarySplitIndex(text, parentKeep);
                
                if (splitIndex > 0) {
                    parentKeep.appendChild(document.createTextNode(text.substring(0, splitIndex)));
                }
                const remainder = text.substring(splitIndex);
                if (remainder || splitIndex === 0) {
                    parentMove.appendChild(document.createTextNode(remainder));
                }
                
                moveSiblings(nodes, i + 1, parentMove);
                return true;
            }
            
            if (child.nodeType === Node.ELEMENT_NODE) {
                const el = child as HTMLElement;
                const childKeep = el.cloneNode(false) as HTMLElement;
                const childMove = el.cloneNode(false) as HTMLElement;
                
                parentKeep.appendChild(childKeep);
                
                if (keepNode.getBoundingClientRect().height > remainingHeight) {
                    parentKeep.removeChild(childKeep);
                    parentMove.appendChild(el.cloneNode(true));
                    moveSiblings(nodes, i + 1, parentMove);
                    return true;
                }
                
                const childNodes = Array.from(el.childNodes);
                const didSplitInside = processNodes(childNodes, childKeep, childMove);
                
                parentMove.appendChild(childMove);
                
                if (didSplitInside) {
                    moveSiblings(nodes, i + 1, parentMove);
                    return true;
                }
            }
        }
        return false;
    };

    const originalChildren = Array.from(originalNode.childNodes);
    processNodes(originalChildren, keepNode, moveNode);

    if (!keepNode.hasChildNodes() && moveNode.hasChildNodes()) {
        return { keep: null, move: moveNode };
    }

    return { keep: keepNode, move: moveNode };
};

export const paginateContent = (html: string, initialConfig: PageConfig): PaginatorResult => {
  const initialFrame = new PageFrame(initialConfig);

  if (typeof document === 'undefined') {
    return { pages: [{ html, config: initialConfig }], pageHeight: initialFrame.height, pageWidth: initialFrame.width };
  }

  const sandbox = new LayoutSandbox();
  const pages: { html: string, config: PageConfig }[] = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const nodes: HTMLElement[] = [];
  Array.from(body.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE) {
          if (node.textContent && (node.textContent.trim() || node.textContent.includes('\n'))) {
              const p = document.createElement('p');
              p.appendChild(node.cloneNode(true));
              nodes.push(p);
          }
      } else if (node.nodeType === Node.ELEMENT_NODE) {
          nodes.push(node.cloneNode(true) as HTMLElement);
      }
  });

  let currentConfig = { ...initialConfig };
  let currentFrame = new PageFrame(currentConfig);
  sandbox.setWidth(currentFrame.bodyWidth);

  let currentPageNodes: HTMLElement[] = [];
  let currentH = 0;

  const flushPage = () => {
      const div = document.createElement('div');
      currentPageNodes.forEach(n => div.appendChild(n));
      pages.push({ html: div.innerHTML, config: { ...currentConfig } });
      currentPageNodes = [];
      currentH = 0;
  };

  for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];

      // Handle Section Break (Changes Layout)
      if (node.classList?.contains('prodoc-section-break')) {
          const configData = node.getAttribute('data-config');
          if (configData) {
              try {
                  const newSettings = JSON.parse(decodeURIComponent(configData));
                  // Update config
                  currentConfig = { ...currentConfig, ...newSettings };
                  // Recalculate frame
                  currentFrame = new PageFrame(currentConfig);
                  sandbox.setWidth(currentFrame.bodyWidth);
              } catch (e) {
                  console.error("Failed to parse section break config", e);
              }
          }
          
          currentPageNodes.push(node);
          flushPage(); // Force new page for section break
          continue;
      }

      // Handle Page Break
      const isPageBreak = node.classList?.contains('prodoc-page-break') || 
                          node.style?.pageBreakAfter === 'always' ||
                          node.style?.breakAfter === 'page';

      if (isPageBreak) {
          currentPageNodes.push(node);
          flushPage(); 
          continue; 
      }

      // Measure
      const nodeH = sandbox.measure(node);

      // Margin of error for float precision
      if (currentH + nodeH > currentFrame.bodyHeight + 1) {
          const remainingSpace = Math.max(0, currentFrame.bodyHeight - currentH);
          
          const split = splitBlock(node, remainingSpace, sandbox);

          if (split.keep && split.keep.hasChildNodes()) {
              currentPageNodes.push(split.keep);
              flushPage(); 
              
              if (split.move && split.move.hasChildNodes()) {
                  nodes[i] = split.move;
                  i--; 
              }
          } else {
              if (currentPageNodes.length > 0) {
                  flushPage();
                  i--; 
              } else {
                  // If the element itself is larger than the page, put it here anyway to avoid infinite loop
                  currentPageNodes.push(node);
                  flushPage();
              }
          }
      } else {
          currentPageNodes.push(node);
          currentH += nodeH;
      }
  }

  if (currentPageNodes.length > 0) {
      flushPage();
  }

  if (pages.length === 0) {
      pages.push({ html: '<p><br></p>', config: initialConfig });
  }

  sandbox.destroy();

  return {
      pages,
      pageHeight: initialFrame.height, // Initial height reference
      pageWidth: initialFrame.width    // Initial width reference
  };
};
