
import React, { useState } from 'react';
import { 
  X, FileText, List, AlignLeft, Hash, Zap, Globe, 
  Sparkles, Check, Copy, ArrowRight, Settings2, Sliders, 
  RefreshCw, MessageSquare, ArrowLeft
} from 'lucide-react';
import { generateAIContent } from '../../../../../services/geminiService';
import { useEditor } from '../../../../../contexts/EditorContext';
import { jsonToHtml } from '../../../../../utils/documentConverter';

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
  const [config, setConfig] = useState({
    type: 'bullet',
    focus: 'general',
    length: 50, // 0 to 100
    language: 'English (US)',
    extractData: false,
    highlightInsights: false
  });

  const [mobileTab, setMobileTab] = useState<'settings' | 'preview'>('settings');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  
  const { } = useEditor();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');
    // Auto-switch to preview on mobile when generating
    setMobileTab('preview');

    // Construct the prompt based on UI state
    let lengthDesc = "medium length";
    if (config.length < 30) lengthDesc = "very short, concise";
    if (config.length > 70) lengthDesc = "comprehensive, detailed";

    const prompt = `
      TASK: Summarize the input text.
      
      CONFIGURATION:
      - Format: ${config.type}
      - Perspective/Focus: ${config.focus}
      - Length Target: ${lengthDesc} (approx ${config.length}% of original detail)
      - Output Language: ${config.language}
      
      SPECIAL INSTRUCTIONS:
      ${config.extractData ? '- EXTRACT DATA: Separately list key dates, numbers, names, and entities found in a list block.' : ''}
      ${config.highlightInsights ? '- KEY INSIGHTS: Identify the top 3 critical takeaways in a separate section.' : ''}
      
      INPUT TEXT:
      "${initialText.replace(/"/g, '\\"')}"
      
      OUTPUT FORMAT (STRICT):
      You MUST return ONLY a VALID JSON object matching the ProDoc schema.
      Do not add any text before or after the JSON.
      
      JSON Structure:
      {
        "document": {
          "blocks": [
            { "type": "heading", "level": 2, "content": "Summary Title" },
            { "type": "paragraph", "content": "Summary content here..." },
            { "type": "list", "listType": "unordered", "items": ["<b>Point 1:</b> Detail text", "<b>Point 2:</b> Detail text"] }
          ]
        }
      }

      CRITICAL RULES:
      1. Do NOT include any "style", "paragraphStyle", or "config" properties in the blocks. These cause rendering issues and overlapping text.
      2. Return plain semantic blocks only.
      3. You can use HTML tags like <b>, <i>, <u> inside content strings for formatting if needed.
    `;

    try {
      // Use gemini-3-pro-preview for best quality reasoning on summaries
      const response = await generateAIContent('generate_content', '', prompt, 'gemini-3-pro-preview');
      
      // Robust JSON Extraction
      let cleanJson = response.trim();
      
      // 1. Try finding JSON within code blocks
      const codeBlockMatch = cleanJson.match(/```(?:json)?([\s\S]*?)```/);
      if (codeBlockMatch) {
          cleanJson = codeBlockMatch[1].trim();
      } else {
          // 2. Try finding the outermost object manually
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

          // Convert the structured JSON response to HTML for display
          const html = jsonToHtml(parsed);
          if (!html) throw new Error("Empty HTML generated from JSON");
          setResult(html);
      } catch (parseError) {
          console.error("JSON Parse Error", parseError);
          // Fallback: If JSON fails, treat the whole text as a paragraph unless it looks completely broken
          let fallbackHtml = response
              .replace(/#+\s+(.*)/g, '<h3>$1</h3>') // Headings
              .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
              .replace(/\*(.*?)\*/g, '<em>$1</em>') // Italic
              .replace(/^- (.*)/gm, '<li>$1</li>') // List items
              .replace(/\n/g, '<br/>'); // Newlines
          
          // Wrap list items if any
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[75vh] md:h-[80vh] rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Sidebar: Controls */}
        <div className={`
            flex-col bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 shrink-0 transition-all duration-300
            md:w-80 md:flex
            ${mobileTab === 'settings' ? 'flex w-full h-full' : 'hidden'}
        `}>
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center">
                <div>
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <div className="p-1.5 bg-violet-100 dark:bg-violet-900/30 rounded-lg text-violet-600 dark:text-violet-400">
                            <Zap size={18} />
                        </div>
                        Summarizer
                    </h2>
                    <p className="text-xs text-slate-500 mt-1">Distill content into clarity.</p>
                </div>
                {/* Mobile Close */}
                <button onClick={onClose} className="md:hidden p-2 text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full">
                    <X size={20} />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
                
                {/* 1. Summary Type */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <Settings2 size={12}/> Format
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                        {SUMMARY_TYPES.map(type => (
                            <button
                                key={type.id}
                                onClick={() => setConfig(c => ({...c, type: type.id}))}
                                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all ${
                                    config.type === type.id 
                                    ? 'bg-violet-600 border-violet-600 text-white shadow-md' 
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
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Focus</label>
                        <select 
                            value={config.focus}
                            onChange={(e) => setConfig(c => ({...c, focus: e.target.value}))}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                        >
                            {FOCUS_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Language</label>
                        <select 
                            value={config.language}
                            onChange={(e) => setConfig(c => ({...c, language: e.target.value}))}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-violet-500 shadow-sm"
                        >
                            {LANGUAGES.map(l => <option key={l} value={l}>{l}</option>)}
                        </select>
                    </div>
                </div>

                {/* 3. Length Slider */}
                <div className="space-y-3">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Sliders size={12}/> Length
                        </label>
                        <span className="text-[10px] font-mono bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-slate-500">
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
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>Concise</span>
                        <span>Detailed</span>
                    </div>
                </div>

                {/* 4. Advanced Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${config.extractData ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300'}`}>
                            {config.extractData && <Check size={10} className="text-white" strokeWidth={4} />}
                        </div>
                        <input 
                            type="checkbox" 
                            checked={config.extractData}
                            onChange={(e) => setConfig(c => ({...c, extractData: e.target.checked}))}
                            className="hidden"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">Extract Key Data</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${config.highlightInsights ? 'bg-violet-600 border-violet-600' : 'bg-white border-slate-300'}`}>
                            {config.highlightInsights && <Check size={10} className="text-white" strokeWidth={4} />}
                        </div>
                        <input 
                            type="checkbox" 
                            checked={config.highlightInsights}
                            onChange={(e) => setConfig(c => ({...c, highlightInsights: e.target.checked}))}
                            className="hidden"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">Highlight Insights</span>
                    </label>
                </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 sticky bottom-0">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-violet-600 hover:bg-violet-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-violet-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16} />}
                    {isGenerating ? 'Summarizing...' : 'Generate Summary'}
                </button>
            </div>
        </div>

        {/* Right Panel: Content */}
        <div className={`
            flex-col bg-white dark:bg-slate-950 min-w-0 flex-1
            md:flex
            ${mobileTab === 'preview' ? 'flex w-full h-full' : 'hidden'}
        `}>
            {/* Header */}
            <div className="h-16 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-3">
                    <button 
                        onClick={() => setMobileTab('settings')}
                        className="md:hidden p-2 -ml-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1"
                    >
                        <ArrowLeft size={18} /> 
                        <span className="text-xs font-bold">Settings</span>
                    </button>
                    
                    <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Result Preview</span>
                        {result && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                    </div>
                </div>
                
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X size={20} />
                </button>
            </div>

            {/* Viewport */}
            <div className="flex-1 overflow-hidden relative">
                {result ? (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-6 md:p-8 animate-in slide-in-from-top-4 fade-in duration-500">
                        <div 
                            className="prose dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-6 md:p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                            dangerouslySetInnerHTML={{ __html: result }}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-70">
                        {isGenerating ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 border-4 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto"></div>
                                <p className="text-sm font-medium animate-pulse text-violet-600">Analyzing text structure...</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-md">
                                <div className="w-16 h-16 bg-slate-50 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-slate-100">
                                    <MessageSquare size={32} className="text-slate-300"/>
                                </div>
                                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Ready to Summarize</h3>
                                <p className="text-sm leading-relaxed text-slate-400">
                                    Configure your summary options {window.innerWidth >= 768 ? 'on the left' : 'in Settings'} and click <strong>Generate</strong>.
                                    The AI will analyze your text and extract the key information.
                                </p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
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
                            className="px-6 py-2 bg-violet-600 hover:bg-violet-700 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Check size={18} /> Insert
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
