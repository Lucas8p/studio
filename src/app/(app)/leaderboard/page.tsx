
"use client";

import { useApp } from '@/hooks/use-app';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skull, Crown } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function LeaderboardPage() {
    const { users, currentUser } = useApp();
    if (!currentUser) return null;

    const sortedUsers = [...users].sort((a, b) => b.balance - a.balance);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Clasament</CardTitle>
                <CardDescription>Ierarhia pariorilor și a sufletelor damnate.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[calc(100vh-15rem)]">
                    <Table>
                        <TableHeader className="sticky top-0 bg-card">
                            <TableRow>
                                <TableHead>Utilizator</TableHead>
                                <TableHead className="text-right">Balanță</TableHead>
                                <TableHead className="text-center">Statut</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {sortedUsers.length > 0 ? sortedUsers.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium">
                                        <div className="flex items-center gap-2">
                                        {user.isAdmin && (
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Crown className="h-4 w-4 text-amber-500"/>
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Administrator</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        <span className="truncate">{user.id}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell className="text-right font-mono">{user.balance.toFixed(2)} T</TableCell>
                                    <TableCell className="text-center">
                                        {user.hasMadePact && (
                                            <TooltipProvider delayDuration={0}>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <Skull className="h-5 w-5 mx-auto text-destructive" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Pact Încheiat</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                    </TableCell>
                                </TableRow>
                            )) : (
                                <TableRow>
                                    <TableCell colSpan={3} className="text-center h-24 text-muted-foreground">
                                        Niciun utilizator înregistrat.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </ScrollArea>
            </CardContent>
        </Card>
    );
}
