
import React, { useState, useEffect, useCallback, Suspense } from 'react';
import Ribbon from './components/Ribbon';
import Editor from './components/Editor';
import StatusBar from './components/StatusBar';
import { ReadModeToolbar } from './components/ribbon/tabs/ViewTab/views/ReadMode/ReadModeToolbar';
import { MobileSelectionToolbar } from './components/MobileSelectionToolbar';
import { RibbonHeader } from './components/ribbon/RibbonHeader';
import { CopilotSidebar } from './components/CopilotSidebar';
import { RibbonTab } from './types';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { EditorProvider, useEditor } from './contexts/EditorContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PageSetupDialog } from './components/ribbon/tabs/LayoutTab/page_setup/Margins/CustomMargin/PageSetupDialog';

const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<RibbonTab | null>(RibbonTab.HOME);
  const { aiState, viewMode, showPageSetup, setShowPageSetup, pageConfig, setPageConfig } = useEditor();
  
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
    <div className="h-[100dvh] flex flex-col bg-white dark:bg-[#020617] overflow-hidden text-slate-900 dark:text-slate-100 font-sans transition-colors duration-300">
      
      {isReadMode && <ReadModeToolbar />}

      {!isReadMode && <RibbonHeader toggleSidebar={() => {}} />}

      <div className="flex flex-col flex-1 overflow-hidden relative">
        {!isReadMode && (
            <ErrorBoundary>
                <Ribbon 
                    activeTab={activeTab} 
                    onTabChange={handleTabChange} 
                />
            </ErrorBoundary>
        )}
        
        <div className="flex-1 flex overflow-hidden relative z-0 w-full">
          <div className="flex-1 flex flex-col overflow-hidden relative bg-[#f1f5f9] dark:bg-[#020617] transition-colors duration-300">
            <ErrorBoundary>
                <Editor />
            </ErrorBoundary>
            
            {/* AI Overlay Loading State - Only show when thinking, not when writing/streaming */}
            {aiState === 'thinking' && (
              <div className="absolute inset-0 bg-white/50 dark:bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm transition-all duration-500">
                 <div className="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md p-8 rounded-2xl shadow-2xl flex flex-col items-center animate-zoom-in mx-4 max-w-sm w-full border border-white/40 dark:border-slate-700 ring-1 ring-black/5">
                    <div className="w-16 h-16 bg-gradient-to-br from-indigo-500 to-violet-600 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-indigo-500/20 ring-4 ring-indigo-50 dark:ring-indigo-900/30 relative">
                      <LoadingSpinner className="w-10 h-10" />
                      <div className="absolute inset-0 rounded-full bg-indigo-400/30 animate-ping"></div>
                    </div>
                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">AI is Thinking</h3>
                    <p className="text-slate-500 dark:text-slate-300 text-sm text-center leading-relaxed">Analyzing your text and generating intelligent suggestions...</p>
                 </div>
              </div>
            )}
          </div>
          
          <CopilotSidebar />
        </div>
      </div>

      <MobileSelectionToolbar />
      {!isReadMode && <StatusBar />}

      {/* Global Page Setup Dialog */}
      {showPageSetup && (
        <PageSetupDialog 
            isOpen={showPageSetup}
            onClose={() => setShowPageSetup(false)}
            config={pageConfig}
            onSave={(newConfig) => {
                setPageConfig(newConfig);
                setShowPageSetup(false);
            }}
        />
      )}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ErrorBoundary>
        <ThemeProvider>
          <EditorProvider>
            <AppContent />
          </EditorProvider>
        </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
