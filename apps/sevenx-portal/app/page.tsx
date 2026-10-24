'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useT } from '@/modules/i18n/I18nProvider';
import { useMe } from '@/modules/auth/useMe';
import { homeForRole } from '@/modules/auth/session';
import { LoadingState } from '@/modules/ui';

export default function Home() {
  const router = useRouter();
  const t = useT();
  const { me, loading } = useMe();

  useEffect(() => {
    if (loading) return;
    router.replace(me ? homeForRole(me.role) : '/login');
  }, [loading, me, router]);

  return (
    <div className="flex min-h-screen items-center justify-center">
      <LoadingState label={t('guard.checking')} />
    </div>
  );
}
