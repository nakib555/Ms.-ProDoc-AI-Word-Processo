
import React, { useState, useEffect } from 'react';
import { PenLine, Sparkles, X, ArrowRight, FileText, Edit3, MessageCircle, Wand2, Check, Loader2 } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useAI } from '../../../../../hooks/useAI';
import { useEditor } from '../../../../../contexts/EditorContext';

type GenMode = 'insert' | 'replace' | 'edit';
type ToneType = 'Professional' | 'Casual' | 'Confident' | 'Friendly' | 'Creative' | 'Concise';

const TONES: { id: ToneType; label: string; color: string; desc: string }[] = [
    { id: 'Professional', label: 'Professional', color: 'bg-blue-100 text-blue-700 border-blue-200', desc: 'Authoritative & polished' },
    { id: 'Casual', label: 'Casual', color: 'bg-orange-100 text-orange-700 border-orange-200', desc: 'Relaxed & conversational' },
    { id: 'Confident', label: 'Confident', color: 'bg-purple-100 text-purple-700 border-purple-200', desc: 'Bold & decisive' },
    { id: 'Friendly', label: 'Friendly', color: 'bg-green-100 text-green-700 border-green-200', desc: 'Warm & approachable' },
    { id: 'Creative', label: 'Creative', color: 'bg-pink-100 text-pink-700 border-pink-200', desc: 'Imaginative & vivid' },
    { id: 'Concise', label: 'Concise', color: 'bg-slate-100 text-slate-700 border-slate-200', desc: 'Direct & to the point' },
];

export const WriteWithAITool: React.FC = () => {
  const { performAIAction } = useAI();
  const { aiState } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenMode>('insert');
  const [tone, setTone] = useState<ToneType>('Professional');
  const [hasSelection, setHasSelection] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);

  useEffect(() => {
    if (isOpen) {
        const selection = window.getSelection();
        const hasSel = !!(selection && selection.rangeCount > 0 && !selection.isCollapsed);
        setHasSelection(hasSel);
        
        // Capture range to restore later
        if (selection && selection.rangeCount > 0) {
            setSavedRange(selection.getRangeAt(0).cloneRange());
        }

        // Default to 'edit' mode if there's a selection, otherwise 'insert'
        setMode(hasSel ? 'edit' : 'insert');
        setPrompt('');
    }
  }, [isOpen]);

  const handleGenerate = () => {
    if (prompt.trim()) {
        // Construct a directive for the model that embeds the tone instruction and manual persona
        const enhancedPrompt = `[Tone: ${tone}] ${prompt}`;
        performAIAction('generate_content', enhancedPrompt, { 
            mode: mode === 'replace' ? 'replace' : 'insert',
            useSelection: mode === 'edit'
        }, savedRange); // Pass saved range to restore focus
        setIsOpen(false);
    }
  };

  // Dynamic UI based on AI State
  let Icon = Sparkles;
  let label = "Write with AI";
  let className = "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 bg-indigo-50/50 border border-indigo-100";

  if (aiState === 'thinking') {
      Icon = Loader2;
      label = "Thinking...";
      className = "text-amber-600 bg-amber-50 border border-amber-200 animate-pulse";
  } else if (aiState === 'writing') {
      Icon = PenLine;
      label = "Generating...";
      className = "text-green-600 bg-green-50 border border-green-200 animate-pulse";
  }

  return (
    <>
        <RibbonButton 
            icon={Icon} 
            label={label} 
            onClick={() => setIsOpen(true)} 
            title="Generate content, create tables, or edit text with AI"
            className={`${className} ${aiState === 'thinking' ? 'animate-[spin_3s_linear_infinite_reverse]' : ''}`}
        />

        {isOpen && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-md animate-in fade-in duration-200 p-4"
                onClick={() => setIsOpen(false)}
            >
                <div 
                    className="bg-white dark:bg-slate-900 w-full max-w-2xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[90vh]"
                    role="dialog"
                    aria-modal="true"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 flex justify-between items-center shrink-0">
                        <div>
                            <h3 className="text-white font-bold text-xl flex items-center gap-2.5">
                                <Wand2 size={24} className="text-yellow-300"/> 
                                Magic Editor
                            </h3>
                            <p className="text-indigo-100 text-xs mt-1 font-medium opacity-90 tracking-wide">HATF-Class Intelligence • Powered by Gemini 2.5</p>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6 md:p-8 overflow-y-auto custom-scrollbar">
                        {/* Prompt Input */}
                        <div className="mb-6 relative">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-2 flex justify-between">
                                <span>Your Directive</span>
                                <span className="font-normal text-indigo-600 dark:text-indigo-400 cursor-help" title="Try: 'Draft an email to client', 'Create a comparison table for X and Y'">Examples</span>
                            </label>
                            <div className="relative group">
                                <textarea 
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={mode === 'edit' ? "e.g., 'Make this text more concise', 'Convert these bullet points to a paragraph'" : "e.g., 'Write a blog post about React hooks', 'Draft a meeting agenda', 'Create a table of Q1 sales'"}
                                    className="w-full h-32 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 rounded-xl p-4 text-base text-slate-800 dark:text-slate-100 focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 outline-none resize-none shadow-inner transition-all placeholder:text-slate-400"
                                    autoFocus
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault();
                                            handleGenerate();
                                        }
                                    }}
                                />
                                <div className="absolute bottom-3 right-3">
                                    <div className="p-1.5 bg-white dark:bg-slate-700 rounded-lg shadow-sm border border-slate-100 dark:border-slate-600">
                                        <MessageCircle size={16} className="text-slate-400"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tone Selector */}
                        <div className="mb-8">
                            <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-3">Tone & Style</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                                {TONES.map((t) => (
                                    <button
                                        key={t.id}
                                        onClick={() => setTone(t.id)}
                                        className={`px-3 py-2 rounded-lg text-left border transition-all duration-200 group ${
                                            tone === t.id 
                                            ? `${t.color} ring-2 ring-offset-1 ring-indigo-500/30 shadow-sm` 
                                            : 'bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-750'
                                        }`}
                                    >
                                        <div className="flex items-center gap-1.5">
                                            {tone === t.id && <Check size={12} strokeWidth={3} className="shrink-0"/>}
                                            <span className="text-xs font-bold">{t.label}</span>
                                        </div>
                                        <div className="text-[10px] opacity-70 mt-0.5 truncate">{t.desc}</div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Mode Selection */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <button 
                                onClick={() => setMode('insert')}
                                className={`relative flex flex-col items-center p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                                    mode === 'insert' 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-md' 
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                                }`}
                            >
                                <div className={`p-2 rounded-full mb-2 ${mode === 'insert' ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                    <ArrowRight size={20} />
                                </div>
                                <span className="text-sm font-bold">Insert</span>
                                <span className="text-[10px] opacity-70 mt-1">Add at cursor position</span>
                            </button>
                            
                            <button 
                                onClick={() => setMode('edit')}
                                disabled={!hasSelection}
                                className={`relative flex flex-col items-center p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                                    mode === 'edit' 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-md' 
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                                } ${!hasSelection ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                            >
                                <div className={`p-2 rounded-full mb-2 ${mode === 'edit' ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                    <Edit3 size={20} />
                                </div>
                                <span className="text-sm font-bold">Refine</span>
                                <span className="text-[10px] opacity-70 mt-1">{hasSelection ? 'Modify selected text' : 'Select text first'}</span>
                            </button>

                            <button 
                                onClick={() => setMode('replace')}
                                className={`relative flex flex-col items-center p-4 rounded-xl border-2 text-center transition-all duration-200 ${
                                    mode === 'replace' 
                                    ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-500 text-indigo-700 dark:text-indigo-300 shadow-md' 
                                    : 'bg-white dark:bg-slate-800 border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:border-indigo-200 dark:hover:border-indigo-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                                }`}
                            >
                                <div className={`p-2 rounded-full mb-2 ${mode === 'replace' ? 'bg-indigo-200 dark:bg-indigo-800 text-indigo-700 dark:text-indigo-200' : 'bg-slate-100 dark:bg-slate-700 text-slate-500'}`}>
                                    <FileText size={20} />
                                </div>
                                <span className="text-sm font-bold">New Doc</span>
                                <span className="text-[10px] opacity-70 mt-1">Start from scratch</span>
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-6 py-5 bg-slate-50 dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="px-5 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 rounded-xl transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleGenerate}
                            disabled={!prompt.trim()}
                            className="px-6 py-2.5 text-sm font-bold bg-indigo-600 text-white hover:bg-indigo-700 rounded-xl shadow-lg shadow-indigo-200 dark:shadow-none hover:shadow-indigo-300 transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center gap-2 transform active:scale-[0.98]"
                        >
                            <PenLine size={18} /> 
                            {mode === 'insert' ? 'Generate Content' : mode === 'edit' ? 'Update Selection' : 'Rewrite Document'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
