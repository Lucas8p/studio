
"use client";

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Home, LogOut, ShieldPlus, Wallet, History } from 'lucide-react';
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarInset,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useApp } from '@/hooks/use-app';
import { Logo } from '@/components/icons';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';
import { Leaderboard } from './leaderboard';

export function SharedLayout({ children, title, showBalance = false }: { children: ReactNode, title: string, showBalance?: boolean }) {
  const { balance, currentUser, logout, appName, slogan } = useApp();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router]);

  if (!currentUser) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-4">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    );
  }

  const handleLogout = () => {
    logout();
    router.push('/login');
  }

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0 bg-foreground text-background">
        <SidebarHeader>
          <Logo appName={appName} slogan={slogan} />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild variant="ghost" isActive={pathname === '/'}>
                <Link href="/">
                  <Home />
                  Pariuri
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/profile')}>
                <Link href="/profile">
                  <Wallet />
                  Portofelul meu
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/history')}>
                <Link href="/history">
                  <History />
                  Istoric
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {currentUser.isAdmin && (
                <SidebarMenuItem>
                <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/admin')}>
                    <Link href="/admin">
                    <ShieldPlus />
                    Panou Admin
                    </Link>
                </SidebarMenuButton>
                </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter className="flex flex-col gap-2">
            <div className="text-center text-sm text-primary-foreground/50">
                Conectat ca: <strong>{currentUser.id}</strong>
            </div>
            <Button variant="ghost" size="sm" onClick={handleLogout} className="text-primary-foreground/70 hover:text-primary-foreground hover:bg-white/10">
                <LogOut className="mr-2 h-4 w-4" />
                Deconectare
            </Button>
        </SidebarFooter>
      </Sidebar>
      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between border-b bg-background/80 backdrop-blur-sm px-4 md:px-6">
          <div className="flex items-center gap-4">
             <SidebarTrigger className="md:hidden" />
             <h1 className="text-xl font-semibold font-headline">{title}</h1>
          </div>
          {showBalance && (
            <div className="font-semibold text-lg">
              Balanță: <span className="text-accent-foreground font-bold font-headline">{balance.toFixed(2)} talanți</span>
            </div>
          )}
        </header>
         <div className="flex-1 p-4 md:p-6 grid grid-cols-1 lg:grid-cols-[1fr_320px] xl:grid-cols-[1fr_380px] gap-6 items-start">
            <main className="w-full">{children}</main>
            <aside className="hidden lg:block w-full">
              <Leaderboard />
            </aside>
          </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
