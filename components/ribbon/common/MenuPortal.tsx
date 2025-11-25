import React, { useLayoutEffect, useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';

interface MenuPortalProps {
  id: string;
  activeMenu: string | null;
  triggerElement?: HTMLElement | null;
  menuPos?: { top: number; left: number };
  closeMenu: () => void;
  width?: number | string;
  children: React.ReactNode;
}

export const MenuPortal: React.FC<MenuPortalProps> = ({ 
  id,
  activeMenu,
  triggerElement,
  menuPos,
  closeMenu, 
  width = 200, 
  children 
}) => {
  const isOpen = activeMenu === id;
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState<{top: number, left: number} | null>(null);

  // Helper to calculate position ensuring it stays on screen
  const calculatePosition = React.useCallback(() => {
    if (!isOpen) return;

    let top = 0;
    let left = 0;
    
    // 1. Determine anchor point
    if (triggerElement) {
        const triggerRect = triggerElement.getBoundingClientRect();
        top = triggerRect.bottom + 4;
        left = triggerRect.left;
    } else if (menuPos) {
        top = menuPos.top;
        left = menuPos.left;
    } else {
        return; // No anchor
    }

    // 2. Adjust for viewport boundaries
    if (menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;
        
        // Horizontal Constraint (Right Edge)
        // If menu goes off-screen right, align it to the right or shift left
        if (left + menuRect.width > viewportWidth - 10) {
              left = viewportWidth - menuRect.width - 10;
        }
        
        // Horizontal Constraint (Left Edge)
        if (left < 10) left = 10;

        // Vertical Constraint (Bottom Edge) -- optional, usually menus scroll
        // But we can ensure max-height fits
    }
    
    setPosition({ top, left });
  }, [isOpen, triggerElement, menuPos]);

  // Use layout effect to measure and position before paint to avoid flickering
  useLayoutEffect(() => {
    if (isOpen) {
       // Initial calculation
       calculatePosition();
    }
  }, [isOpen, calculatePosition, width, children]);

  // Handle Resize and Scroll
  useEffect(() => {
     if (!isOpen) return;
     
     const handleEvent = () => {
         // Use requestAnimationFrame for smoother performance on scroll
         requestAnimationFrame(calculatePosition);
     };

     window.addEventListener('resize', handleEvent);
     window.addEventListener('scroll', handleEvent, true); // Capture phase for all scrolling containers

     return () => {
         window.removeEventListener('resize', handleEvent);
         window.removeEventListener('scroll', handleEvent, true);
     };
  }, [isOpen, calculatePosition]);

  if (!isOpen) return null;

  const style: React.CSSProperties = {
      position: 'fixed',
      width: typeof width === 'number' ? `${width}px` : width,
      maxHeight: '80vh',
      overflowY: 'auto',
      zIndex: 9999,
      top: position ? position.top : (menuPos?.top || 0),
      left: position ? position.left : (menuPos?.left || 0),
      // Prevent interaction until positioned to avoid accidental clicks during layout shift
      opacity: position ? 1 : 0, 
      pointerEvents: position ? 'auto' : 'none',
      transition: 'opacity 0.1s ease-out'
  };

  return ReactDOM.createPortal(
    <>
      <div 
          className="fixed inset-0 z-[9998]" 
          onClick={(e) => { e.stopPropagation(); closeMenu(); }}
      />
      <div 
          ref={menuRef}
          className="bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-700 flex flex-col py-1.5 animate-in fade-in zoom-in-95 duration-100 dark:text-slate-200"
          style={style}
          onClick={(e) => e.stopPropagation()}
      >
          {children}
      </div>
    </>,
    document.body
  );
};