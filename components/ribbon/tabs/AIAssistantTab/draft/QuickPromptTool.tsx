
import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Send, Sparkles, ChevronDown, FileText, Coffee, Zap, Smile, Edit3, ArrowRight, RefreshCw, FilePlus } from 'lucide-react';
import { useAI } from '../../../../../hooks/useAI';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { useAIAssistantTab } from '../AIAssistantTabContext';
import { MenuPortal } from '../../../common/MenuPortal';
import { useEditor } from '../../../../../contexts/EditorContext';

const TONES = [
    { id: 'professional', label: 'Professional', icon: FileText },
    { id: 'casual', label: 'Casual', icon: Coffee },
    { id: 'confident', label: 'Confident', icon: Zap },
    { id: 'friendly', label: 'Friendly', icon: Smile },
    { id: 'creative', label: 'Creative', icon: Sparkles },
    { id: 'concise', label: 'Concise', icon: Edit3 },
];

const ToneSelector: React.FC<{ tone: string, setTone: (t: string) => void }> = ({ tone, setTone }) => {
    const { activeMenu, toggleMenu, closeMenu, menuPos, registerTrigger } = useAIAssistantTab();
    const menuId = 'quick_prompt_tone';

    const currentTone = TONES.find(t => t.id === tone) || TONES[0];
    const Icon = currentTone.icon;

    return (
        <>
            <button
                ref={(el) => registerTrigger(menuId, el)}
                onClick={(e) => { e.stopPropagation(); toggleMenu(menuId); }}
                onMouseDown={(e) => e.preventDefault()}
                className="p-1.5 m-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 transition-colors flex items-center justify-center gap-1 min-w-[24px]"
                title={`Tone: ${currentTone.label}`}
            >
                <Icon size={14} />
                <ChevronDown size={10} />
            </button>
            <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={180}>
                 <div className="p-1">
                     <div className="px-3 py-1.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider">Tone</div>
                     {TONES.map(t => (
                         <button key={t.id} onClick={() => { setTone(t.id); closeMenu(); }} className="w-full text-left px-3 py-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-md text-xs font-medium text-slate-700 dark:text-slate-200 flex items-center gap-2">
                            <t.icon size={14} className="text-slate-500 dark:text-slate-400"/> {t.label}
                         </button>
                     ))}
                 </div>
            </MenuPortal>
        </>
    );
};

export const QuickPromptTool: React.FC = () => {
  const { performAIAction, isProcessing } = useAI();
  const { content } = useEditor();
  const [prompt, setPrompt] = useState('');
  const [tone, setTone] = useState('professional');
  const [action, setAction] = useState<'insert' | 'refine' | 'replace'>('insert');
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  // Check if document has content to refine
  const hasContent = useMemo(() => {
      return content ? content.replace(/<[^>]*>/g, ' ').trim().length > 0 : false;
  }, [content]);

  // Auto-switch to "Refine" if user selects text, back to "Insert" if they clear selection
  useEffect(() => {
    const handleSelectionChange = () => {
        if (isProcessing) return;
        const sel = window.getSelection();
        const hasSelection = sel && sel.rangeCount > 0 && !sel.isCollapsed && sel.toString().trim().length > 0;
        
        if (hasSelection) {
            // If user has manually picked 'replace', don't override. Otherwise suggest refine.
            if (action !== 'replace' && action !== 'refine') {
                setAction('refine');
            }
        } else {
             // If selection cleared and we were in refine mode, fallback to insert
             if (action === 'refine') {
                 setAction('insert');
             }
        }
    };
    
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => document.removeEventListener('selectionchange', handleSelectionChange);
  }, [action, isProcessing]);

  // Ensure we don't stay in Refine mode if content is empty (e.g. deleted all)
  useEffect(() => {
      if (!hasContent && action === 'refine') {
          setAction('insert');
      }
  }, [hasContent, action]);

  const handleGenerate = () => {
    if (!prompt.trim() || isProcessing) return;
    const finalPrompt = `[Tone: ${tone}] ${prompt}`;
    
    let operation = 'generate_content';
    let mode: 'insert' | 'replace' | 'edit' = 'insert';
    let useSelection = false;

    if (action === 'replace') {
        mode = 'replace';
    } else if (action === 'refine') {
        operation = 'edit_content';
        useSelection = true;
    }

    performAIAction(operation as any, finalPrompt, { mode, useSelection }, savedRange);
    setPrompt('');
    setSavedRange(null);
  };

  const handleFocus = () => {
      const sel = window.getSelection();
      if (sel && sel.rangeCount > 0) {
          setSavedRange(sel.getRangeAt(0).cloneRange());
      }
  };

  return (
    <div className="flex flex-col h-full justify-center gap-1.5 px-2 min-w-[320px] max-w-[420px]">
        {/* Output Action Selector */}
        <div className="flex items-center gap-2">
            <div className="flex bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 gap-0.5">
                <button 
                    onClick={() => setAction('insert')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${action === 'insert' ? 'bg-white dark:bg-slate-600 text-indigo-600 dark:text-indigo-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    <ArrowRight size={10} /> Insert
                </button>
                <button 
                    onClick={() => setAction('refine')}
                    disabled={!hasContent}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${action === 'refine' ? 'bg-white dark:bg-slate-600 text-purple-600 dark:text-purple-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'} ${!hasContent ? 'opacity-50 cursor-not-allowed' : ''}`}
                    title={!hasContent ? "Document is empty" : "Refine existing content"}
                >
                    <RefreshCw size={10} /> Refine
                </button>
                <button 
                    onClick={() => setAction('replace')}
                    className={`flex items-center gap-1.5 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide rounded-md transition-all ${action === 'replace' ? 'bg-white dark:bg-slate-600 text-amber-600 dark:text-amber-300 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200'}`}
                >
                    <FilePlus size={10} /> New Doc
                </button>
            </div>
        </div>

        {/* Input Bar */}
        <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm h-8 group">
            <ToneSelector tone={tone} setTone={setTone} />
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                onFocus={handleFocus}
                placeholder={action === 'refine' ? "Describe how to change selection..." : action === 'replace' ? "Describe the document to create..." : "Describe what to write..."}
                className="flex-1 min-w-0 border-none outline-none text-xs px-2.5 text-slate-700 dark:text-slate-200 placeholder:text-slate-400 bg-transparent h-full"
                disabled={isProcessing}
            />
            <div className="h-4 w-[1px] bg-slate-200 dark:bg-slate-700"></div>
            <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isProcessing}
                className="p-1.5 m-0.5 rounded-md hover:bg-indigo-50 dark:hover:bg-slate-700 text-indigo-600 dark:text-indigo-400 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex-shrink-0 w-8 flex items-center justify-center"
                title="Generate Content"
            >
                {isProcessing ? <LoadingSpinner className="w-3.5 h-3.5" /> : <Send size={14} />}
            </button>
        </div>
    </div>
  );
};
