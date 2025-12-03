
import React, { useState, useEffect } from 'react';
import { 
  X, Maximize2, ListPlus, BookOpen, History, ListOrdered, 
  Lightbulb, TrendingUp, Book, BarChart, Feather, ArrowRight,
  Check, RefreshCw, Copy, Sparkles, MessageSquare, ZoomIn, ArrowLeft, Settings2
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
  
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  const [mobileView, setMobileView] = useState<'editor' | 'sidebar'>('editor');

  useEffect(() => {
    if (isOpen) {
      setInputText(initialText);
      setResult('');
      setActiveTab('input');
      setMobileView('editor');
    }
  }, [isOpen, initialText]);

  const handleGenerate = async () => {
    if (!inputText.trim()) return;
    
    setIsGenerating(true);
    setResult('');
    setActiveTab('preview');
    setMobileView('editor');

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
      Do not wrap in markdown code blocks.
    `;

    try {
      const response = await generateAIContent('generate_content', '', prompt, 'gemini-3-pro-preview');
      
      let cleanJson = response.trim();
      const codeBlockMatch = cleanJson.match(/```(?:json)?([\s\S]*?)```/);
      if (codeBlockMatch) cleanJson = codeBlockMatch[1].trim();
      
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-[4px] transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
      />
      
      <div 
        className={`
            relative w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-500 z-20
            
            /* Unified Floating Styles */
            h-[75vh] md:h-[85vh] 
            rounded-2xl md:rounded-3xl 
            border border-white/20 dark:border-slate-700 
            ring-1 ring-black/5 dark:ring-white/5
            
            md:max-w-6xl 
            
            animate-in zoom-in-95 ease-out
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Left Panel: Configuration */}
        <div className={`
            flex-col bg-slate-50/90 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800 backdrop-blur-xl shrink-0 transition-all duration-300 z-20
            md:w-[360px] md:flex
            ${mobileView === 'sidebar' ? 'flex w-full h-full pt-8 md:pt-0' : 'hidden'}
        `}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center justify-between">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {/* Mobile Back Button */}
                        <button 
                            onClick={() => setMobileView('editor')}
                            className="md:hidden p-1 -ml-2 mr-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="p-1.5 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
                            <ZoomIn size={18} />
                        </div>
                        Smart Expander
                    </h2>
                    {/* Mobile Close */}
                    <button onClick={onClose} className="md:hidden text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-9 md:ml-0">Enrich content with depth and context.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
                <div className="space-y-4">
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

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !inputText.trim()}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-blue-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18} />}
                    {isGenerating ? 'Expanding...' : 'Generate Expansion'}
                </button>
            </div>
        </div>

        {/* Right Panel: Result */}
        <div className={`
            flex-col bg-[#f8fafc] dark:bg-slate-950 min-w-0 relative flex-1
            md:flex
            ${mobileView === 'editor' ? 'flex w-full h-full pt-8 md:pt-0' : 'hidden'}
        `}>
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
                {/* Mobile Sidebar Toggle */}
                <button 
                    onClick={() => setMobileView('sidebar')}
                    className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg flex items-center gap-1.5 transition-colors"
                >
                    <Settings2 size={20} />
                    <span className="text-xs font-bold">Settings</span>
                </button>

                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                    <button 
                        onClick={() => setActiveTab('input')}
                        className={`px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${activeTab === 'input' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Original
                    </button>
                    <button 
                        onClick={() => { if(result || isGenerating) setActiveTab('preview'); }}
                        disabled={!result && !isGenerating}
                        className={`px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        Expanded {result && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                    </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-hidden relative">
                {/* Input View */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${activeTab === 'input' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 -translate-x-10 pointer-events-none'}`}>
                    <textarea 
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 w-full p-6 md:p-8 resize-none outline-none text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent placeholder:text-slate-400 font-serif"
                        placeholder="Paste or type text to expand..."
                    />
                    <div className="px-6 md:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex justify-between font-medium shrink-0">
                        <span>{inputText.split(/\s+/).filter(w => w.length > 0).length} words</span>
                        <span>{inputText.length} characters</span>
                    </div>
                </div>

                {/* Preview View */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 bg-slate-50 dark:bg-slate-950 ${activeTab === 'preview' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-10 pointer-events-none'}`}>
                    {result ? (
                        <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-500">
                            <div 
                                className="prose prose-sm md:prose-base dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800"
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
                                        Select a mode in Settings and click Generate to transform your text into something more comprehensive.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Result Actions */}
            <div className="h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-end px-6 gap-3 shrink-0">
                {result && activeTab === 'preview' && (
                    <>
                        <button 
                            onClick={() => navigator.clipboard.writeText(result.replace(/<[^>]*>?/gm, ''))}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <Copy size={18} /> <span className="hidden sm:inline">Copy</span>
                        </button>
                        <button 
                            onClick={() => { onInsert(result); onClose(); }}
                            className="px-8 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-blue-200/50 dark:shadow-none transition-all flex items-center gap-2 active:scale-95"
                        >
                            <ArrowRight size={20} /> Insert
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
