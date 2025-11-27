
import React from 'react';
import { Triangle } from 'lucide-react';
import { SymbolCategoryDropdown } from '../../common/EquationTools';
import { SYMBOL_CATEGORIES } from '../symbolData';

export const GeometryTool: React.FC = () => (
    <SymbolCategoryDropdown category="Geometry" icon={Triangle} symbols={SYMBOL_CATEGORIES['Geometry']} />
);
