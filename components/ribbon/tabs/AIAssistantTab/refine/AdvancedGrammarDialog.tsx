
import React, { useState, useEffect } from 'react';
import { X, Check, Activity, BarChart, Languages, Wand2, BookOpen, AlertCircle, ArrowRight, Loader2, RefreshCw } from 'lucide-react';
import { generateAIContent } from '../../../../../services/geminiService';
import { useEditor } from '../../../../../contexts/EditorContext';

interface AdvancedGrammarDialogProps {
  isOpen: boolean;
  onClose: () => void;
  initialText: string;
  onApply: (text: string) => void;
}

type AnalysisResult = {
  correctedText: string;
  readabilityScore: number;
  readabilityLevel: string;
  passiveVoiceCount: number;
  improvements: string[];
};

export const AdvancedGrammarDialog: React.FC<AdvancedGrammarDialogProps> = ({
  isOpen,
  onClose,
  initialText,
  onApply
}) => {
  const [text, setText] = useState(initialText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  
  // Settings
  const [settings, setSettings] = useState({
    checkGrammar: true,
    checkStyle: true,
    checkPunctuation: true,
    fixPassive: false,
    tone: 'Professional',
    language: 'Auto-Detect'
  });

  useEffect(() => {
    if (isOpen) {
        setText(initialText);
        setResult(null);
    }
  }, [isOpen, initialText]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);

    const prompt = `
      Act as an expert editor. Analyze and improve the following text based on these settings:
      - Tone: ${settings.tone}
      - Fix Grammar/Spelling: ${settings.checkGrammar}
      - Improve Style/Flow: ${settings.checkStyle}
      - Fix Punctuation: ${settings.checkPunctuation}
      - Fix Passive Voice: ${settings.fixPassive}
      - Language: ${settings.language}

      INPUT TEXT:
      "${text}"

      Return a JSON object with this EXACT structure (no markdown formatting):
      {
        "correctedText": "The fully corrected text",
        "readabilityScore": 0-100 (number, where 100 is very easy),
        "readabilityLevel": "String (e.g. '8th Grade', 'College')",
        "passiveVoiceCount": number (count of passive instances found/fixed),
        "improvements": ["List of 3-5 key specific changes made, e.g. 'Fixed subject-verb agreement', 'Changed passive to active'"]
      }
    `;

    try {
      const response = await generateAIContent('generate_content', '', prompt); // Using generic op but passing full prompt as context
      
      // Clean up potential markdown formatting in response
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const data = JSON.parse(cleanJson);
      
      setResult(data);
    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze text. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50 border-green-200';
    if (score >= 60) return 'text-blue-600 bg-blue-50 border-blue-200';
    if (score >= 40) return 'text-yellow-600 bg-yellow-50 border-yellow-200';
    return 'text-red-600 bg-red-50 border-red-200';
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200 p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full max-w-4xl h-[85vh] rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 flex overflow-hidden animate-in zoom-in-95 duration-200 ring-1 ring-black/5"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar Controls */}
        <div className="w-72 bg-slate-50 dark:bg-slate-950 border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0">
            <div className="p-5 border-b border-slate-200 dark:border-slate-800">
                <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                    <Wand2 className="text-purple-600" size={20} />
                    Grammar Check
                </h2>
                <p className="text-xs text-slate-500 mt-1">Advanced analysis & correction</p>
            </div>
            
            <div className="p-5 space-y-6 flex-1 overflow-y-auto">
                {/* Toggles */}
                <div className="space-y-3">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Checks</label>
                    
                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${settings.checkGrammar ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                            {settings.checkGrammar && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.checkGrammar} onChange={() => setSettings(s => ({...s, checkGrammar: !s.checkGrammar}))} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Grammar & Spelling</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${settings.checkStyle ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                            {settings.checkStyle && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.checkStyle} onChange={() => setSettings(s => ({...s, checkStyle: !s.checkStyle}))} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Style & Flow</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${settings.checkPunctuation ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                            {settings.checkPunctuation && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.checkPunctuation} onChange={() => setSettings(s => ({...s, checkPunctuation: !s.checkPunctuation}))} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Punctuation</span>
                    </label>

                    <label className="flex items-center gap-3 cursor-pointer group">
                        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-all ${settings.fixPassive ? 'bg-blue-600 border-blue-600' : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600'}`}>
                            {settings.fixPassive && <Check size={12} className="text-white" strokeWidth={3} />}
                        </div>
                        <input type="checkbox" className="hidden" checked={settings.fixPassive} onChange={() => setSettings(s => ({...s, fixPassive: !s.fixPassive}))} />
                        <span className="text-sm text-slate-700 dark:text-slate-300">Fix Passive Voice</span>
                    </label>
                </div>

                {/* Tone */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Tone</label>
                    <select 
                        value={settings.tone}
                        onChange={(e) => setSettings(s => ({...s, tone: e.target.value}))}
                        className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option>Professional</option>
                        <option>Casual</option>
                        <option>Friendly</option>
                        <option>Academic</option>
                        <option>Direct & Concise</option>
                        <option>Persuasive</option>
                    </select>
                </div>

                {/* Language */}
                <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Language</label>
                    <div className="relative">
                        <Languages size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <select 
                            value={settings.language}
                            onChange={(e) => setSettings(s => ({...s, language: e.target.value}))}
                            className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg pl-9 pr-3 py-2 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-blue-500"
                        >
                            <option>Auto-Detect</option>
                            <option>English (US)</option>
                            <option>English (UK)</option>
                            <option>Spanish</option>
                            <option>French</option>
                            <option>German</option>
                            <option>Chinese</option>
                            <option>Japanese</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800">
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !text}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2.5 rounded-xl shadow-lg shadow-purple-200 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isAnalyzing ? <Loader2 className="animate-spin" size={18}/> : <Activity size={18} />}
                    {result ? 'Re-Analyze' : 'Analyze Text'}
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col min-w-0 bg-white dark:bg-slate-900">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex gap-4 text-sm font-medium">
                    <span className={`pb-1 border-b-2 transition-colors ${!result ? 'border-purple-500 text-purple-600' : 'border-transparent text-slate-500'}`}>Original</span>
                    {result && <span className="pb-1 border-b-2 border-purple-500 text-purple-600 animate-in fade-in slide-in-from-left-2">Corrected</span>}
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Editor Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Original/Input */}
                <div className={`flex-1 flex flex-col border-r border-slate-100 dark:border-slate-800 transition-all duration-300 ${result ? 'w-1/2' : 'w-full'}`}>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 w-full p-6 resize-none outline-none text-base leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent placeholder:text-slate-300"
                        placeholder="Paste your text here to analyze..."
                    />
                    <div className="px-4 py-2 bg-slate-50 dark:bg-slate-950 text-xs text-slate-400 flex justify-between">
                        <span>{text.length} characters</span>
                        <span>Input</span>
                    </div>
                </div>

                {/* Result View */}
                {result && (
                    <div className="flex-1 flex flex-col bg-purple-50/30 dark:bg-purple-900/10 animate-in slide-in-from-right-4 duration-300">
                        <div className="flex-1 p-6 overflow-y-auto text-base leading-relaxed text-slate-800 dark:text-slate-200">
                            {result.correctedText}
                        </div>
                        
                        {/* Stats Panel */}
                        <div className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 p-4 grid grid-cols-2 gap-4 shadow-sm relative z-10">
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold border-4 ${getScoreColor(result.readabilityScore)}`}>
                                        {result.readabilityScore}
                                    </div>
                                    <div>
                                        <div className="text-xs text-slate-500 uppercase font-semibold">Readability</div>
                                        <div className="text-sm font-medium text-slate-800 dark:text-white">{result.readabilityLevel}</div>
                                    </div>
                                </div>
                                {settings.fixPassive && (
                                    <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                                        <div className="w-2 h-2 rounded-full bg-orange-400"></div>
                                        {result.passiveVoiceCount} passive voice issues fixed
                                    </div>
                                )}
                            </div>

                            <div className="border-l border-slate-100 dark:border-slate-700 pl-4">
                                <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Improvements</div>
                                <ul className="space-y-1.5">
                                    {result.improvements.slice(0, 3).map((imp, i) => (
                                        <li key={i} className="text-xs text-slate-600 dark:text-slate-300 flex items-start gap-2">
                                            <Check size={12} className="text-green-500 mt-0.5 shrink-0"/>
                                            {imp}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="px-6 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex justify-end gap-3 shrink-0">
                <button 
                    onClick={onClose}
                    className="px-4 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors"
                >
                    Cancel
                </button>
                {result && (
                    <button 
                        onClick={() => { onApply(result.correctedText); onClose(); }}
                        className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-bold rounded-lg shadow-md hover:shadow-lg transition-all active:scale-95 flex items-center gap-2"
                    >
                        <Check size={16} /> Apply Fixes
                    </button>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};
