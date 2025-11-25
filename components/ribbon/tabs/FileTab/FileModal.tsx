import React from 'react';
import { X } from 'lucide-react';
import { useFileTab } from './FileTabContext';
import { InfoModal } from './modals/InfoModal';
import { NewModal } from './modals/NewModal';
import { OpenModal } from './modals/OpenModal';
import { SaveAsModal } from './modals/SaveAsModal';
import { PrintModal } from './modals/PrintModal';
import { ShareModal } from './modals/ShareModal';

export const FileModal: React.FC = () => {
  const { activeModal, closeModal } = useFileTab();

  if (!activeModal) return null;

  const renderModalContent = () => {
    switch (activeModal) {
      case 'info': return <InfoModal />;
      case 'new': return <NewModal />;
      case 'open': return <OpenModal />;
      case 'save_as': return <SaveAsModal />;
      case 'print': return <PrintModal />;
      case 'share': return <ShareModal />;
      default: return null;
    }
  };

  const getTitle = () => {
      switch(activeModal) {
          case 'save_as': return 'Save As';
          default: return activeModal;
      }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-200" onClick={closeModal}>
      <div 
         className="bg-white w-full h-[92dvh] sm:h-auto sm:max-h-[85vh] rounded-t-2xl sm:rounded-xl shadow-2xl sm:max-w-5xl flex flex-col animate-in slide-in-from-bottom-4 sm:zoom-in-95 duration-200 border-t sm:border border-white/20 overflow-hidden"
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