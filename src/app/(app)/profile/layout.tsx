
import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return (
    <SharedLayout title="Portofelul meu" showBalance={true}>
      {children}
    </SharedLayout>
  );
}
