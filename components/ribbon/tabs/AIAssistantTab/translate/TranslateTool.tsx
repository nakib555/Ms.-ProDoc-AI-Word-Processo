
import React, { useState, useEffect } from 'react';
import { Languages, Globe, Check, ChevronDown, FileText, Type, ArrowRight } from 'lucide-react';
import { DropdownRibbonButton } from '../common/AITools';
import { MenuPortal } from '../../../common/MenuPortal';
import { useAIAssistantTab } from '../AIAssistantTabContext';
import { useAI } from '../../../../../hooks/useAI';
import { useEditor } from '../../../../../contexts/EditorContext';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const LANGUAGES = [
    'English', 'Spanish', 'French', 'German', 'Italian', 
    'Portuguese', 'Chinese (Simplified)', 'Japanese', 'Korean', 
    'Russian', 'Arabic', 'Hindi', 'Dutch', 'Swedish', 'Polish'
];

export const TranslateTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useAIAssistantTab();
  const { performAIAction, isProcessing } = useAI();
  const { editorRef, setSelectionMode, setSelectionAction, setIsKeyboardLocked } = useEditor();
  
  const [targetLang, setTargetLang] = useState('Spanish');
  const [isLangOpen, setIsLangOpen] = useState(false);
  
  const menuId = 'translate_tool_menu';

  // Reset dropdown state when menu closes to ensure smooth first-time animation on reopen
  useEffect(() => {
    if (activeMenu !== menuId) {
        setIsLangOpen(false);
    }
  }, [activeMenu]);

  const handleTranslate = (scope: 'selection' | 'document') => {
    if (scope === 'selection') {
        // Start Selection Mode for Translation
        setSelectionMode(true);
        setIsKeyboardLocked(true);
        setSelectionAction({
            label: 'Translate Selection',
            onComplete: () => {
                const selection = window.getSelection();
                if (!selection || selection.isCollapsed || selection.toString().trim().length === 0) {
                    alert("Please select text to translate first.");
                    return;
                }
                
                const prompt = `Translate to ${targetLang}.`;
                performAIAction('translate_content' as any, prompt, { mode: 'insert' });
            }
        });
        closeMenu();
    } 
    else if (scope === 'document') {
        if (!editorRef.current || !editorRef.current.innerText.trim()) {
            alert("The document appears to be empty.");
            return;
        }
        
        if (window.confirm(`Translate entire document to ${targetLang}? This may take a moment for large documents.`)) {
            const prompt = `Translate the entire document content to ${targetLang}.`;
            performAIAction('translate_content' as any, prompt, { mode: 'replace' });
            closeMenu();
        }
    }
  };

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={Languages} 
            label="Translate" 
        />
        
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={280}>
             <div className="flex flex-col bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 overflow-hidden rounded-lg" onMouseDown={e => e.stopPropagation()}>
                 
                 {/* Language Selector Header */}
                 <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/30">
                     <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 px-1">Target Language</div>
                     <button 
                        onClick={() => setIsLangOpen(!isLangOpen)}
                        className={`w-full flex items-center justify-between bg-white dark:bg-slate-800 border ${isLangOpen ? 'border-blue-500 ring-1 ring-blue-500/20' : 'border-slate-200 dark:border-slate-700 hover:border-blue-400'} rounded-md px-2.5 py-1.5 text-xs font-medium transition-all shadow-sm group`}
                     >
                         <div className="flex items-center gap-2">
                             <Globe size={12} className="text-blue-600 dark:text-blue-400"/>
                             <span>{targetLang}</span>
                         </div>
                         <ChevronDown size={12} className={`text-slate-400 transition-transform duration-300 ${isLangOpen ? 'rotate-180' : ''}`}/>
                     </button>
                     
                     {/* Language Dropdown List (Inline with Smooth Expansion) */}
                     <div 
                        className={`grid transition-all duration-300 ease-[cubic-bezier(0.4,0,0.2,1)] ${isLangOpen ? 'grid-rows-[1fr] opacity-100 mt-2' : 'grid-rows-[0fr] opacity-0 mt-0'}`}
                     >
                        <div className="overflow-hidden min-h-0">
                            <div className="max-h-40 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 border border-slate-100 dark:border-slate-700 rounded-md bg-white dark:bg-slate-800 shadow-inner">
                                {LANGUAGES.map(lang => (
                                    <button
                                        key={lang}
                                        onClick={() => { setTargetLang(lang); setIsLangOpen(false); }}
                                        className={`w-full text-left px-3 py-1.5 text-xs hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 flex items-center justify-between ${targetLang === lang ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 font-medium' : ''}`}
                                    >
                                        {lang}
                                        {targetLang === lang && <Check size={10}/>}
                                    </button>
                                ))}
                            </div>
                        </div>
                     </div>
                 </div>

                 {/* Translation Actions */}
                 <div className="p-2 space-y-1">
                     
                     {/* Option 1: Selection */}
                     <button 
                        onClick={() => handleTranslate('selection')}
                        disabled={isProcessing}
                        className="w-full group flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <div className="p-2 bg-indigo-50 dark:bg-indigo-900/20 text-indigo-600 dark:text-indigo-400 rounded-md group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                            <Type size={16} />
                        </div>
                        <div className="text-left flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-0.5">Translate Selection</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                Select text on screen to translate to {targetLang}.
                            </div>
                        </div>
                        <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity text-indigo-500">
                             {isProcessing ? <LoadingSpinner className="w-3.5 h-3.5" /> : <ArrowRight size={14}/>}
                        </div>
                     </button>

                     {/* Option 2: Whole Document */}
                     <button 
                        onClick={() => handleTranslate('document')}
                        disabled={isProcessing}
                        className="w-full group flex items-start gap-3 p-2.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-all border border-transparent hover:border-slate-200 dark:hover:border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                     >
                        <div className="p-2 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-md group-hover:bg-white dark:group-hover:bg-slate-700 shadow-sm transition-colors">
                            <FileText size={16} />
                        </div>
                        <div className="text-left flex-1">
                            <div className="text-xs font-bold text-slate-800 dark:text-slate-100 mb-0.5">Translate Document</div>
                            <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">
                                Translate entire file to {targetLang}.
                            </div>
                        </div>
                        <div className="self-center opacity-0 group-hover:opacity-100 transition-opacity text-emerald-500">
                             {isProcessing ? <LoadingSpinner className="w-3.5 h-3.5" /> : <ArrowRight size={14}/>}
                        </div>
                     </button>

                 </div>
                 
                 <div className="px-3 py-2 bg-slate-50 dark:bg-slate-800 border-t border-slate-100 dark:border-slate-700 text-[9px] text-slate-400 text-center">
                     Powered by Gemini AI • Context aware translation
                 </div>
             </div>
        </MenuPortal>
    </>
  );
};
