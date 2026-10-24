'use client';

import { useRef, useState, type ChangeEvent } from 'react';
import { useT } from '@/modules/i18n/I18nProvider';
import { Button, useToast } from '@/modules/ui';
import type { SevenxAttachment, SevenxAttachmentInput } from '@/modules/sevenx/types';
import { attachmentHref, readableSize, uploadFile } from './upload';

export function AttachmentList({
  items,
  onRemove,
}: {
  items: Array<SevenxAttachment | SevenxAttachmentInput>;
  onRemove?: (index: number) => void;
}) {
  const t = useT();
  if (items.length === 0) return null;
  return (
    <ul className="flex flex-wrap gap-2">
      {items.map((item, index) => (
        <li
          key={`${item.url}-${index}`}
          className="flex max-w-full items-center gap-2 rounded-md border border-border bg-gray-50 px-2 py-1 text-xs"
        >
          <a
            href={attachmentHref(item.url)}
            target="_blank"
            rel="noreferrer"
            className="truncate text-primary hover:underline"
            title={item.name}
          >
            {item.name}
          </a>
          {item.size ? <span className="text-muted">{readableSize(item.size)}</span> : null}
          {onRemove && (
            <button
              type="button"
              onClick={() => onRemove(index)}
              aria-label={t('common.remove')}
              className="text-muted hover:text-danger"
            >
              ×
            </button>
          )}
        </li>
      ))}
    </ul>
  );
}

export function AttachmentPicker({
  value,
  onChange,
  disabled,
}: {
  value: SevenxAttachmentInput[];
  onChange: (next: SevenxAttachmentInput[]) => void;
  disabled?: boolean;
}) {
  const t = useT();
  const toast = useToast();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);

  const onPick = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploading(true);
    const uploaded: SevenxAttachmentInput[] = [];
    for (const file of files) {
      try {
        uploaded.push(await uploadFile(file));
      } catch (err) {
        toast.error(`${t('common.uploadFailed')}: ${(err as Error).message}`);
      }
    }
    setUploading(false);
    if (uploaded.length > 0) onChange([...value, ...uploaded]);
  };

  return (
    <div className="space-y-2">
      <AttachmentList
        items={value}
        onRemove={(index) => onChange(value.filter((_, i) => i !== index))}
      />
      <input
        ref={inputRef}
        type="file"
        multiple
        className="hidden"
        onChange={onPick}
        disabled={disabled || uploading}
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        loading={uploading}
        disabled={disabled}
        onClick={() => inputRef.current?.click()}
      >
        {uploading ? t('common.uploading') : t('common.addFile')}
      </Button>
    </div>
  );
}
