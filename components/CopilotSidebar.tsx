
import React, { useState, useRef, useEffect } from 'react';
import { Send, X, Sparkles, Copy, RefreshCw, StopCircle } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';
import { chatWithDocumentStream } from '../services/geminiService';

interface Message {
  id: string;
  role: 'user' | 'model';
  text: string;
  isStreaming?: boolean;
}

const CopilotSidebar: React.FC = () => {
  const { showCopilot, setShowCopilot, content, executeCommand, viewMode } = useEditor();
  const [messages, setMessages] = useState<Message[]>([
    { id: '1', role: 'model', text: "Hi! I'm Copilot. I can help you write, summarize, or edit this document. What would you like to do?" }
  ]);
  const [input, setInput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isGenerating) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsGenerating(true);

    const modelMsgId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: modelMsgId, role: 'model', text: '', isStreaming: true }]);

    // Prepare history for API (exclude current message and streaming placeholders)
    const history = messages
        .filter(m => !m.isStreaming)
        .map(m => ({ role: m.role, text: m.text }));

    try {
        const stream = chatWithDocumentStream(history, userMsg.text, content);
        let accumulatedText = '';

        for await (const chunk of stream) {
            accumulatedText += chunk;
            setMessages(prev => prev.map(m => 
                m.id === modelMsgId ? { ...m, text: accumulatedText } : m
            ));
        }
    } catch (e: any) {
        setMessages(prev => prev.map(m => 
            m.id === modelMsgId ? { ...m, text: `Error: ${e.message || "Failed to generate response."}` } : m
        ));
    } finally {
        setIsGenerating(false);
        setMessages(prev => prev.map(m => 
            m.id === modelMsgId ? { ...m, isStreaming: false } : m
        ));
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        handleSend();
    }
  };

  const insertText = (text: string) => {
      // Basic markdown cleanup if needed or just insert text
      // If text looks like HTML (starts with <), insertHTML, else insertText
      if (text.trim().startsWith('<')) {
          executeCommand('insertHTML', text);
      } else {
          executeCommand('insertText', text);
      }
  };

  if (!showCopilot || viewMode === 'web') return null;

  return (
    <div className="w-[350px] bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col shadow-xl z-20 transition-all duration-300">
        {/* Header */}
        <div className="h-12 flex items-center justify-between px-4 border-b border-slate-100 dark:border-slate-800 bg-white/50 dark:bg-slate-900/50 backdrop-blur-sm">
            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-200 font-bold">
                <Sparkles size={18} className="text-purple-600 fill-purple-100" />
                <span>Copilot</span>
            </div>
            <button onClick={() => setShowCopilot(false)} className="p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors">
                <X size={18} />
            </button>
        </div>

        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-200 dark:scrollbar-thumb-slate-700 bg-[#f9fafb] dark:bg-slate-950">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
                    <div 
                        className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${
                            msg.role === 'user' 
                            ? 'bg-blue-600 text-white rounded-br-none' 
                            : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-bl-none'
                        }`}
                    >
                        {msg.text ? <div className="whitespace-pre-wrap">{msg.text}</div> : <span className="animate-pulse">...</span>}
                    </div>
                    {msg.role === 'model' && !msg.isStreaming && msg.text && (
                        <div className="flex gap-2 mt-1 ml-1 opacity-0 hover:opacity-100 transition-opacity">
                            <button 
                                onClick={() => insertText(msg.text)} 
                                className="text-[10px] flex items-center gap-1 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded text-slate-600 dark:text-slate-400 transition-colors"
                                title="Insert at cursor"
                            >
                                <Copy size={10} /> Insert
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
            <div className="relative">
                <textarea
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask Copilot..."
                    className="w-full pl-4 pr-10 py-3 bg-slate-50 dark:bg-slate-800 border-none rounded-xl resize-none outline-none focus:ring-2 focus:ring-purple-500/20 text-sm text-slate-700 dark:text-slate-200 shadow-inner max-h-32 min-h-[50px]"
                    rows={1}
                    style={{ minHeight: '50px' }}
                />
                <button 
                    onClick={handleSend}
                    disabled={!input.trim() && !isGenerating}
                    className={`absolute right-2 bottom-2 p-1.5 rounded-lg transition-all ${
                        input.trim() 
                        ? 'bg-purple-600 text-white shadow-md hover:bg-purple-700' 
                        : 'text-slate-400 bg-transparent'
                    }`}
                >
                    {isGenerating ? <StopCircle size={18} className="animate-pulse" /> : <Send size={18} />}
                </button>
            </div>
            <div className="mt-2 flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {['Summarize document', 'Draft an intro', 'Make it professional'].map(suggestion => (
                    <button 
                        key={suggestion}
                        onClick={() => { setInput(suggestion); }}
                        className="whitespace-nowrap px-3 py-1.5 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-full text-xs text-slate-500 hover:border-purple-300 hover:text-purple-600 transition-colors"
                    >
                        {suggestion}
                    </button>
                ))}
            </div>
        </div>
    </div>
  );
};

export default CopilotSidebar;
