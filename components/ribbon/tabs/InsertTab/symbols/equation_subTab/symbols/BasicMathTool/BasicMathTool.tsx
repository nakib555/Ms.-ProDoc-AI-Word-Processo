
import React from 'react';
import { Calculator } from 'lucide-react';
import { SymbolCategoryDropdown } from '../../common/EquationTools';
import { SYMBOL_CATEGORIES } from '../symbolData';

export const BasicMathTool: React.FC = () => (
    <SymbolCategoryDropdown category="Basic Math" icon={Calculator} symbols={SYMBOL_CATEGORIES['Basic Math']} />
);
