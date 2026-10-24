const TOKEN_KEY = 'sevenx.token';
const ROLE_KEY = 'sevenx.role';

export type PortalRole = 'teacher' | 'student';

const storage = (): Storage | null => {
  try {
    return typeof window === 'undefined' ? null : window.localStorage;
  } catch {
    return null;
  }
};

export const readToken = (): string | null => storage()?.getItem(TOKEN_KEY) ?? null;

export const writeToken = (token: string | null): void => {
  const s = storage();
  if (!s) return;
  if (token) s.setItem(TOKEN_KEY, token);
  else s.removeItem(TOKEN_KEY);
};

export const readRole = (): PortalRole | null => {
  const value = storage()?.getItem(ROLE_KEY);
  return value === 'teacher' || value === 'student' ? value : null;
};

export const writeRole = (role: PortalRole | null): void => {
  const s = storage();
  if (!s) return;
  if (role) s.setItem(ROLE_KEY, role);
  else s.removeItem(ROLE_KEY);
};

export const clearSession = (): void => {
  writeToken(null);
  writeRole(null);
};

/** Extracts the JWT from the JSON returned by clientPortalUserLoginWithCredentials. */
export const tokenFromLoginResult = (result: unknown): string | null => {
  if (typeof result === 'string') return result || null;
  if (result && typeof result === 'object' && 'token' in result) {
    const token = (result as { token?: unknown }).token;
    return typeof token === 'string' && token ? token : null;
  }
  return null;
};

export const homeForRole = (role: PortalRole): string =>
  role === 'teacher' ? '/t' : '/s';
