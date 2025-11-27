
export const MATH_SYMBOLS: Record<string, string> = {
  '\\alpha': 'α', '\\beta': 'β', '\\gamma': 'γ', '\\delta': 'δ', '\\epsilon': 'ε',
  '\\theta': 'θ', '\\lambda': 'λ', '\\mu': 'μ', '\\pi': 'π', '\\sigma': 'σ',
  '\\phi': 'φ', '\\omega': 'ω', '\\Delta': '∆', '\\Omega': 'Ω', '\\sum': '∑',
  '\\prod': '∏', '\\int': '∫', '\\approx': '≈', '\\neq': '≠', '\\leq': '≤',
  '\\geq': '≥', '\\infty': '∞', '\\pm': '±', '\\div': '÷', '\\times': '×',
  '\\rightarrow': '→', '\\leftarrow': '←', '\\leftrightarrow': '↔',
  '\\forall': '∀', '\\exists': '∃', '\\in': '∈', '\\notin': '∉',
  '\\subset': '⊂', '\\supset': '⊃', '\\union': '∪', '\\intersect': '∩',
  '\\partial': '∂', '\\nabla': '∇', '\\sqrt': '√'
};

export const handleMathInput = (e: KeyboardEvent, selection: Selection | null) => {
  if (!selection || !selection.anchorNode) return false;
  
  const node = selection.anchorNode;
  const text = node.textContent || '';
  const offset = selection.anchorOffset;

  // Handle Space triggering replacement
  if (e.key === ' ') {
    // Look back from cursor for a backslash command
    const textBefore = text.slice(0, offset);
    const match = textBefore.match(/(\\[a-zA-Z]+)$/);
    
    if (match) {
      const command = match[1];
      const replacement = MATH_SYMBOLS[command];
      
      if (replacement) {
        e.preventDefault();
        
        const range = selection.getRangeAt(0);
        // Select the command
        range.setStart(node, offset - command.length);
        range.setEnd(node, offset);
        range.deleteContents();
        
        // Insert symbol + space (optional space logic)
        const textNode = document.createTextNode(replacement);
        range.insertNode(textNode);
        
        // Move cursor after
        range.setStartAfter(textNode);
        range.setEndAfter(textNode);
        selection.removeAllRanges();
        selection.addRange(range);
        return true;
      }
    }
  }
  
  // Handle Superscript (^) trigger
  if (e.key === '^') {
      e.preventDefault();
      document.execCommand('superscript', false);
      return true;
  }

  return false;
};
