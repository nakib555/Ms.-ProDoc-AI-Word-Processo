
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { CompareTool } from './CompareTool';

export const CompareGroup: React.FC = () => {
  return (
    <RibbonSection title="Compare">
        <CompareTool />
    </RibbonSection>
  );
};
