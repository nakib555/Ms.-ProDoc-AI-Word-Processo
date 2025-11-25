
import React from 'react';
import { RibbonSection } from '../../../common/RibbonSection';
import { GetAddinsTool } from './GetAddinsTool';
import { MyAddinsTool } from './MyAddinsTool';

export const AddinsGroup: React.FC = () => {
  return (
      <RibbonSection title="Add-ins">
          <div className="flex flex-col justify-center h-full gap-0.5 px-0.5">
              <GetAddinsTool />
          </div>
          <div className="flex flex-col justify-center h-full gap-0.5 px-0.5">
              <MyAddinsTool />
          </div>
      </RibbonSection>
  );
};
