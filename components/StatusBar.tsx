
import React, { useRef, useEffect, useState, useMemo, Suspense } from 'react';
import { Minus, Plus, FileText, Globe, Type, Layout, Sun, Moon, Lock, Unlock, ScanText } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';
import { useTheme } from '../contexts/ThemeContext';
import { getDocumentStats } from '../utils/textUtils';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const WordCountDialog = React.lazy(() => import('./WordCountDialog').then(m => ({ default: m.WordCountDialog })));

const StatusBar: React.FC = () => {
  const { wordCount, zoom, viewMode, setViewMode, content, currentPage, totalPages, isAIProcessing, setZoom, isKeyboardLocked, setIsKeyboardLocked, selectionMode, setSelectionMode } = useEditor();
  const { theme, toggleTheme } = useTheme();
  const zoomControlsRef = useRef<HTMLDivElement>(null);
  const [showWordCountDialog, setShowWordCountDialog] = useState(false);

  // Calculate stats only when necessary (when dialog is open or about to open)
  const detailedStats = useMemo(() => {
      if (!showWordCountDialog) return null;
      return getDocumentStats(content);
  }, [content, showWordCountDialog]);

  useEffect(() => {
    const el = zoomControlsRef.current;
    if (!el) return;

    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      const direction = e.deltaY > 0 ? -1 : 1;
      setZoom(prev => {
        const next = prev + (direction * 5); // Faster scroll zoom
        return Math.min(500, Math.max(10, next));
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [viewMode, setZoom]);

  const handleMouseDown = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (['INPUT', 'TEXTAREA', 'SELECT'].includes(target.tagName) || target.isContentEditable) {
      return;
    }
    e.preventDefault();
  };

  return (
    <>
        <div 
          onMouseDown={handleMouseDown}
          className="h-9 bg-[#0f172a] dark:bg-[#0f172a] text-slate-400 flex items-center justify-between px-2 sm:px-4 text-xs sm:text-sm select-none z-30 no-print flex-shrink-0 border-t border-slate-800 dark:border-slate-800 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden transition-colors duration-300"
        >
          <div className="flex items-center gap-3 sm:gap-6 font-medium shrink-0">
            <div className="flex items-center gap-1.5 hover:text-slate-200 cursor-pointer transition-colors whitespace-nowrap" title="Page Count">
                <Layout size={14} className="shrink-0" />
                <span className="hidden sm:inline">{viewMode === 'print' ? `Page ${currentPage} of ${totalPages}` : 'Web Layout'}</span>
                <span className="sm:hidden text-[10px] font-semibold">{viewMode === 'print' ? `${currentPage} / ${totalPages}` : 'Web'}</span>
            </div>
            
            <div 
                className="flex items-center gap-1.5 hover:bg-slate-800 hover:text-white cursor-pointer transition-all px-2 py-0.5 rounded active:bg-slate-700 whitespace-nowrap" 
                title="Click for detailed statistics"
                onClick={() => setShowWordCountDialog(true)}
            >
                <Type size={14} className="shrink-0" />
                <span className="hidden sm:inline">{wordCount} words</span>
                <span className="sm:hidden text-[10px] font-semibold">{wordCount} w</span>
            </div>
            
            <span className="hover:text-slate-200 cursor-pointer transition-colors hidden md:inline whitespace-nowrap">English (US)</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-auto pl-2">
            
            {/* Smart Selection Toggle (Mobile Helper) - Only visible on mobile */}
            <button 
                onClick={() => {
                    const newState = !selectionMode;
                    setSelectionMode(newState);
                    setIsKeyboardLocked(newState);
                }}
                className={`md:hidden p-1.5 rounded transition-all flex items-center gap-1 ${selectionMode ? 'text-indigo-400 bg-indigo-900/20 ring-1 ring-indigo-500/50' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={selectionMode ? "Disable Smart Select Mode" : "Enable Smart Select Mode (Tap to Extend Selection)"}
            >
                <ScanText size={14} />
                <span className="hidden sm:inline text-[10px] font-medium">{selectionMode ? 'Selecting' : 'Select'}</span>
            </button>

            {/* Keyboard Lock - Only visible on mobile */}
            <button 
                onClick={() => setIsKeyboardLocked(!isKeyboardLocked)}
                className={`md:hidden p-1.5 rounded transition-all flex items-center gap-1 ${isKeyboardLocked ? 'text-red-400 bg-red-900/20' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={isKeyboardLocked ? "Unlock Keyboard" : "Lock Keyboard (Prevent Typing)"}
            >
                {isKeyboardLocked ? <Lock size={14} /> : <Unlock size={14} />}
            </button>

            <button 
                onClick={toggleTheme}
                className="text-slate-400 hover:text-yellow-400 transition-colors p-1"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* View Modes - Desktop (Grouped) */}
            <div className="hidden sm:flex items-center bg-slate-800 dark:bg-slate-800 rounded-md p-0.5 border border-slate-700 dark:border-slate-700">
                 <button 
                    onClick={() => !isAIProcessing && setViewMode('print')} 
                    disabled={isAIProcessing}
                    className={`p-1 rounded flex items-center justify-center transition-all ${viewMode === 'print' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'} ${isAIProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Print Layout"
                 >
                    <FileText size={14} />
                 </button>
                 <button 
                    onClick={() => !isAIProcessing && setViewMode('web')} 
                    disabled={isAIProcessing}
                    className={`p-1 rounded flex items-center justify-center transition-all ${viewMode === 'web' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'} ${isAIProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title="Web Layout"
                 >
                    <Globe size={14} />
                 </button>
            </div>

            {/* View Mode Toggle - Mobile (Single Button) */}
            <button 
                onClick={() => !isAIProcessing && setViewMode(prev => prev === 'print' ? 'web' : 'print')}
                disabled={isAIProcessing}
                className={`sm:hidden p-1.5 rounded transition-all flex items-center justify-center ${isAIProcessing ? 'opacity-50' : ''} ${viewMode === 'web' ? 'text-blue-400 bg-blue-900/20 ring-1 ring-blue-500/30' : 'text-slate-400 hover:text-white hover:bg-slate-800'}`}
                title={viewMode === 'print' ? "Switch to Web Layout" : "Switch to Print Layout"}
            >
                {viewMode === 'print' ? <FileText size={14} /> : <Globe size={14} />}
            </button>

            {/* Zoom Controls - Optimized for Mobile */}
            <div 
                ref={zoomControlsRef}
                className="flex items-center gap-0.5 sm:gap-3 cursor-ew-resize hover:bg-slate-800/50 rounded-lg px-1 transition-colors"
                title="Scroll to Zoom"
            >
                <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>
                <button onClick={() => setZoom(z => Math.max(10, z - 10))} className="hover:bg-slate-800 p-1 rounded-full text-slate-400 hover:text-white transition-colors" title="Zoom Out"><Minus size={14} /></button>
                
                <div className="items-center gap-2 group relative hidden md:flex">
                    <input 
                        type="range" 
                        min="10" 
                        max="500" 
                        value={zoom} 
                        onChange={(e) => setZoom(Number(e.target.value))}
                        className="w-16 sm:w-24 h-1 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-400"
                        title="Zoom Level"
                    />
                </div>
                <span className="w-8 sm:w-12 text-right font-semibold tabular-nums text-slate-200 text-[10px] sm:text-xs">{Number(zoom).toFixed(1)}%</span>
                
                <button onClick={() => setZoom(z => Math.min(500, z + 10))} className="hover:bg-slate-800 p-1 rounded-full text-slate-400 hover:text-white transition-colors" title="Zoom In"><Plus size={14} /></button>
            </div>
          </div>
        </div>

        {showWordCountDialog && detailedStats && (
            <Suspense fallback={<div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/5"><div className="bg-white p-4 rounded shadow"><LoadingSpinner className="w-8 h-8" /></div></div>}>
                <WordCountDialog 
                    isOpen={showWordCountDialog}
                    onClose={() => setShowWordCountDialog(false)}
                    stats={detailedStats}
                />
            </Suspense>
        )}
    </>
  );
};

export default React.memo(StatusBar);
