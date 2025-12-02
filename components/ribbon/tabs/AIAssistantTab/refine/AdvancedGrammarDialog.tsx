
import React, { useState, useEffect } from 'react';
import { 
  X, Check, Activity, Wand2, RefreshCw, ArrowRight, 
  Sparkles, Type, AlignLeft, AlertCircle, Quote, Languages,
  ThumbsUp, BookOpen, PenTool, History, Settings2, Clock, ChevronRight, RotateCcw,
  Menu, ArrowLeft
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

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

interface HistoryItem {
  id: string;
  originalText: string;
  result: AnalysisResult;
  timestamp: Date;
  settingsSnapshot: any;
}

// --- Sub-Components ---

const ScoreGauge = ({ score }: { score: number }) => {
  const radius = 30;
  const circumference = 2 * Math.PI * radius;
  const normalizedScore = isNaN(score) ? 0 : Math.max(0, Math.min(100, score));
  const strokeDashoffset = circumference - (normalizedScore / 100) * circumference;
  
  let colorClass = "text-red-500";
  if (normalizedScore >= 40) colorClass = "text-amber-500";
  if (normalizedScore >= 70) colorClass = "text-emerald-500";
  if (normalizedScore >= 90) colorClass = "text-indigo-500";

  return (
    <div className="relative w-20 h-20 flex items-center justify-center">
      <svg className="transform -rotate-90 w-full h-full drop-shadow-md">
        <circle cx="40" cy="40" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-800" />
        <circle 
          cx="40" cy="40" r={radius} 
          stroke="currentColor" strokeWidth="6" fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-xl font-bold ${colorClass}`}>{normalizedScore}</span>
      </div>
    </div>
  );
};

const SettingToggle = ({ label, checked, onChange, icon: Icon }: any) => (
  <div 
    className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer group ${checked ? 'bg-indigo-50 border-indigo-200 dark:bg-indigo-900/20 dark:border-indigo-800 shadow-sm' : 'bg-white border-slate-200 hover:border-slate-300 dark:bg-slate-800 dark:border-slate-700'}`}
    onClick={onChange}
  >
    <div className="flex items-center gap-3">
      <div className={`p-2 rounded-lg transition-colors ${checked ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-800 dark:text-indigo-200' : 'bg-slate-100 text-slate-500 dark:bg-slate-700 dark:text-slate-400 group-hover:bg-slate-200'}`}>
        <Icon size={16} />
      </div>
      <span className={`text-xs font-semibold ${checked ? 'text-indigo-900 dark:text-indigo-100' : 'text-slate-600 dark:text-slate-300'}`}>{label}</span>
    </div>
    <div className={`w-9 h-5 rounded-full relative transition-colors ${checked ? 'bg-indigo-600' : 'bg-slate-300 dark:bg-slate-600'}`}>
      <div className={`absolute top-1 left-1 bg-white w-3 h-3 rounded-full transition-transform shadow-sm ${checked ? 'translate-x-4' : 'translate-x-0'}`} />
    </div>
  </div>
);

// --- Main Component ---

export const AdvancedGrammarDialog: React.FC<AdvancedGrammarDialogProps> = ({
  isOpen,
  onClose,
  initialText,
  onApply
}) => {
  const [text, setText] = useState(initialText);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<AnalysisResult | null>(null);
  const [editableText, setEditableText] = useState('');
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  const [error, setError] = useState<string | null>(null);
  
  // Sidebar State
  const [sidebarView, setSidebarView] = useState<'settings' | 'history'>('settings');
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [mobileView, setMobileView] = useState<'editor' | 'sidebar'>('editor');

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
        setEditableText('');
        setActiveTab('input');
        // Reset to settings view on open
        setSidebarView('settings');
        setMobileView('editor');
        setError(null);
    }
  }, [isOpen, initialText]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setError(null);
    setActiveTab('preview'); 
    
    // On mobile, switch back to editor view to see results
    if (window.innerWidth < 768) {
        setMobileView('editor');
    }

    const localKey = localStorage.getItem('gemini_api_key');
    const apiKey = localKey || process.env.API_KEY;

    if (!apiKey) {
        setError("API Key is missing. Please configure it in the AI Assistant tab.");
        setIsAnalyzing(false);
        return;
    }

    const systemInstruction = `You are an expert editor and writing coach.
    Analyze the user input text and provide a corrected version along with readability metrics.
    
    SETTINGS:
    - Tone: ${settings.tone}
    - Fix Grammar/Spelling: ${settings.checkGrammar}
    - Improve Style/Flow: ${settings.checkStyle}
    - Fix Punctuation: ${settings.checkPunctuation}
    - Fix Passive Voice: ${settings.fixPassive}
    - Language: ${settings.language}

    OUTPUT FORMAT:
    Return valid JSON only. Follow this schema exactly:
    {
      "correctedText": "The fully corrected text string",
      "readabilityScore": 0-100 (integer, 100 is best),
      "readabilityLevel": "String (e.g. '8th Grade', 'College')",
      "passiveVoiceCount": integer,
      "improvements": ["List of 3-5 concise specific improvements made"]
    }
    `;

    try {
      const client = new GoogleGenAI({ apiKey });
      const response = await client.models.generateContent({
          model: 'gemini-3-pro-preview',
          contents: [{ role: "user", parts: [{ text: text }] }],
          config: {
              systemInstruction: systemInstruction,
              responseMimeType: "application/json"
          }
      });
      
      let cleanJson = response.text || "{}";
      if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?\s*/, '').replace(/```\s*$/, '');
      }
      
      const data = JSON.parse(cleanJson);
      if (data.error) {
          throw new Error(data.error);
      }
      
      setResult(data);
      setEditableText(data.correctedText || '');

      // Add to history
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          originalText: text,
          result: data,
          timestamp: new Date(),
          settingsSnapshot: { ...settings }
      };
      setHistory(prev => [newItem, ...prev]);

    } catch (error: any) {
      console.error("Analysis failed", error);
      let errMsg = error.message || "Failed to analyze text.";
      const lowerMsg = errMsg.toLowerCase();
      
      if (lowerMsg.includes('429') || lowerMsg.includes('quota') || lowerMsg.includes('exhausted')) {
          errMsg = "⚠️ Quota exceeded. Please check your API billing or try again later.";
      } else if (lowerMsg.includes('503') || lowerMsg.includes('overloaded')) {
          errMsg = "⚠️ AI model is overloaded. Please try again in a moment.";
      }
      
      setError(errMsg);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const restoreHistoryItem = (item: HistoryItem) => {
      setText(item.originalText);
      setResult(item.result);
      setEditableText(item.result.correctedText || '');
      setSettings(item.settingsSnapshot);
      setActiveTab('preview');
      setError(null);
      // On mobile, if restoring from history (sidebar), go to editor
      if (window.innerWidth < 768) {
          setMobileView('editor');
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-2 md:p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full h-[75vh] md:w-[95vw] md:h-[85vh] md:max-w-6xl rounded-2xl shadow-2xl border border-white/20 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar Configuration */}
        <div className={`
            flex-col bg-slate-50/80 dark:bg-slate-950/80 border-r border-slate-200 dark:border-slate-800 backdrop-blur-xl shrink-0 transition-all duration-300
            md:w-80 md:flex
            ${mobileView === 'sidebar' ? 'flex w-full h-full' : 'hidden'}
        `}>
            {/* Header */}
            <div className="p-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 shrink-0">
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        {/* Mobile Back Button */}
                        <button 
                            onClick={() => setMobileView('editor')}
                            className="md:hidden p-1 -ml-2 mr-1 text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full"
                        >
                            <ArrowLeft size={20} />
                        </button>

                        <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg shadow-md shadow-indigo-200/50 dark:shadow-none">
                            <Wand2 className="text-white" size={16} />
                        </div>
                        Editor Pro
                    </h2>

                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="md:hidden text-slate-400">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Sidebar Mode Toggle */}
                <div className="flex p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg">
                    <button 
                        onClick={() => setSidebarView('settings')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${sidebarView === 'settings' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Settings2 size={12} /> Settings
                    </button>
                    <button 
                        onClick={() => setSidebarView('history')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-semibold rounded-md transition-all ${sidebarView === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History size={12} /> History
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {sidebarView === 'settings' ? (
                    <div className="p-5 space-y-6">
                        {/* Tone Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Tone & Voice</label>
                            <div className="relative group">
                                <Quote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                <select 
                                    value={settings.tone}
                                    onChange={(e) => setSettings(s => ({...s, tone: e.target.value}))}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer hover:border-indigo-300 shadow-sm"
                                >
                                    <option>Professional</option>
                                    <option>Casual</option>
                                    <option>Friendly</option>
                                    <option>Academic</option>
                                    <option>Direct & Concise</option>
                                    <option>Persuasive</option>
                                    <option>Creative</option>
                                </select>
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={12} />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Language</label>
                            <div className="relative group">
                                <Languages size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                <select 
                                    value={settings.language}
                                    onChange={(e) => setSettings(s => ({...s, language: e.target.value}))}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer hover:border-indigo-300 shadow-sm"
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
                                <ChevronRight className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 rotate-90 pointer-events-none" size={12} />
                            </div>
                        </div>

                        {/* Toggles */}
                        <div className="space-y-3 pt-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Refinements</label>
                            
                            <SettingToggle 
                                label="Grammar & Spelling" 
                                icon={Check}
                                checked={settings.checkGrammar} 
                                onChange={() => setSettings(s => ({...s, checkGrammar: !s.checkGrammar}))} 
                            />
                            <SettingToggle 
                                label="Style & Flow" 
                                icon={PenTool}
                                checked={settings.checkStyle} 
                                onChange={() => setSettings(s => ({...s, checkStyle: !s.checkStyle}))} 
                            />
                            <SettingToggle 
                                label="Punctuation" 
                                icon={Type}
                                checked={settings.checkPunctuation} 
                                onChange={() => setSettings(s => ({...s, checkPunctuation: !s.checkPunctuation}))} 
                            />
                            <SettingToggle 
                                label="Fix Passive Voice" 
                                icon={AlignLeft}
                                checked={settings.fixPassive} 
                                onChange={() => setSettings(s => ({...s, fixPassive: !s.fixPassive}))} 
                            />
                        </div>
                    </div>
                ) : (
                    <div className="p-0">
                        {history.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 flex flex-col items-center gap-2">
                                <History size={32} className="opacity-20" />
                                <p className="text-xs">No history yet. Run an analysis to see past results.</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-slate-100 dark:divide-slate-800">
                                {history.map((item) => (
                                    <button
                                        key={item.id}
                                        onClick={() => restoreHistoryItem(item)}
                                        className="w-full text-left p-4 hover:bg-white dark:hover:bg-slate-800 transition-colors group relative"
                                    >
                                        <div className="flex justify-between items-start mb-1">
                                            <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-300 px-1.5 py-0.5 rounded">
                                                Score: {item.result?.readabilityScore || 0}
                                            </span>
                                            <span className="text-[10px] text-slate-400 flex items-center gap-1">
                                                <Clock size={10} /> {item.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                            </span>
                                        </div>
                                        <p className="text-xs font-medium text-slate-700 dark:text-slate-300 line-clamp-2 leading-relaxed">
                                            "{item.originalText}"
                                        </p>
                                        <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-400 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <RotateCcw size={10} /> Click to restore
                                        </div>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
                <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !text}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-none transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-[0.98]"
                >
                    {isAnalyzing ? (
                        <RefreshCw className="animate-spin" size={16}/>
                    ) : (
                        <Sparkles size={16} className="fill-indigo-200 text-indigo-100" />
                    )}
                    {isAnalyzing ? 'Analyzing...' : result ? 'Re-Analyze' : 'Run Analysis'}
                </button>
            </div>
        </div>

        {/* Main Content Area */}
        <div className={`
            flex-col min-w-0 bg-[#f8fafc] dark:bg-slate-950 relative
            md:flex flex-1
            ${mobileView === 'editor' ? 'flex w-full h-full' : 'hidden'}
        `}>
            {/* Header Tabs */}
            <div className="h-16 flex items-center justify-between px-4 md:px-8 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0">
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
                        className={`px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${activeTab === 'input' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Original
                    </button>
                    <button 
                        onClick={() => { if(result || isAnalyzing || error) setActiveTab('preview'); }}
                        disabled={!result && !isAnalyzing && !error}
                        className={`px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center gap-2 ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        Improved {result && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                    </button>
                </div>
                <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Content Views */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* Input View */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${activeTab === 'input' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 -translate-x-10 pointer-events-none'}`}>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 w-full p-6 md:p-8 resize-none outline-none text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent placeholder:text-slate-400 font-serif"
                        placeholder="Paste or type your text here to let the AI refine it..."
                    />
                    <div className="px-6 md:px-8 py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-xs text-slate-400 flex justify-between font-medium shrink-0">
                        <span>{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
                        <span>{text.length} characters</span>
                    </div>
                </div>

                {/* Preview View */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 bg-slate-50 dark:bg-slate-950 ${activeTab === 'preview' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-10 pointer-events-none'}`}>
                    
                    {error ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-4 p-8 text-center">
                            <div className="p-3 bg-red-100 dark:bg-red-900/30 rounded-full text-red-500">
                                <AlertCircle size={32} />
                            </div>
                            <p className="text-sm text-red-600 dark:text-red-400 max-w-md">{error}</p>
                            <button onClick={handleAnalyze} className="text-xs bg-white border border-slate-200 px-3 py-1.5 rounded hover:bg-slate-50 transition-colors">Retry Analysis</button>
                        </div>
                    ) : isAnalyzing ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-6">
                            <div className="relative">
                                <div className="w-20 h-20 border-4 border-indigo-100 dark:border-slate-800 rounded-full"></div>
                                <div className="w-20 h-20 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" size={32} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-700 dark:text-slate-200 text-lg">Polishing your prose...</p>
                                <p className="text-sm mt-1 opacity-70">Analyzing structure, tone, and clarity</p>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden animate-in slide-in-from-top-4 fade-in duration-500">
                            {/* Scrollable Container */}
                            <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col">
                                {/* Dashboard Stats */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 p-6 md:p-8 pb-4 shrink-0">
                                    <div className={`bg-white dark:bg-slate-900 p-5 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-5 hover:border-indigo-200 transition-colors ${(!result.improvements || result.improvements.length === 0) ? 'md:col-span-3' : ''}`}>
                                        <ScoreGauge score={result.readabilityScore || 0} />
                                        <div>
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Readability</div>
                                            <div className="text-xl font-bold text-slate-800 dark:text-white">{result.readabilityLevel || "Standard"}</div>
                                            <div className="text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><Check size={10} strokeWidth={3}/> Optimized</div>
                                        </div>
                                    </div>

                                    {result.improvements && result.improvements.length > 0 && (
                                        <div className="md:col-span-2 bg-white dark:bg-slate-900 p-6 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center hover:border-indigo-200 transition-colors">
                                            <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                                                <ThumbsUp size={14} className="text-indigo-500" /> Key Improvements
                                            </div>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-3 gap-x-6">
                                                {result.improvements.map((imp, i) => (
                                                    <div key={i} className="flex items-start gap-2.5 text-sm text-slate-600 dark:text-slate-300">
                                                        <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                                        <span className="leading-snug">{imp}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Result Text */}
                                <div className="px-6 md:px-8 pb-8 flex-1 flex flex-col min-h-[400px]">
                                    <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6 md:p-8 flex-1 flex flex-col transition-all focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500/50">
                                        <textarea
                                            value={editableText}
                                            onChange={(e) => setEditableText(e.target.value)}
                                            className="flex-1 w-full resize-none outline-none border-none text-base md:text-lg leading-loose text-slate-800 dark:text-slate-200 bg-transparent font-serif p-0 placeholder:text-slate-300 focus:ring-0"
                                            spellCheck={false}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="px-6 md:px-8 py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center shrink-0 z-10 gap-4 sm:gap-0">
                                <div className="text-xs text-slate-400 font-medium flex items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    AI processing complete
                                </div>
                                <div className="flex gap-4 w-full sm:w-auto">
                                    <button 
                                        onClick={() => setActiveTab('input')}
                                        className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                                    >
                                        Edit Original
                                    </button>
                                    <button 
                                        onClick={() => { onApply(editableText); onClose(); }}
                                        className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} /> Apply
                                    </button>
                                </div>
                            </div>
                        </div>
                    ) : null}
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};
