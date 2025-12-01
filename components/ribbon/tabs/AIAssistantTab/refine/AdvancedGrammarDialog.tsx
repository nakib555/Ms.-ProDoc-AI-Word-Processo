
import React, { useState, useEffect } from 'react';
import { 
  X, Check, Activity, Wand2, RefreshCw, ArrowRight, 
  Sparkles, Type, AlignLeft, AlertCircle, Quote, Languages,
  ThumbsUp, BookOpen, PenTool, History, Settings2, Clock, ChevronRight, RotateCcw
} from 'lucide-react';
import { generateAIContent } from '../../../../../services/geminiService';

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
  const strokeDashoffset = circumference - (score / 100) * circumference;
  
  let colorClass = "text-red-500";
  if (score >= 40) colorClass = "text-amber-500";
  if (score >= 70) colorClass = "text-emerald-500";
  if (score >= 90) colorClass = "text-indigo-500";

  return (
    <div className="relative w-16 h-16 md:w-20 md:h-20 flex items-center justify-center shrink-0">
      <svg className="transform -rotate-90 w-full h-full drop-shadow-md">
        <circle cx="50%" cy="50%" r={radius} stroke="currentColor" strokeWidth="6" fill="transparent" className="text-slate-100 dark:text-slate-800" />
        <circle 
          cx="50%" cy="50%" r={radius} 
          stroke="currentColor" strokeWidth="6" fill="transparent" 
          strokeDasharray={circumference} 
          strokeDashoffset={strokeDashoffset} 
          strokeLinecap="round"
          className={`${colorClass} transition-all duration-1000 ease-out`}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className={`text-lg md:text-xl font-bold ${colorClass}`}>{score}</span>
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
  const [activeTab, setActiveTab] = useState<'input' | 'preview'>('input');
  
  // Sidebar State
  const [sidebarView, setSidebarView] = useState<'settings' | 'history'>('settings');
  const [history, setHistory] = useState<HistoryItem[]>([]);

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
        setActiveTab('input');
        // Reset to settings view on open
        setSidebarView('settings');
    }
  }, [isOpen, initialText]);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setIsAnalyzing(true);
    setResult(null);
    setActiveTab('preview'); 

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

      Return a JSON object with this EXACT structure (no markdown formatting, no code blocks):
      {
        "correctedText": "The fully corrected text string",
        "readabilityScore": 0-100 (integer, 100 is best),
        "readabilityLevel": "String (e.g. '8th Grade', 'College')",
        "passiveVoiceCount": integer,
        "improvements": ["List of 3-5 concise, specific improvements made"]
      }
    `;

    try {
      const response = await generateAIContent('generate_content', '', prompt);
      
      let cleanJson = response.trim();
      if (cleanJson.startsWith('```')) {
          cleanJson = cleanJson.replace(/^```(?:json)?/, '').replace(/```$/, '');
      }
      
      const data = JSON.parse(cleanJson);
      setResult(data);

      // Add to history
      const newItem: HistoryItem = {
          id: Date.now().toString(),
          originalText: text,
          result: data,
          timestamp: new Date(),
          settingsSnapshot: { ...settings }
      };
      setHistory(prev => [newItem, ...prev]);

    } catch (error) {
      console.error("Analysis failed", error);
      alert("Failed to analyze text. Please check your API key or network connection.");
      setActiveTab('input');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const restoreHistoryItem = (item: HistoryItem) => {
      setText(item.originalText);
      setResult(item.result);
      setSettings(item.settingsSnapshot);
      setActiveTab('preview');
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-300 p-0 md:p-4" onClick={onClose}>
      <div 
        className="bg-white dark:bg-slate-900 w-full h-full md:h-[90vh] lg:h-[85vh] md:max-w-6xl md:rounded-2xl shadow-2xl border-0 md:border border-white/20 dark:border-slate-700 flex flex-col md:flex-row overflow-hidden animate-in zoom-in-95 duration-300 ring-1 ring-black/10"
        onClick={e => e.stopPropagation()}
      >
        {/* Sidebar Configuration */}
        <div className="w-full md:w-80 bg-slate-50/80 dark:bg-slate-950/80 border-b md:border-b-0 md:border-r border-slate-200 dark:border-slate-800 flex flex-col shrink-0 backdrop-blur-xl h-auto md:h-full max-h-[35vh] md:max-h-full">
            {/* Header */}
            <div className="p-3 md:p-5 border-b border-slate-200 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 flex justify-between md:block items-center sticky top-0 z-10">
                <div className="flex items-center justify-between mb-0 md:mb-4 gap-4">
                    <h2 className="text-base md:text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                        <div className="p-1.5 bg-gradient-to-br from-indigo-600 to-violet-600 rounded-lg shadow-md shadow-indigo-200/50 dark:shadow-none">
                            <Wand2 className="text-white" size={16} />
                        </div>
                        Editor Pro
                    </h2>
                    {/* Mobile Close Button */}
                    <button onClick={onClose} className="p-2 md:hidden hover:bg-slate-200 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                        <X size={20} />
                    </button>
                </div>
                
                {/* Sidebar Mode Toggle */}
                <div className="flex p-1 bg-slate-200/60 dark:bg-slate-800 rounded-lg w-auto md:w-full">
                    <button 
                        onClick={() => setSidebarView('settings')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 md:px-0 text-xs font-semibold rounded-md transition-all ${sidebarView === 'settings' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <Settings2 size={12} /> <span className="hidden sm:inline">Settings</span>
                    </button>
                    <button 
                        onClick={() => setSidebarView('history')}
                        className={`flex-1 flex items-center justify-center gap-2 py-1.5 px-3 md:px-0 text-xs font-semibold rounded-md transition-all ${sidebarView === 'history' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                        <History size={12} /> <span className="hidden sm:inline">History</span>
                    </button>
                </div>
            </div>
            
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
                {sidebarView === 'settings' ? (
                    <div className="p-4 md:p-5 space-y-4 md:space-y-6">
                        {/* Tone Selector */}
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1">Tone & Voice</label>
                            <div className="relative group">
                                <Quote size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                                <select 
                                    value={settings.tone}
                                    onChange={(e) => setSettings(s => ({...s, tone: e.target.value}))}
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 md:py-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer hover:border-indigo-300 shadow-sm"
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
                                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl pl-9 pr-8 py-2 md:py-2.5 text-xs md:text-sm text-slate-700 dark:text-slate-200 outline-none focus:ring-2 focus:ring-indigo-500 transition-all appearance-none cursor-pointer hover:border-indigo-300 shadow-sm"
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
                        <div className="space-y-2 md:space-y-3 pt-2 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-1 gap-2 md:gap-3">
                            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block ml-1 col-span-full md:mb-0">Refinements</label>
                            
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
                                                Score: {item.result.readabilityScore}
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

            <div className="p-4 md:p-5 border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hidden md:block">
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
        <div className="flex-1 flex flex-col min-w-0 bg-[#f8fafc] dark:bg-slate-950 relative h-full">
            {/* Header Tabs */}
            <div className="h-auto min-h-[3.5rem] md:min-h-[4rem] flex flex-wrap items-center justify-between p-3 md:px-8 md:py-0 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shrink-0 gap-3">
                <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg w-full md:w-auto">
                    <button 
                        onClick={() => setActiveTab('input')}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all ${activeTab === 'input' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400'}`}
                    >
                        Original
                    </button>
                    <button 
                        onClick={() => { if(result || isAnalyzing) setActiveTab('preview'); }}
                        disabled={!result && !isAnalyzing}
                        className={`flex-1 md:flex-none px-4 md:px-6 py-1.5 text-xs font-bold uppercase tracking-wide rounded-md transition-all flex items-center justify-center gap-2 ${activeTab === 'preview' ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-sm' : 'text-slate-500 hover:text-slate-700 dark:text-slate-400 disabled:opacity-50 disabled:cursor-not-allowed'}`}
                    >
                        Improved {result && <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>}
                    </button>
                </div>
                {/* Desktop Close Button */}
                <button onClick={onClose} className="hidden md:block p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 transition-colors">
                    <X size={20} />
                </button>
            </div>

            {/* Mobile Analyze Button if not analyzing - shown when sidebar collapsed/scrolled */}
            <div className="md:hidden p-3 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
                 <button 
                    onClick={handleAnalyze}
                    disabled={isAnalyzing || !text}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2.5 rounded-xl shadow-sm transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
                >
                    {isAnalyzing ? <RefreshCw className="animate-spin" size={16}/> : <Sparkles size={16} />}
                    {isAnalyzing ? 'Analyzing...' : result ? 'Re-Analyze' : 'Run Analysis'}
                </button>
            </div>

            {/* Content Views */}
            <div className="flex-1 overflow-hidden relative">
                
                {/* Input View */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 ${activeTab === 'input' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 -translate-x-10 pointer-events-none'}`}>
                    <textarea 
                        value={text}
                        onChange={(e) => setText(e.target.value)}
                        className="flex-1 w-full p-4 md:p-8 resize-none outline-none text-base md:text-lg leading-relaxed text-slate-700 dark:text-slate-300 bg-transparent placeholder:text-slate-400 font-serif"
                        placeholder="Paste or type your text here to let the AI refine it..."
                    />
                    <div className="px-4 md:px-8 py-3 md:py-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 text-[10px] md:text-xs text-slate-400 flex justify-between font-medium">
                        <span>{text.split(/\s+/).filter(w => w.length > 0).length} words</span>
                        <span>{text.length} characters</span>
                    </div>
                </div>

                {/* Preview View */}
                <div className={`absolute inset-0 flex flex-col transition-all duration-300 bg-slate-50 dark:bg-slate-950 ${activeTab === 'preview' ? 'opacity-100 z-10 translate-x-0' : 'opacity-0 z-0 translate-x-10 pointer-events-none'}`}>
                    
                    {isAnalyzing ? (
                        <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-6">
                            <div className="relative">
                                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-indigo-100 dark:border-slate-800 rounded-full"></div>
                                <div className="w-16 h-16 md:w-20 md:h-20 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin absolute top-0 left-0"></div>
                                <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-indigo-500 animate-pulse" size={24} />
                            </div>
                            <div className="text-center">
                                <p className="font-bold text-slate-700 dark:text-slate-200 text-base md:text-lg">Polishing your prose...</p>
                                <p className="text-xs md:text-sm mt-1 opacity-70">Analyzing structure, tone, and clarity</p>
                            </div>
                        </div>
                    ) : result ? (
                        <div className="flex-1 flex flex-col h-full overflow-hidden">
                            {/* Dashboard Stats - Adaptive Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 p-4 md:p-8 md:pb-4 shrink-0 overflow-y-auto max-h-[40vh] md:max-h-none md:overflow-visible custom-scrollbar">
                                <div className="bg-white dark:bg-slate-900 p-4 md:p-5 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex items-center gap-4 md:gap-5 hover:border-indigo-200 transition-colors">
                                    <ScoreGauge score={result.readabilityScore} />
                                    <div>
                                        <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Readability</div>
                                        <div className="text-lg md:text-xl font-bold text-slate-800 dark:text-white">{result.readabilityLevel}</div>
                                        <div className="text-[10px] md:text-xs text-emerald-600 font-medium mt-1 flex items-center gap-1"><Check size={10} strokeWidth={3}/> Optimized</div>
                                    </div>
                                </div>

                                <div className="lg:col-span-2 bg-white dark:bg-slate-900 p-4 md:p-6 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 flex flex-col justify-center hover:border-indigo-200 transition-colors">
                                    <div className="text-[10px] md:text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 md:mb-3 flex items-center gap-2">
                                        <ThumbsUp size={14} className="text-indigo-500" /> Key Improvements
                                    </div>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-2 md:gap-y-3 gap-x-4 md:gap-x-6">
                                        {result.improvements.map((imp, i) => (
                                            <div key={i} className="flex items-start gap-2.5 text-xs md:text-sm text-slate-600 dark:text-slate-300">
                                                <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0"></div>
                                                <span className="leading-snug">{imp}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Result Text */}
                            <div className="flex-1 px-4 md:px-8 pb-4 overflow-hidden">
                                <div className="h-full bg-white dark:bg-slate-900 rounded-xl md:rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-4 md:p-8 overflow-y-auto custom-scrollbar">
                                    <div className="max-w-3xl mx-auto prose dark:prose-invert">
                                        <p className="text-base md:text-lg leading-loose text-slate-800 dark:text-slate-200 whitespace-pre-wrap font-serif">
                                            {result.correctedText}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Action Bar */}
                            <div className="px-4 md:px-8 py-4 md:py-5 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row justify-between items-center shrink-0 gap-3 md:gap-0">
                                <div className="hidden md:flex text-xs text-slate-400 font-medium items-center gap-2">
                                    <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
                                    AI processing complete
                                </div>
                                <div className="flex w-full sm:w-auto gap-3">
                                    <button 
                                        onClick={() => setActiveTab('input')}
                                        className="flex-1 sm:flex-none px-6 py-2.5 text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors border border-slate-200 dark:border-slate-700 sm:border-transparent"
                                    >
                                        Back
                                    </button>
                                    <button 
                                        onClick={() => { onApply(result.correctedText); onClose(); }}
                                        className="flex-1 sm:flex-none px-8 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-bold rounded-xl shadow-lg shadow-indigo-200/50 dark:shadow-none transition-all active:scale-95 flex items-center justify-center gap-2"
                                    >
                                        <Check size={18} /> Apply Changes
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
