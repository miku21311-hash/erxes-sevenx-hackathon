'use client';

import { useState, type FormEvent } from 'react';
import { useMutation, useQuery } from '@apollo/client/react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { AttachmentList, AttachmentPicker } from '@/modules/files/Attachments';
import { formatDateTime } from '@/modules/sevenx/date';
import {
  SEVENX_ANNOUNCEMENTS,
  SEVENX_ANNOUNCEMENT_ADD,
  SEVENX_ANNOUNCEMENT_MARK_READ,
} from '@/modules/sevenx/graphql';
import type { SevenxAnnouncement, SevenxAttachmentInput } from '@/modules/sevenx/types';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Dialog,
  EmptyState,
  ErrorState,
  Field,
  Input,
  LoadingState,
  Textarea,
  cn,
  useToast,
} from '@/modules/ui';

export type AnnouncementsData = { sevenxAnnouncements: SevenxAnnouncement[] };

export function AnnouncementsPanel({
  classId,
  canCreate,
  markReadOnOpen,
  limit,
}: {
  classId?: string;
  canCreate?: boolean;
  markReadOnOpen?: boolean;
  limit?: number;
}) {
  const t = useT();
  const { locale } = useLocale();
  const variables = { classId, limit };
  const { data, loading, error, refetch } = useQuery<AnnouncementsData>(SEVENX_ANNOUNCEMENTS, {
    variables,
    fetchPolicy: 'cache-and-network',
  });
  const [open, setOpen] = useState<SevenxAnnouncement | null>(null);
  const [creating, setCreating] = useState(false);

  const [markRead] = useMutation<{ sevenxAnnouncementMarkRead: SevenxAnnouncement }>(
    SEVENX_ANNOUNCEMENT_MARK_READ,
  );

  const onOpen = async (item: SevenxAnnouncement) => {
    setOpen(item);
    if (markReadOnOpen && !item.isRead) {
      try {
        await markRead({ variables: { _id: item._id } });
      } catch {
        // read state is cosmetic, do not interrupt reading
      }
    }
  };

  const items = data?.sevenxAnnouncements ?? [];

  return (
    <div className="space-y-3">
      {canCreate && classId && (
        <div className="flex justify-end">
          <Button size="sm" onClick={() => setCreating(true)}>
            {t('ann.new')}
          </Button>
        </div>
      )}

      {loading && !data && <LoadingState />}
      {error && !data && <ErrorState message={error.message} onRetry={() => refetch()} />}
      {data && items.length === 0 && <EmptyState title={t('ann.none')} />}

      <ul className="space-y-2">
        {items.map((item) => (
          <li key={item._id}>
            <button
              type="button"
              onClick={() => onOpen(item)}
              className={cn(
                'w-full rounded-xl border border-border bg-card px-4 py-3 text-left transition-colors hover:bg-gray-50',
                !item.isRead && 'border-l-4 border-l-primary',
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate font-medium">{item.title}</p>
                  <p className="mt-0.5 line-clamp-2 text-sm text-muted">{item.body}</p>
                </div>
                <div className="flex shrink-0 flex-col items-end gap-1">
                  {!item.isRead && <Badge tone="indigo">{t('ann.new_badge')}</Badge>}
                  <Badge tone={item.scope === 'all' ? 'amber' : 'gray'}>
                    {item.scope === 'all' ? t('ann.scope.all') : item.class?.name ?? t('ann.scope.class')}
                  </Badge>
                </div>
              </div>
              <p className="mt-2 text-xs text-muted">
                {item.createdByName ? `${item.createdByName} · ` : ''}
                {formatDateTime(item.createdAt, locale)}
                {canCreate ? ` · ${t('ann.readBy', { count: item.readCount })}` : ''}
              </p>
            </button>
          </li>
        ))}
      </ul>

      <Dialog open={!!open} onClose={() => setOpen(null)} title={open?.title ?? ''}>
        {open && (
          <div className="space-y-3">
            <p className="text-xs text-muted">
              {open.createdByName ? `${open.createdByName} · ` : ''}
              {formatDateTime(open.createdAt, locale)}
            </p>
            <p className="whitespace-pre-wrap text-sm">{open.body}</p>
            <AttachmentList items={open.attachments} />
          </div>
        )}
      </Dialog>

      {canCreate && classId && (
        <AnnouncementDialog
          classId={classId}
          open={creating}
          onClose={() => setCreating(false)}
          onCreated={() => refetch()}
        />
      )}
    </div>
  );
}

function AnnouncementDialog({
  classId,
  open,
  onClose,
  onCreated,
}: {
  classId: string;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [attachments, setAttachments] = useState<SevenxAttachmentInput[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [add, { loading }] = useMutation<{ sevenxAnnouncementAdd: SevenxAnnouncement }>(
    SEVENX_ANNOUNCEMENT_ADD,
  );

  const reset = () => {
    setTitle('');
    setBody('');
    setAttachments([]);
    setErrors({});
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (!title.trim()) next.title = t('common.required');
    if (!body.trim()) next.body = t('common.required');
    setErrors(next);
    if (Object.keys(next).length > 0) return;
    try {
      await add({
        variables: { scope: 'class', classId, title: title.trim(), body: body.trim(), attachments },
      });
      toast.success(t('ann.created'));
      reset();
      onClose();
      onCreated();
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      title={t('ann.new')}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            {t('common.cancel')}
          </Button>
          <Button type="submit" form="announcement-form" loading={loading}>
            {t('common.create')}
          </Button>
        </>
      }
    >
      <form id="announcement-form" onSubmit={onSubmit} className="space-y-4" noValidate>
        <Field label={t('ann.title')} htmlFor="ann-title" error={errors.title}>
          <Input id="ann-title" value={title} onChange={(e) => setTitle(e.target.value)} />
        </Field>
        <Field label={t('ann.body')} htmlFor="ann-body" error={errors.body}>
          <Textarea id="ann-body" value={body} onChange={(e) => setBody(e.target.value)} />
        </Field>
        <Field label={t('common.attachments')} hint={t('common.optional')}>
          <AttachmentPicker value={attachments} onChange={setAttachments} />
        </Field>
      </form>
    </Dialog>
  );
}

export function AnnouncementsCard({
  classId,
  markReadOnOpen,
  limit = 5,
}: {
  classId?: string;
  markReadOnOpen?: boolean;
  limit?: number;
}) {
  const t = useT();
  return (
    <Card>
      <div className="border-b border-border px-5 py-4">
        <h2 className="text-base font-semibold">{t('dash.announcements')}</h2>
      </div>
      <CardBody>
        <AnnouncementsPanel classId={classId} markReadOnOpen={markReadOnOpen} limit={limit} />
      </CardBody>
    </Card>
  );
}
