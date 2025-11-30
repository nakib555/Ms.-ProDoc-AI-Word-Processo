
import React, { useState, useEffect, useCallback } from 'react';
import Ribbon from './components/Ribbon';
import Editor from './components/Editor';
import StatusBar from './components/StatusBar';
import { ReadModeToolbar } from './components/ribbon/tabs/ViewTab/views/ReadMode/ReadModeToolbar';
import { CopilotSidebar } from './components/CopilotSidebar';
import { RibbonTab } from './types';
import { Loader2 } from 'lucide-react';
import { EditorProvider, useEditor } from './contexts/EditorContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { useResponsive } from './hooks/useResponsive';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RibbonTab | null>(RibbonTab.HOME);
  const { aiState, setViewMode, viewMode } = useEditor();
  
  const { isMobile } = useResponsive('print');

  // Sync responsive view mode recommendation to context on mount/change
  useEffect(() => {
    if (isMobile) {
        // Only force web layout if not in specific read mode
        if (viewMode !== 'read') setViewMode('web');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isMobile, setViewMode]); 

  // Automatically switch away from AI Assistant tab if in Web Layout
  useEffect(() => {
    if (viewMode === 'web' && activeTab === RibbonTab.AI_ASSISTANT) {
        setActiveTab(RibbonTab.HOME);
    }
  }, [viewMode, activeTab]);

  const handleTabChange = useCallback((tab: RibbonTab) => {
    setActiveTab(prev => prev === tab ? null : tab);
  }, []);

  const isReadMode = viewMode === 'read';

  return (
    <div className="h-[100dvh] flex flex-col bg-slate-50 dark:bg-slate-950 overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {isReadMode && <ReadModeToolbar />}

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {!isReadMode && (
            <Ribbon 
                activeTab={activeTab} 
                onTabChange={handleTabChange} 
            />
        )}
        
        <div className="flex-1 flex overflow-hidden relative z-0 w-full">
          <div className="flex-1 flex flex-col overflow-hidden relative bg-[#F8F9FA] dark:bg-slate-950 transition-colors duration-300">
            <Editor />
            
            {/* AI Overlay Loading State - Only show when thinking, not when writing/streaming */}
            {aiState === 'thinking' && (
              <div className="absolute inset-0 bg-slate-900/20 dark:bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-500">
                 <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-zoom-in mx-4 max-w-sm w-full border border-white/40 dark:border-slate-700 ring-1 ring-black/5">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-blue-500/20 ring-4 ring-blue-50 dark:ring-blue-900/30 relative">
                      <Loader2 className="animate-spin text-white" size={32} />
                      <div className="absolute inset-0 rounded-full bg-blue-400/30 animate-ping"></div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">AI is Thinking</h3>
                    <p className="text-slate-500 dark:text-slate-300 text-sm text-center leading-relaxed">Analyzing your text and generating intelligent suggestions...</p>
                 </div>
              </div>
            )}
          </div>
          
          {viewMode !== 'web' && <CopilotSidebar />}
        </div>
      </div>

      {!isReadMode && <StatusBar />}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ThemeProvider>
      <EditorProvider>
        <AppContent />
      </EditorProvider>
    </ThemeProvider>
  );
};

export default App;
