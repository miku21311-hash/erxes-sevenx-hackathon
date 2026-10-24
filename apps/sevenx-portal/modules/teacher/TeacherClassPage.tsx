'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useT } from '@/modules/i18n/I18nProvider';
import { AnnouncementsPanel } from '@/modules/sevenx/components/AnnouncementsPanel';
import { ClassSummary } from '@/modules/sevenx/components/ClassSummary';
import { useClassDetail } from '@/modules/sevenx/useClassDetail';
import { EmptyState, ErrorState, LoadingState, Tabs } from '@/modules/ui';
import { AssignmentsTab } from './AssignmentsTab';
import { AttendanceTab } from './AttendanceTab';
import { StudentsTab } from './StudentsTab';

type TabKey = 'attendance' | 'assignments' | 'students' | 'announcements';

const TAB_KEYS: TabKey[] = ['attendance', 'assignments', 'students', 'announcements'];

export function TeacherClassPage({ classId }: { classId: string }) {
  const t = useT();
  const router = useRouter();
  const params = useSearchParams();
  const tabParam = params.get('tab');
  const tab: TabKey = TAB_KEYS.includes(tabParam as TabKey) ? (tabParam as TabKey) : 'attendance';
  const { cls, loading, error, refetch } = useClassDetail(classId);

  const setTab = (next: TabKey) => router.replace(`/t/classes/${classId}?tab=${next}`);

  if (loading) return <LoadingState />;
  if (error && !cls) return <ErrorState message={error.message} onRetry={() => refetch()} />;
  if (!cls) return <EmptyState title={t('class.notFound')} />;

  return (
    <div>
      <ClassSummary cls={cls} backHref="/t" />
      <Tabs<TabKey>
        value={tab}
        onChange={setTab}
        items={[
          { key: 'attendance', label: t('tab.attendance') },
          { key: 'assignments', label: t('tab.assignments') },
          { key: 'students', label: t('tab.students'), badge: cls.students.length },
          { key: 'announcements', label: t('tab.announcements') },
        ]}
      />
      <div className="pt-4">
        {tab === 'attendance' && <AttendanceTab cls={cls} />}
        {tab === 'assignments' && <AssignmentsTab cls={cls} />}
        {tab === 'students' && <StudentsTab cls={cls} onChanged={() => refetch()} />}
        {tab === 'announcements' && <AnnouncementsPanel classId={cls._id} canCreate />}
      </div>
    </div>
  );
}
