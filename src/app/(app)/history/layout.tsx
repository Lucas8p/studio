
import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return (
    <SharedLayout title="Istoric Pariuri" showBalance={true}>
      {children}
    </SharedLayout>
  );
}
