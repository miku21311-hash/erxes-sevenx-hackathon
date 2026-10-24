import {
  IconBook2,
  IconCalendarWeek,
  IconChalkboard,
  IconLayoutDashboard,
  IconMapPin,
  IconSpeakerphone,
  IconUsers,
} from '@tabler/icons-react';
import { NavigationMenuLinkItem, Sidebar } from 'erxes-ui';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

export const SevenxNavigation = () => {
  const { t } = useTranslation('sevenx');
  const { pathname } = useLocation();

  return (
    <Sidebar.Group className="px-2 py-1">
      <Sidebar.GroupContent>
        <Sidebar.Menu>
          <NavigationMenuLinkItem
            name={t('dashboard')}
            icon={IconLayoutDashboard}
            pathPrefix="sevenx"
            path=""
            isActive={pathname === '/sevenx' || pathname === '/sevenx/'}
          />
          <NavigationMenuLinkItem
            name={t('classes')}
            icon={IconBook2}
            pathPrefix="sevenx"
            path="classes"
          />
          <NavigationMenuLinkItem
            name={t('schedule')}
            icon={IconCalendarWeek}
            pathPrefix="sevenx"
            path="schedule"
          />
          <NavigationMenuLinkItem
            name={t('teachers')}
            icon={IconChalkboard}
            pathPrefix="sevenx"
            path="teachers"
          />
          <NavigationMenuLinkItem
            name={t('students')}
            icon={IconUsers}
            pathPrefix="sevenx"
            path="students"
          />
          <NavigationMenuLinkItem
            name={t('locations')}
            icon={IconMapPin}
            pathPrefix="sevenx"
            path="locations"
          />
          <NavigationMenuLinkItem
            name={t('announcements')}
            icon={IconSpeakerphone}
            pathPrefix="sevenx"
            path="announcements"
          />
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>
  );
};
