
import React, { useEffect, useRef } from 'react';
import { useEditor } from '../../../../../contexts/EditorContext';

export const ReadLayoutView: React.FC = () => {
  const { content, readConfig } = useEditor();
  const containerRef = useRef<HTMLDivElement>(null);

  // Inject content safely
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.innerHTML = content;
    }
  }, [content]);

  const getThemeStyles = () => {
    switch (readConfig.theme) {
      case 'sepia':
        return { bg: '#fdf6e3', text: '#433422', selection: '#e6dcb8', link: '#b58900', border: '#d3c0a3' };
      case 'dark':
        return { bg: '#1a1a1a', text: '#e5e5e5', selection: '#333333', link: '#60a5fa', border: '#404040' };
      case 'light':
      default:
        return { bg: '#ffffff', text: '#1e293b', selection: '#e2e8f0', link: '#2563eb', border: '#e2e8f0' };
    }
  };

  const theme = getThemeStyles();

  return (
    <div 
        className="fixed inset-0 z-40 overflow-y-auto transition-colors duration-500 ease-out animate-in fade-in scroll-smooth"
        style={{ backgroundColor: theme.bg }}
    >
        <div 
            className="mx-auto min-h-screen py-20 px-5 md:px-12 md:py-24 transition-all duration-500 ease-in-out"
            style={{
                maxWidth: readConfig.columns === 2 ? '1200px' : '800px',
            }}
        >
            <style>{`
                /* Read Mode Reset Engine & Typography */
                .read-mode-content {
                    font-family: 'Georgia', 'Merriweather', serif;
                    font-size: ${1.05 * readConfig.textScale}rem;
                    line-height: 1.8;
                    color: ${theme.text};
                    
                    /* Mobile First: Single Column */
                    column-count: 1;
                    column-gap: 4rem;
                    text-align: left;
                    
                    /* Spacing */
                    padding-bottom: 10vh;
                }
                
                /* Desktop: Adaptive Columns */
                @media (min-width: 768px) {
                    .read-mode-content {
                        font-size: ${1.15 * readConfig.textScale}rem;
                        column-count: ${readConfig.columns};
                        text-align: justify;
                    }
                }
                
                /* Selection styling */
                .read-mode-content ::selection {
                    background-color: ${theme.selection};
                    color: ${theme.text};
                }

                /* Content Reset: Aggressively override inline editor styles for responsiveness and theme consistency */
                .read-mode-content * {
                    max-width: 100% !important;
                    box-sizing: border-box !important;
                    height: auto !important;
                    
                    /* Theme Enforcements: Override inline colors */
                    color: inherit !important; 
                    background-color: transparent !important;
                    border-color: ${theme.border} !important;
                    font-family: inherit !important;
                }

                /* Restore semantic elements specificity lost by wildcard reset */
                .read-mode-content strong, .read-mode-content b { font-weight: 700 !important; }
                .read-mode-content em, .read-mode-content i { font-style: italic !important; }
                .read-mode-content u { text-decoration: underline !important; }
                .read-mode-content s, .read-mode-content strike { text-decoration: line-through !important; }
                .read-mode-content sup { vertical-align: super !important; font-size: smaller !important; }
                .read-mode-content sub { vertical-align: sub !important; font-size: smaller !important; }
                
                /* Images: Reflow and style */
                .read-mode-content img {
                    display: block;
                    margin: 1.5rem auto;
                    border-radius: 8px;
                    box-shadow: 0 4px 20px rgba(0,0,0,0.08);
                    opacity: ${readConfig.theme === 'dark' ? '0.85' : '1'};
                    transition: opacity 0.3s ease;
                }
                .read-mode-content img:hover {
                    opacity: 1;
                }

                /* Tables: Card-like overflow scrolling */
                .read-mode-content table {
                    width: 100% !important;
                    display: block;
                    overflow-x: auto;
                    border-collapse: collapse;
                    margin: 2rem 0;
                    border: 1px solid ${theme.border} !important;
                    white-space: nowrap;
                    border-radius: 6px;
                }
                .read-mode-content td, .read-mode-content th {
                    padding: 0.75rem 1rem;
                    border: 1px solid ${theme.border} !important;
                }
                .read-mode-content th {
                    background-color: ${readConfig.theme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.03)'} !important;
                    font-weight: 600;
                }

                /* Typography: Headings */
                .read-mode-content h1, 
                .read-mode-content h2, 
                .read-mode-content h3,
                .read-mode-content h4 {
                    font-family: 'Inter', sans-serif !important;
                    color: ${theme.text} !important;
                    opacity: 0.95;
                    break-after: avoid;
                    line-height: 1.3 !important;
                    letter-spacing: -0.02em;
                    margin-top: 1.5em;
                    margin-bottom: 0.8em;
                }
                .read-mode-content h1 { 
                    font-size: 2.2em !important; 
                    border-bottom: 1px solid ${theme.border} !important; 
                    padding-bottom: 0.4em; 
                }
                .read-mode-content h2 { font-size: 1.75em !important; }
                .read-mode-content h3 { margin-top: 1.2em; font-size: 1.4em !important; }

                /* Links */
                .read-mode-content a {
                    color: ${theme.link} !important;
                    text-decoration: underline !important;
                    text-underline-offset: 3px;
                    text-decoration-thickness: 1px;
                    transition: color 0.2s;
                }
                .read-mode-content a:hover {
                    text-decoration-thickness: 2px;
                }

                /* Lists */
                .read-mode-content ul, .read-mode-content ol {
                    padding-left: 1.5em;
                    margin: 1em 0;
                }
                .read-mode-content li { 
                    margin-bottom: 0.5em; 
                    padding-left: 0.5em;
                }

                /* Column Rule for 2 cols (Desktop only) */
                ${readConfig.columns === 2 ? `
                    @media (min-width: 768px) {
                        .read-mode-content {
                            column-rule: 1px solid ${theme.border};
                        }
                    }
                ` : ''}
                
                /* Paragraph spacing */
                .read-mode-content p {
                    margin-bottom: 1.2em;
                }
            `}</style>

            <div ref={containerRef} className="read-mode-content" />
            
            {/* End of Document Marker */}
            <div className="flex justify-center mt-20 mb-10 opacity-30 gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
                <div className="w-1.5 h-1.5 rounded-full bg-current"></div>
            </div>
        </div>
    </div>
  );
};
