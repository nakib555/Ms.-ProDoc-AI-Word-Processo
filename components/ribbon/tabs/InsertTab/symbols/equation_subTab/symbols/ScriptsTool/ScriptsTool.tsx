
import React from 'react';
import { ScrollText } from 'lucide-react';
import { SymbolCategoryDropdown } from '../../common/EquationTools';
import { SYMBOL_CATEGORIES } from '../symbolData';

export const ScriptsTool: React.FC = () => (
    <SymbolCategoryDropdown category="Scripts" icon={ScrollText} symbols={SYMBOL_CATEGORIES['Scripts']} />
);
