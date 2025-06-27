"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider, type InitialData } from '@/contexts/app-context';
import { useApp } from '@/hooks/use-app';
import { useEffect } from 'react';

function AppTitleUpdater() {
  const { appName, slogan } = useApp();
  useEffect(() => {
    document.title = `${appName} - ${slogan}`;
  }, [appName, slogan]);
  return null;
}


export function ClientLayout({
  children,
  initialData,
}: Readonly<{
  children: React.ReactNode;
  initialData: InitialData;
}>) {
  return (
    <AppProvider initialData={initialData}>
      <AppTitleUpdater />
      {children}
      <Toaster />
    </AppProvider>
  );
}
