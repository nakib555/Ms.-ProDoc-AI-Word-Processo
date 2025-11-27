
import React from 'react';
import { Activity } from 'lucide-react';
import { SymbolCategoryDropdown } from '../../common/EquationTools';
import { SYMBOL_CATEGORIES } from '../symbolData';

export const OperatorsTool: React.FC = () => (
    <SymbolCategoryDropdown category="Operators" icon={Activity} symbols={SYMBOL_CATEGORIES['Operators']} />
);
