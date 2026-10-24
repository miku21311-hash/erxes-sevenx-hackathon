'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useLocale, useT } from '@/modules/i18n/I18nProvider';
import { Badge, Button, cn } from '@/modules/ui';
import type { SevenxMember } from '@/modules/sevenx/types';
import { memberFullName } from '@/modules/sevenx/types';
import { homeForRole } from './session';
import { useLogout } from './useLogout';

export function LanguageSwitch() {
  const { locale, setLocale } = useLocale();
  return (
    <div className="flex rounded-md border border-border text-xs" aria-label="language">
      {(['mn', 'en'] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          className={cn(
            'px-2 py-1 uppercase',
            locale === l ? 'bg-gray-900 text-white' : 'text-muted hover:text-foreground',
          )}
        >
          {l}
        </button>
      ))}
    </div>
  );
}

export function PortalHeader({ me }: { me: SevenxMember }) {
  const t = useT();
  const pathname = usePathname();
  const { logout, loading } = useLogout();
  const home = homeForRole(me.role);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/90 backdrop-blur">
      <div className="mx-auto flex h-14 w-full max-w-6xl items-center justify-between gap-3 px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href={home} className="flex items-center gap-2 font-semibold">
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-primary text-sm text-primary-foreground">
              7x
            </span>
            <span className="hidden sm:inline">{t('app.tagline')}</span>
          </Link>
          <nav className="flex items-center gap-1 text-sm">
            <Link
              href={home}
              className={cn(
                'rounded-md px-2.5 py-1.5',
                pathname === home ? 'bg-gray-100 font-medium' : 'text-muted hover:text-foreground',
              )}
            >
              {t('nav.dashboard')}
            </Link>
          </nav>
        </div>
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="hidden text-right sm:block">
            <p className="text-sm font-medium leading-tight">{memberFullName(me)}</p>
            <Badge tone={me.role === 'teacher' ? 'indigo' : 'blue'}>{t(`role.${me.role}`)}</Badge>
          </div>
          <LanguageSwitch />
          <Button variant="ghost" size="sm" loading={loading} onClick={() => logout()}>
            {t('common.logout')}
          </Button>
        </div>
      </div>
    </header>
  );
}
