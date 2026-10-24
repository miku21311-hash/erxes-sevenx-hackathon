
import { IconSandbox } from '@tabler/icons-react';
import { IUIConfig } from 'erxes-ui';

export const CONFIG: IUIConfig = {
  name: 'sevenx',
  path: 'sevenx',
  icon: IconSandbox,
  navigationGroup: {
    name: 'sevenx',
    defaultPath: 'sevenx/classes',
    icon: IconSandbox,
  },

  modules: [
    {
      name: 'classes',
      icon: IconSandbox,
      path: 'sevenx/classes',
    },
  ],
};
