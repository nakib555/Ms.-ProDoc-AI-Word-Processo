
import React, { useState, useEffect } from 'react';
import { MousePointer2, ArrowLeft, ArrowUp, ArrowDown, ArrowRight, X, Check } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';

export const MobileSelectionToolbar: React.FC = () => {
    const { 
        selectionMode,
        setSelectionMode,
        setIsKeyboardLocked,
        selectionAction,
        setSelectionAction
    } = useEditor();
    
    // Local state for "Extend" mode (Shift key behavior)
    const [isExtending, setIsExtending] = useState(false);

    // Clear selection when mode is deactivated
    useEffect(() => {
        if (!selectionMode) {
            setIsExtending(false);
            window.getSelection()?.removeAllRanges();
            setSelectionAction(null);
        }
    }, [selectionMode, setSelectionAction]);

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

    const handleAction = () => {
        if (selectionAction) {
            selectionAction.onComplete();
            setSelectionAction(null);
            setSelectionMode(false);
            setIsKeyboardLocked(false);
        }
    };

    // Common button styles for the navigation pad
    const navBtnClass = "flex items-center justify-center w-10 h-10 rounded-full bg-slate-100/80 dark:bg-slate-700/80 hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 shadow-sm border border-slate-200/50 dark:border-slate-600 active:scale-95 transition-all touch-manipulation active:bg-blue-100 dark:active:bg-blue-900/50 active:text-blue-600 dark:active:text-blue-400";

    return (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[100] flex items-center gap-3 px-4 py-3 rounded-2xl bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-[0_8px_30px_rgb(0,0,0,0.15)] border border-white/50 dark:border-slate-700/50 ring-1 ring-black/5 animate-in slide-in-from-bottom-10 fade-in duration-300 select-none">
            
            {/* Selection Toggle (Shift Behavior) */}
            <button 
                onClick={() => setIsExtending(!isExtending)}
                className={`flex items-center justify-center w-11 h-11 rounded-full transition-all active:scale-95 shadow-sm border ${
                    isExtending 
                        ? 'bg-blue-600 text-white border-blue-500 shadow-blue-500/30 ring-2 ring-blue-500/20' 
                        : 'bg-slate-50 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
                title={isExtending ? "Selection Mode ON" : "Selection Mode OFF"}
            >
                <MousePointer2 size={20} className={isExtending ? "fill-current" : ""} strokeWidth={2} />
            </button>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>

            {/* Navigation Arrows Cluster - Single Line */}
            <div className="flex items-center gap-1.5">
                <button 
                    onMouseDown={(e) => handleMove(e, 'left')}
                    onTouchStart={(e) => handleMove(e, 'left')}
                    className={navBtnClass}
                >
                    <ArrowLeft size={20} strokeWidth={2.5} />
                </button>
                
                <button 
                    onMouseDown={(e) => handleMove(e, 'up')}
                    onTouchStart={(e) => handleMove(e, 'up')}
                    className={navBtnClass}
                >
                    <ArrowUp size={20} strokeWidth={2.5} />
                </button>

                <button 
                    onMouseDown={(e) => handleMove(e, 'down')}
                    onTouchStart={(e) => handleMove(e, 'down')}
                    className={navBtnClass}
                >
                    <ArrowDown size={20} strokeWidth={2.5} />
                </button>
                
                <button 
                    onMouseDown={(e) => handleMove(e, 'right')}
                    onTouchStart={(e) => handleMove(e, 'right')}
                    className={navBtnClass}
                >
                    <ArrowRight size={20} strokeWidth={2.5} />
                </button>
            </div>

            <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
            
            {/* Action Button (if set) */}
            {selectionAction && (
                <>
                    <button 
                        onClick={handleAction}
                        className="flex items-center justify-center w-11 h-11 rounded-full bg-emerald-500 hover:bg-emerald-600 text-white shadow-md shadow-emerald-500/30 transition-colors active:scale-95 border border-emerald-600"
                        title={selectionAction.label || "Done"}
                    >
                        <Check size={22} strokeWidth={3} />
                    </button>
                    <div className="w-px h-8 bg-slate-200 dark:bg-slate-700 mx-1"></div>
                </>
            )}

            {/* Close Button */}
            <button 
                onClick={() => {
                    setSelectionMode(false);
                    setIsKeyboardLocked(false);
                    setSelectionAction(null);
                }}
                className="flex items-center justify-center w-10 h-10 text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800/50 transition-colors active:bg-slate-200"
            >
                <X size={20} strokeWidth={2.5} />
            </button>
        </div>
    );
};
