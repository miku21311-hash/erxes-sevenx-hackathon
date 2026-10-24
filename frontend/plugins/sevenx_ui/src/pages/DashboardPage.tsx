import { IconLayoutDashboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { DashboardView } from '~/modules/dashboard/components/DashboardView';
import { SevenxPageHeader } from '~/modules/shared/components';

export const DashboardPage = () => {
  const { t } = useTranslation('sevenx');

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader icon={IconLayoutDashboard} iconName="IconLayoutDashboard" title={t('dashboard')} path="/sevenx" />
      <div className="flex-1 overflow-hidden">
        <DashboardView />
      </div>
    </div>
  );
};
