
"use client";

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ReactNode, useEffect } from 'react';
import { Home, LogOut, ShieldPlus, Wallet, History, Trophy, MessageSquareQuote } from 'lucide-react';
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
  useSidebar,
} from '@/components/ui/sidebar';
import { useApp } from '@/hooks/use-app';
import { Logo } from '@/components/icons';
import { Button } from './ui/button';
import { Skeleton } from './ui/skeleton';

function NavMenu() {
  const { currentUser, appName, slogan } = useApp();
  const { setOpenMobile } = useSidebar();

  const handleLinkClick = () => {
    setOpenMobile(false);
  };

  // This is a simplified example. In a real app, you would have a more robust routing and navigation system.
  // We'll use the pathname to determine the active link.
  const [pathname, setPathname] = React.useState('');
  useEffect(() => {
    if (typeof window !== 'undefined') {
      setPathname(window.location.pathname);
    }
  }, []);

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton asChild variant="ghost" isActive={pathname === '/'}>
          <Link href="/" onClick={handleLinkClick}>
            <Home />
            Pariuri
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/oracle')}>
          <Link href="/oracle" onClick={handleLinkClick}>
            <MessageSquareQuote />
            Oracolul
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
       <SidebarMenuItem>
        <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/profile')}>
          <Link href="/profile" onClick={handleLinkClick}>
            <Wallet />
            Portofelul meu
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/history')}>
          <Link href="/history" onClick={handleLinkClick}>
            <History />
            Istoric
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      <SidebarMenuItem>
        <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/leaderboard')}>
          <Link href="/leaderboard" onClick={handleLinkClick}>
            <Trophy />
            Clasament
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
      {currentUser?.isAdmin && (
          <SidebarMenuItem>
          <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/admin')}>
              <Link href="/admin" onClick={handleLinkClick}>
              <ShieldPlus />
              Panou Admin
              </Link>
          </SidebarMenuButton>
          </SidebarMenuItem>
      )}
    </SidebarMenu>
  );
}

export function SharedLayout({ children, title, showBalance = false }: { children: ReactNode, title: string, showBalance?: boolean }) {
  const { balance, currentUser, logout, appName, slogan, isLoading } = useApp();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !currentUser) {
      router.replace('/login');
    }
  }, [currentUser, router, isLoading]);

  if (isLoading || !currentUser) {
    return (
        <div className="flex h-screen items-center justify-center bg-background">
            <div className="w-full max-w-md space-y-4 p-4">
                <div className="flex items-center gap-4">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div className="space-y-2">
                        <Skeleton className="h-4 w-[250px]" />
                        <Skeleton className="h-4 w-[200px]" />
                    </div>
                </div>
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-32 w-full" />
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
      <Sidebar className="border-r-0 bg-secondary text-secondary-foreground">
        <SidebarHeader>
          <Logo appName={appName} slogan={slogan} />
        </SidebarHeader>
        <SidebarContent>
          <NavMenu />
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
        <header className="sticky top-0 z-10 flex h-16 items-center justify-between gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
          <div className="flex items-center gap-4 overflow-hidden">
            <SidebarTrigger className="flex-shrink-0 md:hidden" />
            <h1 className="truncate text-lg font-semibold font-headline sm:text-xl">{title}</h1>
          </div>
          {showBalance && (
            <div className="flex-shrink-0 font-semibold text-right text-sm sm:text-base md:text-lg">
              <span className="hidden sm:inline">Balanță: </span>
              <span className="font-bold font-headline text-accent flex items-center gap-2">
                {balance.toFixed(2)}
                <span className="hidden sm:inline"> talanți</span>
                <span className="sm:hidden"> T</span>
              </span>
            </div>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6">
            {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

    
