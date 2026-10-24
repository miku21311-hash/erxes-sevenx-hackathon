'use client';

import type { ReactNode } from 'react';
import { RoleGuard } from '@/modules/auth/RoleGuard';

export default function TeacherLayout({ children }: { children: ReactNode }) {
  return <RoleGuard role="teacher">{children}</RoleGuard>;
}
