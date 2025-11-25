
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { RestrictEditingTool } from './RestrictEditingTool';

export const ProtectGroup: React.FC = () => {
  return (
    <RibbonSection title="Protect">
        <RestrictEditingTool />
    </RibbonSection>
  );
};
