
import React, { useState } from 'react';
import { Send, Sparkles, Loader2 } from 'lucide-react';
import { useAI } from '../../../../../hooks/useAI';

export const QuickPromptTool: React.FC = () => {
  const { performAIAction, isProcessing } = useAI();
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (!prompt.trim() || isProcessing) return;
    performAIAction('generate_content', prompt);
    setPrompt('');
  };

  return (
    <div className="flex flex-col h-full justify-center gap-1.5 px-2 min-w-[240px] max-w-[340px]">
        <label className="text-[10px] font-bold text-indigo-600 uppercase tracking-wide flex items-center gap-1.5">
            <Sparkles size={10} className="fill-indigo-100"/> Write with AI
        </label>
        <div className="flex items-center bg-white border border-slate-300 rounded-lg focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 transition-all shadow-sm h-8 group">
            <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleGenerate()}
                placeholder="Describe what to write..."
                className="flex-1 min-w-0 border-none outline-none text-xs px-2.5 text-slate-700 placeholder:text-slate-400 bg-transparent h-full rounded-l-lg"
                disabled={isProcessing}
            />
            <div className="h-4 w-[1px] bg-slate-200"></div>
            <button
                onClick={handleGenerate}
                disabled={!prompt.trim() || isProcessing}
                className="p-1.5 m-0.5 rounded-md hover:bg-indigo-50 text-indigo-600 disabled:opacity-40 disabled:hover:bg-transparent transition-colors flex-shrink-0 w-8 flex items-center justify-center"
                title="Generate Content"
            >
                {isProcessing ? <Loader2 size={14} className="animate-spin"/> : <Send size={14} />}
            </button>
        </div>
    </div>
  );
};
