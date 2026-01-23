
import { PageConfig } from '../types';
import { PAGE_SIZES } from '../constants';

const DPI = 96;
const SAFETY_BUFFER = 15; 
const MIN_LINE_HEIGHT = 20;

export interface PaginatorResult {
    pages: { html: string, config: PageConfig }[];
    pageHeight: number;
    pageWidth: number;
}

class PageFrame {
  width: number;
  height: number;
  marginTop: number;
  marginBottom: number;
  marginLeft: number;
  marginRight: number;
  bodyWidth: number;
  bodyHeight: number;

  constructor(config: PageConfig) {
    const base = PAGE_SIZES[config.size as string] || PAGE_SIZES['Letter'];
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

    this.bodyWidth = Math.max(0, this.width - (this.marginLeft + this.marginRight));
    this.bodyHeight = Math.max(0, this.height - (this.marginTop + this.marginBottom));
  }
}

class LayoutSandbox {
  el: HTMLElement;
  constructor() {
    this.el = document.createElement('div');
    this.el.className = 'prodoc-editor text-lg leading-loose text-slate-900'; 
    this.el.style.position = 'absolute';
    this.el.style.visibility = 'hidden';
    this.el.style.height = 'auto';
    this.el.style.top = '-10000px';
    this.el.style.left = '-10000px';
    this.el.style.padding = '0';
    this.el.style.margin = '0';
    this.el.style.fontFamily = 'Calibri, Inter, sans-serif';
    this.el.style.wordWrap = 'break-word';
    this.el.style.overflowWrap = 'break-word';
    this.el.style.whiteSpace = 'pre-wrap';
    document.body.appendChild(this.el);
  }
  setWidth(width: number) { this.el.style.width = `${width}px`; }
  measure(node: Node): number {
    this.el.innerHTML = '';
    this.el.appendChild(node.cloneNode(true));
    return this.el.getBoundingClientRect().height;
  }
  destroy() { if (this.el.parentNode) this.el.parentNode.removeChild(this.el); }
}

const isAtomic = (node: Node): boolean => {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const el = node as HTMLElement;
    return ['IMG', 'VIDEO', 'IFRAME', 'HR', 'MATH-FIELD'].includes(el.tagName) ||
           el.classList.contains('equation-wrapper') ||
           el.classList.contains('prodoc-page-break') ||
           el.getAttribute('data-type') === 'page-break' ||
           el.classList.contains('prodoc-section-break');
};

// Check if a node contains a page break internally
const containsPageBreak = (node: Node): boolean => {
    if (node.nodeType !== Node.ELEMENT_NODE) return false;
    const el = node as HTMLElement;
    if (el.classList.contains('prodoc-page-break') || el.getAttribute('data-type') === 'page-break') return true;
    return !!el.querySelector('.prodoc-page-break, [data-type="page-break"]');
};

const splitBlock = (
    originalNode: HTMLElement, 
    remainingHeight: number, 
    sandbox: LayoutSandbox
): { keep: HTMLElement | null, move: HTMLElement | null } => {
    
    const effectiveLimit = Math.max(0, remainingHeight - SAFETY_BUFFER);

    // If it's a page break or explicit atomic, move it entirely if it's the break itself, 
    // but if it's a container with a break inside, we need deeper logic (handled by containsPageBreak check in paginate)
    if (isAtomic(originalNode)) {
        return { keep: null, move: originalNode.cloneNode(true) as HTMLElement };
    }

    if (originalNode.tagName === 'TABLE') {
        const table = originalNode as HTMLTableElement;
        const rows = Array.from(table.rows);
        const keepTable = table.cloneNode(false) as HTMLTableElement;
        const moveTable = table.cloneNode(false) as HTMLTableElement;
        sandbox.el.innerHTML = '';
        const measureTable = table.cloneNode(false) as HTMLTableElement;
        sandbox.el.appendChild(measureTable);

        let splitIndex = 0;
        for (let i = 0; i < rows.length; i++) {
            const row = rows[i].cloneNode(true) as HTMLTableRowElement;
            measureTable.appendChild(row);
            const newTotalHeight = measureTable.getBoundingClientRect().height;
            
            // Check for explicit page breaks inside cells
            if (containsPageBreak(row)) {
                 // Force split at this row.
                 if (i === 0) {
                     return { keep: null, move: originalNode.cloneNode(true) as HTMLElement };
                 }
                 splitIndex = i;
                 break;
            }

            if (newTotalHeight > effectiveLimit) {
                if (i === 0) {
                     return { keep: null, move: originalNode.cloneNode(true) as HTMLElement };
                }
                splitIndex = i;
                break;
            }
            if (i === rows.length - 1) splitIndex = rows.length;
        }

        if (splitIndex === rows.length) return { keep: originalNode.cloneNode(true) as HTMLElement, move: null };
        for (let i = 0; i < splitIndex; i++) keepTable.appendChild(rows[i].cloneNode(true));
        for (let i = splitIndex; i < rows.length; i++) moveTable.appendChild(rows[i].cloneNode(true));
        moveTable.setAttribute('data-continuation', 'true');
        return { keep: keepTable, move: moveTable };
    }

    sandbox.el.innerHTML = '';
    const keepNode = originalNode.cloneNode(false) as HTMLElement;
    sandbox.el.appendChild(keepNode);
    const moveNode = originalNode.cloneNode(false) as HTMLElement;

    const findBinarySplitIndex = (text: string, parent: HTMLElement): number => {
        let low = 0; let high = text.length; let best = 0;
        while (low <= high) {
            const mid = Math.floor((low + high) / 2);
            const sub = text.substring(0, mid);
            const tempNode = document.createTextNode(sub);
            parent.appendChild(tempNode);
            const h = keepNode.getBoundingClientRect().height;
            parent.removeChild(tempNode);
            if (h <= effectiveLimit) { best = mid; low = mid + 1; } else { high = mid - 1; }
        }
        return best;
    };

    const moveSiblings = (nodes: Node[], startIdx: number, target: HTMLElement) => {
        for (let i = startIdx; i < nodes.length; i++) target.appendChild(nodes[i].cloneNode(true));
    };

    const processNodes = (nodes: Node[], parentKeep: HTMLElement, parentMove: HTMLElement): boolean => {
        for (let i = 0; i < nodes.length; i++) {
            const child = nodes[i];
            
            // Check if this child forces a break
            if (containsPageBreak(child) || (child.nodeType === Node.ELEMENT_NODE && (child as HTMLElement).classList.contains('prodoc-page-break'))) {
                 // Force move this and all subsequent siblings to next page
                 parentMove.appendChild(child.cloneNode(true));
                 moveSiblings(nodes, i + 1, parentMove);
                 return true;
            }

            const childClone = child.cloneNode(true);
            parentKeep.appendChild(childClone);
            
            if (keepNode.getBoundingClientRect().height <= effectiveLimit) continue;
            
            parentKeep.removeChild(childClone);
            
            if (isAtomic(child)) {
                parentMove.appendChild(child.cloneNode(true));
                moveSiblings(nodes, i + 1, parentMove);
                return true;
            }
            
            if (child.nodeType === Node.TEXT_NODE) {
                const text = child.textContent || '';
                const splitIndex = findBinarySplitIndex(text, parentKeep);
                if (splitIndex > 0) parentKeep.appendChild(document.createTextNode(text.substring(0, splitIndex)));
                const remainder = text.substring(splitIndex);
                if (remainder || splitIndex === 0) parentMove.appendChild(document.createTextNode(remainder));
                moveSiblings(nodes, i + 1, parentMove);
                return true;
            }
            
            if (child.nodeType === Node.ELEMENT_NODE) {
                const el = child as HTMLElement;
                const childKeep = el.cloneNode(false) as HTMLElement;
                const childMove = el.cloneNode(false) as HTMLElement;
                parentKeep.appendChild(childKeep);
                if (keepNode.getBoundingClientRect().height > effectiveLimit) {
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
    if (!keepNode.hasChildNodes() && moveNode.hasChildNodes()) return { keep: null, move: moveNode };
    return { keep: keepNode, move: moveNode };
};

export const paginateContent = (html: string, initialConfig: PageConfig): PaginatorResult => {
  if (typeof document === 'undefined') return { pages: [{ html, config: initialConfig }], pageHeight: 0, pageWidth: 0 };
  const initialFrame = new PageFrame(initialConfig);
  const sandbox = new LayoutSandbox();
  const pages: { html: string, config: PageConfig }[] = [];

  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const body = doc.body;

  const splitTables = Array.from(body.querySelectorAll('table[data-continuation="true"]'));
  splitTables.forEach(splitTable => {
      const prev = splitTable.previousElementSibling;
      if (prev && prev.tagName === 'TABLE') {
          while (splitTable.firstChild) prev.appendChild(splitTable.firstChild);
          splitTable.remove();
      } else {
          splitTable.removeAttribute('data-continuation');
      }
  });

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
  let lastWasBreak = false; // Track if the last item processed forced a break

  const flushPage = () => {
      const div = document.createElement('div');
      currentPageNodes.forEach(n => div.appendChild(n));
      pages.push({ html: div.innerHTML, config: { ...currentConfig } });
      currentPageNodes = [];
      currentH = 0;
  };

  for (let i = 0; i < nodes.length; i++) {
      let node = nodes[i];
      if (node.classList?.contains('prodoc-section-break')) {
          const configData = node.getAttribute('data-config');
          if (configData) {
              try {
                  const newSettings = JSON.parse(decodeURIComponent(configData));
                  currentConfig = { ...currentConfig, ...newSettings };
                  currentFrame = new PageFrame(currentConfig);
                  sandbox.setWidth(currentFrame.bodyWidth);
              } catch (e) { console.error("Failed to parse section break", e); }
          }
          if (currentPageNodes.length > 0) flushPage();
          else if (pages.length === 0) { // Force blank first page if section break is first item
               pages.push({ html: '<p><br/></p>', config: initialConfig }); 
          }
          lastWasBreak = true;
          continue;
      }
      
      const isPageBreak = node.classList?.contains('prodoc-page-break') || node.getAttribute('data-type') === 'page-break' || node.style?.pageBreakAfter === 'always' || node.style?.breakAfter === 'page';
      
      if (isPageBreak) { 
          currentPageNodes.push(node); // Keep break marker on current page
          flushPage(); 
          lastWasBreak = true;
          continue; 
      }

      lastWasBreak = false;

      const remainingForStart = Math.max(0, currentFrame.bodyHeight - currentH - SAFETY_BUFFER);
      if (currentH > 0 && remainingForStart < MIN_LINE_HEIGHT) { flushPage(); i--; continue; }

      const nodeH = sandbox.measure(node);
      if (currentH + nodeH > currentFrame.bodyHeight - SAFETY_BUFFER) {
          const remainingSpace = Math.max(0, currentFrame.bodyHeight - currentH);
          
          // Safety valve: If we are at top of page and node fits nowhere, place it
          if (currentH < MIN_LINE_HEIGHT * 2 && nodeH > remainingSpace) {
              const splitCheck = splitBlock(node, remainingSpace, sandbox);
              if (!splitCheck.keep && splitCheck.move) {
                   currentPageNodes.push(node);
                   flushPage();
                   continue;
              }
          }

          const split = splitBlock(node, remainingSpace, sandbox);
          if (split.keep && (split.keep.hasChildNodes() || split.keep.tagName === 'IMG' || split.keep.tagName === 'TABLE')) {
              currentPageNodes.push(split.keep);
              flushPage(); 
              if (split.move && (split.move.hasChildNodes() || split.move.tagName === 'IMG' || split.move.tagName === 'TABLE')) {
                  nodes[i] = split.move; i--;
              }
          } else {
              if (currentPageNodes.length > 0) { flushPage(); i--; }
              else { currentPageNodes.push(node); flushPage(); }
          }
      } else {
          currentPageNodes.push(node);
          currentH += nodeH;
      }
  }

  if (currentPageNodes.length > 0) {
      flushPage();
  } else if (lastWasBreak || pages.length === 0) {
      // If document ends with a break (page or section), force a new blank page
      pages.push({ html: '<p><br></p>', config: { ...currentConfig } });
  }

  sandbox.destroy();
  return { pages, pageHeight: initialFrame.height, pageWidth: initialFrame.width };
};
