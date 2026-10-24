import { IconAlertTriangle, IconCircleCheck } from '@tabler/icons-react';
import { Alert, Badge, Spinner } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { ISevenxScheduleConflict } from '~/modules/shared/types';

interface ScheduleConflictsProps {
  conflicts: ISevenxScheduleConflict[];
  checking: boolean;
  ready: boolean;
}

export const ScheduleConflicts = ({ conflicts, checking, ready }: ScheduleConflictsProps) => {
  const { t } = useTranslation('sevenx');

  if (!ready) {
    return null;
  }

  if (checking) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <Spinner size="sm" containerClassName="h-auto flex-none" />
        {t('checking-conflicts')}
      </div>
    );
  }

  if (conflicts.length === 0) {
    return (
      <div className="flex items-center gap-2 text-sm text-success">
        <IconCircleCheck className="size-4" />
        {t('no-conflicts')}
      </div>
    );
  }

  return (
    <Alert variant="destructive">
      <IconAlertTriangle className="size-4" />
      <Alert.Title>{t('conflicts-title')}</Alert.Title>
      <Alert.Description>
        <ul className="flex flex-col gap-1 mt-1">
          {conflicts.map((conflict, index) => (
            <li
              key={`${conflict.classId}-${conflict.kind}-${index}`}
              className="flex items-start gap-2 text-sm"
            >
              <Badge variant="destructive">
                {conflict.kind === 'teacher' ? t('conflict-teacher') : t('conflict-room')}
              </Badge>
              <span>
                <span className="font-medium">{conflict.className}</span>
                {' — '}
                {conflict.message}
              </span>
            </li>
          ))}
        </ul>
      </Alert.Description>
    </Alert>
  );
};
