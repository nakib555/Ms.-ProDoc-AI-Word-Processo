
import React, { useRef, useEffect, useState, useMemo } from 'react';
import { Minus, Plus, FileText, Globe, Type, Layout, Sun, Moon } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';
import { useTheme } from '../contexts/ThemeContext';
import { WordCountDialog } from './WordCountDialog';
import { getDocumentStats } from '../utils/textUtils';

const StatusBar: React.FC = () => {
  const { wordCount, zoom, viewMode, setZoom, setViewMode, content } = useEditor();
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
        const next = prev + (direction * 2);
        return Math.min(500, Math.max(10, next));
      });
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    
    return () => {
      el.removeEventListener('wheel', handleWheel);
    };
  }, [viewMode, setZoom]);

  return (
    <>
        <div className="h-9 bg-slate-900 dark:bg-slate-950 text-slate-400 flex items-center justify-between px-2 sm:px-4 text-xs sm:text-sm select-none z-30 no-print flex-shrink-0 border-t border-slate-800 dark:border-slate-900 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] overflow-hidden transition-colors duration-300">
          <div className="flex items-center gap-2 sm:gap-6 font-medium">
            <div className="flex items-center space-x-1.5 hover:text-slate-200 cursor-pointer transition-colors whitespace-nowrap" title="Page Count">
                <Layout size={14} />
                <span>{viewMode === 'print' ? 'Page 1 of 1' : 'Web Layout'}</span>
            </div>
            
            <div 
                className="flex items-center space-x-1.5 hover:bg-slate-800 hover:text-white cursor-pointer transition-all px-2 py-0.5 rounded active:bg-slate-700 whitespace-nowrap" 
                title="Click for detailed statistics"
                onClick={() => setShowWordCountDialog(true)}
            >
                <Type size={14} />
                <span>{wordCount} words</span>
            </div>
            
            <span className="hover:text-slate-200 cursor-pointer transition-colors hidden md:inline whitespace-nowrap">English (US)</span>
          </div>
          
          <div className="flex items-center gap-2 sm:gap-4 flex-shrink-0 ml-auto pl-2">
            <button 
                onClick={toggleTheme}
                className="text-slate-400 hover:text-yellow-400 transition-colors p-1"
                title={theme === 'dark' ? "Switch to Light Mode" : "Switch to Dark Mode"}
            >
                {theme === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            </button>

            {/* View Modes */}
            <div className="flex items-center bg-slate-800 dark:bg-slate-900 rounded-md p-0.5 border border-slate-700 dark:border-slate-800">
                 <button 
                    onClick={() => setViewMode('print')} 
                    className={`p-1 rounded flex items-center justify-center transition-all ${viewMode === 'print' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                    title="Print Layout"
                 >
                    <FileText size={14} />
                 </button>
                 <button 
                    onClick={() => setViewMode('web')} 
                    className={`p-1 rounded flex items-center justify-center transition-all ${viewMode === 'web' ? 'bg-slate-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200 hover:bg-slate-700'}`}
                    title="Web Layout"
                 >
                    <Globe size={14} />
                 </button>
            </div>

            {/* Zoom Controls - Always Visible */}
            <div 
                ref={zoomControlsRef}
                className="flex items-center space-x-1 sm:space-x-3 cursor-ew-resize hover:bg-slate-800/50 rounded-lg px-1 transition-colors"
                title="Scroll to Zoom"
            >
                <div className="h-4 w-[1px] bg-slate-700 mx-1 hidden sm:block"></div>
                <button onClick={() => setZoom(z => Math.max(10, z - 2))} className="hover:bg-slate-800 p-1 rounded-full text-slate-400 hover:text-white transition-colors" title="Zoom Out"><Minus size={14} /></button>
                
                <div className="items-center space-x-2 group relative hidden sm:flex">
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
                <span className="w-8 sm:w-12 text-right font-semibold tabular-nums text-slate-200">{zoom}%</span>
                
                <button onClick={() => setZoom(z => Math.min(500, z + 2))} className="hover:bg-slate-800 p-1 rounded-full text-slate-400 hover:text-white transition-colors" title="Zoom In"><Plus size={14} /></button>
            </div>
          </div>
        </div>

        {showWordCountDialog && detailedStats && (
            <WordCountDialog 
                isOpen={showWordCountDialog}
                onClose={() => setShowWordCountDialog(false)}
                stats={detailedStats}
            />
        )}
    </>
  );
};

export default StatusBar;