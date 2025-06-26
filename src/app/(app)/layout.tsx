
import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SharedLayout title="Bun venit la FaithBet" showBalance={true}>
      {children}
    </SharedLayout>
  );
}
