import { IconSpeakerphone, IconTrash } from '@tabler/icons-react';
import { Badge, Button, Card, Skeleton } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  ConfirmRemoveDialog,
  QueryError,
  SevenxEmpty,
} from '~/modules/shared/components';
import { useSevenxToast } from '~/modules/shared/hooks/useSevenxToast';
import { ISevenxAnnouncement } from '~/modules/shared/types';
import { formatDateTime } from '~/modules/shared/utils/schedule';
import { useAnnouncementMutations } from '../hooks/useAnnouncementMutations';
import { useAnnouncements } from '../hooks/useAnnouncements';

interface AnnouncementsListProps {
  classId?: string;
  limit?: number;
  onAdd?: () => void;
  /** Dense rows without body text, for the dashboard. */
  compact?: boolean;
}

export const AnnouncementsList = ({
  classId,
  limit,
  onAdd,
  compact,
}: AnnouncementsListProps) => {
  const { t } = useTranslation('sevenx');
  const toast = useSevenxToast();
  const { announcements, loading, error, refetch } = useAnnouncements({ classId, limit });
  const { removeAnnouncement, loading: removing } = useAnnouncementMutations();
  const [target, setTarget] = useState<ISevenxAnnouncement | null>(null);

  const confirmRemove = async () => {
    if (!target) return;
    try {
      await removeAnnouncement(target._id);
      toast.success(t('announcement-removed'));
      setTarget(null);
    } catch (err) {
      toast.error(err);
    }
  };

  if (error) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  if (loading) {
    return (
      <div className="flex flex-col gap-3 p-4">
        <Skeleton className="h-20 w-full" />
        <Skeleton className="h-20 w-full" />
      </div>
    );
  }

  if (announcements.length === 0) {
    return (
      <SevenxEmpty
        icon={IconSpeakerphone}
        title={compact ? t('no-announcements') : t('no-announcements-title')}
        description={compact ? undefined : t('no-announcements-description')}
        className={compact ? 'p-4 md:p-6' : 'h-full'}
      >
        {onAdd && !compact && <Button onClick={onAdd}>{t('add-announcement')}</Button>}
      </SevenxEmpty>
    );
  }

  return (
    <>
      <div className="flex flex-col gap-3 p-4">
        {announcements.map((announcement) => (
          <Card key={announcement._id}>
            <Card.Header className="flex flex-row items-start justify-between gap-3 p-4 pb-2">
              <div className="flex flex-col gap-1 min-w-0">
                <Card.Title className="text-base truncate">{announcement.title}</Card.Title>
                <Card.Description className="flex flex-wrap items-center gap-2 text-xs">
                  <Badge variant={announcement.scope === 'all' ? 'info' : 'secondary'}>
                    {announcement.scope === 'all'
                      ? t('scope-all')
                      : announcement.class?.name ?? t('scope-class')}
                  </Badge>
                  <span>{formatDateTime(announcement.createdAt)}</span>
                  {announcement.createdByName && <span>· {announcement.createdByName}</span>}
                  <span>· {t('read-count', { count: announcement.readCount })}</span>
                </Card.Description>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive shrink-0"
                aria-label={t('remove-announcement')}
                onClick={() => setTarget(announcement)}
              >
                <IconTrash />
              </Button>
            </Card.Header>
            {!compact && (
              <Card.Content className="p-4 pt-0 text-sm whitespace-pre-wrap">
                {announcement.body}
              </Card.Content>
            )}
          </Card>
        ))}
      </div>
      <ConfirmRemoveDialog
        open={!!target}
        onOpenChange={(open) => !open && setTarget(null)}
        onConfirm={confirmRemove}
        title={t('remove-announcement')}
        loading={removing}
      />
    </>
  );
};
