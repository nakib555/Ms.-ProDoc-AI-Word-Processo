
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { TableTool } from './TableTool';

export const TablesGroup: React.FC = () => {
  return (
      <RibbonSection title="Tables">
         <TableTool />
      </RibbonSection>
  );
};
