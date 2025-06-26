
import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <SharedLayout title="Panou Admin">
      {children}
    </SharedLayout>
  );
}
