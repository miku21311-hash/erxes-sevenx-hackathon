import { IconSchool } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';
import { registerSevenxLocales } from '~/i18n';

registerSevenxLocales();

export const CONFIG: IUIConfig = {
  name: 'sevenx',
  path: 'sevenx',
  icon: IconSchool,
  i18n: true,
  navigationGroup: {
    name: 'sevenx',
    defaultPath: 'sevenx',
    icon: IconSchool,
  },
  modules: [
    {
      name: 'dashboard',
      icon: IconSchool,
      path: 'sevenx',
    },
    {
      name: 'classes',
      path: 'sevenx/classes',
    },
    {
      name: 'schedule',
      path: 'sevenx/schedule',
    },
    {
      name: 'teachers',
      path: 'sevenx/teachers',
    },
    {
      name: 'students',
      path: 'sevenx/students',
    },
    {
      name: 'locations',
      path: 'sevenx/locations',
    },
    {
      name: 'announcements',
      path: 'sevenx/announcements',
    },
  ],
};
