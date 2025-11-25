import React, { createContext, useContext, useState } from 'react';

interface FileTabContextType {
  activeModal: string | null;
  setActiveModal: (modal: string | null) => void;
  closeModal: () => void;
}

const FileTabContext = createContext<FileTabContextType | undefined>(undefined);

export const FileTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const closeModal = () => setActiveModal(null);

  return (
    <FileTabContext.Provider value={{ activeModal, setActiveModal, closeModal }}>
      {children}
    </FileTabContext.Provider>
  );
};

export const useFileTab = () => {
  const context = useContext(FileTabContext);
  if (!context) {
    throw new Error('useFileTab must be used within a FileTabProvider');
  }
  return context;
};