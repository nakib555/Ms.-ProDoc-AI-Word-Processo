
import React, { useState, useEffect } from 'react';
import { PenLine, Sparkles, X, ArrowRight, FileText, Edit3, MessageCircle } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useAI } from '../../../../../hooks/useAI';

type GenMode = 'insert' | 'replace' | 'edit';
type ToneType = 'Professional' | 'Casual' | 'Confident' | 'Friendly' | 'Creative' | 'Concise';

export const WriteWithAITool: React.FC = () => {
  const { performAIAction } = useAI();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');
  const [mode, setMode] = useState<GenMode>('insert');
  const [tone, setTone] = useState<ToneType>('Professional');
  const [hasSelection, setHasSelection] = useState(false);

  useEffect(() => {
    if (isOpen) {
        const selection = window.getSelection();
        const hasSel = !!(selection && selection.rangeCount > 0 && !selection.isCollapsed);
        setHasSelection(hasSel);
        // Default to 'edit' mode if there's a selection, otherwise 'insert'
        setMode(hasSel ? 'edit' : 'insert');
    }
  }, [isOpen]);

  const handleGenerate = () => {
    if (prompt.trim()) {
        const enhancedPrompt = `[Tone: ${tone}] ${prompt}`;
        performAIAction('generate_content', enhancedPrompt, { 
            mode: mode === 'replace' ? 'replace' : 'insert',
            useSelection: mode === 'edit'
        });
        setIsOpen(false);
        setPrompt('');
    }
  };

  return (
    <>
        <RibbonButton 
            icon={Sparkles} 
            label="Write with AI" 
            onClick={() => setIsOpen(true)} 
            title="Generate content, create tables, or edit text"
            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
        />

        {isOpen && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsOpen(false)}
            >
                <div 
                    className="bg-white w-full max-w-xl rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 m-4"
                    role="dialog"
                    aria-modal="true"
                    aria-labelledby="ai-dialog-title"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center">
                        <h3 id="ai-dialog-title" className="text-white font-bold text-lg flex items-center gap-2">
                            <Sparkles size={20} className="text-yellow-300"/> 
                            Write with AI
                        </h3>
                        <button 
                            onClick={() => setIsOpen(false)} 
                            className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors"
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <div className="mb-4">
                            <div className="flex justify-between items-center mb-2">
                                <label htmlFor="ai-prompt-textarea" className="block text-sm font-semibold text-slate-700">Prompt</label>
                                <div className="flex items-center gap-2">
                                    <MessageCircle size={14} className="text-slate-400"/>
                                    <select 
                                        value={tone}
                                        onChange={(e) => setTone(e.target.value as ToneType)}
                                        className="text-xs border-none bg-slate-100 hover:bg-slate-200 rounded-md px-2 py-1 outline-none text-slate-700 font-medium cursor-pointer transition-colors"
                                    >
                                        <option value="Professional">Professional</option>
                                        <option value="Casual">Casual</option>
                                        <option value="Confident">Confident</option>
                                        <option value="Friendly">Friendly</option>
                                        <option value="Creative">Creative</option>
                                        <option value="Concise">Concise</option>
                                    </select>
                                </div>
                            </div>
                            <textarea 
                                id="ai-prompt-textarea"
                                value={prompt}
                                onChange={(e) => setPrompt(e.target.value)}
                                placeholder={mode === 'edit' ? "How should the selected text be changed? (e.g., 'Make this more concise', 'Convert to a table')" : "What would you like to write? (e.g., 'Create a table comparing React and Vue', 'Draft a meeting agenda')"}
                                className="w-full h-28 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none shadow-inner"
                                autoFocus
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                        e.preventDefault(); // Prevent new line in textarea
                                        handleGenerate();
                                    }
                                }}
                                aria-label="AI Prompt"
                            />
                        </div>

                        <div className="mb-6">
                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-2">Action</label>
                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                                <button 
                                    onClick={() => setMode('insert')}
                                    className={`flex flex-col items-center p-3 rounded-lg border text-center transition-all ${mode === 'insert' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                    aria-pressed={mode === 'insert'}
                                >
                                    <ArrowRight size={20} className="mb-1.5 opacity-80"/>
                                    <span className="text-xs font-semibold">Insert at Cursor</span>
                                </button>
                                
                                <button 
                                    onClick={() => setMode('edit')}
                                    disabled={!hasSelection}
                                    className={`flex flex-col items-center p-3 rounded-lg border text-center transition-all ${mode === 'edit' ? 'bg-indigo-50 border-indigo-500 text-indigo-700 ring-1 ring-indigo-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'} ${!hasSelection ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    title={!hasSelection ? "Select text to edit" : ""}
                                    aria-pressed={mode === 'edit'}
                                    aria-disabled={!hasSelection}
                                >
                                    <Edit3 size={20} className="mb-1.5 opacity-80"/>
                                    <span className="text-xs font-semibold">Edit Selection</span>
                                </button>

                                <button 
                                    onClick={() => setMode('replace')}
                                    className={`flex flex-col items-center p-3 rounded-lg border text-center transition-all ${mode === 'replace' ? 'bg-red-50 border-red-500 text-red-700 ring-1 ring-red-500' : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:bg-slate-50'}`}
                                    aria-pressed={mode === 'replace'}
                                >
                                    <FileText size={20} className="mb-1.5 opacity-80"/>
                                    <span className="text-xs font-semibold">New Document</span>
                                </button>
                            </div>
                        </div>
                        
                        <div className="flex justify-end gap-3 pt-2 border-t border-slate-100">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleGenerate}
                                disabled={!prompt.trim()}
                                className="px-5 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                                aria-label={
                                    mode === 'insert' ? 'Generate content' : 
                                    mode === 'edit' ? 'Update selected text' : 
                                    'Rewrite entire document'
                                }
                                aria-disabled={!prompt.trim()}
                            >
                                <PenLine size={16} /> 
                                {mode === 'insert' ? 'Generate' : mode === 'edit' ? 'Update Text' : 'Rewrite All'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};
