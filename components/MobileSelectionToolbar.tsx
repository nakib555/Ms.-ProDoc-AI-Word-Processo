
import React, { useState, useEffect } from 'react';
import { MousePointer2, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, X } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';

export const MobileSelectionToolbar: React.FC = () => {
    const { 
        selectionMode,
        setSelectionMode,
        setIsKeyboardLocked
    } = useEditor();
    
    // Local state for "Extend" mode (Shift key behavior)
    const [isExtending, setIsExtending] = useState(false);

    // Clear selection when mode is deactivated
    useEffect(() => {
        if (!selectionMode) {
            setIsExtending(false);
            window.getSelection()?.removeAllRanges();
        }
    }, [selectionMode]);

    if (!selectionMode) return null;

    const handleMove = (e: React.MouseEvent | React.TouchEvent, direction: 'left' | 'right' | 'up' | 'down') => {
        e.preventDefault(); // Prevent focus loss
        e.stopPropagation();
        
        const sel = window.getSelection();
        // @ts-ignore - 'modify' is standard in WebKit/Blink/Gecko for caret movement
        if (sel && sel.modify) {
            const type = isExtending ? 'extend' : 'move';
            const granularity = (direction === 'left' || direction === 'right') ? 'character' : 'line';
            const dir = (direction === 'left' || direction === 'up') ? 'backward' : 'forward';
            
            try {
                // @ts-ignore
                sel.modify(type, dir, granularity);
            } catch (err) {
                console.warn("Cursor movement not supported", err);
            }
        }
    };

    // Common button styles for the navigation pad
    const navBtnClass = "flex items-center justify-center w-9 h-9 rounded-full bg-slate-100/50 dark:bg-slate-700/50 hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200/50 dark:border-slate-600 active:scale-90 transition-all touch-manipulation active:bg-blue-50 dark:active:bg-blue-900/30 active:text-blue-600 dark:active:text-blue-400";

    return (
        <div className="fixed bottom-14 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-2 px-3 py-2 rounded-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-white/50 dark:border-slate-700/50 ring-1 ring-black/5 animate-in slide-in-from-bottom-10 fade-in duration-300 select-none">
            
            {/* Selection Toggle (Shift Behavior) */}
            <button 
                onClick={() => setIsExtending(!isExtending)}
                className={`flex items-center justify-center w-10 h-10 rounded-full transition-all active:scale-95 shadow-sm border ${
                    isExtending 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={isExtending ? "Selection Mode ON" : "Selection Mode OFF"}
            >
                <MousePointer2 size={18} className={isExtending ? "fill-current" : ""} strokeWidth={2} />
            </button>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>

            {/* Navigation Arrows Cluster - Single Line */}
            <div className="flex items-center gap-1">
                <button 
                    onMouseDown={(e) => handleMove(e, 'left')}
                    onTouchStart={(e) => handleMove(e, 'left')}
                    className={navBtnClass}
                >
                    <ArrowLeft size={16} strokeWidth={2.5} />
                </button>
                
                <button 
                    onMouseDown={(e) => handleMove(e, 'up')}
                    onTouchStart={(e) => handleMove(e, 'up')}
                    className={navBtnClass}
                >
                    <ArrowUp size={16} strokeWidth={2.5} />
                </button>

                <button 
                    onMouseDown={(e) => handleMove(e, 'down')}
                    onTouchStart={(e) => handleMove(e, 'down')}
                    className={navBtnClass}
                >
                    <ArrowDown size={16} strokeWidth={2.5} />
                </button>
                
                <button 
                    onMouseDown={(e) => handleMove(e, 'right')}
                    onTouchStart={(e) => handleMove(e, 'right')}
                    className={navBtnClass}
                >
                    <ArrowRight size={16} strokeWidth={2.5} />
                </button>
            </div>

            <div className="w-px h-6 bg-slate-200 dark:bg-slate-700 mx-0.5"></div>

            {/* Close Button */}
            <button 
                onClick={() => {
                    setSelectionMode(false);
                    setIsKeyboardLocked(false);
                }}
                className="p-2 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors"
            >
                <X size={18} strokeWidth={2.5} />
            </button>
        </div>
    );
};
