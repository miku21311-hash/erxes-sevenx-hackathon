'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { AttachmentList, AttachmentPicker } from '@/modules/files/Attachments';
import { formatDateTime, isOverdue } from '@/modules/sevenx/date';
import { SEVENX_ASSIGNMENTS, SEVENX_SUBMISSION_UPSERT } from '@/modules/sevenx/graphql';
import type {
  SevenxAssignment,
  SevenxAttachmentInput,
  SevenxClass,
  SevenxSubmission,
} from '@/modules/sevenx/types';
import {
  Badge,
  Button,
  Card,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  LoadingState,
  Textarea,
  useToast,
} from '@/modules/ui';

type AssignmentsData = { sevenxAssignments: SevenxAssignment[] };

export function StudentAssignmentsTab({ cls }: { cls: SevenxClass }) {
  const t = useT();
  const { locale } = useLocale();
  const { data, loading, error, refetch } = useQuery<AssignmentsData>(SEVENX_ASSIGNMENTS, {
    variables: { classId: cls._id },
    fetchPolicy: 'cache-and-network',
  });
  const [active, setActive] = useState<SevenxAssignment | null>(null);

  const items = [...(data?.sevenxAssignments ?? [])].sort(
    (a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime(),
  );

  return (
    <div className="space-y-3">
      {loading && !data && <LoadingState />}
      {error && !data && <ErrorState message={error.message} onRetry={() => refetch()} />}
      {data && items.length === 0 && <EmptyState title={t('asg.none')} />}

      <ul className="space-y-2">
        {items.map((a) => {
          const sub = a.mySubmission;
          const graded = sub && sub.score !== null && sub.score !== undefined;
          const overdue = isOverdue(a.dueDate);
          return (
            <li key={a._id}>
              <Card className="px-4 py-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-medium">{a.title}</p>
                      {graded ? (
                        <Badge tone="green">
                          {sub.score}/{a.maxScore}
                        </Badge>
                      ) : sub ? (
                        <Badge tone="blue">{t('dash.submitted')}</Badge>
                      ) : overdue ? (
                        <Badge tone="red">{t('asg.overdue')}</Badge>
                      ) : (
                        <Badge tone="amber">{t('dash.notSubmitted')}</Badge>
                      )}
                      {sub?.isLate && <Badge tone="gray">{t('asg.late')}</Badge>}
                    </div>
                    <p className="mt-0.5 text-xs text-muted">
                      {t('common.due')}: {formatDateTime(a.dueDate, locale)} · {t('asg.maxScore')}: {a.maxScore}
                    </p>
                    {a.description && (
                      <p className="mt-2 whitespace-pre-wrap text-sm">{a.description}</p>
                    )}
                    <div className="mt-2">
                      <AttachmentList items={a.attachments} />
                    </div>
                    {sub && (
                      <div className="mt-3 rounded-lg bg-gray-50 p-3 text-sm">
                        <p className="text-xs font-medium uppercase text-muted">
                          {t('asg.mySubmission')} · {formatDateTime(sub.submittedAt, locale)}
                        </p>
                        {sub.text && <p className="mt-1 whitespace-pre-wrap">{sub.text}</p>}
                        <div className="mt-2">
                          <AttachmentList items={sub.attachments} />
                        </div>
                        {graded && (
                          <div className="mt-2 border-t border-border pt-2">
                            <p>
                              <span className="font-medium">{t('common.score')}:</span> {sub.score}/{a.maxScore}
                            </p>
                            {sub.feedback && (
                              <p className="mt-1">
                                <span className="font-medium">{t('common.feedback')}:</span> {sub.feedback}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                  <div className="shrink-0">
                    {!graded && (
                      <Button size="sm" variant={sub ? 'outline' : 'primary'} onClick={() => setActive(a)}>
                        {sub ? t('asg.editSubmission') : t('asg.submit')}
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </li>
          );
        })}
      </ul>

      <SubmitDialog assignment={active} onClose={() => setActive(null)} onSaved={() => refetch()} />
    </div>
  );
}

function SubmitDialog({
  assignment,
  onClose,
  onSaved,
}: {
  assignment: SevenxAssignment | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  return (
    <Dialog open={!!assignment} onClose={onClose} title={assignment ? `${assignment.title} · ${t('asg.yourAnswer')}` : ''}>
      {assignment && (
        <SubmitForm key={assignment._id} assignment={assignment} onClose={onClose} onSaved={onSaved} />
      )}
    </Dialog>
  );
}

function SubmitForm({
  assignment,
  onClose,
  onSaved,
}: {
  assignment: SevenxAssignment;
  onClose: () => void;
  onSaved: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const existing = assignment.mySubmission;
  const [text, setText] = useState(existing?.text ?? '');
  const [attachments, setAttachments] = useState<SevenxAttachmentInput[]>(
    (existing?.attachments ?? []).map(({ url, name, size, type }) => ({ url, name, size, type })),
  );
  const [error, setError] = useState<string | null>(null);
  const [upsert, { loading }] = useMutation<{ sevenxSubmissionUpsert: SevenxSubmission }>(
    SEVENX_SUBMISSION_UPSERT,
  );

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!text.trim() && attachments.length === 0) {
      setError(t('asg.submissionEmpty'));
      return;
    }
    setError(null);
    try {
      await upsert({
        variables: { assignmentId: assignment._id, text: text.trim() || null, attachments },
      });
      toast.success(t('asg.submitted'));
      onClose();
      onSaved();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4" noValidate>
      <Field label={t('asg.answerText')} htmlFor="sub-text" error={error}>
        <Textarea id="sub-text" value={text} onChange={(e) => setText(e.target.value)} rows={6} />
      </Field>
      <Field label={t('common.attachments')} hint={t('common.optional')}>
        <AttachmentPicker value={attachments} onChange={setAttachments} />
      </Field>
      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onClose}>
          {t('common.cancel')}
        </Button>
        <Button type="submit" loading={loading}>
          {existing ? t('common.save') : t('common.submit')}
        </Button>
      </div>
    </form>
  );
}
