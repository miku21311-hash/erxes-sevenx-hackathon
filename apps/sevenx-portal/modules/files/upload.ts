import { UPLOAD_URL } from '@/modules/apollo/env';
import { readToken } from '@/modules/auth/session';
import type { SevenxAttachmentInput } from '@/modules/sevenx/types';

export const MAX_UPLOAD_BYTES = 20 * 1024 * 1024;

/**
 * Uploads one file to the erxes core-api REST endpoint
 * `POST {ERXES_API_URL}/upload-file?kind=main` (backend/core-api/src/routes/fileRoutes.ts).
 * The endpoint answers with the stored file URL/key as plain text.
 */
export const uploadFile = async (file: File): Promise<SevenxAttachmentInput> => {
  if (file.size > MAX_UPLOAD_BYTES) {
    throw new Error(`File too large (max ${MAX_UPLOAD_BYTES / 1024 / 1024} MB)`);
  }

  const body = new FormData();
  body.append('file', file);

  const token = readToken();

  const response = await fetch(`${UPLOAD_URL}?kind=main`, {
    method: 'POST',
    body,
    credentials: 'include',
    headers: token ? { 'client-auth-token': token } : undefined,
  });

  const text = (await response.text()).trim();

  if (!response.ok || !text) {
    throw new Error(text || `Upload failed (${response.status})`);
  }

  return { url: text, name: file.name, size: file.size, type: file.type || null };
};

export const readableSize = (bytes?: number | null): string => {
  if (!bytes) return '';
  return bytes >= 1024 * 1024
    ? `${(bytes / 1024 / 1024).toFixed(1)} MB`
    : `${Math.max(1, Math.round(bytes / 1024))} KB`;
};

/** Resolves a stored file key/URL into something the browser can open. */
export const attachmentHref = (url: string): string =>
  /^https?:\/\//.test(url)
    ? url
    : `${UPLOAD_URL.replace(/\/upload-file$/, '')}/read-file?key=${encodeURIComponent(url)}`;
