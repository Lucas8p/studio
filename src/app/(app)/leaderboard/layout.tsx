
import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';

export default function LeaderboardLayout({ children }: { children: ReactNode }) {
  return (
    <SharedLayout title="Clasament" showBalance={true}>
      {children}
    </SharedLayout>
  );
}
