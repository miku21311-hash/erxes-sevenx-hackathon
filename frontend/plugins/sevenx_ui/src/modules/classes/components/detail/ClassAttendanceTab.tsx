import { useQuery } from '@apollo/client';
import { IconCalendarOff } from '@tabler/icons-react';
import dayjs from 'dayjs';
import { Badge, DatePicker, Skeleton, Table, Tooltip } from 'erxes-ui';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { QueryError, SevenxEmpty } from '~/modules/shared/components';
import {
  ISevenxAttendance,
  ISevenxAttendanceSummary,
  ISevenxClass,
  ISevenxSession,
  memberFullName,
  SevenxAttendanceStatus,
} from '~/modules/shared/types';
import { DATE_FORMAT, formatPercent } from '~/modules/shared/utils/schedule';
import {
  SEVENX_ATTENDANCE_REPORT,
  SEVENX_CLASS_ATTENDANCE_SUMMARY,
  SEVENX_CLASS_SESSIONS,
} from '../../graphql/queries';

const STATUS_CLASS: Record<SevenxAttendanceStatus, string> = {
  present: 'bg-success text-success-foreground',
  late: 'bg-warning text-warning-foreground',
  absent: 'bg-destructive text-destructive-foreground',
  excused: 'bg-info text-info-foreground',
};

const STATUS_SHORT: Record<SevenxAttendanceStatus, string> = {
  present: 'P',
  late: 'L',
  absent: 'A',
  excused: 'E',
};

/** Sessions derived from the schedule, used when the server returns none. */
const localSessions = (classItem: ISevenxClass, from: string, to: string): ISevenxSession[] => {
  const result: ISevenxSession[] = [];
  const today = dayjs().format(DATE_FORMAT);
  let cursor = dayjs(from);
  const end = dayjs(to);
  while (!cursor.isAfter(end, 'day')) {
    if (classItem.schedule.daysOfWeek.includes(cursor.day())) {
      const date = cursor.format(DATE_FORMAT);
      result.push({
        date,
        startTime: classItem.schedule.startTime,
        endTime: classItem.schedule.endTime,
        isToday: date === today,
        isPast: date < today,
      });
    }
    cursor = cursor.add(1, 'day');
  }
  return result;
};

export const ClassAttendanceTab = ({ classItem }: { classItem: ISevenxClass }) => {
  const { t } = useTranslation('sevenx');
  const defaultFrom = dayjs(classItem.schedule.startDate);
  const defaultTo = dayjs(classItem.schedule.endDate);
  const [from, setFrom] = useState<Date>(defaultFrom.toDate());
  const [to, setTo] = useState<Date>(
    (dayjs().isBefore(defaultTo) ? dayjs() : defaultTo).toDate(),
  );
  const fromStr = dayjs(from).format(DATE_FORMAT);
  const toStr = dayjs(to).format(DATE_FORMAT);
  const classId = classItem._id;

  const sessionsQuery = useQuery<{ sevenxClassSessions: ISevenxSession[] }>(
    SEVENX_CLASS_SESSIONS,
    { variables: { classId, from: fromStr, to: toStr } },
  );
  const reportQuery = useQuery<{ sevenxAttendanceReport: ISevenxAttendance[] }>(
    SEVENX_ATTENDANCE_REPORT,
    { variables: { classId, from: fromStr, to: toStr } },
  );
  const summaryQuery = useQuery<{ sevenxClassAttendanceSummary: ISevenxAttendanceSummary[] }>(
    SEVENX_CLASS_ATTENDANCE_SUMMARY,
    { variables: { classId } },
  );

  const sessions = useMemo(() => {
    const fromServer = sessionsQuery.data?.sevenxClassSessions;
    if (fromServer && fromServer.length > 0) return fromServer;
    if (sessionsQuery.loading) return [];
    return localSessions(classItem, fromStr, toStr);
  }, [sessionsQuery.data, sessionsQuery.loading, classItem, fromStr, toStr]);

  const attendanceMap = useMemo(() => {
    const map = new Map<string, ISevenxAttendance>();
    (reportQuery.data?.sevenxAttendanceReport ?? []).forEach((row) => {
      map.set(`${row.studentId}|${row.date}`, row);
    });
    return map;
  }, [reportQuery.data]);

  const summaries = summaryQuery.data?.sevenxClassAttendanceSummary ?? [];
  const loading = sessionsQuery.loading || reportQuery.loading;

  if (reportQuery.error) {
    return (
      <QueryError message={reportQuery.error.message} onRetry={() => reportQuery.refetch()} />
    );
  }

  return (
    <div className="flex flex-col gap-4 p-4">
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm text-muted-foreground">{t('period')}</span>
        <DatePicker
          value={from}
          mode="single"
          variant="outline"
          onChange={(date) => date instanceof Date && setFrom(date)}
        />
        <span className="text-muted-foreground">–</span>
        <DatePicker
          value={to}
          mode="single"
          variant="outline"
          onChange={(date) => date instanceof Date && setTo(date)}
        />
        <div className="ml-auto flex flex-wrap gap-2">
          {(Object.keys(STATUS_CLASS) as SevenxAttendanceStatus[]).map((status) => (
            <span key={status} className="flex items-center gap-1 text-xs">
              <span className={`inline-block size-3 rounded-sm ${STATUS_CLASS[status]}`} />
              {t(status)}
            </span>
          ))}
          <span className="flex items-center gap-1 text-xs">
            <span className="inline-block size-3 rounded-sm bg-muted border" />
            {t('not-marked')}
          </span>
        </div>
      </div>

      {loading ? (
        <Skeleton className="h-48 w-full" />
      ) : classItem.students.length === 0 ? (
        <SevenxEmpty icon={IconCalendarOff} title={t('no-students-in-class')} />
      ) : sessions.length === 0 ? (
        <SevenxEmpty icon={IconCalendarOff} title={t('attendance-no-sessions')} />
      ) : (
        <div className="overflow-auto rounded border">
          <Tooltip.Provider>
            <table className="text-xs border-collapse">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-background text-left px-3 py-2 font-medium border-b border-r min-w-44">
                    {t('students')}
                  </th>
                  {sessions.map((session) => (
                    <th
                      key={session.date}
                      className={`px-1 py-2 font-normal border-b text-center whitespace-nowrap ${
                        session.isToday ? 'text-primary font-semibold' : 'text-muted-foreground'
                      }`}
                    >
                      {dayjs(session.date).format('MM/DD')}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {classItem.students.map((student) => (
                  <tr key={student._id}>
                    <td className="sticky left-0 bg-background px-3 py-1 border-b border-r whitespace-nowrap">
                      {memberFullName(student)}
                    </td>
                    {sessions.map((session) => {
                      const row = attendanceMap.get(`${student._id}|${session.date}`);
                      return (
                        <td key={session.date} className="p-1 border-b">
                          <Tooltip>
                            <Tooltip.Trigger asChild>
                              <div
                                className={`size-6 rounded-sm flex items-center justify-center font-semibold ${
                                  row ? STATUS_CLASS[row.status] : 'bg-muted border'
                                }`}
                              >
                                {row ? STATUS_SHORT[row.status] : ''}
                              </div>
                            </Tooltip.Trigger>
                            <Tooltip.Content>
                              {session.date} · {row ? t(row.status) : t('not-marked')}
                              {row?.note ? ` · ${row.note}` : ''}
                            </Tooltip.Content>
                          </Tooltip>
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </Tooltip.Provider>
        </div>
      )}

      <div>
        <h3 className="text-sm font-semibold mb-2">{t('summary')}</h3>
        {summaryQuery.error ? (
          <QueryError
            message={summaryQuery.error.message}
            onRetry={() => summaryQuery.refetch()}
          />
        ) : summaryQuery.loading ? (
          <Skeleton className="h-24 w-full" />
        ) : (
          <Table>
            <Table.Header>
              <Table.Row>
                <Table.Head>{t('students')}</Table.Head>
                <Table.Head>{t('total')}</Table.Head>
                <Table.Head>{t('present')}</Table.Head>
                <Table.Head>{t('late')}</Table.Head>
                <Table.Head>{t('absent')}</Table.Head>
                <Table.Head>{t('excused')}</Table.Head>
                <Table.Head>{t('attendance-rate')}</Table.Head>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {classItem.students.map((student, index) => {
                const summary = summaries[index];
                return (
                  <Table.Row key={student._id}>
                    <Table.Cell className="font-medium">{memberFullName(student)}</Table.Cell>
                    <Table.Cell>{summary?.total ?? 0}</Table.Cell>
                    <Table.Cell>{summary?.present ?? 0}</Table.Cell>
                    <Table.Cell>{summary?.late ?? 0}</Table.Cell>
                    <Table.Cell>{summary?.absent ?? 0}</Table.Cell>
                    <Table.Cell>{summary?.excused ?? 0}</Table.Cell>
                    <Table.Cell>
                      <Badge
                        variant={
                          !summary || summary.total === 0
                            ? 'secondary'
                            : summary.rate >= 0.8
                            ? 'success'
                            : summary.rate >= 0.5
                            ? 'warning'
                            : 'destructive'
                        }
                      >
                        {summary ? formatPercent(summary.rate) : '—'}
                      </Badge>
                    </Table.Cell>
                  </Table.Row>
                );
              })}
            </Table.Body>
          </Table>
        )}
      </div>
    </div>
  );
};
