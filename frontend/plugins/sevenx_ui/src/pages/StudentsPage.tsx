import { IconUsers } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { MembersView } from '~/modules/members/components/MembersView';

export const StudentsPage = () => {
  const { t } = useTranslation('sevenx');

  return (
    <MembersView
      memberRole="student"
      icon={IconUsers}
      iconName="IconUsers"
      title={t('students')}
      path="/sevenx/students"
      emptyTitle={t('no-students')}
    />
  );
};
