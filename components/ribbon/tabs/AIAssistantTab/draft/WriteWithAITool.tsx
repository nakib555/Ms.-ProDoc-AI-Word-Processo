
import React, { useState, useEffect, useRef } from 'react';
import { PenLine, Sparkles, X, ArrowRight, FileText, Edit3, MessageCircle, Wand2, Loader2, Zap, Smile, Coffee } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useAI } from '../../../../../hooks/useAI';
import { useEditor } from '../../../../../contexts/EditorContext';

type GenMode = 'insert' | 'replace' | 'edit';
type ToneType = 'Professional' | 'Casual' | 'Confident' | 'Friendly' | 'Creative' | 'Concise';

const TONES: { id: ToneType; label: string; color: string; desc: string; icon: React.ElementType }[] = [
    { id: 'Professional', label: 'Professional', color: 'bg-blue-50 text-blue-700 border-blue-200 group-hover:border-blue-300', desc: 'Polished & clear', icon: FileText },
    { id: 'Casual', label: 'Casual', color: 'bg-orange-50 text-orange-700 border-orange-200 group-hover:border-orange-300', desc: 'Relaxed vibe', icon: Coffee },
    { id: 'Confident', label: 'Confident', color: 'bg-purple-50 text-purple-700 border-purple-200 group-hover:border-purple-300', desc: 'Bold & direct', icon: Zap },
    { id: 'Friendly', label: 'Friendly', color: 'bg-green-50 text-green-700 border-green-200 group-hover:border-green-300', desc: 'Warm & open', icon: Smile },
    { id: 'Creative', label: 'Creative', color: 'bg-pink-50 text-pink-700 border-pink-200 group-hover:border-pink-300', desc: 'Imaginative', icon: Sparkles },
    { id: 'Concise', label: 'Concise', color: 'bg-slate-50 text-slate-700 border-slate-200 group-hover:border-slate-300', desc: 'To the point', icon: Edit3 },
];

// Wrapped component to animate only the icon
const SpinningLoader = (props: any) => <Loader2 {...props} className="animate-spin" />;

export const WriteWithAITool: React.FC = () => {
  const { performAIAction } = useAI();
  const { aiState, editorRef } = useEditor();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenMode>('insert');
  const [tone, setTone] = useState<ToneType>('Professional');
  const [hasSelection, setHasSelection] = useState(false);
  const [canInsert, setCanInsert] = useState(false);
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isOpen) {
        const selection = window.getSelection();
        
        // Check for active selection (for Edit mode)
        const hasSel = !!(selection && selection.rangeCount > 0 && !selection.isCollapsed);
        setHasSelection(hasSel);
        
        // Check for cursor presence (for Insert mode)
        let isCursorInEditor = false;
        if (selection && selection.rangeCount > 0 && editorRef.current) {
            const range = selection.getRangeAt(0);
            isCursorInEditor = editorRef.current.contains(range.startContainer);
            if (isCursorInEditor) {
                setSavedRange(range.cloneRange());
            }
        }
        setCanInsert(isCursorInEditor);

        // Default mode logic
        if (hasSel) {
            setMode('edit');
        } else if (isCursorInEditor) {
            setMode('insert');
        } else {
            setMode('replace');
        }
        
        setPrompt('');
        
        // Focus textarea on open
        setTimeout(() => textAreaRef.current?.focus(), 100);
    }
  }, [isOpen, editorRef]);

  const handleGenerate = () => {
    if (prompt.trim()) {
        const enhancedPrompt = `[Tone: ${tone}] ${prompt}`;
        const operation = mode === 'edit' ? 'edit_content' : 'generate_content';
        
        performAIAction(operation, enhancedPrompt, { 
            mode: mode === 'replace' ? 'replace' : 'insert',
            useSelection: mode === 'edit'
        }, savedRange); 
        
        setIsOpen(false);
    }
  };

  let Icon: React.ElementType = Sparkles;
  let label = "Write with AI";
  let className = "text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700 bg-indigo-50/50 border border-indigo-100";

  if (aiState === 'thinking') {
      Icon = SpinningLoader;
      label = "Thinking...";
      className = "text-amber-600 bg-amber-50 border border-amber-200 cursor-wait";
  } else if (aiState === 'writing') {
      Icon = PenLine;
      label = "Writing...";
      className = "text-green-600 bg-green-50 border border-green-200 animate-pulse cursor-wait";
  }

  return (
    <>
        <RibbonButton 
            icon={Icon} 
            label={label} 
            onClick={() => { if(aiState === 'idle') setIsOpen(true); }} 
            title="Generate content, create tables, or edit text with AI"
            className={className}
        />

        {isOpen && (
            <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center md:p-4 bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={() => setIsOpen(false)}>
                {/* Dialog Container - Bottom Sheet on Mobile, Centered Modal on Desktop */}
                <div 
                    className="
                        relative w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col overflow-hidden transition-all duration-300 z-20
                        
                        /* Mobile Styles: Bottom Sheet */
                        h-[75vh] rounded-t-2xl border-t border-slate-200 dark:border-slate-700 
                        animate-in slide-in-from-bottom-full duration-300 ease-out

                        /* Desktop Styles: Centered Modal */
                        md:h-auto md:max-h-[85vh] md:max-w-2xl md:rounded-2xl md:border md:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.3)]
                        md:animate-in md:zoom-in-95
                    "
                    role="dialog"
                    aria-modal="true"
                    onClick={e => e.stopPropagation()}
                >
                    {/* Mobile Drag Handle */}
                    <div className="md:hidden w-full flex justify-center pt-3 pb-1 cursor-grab bg-white dark:bg-slate-900 absolute top-0 z-30" onClick={() => setIsOpen(false)}>
                        <div className="w-12 h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full"></div>
                    </div>

                    {/* Header */}
                    <div className="px-6 py-4 md:pt-4 pt-8 border-b border-slate-100 dark:border-slate-800 bg-white/90 dark:bg-slate-900/90 backdrop-blur-sm sticky top-0 z-20 flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-3.5">
                            <div className="p-2.5 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-2xl shadow-lg shadow-indigo-500/30 dark:shadow-indigo-900/20 text-white ring-2 ring-white dark:ring-slate-800">
                                <Wand2 size={22} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h3 className="font-bold text-lg sm:text-xl text-slate-800 dark:text-white leading-none tracking-tight">Magic Editor</h3>
                                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium mt-1 flex items-center gap-1">
                                    Powered by Gemini <Sparkles size={8} className="text-indigo-500 fill-indigo-500" />
                                </p>
                            </div>
                        </div>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-all active:scale-90"
                        >
                            <X size={22} />
                        </button>
                    </div>
                    
                    {/* Scrollable Content */}
                    <div className="flex-1 overflow-y-auto custom-scrollbar p-6 sm:p-8 space-y-8 bg-[#fcfcfd] dark:bg-slate-950">
                        
                        {/* Prompt Input Section */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider flex justify-between items-center px-1">
                                <span>Instruction</span>
                                <span className="text-[10px] bg-indigo-50 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 px-2 py-0.5 rounded-full font-semibold shadow-sm">Required</span>
                            </label>
                            <div className="relative group">
                                <textarea 
                                    ref={textAreaRef}
                                    value={prompt}
                                    onChange={(e) => setPrompt(e.target.value)}
                                    placeholder={mode === 'edit' ? "e.g., 'Make this text more concise', 'Fix grammar and tone'..." : "e.g., 'Write a project proposal', 'Draft an email to the team'..."}
                                    className="w-full h-36 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-4 text-base text-slate-800 dark:text-slate-100 placeholder:text-slate-400 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none transition-all shadow-sm focus:shadow-md"
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                            e.preventDefault();
                                            handleGenerate();
                                        }
                                    }}
                                />
                                <div className="absolute bottom-3 right-3 pointer-events-none transition-transform duration-300 group-focus-within:scale-110">
                                    <div className="p-2 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <MessageCircle size={16} className="text-indigo-500"/>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Tone Selector */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Tone & Style</label>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                                {TONES.map((t) => {
                                    const Icon = t.icon;
                                    const isSelected = tone === t.id;
                                    return (
                                        <button
                                            key={t.id}
                                            onClick={() => setTone(t.id)}
                                            className={`
                                                relative flex flex-col p-3 rounded-2xl border text-left transition-all duration-200 group h-full
                                                ${isSelected 
                                                    ? `${t.color} ring-1 ring-inset ring-black/5 shadow-md` 
                                                    : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                                                }
                                            `}
                                        >
                                            <div className="flex items-start justify-between w-full mb-2">
                                                <div className={`p-2 rounded-xl ${isSelected ? 'bg-white/60 dark:bg-black/10' : 'bg-slate-100 dark:bg-slate-800 group-hover:bg-white dark:group-hover:bg-slate-700'} transition-colors`}>
                                                    <Icon size={18} className={isSelected ? 'text-current' : 'text-slate-500 dark:text-slate-400 group-hover:text-indigo-500'} />
                                                </div>
                                                {isSelected && (
                                                    <div className="bg-white/50 dark:bg-black/20 p-0.5 rounded-full">
                                                        <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                                                    </div>
                                                )}
                                            </div>
                                            
                                            <div className="mt-auto">
                                                <div className="text-xs font-bold leading-tight">{t.label}</div>
                                                <div className="text-[10px] opacity-80 font-medium leading-tight mt-0.5">{t.desc}</div>
                                            </div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Mode Selection */}
                        <div className="space-y-3">
                            <label className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider px-1">Output Action</label>
                            <div className="grid grid-cols-3 gap-3">
                                <button 
                                    onClick={() => setMode('insert')}
                                    disabled={!canInsert}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 gap-2 group shadow-sm ${
                                        mode === 'insert' 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 ring-2 ring-offset-2 ring-indigo-500/20 dark:ring-offset-slate-900' 
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-200'
                                    } ${!canInsert ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                >
                                    <div className={`p-1.5 rounded-lg transition-colors ${mode === 'insert' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500'}`}>
                                        <ArrowRight size={18} />
                                    </div>
                                    <span className="text-xs font-bold">Insert</span>
                                </button>
                                
                                <button 
                                    onClick={() => setMode('edit')}
                                    disabled={!hasSelection}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 gap-2 group shadow-sm ${
                                        mode === 'edit' 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 ring-2 ring-offset-2 ring-indigo-500/20 dark:ring-offset-slate-900' 
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-200'
                                    } ${!hasSelection ? 'opacity-50 cursor-not-allowed grayscale' : ''}`}
                                >
                                    <div className={`p-1.5 rounded-lg transition-colors ${mode === 'edit' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500'}`}>
                                        <Edit3 size={18} />
                                    </div>
                                    <span className="text-xs font-bold">Refine</span>
                                </button>

                                <button 
                                    onClick={() => setMode('replace')}
                                    className={`relative flex flex-col items-center justify-center p-3 rounded-2xl border text-center transition-all duration-200 gap-2 group shadow-sm ${
                                        mode === 'replace' 
                                        ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30 ring-2 ring-offset-2 ring-indigo-500/20 dark:ring-offset-slate-900' 
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-indigo-200'
                                    }`}
                                >
                                    <div className={`p-1.5 rounded-lg transition-colors ${mode === 'replace' ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-400 group-hover:text-indigo-500'}`}>
                                        <FileText size={18} />
                                    </div>
                                    <span className="text-xs font-bold">New Doc</span>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="p-4 sm:p-5 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 shrink-0 flex gap-3 sticky bottom-0 z-20 shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.05)]">
                        <button 
                            onClick={() => setIsOpen(false)}
                            className="flex-1 px-4 py-3.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-2xl transition-all"
                        >
                            Cancel
                        </button>
                        <button 
                            onClick={handleGenerate}
                            disabled={!prompt.trim()}
                            className="flex-[2] px-6 py-3.5 text-sm font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl shadow-xl shadow-indigo-500/30 dark:shadow-none transition-all disabled:opacity-50 disabled:shadow-none disabled:cursor-not-allowed flex items-center justify-center gap-2.5 active:scale-95 hover:scale-[1.02]"
                        >
                            <Sparkles size={18} className="fill-indigo-200 text-indigo-100" />
                            {mode === 'insert' ? 'Generate Content' : mode === 'edit' ? 'Update Selection' : 'Create Document'}
                        </button>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
