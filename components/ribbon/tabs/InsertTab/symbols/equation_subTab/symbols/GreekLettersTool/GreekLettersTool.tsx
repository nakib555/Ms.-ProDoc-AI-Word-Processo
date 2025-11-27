
import React from 'react';
import { Omega } from 'lucide-react';
import { SymbolCategoryDropdown } from '../../common/EquationTools';
import { SYMBOL_CATEGORIES } from '../symbolData';

export const GreekLettersTool: React.FC = () => (
    <SymbolCategoryDropdown category="Greek Letters" icon={Omega} symbols={SYMBOL_CATEGORIES['Greek Letters']} />
);
