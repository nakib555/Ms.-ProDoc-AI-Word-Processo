
import React, { useState, useEffect } from 'react';
import { Copy, Scissors, Clipboard, Bold, Italic, Sparkles, Check, Trash2, X } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';
import { useAI } from '../hooks/useAI';

export const MobileSelectionToolbar: React.FC = () => {
    const { 
        hasActiveSelection, 
        executeCommand, 
        setSelectionMode, 
        selectionMode,
        isAIProcessing,
        viewMode
    } = useEditor();
    const { performAIAction } = useAI();
    
    // Only show on mobile (width < 768px) and when there is a selection or mode is active
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const checkVisibility = () => {
            const isMobile = window.innerWidth < 768;
            // Visible if mobile AND (has selection OR selection mode active) AND not read mode
            setIsVisible(isMobile && (hasActiveSelection || selectionMode) && viewMode !== 'read');
        };

        checkVisibility();
        window.addEventListener('resize', checkVisibility);
        return () => window.removeEventListener('resize', checkVisibility);
    }, [hasActiveSelection, selectionMode, viewMode]);

    if (!isVisible) return null;

    const handleAction = (action: () => void) => {
        action();
        // Keep toolbar open or close based on UX? 
        // Typically keep open if selection persists.
    };

    const handleDone = () => {
        // Clear selection and mode
        setSelectionMode(false);
        const sel = window.getSelection();
        if (sel) sel.removeAllRanges();
    };

    return (
        <div className="fixed bottom-16 left-1/2 -translate-x-1/2 z-[60] flex items-center gap-1.5 bg-white dark:bg-slate-800 shadow-xl shadow-slate-300/50 dark:shadow-black/50 border border-slate-200 dark:border-slate-700 rounded-full px-4 py-2 animate-in slide-in-from-bottom-4 zoom-in-95 duration-200 md:hidden max-w-[95vw] overflow-x-auto no-scrollbar">
            
            {/* Editing Tools */}
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => handleAction(() => executeCommand('copy'))} 
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors active:scale-95"
                    title="Copy"
                >
                    <Copy size={18} />
                </button>
                <button 
                    onClick={() => handleAction(() => executeCommand('cut'))} 
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors active:scale-95"
                    title="Cut"
                >
                    <Scissors size={18} />
                </button>
                <button 
                    onClick={() => handleAction(() => navigator.clipboard.readText().then(t => executeCommand('insertText', t)))} 
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors active:scale-95"
                    title="Paste"
                >
                    <Clipboard size={18} />
                </button>
            </div>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>

            {/* Formatting Tools */}
            <div className="flex items-center gap-1">
                <button 
                    onClick={() => handleAction(() => executeCommand('bold'))} 
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors active:scale-95"
                    title="Bold"
                >
                    <Bold size={18} />
                </button>
                <button 
                    onClick={() => handleAction(() => executeCommand('italic'))} 
                    className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-blue-600 dark:hover:text-blue-400 rounded-full transition-colors active:scale-95"
                    title="Italic"
                >
                    <Italic size={18} />
                </button>
            </div>

            <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>

            {/* AI Action */}
            <button 
                onClick={() => handleAction(() => performAIAction('make_professional', '', { mode: 'replace', useSelection: true }))}
                className="p-2 text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/50 rounded-full transition-colors active:scale-95 relative"
                title="AI Polish"
                disabled={isAIProcessing}
            >
                <Sparkles size={18} className={isAIProcessing ? "animate-pulse" : ""} />
            </button>

            {/* Selection Mode Close */}
            {selectionMode && (
                <>
                    <div className="w-[1px] h-6 bg-slate-200 dark:bg-slate-700 mx-1 shrink-0"></div>
                    <button 
                        onClick={handleDone}
                        className="px-3 py-1.5 bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 text-xs font-bold rounded-full shadow-sm active:scale-95 whitespace-nowrap"
                    >
                        Done
                    </button>
                </>
            )}
        </div>
    );
};
