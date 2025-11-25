
import React, { useState } from 'react';
import { Check } from 'lucide-react';

interface WordCountDialogProps {
  isOpen: boolean;
  onClose: () => void;
  stats: {
    pages: number;
    words: number;
    charsNoSpaces: number;
    charsWithSpaces: number;
    paragraphs: number;
    lines: number;
  };
}

export const WordCountDialog: React.FC<WordCountDialogProps> = ({ isOpen, onClose, stats }) => {
  const [includeNotes, setIncludeNotes] = useState(true);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/5 backdrop-blur-[1px]">
      <div 
        className="bg-white rounded-xl shadow-[0_20px_50px_rgba(0,0,0,0.3)] border border-slate-300 w-[280px] overflow-hidden animate-in zoom-in-95 duration-100 font-sans text-sm select-none"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-3 py-2 bg-white border-b border-slate-100">
          <span className="font-medium text-slate-800 text-xs">Word Count</span>
        </div>

        {/* Content */}
        <div className="px-5 py-4 space-y-4">
          <div className="flex justify-between items-center border-b border-slate-200 pb-1">
             <span className="font-semibold text-slate-700 text-xs uppercase tracking-wide">Statistics</span>
          </div>
          
          <div className="space-y-2 text-slate-700 text-xs">
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Pages</span>
              <span className="font-semibold font-mono">{stats.pages}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Words</span>
              <span className="font-semibold font-mono">{stats.words}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Characters (no spaces)</span>
              <span className="font-semibold font-mono">{stats.charsNoSpaces}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Characters (with spaces)</span>
              <span className="font-semibold font-mono">{stats.charsWithSpaces}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Paragraphs</span>
              <span className="font-semibold font-mono">{stats.paragraphs}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-slate-600">Lines</span>
              <span className="font-semibold font-mono">{stats.lines}</span>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200">
             <button 
                className="flex items-start gap-2 cursor-pointer group w-full text-left"
                onClick={() => setIncludeNotes(!includeNotes)}
             >
                <div 
                    className={`mt-0.5 w-3.5 h-3.5 rounded border flex items-center justify-center transition-colors ${includeNotes ? 'bg-blue-600 border-blue-600' : 'bg-white border-slate-300 group-hover:border-slate-400'}`}
                    style={{ backgroundColor: includeNotes ? undefined : '#ffffff' }}
                >
                    {includeNotes && <Check size={10} className="text-white" strokeWidth={3} />}
                </div>
                <span className="text-[11px] text-slate-700 group-hover:text-slate-900">Include textboxes, footnotes and endnotes</span>
             </button>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-50 px-3 py-3 flex justify-center border-t border-slate-200">
           <button 
             onClick={onClose}
             className="px-6 py-1.5 bg-white border border-slate-300 rounded hover:bg-slate-50 hover:border-slate-400 text-slate-700 text-xs font-medium shadow-sm transition-all active:scale-95 min-w-[80px]"
           >
             Close
           </button>
        </div>
      </div>
    </div>
  );
};
