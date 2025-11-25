import React, { useState, useEffect, useCallback } from 'react';
import { X, Search, Replace, ArrowRight, ChevronRight } from 'lucide-react';

interface FindReplaceDialogProps {
  isOpen: boolean;
  onClose: () => void;
  editorRef: React.RefObject<HTMLDivElement | null>;
  initialMode?: 'find' | 'replace';
}

export const FindReplaceDialog: React.FC<FindReplaceDialogProps> = ({
  isOpen,
  onClose,
  editorRef,
  initialMode = 'find'
}) => {
  const [mode, setMode] = useState<'find' | 'replace'>(initialMode);
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [matchCase, setMatchCase] = useState(false);
  const [wholeWord, setWholeWord] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    setMode(initialMode);
    setMessage('');
  }, [initialMode, isOpen]);

  // Helper to get all matches in the editor
  const getAllMatches = useCallback(() => {
    if (!editorRef.current || !findText) return [];

    let flags = matchCase ? 'g' : 'gi';
    let patternSource = findText;

    if (!useRegex) {
      // Escape regex chars
      patternSource = patternSource.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
    if (wholeWord && !useRegex) {
      patternSource = `\\b${patternSource}\\b`;
    }

    let regex;
    try {
      regex = new RegExp(patternSource, flags);
    } catch (e) {
      setMessage('Invalid Regex');
      return [];
    }

    const walker = document.createTreeWalker(
      editorRef.current,
      NodeFilter.SHOW_TEXT,
      null
    );

    const matches: { node: Node; start: number; end: number }[] = [];
    let currentNode: Node | null;

    while ((currentNode = walker.nextNode())) {
      const text = currentNode.textContent || '';
      let match;
      regex.lastIndex = 0; // Reset for safety
      while ((match = regex.exec(text)) !== null) {
        matches.push({
          node: currentNode,
          start: match.index,
          end: match.index + match[0].length,
        });
        // Prevent infinite loop with zero-length matches
        if (match.index === regex.lastIndex) {
            regex.lastIndex++;
        }
      }
    }
    return matches;
  }, [editorRef, findText, matchCase, wholeWord, useRegex]);

  const findNext = () => {
    const matches = getAllMatches();
    if (matches.length === 0) {
      setMessage('No matches found.');
      return;
    }
    setMessage('');

    const selection = window.getSelection();
    let nextMatch = matches[0];

    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      // Find the first match that starts after the current selection end
      // We iterate matches (which are in document order)
      for (const m of matches) {
        // Compare node positions
        const pos = range.endContainer.compareDocumentPosition(m.node);
        
        if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
             // m.node comes after range.endContainer
             nextMatch = m;
             break;
        } else if (range.endContainer === m.node) {
             // Same node, check offset
             if (m.start >= range.endOffset) {
                 nextMatch = m;
                 break;
             }
        }
      }
    }

    // Select the match
    const newRange = document.createRange();
    newRange.setStart(nextMatch.node, nextMatch.start);
    newRange.setEnd(nextMatch.node, nextMatch.end);
    selection?.removeAllRanges();
    selection?.addRange(newRange);
    
    // Scroll into view
    if (nextMatch.node.parentElement) {
        nextMatch.node.parentElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const replaceCurrent = () => {
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0) {
        findNext();
        return;
    }

    // In a real app, we would verify the selection matches the query strictly.
    // Here we assume the user just clicked Find Next or has valid selection.
    if (!selection.isCollapsed) {
        document.execCommand('insertText', false, replaceText);
    }
    findNext();
  };

  const replaceAll = () => {
      let count = 0;
      // Limit to prevent infinite loops or browser hang
      for(let i=0; i<1000; i++) {
          const matches = getAllMatches();
          if (matches.length === 0) break;
          
          const m = matches[0]; // Always take first match in document order
          
          // Manual DOM manipulation to replace text
          const text = m.node.textContent || '';
          const before = text.slice(0, m.start);
          const after = text.slice(m.end);
          m.node.textContent = before + replaceText + after;
          
          count++;
      }
      setMessage(`Replaced ${count} occurrences.`);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed top-28 right-4 sm:right-10 z-50 w-80 sm:w-96 bg-white rounded-lg shadow-2xl border border-slate-200 animate-in slide-in-from-top-2 overflow-hidden font-sans text-slate-700">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b border-slate-100 select-none">
        <div className="flex gap-4 text-sm font-semibold">
            <button 
                className={`pb-1 border-b-2 transition-colors ${mode === 'find' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setMode('find')}
            >
                Find
            </button>
            <button 
                className={`pb-1 border-b-2 transition-colors ${mode === 'replace' ? 'border-blue-500 text-blue-600' : 'border-transparent text-slate-500 hover:text-slate-700'}`}
                onClick={() => setMode('replace')}
            >
                Replace
            </button>
        </div>
        <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={16} />
        </button>
      </div>

      {/* Body */}
      <div className="p-4 space-y-4">
        {/* Find Input */}
        <div className="space-y-1">
            <div className="relative">
                <input 
                    type="text" 
                    value={findText}
                    onChange={(e) => setFindText(e.target.value)}
                    placeholder="Find what..."
                    className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                    autoFocus
                    onKeyDown={(e) => { if(e.key === 'Enter') findNext(); }}
                />
                <Search className="absolute left-2.5 top-2 text-slate-400" size={14} />
            </div>
        </div>

        {/* Replace Input */}
        {mode === 'replace' && (
            <div className="space-y-1 animate-in slide-in-from-top-1 fade-in duration-200">
                <div className="relative">
                    <input 
                        type="text" 
                        value={replaceText}
                        onChange={(e) => setReplaceText(e.target.value)}
                        placeholder="Replace with..."
                        className="w-full pl-8 pr-3 py-1.5 text-sm border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-100 focus:border-blue-500 outline-none"
                        onKeyDown={(e) => { if(e.key === 'Enter') replaceCurrent(); }}
                    />
                    <Replace className="absolute left-2.5 top-2 text-slate-400" size={14} />
                </div>
            </div>
        )}

        {/* Options */}
        <div className="space-y-2 pt-1">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Options</div>
            <div className="grid grid-cols-2 gap-2">
                <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div 
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${matchCase ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300 text-transparent'}`}
                        onClick={() => setMatchCase(!matchCase)}
                    >
                        <ArrowRight size={10} className="rotate-45" /> 
                    </div>
                    <span className="text-xs text-slate-600 group-hover:text-slate-900" onClick={() => setMatchCase(!matchCase)}>Match case</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group select-none">
                    <div 
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${wholeWord ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300 text-transparent'}`}
                        onClick={() => setWholeWord(!wholeWord)}
                    >
                         <ArrowRight size={10} className="rotate-45" />
                    </div>
                    <span className="text-xs text-slate-600 group-hover:text-slate-900" onClick={() => setWholeWord(!wholeWord)}>Whole word</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer group select-none col-span-2">
                    <div 
                        className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${useRegex ? 'bg-blue-500 border-blue-500 text-white' : 'bg-white border-slate-300 text-transparent'}`}
                        onClick={() => setUseRegex(!useRegex)}
                    >
                         <ArrowRight size={10} className="rotate-45" />
                    </div>
                    <span className="text-xs text-slate-600 group-hover:text-slate-900" onClick={() => setUseRegex(!useRegex)}>Use regular expressions</span>
                </label>
            </div>
        </div>

        {/* Message Area */}
        {message && (
            <div className="text-xs text-center py-1.5 text-amber-700 bg-amber-50 rounded border border-amber-100">
                {message}
            </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
            {mode === 'replace' && (
                 <button 
                    onClick={replaceAll}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                 >
                    Replace All
                 </button>
            )}
            
            {mode === 'replace' && (
                 <button 
                    onClick={replaceCurrent}
                    className="px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded transition-colors"
                 >
                    Replace
                 </button>
            )}

            <button 
                onClick={() => findNext()}
                className="px-4 py-1.5 text-xs font-medium bg-blue-600 text-white hover:bg-blue-700 rounded shadow-sm transition-colors flex items-center gap-1"
            >
                Find Next <ChevronRight size={12} />
            </button>
        </div>
      </div>
    </div>
  );
};
