import { IconBook2, IconEdit, IconPlus } from '@tabler/icons-react';
import { Badge, Button, Skeleton, Tabs } from 'erxes-ui';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { AnnouncementFormSheet } from '~/modules/announcements/components/AnnouncementFormSheet';
import { AnnouncementsList } from '~/modules/announcements/components/AnnouncementsList';
import { ClassFormSheet } from '~/modules/classes/components/ClassFormSheet';
import { ClassAssignmentsTab } from '~/modules/classes/components/detail/ClassAssignmentsTab';
import { ClassAttendanceTab } from '~/modules/classes/components/detail/ClassAttendanceTab';
import { ClassStudentsTab } from '~/modules/classes/components/detail/ClassStudentsTab';
import { useClassDetail } from '~/modules/classes/hooks/useClassDetail';
import { QueryError, SevenxEmpty, SevenxPageHeader } from '~/modules/shared/components';
import { memberFullName } from '~/modules/shared/types';
import { formatDate, scheduleLabel } from '~/modules/shared/utils/schedule';

export const ClassDetailPage = () => {
  const { t } = useTranslation('sevenx');
  const { id } = useParams<{ id: string }>();
  const { classItem, loading, error, refetch } = useClassDetail(id);
  const [editOpen, setEditOpen] = useState(false);
  const [announceOpen, setAnnounceOpen] = useState(false);
  const [tab, setTab] = useState('students');

  const parent = { title: t('classes'), path: '/sevenx/classes' };

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <SevenxPageHeader icon={IconBook2} iconName="IconBook2" title="…" path="/sevenx/classes" parent={parent} />
        <QueryError message={error.message} onRetry={() => refetch()} />
      </div>
    );
  }

  if (loading || !id) {
    return (
      <div className="flex flex-col h-full">
        <SevenxPageHeader icon={IconBook2} iconName="IconBook2" title="…" path="/sevenx/classes" parent={parent} />
        <div className="p-4 flex flex-col gap-3">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    );
  }

  if (!classItem) {
    return (
      <div className="flex flex-col h-full">
        <SevenxPageHeader icon={IconBook2} iconName="IconBook2" title="…" path="/sevenx/classes" parent={parent} />
        <SevenxEmpty icon={IconBook2} title={t('class-not-found')} className="h-full">
          <Button variant="outline" asChild>
            <Link to="/sevenx/classes">{t('back-to-classes')}</Link>
          </Button>
        </SevenxEmpty>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader
        icon={IconBook2}
        iconName="IconBook2"
        title={classItem.name}
        path={`/sevenx/classes/${classItem._id}`}
        parent={parent}
      >
        <Button variant="outline" onClick={() => setEditOpen(true)}>
          <IconEdit />
          {t('edit')}
        </Button>
      </SevenxPageHeader>
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 border-b flex flex-col gap-2">
          <div className="flex items-center gap-3 flex-wrap">
            <h1 className="text-xl font-semibold">{classItem.name}</h1>
            <Badge variant={classItem.status === 'active' ? 'success' : 'secondary'}>
              {classItem.status === 'active' ? t('active') : t('archived')}
            </Badge>
          </div>
          {classItem.description && (
            <p className="text-sm text-muted-foreground">{classItem.description}</p>
          )}
          <dl className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div>
              <dt className="text-muted-foreground text-xs">{t('teacher')}</dt>
              <dd>{memberFullName(classItem.teacher) || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">{t('location')}</dt>
              <dd>{[classItem.location?.name, classItem.room].filter(Boolean).join(' · ') || '—'}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">{t('schedule')}</dt>
              <dd>{scheduleLabel(classItem.schedule, (day) => t(`day-${day}`))}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground text-xs">{t('period')}</dt>
              <dd>
                {formatDate(classItem.schedule.startDate)} – {formatDate(classItem.schedule.endDate)}
              </dd>
            </div>
          </dl>
        </div>
        <Tabs value={tab} onValueChange={setTab}>
          <Tabs.List className="px-4">
            <Tabs.Trigger value="students">
              {t('students')} ({classItem.students.length})
            </Tabs.Trigger>
            <Tabs.Trigger value="attendance">{t('attendance')}</Tabs.Trigger>
            <Tabs.Trigger value="assignments">{t('assignments')}</Tabs.Trigger>
            <Tabs.Trigger value="announcements">{t('announcements')}</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="students">
            <ClassStudentsTab classItem={classItem} />
          </Tabs.Content>
          <Tabs.Content value="attendance">
            <ClassAttendanceTab classItem={classItem} />
          </Tabs.Content>
          <Tabs.Content value="assignments">
            <ClassAssignmentsTab classId={classItem._id} />
          </Tabs.Content>
          <Tabs.Content value="announcements">
            <div className="flex justify-end px-4 pt-4">
              <Button onClick={() => setAnnounceOpen(true)}>
                <IconPlus />
                {t('add-announcement')}
              </Button>
            </div>
            <AnnouncementsList classId={classItem._id} onAdd={() => setAnnounceOpen(true)} />
          </Tabs.Content>
        </Tabs>
      </div>
      <ClassFormSheet open={editOpen} onOpenChange={setEditOpen} classItem={classItem} />
      <AnnouncementFormSheet
        open={announceOpen}
        onOpenChange={setAnnounceOpen}
        fixedClassId={classItem._id}
      />
    </div>
  );
};
