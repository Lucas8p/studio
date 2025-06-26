
"use client";

import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { AppProvider } from '@/contexts/app-context';
import { useApp } from '@/hooks/use-app';
import { useEffect } from 'react';

function AppTitleUpdater() {
  const { appName } = useApp();
  useEffect(() => {
    document.title = `${appName} - Pariază cu credință`;
  }, [appName]);
  return null;
}


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ro" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-body antialiased">
        <AppProvider>
          <AppTitleUpdater />
          {children}
          <Toaster />
        </AppProvider>
      </body>
    </html>
  );
}
