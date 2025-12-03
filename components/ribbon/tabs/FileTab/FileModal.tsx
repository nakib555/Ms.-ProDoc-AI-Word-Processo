
import React, { Suspense } from 'react';
import { X, Loader2 } from 'lucide-react';
import { useFileTab } from './FileTabContext';

// Lazy Load Modals
const InfoModal = React.lazy(() => import('./modals/InfoModal').then(m => ({ default: m.InfoModal })));
const NewModal = React.lazy(() => import('./modals/NewModal').then(m => ({ default: m.NewModal })));
const OpenModal = React.lazy(() => import('./modals/OpenModal').then(m => ({ default: m.OpenModal })));
const SaveAsModal = React.lazy(() => import('./modals/SaveAsModal').then(m => ({ default: m.SaveAsModal })));
const PrintModal = React.lazy(() => import('./modals/PrintModal').then(m => ({ default: m.PrintModal })));
const ShareModal = React.lazy(() => import('./modals/ShareModal').then(m => ({ default: m.ShareModal })));

const ModalLoading = () => (
  <div className="flex flex-col items-center justify-center h-64 text-slate-400">
    <Loader2 className="animate-spin mb-2" size={24} />
    <span className="text-sm">Loading...</span>
  </div>
);

export const FileModal: React.FC = () => {
  const { activeModal, closeModal } = useFileTab();

  if (!activeModal) return null;

  const renderModalContent = () => {
    return (
      <Suspense fallback={<ModalLoading />}>
        {(() => {
          switch (activeModal) {
            case 'info': return <InfoModal />;
            case 'new': return <NewModal />;
            case 'open': return <OpenModal />;
            case 'save_as': return <SaveAsModal />;
            case 'print': return <PrintModal />;
            case 'share': return <ShareModal />;
            default: return null;
          }
        })()}
      </Suspense>
    );
  };

  const getTitle = () => {
      switch(activeModal) {
          case 'save_as': return 'Save As';
          default: return activeModal;
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
      <div 
         className="bg-white w-full h-[75vh] sm:h-auto sm:max-h-[85vh] rounded-2xl sm:rounded-xl shadow-2xl sm:max-w-5xl flex flex-col animate-in zoom-in-95 duration-200 border border-white/20 overflow-hidden"
         onClick={e => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex justify-between items-center px-4 md:px-6 py-3 md:py-4 border-b border-slate-100 bg-white shrink-0">
           <h2 className="text-lg md:text-xl font-bold text-slate-800 capitalize flex items-center gap-2">
              {getTitle()}
           </h2>
           <button onClick={closeModal} className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600">
             <X size={20} />
           </button>
        </div>
        
        {/* Modal Content */}
        <div className="p-4 md:p-6 lg:p-8 overflow-y-auto bg-[#f8fafc] scrollbar-thin scrollbar-thumb-slate-200 flex-1">
           {renderModalContent()}
        </div>
      </div>
    </div>
  );
};
