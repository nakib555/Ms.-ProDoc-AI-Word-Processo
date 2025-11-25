
import React from 'react';
import { Shapes } from 'lucide-react';
import { useEditor } from '../../../../../contexts/EditorContext';
import { useInsertTab } from '../InsertTabContext';
import { DropdownButton } from '../common/InsertTools';
import { MenuPortal } from '../../../common/MenuPortal';

// --- Icons Definitions (Office 2048x2048 Paths) ---
const ICONS: Record<string, string> = {
    line: "M 1873 1946 l -1771 -1771 l 73 -73 l 1771 1771 z",
    arrow: "M 1946 1536 v 410 h -410 v -103 h 235 l -1669 -1668 l 73 -73 l 1668 1669 v -235 z",
    double_arrow: "M 1946 1536 v 410 h -410 v -103 h 235 l -1566 -1566 v 235 h -103 v -410 h 410 v 103 h -235 l 1566 1566 v -235 z",
    elbow: "M 1946 1741 h -1024 v -1331 h -820 v -103 h 922 v 1331 h 922 z",
    elbow_arrow: "M 1946 1690 l -257 256 l -72 -73 l 132 -132 h -827 v -1331 h -820 v -103 h 922 v 1331 h 725 l -132 -132 l 72 -72 z",
    elbow_double: "M 1946 1690 l -256 256 l -73 -73 l 132 -132 h -827 v -1331 h -623 l 132 132 l -73 72 l -256 -256 l 256 -256 l 73 73 l -132 132 h 725 v 1331 h 725 l -132 -132 l 73 -72 z",
    curve: "M 1229 614 q 0 -44 -19 -77 q -20 -32 -53 -55 q -33 -23 -75 -37 q -43 -14 -88 -22 q -46 -8 -91 -11 q -46 -2 -84 -2 h -307 v -103 h 307 q 51 0 109 4 q 58 5 115 17 q 57 13 109 35 q 52 22 92 56 q 40 34 64 82 q 23 48 23 113 q 0 87 -26 152 q -27 66 -70 115 q -43 50 -98 87 q -55 37 -113 69 q -58 32 -113 61 q -55 29 -98 62 q -43 34 -69 75 q -27 41 -27 96 q 0 111 32 172 q 31 62 86 92 q 55 30 130 36 q 75 7 161 7 h 410 v 103 h -410 q -51 0 -109 -2 q -58 -2 -114 -14 q -57 -11 -109 -36 q -53 -24 -92 -70 q -40 -45 -64 -116 q -24 -70 -24 -172 q 0 -72 28 -126 q 28 -54 73 -96 q 44 -41 100 -74 q 55 -32 109 -61 q 71 -38 128 -73 q 56 -35 96 -76 q 39 -40 60 -91 q 21 -51 21 -120 z",
    
    rect: "M 1946 307 v 1434 h -1844 v -1434 m 1741 103 h -1638 v 1228 h 1638 z",
    round_rect: "M 1592 307 q 73 0 138 28 q 64 28 112 76 q 48 48 76 112 q 28 65 28 138 v 726 q 0 73 -28 137 q -28 65 -76 113 q -48 48 -112 76 q -65 28 -138 28 h -1136 q -73 0 -137 -28 q -65 -28 -113 -76 q -48 -48 -76 -113 q -28 -64 -28 -137 v -726 q 0 -73 28 -138 q 28 -64 76 -112 q 48 -48 113 -76 q 64 -28 137 -28 m 1387 354 q 0 -52 -20 -98 q -20 -45 -54 -79 q -34 -34 -79 -54 q -46 -20 -98 -20 h -1136 q -52 0 -97 20 q -46 20 -80 54 q -34 34 -54 79 q -20 46 -20 98 v 726 q 0 52 20 97 q 20 46 54 80 q 34 34 80 54 q 45 20 97 20 h 1136 q 52 0 98 -20 q 45 -20 79 -54 q 34 -34 54 -80 q 20 -45 20 -97 z",
    snip_1: "M 1946 819 v 922 h -1844 v -1434 h 1332 m 409 555 l -452 -452 h -1186 v 1228 h 1638 z",
    snip_2: "M 1946 819 v 922 h -1844 v -922 l 512 -512 h 820 m 409 555 l -452 -452 h -734 l -452 452 v 776 h 1638 z",
    snip_diag: "M 1946 819 v 922 h -1332 l -512 -512 v -922 h 1332 m 409 555 l -452 -452 h -1186 v 776 l 452 452 h 1186 z",
    round_1: "M 1592 307 q 73 0 138 28 q 64 28 112 76 q 48 48 76 112 q 28 65 28 138 v 1080 h -1844 v -1434 m 103 1331 h 1638 v -977 q 0 -52 -20 -98 q -20 -46 -54 -80 q -34 -34 -79 -54 q -46 -19 -98 -19 h -1387 z",
    round_2: "M 1592 307 q 73 0 138 28 q 64 28 112 76 q 48 48 76 112 q 28 65 28 138 v 1080 h -1844 v -1080 q 0 -73 28 -138 q 28 -64 76 -112 q 48 -48 113 -76 q 64 -28 137 -28 m 1387 354 q 0 -52 -20 -98 q -20 -46 -54 -80 q -34 -34 -79 -54 q -46 -19 -98 -19 h -1136 q -52 0 -97 19 q -46 20 -80 54 q -34 34 -54 80 q -20 46 -20 98 v 977 h 1638 z",
    
    text_box: "M 1946 512 v 1024 h 102 v 307 h -307 v -102 h -1434 v 102 h -307 v -307 h 102 v -1024 h -102 v -307 h 307 v 102 h 1434 v -102 h 307 v 307 m -205 -102 h 103 v -103 h -103 m -1741 103 h 103 v -103 h -103 m 103 1331 h -103 v 103 h 103 m 1741 -103 h -103 v 103 h 103 m -103 -1229 h -102 v -102 h -1434 v 102 h -102 v 1024 h 102 v 102 h 1434 v -102 h 102 m -405 -102 h -121 l -113 -308 h -361 l -112 308 h -121 l 356 -922 h 113 m 88 517 l -130 -343 q -6 -13 -15 -62 q -5 20 -9 35 q -4 16 -8 27 l -125 343 z",
    circle: "M 1024 307 q 127 0 245 25 q 118 26 221 73 q 102 47 186 112 q 84 65 144 145 q 60 80 93 171 q 33 92 33 191 q 0 99 -33 190 q -33 92 -93 172 q -60 80 -144 145 q -84 65 -186 112 q -103 47 -221 72 q -118 26 -245 26 q -127 0 -245 -26 q -118 -25 -220 -72 q -103 -47 -187 -112 q -84 -65 -144 -145 q -60 -80 -93 -172 q -33 -91 -33 -190 q 0 -99 33 -191 q 33 -91 93 -171 q 60 -80 144 -145 q 84 -65 187 -112 q 102 -47 220 -73 q 118 -25 245 -25 m 0 1331 q 113 0 218 -22 q 104 -22 195 -62 q 91 -40 166 -96 q 75 -56 128 -124 q 53 -68 83 -147 q 29 -78 29 -163 q 0 -85 -29 -164 q -30 -78 -83 -146 q -53 -68 -128 -124 q -75 -56 -166 -96 q -91 -40 -195 -62 q -105 -22 -218 -22 q -113 0 -217 22 q -105 22 -196 62 q -91 40 -166 96 q -75 56 -128 124 q -53 68 -82 146 q -30 79 -30 164 q 0 85 30 163 q 29 79 82 147 q 53 68 128 124 q 75 56 166 96 q 91 40 196 62 q 104 22 217 22 z",
    triangle: "M 1946 1946 h -1844 l 922 -1844 m -756 1741 h 1512 l -756 -1512 z",
    right_triangle: "M 1946 1946 h -1844 v -1844 m 103 1741 h 1493 l -1493 -1493 z",
    parallelogram: "M 1946 205 l -512 1638 h -1332 l 512 -1638 m 1192 102 h -1116 l -448 1434 h 1116 z",
    trapezoid: "M 102 307 h 1844 l -543 1434 h -758 m 1155 -1331 h -1552 l 469 1228 h 614 z",
    diamond: "M 1946 1024 l -922 922 l -922 -922 l 922 -922 m 0 1699 l 777 -777 l -777 -777 l -777 777 z",
    pentagon: "M 1946 886 l -357 1060 h -1121 l -366 -1060 l 922 -784 m 801 817 l -801 -682 l -801 682 l 317 924 h 977 z",
    hexagon: "M 1946 1024 l -461 819 h -922 l -461 -819 l 461 -819 h 922 m 343 819 l -403 -717 h -802 l -403 717 l 403 717 h 802 z",
    heptagon: "M 1946 649 v 750 l -547 547 h -750 l -547 -550 v -747 l 547 -547 h 750 m 444 589 l -486 -486 h -666 l -486 486 v 663 l 486 489 h 666 l 486 -486 m -614 -716 q -44 87 -77 156 q -33 69 -58 127 q -25 59 -43 108 q -18 50 -31 98 q -13 48 -22 96 q -10 49 -18 105 h -62 q 39 -274 239 -659 h -338 v -58 h 410 z",
    octagon: "M 819 1126 q 0 -60 34 -109 q 33 -48 89 -71 q -44 -24 -70 -64 q -27 -40 -27 -90 q 0 -39 14 -72 q 14 -32 39 -56 q 24 -24 57 -37 q 32 -13 69 -13 q 37 0 70 13 q 33 14 58 38 q 24 24 38 56 q 14 33 14 71 q 0 47 -25 88 q -26 41 -72 66 q 27 11 50 29 q 22 19 38 43 q 16 24 25 51 q 9 28 9 57 q 0 47 -14 84 q -15 38 -42 65 q -27 27 -65 41 q -38 15 -84 15 q -46 0 -84 -15 q -38 -15 -65 -42 q -27 -27 -41 -65 q -15 -37 -15 -83 m 63 0 q 0 67 39 109 q 39 42 103 42 q 31 0 57 -11 q 26 -11 45 -32 q 19 -20 30 -48 q 10 -27 10 -60 q 0 -31 -10 -59 q -11 -27 -30 -48 q -19 -20 -45 -32 q -26 -12 -57 -12 q -31 0 -57 11 q -26 12 -45 32 q -19 21 -29 48 q -11 28 -11 60 m 24 -331 q 0 28 10 51 q 9 24 26 40 q 16 17 37 26 q 21 10 45 10 q 25 0 47 -11 q 22 -10 38 -27 q 16 -17 25 -40 q 9 -23 9 -49 q 0 -25 -9 -49 q -9 -23 -24 -40 q -16 -17 -38 -28 q -22 -10 -48 -10 q -26 0 -47 9 q -22 10 -37 27 q -16 18 -25 41 q -9 23 -9 50 m 1040 -146 v 750 l -547 547 h -750 l -547 -550 v -747 l 547 -547 h 750 m 444 589 l -486 -486 h -666 l -486 486 v 663 l 486 489 h 666 l 486 -486 z",
    cylinder: "M 1024 102 q 148 0 279 20 q 131 20 228 55 q 97 35 154 81 q 56 47 56 100 v 1383 q -25 44 -91 81 q -67 38 -162 65 q -96 28 -215 43 q -119 16 -249 16 q -130 0 -249 -16 q -119 -15 -214 -43 q -96 -27 -162 -65 q -67 -37 -92 -81 v -1383 q 0 -53 57 -100 q 56 -46 153 -81 q 97 -35 228 -55 q 130 -20 279 -20 m 615 405 q -42 25 -95 42 q -53 17 -111 29 q -58 12 -118 19 q -60 7 -114 11 q -54 4 -100 5 q -46 1 -77 1 q -31 0 -76 -1 q -46 -1 -100 -5 q -55 -4 -114 -11 q -60 -7 -118 -19 q -58 -12 -111 -29 q -53 -17 -95 -42 v 1199 q 22 20 73 44 q 50 24 128 44 q 77 21 181 35 q 104 14 232 14 q 128 0 232 -14 q 104 -14 182 -35 q 77 -20 128 -44 q 50 -24 72 -44 m -614 -1501 q -127 0 -239 12 q -112 12 -195 33 q -83 21 -131 49 q -49 28 -49 59 q 0 32 49 60 q 48 28 131 49 q 83 21 195 33 q 112 12 239 12 q 127 0 239 -12 q 112 -12 195 -33 q 83 -21 132 -49 q 48 -28 48 -60 q 0 -31 -48 -59 q -49 -28 -132 -49 q -83 -21 -195 -33 q -112 -12 -239 -12 z",
    cube: "M 1946 102 v 1280 l -564 564 h -1280 v -1280 l 564 -564 m 665 615 h -1126 v 1126 h 1126 m 51 -1229 l 410 -409 h -1075 l -410 409 m 1536 -307 l -409 410 v 1024 l 409 -410 z"
};

// --- Shapes Menu Components & Logic ---

const ShapeCategory: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
    <div className="mb-3 px-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</div>
        <div className="grid grid-cols-8 gap-1">
            {children}
        </div>
    </div>
);

const ShapeItem: React.FC<{ 
    onClick: () => void; 
    path: string | React.ReactNode; 
    title: string; 
    className?: string;
    officeIcon?: boolean; // Flag to indicate if we should use office viewBox
}> = ({ onClick, path, title, className, officeIcon }) => (
    <button 
        type="button"
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        className={`w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-sm border border-transparent hover:border-blue-300 transition-all text-slate-700 hover:text-blue-700 ${className || ''}`}
        title={title}
    >
        <svg 
            width="18" 
            height="18" 
            viewBox={officeIcon ? "0 0 2048 2048" : "0 0 24 24"} 
            fill={officeIcon ? "currentColor" : "none"} 
            stroke={officeIcon ? "none" : "currentColor"} 
            strokeWidth={officeIcon ? "0" : "1.5"} 
            strokeLinecap="round" 
            strokeLinejoin="round"
        >
            {typeof path === 'string' ? <path d={path} /> : path}
        </svg>
    </button>
);

const style = "display: inline-block; margin: 10px; vertical-align: middle;";
const createSvgShape = (viewBox: string, content: string, width = 100, height = 100) => 
    `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="none" stroke="#000" stroke-width="2" style="${style}">${content}</svg>`;

const insertShapeHTML = (shapeType: string): string => {
      let shapeHtml = '';
      // Insert logic uses simpler SVG strings for editor content to remain lightweight and editable
      switch(shapeType) {
          // Lines
          case 'line':
              shapeHtml = createSvgShape("0 0 100 100", '<line x1="0" y1="100" x2="100" y2="0" stroke="black" stroke-width="2" />');
              break;
          case 'arrow':
              shapeHtml = createSvgShape("0 0 100 50", '<defs><marker id="arrow" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="black" /></marker></defs><line x1="0" y1="25" x2="90" y2="25" stroke="black" stroke-width="2" marker-end="url(#arrow)" />', 100, 50);
              break;
          case 'double_arrow':
              shapeHtml = createSvgShape("0 0 100 50", '<defs><marker id="arrow2" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="black" /></marker><marker id="arrow2start" markerWidth="10" markerHeight="10" refX="1" refY="3" orient="auto"><path d="M9,0 L9,6 L0,3 z" fill="black" /></marker></defs><line x1="10" y1="25" x2="90" y2="25" stroke="black" stroke-width="2" marker-end="url(#arrow2)" marker-start="url(#arrow2start)" />', 100, 50);
              break;
          case 'elbow':
              shapeHtml = createSvgShape("0 0 100 100", '<path d="M10,90 L10,10 L90,10" fill="none" stroke="black" stroke-width="2" />');
              break;
          case 'elbow_arrow':
              shapeHtml = createSvgShape("0 0 100 100", '<defs><marker id="arrow3" markerWidth="10" markerHeight="10" refX="9" refY="3" orient="auto"><path d="M0,0 L0,6 L9,3 z" fill="black" /></marker></defs><path d="M10,90 L10,10 L85,10" fill="none" stroke="black" stroke-width="2" marker-end="url(#arrow3)" />');
              break;
          case 'curve':
              shapeHtml = createSvgShape("0 0 100 100", '<path d="M10,90 Q10,10 90,10" fill="none" stroke="black" stroke-width="2" />');
              break;

          // Rectangles
          case 'rect':
              shapeHtml = `<div style="${style} width: 100px; height: 60px; background: transparent; border: 2px solid #000;"></div>`;
              break;
          case 'round_rect':
               shapeHtml = `<div style="${style} width: 100px; height: 60px; background: transparent; border: 2px solid #000; border-radius: 10px;"></div>`;
               break;
          case 'snip_1':
               shapeHtml = createSvgShape("0 0 100 60", '<polygon points="0,0 80,0 100,20 100,60 0,60" fill="none" stroke="black" stroke-width="2"/>', 100, 60);
               break;
          case 'snip_2':
               shapeHtml = createSvgShape("0 0 100 60", '<polygon points="0,0 80,0 100,20 100,60 20,60 0,40" fill="none" stroke="black" stroke-width="2"/>', 100, 60);
               break;
          case 'snip_diag':
               shapeHtml = createSvgShape("0 0 100 60", '<polygon points="20,0 80,0 100,20 100,60 80,60 20,60 0,40 0,20" fill="none" stroke="black" stroke-width="2"/>', 100, 60);
               break;
          case 'round_1':
               shapeHtml = `<div style="${style} width: 100px; height: 60px; background: transparent; border: 2px solid #000; border-top-right-radius: 20px;"></div>`;
               break;
          case 'round_2':
               shapeHtml = `<div style="${style} width: 100px; height: 60px; background: transparent; border: 2px solid #000; border-top-right-radius: 20px; border-bottom-left-radius: 20px;"></div>`;
               break;
          case 'round_diag':
               shapeHtml = `<div style="${style} width: 100px; height: 60px; background: transparent; border: 2px solid #000; border-top-right-radius: 20px; border-bottom-left-radius: 20px;"></div>`;
               break;

          // Basic Shapes
          case 'text_box':
              shapeHtml = `<div style="display:inline-block; border:1px solid #000; padding:10px; margin:10px; min-width:100px; min-height:50px; background:white;">Text Box</div>`;
              break;
          case 'circle': 
              shapeHtml = `<div style="${style} width: 80px; height: 80px; background: transparent; border-radius: 50%; border: 2px solid #000;"></div>`;
              break;
          case 'triangle':
              shapeHtml = createSvgShape("0 0 100 100", '<polygon points="50,5 95,95 5,95" stroke="black" fill="transparent" stroke-width="2"/>');
              break;
          case 'right_triangle':
               shapeHtml = createSvgShape("0 0 100 100", '<polygon points="5,5 5,95 95,95" stroke="black" fill="transparent" stroke-width="2"/>');
               break;
          case 'parallelogram':
               shapeHtml = createSvgShape("0 0 100 60", '<polygon points="20,5 100,5 80,55 0,55" stroke="black" fill="transparent" stroke-width="2"/>', 100, 60);
               break;
          case 'trapezoid':
               shapeHtml = createSvgShape("0 0 100 60", '<polygon points="20,5 80,5 100,55 0,55" stroke="black" fill="transparent" stroke-width="2"/>', 100, 60);
               break;
          case 'diamond':
               shapeHtml = createSvgShape("0 0 100 100", '<polygon points="50,5 95,50 50,95 5,50" stroke="black" fill="transparent" stroke-width="2"/>');
               break;
          case 'pentagon':
               shapeHtml = createSvgShape("0 0 100 100", '<polygon points="50,5 95,40 80,95 20,95 5,40" stroke="black" fill="transparent" stroke-width="2"/>');
               break;
          case 'hexagon':
               shapeHtml = createSvgShape("0 0 100 100", '<polygon points="25,5 75,5 95,50 75,95 25,95 5,50" stroke="black" fill="transparent" stroke-width="2"/>');
               break;
          case 'heptagon':
               shapeHtml = createSvgShape("0 0 100 100", '<polygon points="50,5 85,25 95,65 70,95 30,95 5,65 15,25" stroke="black" fill="transparent" stroke-width="2"/>');
               break;
          case 'octagon':
               shapeHtml = createSvgShape("0 0 100 100", '<polygon points="30,5 70,5 95,30 95,70 70,95 30,95 5,70 5,30" stroke="black" fill="transparent" stroke-width="2"/>');
               break;
          case 'cylinder':
               shapeHtml = createSvgShape("0 0 100 100", '<path d="M10,20 A40,15 0 0,0 90,20 A40,15 0 0,0 10,20 M10,20 L10,80 A40,15 0 0,0 90,80 L90,20" fill="none" stroke="black" stroke-width="2"/>');
               break;
          case 'cube':
               shapeHtml = createSvgShape("0 0 100 100", '<path d="M5,25 L35,5 L95,5 L95,65 L65,85 L5,85 Z M5,25 L65,25 L65,85 M65,25 L95,5" fill="none" stroke="black" stroke-width="2"/>');
               break;
          
          // Fallback for others not in switch
          default:
              shapeHtml = `<div style="${style} width: 50px; height: 50px; background: #f1f5f9; border: 1px dashed #64748b; display: flex; align-items: center; justify-content: center; font-size: 10px;">Shape</div>`;
      }
      return shapeHtml + '&nbsp;';
}

const ShapesMenu: React.FC<{ onInsert: (shape: string) => void }> = ({ onInsert }) => {
    return (
        <div className="p-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200" onScroll={(e) => e.stopPropagation()}>
            {/* Lines */}
            <ShapeCategory title="Lines">
                <ShapeItem onClick={() => onInsert('line')} title="Line" path={ICONS.line} officeIcon />
                <ShapeItem onClick={() => onInsert('arrow')} title="Arrow" path={ICONS.arrow} officeIcon />
                <ShapeItem onClick={() => onInsert('double_arrow')} title="Double Arrow" path={ICONS.double_arrow} officeIcon />
                <ShapeItem onClick={() => onInsert('elbow')} title="Elbow Connector" path={ICONS.elbow} officeIcon />
                <ShapeItem onClick={() => onInsert('elbow_arrow')} title="Elbow Arrow" path={ICONS.elbow_arrow} officeIcon />
                <ShapeItem onClick={() => onInsert('curve')} title="Curve" path={ICONS.curve} officeIcon />
            </ShapeCategory>

            {/* Rectangles */}
            <ShapeCategory title="Rectangles">
                <ShapeItem onClick={() => onInsert('rect')} title="Rectangle" path={ICONS.rect} officeIcon />
                <ShapeItem onClick={() => onInsert('round_rect')} title="Rounded Rectangle" path={ICONS.round_rect} officeIcon />
                <ShapeItem onClick={() => onInsert('snip_1')} title="Snip Single Corner" path={ICONS.snip_1} officeIcon />
                <ShapeItem onClick={() => onInsert('snip_2')} title="Snip Same Side Corner" path={ICONS.snip_2} officeIcon />
                <ShapeItem onClick={() => onInsert('snip_diag')} title="Snip Diagonal Corner" path={ICONS.snip_diag} officeIcon />
                <ShapeItem onClick={() => onInsert('round_1')} title="Round Single Corner" path={ICONS.round_1} officeIcon />
                <ShapeItem onClick={() => onInsert('round_2')} title="Round Same Side Corner" path={ICONS.round_2} officeIcon />
            </ShapeCategory>

            {/* Basic Shapes */}
            <ShapeCategory title="Basic Shapes">
                <ShapeItem onClick={() => onInsert('text_box')} title="Text Box" path={ICONS.text_box} officeIcon />
                <ShapeItem onClick={() => onInsert('circle')} title="Oval" path={ICONS.circle} officeIcon />
                <ShapeItem onClick={() => onInsert('triangle')} title="Isosceles Triangle" path={ICONS.triangle} officeIcon />
                <ShapeItem onClick={() => onInsert('right_triangle')} title="Right Triangle" path={ICONS.right_triangle} officeIcon />
                <ShapeItem onClick={() => onInsert('parallelogram')} title="Parallelogram" path={ICONS.parallelogram} officeIcon />
                <ShapeItem onClick={() => onInsert('trapezoid')} title="Trapezoid" path={ICONS.trapezoid} officeIcon />
                <ShapeItem onClick={() => onInsert('diamond')} title="Diamond" path={ICONS.diamond} officeIcon />
                <ShapeItem onClick={() => onInsert('pentagon')} title="Pentagon" path={ICONS.pentagon} officeIcon />
                <ShapeItem onClick={() => onInsert('hexagon')} title="Hexagon" path={ICONS.hexagon} officeIcon />
                <ShapeItem onClick={() => onInsert('heptagon')} title="Heptagon" path={ICONS.heptagon} officeIcon />
                <ShapeItem onClick={() => onInsert('octagon')} title="Octagon" path={ICONS.octagon} officeIcon />
                <ShapeItem onClick={() => onInsert('cylinder')} title="Cylinder" path={ICONS.cylinder} officeIcon />
                <ShapeItem onClick={() => onInsert('cube')} title="Cube" path={ICONS.cube} officeIcon />
            </ShapeCategory>
        </div>
    );
};

// --- Main Tool Component ---

export const ShapesTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();

  const insertShape = (shapeType: string) => {
      const html = insertShapeHTML(shapeType);
      if(html) executeCommand('insertHTML', html);
      closeMenu();
  };

  return (
    <>
        <DropdownButton 
            id="shapes_menu" 
            icon={Shapes} 
            label="Shapes" 
            variant="small"
        />
        <MenuPortal id="shapes_menu" activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={340}>
            <ShapesMenu onInsert={insertShape} />
        </MenuPortal>
    </>
  );
};
