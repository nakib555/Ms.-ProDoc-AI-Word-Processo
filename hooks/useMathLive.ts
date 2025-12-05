
import React, { useEffect } from 'react';

export const useMathLive = (content: string, containerRef: React.RefObject<HTMLElement | null>) => {
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    // 1. Sync value from math-field to DOM attribute for saving/exporting
    const handleInput = (e: Event) => {
      const target = e.target as HTMLElement & { value?: string };
      if (target.tagName.toLowerCase() === 'math-field') {
         if (target.value !== undefined) {
            target.setAttribute('value', target.value);
         }
      }
    };

    // 2. Navigation: Enter MathField from Editor (Right/Left Arrows)
    const handleKeyDown = (e: KeyboardEvent) => {
        if (!['ArrowRight', 'ArrowLeft'].includes(e.key)) return;
        
        const selection = window.getSelection();
        if (!selection || !selection.rangeCount) return;
        const range = selection.getRangeAt(0);
        if (!range.collapsed) return;

        let targetWrapper: HTMLElement | null = null;
        const isRight = e.key === 'ArrowRight';

        // Helper to check if a node is our wrapper
        const isWrapper = (node: Node | null): node is HTMLElement => {
            return !!(node && node.nodeType === Node.ELEMENT_NODE && (node as HTMLElement).classList.contains('equation-wrapper'));
        };

        // Logic for Text Node
        if (range.endContainer.nodeType === Node.TEXT_NODE) {
            const textNode = range.endContainer;
            const offset = range.endOffset;
            const len = textNode.textContent?.length || 0;
            const textContent = textNode.textContent || '';

            if (isRight) {
                // Case 1: At exact end of text node: |<wrapper>
                if (offset === len) {
                    if (isWrapper(textNode.nextSibling)) targetWrapper = textNode.nextSibling as HTMLElement;
                }
                // Case 2: Before a trailing ZWS: |\u200B<wrapper>
                // We want to skip the ZWS and enter the wrapper immediately
                else if (offset === len - 1 && textContent[len-1] === '\u200B') {
                     if (isWrapper(textNode.nextSibling)) targetWrapper = textNode.nextSibling as HTMLElement;
                }
            } else {
                // Left Arrow
                // Case 1: At start of text node: <wrapper>|
                if (offset === 0) {
                    if (isWrapper(textNode.previousSibling)) targetWrapper = textNode.previousSibling as HTMLElement;
                }
                // Case 2: After a leading ZWS: <wrapper>\u200B|
                else if (offset === 1 && textContent[0] === '\u200B') {
                    if (isWrapper(textNode.previousSibling)) targetWrapper = textNode.previousSibling as HTMLElement;
                }
            }
        } 
        // Logic for Element Node (cursor is between tags)
        else if (range.endContainer.nodeType === Node.ELEMENT_NODE) {
            const containerNode = range.endContainer;
            const offset = range.endOffset;
            
            if (isRight) {
                // Node at index `offset` is the one to the right
                const nextNode = containerNode.childNodes[offset];
                if (isWrapper(nextNode)) targetWrapper = nextNode as HTMLElement;
            } else {
                // Node at index `offset - 1` is the one to the left
                if (offset > 0) {
                    const prevNode = containerNode.childNodes[offset - 1];
                    if (isWrapper(prevNode)) targetWrapper = prevNode as HTMLElement;
                }
            }
        }

        if (targetWrapper) {
            const mathField = targetWrapper.querySelector('math-field') as any;
            if (mathField) {
                e.preventDefault();
                mathField.focus();
                // Set internal cursor position
                if (isRight) {
                    mathField.executeCommand('moveToMathFieldStart');
                } else {
                    mathField.executeCommand('moveToMathFieldEnd');
                }
            }
        }
    };

    // 3. Navigation: Exit MathField to Editor (move-out event from MathLive)
    const handleMoveOut = (e: Event) => {
        const target = e.target as HTMLElement;
        if (target.tagName.toLowerCase() !== 'math-field') return;
        
        const detail = (e as CustomEvent).detail;
        const direction = detail.direction; // 'forward', 'backward', 'up', 'down'
        const wrapper = target.closest('.equation-wrapper');
        
        if (wrapper && container.contains(wrapper)) {
            const selection = window.getSelection();
            const range = document.createRange();
            
            if (direction === 'forward' || direction === 'right') {
                // Move to after wrapper
                let nextNode = wrapper.nextSibling;
                // If next is a text node starting with ZWS, jump over it
                if (nextNode && nextNode.nodeType === Node.TEXT_NODE && nextNode.textContent?.startsWith('\u200B')) {
                    range.setStart(nextNode, 1);
                    range.setEnd(nextNode, 1);
                } else {
                    range.setStartAfter(wrapper);
                    range.setEndAfter(wrapper);
                }
            } else if (direction === 'backward' || direction === 'left') {
                // Move to before wrapper
                let prevNode = wrapper.previousSibling;
                // If prev is a text node ending with ZWS, jump before it
                if (prevNode && prevNode.nodeType === Node.TEXT_NODE && prevNode.textContent?.endsWith('\u200B')) {
                    const len = prevNode.textContent!.length;
                    const safeOffset = Math.max(0, len - 1); // Safe guard against 0-length text node
                    range.setStart(prevNode, safeOffset);
                    range.setEnd(prevNode, safeOffset);
                } else {
                    range.setStartBefore(wrapper);
                    range.setEndBefore(wrapper);
                }
            } else {
                return;
            }
            
            selection?.removeAllRanges();
            selection?.addRange(range);
            container.focus();
        }
    };

    // 4. Interaction: Click on wrapper area (padding/background) focuses the math-field
    const handleClick = (e: MouseEvent) => {
        const target = e.target as HTMLElement;
        const wrapper = target.closest('.equation-wrapper');
        
        // If clicked on wrapper or handle but not the math-field itself
        if (wrapper && target.tagName.toLowerCase() !== 'math-field') {
             const mathField = wrapper.querySelector('math-field') as HTMLElement;
             if (mathField) {
                 e.preventDefault();
                 e.stopPropagation();
                 mathField.focus();
             }
        }
    };

    container.addEventListener('input', handleInput);
    container.addEventListener('keydown', handleKeyDown);
    container.addEventListener('move-out', handleMoveOut);
    container.addEventListener('click', handleClick);
    
    return () => {
      container.removeEventListener('input', handleInput);
      container.removeEventListener('keydown', handleKeyDown);
      container.removeEventListener('move-out', handleMoveOut);
      container.removeEventListener('click', handleClick);
    };
  }, [containerRef]); 
};
