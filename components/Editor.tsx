
import React, { useRef, useEffect, useLayoutEffect, useCallback, Suspense } from 'react';
import { useEditor } from '../contexts/EditorContext';
import * as AutoSizerPkg from 'react-virtualized-auto-sizer';
import { Loader2 } from 'lucide-react';

// Safely resolve AutoSizer from the package (handles ESM/CJS interop on CDNs)
const AutoSizer = (AutoSizerPkg as any).default || AutoSizerPkg;

// Lazy Load Views with safety check
const PrintLayoutView = React.lazy(() => 
  import('./ribbon/tabs/ViewTab/views/PrintLayoutView')
    .then(m => ({ default: m.PrintLayoutView }))
    .catch(err => {
      console.error("Failed to load PrintLayoutView", err);
      return { default: () => <div className="p-4 text-red-500">Error loading Print Layout. Please refresh.</div> };
    })
);

const WebLayoutView = React.lazy(() => 
  import('./ribbon/tabs/ViewTab/views/WebLayoutTool')
    .then(m => ({ default: m.WebLayoutView }))
    .catch(err => {
      console.error("Failed to load WebLayoutView", err);
      return { default: () => <div className="p-4 text-red-500">Error loading Web Layout. Please refresh.</div> };
    })
);

const ReadLayoutView = React.lazy(() => 
  import('./ribbon/tabs/ViewTab/views/ReadLayoutView')
    .then(m => ({ default: m.ReadLayoutView }))
    .catch(err => {
      console.error("Failed to load ReadLayoutView", err);
      return { default: () => <div className="p-4 text-red-500">Error loading Read Mode. Please refresh.</div> };
    })
);

const ViewLoading = () => (
  <div className="flex flex-col items-center justify-center h-full w-full text-slate-400 gap-3">
    <Loader2 className="animate-spin text-blue-500" size={32} />
    <span className="text-sm font-medium">Loading document view...</span>
  </div>
);

const Editor: React.FC = () => {
  const { 
    content, 
    setContent, 
    zoom, 
    setZoom,
    viewMode, 
    pageConfig, 
    registerContainer, 
    showRuler, 
    showFormattingMarks,
    editorRef 
  } = useEditor();
  
  const containerRef = useRef<HTMLDivElement | null>(null);
  // Store point relative to content for stable zooming
  const pendingScrollRef = useRef<{ pointX: number, pointY: number, mouseX: number, mouseY: number } | null>(null);
  const prevZoomRef = useRef<number>(zoom);

  // Stable callback for ref registration
  // We pass this to the specific view which will attach it to the scrollable element
  const handleRegister = useCallback((node: HTMLDivElement | null) => {
      containerRef.current = node;
      registerContainer(node);
  }, [registerContainer]);

  // Zoom-to-Cursor Logic
  useEffect(() => {
      const container = containerRef.current;
      if (!container) return;

      const handleWheel = (e: WheelEvent) => {
          // Handle Ctrl+Wheel for Zooming
          if (e.ctrlKey || e.metaKey) {
              e.preventDefault();

              const rect = container.getBoundingClientRect();
              // Calculate mouse position relative to the scrolling viewport
              const mouseX = e.clientX - rect.left;
              const mouseY = e.clientY - rect.top;

              // Current scale
              const scaleOld = zoom / 100;
              
              // Find content start offset (to handle centered layouts like Print View)
              // In Print Layout, pages are centered by flexbox, creating a variable left margin.
              let contentOffsetLeft = 0;
              let contentOffsetTop = 0;
              
              const firstPage = container.querySelector('.prodoc-page-wrapper') as HTMLElement;
              if (firstPage) {
                  contentOffsetLeft = firstPage.offsetLeft;
                  contentOffsetTop = firstPage.offsetTop;
              }
              
              // Calculate the point on the content (unscaled coordinates) under the mouse
              // We subtract the offset to account for the flexbox centering margin
              const pointX = (container.scrollLeft + mouseX - contentOffsetLeft) / scaleOld;
              const pointY = (container.scrollTop + mouseY - contentOffsetTop) / scaleOld;
              
              // Determine Zoom Direction and Step
              const direction = e.deltaY > 0 ? -1 : 1; 
              const zoomStep = 10; // 10% increments
              
              let nextZoom = zoom + (direction * zoomStep);
              nextZoom = Math.max(10, Math.min(500, nextZoom));

              if (nextZoom !== zoom) {
                  // Store the target point and mouse position to restore after render
                  pendingScrollRef.current = { pointX, pointY, mouseX, mouseY };
                  setZoom(nextZoom);
              }
          }
      };

      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
  }, [zoom, setZoom]);

  // Apply pending scroll adjustment after layout update
  useLayoutEffect(() => {
      const container = containerRef.current;
      if (!container) {
          prevZoomRef.current = zoom;
          return;
      }

      if (pendingScrollRef.current) {
          // Case 1: Zoom to Cursor (initiated by Wheel)
          const { pointX, pointY, mouseX, mouseY } = pendingScrollRef.current;
          const scaleNew = zoom / 100;
          
          // Recalculate content offsets after render (since layout/centering might have changed)
          let newContentOffsetLeft = 0;
          let newContentOffsetTop = 0;
          
          const firstPage = container.querySelector('.prodoc-page-wrapper') as HTMLElement;
          if (firstPage) {
              newContentOffsetLeft = firstPage.offsetLeft;
              newContentOffsetTop = firstPage.offsetTop;
          }

          // Calculate new Scroll Positions to keep ContentPoint under MouseOffset
          // Formula: Scroll = (Point * Scale) + Margin - Mouse
          container.scrollLeft = (pointX * scaleNew) + newContentOffsetLeft - mouseX;
          container.scrollTop = (pointY * scaleNew) + newContentOffsetTop - mouseY;
          
          pendingScrollRef.current = null;
      } else if (prevZoomRef.current !== zoom) {
          // Case 2: Zoom to Center (initiated by UI/Keyboard)
          // Simplistic center preservation
          const oldScale = prevZoomRef.current / 100;
          const newScale = zoom / 100;
          
          const { clientWidth, clientHeight, scrollLeft, scrollTop } = container;
          
          const centerX = scrollLeft + (clientWidth / 2);
          const centerY = scrollTop + (clientHeight / 2);

          // Note: This simple formula assumes origin at 0,0. For perfect centering with flexbox
          // we would need offsets too, but this is generally acceptable for button-based zoom.
          const contentCenterX = centerX / oldScale;
          const contentCenterY = centerY / oldScale;

          const newScrollLeft = (contentCenterX * newScale) - (clientWidth / 2);
          const newScrollTop = (contentCenterY * newScale) - (clientHeight / 2);

          container.scrollLeft = newScrollLeft;
          container.scrollTop = newScrollTop;
      }
      
      prevZoomRef.current = zoom;
  }, [zoom]);

  // Read Mode Route
  if (viewMode === 'read') {
      return (
        <Suspense fallback={<ViewLoading />}>
            <ReadLayoutView />
        </Suspense>
      );
  }

  // Web Layout Background
  const getBackgroundStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
          backgroundColor: pageConfig.pageColor || '#ffffff',
      };
      if (pageConfig.background === 'ruled') {
          return {
              ...base,
              backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px)',
              backgroundSize: '100% 2rem'
          };
      } else if (pageConfig.background === 'grid') {
          return {
              ...base,
              backgroundImage: 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)',
              backgroundSize: '20px 20px'
          };
      }
      return base;
  };

  const isPrint = viewMode === 'print';

  return (
    <div className={`flex-1 flex flex-col relative transition-colors duration-500 overflow-hidden ${isPrint ? 'bg-[#f1f5f9] dark:bg-slate-950' : 'bg-white dark:bg-slate-900'}`}
         style={!isPrint ? { backgroundColor: pageConfig.pageColor } : undefined}>
      
      <AutoSizer>
        {({ height, width }) => (
            <div style={{ height, width }} className="relative">
                <Suspense fallback={<ViewLoading />}>
                    {isPrint ? (
                        /* Print Layout: Vertical stack of Pages with Virtualization */
                        <PrintLayoutView 
                            width={width}
                            height={height}
                            content={content}
                            setContent={setContent}
                            pageConfig={pageConfig}
                            zoom={zoom}
                            showRuler={showRuler}
                            showFormattingMarks={showFormattingMarks}
                            containerRef={handleRegister}
                        />
                    ) : (
                        /* Web Layout: Fluid View */
                        <div 
                            ref={handleRegister}
                            className="w-full h-full overflow-y-auto overflow-x-auto scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent"
                        >
                            <WebLayoutView 
                                editorRef={editorRef}
                                content={content}
                                onInput={(e) => setContent(e.currentTarget.innerHTML)}
                                onPaste={() => {}}
                                onPageClick={() => {}}
                                pageConfig={pageConfig}
                                zoom={zoom}
                                showFormattingMarks={showFormattingMarks}
                                backgroundStyle={getBackgroundStyle()}
                            />
                        </div>
                    )}
                </Suspense>
            </div>
        )}
      </AutoSizer>
    </div>
  );
};

export default Editor;
