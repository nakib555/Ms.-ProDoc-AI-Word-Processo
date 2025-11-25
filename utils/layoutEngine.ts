
import { PageConfig, PaginatorResult } from '../types';
import { PAGE_SIZES } from '../constants';

// Helper to create a hidden sandbox for measurement
const createSandbox = (width: number) => {
  const sandbox = document.createElement('div');
  sandbox.style.position = 'absolute';
  sandbox.style.visibility = 'hidden';
  sandbox.style.width = `${width}px`;
  sandbox.style.height = 'auto';
  sandbox.style.top = '-9999px';
  sandbox.style.left = '-9999px';
  sandbox.className = 'prodoc-editor'; // Match editor styles
  document.body.appendChild(sandbox);
  return sandbox;
};

const getPageDimensions = (config: PageConfig) => {
  const base = PAGE_SIZES[config.size as string] || PAGE_SIZES['Letter'];
  const width = config.orientation === 'portrait' ? base.width : base.height;
  const height = config.orientation === 'portrait' ? base.height : base.width;
  
  // 96px = 1 inch
  // Using the actual margins from config
  const margins = config.margins;
  
  // Basic calculation: Top + Bottom
  const verticalPadding = (margins.top + margins.bottom) * 96;
  
  // Basic calculation: Left + Right + Gutter
  let horizontalPadding = (margins.left + margins.right + margins.gutter) * 96;

  // If gutter is at top (rare but supported in types), add to vertical
  // Note: Implementation logic here assumes standard left/right gutter usage mostly.

  return { 
    width, 
    height, 
    contentHeight: Math.max(100, height - verticalPadding), 
    contentWidth: Math.max(100, width - horizontalPadding) 
  };
};

export const paginateContent = (html: string, config: PageConfig): PaginatorResult => {
  const { width, height, contentHeight, contentWidth } = getPageDimensions(config);
  
  // If code runs server-side or no document
  if (typeof document === 'undefined') {
    return { pages: [html], pageHeight: height, pageWidth: width };
  }

  const sandbox = createSandbox(contentWidth);
  sandbox.innerHTML = html;

  const pages: string[] = [];
  let currentPageNodes: Node[] = [];
  let currentHeight = 0;

  // Walk through top-level nodes (Paragraphs, Divs, Tables)
  const children = Array.from(sandbox.childNodes);

  children.forEach((node) => {
    // Clone node to measure it individually in context if needed, 
    // but here we just check its rendered height in the flow.
    
    // In a complex engine, we'd append one by one to a clean sandbox.
    // Let's do the robust "append and check" method.
    const nodeHeight = (node as HTMLElement).offsetHeight || 20; // Fallback for text nodes
    
    // Basic Greedy Algorithm
    if (currentHeight + nodeHeight > contentHeight) {
      // Overflow!
      if (currentPageNodes.length > 0) {
        // Push current page
        const pageWrapper = document.createElement('div');
        currentPageNodes.forEach(n => pageWrapper.appendChild(n.cloneNode(true)));
        pages.push(pageWrapper.innerHTML);
        
        // Reset for next page
        currentPageNodes = [node];
        currentHeight = nodeHeight;
      } else {
        // Single node is taller than page (e.g. massive image or table)
        // In a real engine we'd split it. Here we force it onto a page.
        const pageWrapper = document.createElement('div');
        pageWrapper.appendChild(node.cloneNode(true));
        pages.push(pageWrapper.innerHTML);
        currentPageNodes = [];
        currentHeight = 0;
      }
    } else {
      currentPageNodes.push(node);
      currentHeight += nodeHeight;
    }
  });

  // Push final page
  if (currentPageNodes.length > 0) {
    const pageWrapper = document.createElement('div');
    currentPageNodes.forEach(n => pageWrapper.appendChild(n.cloneNode(true)));
    pages.push(pageWrapper.innerHTML);
  }

  // Cleanup
  document.body.removeChild(sandbox);

  // Ensure at least one page
  if (pages.length === 0) pages.push('');

  return {
    pages,
    pageHeight: height,
    pageWidth: width
  };
};
