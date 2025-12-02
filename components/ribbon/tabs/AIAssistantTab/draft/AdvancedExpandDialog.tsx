
import React, { useState } from 'react';
import { 
  X, Maximize2, ListPlus, BookOpen, History, ListOrdered, 
  Lightbulb, TrendingUp, Book, BarChart, Feather, ArrowRight,
  Check, RefreshCw, Copy, Sparkles, MessageSquare, ZoomIn, ArrowLeft
} from 'lucide-react';
import { generateAIContent } from '../../../../../services/geminiService';
import { useEditor } from '../../../../../contexts/EditorContext';
import { jsonToHtml } from '../../../../../utils/documentConverter';

interface AdvancedExpandDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onInsert: (text: string) => void;
}

const EXPAND_MODES = [
  { id: 'detail', label: 'Detail Expansion', icon: Maximize2, desc: 'Add descriptions, context, and depth.' },
  { id: 'example', label: 'Add Examples', icon: ListPlus, desc: 'Provide relevant examples to support points.' },
  { id: 'explain', label: 'Explain / Breakdown', icon: BookOpen, desc: 'Deep dive explanation of the concepts.' },
  { id: 'context', label: 'Background Context', icon: History, desc: 'Add historical or situational background.' },
  { id: 'steps', label: 'Step-by-Step', icon: ListOrdered, desc: 'Convert to instructional steps.' },
  { id: 'reasons', label: 'Reasons & Arguments', icon: Lightbulb, desc: 'Add supporting arguments or benefits.' },
  { id: 'future', label: 'Future Outlook', icon: TrendingUp, desc: 'Add predictions and future trends.' },
  { id: 'definition', label: 'Add Definitions', icon: Book, desc: 'Define complex terms used in text.' },
  { id: 'data', label: 'Supporting Data', icon: BarChart, desc: 'Add relevant statistics and facts.' },
  { id: 'creative', label: 'Creative Writing', icon: Feather, desc: 'Add emotional depth and storytelling.' },
];

export const AdvancedExpandDialog: React.FC<AdvancedExpandDialogProps> = ({
  isOpen,
  onClose,
  initialText,
  onInsert
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [selectedMode, setSelectedMode] = useState('detail');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  
  const [mobileTab, setMobileTab] = useState<'settings' | 'preview'>('settings');

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setResult('');
    // Auto-switch to preview on mobile
    setMobileTab('preview');

    const modeConfig = EXPAND_MODES.find(m => m.id === selectedMode);
    
    const prompt = `
      TASK: Expand the following text using the "${modeConfig?.label}" method.
      
      METHOD DESCRIPTION: ${modeConfig?.desc}
      
      INSTRUCTIONS:
      1. Analyze the INPUT TEXT.
      2. Elaborate significantly based on the selected method.
      3. Maintain the original core meaning but add value.
      4. If "Step-by-Step" is selected, format as a list.
      5. If "Data" is selected, use plausible general statistics or placeholders if real data isn't known.
      
      INPUT TEXT:
      "${inputText}"
      
      OUTPUT FORMAT:
      Return a VALID JSON object matching the ProDoc schema (document.blocks array).
      Use appropriate block types (paragraph, list, heading).
    `;

    try {
      const response = await generateAIContent('generate_content', '', prompt, 'gemini-3-pro-preview');
      
      let cleanJson = response.trim();
      const codeBlockMatch = cleanJson.match(/```(?:json)?([\s\S]*?)```/);
      if (codeBlockMatch) cleanJson = codeBlockMatch[1].trim();
      
      // Fallback manual cleanup for common LLM JSON artifacts
      if (cleanJson.indexOf('{') > 0) cleanJson = cleanJson.substring(cleanJson.indexOf('{'));
      if (cleanJson.lastIndexOf('}') < cleanJson.length - 1) cleanJson = cleanJson.substring(0, cleanJson.lastIndexOf('}') + 1);

      try {
          const parsed = JSON.parse(cleanJson);
          
          if (parsed.error) {
              setResult(`<div class="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">${parsed.error}</div>`);
              return;
          }

          const html = jsonToHtml(parsed);
          setResult(html);
      } catch (e) {
          console.error("JSON Parse Error", e);
          // Fallback text render if parsing failed but it wasn't an explicit error message
          setResult(`<p>${response.replace(/\n/g, '<br/>')}</p>`);
      }
    } catch (e) {
      console.error(e);
      setResult('<p class="text-red-500">Generation failed. Please try again.</p>');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-6xl h-[75vh] md:h-[80vh] rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Panel: Configuration */}
        <div className={`
            flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shrink-0 transition-all duration-300
            md:w-[400px] md:flex
            ${mobileTab === 'settings' ? 'flex w-full h-full' : 'hidden'}
        `}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <ZoomIn size={18} />
                        </div>
                        Smart Expander
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Enrich your content with precision.</p>
                </div>
                {/* Mobile Close Button */}
                <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <div className="space-y-4">
                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">Original Text</label>
                        <textarea 
                            value={inputText}
                            onChange={(e) => setInputText(e.target.value)}
                            className="w-full h-32 p-3 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl resize-none focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 dark:text-slate-300 shadow-sm"
                            placeholder="Select text in document or type here..."
                        />
                    </div>

                    <div>
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-3">Expansion Mode</label>
                        <div className="grid grid-cols-1 gap-2">
                            {EXPAND_MODES.map((mode) => (
                                <button
                                    key={mode.id}
                                    onClick={() => setSelectedMode(mode.id)}
                                    className={`flex items-center p-3 rounded-xl border text-left transition-all group ${
                                        selectedMode === mode.id 
                                        ? 'bg-blue-600 border-blue-600 text-white shadow-md' 
                                        : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-blue-300 dark:hover:border-slate-500'
                                    }`}
                                >
                                    <div className={`p-2 rounded-lg mr-3 shrink-0 ${selectedMode === mode.id ? 'bg-white/20' : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:text-blue-600'}`}>
                                        <mode.icon size={18} />
                                    </div>
                                    <div>
                                        <div className="text-sm font-bold">{mode.label}</div>
                                        <div className={`text-[10px] mt-0.5 ${selectedMode === mode.id ? 'text-blue-100' : 'text-slate-400'}`}>
                                            {mode.desc}
                                        </div>
                                    </div>
                                    {selectedMode === mode.id && <Check size={16} className="ml-auto" />}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !inputText.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16} />}
                    {isGenerating ? 'Expanding...' : 'Generate Expansion'}
                </button>
            </div>
        </div>

        {/* Right Panel: Result */}
        <div className={`
            flex-col bg-slate-100 dark:bg-slate-950 min-w-0 relative flex-1
            md:flex
            ${mobileTab === 'preview' ? 'flex w-full h-full' : 'hidden'}
        `}>
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setMobileTab('settings')}
                        className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <ArrowLeft size={18} /> 
                        <span className="text-xs font-bold">Settings</span>
                    </button>

                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide flex items-center gap-2">
                        Result Preview
                        {result && <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>}
                    </span>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {result ? (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 md:p-8">
                        <style>{`
                            .preview-result {
                                font-family: 'Inter', sans-serif;
                            }
                            .preview-result * {
                                line-height: 1.6 !important;
                                height: auto !important;
                                width: auto !important;
                                max-width: 100% !important;
                                position: static !important;
                            }
                            .preview-result ul, .preview-result ol {
                                padding-left: 1.5rem !important;
                                list-style-position: outside !important;
                                margin-top: 0.5rem !important;
                                margin-bottom: 0.5rem !important;
                            }
                            .preview-result li {
                                margin-bottom: 0.5rem !important;
                            }
                            .preview-result p {
                                margin-bottom: 1rem !important;
                            }
                            .preview-result h1, .preview-result h2, .preview-result h3, .preview-result h4 {
                                margin-top: 1.5rem !important;
                                margin-bottom: 0.75rem !important;
                                line-height: 1.3 !important;
                            }
                        `}</style>
                        <div 
                            className="preview-result prose prose-slate dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 md:p-10 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 min-h-[500px]"
                            dangerouslySetInnerHTML={{ __html: result }}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        {isGenerating ? (
                            <div className="space-y-4">
                                <div className="relative mx-auto w-16 h-16">
                                    <div className="absolute inset-0 border-4 border-blue-100 dark:border-slate-800 rounded-full"></div>
                                    <div className="absolute inset-0 border-4 border-blue-500 rounded-full border-t-transparent animate-spin"></div>
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Expanding your ideas...</p>
                                    <p className="text-xs mt-1 opacity-70">Adding depth, context, and details.</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-sm">
                                <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                                    <MessageSquare size={32} className="text-blue-300"/>
                                </div>
                                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Ready to Expand</h3>
                                <p className="text-sm leading-relaxed opacity-70">
                                    Select a mode {window.innerWidth >= 768 ? 'on the left' : 'in Settings'} to transform "{inputText.substring(0, 30)}..." into something more comprehensive.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Result Actions */}
            <div className="h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end px-6 gap-3 shrink-0">
                {result && (
                    <>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result.replace(/<[^>]*>?/gm, ''))}
                            className="px-4 py-2 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-2 transition-colors"
                        >
                            <Copy size={16} /> <span className="hidden sm:inline">Copy</span>
                        </button>
                        <button 
                            onClick={() => { onInsert(result); onClose(); }}
                            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                            <ArrowRight size={18} /> Insert
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
