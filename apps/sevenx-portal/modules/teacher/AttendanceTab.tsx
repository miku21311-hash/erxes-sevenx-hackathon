'use client';

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useT } from '@/modules/i18n/I18nProvider';
import { addDays, toDateKey, todayKey } from '@/modules/sevenx/date';
import { SEVENX_ATTENDANCE_BY_DATE, SEVENX_ATTENDANCE_MARK } from '@/modules/sevenx/graphql';
import type {
  SevenxAttendance,
  SevenxAttendanceStatus,
  SevenxClass,
  SevenxMember,
  SevenxSession,
} from '@/modules/sevenx/types';
import { memberFullName } from '@/modules/sevenx/types';
import { useSessions } from '@/modules/sevenx/useSessions';
import {
  Badge,
  Button,
  Card,
  CardBody,
  EmptyState,
  ErrorState,
  Input,
  LoadingState,
  cn,
  useToast,
} from '@/modules/ui';

const STATUSES: SevenxAttendanceStatus[] = ['present', 'late', 'absent', 'excused'];

const STATUS_STYLE: Record<SevenxAttendanceStatus, string> = {
  present: 'bg-green-600 text-white border-green-600',
  late: 'bg-amber-500 text-white border-amber-500',
  absent: 'bg-red-600 text-white border-red-600',
  excused: 'bg-sky-600 text-white border-sky-600',
};

const STATUS_TONE: Record<SevenxAttendanceStatus, 'green' | 'amber' | 'red' | 'blue'> = {
  present: 'green',
  late: 'amber',
  absent: 'red',
  excused: 'blue',
};

type Row = { status: SevenxAttendanceStatus; note: string };
type AttendanceData = { sevenxAttendanceByDate: SevenxAttendance[] };

const nearestSessionDate = (dates: string[], today: string): string => {
  if (dates.length === 0 || dates.includes(today)) return today;
  const t0 = new Date(today).getTime();
  return [...dates].sort(
    (a, b) => Math.abs(new Date(a).getTime() - t0) - Math.abs(new Date(b).getTime() - t0),
  )[0];
};

export function AttendanceTab({ cls }: { cls: SevenxClass }) {
  const t = useT();
  const today = todayKey();
  const from = toDateKey(addDays(new Date(), -60));
  const to = toDateKey(addDays(new Date(), 60));
  const { sessions, loading: sessionsLoading } = useSessions(cls._id, from, to);
  const sessionDates = useMemo(() => sessions.map((s) => s.date), [sessions]);

  // The picked date is derived until the teacher touches the picker: today if
  // there is a session today, otherwise the nearest session date.
  const [pickedDate, setPickedDate] = useState<string | null>(null);
  const date = pickedDate ?? (sessionsLoading ? today : nearestSessionDate(sessionDates, today));

  const { data, loading, error, refetch } = useQuery<AttendanceData>(SEVENX_ATTENDANCE_BY_DATE, {
    variables: { classId: cls._id, date },
    fetchPolicy: 'network-only',
  });

  const students = useMemo(() => {
    const byId = new Map<string, SevenxMember>(cls.students.map((s) => [s._id, s]));
    for (const att of data?.sevenxAttendanceByDate ?? []) {
      if (att.student && !byId.has(att.studentId)) byId.set(att.studentId, att.student);
    }
    return Array.from(byId.values());
  }, [cls.students, data]);

  const initialRows = useMemo(() => {
    const next: Record<string, Row> = {};
    for (const student of students) next[student._id] = { status: 'absent', note: '' };
    for (const att of data?.sevenxAttendanceByDate ?? []) {
      next[att.studentId] = { status: att.status, note: att.note ?? '' };
    }
    return next;
  }, [students, data]);

  const hasSession = sessionDates.includes(date);
  const nearby = sessions.filter(
    (s) => Math.abs(new Date(s.date).getTime() - new Date(date).getTime()) < 15 * 86_400_000,
  );

  return (
    <div className="space-y-4">
      <DatePicker
        date={date}
        today={today}
        nearby={nearby}
        onChange={setPickedDate}
        label={t('common.date')}
        todayLabel={t('common.today')}
      />

      {!sessionsLoading && !hasSession && (
        <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
          {t('att.noSessionOnDate')}
        </p>
      )}

      {loading && !data && <LoadingState />}
      {error && !data && <ErrorState message={error.message} onRetry={() => refetch()} />}
      {data && students.length === 0 && (
        <Card>
          <EmptyState title={t('att.noStudents')} />
        </Card>
      )}
      {data && students.length > 0 && (
        <AttendanceEditor
          // remount whenever the date or the server rows change so local edits reset
          key={`${date}:${JSON.stringify(initialRows)}`}
          classId={cls._id}
          date={date}
          students={students}
          initialRows={initialRows}
          onSaved={() => refetch()}
        />
      )}
    </div>
  );
}

function DatePicker({
  date,
  today,
  nearby,
  onChange,
  label,
  todayLabel,
}: {
  date: string;
  today: string;
  nearby: SevenxSession[];
  onChange: (next: string) => void;
  label: string;
  todayLabel: string;
}) {
  return (
    <div className="flex flex-wrap items-end gap-3">
      <div>
        <label htmlFor="att-date" className="mb-1 block text-sm font-medium">
          {label}
        </label>
        <Input
          id="att-date"
          type="date"
          value={date}
          onChange={(e) => onChange(e.target.value || today)}
          className="w-44"
        />
      </div>
      <div className="flex flex-wrap gap-1">
        {nearby.map((s) => (
          <button
            key={s.date}
            type="button"
            onClick={() => onChange(s.date)}
            className={cn(
              'rounded-md border px-2 py-1 text-xs',
              s.date === date
                ? 'border-primary bg-indigo-50 text-primary'
                : 'border-border text-muted hover:text-foreground',
            )}
          >
            {s.date.slice(5)}
            {s.isToday ? ` · ${todayLabel}` : ''}
          </button>
        ))}
      </div>
    </div>
  );
}

function AttendanceEditor({
  classId,
  date,
  students,
  initialRows,
  onSaved,
}: {
  classId: string;
  date: string;
  students: SevenxMember[];
  initialRows: Record<string, Row>;
  onSaved: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const [rows, setRows] = useState<Record<string, Row>>(initialRows);
  const [dirty, setDirty] = useState(false);
  const [mark, { loading: saving }] = useMutation<{ sevenxAttendanceMark: SevenxAttendance[] }>(
    SEVENX_ATTENDANCE_MARK,
  );

  const setStatus = (studentId: string, status: SevenxAttendanceStatus) => {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], status } }));
    setDirty(true);
  };

  const setNote = (studentId: string, note: string) => {
    setRows((prev) => ({ ...prev, [studentId]: { ...prev[studentId], note } }));
    setDirty(true);
  };

  const allPresent = () => {
    setRows((prev) => {
      const next: Record<string, Row> = {};
      for (const s of students) next[s._id] = { status: 'present', note: prev[s._id]?.note ?? '' };
      return next;
    });
    setDirty(true);
  };

  const save = async () => {
    try {
      await mark({
        variables: {
          classId,
          date,
          items: students.map((s) => ({
            studentId: s._id,
            status: rows[s._id]?.status ?? 'absent',
            note: rows[s._id]?.note?.trim() || null,
          })),
        },
      });
      toast.success(t('att.saved'));
      setDirty(false);
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const counts = useMemo(() => {
    const c: Record<SevenxAttendanceStatus, number> = { present: 0, late: 0, absent: 0, excused: 0 };
    for (const s of students) c[rows[s._id]?.status ?? 'absent'] += 1;
    return c;
  }, [rows, students]);

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {STATUSES.map((s) => (
          <Badge key={s} tone={STATUS_TONE[s]}>
            {t(`att.${s}`)}: {counts[s]}
          </Badge>
        ))}
        {dirty && <Badge tone="gray">{t('att.unsaved')}</Badge>}
        <div className="ml-auto flex gap-2">
          <Button variant="outline" size="sm" onClick={allPresent}>
            {t('att.allPresent')}
          </Button>
          <Button size="sm" onClick={save} loading={saving} disabled={!dirty}>
            {t('att.save')}
          </Button>
        </div>
      </div>

      <Card>
        <CardBody className="p-0">
          <ul className="divide-y divide-border">
            {students.map((student, index) => {
              const row = rows[student._id] ?? { status: 'absent', note: '' };
              return (
                <li key={student._id} className="flex flex-col gap-2 px-4 py-3 sm:flex-row sm:items-center">
                  <div className="flex min-w-0 flex-1 items-center gap-3">
                    <span className="w-5 text-right text-xs text-muted">{index + 1}</span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium">{memberFullName(student)}</p>
                      <p className="truncate text-xs text-muted">{student.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex overflow-hidden rounded-lg border border-border">
                      {STATUSES.map((s) => (
                        <button
                          key={s}
                          type="button"
                          onClick={() => setStatus(student._id, s)}
                          className={cn(
                            'border-r px-2.5 py-1.5 text-xs font-medium last:border-r-0',
                            row.status === s
                              ? STATUS_STYLE[s]
                              : 'border-border bg-card text-muted hover:bg-gray-50',
                          )}
                        >
                          {t(`att.${s}`)}
                        </button>
                      ))}
                    </div>
                    <Input
                      value={row.note}
                      onChange={(e) => setNote(student._id, e.target.value)}
                      placeholder={t('att.note')}
                      className="h-8 w-32 text-xs"
                    />
                  </div>
                </li>
              );
            })}
          </ul>
        </CardBody>
      </Card>
    </div>
  );
}
