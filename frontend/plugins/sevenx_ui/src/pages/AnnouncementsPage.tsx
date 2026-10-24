import { IconPlus, IconSpeakerphone } from '@tabler/icons-react';
import { Button } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { AnnouncementFormSheet } from '~/modules/announcements/components/AnnouncementFormSheet';
import { AnnouncementsList } from '~/modules/announcements/components/AnnouncementsList';
import { SevenxPageHeader } from '~/modules/shared/components';

export const AnnouncementsPage = () => {
  const { t } = useTranslation('sevenx');
  const [open, setOpen] = useState(false);

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader
        icon={IconSpeakerphone}
        iconName="IconSpeakerphone"
        title={t('announcements')}
        path="/sevenx/announcements"
      >
        <Button onClick={() => setOpen(true)}>
          <IconPlus />
          {t('add-announcement')}
        </Button>
      </SevenxPageHeader>
      <div className="flex-1 overflow-y-auto flex flex-col">
        <AnnouncementsList onAdd={() => setOpen(true)} />
      </div>
      <AnnouncementFormSheet open={open} onOpenChange={setOpen} />
    </div>
  );
};
