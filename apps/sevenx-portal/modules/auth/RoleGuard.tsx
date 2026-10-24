'use client';

import { useEffect, type ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/modules/i18n/I18nProvider';
import { Button, ErrorState, LoadingState } from '@/modules/ui';
import type { SevenxMember, SevenxRole } from '@/modules/sevenx/types';
import { homeForRole, writeRole } from './session';
import { useMe } from './useMe';
import { PortalHeader } from './PortalHeader';
import { MeProvider } from './MeContext';

export function RoleGuard({
  role,
  children,
}: {
  role: SevenxRole;
  children: ReactNode;
}) {
  const t = useT();
  const router = useRouter();
  const { me, loading, error, refetch } = useMe();

  // Redirect only when the server answered (member is null). A network failure
  // keeps the user here with a retry so a backend hiccup does not log them out.
  const unauthenticated = !loading && !me && !error;

  useEffect(() => {
    if (unauthenticated) {
      router.replace('/login');
    }
  }, [unauthenticated, router]);

  useEffect(() => {
    if (me) writeRole(me.role);
  }, [me]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingState label={t('guard.checking')} />
      </div>
    );
  }

  if (!me) {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        {error ? (
          <div className="w-full max-w-md space-y-3">
            <ErrorState message={error.message} onRetry={() => refetch()} />
            <Button variant="outline" className="w-full" onClick={() => router.replace('/login')}>
              {t('login.title')}
            </Button>
          </div>
        ) : (
          <span className="text-sm text-muted">{t('guard.checking')}</span>
        )}
      </div>
    );
  }

  if (me.role !== role) {
    return <WrongRole me={me} />;
  }

  return (
    <MeProvider me={me}>
      <div className="min-h-screen">
        <PortalHeader me={me} />
        <main className="mx-auto w-full max-w-6xl px-4 py-6 sm:px-6">{children}</main>
      </div>
    </MeProvider>
  );
}

function WrongRole({ me }: { me: SevenxMember }) {
  const t = useT();
  const router = useRouter();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 p-6 text-center">
      <p className="text-sm text-muted">
        {t('guard.wrongRole', { role: t(`role.${me.role === 'teacher' ? 'student' : 'teacher'}`) })}
      </p>
      <Button onClick={() => router.replace(homeForRole(me.role))}>{t('guard.goHome')}</Button>
    </div>
  );
}
