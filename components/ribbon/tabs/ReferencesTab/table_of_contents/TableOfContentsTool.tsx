
import React from 'react';
import { TableOfContents } from 'lucide-react';
import { DropdownRibbonButton } from '../common/ReferencesTools';
import { MenuPortal } from '../../../common/MenuPortal';
import { useReferencesTab } from '../ReferencesTabContext';
import { useEditor } from '../../../../../contexts/EditorContext';

export const TableOfContentsTool: React.FC = () => {
  const { activeMenu, menuPos, closeMenu } = useReferencesTab();
  const { executeCommand, content } = useEditor();
  const menuId = 'toc';

  const generateTOC = () => {
      // 1. Parse current content to find headings
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, 'text/html');
      const headings = Array.from(doc.querySelectorAll('h1, h2, h3'));
      
      if (headings.length === 0) {
          alert("No headings found to generate Table of Contents.");
          closeMenu();
          return;
      }

      // 2. Build TOC HTML
      let tocHtml = `<div class="toc-container" style="background: #f8fafc; padding: 24px; border: 1px solid #e2e8f0; margin: 20px 0; border-radius: 8px;">
        <h2 style="margin-top: 0; border-bottom: 2px solid #cbd5e1; padding-bottom: 10px; font-size: 18px; color: #1e293b;">Table of Contents</h2>
        <div style="font-family: 'Calibri', sans-serif; line-height: 1.8;">`;

      headings.forEach((h, index) => {
          const level = parseInt(h.tagName.substring(1));
          const text = h.textContent || `Heading ${index + 1}`;
          const marginLeft = (level - 1) * 20;
          const fontSize = level === 1 ? '11pt' : '10pt';
          const fontWeight = level === 1 ? 'bold' : 'normal';
          
          // Note: Real page numbers require layout engine awareness which is hard in HTML string.
          // We use placeholders or simple counters. For a web-view, anchors are better.
          // Ideally, we'd insert IDs into the actual headings in the document too. 
          // For this simulation, we just list them nicely.
          
          tocHtml += `
            <div style="display: flex; justify-content: space-between; border-bottom: 1px dotted #e2e8f0; margin-left: ${marginLeft}px; font-size: ${fontSize}; font-weight: ${fontWeight};">
                <span style="background: #f8fafc; padding-right: 5px;">${text}</span>
                <span style="background: #f8fafc; padding-left: 5px;">${index + 1}</span>
            </div>`;
      });

      tocHtml += `</div></div><p><br/></p>`;

      // 3. Insert
      executeCommand('insertHTML', tocHtml);
      closeMenu();
  };

  return (
    <>
        <DropdownRibbonButton 
            id={menuId} 
            icon={TableOfContents} 
            label="Table of Contents" 
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={240}>
             <div className="p-2">
                 <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2">Automatic</div>
                 <button onClick={generateTOC} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 mb-1 border border-transparent hover:border-slate-200 transition-all">
                     <div className="font-bold text-slate-800 mb-1">Automatic Table 1</div>
                     <div className="space-y-1 opacity-60">
                         <div className="h-1 bg-slate-400 w-3/4 rounded-full"></div>
                         <div className="h-1 bg-slate-300 w-1/2 rounded-full ml-2"></div>
                         <div className="h-1 bg-slate-300 w-1/2 rounded-full ml-2"></div>
                     </div>
                 </button>
                 <button onClick={generateTOC} className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs font-medium text-slate-700 border border-transparent hover:border-slate-200 transition-all">
                     <div className="font-bold text-slate-800 mb-1">Automatic Table 2</div>
                     <div className="space-y-1 opacity-60">
                         <div className="h-1 bg-slate-400 w-2/3 rounded-full"></div>
                         <div className="h-1 bg-slate-300 w-1/2 rounded-full ml-2"></div>
                     </div>
                 </button>
                 <div className="border-t border-slate-100 my-2"></div>
                 <button className="w-full text-left px-3 py-2 hover:bg-slate-100 rounded-md text-xs text-slate-600">Remove Table of Contents</button>
             </div>
        </MenuPortal>
    </>
  );
};
