
import satori from 'satori';
import { html } from 'satori-html';
import { jsPDF } from 'jspdf';
import { svg2pdf } from 'svg2pdf.js';
import { PageConfig } from '../types';
import { PAGE_SIZES } from '../constants';

// Load fonts for Satori (Inter)
const loadFonts = async () => {
    const regular = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-400-normal.woff').then(res => res.arrayBuffer());
    const bold = await fetch('https://cdn.jsdelivr.net/npm/@fontsource/inter@5.0.18/files/inter-latin-700-normal.woff').then(res => res.arrayBuffer());
    return [
        { name: 'Inter', data: regular, weight: 400, style: 'normal' },
        { name: 'Inter', data: bold, weight: 700, style: 'normal' },
    ];
};

export const generateVectorPdf = async (
    pages: { html: string; config: PageConfig }[],
    documentTitle: string,
    onProgress?: (msg: string) => void
) => {
    try {
        if (onProgress) onProgress("Loading fonts...");
        const fonts = await loadFonts();

        // Initialize PDF
        const firstPage = pages[0].config;
        const orientation = firstPage.orientation === 'landscape' ? 'l' : 'p';
        const format = firstPage.size === 'Custom' 
            ? [firstPage.customWidth || 8.5, firstPage.customHeight || 11] 
            : firstPage.size.toLowerCase();

        const doc = new jsPDF({
            orientation: orientation,
            unit: 'in',
            format: format
        });

        // Delete initial page
        doc.deletePage(1);

        for (let i = 0; i < pages.length; i++) {
            const page = pages[i];
            if (onProgress) onProgress(`Rendering page ${i + 1} of ${pages.length}...`);

            const config = page.config;
            const isLandscape = config.orientation === 'landscape';

            // Dimensions
            let widthIn = 0;
            let heightIn = 0;

            if (config.size === 'Custom' && config.customWidth && config.customHeight) {
                widthIn = config.customWidth;
                heightIn = config.customHeight;
            } else {
                const base = PAGE_SIZES[config.size as string] || PAGE_SIZES['Letter'];
                widthIn = base.width / 96;
                heightIn = base.height / 96;
            }

            if (isLandscape) {
                [widthIn, heightIn] = [heightIn, widthIn];
            }
            
            // Satori works in pixels (96 DPI standard)
            const widthPx = widthIn * 96;
            const heightPx = heightIn * 96;

            // Margins
            const mt = config.margins.top * 96;
            const mb = config.margins.bottom * 96;
            const ml = config.margins.left * 96;
            const mr = config.margins.right * 96;
            const gutter = (config.margins.gutter || 0) * 96;
            
            const effectiveMl = ml + (config.gutterPosition === 'left' ? gutter : 0);
            const effectiveMt = mt + (config.gutterPosition === 'top' ? gutter : 0);

            // Prepare Content for Satori
            // Satori requires explicit flex styles for layout containers.
            // We inject a style block to enforce flex column layout on all block-level elements
            // to prevent "Expected <div> to have explicit display: flex" errors.
            const contentHtml = `
                <div style="display: flex; flex-direction: column; width: 100%; height: 100%; background-color: white; font-family: 'Inter', sans-serif; font-size: 14px; color: black;">
                    <style>
                        div, section, article, header, footer, main, nav, aside, p, h1, h2, h3, h4, h5, h6, li, blockquote {
                            display: flex;
                            flex-direction: column;
                        }
                        ul, ol {
                            display: flex;
                            flex-direction: column;
                        }
                        /* Tables need flex for Satori */
                        table, tr, tbody, thead, tfoot {
                            display: flex;
                            flex-direction: column;
                        }
                        td, th {
                            display: flex;
                            flex-direction: column;
                        }
                        /* Hide formatting marks in PDF */
                        .prodoc-page-break { display: none; }
                    </style>
                    <div style="display: flex; flex-direction: column; flex: 1; padding: ${effectiveMt}px ${mr}px ${mb}px ${effectiveMl}px;">
                        ${page.html}
                    </div>
                </div>
            `;

            // Convert HTML string to Satori VDOM
            // @ts-ignore
            const vdom = html(contentHtml);

            // Generate SVG
            const svgString = await satori(vdom, {
                width: widthPx,
                height: heightPx,
                fonts: fonts as any,
            });

            // Add page to PDF
            doc.addPage([widthIn, heightIn], isLandscape ? 'l' : 'p');

            // Render SVG to PDF
            const parser = new DOMParser();
            const svgElement = parser.parseFromString(svgString, "image/svg+xml").documentElement;

            await svg2pdf(svgElement as any, doc, {
                x: 0,
                y: 0,
                width: widthIn,
                height: heightIn,
            });
        }

        if (onProgress) onProgress("Saving PDF...");
        doc.save(`${documentTitle || 'document'}.pdf`);

    } catch (error) {
        console.error("Vector PDF Generation Failed:", error);
        throw error;
    }
};
