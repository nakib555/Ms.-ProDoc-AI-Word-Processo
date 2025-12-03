
import React, { useState } from 'react';
import { Scissors } from 'lucide-react';
import { SmallRibbonButton } from '../common/AITools';
import { useEditor } from '../../../../../contexts/EditorContext';
import { AdvancedShortenDialog } from './AdvancedShortenDialog';

export const ShortenTool: React.FC = () => {
  const { editorRef, executeCommand } = useEditor();
  const [showDialog, setShowDialog] = useState(false);
  const [initialText, setInitialText] = useState('');

  const handleOpen = () => {
    const selection = window.getSelection();
    let textToProcess = '';

    if (selection && selection.toString().trim().length > 0) {
        textToProcess = selection.toString();
    } else if (editorRef.current) {
        // Fallback to whole document content if no selection
        textToProcess = editorRef.current.innerText;
    }

    if (!textToProcess.trim()) {
        alert("Please add content or select text to shorten.");
        return;
    }

    setInitialText(textToProcess);
    setShowDialog(true);
  };

  const handleInsert = (html: string) => {
      // Logic to replace selection or insert
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
          executeCommand('insertHTML', html);
      } else {
          // If no selection was active, execute insertHTML which usually appends or inserts at caret
          executeCommand('insertHTML', html);
      }
  };

  return (
    <>
        <SmallRibbonButton 
            icon={Scissors} 
            label="Shorten" 
            onClick={handleOpen} 
        />
        
        {showDialog && (
            <AdvancedShortenDialog
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                initialText={initialText}
                onInsert={handleInsert}
            />
        )}
    </>
  );
};
