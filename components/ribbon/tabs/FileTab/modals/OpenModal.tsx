
import React, { useRef } from 'react';
import { FolderOpen, FileText } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useFileTab } from '../FileTabContext';

export const OpenModal: React.FC = () => {
  const { setContent, setDocumentTitle } = useEditor();
  const { closeModal } = useFileTab();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleOpenFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setContent(event.target.result as string);
        setDocumentTitle(file.name.replace(/\.[^/.]+$/, ""));
        closeModal();
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="space-y-6">
      <div 
        className="bg-slate-50 p-6 md:p-8 border-2 border-dashed border-slate-300 rounded-xl flex flex-col items-center justify-center hover:bg-blue-50 hover:border-blue-400 transition-colors cursor-pointer group" 
        onClick={() => fileInputRef.current?.click()}
      >
        <FolderOpen size={40} className="text-slate-400 group-hover:text-blue-500 mb-3 transition-colors" strokeWidth={1.5} />
        <h3 className="text-base font-semibold text-slate-700 group-hover:text-blue-700">Browse Files</h3>
        <p className="text-slate-500 text-xs mt-1 text-center">Support for .txt, .html, .md</p>
        <input 
          type="file" 
          ref={fileInputRef} 
          className="hidden" 
          accept=".txt,.html,.md" 
          onChange={handleOpenFile}
        />
      </div>

      <div>
        <h3 className="font-bold text-slate-700 mb-3 text-xs uppercase tracking-wider">Recent Documents</h3>
        <div className="space-y-2">
          {[
            { name: 'Quarterly Report.html', path: 'C:/Users/Docs/Work', date: 'Yesterday' },
            { name: 'Meeting Notes.txt', path: 'C:/Users/Docs/Personal', date: 'Last Week' }
          ].map((file, i) => (
            <div key={i} className="p-3 bg-white border border-slate-100 hover:border-blue-200 hover:bg-blue-50 rounded-lg cursor-pointer flex items-center group transition-all">
              <div className="p-2 bg-slate-100 rounded text-slate-500 group-hover:text-blue-600 group-hover:bg-white mr-3 transition-colors shrink-0">
                <FileText size={18} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium text-slate-700 group-hover:text-blue-700 truncate">{file.name}</div>
                <div className="text-xs text-slate-400 truncate">{file.path}</div>
              </div>
              <div className="text-xs text-slate-400 ml-2 whitespace-nowrap">{file.date}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
