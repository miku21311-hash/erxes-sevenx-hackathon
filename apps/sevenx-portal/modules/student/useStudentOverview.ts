'use client';

import { useEffect, useState } from 'react';
import { useApolloClient } from '@apollo/client/react';
import { daysUntil, parseDate } from '@/modules/sevenx/date';
import { SEVENX_ASSIGNMENTS } from '@/modules/sevenx/graphql';
import type { SevenxAssignment, SevenxClass } from '@/modules/sevenx/types';

export type DueItem = { cls: SevenxClass; assignment: SevenxAssignment; days: number };

export type StudentOverview = { loading: boolean; error: string | null; dueSoon: DueItem[] };

type Loaded = { key: string; error: string | null; dueSoon: DueItem[] };

/** Assignments across all classes that are not yet submitted and due within 14 days (or overdue). */
export const useStudentOverview = (classes: SevenxClass[]): StudentOverview => {
  const client = useApolloClient();
  const classKey = classes.map((c) => c._id).join(',');
  const [loaded, setLoaded] = useState<Loaded | null>(null);

  useEffect(() => {
    if (classes.length === 0) return;
    let cancelled = false;
    Promise.all(
      classes.map(async (cls) => {
        const res = await client.query<{ sevenxAssignments: SevenxAssignment[] }>({
          query: SEVENX_ASSIGNMENTS,
          variables: { classId: cls._id },
          fetchPolicy: 'network-only',
        });
        return { cls, assignments: res.data?.sevenxAssignments ?? [] };
      }),
    )
      .then((rows) => {
        if (cancelled) return;
        const dueSoon: DueItem[] = [];
        for (const row of rows) {
          for (const assignment of row.assignments) {
            if (assignment.mySubmission) continue;
            const days = daysUntil(assignment.dueDate);
            if (days === null || days > 14) continue;
            dueSoon.push({ cls: row.cls, assignment, days });
          }
        }
        dueSoon.sort(
          (a, b) =>
            (parseDate(a.assignment.dueDate)?.getTime() ?? 0) -
            (parseDate(b.assignment.dueDate)?.getTime() ?? 0),
        );
        setLoaded({ key: classKey, error: null, dueSoon });
      })
      .catch((err: Error) => {
        if (!cancelled) setLoaded({ key: classKey, error: err.message, dueSoon: [] });
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [client, classKey]);

  if (classes.length === 0) return { loading: false, error: null, dueSoon: [] };
  if (!loaded || loaded.key !== classKey) return { loading: true, error: null, dueSoon: [] };
  return { loading: false, error: loaded.error, dueSoon: loaded.dueSoon };
};
