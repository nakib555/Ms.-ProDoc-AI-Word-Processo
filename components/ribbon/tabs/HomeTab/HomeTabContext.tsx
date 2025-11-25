
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';

interface HomeTabContextType {
  activeMenu: string | null;
  menuPos: { top: number; left: number };
  toggleMenu: (id: string) => void;
  closeMenu: () => void;
  registerTrigger: (id: string, el: HTMLElement | null) => void;
}

const HomeTabContext = createContext<HomeTabContextType | undefined>(undefined);

export const HomeTabProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
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
    return () => {
        window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <HomeTabContext.Provider value={{ activeMenu, menuPos, toggleMenu, closeMenu, registerTrigger }}>
      {children}
    </HomeTabContext.Provider>
  );
};

export const useHomeTab = () => {
  const context = useContext(HomeTabContext);
  if (!context) {
    throw new Error('useHomeTab must be used within a HomeTabProvider');
  }
  return context;
};
