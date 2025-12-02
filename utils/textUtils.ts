
export const countWords = (text: string): number => {
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

export const getDocumentStats = (html: string) => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, 'text/html');
  const text = doc.body.innerText || "";
  
  // Basic text stats
  const cleanText = text.replace(/\r\n/g, "\n"); // Normalize newlines
  const words = countWords(text);
  const charsWithSpaces = text.replace(/[\r\n]/g, '').length;
  const charsNoSpaces = text.replace(/\s/g, '').length;
  
  // Paragraphs: Count specific block elements that typically denote paragraphs in rich text
  // We also filter for non-empty ones to be more accurate to visual representation
  const blockTags = ['p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li', 'div', 'blockquote', 'pre'];
  const blocks = doc.querySelectorAll(blockTags.join(','));
  let paragraphs = 0;
  
  if (blocks.length === 0) {
      // If no blocks but text exists, count as 1 paragraph
      if (text.trim().length > 0) paragraphs = 1;
  } else {
      paragraphs = Array.from(blocks).filter(el => el.textContent?.trim().length || 0 > 0).length;
      // Fallback
      if (paragraphs === 0 && text.trim().length > 0) paragraphs = 1;
  }

  // Lines: Rough estimation. 
  // In a real engine, lines depend on width/rendering. Here we count explicit line breaks 
  // and add paragraphs as a baseline since each paragraph is at least one line.
  const lines = Math.max(paragraphs, cleanText.split(/\n/).length);

  return {
    pages: 1, // Placeholder as pagination logic is complex for web
    words,
    charsNoSpaces,
    charsWithSpaces,
    paragraphs,
    lines
  };
};

/**
 * Converts a Point (pt) value to Pixels (px).
 * Standard: 1pt = 1/72 inch. 96px = 1 inch.
 * Formula: px = pt * (96 / 72) = pt * 1.3333
 */
export const ptToPx = (pt: number): number => {
  return (pt * 96) / 72;
};

/**
 * Converts a Pixel (px) value to Points (pt).
 * Formula: pt = px * (72 / 96) = px * 0.75
 */
export const pxToPt = (px: number): number => {
  return (px * 72) / 96;
};
