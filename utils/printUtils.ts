
import { PageConfig } from '../types';
import { PAGE_SIZES } from '../constants';

export const generatePdfPrint = async (
    content: string, 
    config: PageConfig, 
    headerContent: string, 
    footerContent: string
): Promise<void> => {
    try {
        const oldContainer = document.getElementById('paged-print-container');
        if (oldContainer) document.body.removeChild(oldContainer);
        const oldStyle = document.getElementById('paged-print-style');
        if (oldStyle) document.head.removeChild(oldStyle);

        const printContainer = document.createElement('div');
        printContainer.id = 'paged-print-container';
        document.body.appendChild(printContainer);

        const { size, orientation, margins } = config;
        
        let widthIn = 0;
        let heightIn = 0;

        if (size === 'Custom' && config.customWidth && config.customHeight) {
            widthIn = config.customWidth;
            heightIn = config.customHeight;
        } else {
            const baseSize = PAGE_SIZES[size as string] || PAGE_SIZES['Letter'];
            widthIn = baseSize.width / 96;
            heightIn = baseSize.height / 96;
        }

        if (orientation === 'landscape') {
            const temp = widthIn;
            widthIn = heightIn;
            heightIn = temp;
        }

        const sizeCss = `${widthIn}in ${heightIn}in`;

        const css = `
            @page {
                size: ${sizeCss};
                margin-top: ${margins.top}in;
                margin-bottom: ${margins.bottom}in;
                margin-left: ${margins.left}in;
                margin-right: ${margins.right}in;
                
                @top-center {
                    content: element(header);
                }
                @bottom-center {
                    content: element(footer);
                }
            }

            .pagedjs-header {
                position: running(header);
                width: 100%;
            }

            .pagedjs-footer {
                position: running(footer);
                width: 100%;
            }

            .paged-content {
                font-family: 'Calibri, Inter, sans-serif';
                font-size: 11pt;
                line-height: 1.5;
                color: black;
            }
            
            .paged-content table { 
                border-collapse: collapse; 
                width: 100%; 
                margin: 1em 0;
            }
            .paged-content tr {
                break-inside: avoid;
                page-break-inside: avoid;
            }
            .paged-content td, .paged-content th { 
                border: 1px solid #000; 
                padding: 4px 8px; 
            }
            
            .paged-content img { max-width: 100%; }
            .equation-handle, .equation-dropdown { display: none !important; }
            .prodoc-page-break { break-after: page; page-break-after: always; height: 0; margin: 0; border: none; }
            
            .pagedjs_page {
               background: white;
               box-shadow: none !important;
               margin: 0 !important;
            }
            
            #paged-print-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                z-index: -1000;
                visibility: visible;
            }

            /* Hide UI for print */
            @media print {
                body.printing-mode > *:not(#paged-print-container) { display: none !important; }
                body.printing-mode #paged-print-container {
                    display: block !important;
                    position: absolute;
                    top: 0;
                    left: 0;
                    margin: 0;
                }
            }
        `;

        let cleanHeader = headerContent.replace('[Header]', '');
        let cleanFooter = footerContent; 
        if (cleanFooter.includes('page-number-placeholder')) {
             cleanFooter = cleanFooter.replace(/<span class="page-number-placeholder">.*?<\/span>/g, '<span class="pagedjs-page-number"></span>');
        }

        const pageNumCss = `
           .pagedjs-page-number::after {
               content: counter(page);
           }
        `;

        const htmlContent = `
            <div class="pagedjs-header">${cleanHeader}</div>
            <div class="pagedjs-footer">${cleanFooter}</div>
            <div class="paged-content">
                ${content}
            </div>
        `;

        // Dynamic Import for PagedJS
        const { Previewer } = await import('pagedjs');

        const previewer = new Previewer();
        
        const styleEl = document.createElement('style');
        styleEl.id = 'paged-print-style';
        styleEl.innerHTML = css + pageNumCss;
        document.head.appendChild(styleEl);

        // 1. Generate Layout with Paged.js
        await previewer.preview(htmlContent, [], printContainer);

        // 2. Trigger Browser Native Print (Vector Output)
        document.body.classList.add('printing-mode');
        
        // Delay to ensure rendering logic settles before print dialog takes over main thread
        await new Promise(resolve => setTimeout(resolve, 800));
        
        window.print();
        
        // Cleanup
        document.body.classList.remove('printing-mode');
        
        if (document.body.contains(printContainer)) {
            document.body.removeChild(printContainer);
        }
        if (document.head.contains(styleEl)) {
            document.head.removeChild(styleEl);
        }

    } catch (e) {
        console.error("Print Error:", e);
        alert("Failed to generate document. Please try again.");
    }
};
