
import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Bold, Italic, Underline, Highlighter, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';

export const MiniToolbar: React.FC = () => {
  const { editor } = useEditor();

  if (!editor) {
    return null;
  }

  const btnClass = (isActive: boolean) => `
    p-1.5 rounded-md transition-all duration-200 
    ${isActive 
      ? 'bg-blue-100 text-blue-600 dark:bg-blue-900/40 dark:text-blue-400' 
      : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-900 dark:hover:text-white'
    }
  `;

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 150, placement: 'top', animation: 'shift-away' }}
      className="flex items-center gap-1 p-1.5 bg-white/95 dark:bg-slate-800/95 backdrop-blur-md rounded-xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] border border-slate-200/60 dark:border-slate-700/60 animate-in zoom-in-95 duration-200"
    >
        <div className="flex items-center gap-0.5">
            <button onClick={() => editor.chain().focus().toggleBold().run()} className={btnClass(editor.isActive('bold'))} title="Bold">
                <Bold size={16} strokeWidth={2.5} />
            </button>
            <button onClick={() => editor.chain().focus().toggleItalic().run()} className={btnClass(editor.isActive('italic'))} title="Italic">
                <Italic size={16} strokeWidth={2.5} />
            </button>
            <button onClick={() => editor.chain().focus().toggleUnderline().run()} className={btnClass(editor.isActive('underline'))} title="Underline">
                <Underline size={16} strokeWidth={2.5} />
            </button>
            <button onClick={() => editor.chain().focus().toggleHighlight().run()} className={btnClass(editor.isActive('highlight'))} title="Highlight">
                <Highlighter size={16} strokeWidth={2.5} />
            </button>
        </div>
        
        <div className="w-[1px] h-5 bg-slate-200 dark:bg-slate-600 mx-1"></div>
        
        <div className="flex items-center gap-0.5">
            <button onClick={() => editor.chain().focus().setTextAlign('left').run()} className={btnClass(editor.isActive({ textAlign: 'left' }))} title="Align Left">
                <AlignLeft size={16} strokeWidth={2.5} />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign('center').run()} className={btnClass(editor.isActive({ textAlign: 'center' }))} title="Align Center">
                <AlignCenter size={16} strokeWidth={2.5} />
            </button>
            <button onClick={() => editor.chain().focus().setTextAlign('right').run()} className={btnClass(editor.isActive({ textAlign: 'right' }))} title="Align Right">
                <AlignRight size={16} strokeWidth={2.5} />
            </button>
        </div>
    </BubbleMenu>
  );
};
