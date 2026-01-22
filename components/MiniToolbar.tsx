
import React from 'react';
import { BubbleMenu } from '@tiptap/react';
import { Bold, Italic, Underline, Highlighter, Type, AlignLeft, AlignCenter, AlignRight } from 'lucide-react';
import { useEditor } from '../contexts/EditorContext';

export const MiniToolbar: React.FC = () => {
  const { editor } = useEditor();

  if (!editor) {
    return null;
  }

  return (
    <BubbleMenu 
      editor={editor} 
      tippyOptions={{ duration: 100, placement: 'top' }}
      className="flex items-center gap-1 p-1 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 animate-in fade-in zoom-in-95 duration-200 overflow-hidden"
    >
        <button
            onClick={() => editor.chain().focus().toggleBold().run()}
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${editor.isActive('bold') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
        >
            <Bold size={14} />
        </button>
        <button
            onClick={() => editor.chain().focus().toggleItalic().run()}
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${editor.isActive('italic') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
        >
            <Italic size={14} />
        </button>
        <button
            onClick={() => editor.chain().focus().toggleUnderline().run()}
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${editor.isActive('underline') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
        >
            <Underline size={14} />
        </button>
        <button
            onClick={() => editor.chain().focus().toggleHighlight().run()}
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${editor.isActive('highlight') ? 'bg-slate-200 text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
        >
            <Highlighter size={14} />
        </button>
        
        <div className="w-[1px] h-4 bg-slate-200 dark:bg-slate-600 mx-1"></div>
        
        <button
            onClick={() => editor.chain().focus().setTextAlign('left').run()}
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${editor.isActive({ textAlign: 'left' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
        >
            <AlignLeft size={14} />
        </button>
         <button
            onClick={() => editor.chain().focus().setTextAlign('center').run()}
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${editor.isActive({ textAlign: 'center' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
        >
            <AlignCenter size={14} />
        </button>
         <button
            onClick={() => editor.chain().focus().setTextAlign('right').run()}
            className={`p-1.5 rounded hover:bg-slate-100 dark:hover:bg-slate-700 ${editor.isActive({ textAlign: 'right' }) ? 'bg-slate-200 text-blue-600' : 'text-slate-600 dark:text-slate-300'}`}
        >
            <AlignRight size={14} />
        </button>
    </BubbleMenu>
  );
};
