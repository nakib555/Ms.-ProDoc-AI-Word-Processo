
import React from 'react';
import { Type } from 'lucide-react';
import { SymbolCategoryDropdown } from '../../common/EquationTools';
import { SYMBOL_CATEGORIES } from '../symbolData';

export const LetterLikeSymbolsTool: React.FC = () => (
    <SymbolCategoryDropdown category="Letter-Like Symbols" icon={Type} symbols={SYMBOL_CATEGORIES['Letter-Like Symbols']} />
);
