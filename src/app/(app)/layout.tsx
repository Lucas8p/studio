
"use client";

import type { ReactNode } from 'react';
import { SharedLayout } from '@/components/shared-layout';
import { useApp } from '@/hooks/use-app';

export default function AppLayout({ children }: { children: ReactNode }) {
  const { appName } = useApp();
  return (
    <SharedLayout title="Pariuri" showBalance={true}>
      {children}
    </SharedLayout>
  );
}
