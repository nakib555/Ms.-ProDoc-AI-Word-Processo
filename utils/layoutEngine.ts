
import { PageConfig, PaginatorResult } from '../types';
import { PAGE_SIZES } from '../constants';

// --- Measurement Sandbox ---
const createSandbox = (width: number) => {
  const sandbox = document.createElement('div');
  sandbox.style.position = 'absolute';
  sandbox.style.visibility = 'hidden';
  sandbox.style.width = `${width}px`;
  sandbox.style.height = 'auto';
  sandbox.style.top = '-9999px';
  sandbox.style.left = '-9999px';
  sandbox.className = 'prodoc-editor'; // Match editor styles for accurate measurement
  sandbox.style.padding = '0'; // Reset padding to measure pure content
  document.body.appendChild(sandbox);
  return sandbox;
};

// --- Page Dimension Calculator ---
const getPageDimensions = (config: PageConfig) => {
  const base = PAGE_SIZES[config.size as string] || PAGE_SIZES['Letter'];
  let totalWidth = config.orientation === 'portrait' ? base.width : base.height;
  let totalHeight = config.orientation === 'portrait' ? base.height : base.width;
  
  const margins = config.margins;
  
  // Calculate consumed space
  let consumedVerticalSpace = (margins.top + margins.bottom) * 96;
  let consumedHorizontalSpace = (margins.left + margins.right) * 96;

  // Gutter logic
  const gutterPx = (margins.gutter || 0) * 96;
  if (config.gutterPosition === 'top') {
    consumedVerticalSpace += gutterPx;
  } else {
    consumedHorizontalSpace += gutterPx; 
  }

  // Calculate the available writable area
  let contentWidth = totalWidth - consumedHorizontalSpace;
  let contentHeight = totalHeight - consumedVerticalSpace;

  return { 
    width: totalWidth, 
    height: totalHeight, 
    contentHeight: Math.max(100, contentHeight), 
    contentWidth: Math.max(100, contentWidth) 
  };
};

// --- Node Splitting Logic ---
// Attempts to split a block element (like a paragraph) into two parts 
// so that the first part fits in the remaining space of the current page.
const splitBlock = (node: HTMLElement, remainingHeight: number, sandbox: HTMLElement): { keep: HTMLElement, move: HTMLElement } | null => {
    // Only attempt to split textual blocks
    const splitTableTags = ['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'DIV', 'BLOCKQUOTE'];
    if (!splitTableTags.includes(node.tagName)) return null;

    // Clone to manipulate
    const clone = node.cloneNode(true) as HTMLElement;
    sandbox.innerHTML = '';
    sandbox.appendChild(clone);

    // If the node itself fits (sanity check), no need to split (though caller should have checked)
    if (clone.offsetHeight <= remainingHeight) return null;

    // Get all text words to perform a binary search for the split point
    // Note: This is a simplified text splitter. Complex nested HTML structures might break.
    // For a robust editor, we iterate backwards removing words until it fits.
    const originalHTML = clone.innerHTML;
    
    // Naive split by spaces (words). 
    // WARNING: This strips internal HTML tags like <b> or <span> if we are lazy.
    // To preserve HTML, we would need a DOM walker. For this implementation, 
    // we will use a text-based heuristic which is standard for lightweight web processors.
    
    // If the node contains complex elements (tables, images) inside, treat as atomic
    if (clone.querySelector('table, img, video, iframe, hr')) return null;

    const words = clone.innerText.split(' ');
    if (words.length < 2) return null; // Can't split single word effectively

    let low = 0;
    let high = words.length - 1;
    let bestSplitIndex = 0;

    // Binary search for the maximum number of words that fit
    while (low <= high) {
        const mid = Math.floor((low + high) / 2);
        // Reconstruct partial content
        const firstPartText = words.slice(0, mid).join(' ');
        clone.innerText = firstPartText; // Note: this removes internal formatting like bold/italic temporarily
        
        if (clone.offsetHeight <= remainingHeight) {
            bestSplitIndex = mid;
            low = mid + 1;
        } else {
            high = mid - 1;
        }
    }

    if (bestSplitIndex === 0) return null; // Can't fit even one word

    // Construct the two parts.
    // Limitation: formatting is lost in the split zone in this simple heuristic.
    // To improve, one would copy the full HTML and delete ranges.
    
    const keepNode = node.cloneNode(false) as HTMLElement; // Shallow clone (tags/classes)
    const moveNode = node.cloneNode(false) as HTMLElement;

    keepNode.innerText = words.slice(0, bestSplitIndex).join(' ');
    moveNode.innerText = words.slice(bestSplitIndex).join(' ');

    // Only split if we actually have content for both
    if (!keepNode.innerText.trim() || !moveNode.innerText.trim()) return null;

    return { keep: keepNode, move: moveNode };
};

// --- Main Pagination Function ---
export const paginateContent = (html: string, config: PageConfig): PaginatorResult => {
  const { width, height, contentHeight, contentWidth } = getPageDimensions(config);
  
  if (typeof document === 'undefined') {
    return { pages: [html], pageHeight: height, pageWidth: width };
  }

  // 1. Setup Environment
  const sandbox = createSandbox(contentWidth);
  // Wrap input in a div to ensure we can parse list of nodes easily
  const tempWrapper = document.createElement('div');
  tempWrapper.innerHTML = html;
  
  // Extract nodes. Handle case where text nodes are direct children (wrap them in P)
  const nodes: Node[] = [];
  Array.from(tempWrapper.childNodes).forEach(node => {
      if (node.nodeType === Node.TEXT_NODE && node.textContent?.trim().length === 0) {
          return; // Skip empty whitespace text nodes
      }
      if (node.nodeType === Node.TEXT_NODE) {
          const p = document.createElement('p');
          p.appendChild(node.cloneNode(true));
          nodes.push(p);
      } else {
          nodes.push(node.cloneNode(true));
      }
  });

  const pages: string[] = [];
  let currentPageNodes: HTMLElement[] = [];
  let currentPageHeight = 0;

  // 2. Iterate and Fill Pages
  for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i] as HTMLElement;
      
      // Measure node
      sandbox.innerHTML = '';
      sandbox.appendChild(node);
      const nodeHeight = sandbox.offsetHeight;

      // Handle Page Breaks explicitly
      const isPageBreak = node.classList?.contains('prodoc-page-break') || 
                          node.style?.pageBreakAfter === 'always' ||
                          node.style?.breakAfter === 'page';

      if (isPageBreak) {
          // Finish current page
          currentPageNodes.push(node);
          const pageWrapper = document.createElement('div');
          currentPageNodes.forEach(n => pageWrapper.appendChild(n));
          pages.push(pageWrapper.innerHTML);
          currentPageNodes = [];
          currentPageHeight = 0;
          continue;
      }

      // Check overflow
      if (currentPageHeight + nodeHeight > contentHeight) {
          const remainingHeight = contentHeight - currentPageHeight;
          
          // Try to split the node if it's a text block and worth splitting
          const splitResult = splitBlock(node, remainingHeight, sandbox);

          if (splitResult) {
              // Add first part to current page
              currentPageNodes.push(splitResult.keep);
              
              // Finalize current page
              const pageWrapper = document.createElement('div');
              currentPageNodes.forEach(n => pageWrapper.appendChild(n));
              pages.push(pageWrapper.innerHTML);

              // Setup next page with the second part
              currentPageNodes = [splitResult.move];
              // Measure new part height
              sandbox.innerHTML = '';
              sandbox.appendChild(splitResult.move);
              currentPageHeight = sandbox.offsetHeight;
          } 
          else {
              // Can't split or doesn't fit. 
              // If current page is empty, we MUST force it in (it's taller than a page)
              // Otherwise, move to next page
              if (currentPageNodes.length === 0) {
                  const pageWrapper = document.createElement('div');
                  pageWrapper.appendChild(node);
                  pages.push(pageWrapper.innerHTML);
                  currentPageNodes = [];
                  currentPageHeight = 0;
              } else {
                  // Finalize current page
                  const pageWrapper = document.createElement('div');
                  currentPageNodes.forEach(n => pageWrapper.appendChild(n));
                  pages.push(pageWrapper.innerHTML);
                  
                  // Move node to next page
                  currentPageNodes = [node];
                  currentPageHeight = nodeHeight;
              }
          }
      } else {
          // Fits
          currentPageNodes.push(node);
          currentPageHeight += nodeHeight;
      }
  }

  // 3. Finalize Last Page
  if (currentPageNodes.length > 0) {
      const pageWrapper = document.createElement('div');
      currentPageNodes.forEach(n => pageWrapper.appendChild(n));
      pages.push(pageWrapper.innerHTML);
  }

  // Ensure at least one page exists
  if (pages.length === 0) pages.push('<p><br></p>');

  // Cleanup
  document.body.removeChild(sandbox);

  return {
    pages,
    pageHeight: height,
    pageWidth: width
  };
};
