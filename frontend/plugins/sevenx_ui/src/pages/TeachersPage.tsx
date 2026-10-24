import { IconChalkboard } from '@tabler/icons-react';
import { useTranslation } from 'react-i18next';
import { MembersView } from '~/modules/members/components/MembersView';

export const TeachersPage = () => {
  const { t } = useTranslation('sevenx');

  return (
    <MembersView
      memberRole="teacher"
      icon={IconChalkboard}
      iconName="IconChalkboard"
      title={t('teachers')}
      path="/sevenx/teachers"
      emptyTitle={t('no-teachers')}
    />
  );
};
