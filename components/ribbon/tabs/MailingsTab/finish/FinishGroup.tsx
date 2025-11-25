
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { FinishMergeTool } from './FinishMergeTool';

export const FinishGroup: React.FC = () => {
  return (
      <RibbonSection title="Finish">
         <FinishMergeTool />
      </RibbonSection>
  );
};
