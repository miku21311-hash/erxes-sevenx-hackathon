'use client';

import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { todayKey } from '@/modules/sevenx/date';
import { SEVENX_ASSIGNMENTS, SEVENX_CLASS_SESSIONS } from '@/modules/sevenx/graphql';
import type { SevenxAssignment, SevenxClass, SevenxSession } from '@/modules/sevenx/types';

export type TodaySession = { cls: SevenxClass; session: SevenxSession };
export type UngradedItem = { cls: SevenxClass; assignment: SevenxAssignment; pending: number };

export type TeacherOverview = {
  loading: boolean;
  error: string | null;
  today: TodaySession[];
  ungraded: UngradedItem[];
};

type Loaded = { key: string; error: string | null; today: TodaySession[]; ungraded: UngradedItem[] };

/** Fans out per-class queries (today's sessions, assignments) and aggregates them.
 * State is keyed by the class list so `loading` is derived, not set in an effect. */
export const useTeacherOverview = (classes: SevenxClass[]): TeacherOverview => {
  const client = useApolloClient();
  const classKey = classes.map((c) => c._id).join(',');
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (classes.length === 0) return;
    let cancelled = false;
    const date = todayKey();

    Promise.all(
      classes.map(async (cls) => {
        const [sessions, assignments] = await Promise.all([
          client.query<{ sevenxClassSessions: SevenxSession[] }>({
            query: SEVENX_CLASS_SESSIONS,
            variables: { classId: cls._id, from: date, to: date },
            fetchPolicy: 'network-only',
          }),
          client.query<{ sevenxAssignments: SevenxAssignment[] }>({
            query: SEVENX_ASSIGNMENTS,
            variables: { classId: cls._id },
            fetchPolicy: 'network-only',
          }),
        ]);
        return {
          cls,
          sessions: sessions.data?.sevenxClassSessions ?? [],
          assignments: assignments.data?.sevenxAssignments ?? [],
        };
      }),
    )
      .then((rows) => {
        if (cancelled) return;
        const today: TodaySession[] = [];
        const ungraded: UngradedItem[] = [];
        for (const row of rows) {
          for (const session of row.sessions) {
            if (session.date === date || session.isToday) today.push({ cls: row.cls, session });
          }
          for (const assignment of row.assignments) {
            const pending = assignment.submissionCount - assignment.gradedCount;
            if (pending > 0) ungraded.push({ cls: row.cls, assignment, pending });
          }
        }
        today.sort((a, b) => a.session.startTime.localeCompare(b.session.startTime));
        setLoaded({ key: classKey, error: null, today, ungraded });
      })
      .catch((err: Error) => {
        if (!cancelled) setLoaded({ key: classKey, error: err.message, today: [], ungraded: [] });
      });

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, classKey]);

  if (classes.length === 0) {
    return { loading: false, error: null, today: [], ungraded: [] };
  }
  if (!loaded || loaded.key !== classKey) {
    return { loading: true, error: null, today: [], ungraded: [] };
  }
  return { loading: false, error: loaded.error, today: loaded.today, ungraded: loaded.ungraded };
};
