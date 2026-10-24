'use client';

import { useState, type FormEvent } from 'react';
import { useMutation } from '@apollo/client/react';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { formatDate } from '@/modules/sevenx/date';
import { SEVENX_INVITE_CREATE } from '@/modules/sevenx/graphql';
import type { SevenxClass, SevenxInvite } from '@/modules/sevenx/types';
import { memberFullName } from '@/modules/sevenx/types';
import {
  Badge,
  Button,
  Card,
  CardBody,
  Dialog,
  EmptyState,
  Field,
  Input,
  useToast,
} from '@/modules/ui';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function StudentsTab({ cls, onChanged }: { cls: SevenxClass; onChanged: () => void }) {
  const t = useT();
  const [inviting, setInviting] = useState(false);

  return (
    <div className="space-y-3">
      <div className="flex justify-end">
        <Button size="sm" onClick={() => setInviting(true)}>
          {t('stu.invite')}
        </Button>
      </div>
      <Card>
        <CardBody className="p-0">
          {cls.students.length === 0 && <EmptyState title={t('stu.none')} />}
          <ul className="divide-y divide-border">
            {cls.students.map((s, i) => (
              <li key={s._id} className="flex items-center gap-3 px-4 py-3">
                <span className="w-5 text-right text-xs text-muted">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{memberFullName(s)}</p>
                  <p className="truncate text-xs text-muted">
                    {s.email}
                    {s.phone ? ` · ${s.phone}` : ''}
                  </p>
                </div>
                <Badge tone={s.status === 'active' ? 'green' : 'amber'}>
                  {t(`stu.status.${s.status}`)}
                </Badge>
              </li>
            ))}
          </ul>
        </CardBody>
      </Card>
      <InviteDialog
        cls={cls}
        open={inviting}
        onClose={() => setInviting(false)}
        onCreated={onChanged}
      />
    </div>
  );
}

function InviteDialog({
  cls,
  open,
  onClose,
  onCreated,
}: {
  cls: SevenxClass;
  open: boolean;
  onClose: () => void;
  onCreated: () => void;
}) {
  const t = useT();
  const toast = useToast();
  const { locale } = useLocale();
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [invite, setInvite] = useState<SevenxInvite | null>(null);
  const [copied, setCopied] = useState(false);
  const [create, { loading }] = useMutation<{ sevenxInviteCreate: SevenxInvite }>(
    SEVENX_INVITE_CREATE,
  );

  const close = () => {
    setEmail('');
    setFirstName('');
    setLastName('');
    setError(null);
    setInvite(null);
    setCopied(false);
    onClose();
  };

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!EMAIL_RE.test(email.trim())) {
      setError(t('login.emailInvalid'));
      return;
    }
    setError(null);
    try {
      const { data } = await create({
        variables: {
          email: email.trim().toLowerCase(),
          role: 'student',
          classIds: [cls._id],
          firstName: firstName.trim() || null,
          lastName: lastName.trim() || null,
        },
      });
      if (data?.sevenxInviteCreate) {
        setInvite(data.sevenxInviteCreate);
        toast.success(t('stu.inviteCreated'));
        onCreated();
      }
    } catch (err) {
      toast.error((err as Error).message);
    }
  };

  const inviteUrl = invite
    ? invite.url || `${window.location.origin}/invite/${invite.token}`
    : '';

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(inviteUrl);
      setCopied(true);
      toast.success(t('common.copied'));
    } catch {
      toast.error(t('common.error'));
    }
  };

  return (
    <Dialog
      open={open}
      onClose={close}
      title={`${t('stu.invite')} · ${cls.name}`}
      footer={
        invite ? (
          <Button onClick={close}>{t('common.close')}</Button>
        ) : (
          <>
            <Button variant="outline" onClick={close}>
              {t('common.cancel')}
            </Button>
            <Button type="submit" form="invite-form" loading={loading}>
              {t('common.create')}
            </Button>
          </>
        )
      }
    >
      {invite ? (
        <div className="space-y-3">
          <p className="text-sm">
            {invite.email} · <Badge tone="blue">{t('role.student')}</Badge>
          </p>
          <Field label={t('stu.inviteLink')}>
            <div className="flex gap-2">
              <Input readOnly value={inviteUrl} onFocus={(e) => e.currentTarget.select()} />
              <Button variant="outline" onClick={copy}>
                {copied ? t('common.copied') : t('common.copy')}
              </Button>
            </div>
          </Field>
          <p className="text-xs text-muted">
            {t('stu.inviteHint', { date: formatDate(invite.expiresAt, locale) })}
          </p>
        </div>
      ) : (
        <form id="invite-form" onSubmit={submit} className="space-y-4" noValidate>
          <Field label={t('stu.inviteEmail')} htmlFor="inv-email" error={error}>
            <Input
              id="inv-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="student@example.com"
            />
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label={t('common.lastName')} htmlFor="inv-last" hint={t('common.optional')}>
              <Input id="inv-last" value={lastName} onChange={(e) => setLastName(e.target.value)} />
            </Field>
            <Field label={t('common.firstName')} htmlFor="inv-first" hint={t('common.optional')}>
              <Input id="inv-first" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
            </Field>
          </div>
        </form>
      )}
    </Dialog>
  );
}
