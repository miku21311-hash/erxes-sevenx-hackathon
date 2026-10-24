'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useT } from '@/modules/i18n/I18nProvider';
import { AnnouncementsPanel } from '@/modules/sevenx/components/AnnouncementsPanel';
import { ClassSummary } from '@/modules/sevenx/components/ClassSummary';
import { useClassDetail } from '@/modules/sevenx/useClassDetail';
import { EmptyState, ErrorState, LoadingState, Tabs } from '@/modules/ui';
import { MyAttendanceTab } from './MyAttendanceTab';
import { ScheduleTab } from './ScheduleTab';
import { StudentAssignmentsTab } from './StudentAssignmentsTab';

type TabKey = 'schedule' | 'attendance' | 'assignments' | 'announcements';

const TAB_KEYS: TabKey[] = ['schedule', 'attendance', 'assignments', 'announcements'];

export function StudentClassPage({ classId }: { classId: string }) {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TabKey = TAB_KEYS.includes(tabParam as TabKey) ? (tabParam as TabKey) : 'schedule';
  const { cls, loading, error, refetch } = useClassDetail(classId);

  const setTab = (next: TabKey) => router.replace(`/s/classes/${classId}?tab=${next}`);

  if (loading) return <LoadingState />;
  if (error && !cls) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!cls) return <EmptyState title={t('class.notFound')} />;

  return (
    <div>
      <ClassSummary cls={cls} backHref="/s" showTeacher />
      <Tabs<TabKey>
        value={tab}
        onChange={setTab}
        items={[
          { key: 'schedule', label: t('tab.schedule') },
          { key: 'attendance', label: t('tab.myAttendance') },
          { key: 'assignments', label: t('tab.assignments') },
          { key: 'announcements', label: t('tab.announcements') },
        ]}
      />
      <div className="pt-4">
        {tab === 'schedule' && <ScheduleTab cls={cls} />}
        {tab === 'attendance' && <MyAttendanceTab cls={cls} />}
        {tab === 'assignments' && <StudentAssignmentsTab cls={cls} />}
        {tab === 'announcements' && <AnnouncementsPanel classId={cls._id} markReadOnOpen />}
      </div>
    </div>
  );
}
