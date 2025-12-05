
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
  const [position, setPosition] = useState<{top: number, left: number, maxHeight?: string} | null>(null);

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

    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    let maxHeightStr = '80vh';

    // 2. Adjust for viewport boundaries
    if (menuRef.current) {
        const menuRect = menuRef.current.getBoundingClientRect();
        
        // Horizontal Constraint (Right Edge)
        if (left + menuRect.width > viewportWidth - 10) {
              left = viewportWidth - menuRect.width - 10;
        }
        
        // Horizontal Constraint (Left Edge)
        if (left < 10) left = 10;

        // Vertical Constraint (Bottom Edge)
        // If menu goes off-screen bottom, constrain height
        const availableHeight = viewportHeight - top - 10;
        
        // If very little space below (< 200px) and more space above, consider flipping (if trigger height known)
        // Without trigger height, we can't safely flip above. 
        // Assuming ribbon menus drop down, we just constrain height to fit remaining viewport.
        if (availableHeight < 150) {
             // Fallback: If excessively small, maybe we allow overlap or force a min height with scroll
             // But standard behavior is scroll within available
             maxHeightStr = `${Math.max(150, availableHeight)}px`;
        } else {
             // Cap at available height or 80vh, whichever is smaller
             maxHeightStr = `min(80vh, ${availableHeight}px)`;
        }
    }
    
    setPosition({ top, left, maxHeight: maxHeightStr });
  }, [isOpen, triggerElement, menuPos]);

  // Use layout effect to measure and position before paint to avoid flickering
  useLayoutEffect(() => {
    if (isOpen) {
       calculatePosition();
    }
  }, [isOpen, calculatePosition, width, children]);

  // Handle Resize and Scroll
  useEffect(() => {
     if (!isOpen) return;
     
     const handleEvent = (e: Event) => {
         if (e.type === 'scroll' && menuRef.current && menuRef.current.contains(e.target as Node)) {
             return;
         }
         requestAnimationFrame(calculatePosition);
     };

     window.addEventListener('resize', handleEvent);
     window.addEventListener('scroll', handleEvent, true);

     return () => {
         window.removeEventListener('resize', handleEvent);
         window.removeEventListener('scroll', handleEvent, true);
     };
  }, [isOpen, calculatePosition]);

  if (!isOpen) return null;

  const style: React.CSSProperties = {
      position: 'fixed',
      width: typeof width === 'number' ? `${width}px` : width,
      maxHeight: position?.maxHeight || '80vh',
      overflowY: 'auto',
      zIndex: 9999,
      top: position ? position.top : (menuPos?.top || 0),
      left: position ? position.left : (menuPos?.left || 0),
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
