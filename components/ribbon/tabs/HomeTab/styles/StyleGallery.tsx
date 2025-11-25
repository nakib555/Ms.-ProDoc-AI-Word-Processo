import React from 'react';
import { useEditor } from '../../../../../contexts/EditorContext';

export const StyleGallery: React.FC = () => {
  const { executeCommand, customStyles, applyCustomStyle } = useEditor();

  return (
    <div className="grid grid-rows-2 grid-flow-col gap-1 h-full overflow-x-auto max-w-[280px] px-1 no-scrollbar">
        {[
          { name: 'Normal', tag: 'P', className: 'font-sans' },
          { name: 'No Spacing', tag: 'P', className: 'font-sans leading-tight' },
          { name: 'Heading 1', tag: 'H1', className: 'text-blue-600 font-light text-lg' },
          { name: 'Heading 2', tag: 'H2', className: 'text-blue-600 font-semibold' },
          { name: 'Title', tag: 'H1', className: 'text-slate-900 text-xl font-medium' },
          { name: 'Subtitle', tag: 'H3', className: 'text-slate-500 font-normal italic' },
          { name: 'Quote', tag: 'BLOCKQUOTE', className: 'text-slate-600 border-l-2 border-slate-300 pl-2 italic' },
          { name: 'Emphasis', tag: 'EM', className: 'italic text-slate-700' },
        ].map((style) => (
            <button
                key={style.name}
                onClick={() => executeCommand('formatBlock', style.tag)}
                className="flex items-center px-3 min-w-[100px] h-[28px] bg-white border border-slate-200 hover:bg-slate-50 hover:border-blue-300 hover:shadow-sm rounded-sm transition-all group overflow-hidden text-left"
            >
                <span className={`text-[11px] whitespace-nowrap overflow-hidden text-ellipsis ${style.className}`}>
                    {style.name}
                </span>
            </button>
        ))}
        
        {/* Render Custom Styles */}
        {customStyles.map((style) => (
             <button
                key={style.id}
                onClick={() => applyCustomStyle(style)}
                className="flex items-center px-3 min-w-[100px] h-[28px] bg-purple-50 border border-purple-200 hover:bg-white hover:border-purple-400 hover:shadow-sm rounded-sm transition-all group overflow-hidden text-left"
            >
                <span 
                    className="text-[11px] whitespace-nowrap overflow-hidden text-ellipsis"
                    style={{ 
                        fontWeight: (style.styles as any).fontWeight,
                        fontStyle: (style.styles as any).fontStyle,
                        color: (style.styles as any).color,
                        textDecoration: (style.styles as any).textDecoration
                    }}
                >
                    {style.name}
                </span>
            </button>
        ))}
    </div>
  );
};