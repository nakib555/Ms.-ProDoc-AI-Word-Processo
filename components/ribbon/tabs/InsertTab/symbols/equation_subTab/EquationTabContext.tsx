
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface EquationTabContextType {
  activeMenu: string | null;
  menuPos: { top: number; left: number };
  toggleMenu: (id: string) => void;
  closeMenu: () => void;
  registerTrigger: (id: string, el: HTMLElement | null) => void;
  conversionType: 'unicode' | 'latex';
  setConversionType: (type: 'unicode' | 'latex') => void;
}

const EquationTabContext = createContext<EquationTabContextType | undefined>(undefined);

export const EquationTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeMenu, setActiveMenu] = useState<string | null>(null);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [conversionType, setConversionType] = useState<'unicode' | 'latex'>('unicode');
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
    <EquationTabContext.Provider value={{ 
        activeMenu, menuPos, toggleMenu, closeMenu, registerTrigger,
        conversionType, setConversionType
    }}>
      {children}
    </EquationTabContext.Provider>
  );
};

export const useEquationTab = () => {
  const context = useContext(EquationTabContext);
  if (!context) {
    throw new Error('useEquationTab must be used within a EquationTabProvider');
  }
  return context;
};
