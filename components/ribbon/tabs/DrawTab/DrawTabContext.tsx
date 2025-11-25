import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface DrawTabContextType {
  activeMenu: string | null;
  menuPos: { top: number; left: number };
  toggleMenu: (id: string) => void;
  closeMenu: () => void;
  registerTrigger: (id: string, el: HTMLElement | null) => void;
  activeTool: string;
  setActiveTool: (toolId: string) => void;
}

const DrawTabContext = createContext<DrawTabContextType | undefined>(undefined);

export const DrawTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [activeTool, setActiveTool] = useState<string>('select');
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
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    <DrawTabContext.Provider value={{ 
        activeMenu, menuPos, toggleMenu, closeMenu, registerTrigger,
        activeTool, setActiveTool
    }}>
      {children}
    </DrawTabContext.Provider>
  );
};

export const useDrawTab = () => {
  const context = useContext(DrawTabContext);
  if (!context) {
    throw new Error('useDrawTab must be used within a DrawTabProvider');
  }
  return context;
};