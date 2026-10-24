'use client';

import { use, useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useApolloClient, useMutation, useQuery } from '@apollo/client/react';
import { useT } from '@/modules/i18n/I18nProvider';
import { AuthShell } from '@/modules/auth/AuthShell';
import {
  clearSession,
  homeForRole,
  tokenFromLoginResult,
  writeRole,
  writeToken,
} from '@/modules/auth/session';
import {
  CP_LOGIN,
  CP_REGISTER,
  SEVENX_INVITE_ACCEPT,
  SEVENX_INVITE_CHECK,
} from '@/modules/sevenx/graphql';
import type { CPUser, SevenxInviteCheck, SevenxMember } from '@/modules/sevenx/types';
import {
  Badge,
  Button,
  ErrorState,
  Field,
  Input,
  LoadingState,
  useToast,
} from '@/modules/ui';

type CheckData = { sevenxInviteCheck: SevenxInviteCheck };
type RegisterData = { clientPortalUserRegister: CPUser | null };
type LoginData = { clientPortalUserLoginWithCredentials: unknown };
type AcceptData = { sevenxInviteAccept: SevenxMember };

export default function InvitePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const t = useT();
  const { data, loading, error, refetch } = useQuery<CheckData>(SEVENX_INVITE_CHECK, {
    variables: { token },
    fetchPolicy: 'network-only',
  });

  return (
    <AuthShell>
      <h1 className="text-xl font-semibold">{t('invite.title')}</h1>
      {loading && <LoadingState label={t('invite.checking')} />}
      {error && <ErrorState message={error.message} onRetry={() => refetch()} />}
      {data && !data.sevenxInviteCheck.valid && (
        <div className="mt-4 space-y-3">
          <p className="font-medium text-danger">{t('invite.invalid')}</p>
          <p className="text-sm text-muted">
            {data.sevenxInviteCheck.reason || t('invite.invalidHint')}
          </p>
          <Link href="/login" className="text-sm text-primary hover:underline">
            {t('invite.goLogin')}
          </Link>
        </div>
      )}
      {data && data.sevenxInviteCheck.valid && (
        <InviteForm token={token} check={data.sevenxInviteCheck} />
      )}
    </AuthShell>
  );
}

function InviteForm({ token, check }: { token: string; check: SevenxInviteCheck }) {
  const t = useT();
  const router = useRouter();
  const toast = useToast();
  const client = useApolloClient();
  const role = check.role ?? 'student';

  const [firstName, setFirstName] = useState(check.firstName ?? '');
  const [lastName, setLastName] = useState(check.lastName ?? '');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [step, setStep] = useState<'idle' | 'register' | 'login' | 'accept'>('idle');

  const [register] = useMutation<RegisterData>(CP_REGISTER);
  const [login] = useMutation<LoginData>(CP_LOGIN);
  const [accept] = useMutation<AcceptData>(SEVENX_INVITE_ACCEPT);

  const validate = (): boolean => {
    const next: Record<string, string> = {};
    if (!firstName.trim()) next.firstName = t('common.required');
    if (!lastName.trim()) next.lastName = t('common.required');
    if (password.length < 6) next.password = t('login.passwordShort');
    if (confirm !== password) next.confirm = t('invite.passwordMismatch');
    setErrors(next);
    return Object.keys(next).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate() || !check.email) return;

    const email = check.email.toLowerCase();
    clearSession();

    try {
      setStep('register');
      try {
        await register({
          variables: {
            email,
            password,
            firstName: firstName.trim(),
            lastName: lastName.trim(),
          },
        });
      } catch (err) {
        // An account for this email may already exist (e.g. a retried invite):
        // fall through to login, which fails with a clear message otherwise.
        const message = (err as Error).message || '';
        if (!/exist|already|duplicate/i.test(message)) {
          throw new Error(`${t('invite.registerFailed')}: ${message}`);
        }
      }

      setStep('login');
      const { data: loginData } = await login({ variables: { email, password } });
      const jwt = tokenFromLoginResult(loginData?.clientPortalUserLoginWithCredentials);
      if (jwt) writeToken(jwt);

      setStep('accept');
      const { data: acceptData } = await accept({ variables: { token } });
      const member = acceptData?.sevenxInviteAccept;
      if (!member) throw new Error(t('invite.acceptFailed'));

      writeRole(member.role);
      await client.clearStore();
      toast.success(t('invite.success'));
      router.replace(homeForRole(member.role));
    } catch (err) {
      setFormError((err as Error).message);
      setStep('idle');
    }
  };

  const busy = step !== 'idle';

  return (
    <div className="mt-4 space-y-5">
      <div className="rounded-lg bg-gray-50 p-4 text-sm">
        <p className="font-medium">
          {t('invite.youAreInvited', { role: t(`role.${role}`) })}
        </p>
        <p className="mt-1 text-muted">{check.email}</p>
        <div className="mt-3">
          <p className="text-xs font-medium uppercase text-muted">{t('invite.classes')}</p>
          <div className="mt-1 flex flex-wrap gap-1">
            {check.classNames.length === 0 ? (
              <span className="text-xs text-muted">{t('invite.noClasses')}</span>
            ) : (
              check.classNames.map((name) => (
                <Badge key={name} tone="indigo">
                  {name}
                </Badge>
              ))
            )}
          </div>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-4" noValidate>
        <div className="grid grid-cols-2 gap-3">
          <Field label={t('common.lastName')} htmlFor="lastName" error={errors.lastName}>
            <Input id="lastName" value={lastName} onChange={(e) => setLastName(e.target.value)} />
          </Field>
          <Field label={t('common.firstName')} htmlFor="firstName" error={errors.firstName}>
            <Input id="firstName" value={firstName} onChange={(e) => setFirstName(e.target.value)} />
          </Field>
        </div>
        <Field label={t('common.password')} htmlFor="password" error={errors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>
        <Field label={t('invite.passwordConfirm')} htmlFor="confirm" error={errors.confirm}>
          <Input
            id="confirm"
            type="password"
            autoComplete="new-password"
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
          />
        </Field>

        {formError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={busy}>
          {busy ? t('invite.creating') : t('invite.createAccount')}
        </Button>
      </form>

      <p className="text-center text-xs text-muted">
        {t('invite.alreadyHaveAccount')}{' '}
        <Link href="/login" className="text-primary hover:underline">
          {t('login.title')}
        </Link>
      </p>
    </div>
  );
}
