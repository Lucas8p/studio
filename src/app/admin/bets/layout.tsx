
import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';

export default function AdminBetsLayout({ children }: { children: ReactNode }) {
  return (
    <SharedLayout title="Gestiune Pariuri" showBalance={false}>
      {children}
    </SharedLayout>
  );
}
