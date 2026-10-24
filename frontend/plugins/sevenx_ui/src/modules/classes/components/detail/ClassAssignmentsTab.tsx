import { useQuery } from '@apollo/client';
import { IconClipboardList } from '@tabler/icons-react';
import { Skeleton, Table } from 'erxes-ui';
import { useTranslation } from 'react-i18next';
import { QueryError, SevenxEmpty } from '~/modules/shared/components';
import { ISevenxAssignment } from '~/modules/shared/types';
import { formatDate } from '~/modules/shared/utils/schedule';
import { SEVENX_ASSIGNMENTS } from '../../graphql/queries';

interface AssignmentsResponse {
  sevenxAssignments: ISevenxAssignment[];
}

export const ClassAssignmentsTab = ({ classId }: { classId: string }) => {
  const { t } = useTranslation('sevenx');
  const { data, loading, error, refetch } = useQuery<AssignmentsResponse>(SEVENX_ASSIGNMENTS, {
    variables: { classId },
  });
  const assignments = data?.sevenxAssignments ?? [];

  if (error) {
    return <QueryError message={error.message} onRetry={() => refetch()} />;
  }

  if (loading) {
    return (
      <div className="p-4 flex flex-col gap-2">
        <Skeleton className="h-8 w-full" />
        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return <SevenxEmpty icon={IconClipboardList} title={t('no-assignments')} className="m-4" />;
  }

  return (
    <div className="p-4">
      <Table>
        <Table.Header>
          <Table.Row>
            <Table.Head>{t('title')}</Table.Head>
            <Table.Head>{t('due-date')}</Table.Head>
            <Table.Head>{t('max-score')}</Table.Head>
            <Table.Head>{t('submissions')}</Table.Head>
            <Table.Head>{t('graded')}</Table.Head>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {assignments.map((assignment) => (
            <Table.Row key={assignment._id}>
              <Table.Cell>
                <div className="font-medium">{assignment.title}</div>
                {assignment.description && (
                  <div className="text-xs text-muted-foreground line-clamp-2">
                    {assignment.description}
                  </div>
                )}
              </Table.Cell>
              <Table.Cell>{formatDate(assignment.dueDate)}</Table.Cell>
              <Table.Cell>{assignment.maxScore}</Table.Cell>
              <Table.Cell>{assignment.submissionCount}</Table.Cell>
              <Table.Cell>{assignment.gradedCount}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  );
};
