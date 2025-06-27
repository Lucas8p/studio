
import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';

export default function OracleLayout({ children }: { children: ReactNode }) {
  return (
    <SharedLayout title="Oracolul" showBalance={true}>
      {children}
    </SharedLayout>
  );
}

    