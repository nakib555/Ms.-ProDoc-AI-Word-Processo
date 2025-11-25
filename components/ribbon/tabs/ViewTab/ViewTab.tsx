
import React from 'react';
import { RibbonSeparator } from '../../common/RibbonSeparator';
import { ViewTabProvider } from './ViewTabContext';

// Groups
import { ViewsGroup } from './views/ViewsGroup';
import { ImmersiveGroup } from './immersive/ImmersiveGroup';
import { PageMovementGroup } from './page_movement/PageMovementGroup';
import { ShowGroup } from './show/ShowGroup';
import { ZoomGroup } from './zoom/ZoomGroup';
import { WindowGroup } from './window/WindowGroup';
import { MacrosGroup } from './macros/MacrosGroup';
import { SharePointGroup } from './sharepoint/SharePointGroup';

export const ViewTab: React.FC = () => {
  return (
    <ViewTabProvider>
      <ViewsGroup />
      <RibbonSeparator />
      <ImmersiveGroup />
      <RibbonSeparator />
      <PageMovementGroup />
      <RibbonSeparator />
      <ShowGroup />
      <RibbonSeparator />
      <ZoomGroup />
      <RibbonSeparator />
      <WindowGroup />
      <RibbonSeparator />
      <MacrosGroup />
      <RibbonSeparator />
      <SharePointGroup />
    </ViewTabProvider>
  );
};
