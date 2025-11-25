import React, { useState } from 'react';
import { PenLine, Sparkles, X } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useAI } from '../../../../../hooks/useAI';

export const WriteWithAITool: React.FC = () => {
  const { performAIAction } = useAI();
  const [isOpen, setIsOpen] = useState(false);
  const [prompt, setPrompt] = useState('');

  const handleGenerate = () => {
    if (prompt.trim()) {
        performAIAction('generate_content', prompt);
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
            title="Generate content from a prompt"
            className="text-indigo-600 hover:bg-indigo-50 hover:text-indigo-700"
        />

        {isOpen && (
            <div 
                className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={() => setIsOpen(false)}
            >
                <div 
                    className="bg-white w-full max-w-lg rounded-xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95 duration-200 m-4"
                    onClick={e => e.stopPropagation()}
                >
                    <div className="bg-gradient-to-r from-indigo-600 to-blue-600 px-6 py-4 flex justify-between items-center">
                        <h3 className="text-white font-bold text-lg flex items-center gap-2">
                            <Sparkles size={20} className="text-yellow-300"/> 
                            Write with AI
                        </h3>
                        <button onClick={() => setIsOpen(false)} className="text-white/80 hover:text-white hover:bg-white/10 p-1 rounded-full transition-colors">
                            <X size={20} />
                        </button>
                    </div>
                    
                    <div className="p-6">
                        <label className="block text-sm font-semibold text-slate-700 mb-2">What would you like to write?</label>
                        <textarea 
                            value={prompt}
                            onChange={(e) => setPrompt(e.target.value)}
                            placeholder="E.g., Write a professional email announcing a project delay, or draft a blog post about the benefits of meditation..."
                            className="w-full h-32 border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none resize-none mb-4"
                            autoFocus
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                                    handleGenerate();
                                }
                            }}
                        />
                        
                        <div className="flex justify-end gap-3">
                            <button 
                                onClick={() => setIsOpen(false)}
                                className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleGenerate}
                                disabled={!prompt.trim()}
                                className="px-4 py-2 text-sm font-medium bg-indigo-600 text-white hover:bg-indigo-700 rounded-lg shadow-md shadow-indigo-200 transition-all disabled:opacity-50 disabled:shadow-none flex items-center gap-2"
                            >
                                <PenLine size={16} /> Generate
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )}
    </>
  );
};