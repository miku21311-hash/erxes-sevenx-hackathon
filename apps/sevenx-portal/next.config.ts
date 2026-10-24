import { fileURLToPath } from 'node:url';
import type { NextConfig } from 'next';

const apiUrl =
  process.env.NEXT_PUBLIC_ERXES_API_URL ||
  process.env.ERXES_API_URL ||
  'http://localhost:4000';

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_ERXES_API_URL: apiUrl.replace(/\/$/, ''),
  },
  // The app has its own lockfile inside the erxes monorepo; pin the root so
  // Turbopack does not pick the repository root.
  turbopack: {
    root: fileURLToPath(new URL('.', import.meta.url)),
  },
};

export default nextConfig;
