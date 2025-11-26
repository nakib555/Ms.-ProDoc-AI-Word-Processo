
import React from 'react';
import { Shapes } from 'lucide-react';
import { useEditor } from '../../../../../../contexts/EditorContext';
import { useInsertTab } from '../../InsertTabContext';
import { DropdownButton } from '../../common/InsertTools';
import { MenuPortal } from '../../../../common/MenuPortal';

import { LineShapes } from './lines';
import { RectangleShapes } from './rectangles';
import { BasicShapes } from './basicShapes';
import { BlockArrowShapes } from './blockArrows';
import { EquationShapes } from './equationShapes';
import { FlowchartShapes } from './flowchart';
import { StarsAndBannersShapes } from './starsAndBanners';

interface ShapeDef {
    id: string;
    title: string;
    path: string;
}

// Helper to generate SVG for specific shapes to ensure they are "thin" single lines/strokes
const getShapeHtml = (shape: ShapeDef) => {
    const commonStyle = "display: inline-block; margin: 10px; vertical-align: middle;";
    const stroke = "#1e293b"; // Slate-800
    const strokeWidth = "1";
    
    // For complex shapes that fallback to path, we use stroke-width scaled for the 2048 viewBox
    // 64px render size / 2048 units = 1/32 scale. 1px target / (1/32) = 32 units.
    const complexStrokeWidth = "32"; 

    switch (shape.id) {
        // --- Lines ---
        case 'StraightConnector': // Line
            return `<svg width="100" height="100" viewBox="0 0 100 100" style="${commonStyle}">
                <line x1="10" y1="90" x2="90" y2="10" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" />
            </svg>&nbsp;`;
            
        case 'StraightConnectorArrow': // Arrow
            return `<svg width="100" height="100" viewBox="0 0 100 100" style="${commonStyle}">
                <defs>
                    <marker id="head-${shape.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="${stroke}" />
                    </marker>
                </defs>
                <line x1="10" y1="90" x2="85" y2="15" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" marker-end="url(#head-${shape.id})" />
            </svg>&nbsp;`;

        case 'StraightConnectorTwoArrow': // Double Arrow
             return `<svg width="100" height="100" viewBox="0 0 100 100" style="${commonStyle}">
                <defs>
                    <marker id="head-start-${shape.id}" viewBox="0 0 10 10" refX="1" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 10 0 L 0 5 L 10 10 z" fill="${stroke}" />
                    </marker>
                    <marker id="head-end-${shape.id}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="6" markerHeight="6" orient="auto">
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="${stroke}" />
                    </marker>
                </defs>
                <line x1="15" y1="85" x2="85" y2="15" stroke="${stroke}" stroke-width="${strokeWidth}" stroke-linecap="round" marker-start="url(#head-start-${shape.id})" marker-end="url(#head-end-${shape.id})" />
            </svg>&nbsp;`;

        // --- Basic Geometry (Outlined) ---
        case 'Rectangle':
            return `<div style="${commonStyle} width: 100px; height: 60px; border: 1px solid ${stroke}; background: transparent;"></div>`;
            
        case 'RoundedRectangle':
            return `<div style="${commonStyle} width: 100px; height: 60px; border: 1px solid ${stroke}; background: transparent; border-radius: 12px;"></div>`;
            
        case 'Ellipse': // Oval
            return `<div style="${commonStyle} width: 80px; height: 80px; border: 1px solid ${stroke}; background: transparent; border-radius: 50%;"></div>`;
            
        case 'TextBox':
             return `<div style="${commonStyle} width: 120px; height: 60px; border: 1px solid #94a3b8; background: white; padding: 8px; font-size: 12px; color: #475569;">Text Box</div>`;

        case 'Triangle': // Isosceles
             return `<svg width="100" height="100" viewBox="0 0 100 100" style="${commonStyle} overflow: visible;">
                <polygon points="50,5 95,95 5,95" stroke="${stroke}" fill="transparent" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
             </svg>&nbsp;`;

        case 'RightTriangle': 
             return `<svg width="100" height="100" viewBox="0 0 100 100" style="${commonStyle} overflow: visible;">
                <polygon points="5,5 5,95 95,95" stroke="${stroke}" fill="transparent" stroke-width="${strokeWidth}" stroke-linejoin="round"/>
             </svg>&nbsp;`;

        // --- Fallback for Complex Shapes ---
        default:
            return `<svg width="64" height="64" viewBox="0 0 2048 2048" fill="transparent" stroke="${stroke}" stroke-width="${complexStrokeWidth}" style="display: inline-block; margin: 5px; vertical-align: middle;">
                <path d="${shape.path}" />
            </svg>&nbsp;`;
    }
};

const ShapeItem: React.FC<{ 
    onClick: () => void; 
    path: string; 
    title: string; 
}> = React.memo(({ onClick, path, title }) => (
    <button 
        type="button"
        onClick={onClick}
        onMouseDown={(e) => e.preventDefault()}
        className="w-7 h-7 flex items-center justify-center hover:bg-slate-200 rounded-sm border border-transparent hover:border-blue-300 transition-all text-slate-700 hover:text-blue-700 p-0.5"
        title={title}
    >
        <svg 
            width="100%" 
            height="100%" 
            viewBox="0 0 2048 2048" 
            fill="none" 
            stroke="currentColor"
            strokeWidth="80"
            className="pointer-events-none"
        >
            <path d={path} />
        </svg>
    </button>
));

const ShapeCategory: React.FC<{ title: string; shapes: Array<ShapeDef>; onInsert: (shape: ShapeDef) => void }> = React.memo(({ title, shapes, onInsert }) => (
    <div className="mb-3 px-2">
        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5">{title}</div>
        <div className="grid grid-cols-8 gap-1">
            {shapes.map(shape => (
                <ShapeItem 
                    key={shape.id} 
                    title={shape.title} 
                    path={shape.path} 
                    onClick={() => onInsert(shape)} 
                />
            ))}
        </div>
    </div>
));

const ShapesMenu = React.memo<{ onInsert: (shape: ShapeDef) => void }>(({ onInsert }) => {
    return (
        <div className="p-3 max-h-[60vh] overflow-y-auto scrollbar-thin scrollbar-thumb-slate-200 select-none" onScroll={(e) => e.stopPropagation()}>
            <ShapeCategory title="Lines" shapes={LineShapes} onInsert={onInsert} />
            <ShapeCategory title="Rectangles" shapes={RectangleShapes} onInsert={onInsert} />
            <ShapeCategory title="Basic Shapes" shapes={BasicShapes} onInsert={onInsert} />
            <ShapeCategory title="Block Arrows" shapes={BlockArrowShapes} onInsert={onInsert} />
            <ShapeCategory title="Equation Shapes" shapes={EquationShapes} onInsert={onInsert} />
            <ShapeCategory title="Flowchart" shapes={FlowchartShapes} onInsert={onInsert} />
            <ShapeCategory title="Stars and Banners" shapes={StarsAndBannersShapes} onInsert={onInsert} />
        </div>
    );
});

export const ShapesTool: React.FC = () => {
  const { executeCommand } = useEditor();
  const { activeMenu, menuPos, closeMenu } = useInsertTab();
  const menuId = 'shapes_menu';

  const insertShape = (shape: ShapeDef) => {
      const html = getShapeHtml(shape);
      executeCommand('insertHTML', html);
      closeMenu();
  };

  return (
    <>
        <DropdownButton 
            id={menuId} 
            icon={Shapes} 
            label="Shapes" 
            variant="small"
        />
        <MenuPortal id={menuId} activeMenu={activeMenu} menuPos={menuPos} closeMenu={closeMenu} width={340}>
            <ShapesMenu onInsert={insertShape} />
        </MenuPortal>
    </>
  );
};
