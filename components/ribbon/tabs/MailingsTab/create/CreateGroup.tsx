
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { EnvelopesTool } from './EnvelopesTool';
import { LabelsTool } from './LabelsTool';

export const CreateGroup: React.FC = () => {
  return (
      <RibbonSection title="Create">
         <EnvelopesTool />
         <LabelsTool />
      </RibbonSection>
  );
};
