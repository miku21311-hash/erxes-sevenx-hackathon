'use client';

import type { ReactNode } from 'react';
import { cn } from './cn';

export type TabItem<K extends string> = {
  key: K;
  label: ReactNode;
  badge?: number;
};

export function Tabs<K extends string>({
  items,
  value,
  onChange,
  variant = 'underline',
}: {
  items: Array<TabItem<K>>;
  value: K;
  onChange: (key: K) => void;
  variant?: 'underline' | 'pills';
}) {
  return (
    <div
      role="tablist"
      className={cn(
        'flex gap-1 overflow-x-auto',
        variant === 'underline' && 'border-b border-border',
        variant === 'pills' && 'rounded-lg bg-gray-100 p-1',
      )}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            role="tab"
            type="button"
            aria-selected={active}
            onClick={() => onChange(item.key)}
            className={cn(
              'flex items-center gap-2 whitespace-nowrap px-4 text-sm font-medium transition-colors',
              variant === 'underline' &&
                cn(
                  '-mb-px border-b-2 py-2.5',
                  active
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted hover:text-foreground',
                ),
              variant === 'pills' &&
                cn(
                  'flex-1 justify-center rounded-md py-2',
                  active ? 'bg-card shadow-sm' : 'text-muted hover:text-foreground',
                ),
            )}
          >
            {item.label}
            {item.badge !== undefined && item.badge > 0 && (
              <span className="rounded-full bg-primary px-1.5 text-xs text-primary-foreground">
                {item.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
