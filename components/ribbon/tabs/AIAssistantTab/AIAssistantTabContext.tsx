
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';

interface AIAssistantTabContextType {
  activeMenu: string | null;
  menuPos: { top: number; left: number };
  toggleMenu: (id: string) => void;
  closeMenu: () => void;
  registerTrigger: (id: string, el: HTMLButtonElement | null) => void;
}

const AIAssistantTabContext = createContext<AIAssistantTabContextType | undefined>(undefined);

export const AIAssistantTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    window.addEventListener('scroll', handleResize, true);
    return () => {
        window.removeEventListener('resize', handleResize);
        window.removeEventListener('scroll', handleResize, true);
    };
  }, []);

  return (
    <AIAssistantTabContext.Provider value={{ 
        activeMenu, menuPos, toggleMenu, closeMenu, registerTrigger
    }}>
      {children}
    </AIAssistantTabContext.Provider>
  );
};

export const useAIAssistantTab = () => {
  const context = useContext(AIAssistantTabContext);
  if (!context) {
    throw new Error('useAIAssistantTab must be used within a AIAssistantTabProvider');
  }
  return context;
};
