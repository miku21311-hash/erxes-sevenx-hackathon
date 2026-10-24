'use client';

import { createContext, useContext, type ReactNode } from 'react';
import type { SevenxMember } from '@/modules/sevenx/types';

const MeContext = createContext<SevenxMember | null>(null);

export function MeProvider({ me, children }: { me: SevenxMember; children: ReactNode }) {
  return <MeContext.Provider value={me}>{children}</MeContext.Provider>;
}

export const useCurrentMember = (): SevenxMember => {
  const me = useContext(MeContext);
  if (!me) throw new Error('useCurrentMember must be used inside RoleGuard');
  return me;
};
