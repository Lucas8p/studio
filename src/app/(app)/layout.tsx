
import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';

export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <SharedLayout title="Welcome to FaithBet Fun" showBalance={true}>
      {children}
    </SharedLayout>
  );
}
