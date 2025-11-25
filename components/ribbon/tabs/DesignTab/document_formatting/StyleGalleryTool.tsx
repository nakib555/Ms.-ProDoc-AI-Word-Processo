
import React from 'react';
import { ArrowUp, ArrowDown, ChevronDown } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { FormattingCard } from '../common/DesignTools';

export const StyleGalleryTool: React.FC = () => {
  const { executeCommand } = useEditor();

  const applyTheme = (fontHead: string, fontBody: string) => {
      executeCommand('fontName', fontBody);
      // Mock theme application
  };

  return (
     <div className="flex items-center gap-1 h-full px-1 border-x border-slate-200 mx-1 bg-slate-50/50 rounded overflow-hidden">
         <div className="flex gap-2 overflow-x-auto no-scrollbar max-w-[300px] px-1 py-1">
            <FormattingCard title="Basic" fontHead="Arial" fontBody="Arial" color="#1e293b" onClick={() => applyTheme('Arial', 'Arial')} />
            <FormattingCard title="Modern" fontHead="Inter" fontBody="Inter" color="#3b82f6" onClick={() => applyTheme('Inter', 'Inter')} />
            <FormattingCard title="Elegant" fontHead="Georgia" fontBody="Arial" color="#7e22ce" onClick={() => applyTheme('Georgia', 'Arial')} />
            <FormattingCard title="Formal" fontHead="Times New Roman" fontBody="Times New Roman" color="#0f172a" onClick={() => applyTheme('Times New Roman', 'Times New Roman')} />
            <FormattingCard title="Draft" fontHead="Courier New" fontBody="Courier New" color="#475569" onClick={() => applyTheme('Courier New', 'Courier New')} />
            
            <FormattingCard title="Simple" fontHead="Verdana" fontBody="Verdana" color="#64748b" onClick={() => applyTheme('Verdana', 'Verdana')} />
            <FormattingCard title="Distinct" fontHead="Trebuchet MS" fontBody="Trebuchet MS" color="#0d9488" onClick={() => applyTheme('Trebuchet MS', 'Trebuchet MS')} />
            <FormattingCard title="Traditional" fontHead="Garamond" fontBody="Garamond" color="#78350f" onClick={() => applyTheme('Garamond', 'Garamond')} />
            <FormattingCard title="Strong" fontHead="Arial Black" fontBody="Arial" color="#111827" onClick={() => applyTheme('Arial Black', 'Arial')} />
            <FormattingCard title="News" fontHead="Georgia" fontBody="Verdana" color="#dc2626" onClick={() => applyTheme('Georgia', 'Verdana')} />
         </div>
         <div className="flex flex-col h-full justify-center border-l border-slate-200 pl-1">
             <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500"><ArrowUp size={10} /></button>
             <button className="p-0.5 hover:bg-slate-200 rounded text-slate-500"><ArrowDown size={10} /></button>
             <button 
                className="p-0.5 hover:bg-slate-200 rounded text-slate-500"
                title="More Styles"
                onClick={() => alert("Show full gallery")}
             >
                 <ChevronDown size={10} />
             </button>
         </div>
     </div>
  );
};
