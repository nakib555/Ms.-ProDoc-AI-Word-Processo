
import React from 'react';
import { Ban } from 'lucide-react';
import { SymbolCategoryDropdown } from '../../common/EquationTools';
import { SYMBOL_CATEGORIES } from '../symbolData';

export const NegatedRelationsTool: React.FC = () => (
    <SymbolCategoryDropdown category="Negated Relations" icon={Ban} symbols={SYMBOL_CATEGORIES['Negated Relations']} />
);
