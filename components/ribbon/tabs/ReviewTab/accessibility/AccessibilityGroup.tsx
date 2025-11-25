
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { CheckAccessibilityTool } from './CheckAccessibilityTool';

export const AccessibilityGroup: React.FC = () => {
  return (
    <RibbonSection title="Accessibility">
         <CheckAccessibilityTool />
    </RibbonSection>
  );
};
