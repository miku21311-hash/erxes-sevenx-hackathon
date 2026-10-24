'use client';

import Link from 'next/link';
import { useT } from '@/modules/i18n/I18nProvider';
import { Badge } from '@/modules/ui';
import { formatSchedule } from '@/modules/sevenx/date';
import { memberFullName, type SevenxClass } from '@/modules/sevenx/types';

export function ClassSummary({
  cls,
  backHref,
  showTeacher,
}: {
  cls: SevenxClass;
  backHref: string;
  showTeacher?: boolean;
}) {
  const t = useT();
  return (
    <div className="mb-4">
      <Link href={backHref} className="text-xs text-muted hover:text-foreground">
        ← {t('common.back')}
      </Link>
      <div className="mt-1 flex flex-wrap items-center gap-2">
        <h1 className="text-2xl font-semibold">{cls.name}</h1>
        <Badge tone={cls.status === 'active' ? 'green' : 'gray'}>{cls.status}</Badge>
      </div>
      <p className="mt-1 text-sm text-muted">
        {formatSchedule(cls.schedule, (d) => t(`day.${d}`))}
        {cls.location ? ` · ${cls.location.name}` : ''}
        {cls.room ? ` · ${t('common.room')} ${cls.room}` : ''}
        {' · '}
        {t('class.studentsCount', { count: cls.studentIds.length })}
        {showTeacher && cls.teacher ? ` · ${t('common.teacher')}: ${memberFullName(cls.teacher)}` : ''}
      </p>
      {cls.description && <p className="mt-2 text-sm">{cls.description}</p>}
    </div>
  );
}
