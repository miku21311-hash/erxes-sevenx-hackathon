
  import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
  import { IconSandbox } from '@tabler/icons-react';

export const SevenxNavigation = () => {
  return (
    <Sidebar.Group>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            name="classes"
            icon={IconSandbox}
            pathPrefix="sevenx"
            path="classes"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
