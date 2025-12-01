
import React, { useState } from 'react';
import { CheckCheck } from 'lucide-react';
import { RibbonButton } from '../../../common/RibbonButton';
import { useEditor } from '../../../../../contexts/EditorContext';
import { AdvancedGrammarDialog } from './AdvancedGrammarDialog';

export const FixGrammarTool: React.FC = () => {
  const { editorRef, executeCommand } = useEditor(); // Using editor context to access selection
  const [showDialog, setShowDialog] = useState(false);
  const [initialText, setInitialText] = useState('');

  const handleOpen = () => {
    const selection = window.getSelection();
    let textToAnalyze = '';

    if (selection && selection.toString().trim().length > 0) {
        textToAnalyze = selection.toString();
    } else if (editorRef.current) {
        textToAnalyze = editorRef.current.innerText;
    }

    if (!textToAnalyze) {
        alert("Please select some text or type in the document first.");
        return;
    }

    setInitialText(textToAnalyze);
    setShowDialog(true);
  };

  const handleApply = (newText: string) => {
      // If we had a selection, replace it. If not (full doc), replace all.
      // This logic mirrors typical useAI behavior but explicit here since we handle the UI.
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0 && !selection.isCollapsed) {
          document.execCommand('insertText', false, newText);
      } else {
          // Replace full content - simpler to just use insertText for now to avoid HTML issues from raw text
          // Ideally we'd use setContent but we want undo stack.
          // For a robust implementation, usually we select all then insert.
          if (editorRef.current) {
             executeCommand('selectAll');
             document.execCommand('insertText', false, newText);
             // Clear selection
             const sel = window.getSelection();
             sel?.removeAllRanges();
          }
      }
  };

  return (
    <>
        <RibbonButton 
            icon={CheckCheck} 
            label="Fix Grammar" 
            onClick={handleOpen} 
            title="Advanced Grammar & Style Check"
        />
        
        {showDialog && (
            <AdvancedGrammarDialog 
                isOpen={showDialog}
                onClose={() => setShowDialog(false)}
                initialText={initialText}
                onApply={handleApply}
            />
        )}
    </>
  );
};
