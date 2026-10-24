'use client';

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useApolloClient, useMutation } from '@apollo/client/react';
import { useT } from '@/modules/i18n/I18nProvider';
import { AuthShell } from '@/modules/auth/AuthShell';
import {
  clearSession,
  homeForRole,
  readRole,
  tokenFromLoginResult,
  writeRole,
  writeToken,
  type PortalRole,
} from '@/modules/auth/session';
import type { MeQueryData } from '@/modules/auth/useMe';
import { CP_TOKEN } from '@/modules/apollo/env';
import { CP_LOGIN, CP_LOGOUT, SEVENX_ME } from '@/modules/sevenx/graphql';
import { Button, Field, Input, Tabs } from '@/modules/ui';

type LoginData = { clientPortalUserLoginWithCredentials: unknown };

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const t = useT();
  const router = useRouter();
  const client = useApolloClient();
  const [role, setRole] = useState<PortalRole>(() => readRole() ?? 'student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [login] = useMutation<LoginData>(CP_LOGIN);
  const [logout] = useMutation(CP_LOGOUT);

  const validate = (): boolean => {
    const errors: typeof fieldErrors = {};
    if (!EMAIL_RE.test(email.trim())) errors.email = t('login.emailInvalid');
    if (password.length < 6) errors.password = t('login.passwordShort');
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const onSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setFormError(null);
    if (!validate()) return;
    setSubmitting(true);
    try {
      clearSession();
      const { data } = await login({
        variables: { email: email.trim().toLowerCase(), password },
      });
      const token = tokenFromLoginResult(data?.clientPortalUserLoginWithCredentials);
      if (token) writeToken(token);

      await client.clearStore();
      const meResult = await client.query<MeQueryData>({
        query: SEVENX_ME,
        fetchPolicy: 'network-only',
      });
      const me = meResult.data?.sevenxMe ?? null;

      if (!me || me.role !== role) {
        setFormError(
          !me ? t('login.notMember') : t('login.roleMismatch', { role: t(`role.${role}`) }),
        );
        try {
          await logout();
        } finally {
          clearSession();
          await client.clearStore();
        }
        return;
      }

      writeRole(me.role);
      router.replace(homeForRole(me.role));
    } catch (err) {
      setFormError((err as Error).message || t('login.failed'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthShell>
      <h1 className="text-xl font-semibold">{t('login.title')}</h1>
      <p className="mb-5 mt-1 text-sm text-muted">{t('login.subtitle')}</p>

      <Tabs<PortalRole>
        variant="pills"
        value={role}
        onChange={setRole}
        items={[
          { key: 'teacher', label: t('role.teacher') },
          { key: 'student', label: t('role.student') },
        ]}
      />

      <form onSubmit={onSubmit} className="mt-5 space-y-4" noValidate>
        <Field label={t('common.email')} htmlFor="email" error={fieldErrors.email}>
          <Input
            id="email"
            type="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="name@example.com"
          />
        </Field>
        <Field label={t('common.password')} htmlFor="password" error={fieldErrors.password}>
          <Input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Field>

        {!CP_TOKEN && (
          <p className="rounded-md bg-amber-50 px-3 py-2 text-xs text-amber-800">
            {t('login.configMissing')}
          </p>
        )}
        {formError && (
          <p role="alert" className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-700">
            {formError}
          </p>
        )}

        <Button type="submit" className="w-full" loading={submitting}>
          {submitting ? t('login.loggingIn') : `${t('login.button')} · ${t(`role.${role}`)}`}
        </Button>
      </form>

      <p className="mt-5 text-center text-xs text-muted">{t('login.haveInvite')}</p>
    </AuthShell>
  );
}
