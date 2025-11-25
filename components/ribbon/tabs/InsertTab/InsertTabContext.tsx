
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface InsertTabContextType {
  activeMenu: string | null;
  menuPos: { top: number; left: number };
  toggleMenu: (id: string) => void;
  closeMenu: () => void;
  registerTrigger: (id: string, el: any) => void;
}

const InsertTabContext = createContext<InsertTabContextType | undefined>(undefined);

export const InsertTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const registerTrigger = (id: string, el: HTMLElement | null) => {
    triggerRefs.current[id] = el;
  };

  const toggleMenu = (menuId: string) => {
    if (activeMenu === menuId) {
        setActiveMenu(null);
    } else {
        const trigger = triggerRefs.current[menuId];
        if (trigger) {
            const rect = trigger.getBoundingClientRect();
            setMenuPos({ top: rect.bottom, left: rect.left });
            setActiveMenu(menuId);
        }
    }
  };

  const closeMenu = () => setActiveMenu(null);

  useEffect(() => {
    const handleResize = () => setActiveMenu(null);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <InsertTabContext.Provider value={{ activeMenu, menuPos, toggleMenu, closeMenu, registerTrigger }}>
      {children}
    </InsertTabContext.Provider>
  );
};

export const useInsertTab = () => {
  const context = useContext(InsertTabContext);
  if (!context) {
    throw new Error('useInsertTab must be used within a InsertTabProvider');
  }
  return context;
};
