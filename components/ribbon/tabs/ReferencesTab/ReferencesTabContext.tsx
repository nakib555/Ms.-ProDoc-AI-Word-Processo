
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface ReferencesTabContextType {
  activeMenu: string | null;
  menuPos: { top: number; left: number };
  toggleMenu: (id: string) => void;
  closeMenu: () => void;
  registerTrigger: (id: string, el: HTMLElement | null) => void;
}

const ReferencesTabContext = createContext<ReferencesTabContextType | undefined>(undefined);

export const ReferencesTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRefs = useRef<{ [key: string]: HTMLElement | null }>({});

  const registerTrigger = useCallback((id: string, el: HTMLElement | null) => {
    triggerRefs.current[id] = el;
  }, []);

  const toggleMenu = useCallback((menuId: string) => {
    setActiveMenu(prev => {
        if (prev === menuId) return null;
        
        const trigger = triggerRefs.current[menuId];
        if (trigger) {
            const rect = trigger.getBoundingClientRect();
            setMenuPos({ top: rect.bottom, left: rect.left });
        }
        return menuId;
    });
  }, []);

  const closeMenu = useCallback(() => setActiveMenu(null), []);

  useEffect(() => {
    const handleResize = () => setActiveMenu(null);
    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
    };
  }, []);

  return (
    <ReferencesTabContext.Provider value={{ 
        activeMenu, menuPos, toggleMenu, closeMenu, registerTrigger
    }}>
      {children}
    </ReferencesTabContext.Provider>
  );
};

export const useReferencesTab = () => {
  const context = useContext(ReferencesTabContext);
  if (!context) {
    throw new Error('useReferencesTab must be used within a ReferencesTabProvider');
  }
  return context;
};
