import { useState, useRef, useCallback } from 'react';
import { SaveStatus } from '../types';

export const useAutoSave = () => {
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const autoSaveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const triggerAutoSave = useCallback(() => {
    setSaveStatus('unsaved');
    
    if (autoSaveTimerRef.current) {
      clearTimeout(autoSaveTimerRef.current);
    }
    
    // Debounce save
    autoSaveTimerRef.current = setTimeout(() => {
      setSaveStatus('saving');
      // Simulate network delay for saving
      setTimeout(() => {
        setSaveStatus('saved');
      }, 1000);
    }, 2000);
  }, []);

  const manualSave = useCallback(() => {
    setSaveStatus('saving');
    if (autoSaveTimerRef.current) clearTimeout(autoSaveTimerRef.current);
    setTimeout(() => setSaveStatus('saved'), 800);
  }, []);

  return { saveStatus, triggerAutoSave, manualSave, setSaveStatus };
};