
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface DesignTabContextType {
  activeMenu: string | null;
  menuPos: { top: number; left: number };
  toggleMenu: (id: string) => void;
  closeMenu: () => void;
  registerTrigger: (id: string, el: HTMLButtonElement | null) => void;
}

const DesignTabContext = createContext<DesignTabContextType | undefined>(undefined);

export const DesignTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const triggerRefs = useRef<{ [key: string]: HTMLButtonElement | null }>({});

  const registerTrigger = useCallback((id: string, el: HTMLButtonElement | null) => {
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
    <DesignTabContext.Provider value={{ 
        activeMenu, menuPos, toggleMenu, closeMenu, registerTrigger
    }}>
      {children}
    </DesignTabContext.Provider>
  );
};

export const useDesignTab = () => {
  const context = useContext(DesignTabContext);
  if (!context) {
    throw new Error('useDesignTab must be used within a DesignTabProvider');
  }
  return context;
};
