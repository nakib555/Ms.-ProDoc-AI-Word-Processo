import React, { useState, useEffect, useRef } from 'react';
import { 
  X, FileText, List, AlignLeft, Hash, Zap, Globe, 
  Sparkles, Check, Copy, ArrowRight, Settings2, Sliders, 
  RefreshCw, MessageSquare, ArrowLeft
} from 'lucide-react';
import { generateAIContent } from '../../../../../services/geminiService';
import { useEditor } from '../../../../../contexts/EditorContext';
import { jsonToHtml } from '../../../../../utils/documentConverter';
import { getAdvancedSummaryPrompt } from '../../../../../services/prompts/tools/summary';

interface AdvancedSummarizeDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onInsert: (text: string) => void;
}

const SUMMARY_TYPES = [
  { id: 'bullet', label: 'Key Points', icon: List, desc: 'Quick bulleted list' },
  { id: 'paragraph', label: 'Standard', icon: AlignLeft, desc: 'One concise paragraph' },
  { id: 'executive', label: 'Executive', icon: FileText, desc: 'Formal business brief' },
  { id: 'headline', label: 'Headline', icon: Hash, desc: 'One-line punchy summary' },
];

const FOCUS_MODES = [
  { id: 'general', label: 'General Overview' },
  { id: 'business', label: 'Business & Results' },
  { id: 'academic', label: 'Academic & Concepts' },
  { id: 'creative', label: 'Creative & Story' },
  { id: 'technical', label: 'Technical & Data' },
];

const LANGUAGES = [
  'English (US)', 'English (UK)', 'Spanish', 'French', 'German', 
  'Chinese (Simplified)', 'Japanese', 'Portuguese', 'Italian', 'Hindi'
];

export const AdvancedSummarizeDialog: React.FC<AdvancedSummarizeDialogProps> = ({
  isOpen,
  onClose,
  initialText,
  onInsert
}) => {
  const [inputText, setInputText] = useState(initialText);
  const [config, setConfig] = useState({
    type: 'bullet',
    focus: 'general',
    length: 50, // 0 to 100
    language: 'English (US)',
    extractData: false,
    highlightInsights: false
  });

  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  const [mobileView, setMobileView] = useState<'editor' | 'sidebar'>('editor');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);
  
  const { } = useEditor();

  useEffect(() => {
    if (isOpen) {
      setInputText(initialText);
      setResult('');
      setActiveTab('input');
      setMobileView('editor');
    }
  }, [isOpen, initialText]);

  // Sync result state to editable div when result changes (e.g. new generation)
  useEffect(() => {
    if (resultRef.current && result) {
        // Only update if different to preserve cursor if we were to support live syncing (though we don't sync back to state here)
        if (resultRef.current.innerHTML !== result) {
            resultRef.current.innerHTML = result;
        }
    }
  }, [result, activeTab]); // Trigger on tab switch to restore content

  const handleGenerate = async () => {
    if (!inputText.trim()) return;

    setIsGenerating(true);
    setResult('');
    setActiveTab('preview');
    setMobileView('editor');

    const prompt = getAdvancedSummaryPrompt(inputText, config);

    try {
      // Use gemini-3-pro-preview for best quality reasoning on summaries
      const response = await generateAIContent('generate_content', '', prompt, 'gemini-3-pro-preview');
      
      // Robust JSON Extraction
      let cleanJson = response.trim();
      
      const codeBlockMatch = cleanJson.match(/```(?:json|json5)?([\s\S]*?)```/i);
      if (codeBlockMatch) {
          cleanJson = codeBlockMatch[1].trim();
      } else {
          const firstBrace = cleanJson.indexOf('{');
          const lastBrace = cleanJson.lastIndexOf('}');
          if (firstBrace !== -1 && lastBrace !== -1) {
              cleanJson = cleanJson.substring(firstBrace, lastBrace + 1);
          }
      }
      
      try {
          const parsed = JSON.parse(cleanJson);
          
          if (parsed.error) {
              setResult(`<div class="p-4 rounded-lg bg-red-50 text-red-700 text-sm border border-red-200">${parsed.error}</div>`);
              return;
          }

          const html = jsonToHtml(parsed);
          if (!html) throw new Error("Empty HTML generated from JSON");
          setResult(html);
      } catch (parseError) {
          // Attempt repair before giving up
          try {
             let fixed = cleanJson.replace(/\/\/.*$/gm, '');
             fixed = fixed.replace(/,\s*([\]}])/g, '$1');
             fixed = fixed.replace(/([{,])\s*([a-zA-Z0-9_]+)\s*:/g, '$1"$2":');
             const repaired = JSON.parse(fixed);
             const html = jsonToHtml(repaired);
             setResult(html);
             return;
          } catch (e) {}

          console.error("JSON Parse Error", parseError);
          // Fallback HTML handling
          let fallbackHtml = response
              .replace(/#+\s+(.*)/g, '<h3>$1</h3>') 
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
              .replace(/\*(.*?)\*/g, '<em>$1</em>')
              .replace(/^- (.*)/gm, '<li>$1</li>')
              .replace(/\n/g, '<br/>');
          
          if (fallbackHtml.includes('<li>')) {
              fallbackHtml = fallbackHtml.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>');
          }
          setResult(`<div class="fallback-content">${fallbackHtml}</div>`);
      }
    } catch (e) {
      console.error(e);
      setResult('<p style="color:red">Error generating summary. Please check your API key and try again.</p>');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div 
          className="absolute inset-0 bg-slate-900/50 backdrop-blur-md transition-opacity animate-in fade-in duration-300"
          onClick={onClose}
      />

      <div 
        className={`
            relative w-full bg-white dark:bg-slate-900 shadow-2xl flex flex-col md:flex-row overflow-hidden transition-all duration-500 z-20
            
            h-[75vh] md:h-[85vh] md:max-w-6xl 
            
            rounded-2xl md:rounded-3xl 
            border border-slate-200 dark:border-slate-700 
            
            animate-in zoom-in-95 ease-out
        `}
        onClick={e => e.stopPropagation()}
      >
        {/* Left Sidebar: Controls */}
        <div className={`
            flex-col bg-slate-50/90 dark:bg-slate-950/90 border-r border-slate-200 dark:border-slate-800 backdrop-blur-xl shrink-0 transition-all duration-300 z-20
            md:w-[360px] md:flex
            ${mobileView === 'sidebar' ? 'flex w-full h-full' : 'hidden'}
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

                        <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400 shadow-sm">
                            <Zap size={18} />
                        </div>
                        Summarizer
                    </h2>
                    {/* Mobile Close */}
                    <button onClick={onClose} className="md:hidden text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                <p className="text-xs text-slate-500 mt-1 ml-9 md:ml-0">Distill content into clarity.</p>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar min-h-0">
                
                {/* 1. Summary Type */}
                <div className="space-y-3">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Settings2 size={12}/> Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {SUMMARY_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setConfig(c => ({...c, type: type.id}))}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    config.type === type.id 
                                    ? 'bg-violet-600 border-violet-600 text-white shadow-md ring-1 ring-violet-600/20' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-violet-300 dark:hover:border-slate-600'
                                }`}
                            >
                                <type.icon size={18} className="mb-1.5" />
                                <span className="text-xs font-semibold">{type.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* 2. Focus & Language */}
                <div className="space-y-4">
                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Focus</label>
                        <div className="relative">
                            <select 
                                value={config.focus}
                                onChange={(e) => setConfig(c => ({...c, focus: e.target.value}))}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 shadow-sm cursor-pointer appearance-none"
                            >
                                {FOCUS_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                            </select>
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                                <ArrowRight size={12} className="rotate-90"/>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Language</label>
                        <div className="relative">
                             <select 
                                value={config.language}
                                onChange={(e) => setConfig(c => ({...c, language: e.target.value}))}
                                className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm outline-none focus:ring-2 focus:ring-violet-500 shadow-sm cursor-pointer appearance-none"
                            >
                                {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                            </select>
                            <Globe size={14} className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400" />
                        </div>
                    </div>
                </div>

                {/* 3. Length Slider */}
                <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 shadow-sm">
                    <div className="flex justify-between items-center mb-3">
                        <label className="text-[10px] font-bold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
                            <Sliders size={12}/> Summary Length
                        </label>
                        <span className="text-xs font-mono bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-md font-bold border border-violet-100 dark:border-violet-900/30">
                            {config.length}%
                        </span>
                    </div>
                    <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        step="10"
                        value={config.length}
                        onChange={(e) => setConfig(c => ({...c, length: parseInt(e.target.value)}))}
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-violet-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 mt-2 font-medium uppercase tracking-wide">
                        <span>Concise</span>
                        <span>Detailed</span>
                    </div>
                </div>

                {/* 4. Advanced Toggles (Replaced with div based onClick for reliability) */}
                <div className="space-y-2 pt-1">
                    <div 
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer transition-colors hover:border-violet-300 select-none group"
                        onClick={() => setConfig(c => ({...c, extractData: !c.extractData}))}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg transition-colors ${config.extractData ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-slate-200'}`}>
                                <List size={16} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Extract Key Data</span>
                        </div>
                        <div className={`w-9 h-5 rounded-full relative transition-colors ${config.extractData ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                           <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${config.extractData ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </div>

                    <div 
                        className="flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 cursor-pointer transition-colors hover:border-violet-300 select-none group"
                        onClick={() => setConfig(c => ({...c, highlightInsights: !c.highlightInsights}))}
                    >
                        <div className="flex items-center gap-3">
                            <div className={`p-1.5 rounded-lg transition-colors ${config.highlightInsights ? 'bg-violet-100 text-violet-600 dark:bg-violet-900/40 dark:text-violet-300' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-slate-200'}`}>
                                <Zap size={16} />
                            </div>
                            <span className="text-xs font-semibold text-slate-700 dark:text-slate-300">Highlight Insights</span>
                        </div>
                        <div className={`w-9 h-5 rounded-full relative transition-colors ${config.highlightInsights ? 'bg-violet-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
                           <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${config.highlightInsights ? 'translate-x-4' : 'translate-x-0'}`} />
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 md:hidden">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating || !inputText.trim()}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-violet-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18} />}
                    {isGenerating ? 'Summarizing...' : 'Generate Summary'}
                </button>
            </div>
        </div>

        {/* Right Panel: Content */}
        <div className={`
            flex-col bg-[#f8fafc] dark:bg-slate-950 min-w-0 relative flex-1
            md:flex
            ${mobileView === 'editor' ? 'flex w-full h-full' : 'hidden'}
        `}>
            {/* Header */}
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
                        className={`px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${activeTab === 'input' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Original
                    </button>
                    <button 
                        onClick={() => { if(result || isGenerating) setActiveTab('preview'); }}
                        disabled={!result && !isGenerating}
                        className={`px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-violet-600 dark:text-violet-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        Summary {result && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                    </button>
                </div>
                
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Viewport */}
            <div className="flex-1 overflow-hidden relative">
                {/* Input View */}
                <div 
                    className={`flex flex-col w-full h-full transition-all duration-300 ${activeTab === 'input' ? 'relative opacity-100 z-10 translate-x-0' : 'absolute top-0 left-0 opacity-0 z-0 -translate-x-10 pointer-events-none'}`}
                    onClick={() => inputRef.current?.focus()}
                >
                    <textarea 
                        ref={inputRef}
                        value={inputText}
                        onChange={(e) => setInputText(e.target.value)}
                        className="flex-1 w-full p-6 md:p-8 resize-none outline-none text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent placeholder:text-slate-400 font-serif"
                        placeholder="Paste or type text to summarize..."
                    />
                </div>

                {/* Preview View */}
                <div className={`flex flex-col w-full h-full transition-all duration-300 bg-slate-50 dark:bg-slate-950 ${activeTab === 'preview' ? 'relative opacity-100 z-10 translate-x-0' : 'absolute top-0 left-0 opacity-0 z-0 translate-x-10 pointer-events-none'}`}>
                    {result ? (
                        <div 
                            className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-500"
                            onClick={(e) => {
                                if (e.target === e.currentTarget) {
                                    resultRef.current?.focus();
                                }
                            }}
                        >
                            <div 
                                ref={resultRef}
                                contentEditable
                                suppressContentEditableWarning
                                className="prose prose-sm md:prose-base dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 focus:outline-none focus:ring-2 focus:ring-violet-500/20 transition-all min-h-full"
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                            {isGenerating ? (
                                <div className="space-y-4">
                                    <div className="relative mx-auto w-16 h-16">
                                        <div className="absolute inset-0 border-4 border-violet-100 dark:border-slate-800 rounded-full"></div>
                                        <div className="absolute inset-0 border-4 border-violet-600 rounded-full border-t-transparent animate-spin"></div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-600 dark:text-slate-300">Analyzing text structure...</p>
                                        <p className="text-xs mt-1 opacity-70">Extracting key points and insights.</p>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4 max-w-sm opacity-60">
                                    <div className="w-16 h-16 bg-white dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-200 dark:border-slate-700 shadow-sm">
                                        <MessageSquare size={32} className="text-violet-300"/>
                                    </div>
                                    <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Ready to Summarize</h3>
                                    <p className="text-sm leading-relaxed">
                                        Configure your summary options in Settings and click Generate.
                                        The AI will analyze your text and extract the key information.
                                    </p>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Footer Actions - Enhanced for visibility */}
            <div className="h-16 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center px-4 md:px-6 shrink-0 z-20">
                {(!result || activeTab === 'input') ? (
                   <div className="w-full flex items-center justify-between gap-3">
                        <span className="text-[10px] text-slate-400 font-medium tabular-nums w-20 text-left">
                            {inputText.split(/\s+/).filter(w => w.length > 0).length} words
                        </span>
                        
                        <button 
                            onClick={handleGenerate}
                            disabled={isGenerating || !inputText.trim()}
                            className="flex-1 md:flex-none md:w-auto px-6 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                        >
                            {isGenerating ? <RefreshCw className="animate-spin" size={18}/> : <Sparkles size={18} />}
                            <span>Generate</span>
                        </button>

                        <span className="text-[10px] text-slate-400 font-medium tabular-nums w-20 text-right">
                            {inputText.length} chars
                        </span>
                   </div>
                ) : (
                   <div className="w-full flex justify-end gap-3">
                        <button 
                            onClick={() => navigator.clipboard.writeText(resultRef.current?.innerText || result.replace(/<[^>]*>?/gm, ''))}
                            className="px-5 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl flex items-center gap-2 transition-colors"
                        >
                            <Copy size={18} /> <span className="hidden sm:inline">Copy</span>
                        </button>
                        <button 
                            onClick={() => { onInsert(resultRef.current?.innerHTML || result); onClose(); }}
                            className="px-8 py-2.5 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-violet-200/50 dark:shadow-none transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Check size={20} /> Insert
                        </button>
                   </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};