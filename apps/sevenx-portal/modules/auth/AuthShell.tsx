'use client';

import type { ReactNode } from 'react';
import { useT } from '@/modules/i18n/I18nProvider';
import { Card } from '@/modules/ui';
import { LanguageSwitch } from './PortalHeader';

export function AuthShell({ children }: { children: ReactNode }) {
  const t = useT();
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="mb-6 flex w-full max-w-md items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary text-base font-bold text-primary-foreground">
            7x
          </span>
          <div>
            <p className="font-semibold leading-tight">{t('app.name')}</p>
            <p className="text-xs text-muted">{t('app.tagline')}</p>
          </div>
        </div>
        <LanguageSwitch />
      </div>
      <Card className="w-full max-w-md p-6">{children}</Card>
    </div>
  );
}
