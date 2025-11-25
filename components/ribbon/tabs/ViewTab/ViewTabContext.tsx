
import React, { createContext, useContext, useState } from 'react';

interface ViewTabContextType {
  showNavPane: boolean;
  setShowNavPane: React.Dispatch<React.SetStateAction<boolean>>;
}

const ViewTabContext = createContext<ViewTabContextType | undefined>(undefined);

export const ViewTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [showNavPane, setShowNavPane] = useState(true);

  return (
    <ViewTabContext.Provider value={{ showNavPane, setShowNavPane }}>
      {children}
    </ViewTabContext.Provider>
  );
};

export const useViewTab = () => {
  const context = useContext(ViewTabContext);
  if (!context) {
    throw new Error('useViewTab must be used within a ViewTabProvider');
  }
  return context;
};
