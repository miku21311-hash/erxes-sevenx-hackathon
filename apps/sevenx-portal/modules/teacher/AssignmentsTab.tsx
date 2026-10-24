'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { AttachmentList, AttachmentPicker } from '@/modules/files/Attachments';
import { formatDateTime, isOverdue, toDateTimeLocal } from '@/modules/sevenx/date';
import {
  SEVENX_ASSIGNMENTS,
  SEVENX_ASSIGNMENT_ADD,
  SEVENX_ASSIGNMENT_EDIT,
  SEVENX_ASSIGNMENT_REMOVE,
  SEVENX_SUBMISSIONS,
  SEVENX_SUBMISSION_GRADE,
} from '@/modules/sevenx/graphql';
import type {
  SevenxAssignment,
  SevenxAttachmentInput,
  SevenxClass,
  SevenxSubmission,
} from '@/modules/sevenx/types';
import { memberFullName } from '@/modules/sevenx/types';
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  Textarea,
  useToast,
} from '@/modules/ui';

export type AssignmentsData = { sevenxAssignments: SevenxAssignment[] };

export function AssignmentsTab({ cls }: { cls: SevenxClass }) {
  const t = useT();
  const toast = useToast();
  const { locale } = useLocale();
  const { data, loading, error, refetch } = useQuery<AssignmentsData>(SEVENX_ASSIGNMENTS, {
    variables: { classId: cls._id },
    fetchPolicy: 'cache-and-network',
  });
  const [editing, setEditing] = useState<SevenxAssignment | 'new' | null>(null);
  const [viewing, setViewing] = useState<SevenxAssignment | null>(null);
  const [remove, { loading: removing }] = useMutation<{ sevenxAssignmentRemove: string }>(
    SEVENX_ASSIGNMENT_REMOVE,
  );

  const onRemove = async (assignment: SevenxAssignment) => {
    if (!window.confirm(t('asg.deleteConfirm'))) return;
    try {
      await remove({ variables: { _id: assignment._id } });
      toast.success(t('asg.deleted'));
      await refetch();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const items = data?.sevenxAssignments ?? [];

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setEditing('new')}>
          {t('asg.new')}
        </Button>
      </div>

      {loading && !data && <LoadingState />}
      {error && !data && <ErrorState message={error.message} onRetry={() => refetch()} />}
      {data && items.length === 0 && <EmptyState title={t('asg.none')} />}

      <ul className="space-y-2">
        {items.map((a) => {
          const pending = a.submissionCount - a.gradedCount;
          return (
            <li key={a._id}>
              <Card className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{a.title}</p>
                      {isOverdue(a.dueDate) && <Badge tone="gray">{t('asg.overdue')}</Badge>}
                      {pending > 0 && <Badge tone="amber">{pending} {t('asg.submissions').toLowerCase()}</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {t('common.due')}: {formatDateTime(a.dueDate, locale)} · {t('asg.maxScore')}: {a.maxScore} ·{' '}
                      {t('asg.submissions')}: {a.submissionCount}/{cls.studentIds.length} · {a.gradedCount} {t('asg.graded')}
                    </p>
                    {a.description && (
                      <p className="mt-2 line-clamp-3 whitespace-pre-wrap text-sm">{a.description}</p>
                    )}
                    <div className="mt-2">
                      <AttachmentList items={a.attachments} />
                    </div>
                  </div>
                  <div className="flex shrink-0 gap-1">
                    <Button size="sm" variant="outline" onClick={() => setViewing(a)}>
                      {t('asg.viewSubmissions')}
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setEditing(a)}>
                      {t('common.edit')}
                    </Button>
                    <Button size="sm" variant="ghost" disabled={removing} onClick={() => onRemove(a)}>
                      {t('common.delete')}
                    </Button>
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <AssignmentDialog
        classId={cls._id}
        assignment={editing === 'new' ? null : editing}
        open={editing !== null}
        onClose={() => setEditing(null)}
        onSaved={() => refetch()}
      />

      <SubmissionsDialog
        cls={cls}
        assignment={viewing}
        onClose={() => setViewing(null)}
        onGraded={() => refetch()}
      />
    </div>
  );
}

function AssignmentDialog({
  classId,
  assignment,
  open,
  onClose,
  onSaved,
}: {
  classId: string;
  assignment: SevenxAssignment | null;
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const [add, { loading: adding }] = useMutation<{ sevenxAssignmentAdd: SevenxAssignment }>(
    SEVENX_ASSIGNMENT_ADD,
  );
  const [edit, { loading: editingLoading }] = useMutation<{ sevenxAssignmentEdit: SevenxAssignment }>(
    SEVENX_ASSIGNMENT_EDIT,
  );

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={assignment ? t('asg.edit') : t('asg.new')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="assignment-form" loading={adding || editingLoading}>
            {assignment ? t('common.save') : t('common.create')}
          </Button>
        </>
      }
    >
      {open && (
        <AssignmentForm
          key={assignment?._id ?? 'new'}
          assignment={assignment}
          onSubmit={async (input) => {
            try {
              if (assignment) {
                await edit({ variables: { _id: assignment._id, input: { ...input, classId } } });
                toast.success(t('asg.updated'));
              } else {
                await add({ variables: { input: { ...input, classId } } });
                toast.success(t('asg.created'));
              }
              onClose();
              onSaved();
            } catch (err) {
              toast.error((err as Error).message);
            }
          }}
        />
      )}
    </Dialog>
  );
}

type AssignmentFormValues = {
  title: string;
  description: string | null;
  dueDate: string;
  maxScore: number;
  attachments: SevenxAttachmentInput[];
};

function AssignmentForm({
  assignment,
  onSubmit,
}: {
  assignment: SevenxAssignment | null;
  onSubmit: (values: AssignmentFormValues) => Promise<void>;
}) {
  const t = useT();
  const [title, setTitle] = useState(assignment?.title ?? '');
  const [description, setDescription] = useState(assignment?.description ?? '');
  const [dueDate, setDueDate] = useState(() =>
    toDateTimeLocal(assignment?.dueDate ?? new Date(Date.now() + 7 * 86_400_000).toISOString()),
  );
  const [maxScore, setMaxScore] = useState(String(assignment?.maxScore ?? 100));
  const [attachments, setAttachments] = useState<SevenxAttachmentInput[]>(
    (assignment?.attachments ?? []).map(({ url, name, size, type }) => ({ url, name, size, type })),
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = t('common.required');
    if (!dueDate || Number.isNaN(new Date(dueDate).getTime())) next.dueDate = t('common.required');
    const score = Number(maxScore);
    if (!Number.isInteger(score) || score < 1 || score > 1000) next.maxScore = t('common.required');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    await onSubmit({
      title: title.trim(),
      description: description.trim() || null,
      dueDate: new Date(dueDate).toISOString(),
      maxScore: score,
      attachments,
    });
  };

  return (
    <form id="assignment-form" onSubmit={submit} className="space-y-4" noValidate>
      <Field label={t('asg.title')} htmlFor="asg-title" error={errors.title}>
        <Input id="asg-title" value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label={t('asg.description')} htmlFor="asg-desc" hint={t('common.optional')}>
        <Textarea id="asg-desc" value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label={t('asg.dueDate')} htmlFor="asg-due" error={errors.dueDate}>
          <Input id="asg-due" type="datetime-local" value={dueDate} onChange={(e) => setDueDate(e.target.value)} />
        </Field>
        <Field label={t('asg.maxScore')} htmlFor="asg-max" error={errors.maxScore}>
          <Input id="asg-max" type="number" min={1} max={1000} value={maxScore} onChange={(e) => setMaxScore(e.target.value)} />
        </Field>
      </div>
      <Field label={t('common.attachments')} hint={t('common.optional')}>
        <AttachmentPicker value={attachments} onChange={setAttachments} />
      </Field>
    </form>
  );
}

type SubmissionsData = { sevenxSubmissions: SevenxSubmission[] };

function SubmissionsDialog({
  cls,
  assignment,
  onClose,
  onGraded,
}: {
  cls: SevenxClass;
  assignment: SevenxAssignment | null;
  onClose: () => void;
  onGraded: () => void;
}) {
  const t = useT();
  const { locale } = useLocale();
  const { data, loading, error, refetch } = useQuery<SubmissionsData>(SEVENX_SUBMISSIONS, {
    variables: { assignmentId: assignment?._id ?? '' },
    skip: !assignment,
    fetchPolicy: 'cache-and-network',
  });

  const submissions = data?.sevenxSubmissions ?? [];
  const submittedIds = new Set(submissions.map((s) => s.studentId));
  const missing = cls.students.filter((s) => !submittedIds.has(s._id));

  return (
    <Dialog
      open={!!assignment}
      onClose={onClose}
      size="lg"
      title={assignment ? `${assignment.title} · ${t('asg.submissions')}` : ''}
      description={
        assignment ? `${t('common.due')}: ${formatDateTime(assignment.dueDate, locale)} · ${t('asg.maxScore')}: ${assignment.maxScore}` : undefined
      }
    >
      {loading && !data && <LoadingState />}
      {error && !data && <ErrorState message={error.message} onRetry={() => refetch()} />}
      {data && submissions.length === 0 && <EmptyState title={t('asg.noSubmissions')} />}
      {assignment && (
        <ul className="space-y-3">
          {submissions.map((s) => (
            <li key={s._id}>
              <SubmissionRow
                submission={s}
                maxScore={assignment.maxScore}
                onGraded={async () => {
                  await refetch();
                  onGraded();
                }}
              />
            </li>
          ))}
        </ul>
      )}
      {missing.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-medium uppercase text-muted">{t('dash.notSubmitted')}</p>
          <p className="mt-1 text-sm text-muted">{missing.map(memberFullName).join(', ')}</p>
        </div>
      )}
    </Dialog>
  );
}

function SubmissionRow({
  submission,
  maxScore,
  onGraded,
}: {
  submission: SevenxSubmission;
  maxScore: number;
  onGraded: () => Promise<void>;
}) {
  const t = useT();
  const toast = useToast();
  const { locale } = useLocale();
  const [score, setScore] = useState(submission.score === null || submission.score === undefined ? '' : String(submission.score));
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [error, setError] = useState<string | null>(null);
  const [grade, { loading }] = useMutation<{ sevenxSubmissionGrade: SevenxSubmission }>(
    SEVENX_SUBMISSION_GRADE,
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    const value = Number(score);
    if (score === '' || !Number.isInteger(value) || value < 0 || value > maxScore) {
      setError(t('asg.scoreRange', { max: maxScore }));
      return;
    }
    setError(null);
    try {
      await grade({ variables: { _id: submission._id, score: value, feedback: feedback.trim() || null } });
      toast.success(t('asg.gradeSaved'));
      await onGraded();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const graded = submission.score !== null && submission.score !== undefined;

  return (
    <div className="rounded-lg border border-border p-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="text-sm font-medium">
            {submission.student ? memberFullName(submission.student) : submission.studentId}
          </p>
          <p className="text-xs text-muted">
            {t('asg.submittedAt')}: {formatDateTime(submission.submittedAt, locale)}
          </p>
        </div>
        <div className="flex gap-1">
          {submission.isLate && <Badge tone="red">{t('asg.late')}</Badge>}
          {graded ? (
            <Badge tone="green">
              {submission.score}/{maxScore}
            </Badge>
          ) : (
            <Badge tone="amber">{t('asg.notGraded')}</Badge>
          )}
        </div>
      </div>
      {submission.text && <p className="mt-2 whitespace-pre-wrap text-sm">{submission.text}</p>}
      <div className="mt-2">
        <AttachmentList items={submission.attachments} />
      </div>
      <form onSubmit={submit} className="mt-3 flex flex-wrap items-start gap-2" noValidate>
        <div className="w-24">
          <Input
            type="number"
            min={0}
            max={maxScore}
            value={score}
            onChange={(e) => setScore(e.target.value)}
            placeholder={t('common.score')}
            aria-label={t('common.score')}
          />
        </div>
        <div className="min-w-48 flex-1">
          <Input
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder={t('common.feedback')}
            aria-label={t('common.feedback')}
          />
        </div>
        <Button type="submit" size="md" loading={loading}>
          {t('asg.grade')}
        </Button>
        {error && <p className="w-full text-xs text-danger">{error}</p>}
      </form>
    </div>
  );
}
