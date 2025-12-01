
import React, { useState, useEffect } from 'react';
import { 
  X, FileText, List, AlignLeft, Hash, Zap, Globe, 
  Sparkles, Check, Copy, ArrowRight, Settings2, Sliders, 
  RefreshCw, MessageSquare
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

  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState('');
  
  const { } = useEditor();

  const handleGenerate = async () => {
    setIsGenerating(true);
    setResult('');

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
      "${initialText}"
      
      OUTPUT FORMAT:
      Return a structured JSON object matching the ProDoc schema.
      - The root object must contain "document" -> "blocks".
      - Use "heading" blocks for titles/sections.
      - Use "paragraph" blocks for text.
      - Use "list" blocks for bullet points or data extraction.
    `;

    try {
      // Use generic generation operation which returns JSON schema
      const response = await generateAIContent('generate_content', '', prompt);
      
      // Clean up markdown block syntax if present
      let cleanJson = response.trim();
      if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?/, '').replace(/```$/, '');
      }
      
      try {
          const parsed = JSON.parse(cleanJson);
          // Convert the structured JSON response to HTML for display
          const html = jsonToHtml(parsed);
          setResult(html);
      } catch (parseError) {
          console.error("JSON Parse Error", parseError);
          setResult('<p style="color:red">Error parsing summary. Please try again.</p>');
      }
    } catch (e) {
      console.error(e);
      setResult('<p style="color:red">Error generating summary. Please check your API key.</p>');
    } finally {
      setIsGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-200"
        onClick={e => e.stopPropagation()}
      >
        {/* Left Sidebar: Controls */}
        <div className="w-full md:w-80 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <div className="p-1.5 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg text-indigo-600 dark:text-indigo-400">
                        <Zap size={18} />
                    </div>
                    Summarizer
                </h2>
                <p className="text-xs text-slate-500 mt-1">Distill content into clarity.</p>
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
                                    ? 'bg-indigo-600 border-indigo-600 text-white shadow-md' 
                                    : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:border-indigo-300 dark:hover:border-slate-600'
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
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            {FOCUS_MODES.map(m => <option key={m.id} value={m.id}>{m.label}</option>)}
                        </select>
                    </div>

                    <div className="space-y-1.5">
                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Language</label>
                        <select 
                            value={config.language}
                            onChange={(e) => setConfig(c => ({...c, language: e.target.value}))}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
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
                        className="w-full h-1.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-[10px] text-slate-400 font-medium">
                        <span>Concise</span>
                        <span>Detailed</span>
                    </div>
                </div>

                {/* 4. Advanced Toggles */}
                <div className="space-y-2 pt-2 border-t border-slate-200 dark:border-slate-800">
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                        <input 
                            type="checkbox" 
                            checked={config.extractData}
                            onChange={(e) => setConfig(c => ({...c, extractData: e.target.checked}))}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">Extract Key Data</span>
                    </label>
                    <label className="flex items-center gap-3 p-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer transition-colors">
                        <input 
                            type="checkbox" 
                            checked={config.highlightInsights}
                            onChange={(e) => setConfig(c => ({...c, highlightInsights: e.target.checked}))}
                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className="text-xs font-medium text-slate-700 dark:text-slate-300 flex-1">Highlight Insights</span>
                    </label>
                </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                <button 
                    onClick={handleGenerate}
                    disabled={isGenerating}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {isGenerating ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16} />}
                    {isGenerating ? 'Summarizing...' : 'Generate Summary'}
                </button>
            </div>
        </div>

        {/* Right Panel: Content */}
        <div className="flex-1 flex flex-col bg-[#f8fafc] dark:bg-slate-950 min-w-0">
            {/* Header */}
            <div className="h-14 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex items-center justify-between px-6 shrink-0">
                <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wide">Result Preview</span>
                    {result && <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>}
                </div>
                <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors p-1 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800">
                    <X size={20} />
                </button>
            </div>

            {/* Viewport */}
            <div className="flex-1 overflow-hidden relative">
                {result ? (
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-8">
                        <div 
                            className="prose dark:prose-invert max-w-3xl mx-auto bg-white dark:bg-slate-900 p-8 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800"
                            dangerouslySetInnerHTML={{ __html: result }}
                        />
                    </div>
                ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400 p-8 text-center opacity-60">
                        {isGenerating ? (
                            <div className="space-y-4">
                                <div className="w-16 h-16 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto"></div>
                                <p className="text-sm font-medium animate-pulse">Analyzing text structure...</p>
                            </div>
                        ) : (
                            <div className="space-y-4 max-w-md">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-2xl flex items-center justify-center mx-auto mb-4">
                                    <MessageSquare size={32} />
                                </div>
                                <h3 className="text-lg font-bold text-slate-600 dark:text-slate-300">Ready to Summarize</h3>
                                <p className="text-sm">
                                    Configure your summary options on the left and click <strong>Generate</strong>.
                                    The AI will analyze "{initialText.substring(0, 30)}..." and extract the key information.
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
                            <Copy size={16} /> Copy Text
                        </button>
                        <button 
                            onClick={() => { onInsert(result); onClose(); }}
                            className="px-6 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-bold rounded-lg shadow-md transition-all flex items-center gap-2 active:scale-95"
                        >
                            <Check size={18} /> Insert into Document
                        </button>
                    </>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
