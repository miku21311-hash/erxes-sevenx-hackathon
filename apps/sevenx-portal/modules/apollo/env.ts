export const API_URL: string = (
  process.env.NEXT_PUBLIC_ERXES_API_URL || 'http://localhost:4000'
).replace(/\/$/, '');

export const CP_TOKEN: string = process.env.NEXT_PUBLIC_ERXES_CP_TOKEN || '';

export const CLIENT_PORTAL_ID: string =
  process.env.NEXT_PUBLIC_CLIENT_PORTAL_ID || '';

export const GRAPHQL_URL = `${API_URL}/graphql`;

export const UPLOAD_URL = `${API_URL}/upload-file`;
