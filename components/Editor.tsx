import React from 'react';
import { useEditor } from '../contexts/EditorContext';
import { WebLayoutView } from './ribbon/tabs/ViewTab/views/WebLayoutTool';
import { PrintLayoutView } from './ribbon/tabs/ViewTab/views/PrintLayoutTool';
import { ReadLayoutView } from './ribbon/tabs/ViewTab/views/ReadLayoutView';

const Editor: React.FC = () => {
  const { 
    content, 
    setContent, 
    zoom, 
    viewMode, 
    pageConfig, 
    registerContainer, 
    showRuler, 
    showFormattingMarks,
    editorRef 
  } = useEditor();
  
  // Read Mode Route
  if (viewMode === 'read') {
      return <ReadLayoutView />;
  }

  // Web Layout Background
  const getBackgroundStyle = (): React.CSSProperties => {
      const base: React.CSSProperties = {
          backgroundColor: pageConfig.pageColor || '#ffffff',
      };
      if (pageConfig.background === 'ruled') {
          base.backgroundImage = 'linear-gradient(#e2e8f0 1px, transparent 1px)';
          base.backgroundSize = '100% 2rem';
      } else if (pageConfig.background === 'grid') {
          base.backgroundImage = 'linear-gradient(#e2e8f0 1px, transparent 1px), linear-gradient(90deg, #e2e8f0 1px, transparent 1px)';
          base.backgroundSize = '20px 20px';
      }
      return base;
  };

  const isPrint = viewMode === 'print';

  return (
    <div 
        ref={registerContainer}
        className={`flex-1 overflow-y-auto overflow-x-auto relative flex flex-col scrollbar-thin scrollbar-thumb-slate-300 dark:scrollbar-thumb-slate-600 scrollbar-track-transparent overscroll-none transition-colors duration-500 ${isPrint ? 'bg-[#F8F9FA] dark:bg-slate-950' : 'bg-white dark:bg-slate-900'}`}
        style={!isPrint ? { backgroundColor: pageConfig.pageColor } : undefined}
    >
      {isPrint ? (
        /* Print Layout: Vertical stack of Pages */
        <PrintLayoutView 
            content={content}
            setContent={setContent}
            pageConfig={pageConfig}
            zoom={zoom}
            showRuler={showRuler}
            showFormattingMarks={showFormattingMarks}
        />
      ) : (
        /* Web Layout: Fluid View */
        <WebLayoutView 
            editorRef={editorRef}
            content={content}
            onInput={(e) => setContent(e.currentTarget.innerHTML)}
            onPaste={() => {}}
            onPageClick={() => {}}
            pageConfig={pageConfig}
            zoom={zoom}
            showFormattingMarks={showFormattingMarks}
            backgroundStyle={getBackgroundStyle()}
        />
      )}
    </div>
  );
};

export default React.memo(Editor);