'use client';

import type { ReactNode } from 'react';
import { useT } from '@/modules/i18n/I18nProvider';
import { Button } from './Button';

export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-primary ${className ?? ''}`}
    />
  );
}

export function LoadingState({ label }: { label?: string }) {
  const t = useT();
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-muted">
      <Spinner />
      {label ?? t('common.loading')}
    </div>
  );
}

export function EmptyState({
  title,
  description,
  action,
}: {
  title?: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
}) {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <p className="text-sm font-medium">{title ?? t('common.empty')}</p>
      {description && <p className="max-w-sm text-sm text-muted">{description}</p>}
      {action}
    </div>
  );
}

export function ErrorState({
  message,
  onRetry,
}: {
  message?: string;
  onRetry?: () => void;
}) {
  const t = useT();
  return (
    <div className="flex flex-col items-center justify-center gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-8 text-center">
      <p className="text-sm font-medium text-red-800">{t('common.error')}</p>
      {message && <p className="max-w-md break-words text-xs text-red-700">{message}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry}>
          {t('common.retry')}
        </Button>
      )}
    </div>
  );
}
