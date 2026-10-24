import { IconCalendarWeek } from '@tabler/icons-react';
import { useQueryState } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ClassesFilter } from '~/modules/classes/components/ClassesFilter';
import { useClasses } from '~/modules/classes/hooks/useClasses';
import { WeeklySchedule } from '~/modules/schedule/components/WeeklySchedule';
import { QueryError, SevenxPageHeader } from '~/modules/shared/components';

export const SchedulePage = () => {
  const { t } = useTranslation('sevenx');
  const [locationId, setLocationId] = useQueryState<string>('locationId');
  const { classes, loading, error, refetch } = useClasses({
    locationId: locationId ?? undefined,
  });

  return (
    <div className="flex flex-col h-full">
      <SevenxPageHeader icon={IconCalendarWeek} iconName="IconCalendarWeek" title={t('schedule')} path="/sevenx/schedule" />
      <ClassesFilter
        locationId={locationId ?? undefined}
        onLocationChange={(value) => setLocationId(value ?? null)}
      />
      <div className="flex-1 overflow-hidden">
        {error ? (
          <QueryError message={error.message} onRetry={() => refetch()} />
        ) : (
          <WeeklySchedule classes={classes} loading={loading} />
        )}
      </div>
    </div>
  );
};
