
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import type { ReactNode } from 'react';
import { Home, ShieldPlus, Wallet } from 'lucide-react';
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

export function SharedLayout({ children, title, showBalance = false }: { children: ReactNode, title: string, showBalance?: boolean }) {
  const { balance } = useApp();
  const pathname = usePathname();

  return (
    <SidebarProvider>
      <Sidebar className="border-r-0 bg-foreground text-background">
        <SidebarHeader>
          <Logo />
        </SidebarHeader>
        <SidebarContent>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild variant="ghost" isActive={pathname === '/'}>
                <Link href="/">
                  <Home />
                  Scenarii
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
             <SidebarMenuItem>
              <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/profile')}>
                <Link href="/profile">
                  <Wallet />
                  Portofelul Meu
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild variant="ghost" isActive={pathname.startsWith('/admin')}>
                <Link href="/admin">
                  <ShieldPlus />
                  Panou Admin
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarContent>
        <SidebarFooter>
            <div className="text-center text-sm text-primary-foreground/50">
                FaithBet &copy; 2024
            </div>
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
              Balanță: <span className="text-accent-foreground font-bold font-headline">${balance.toFixed(2)}</span>
            </div>
          )}
        </header>
        <main className="flex-1 p-4 md:p-6">{children}</main>
      </SidebarInset>
    </SidebarProvider>
  );
}
