
import React, { useState, useEffect } from 'react';
import { EditorContent } from '@tiptap/react';
import { useEditor } from '../contexts/EditorContext';
import { MiniToolbar } from './MiniToolbar';
import { LoadingSpinner } from '@/components/LoadingSpinner';

const Editor: React.FC = () => {
  const { editor, zoom, pageConfig } = useEditor();
  const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);

  // --- Image Resizing Logic ---
  useEffect(() => {
      if (!editor) return;

      const updateSelection = () => {
          const { selection } = editor.state;
          // Check if selection is an image node
          if (selection.node && selection.node.type.name === 'image') {
              // Find the DOM node
              const domNode = editor.view.nodeDOM(selection.from) as HTMLElement;
              if (domNode) setSelectedImage(domNode);
          } else {
              setSelectedImage(null);
          }
      };

      editor.on('selectionUpdate', updateSelection);
      return () => { editor.off('selectionUpdate', updateSelection); };
  }, [editor]);

  // Image Resizer Component
  const ImageResizer = ({ target }: { target: HTMLElement }) => {
      if (!target) return null;
      
      const handleResize = (e: React.MouseEvent, direction: string) => {
          e.preventDefault();
          const startX = e.clientX;
          const startWidth = target.clientWidth;
          
          const onMove = (ev: MouseEvent) => {
              const delta = ev.clientX - startX;
              const newWidth = direction === 'e' || direction === 'se' ? startWidth + delta : startWidth - delta;
              target.style.width = `${Math.max(50, newWidth)}px`;
              target.style.height = 'auto'; // Maintain aspect ratio
          };
          
          const onUp = () => {
              window.removeEventListener('mousemove', onMove);
              window.removeEventListener('mouseup', onUp);
              // Sync back to editor
              if (editor) {
                  editor.chain().focus().setNodeSelection(editor.state.selection.from).run();
              }
          };
          
          window.addEventListener('mousemove', onMove);
          window.addEventListener('mouseup', onUp);
      };

      const rect = target.getBoundingClientRect();
      const editorRect = document.querySelector('.ProseMirror')?.getBoundingClientRect() || { top: 0, left: 0 };
      
      // Calculate relative position to overlay on the editor
      const style: React.CSSProperties = {
          position: 'absolute',
          top: target.offsetTop,
          left: target.offsetLeft,
          width: target.clientWidth,
          height: target.clientHeight,
          pointerEvents: 'none',
          border: '2px solid #3b82f6',
          zIndex: 50
      };

      return (
          <div style={style}>
              <div 
                className="absolute w-3 h-3 bg-white border border-blue-600 rounded-full -right-1.5 -bottom-1.5 cursor-se-resize pointer-events-auto shadow-sm"
                onMouseDown={(e) => handleResize(e, 'se')}
              ></div>
               <div 
                className="absolute w-3 h-3 bg-white border border-blue-600 rounded-full -right-1.5 top-1/2 -translate-y-1/2 cursor-e-resize pointer-events-auto shadow-sm"
                onMouseDown={(e) => handleResize(e, 'e')}
              ></div>
          </div>
      );
  };

  if (!editor) {
    return (
        <div className="flex items-center justify-center h-full">
            <LoadingSpinner />
        </div>
    );
  }

  // Paper Scale
  const scale = zoom / 100;
  
  // Paper Dimensions (Standard Letter)
  const width = '8.5in';
  const height = '11in';
  
  return (
    <div className="flex-1 flex flex-col items-center bg-[#f1f5f9] dark:bg-[#020617] overflow-auto py-8 relative" onClick={() => editor.chain().focus().run()}>
      
      {/* Contextual Toolbar */}
      <MiniToolbar />

      <div 
        className="bg-white dark:bg-slate-900 shadow-lg transition-transform duration-200 origin-top"
        style={{
            width: width,
            minHeight: height,
            transform: `scale(${scale})`,
            padding: '1in', // Default margins
            boxSizing: 'border-box'
        }}
      >
         <div className="relative">
             <EditorContent editor={editor} className="min-h-[9in] outline-none" />
             {selectedImage && <ImageResizer target={selectedImage} />}
         </div>
      </div>
    </div>
  );
};

export default Editor;
