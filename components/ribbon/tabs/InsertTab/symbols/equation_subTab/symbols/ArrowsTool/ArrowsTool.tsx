
import React from 'react';
import { ArrowRight } from 'lucide-react';
import { SymbolCategoryDropdown } from '../../common/EquationTools';
import { SYMBOL_CATEGORIES } from '../symbolData';

export const ArrowsTool: React.FC = () => (
    <SymbolCategoryDropdown category="Arrows" icon={ArrowRight} symbols={SYMBOL_CATEGORIES['Arrows']} />
);
