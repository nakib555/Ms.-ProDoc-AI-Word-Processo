import { useState, useEffect } from 'react';
import { ViewMode } from '../types';

export const useResponsive = (initialViewMode: ViewMode) => {
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<ViewMode>(initialViewMode);

  useEffect(() => {
    const checkMobile = () => {
       const mobile = window.innerWidth < 768;
       setIsMobile(mobile);
       
       if (mobile) {
           setViewMode('web');
       }
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  return { isMobile, viewMode, setViewMode };
};