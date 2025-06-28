
"use client";

import { useApp } from '@/hooks/use-app';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

export default function HistoryPage() {
    const { bets, pariuri, currentUser } = useApp();
    if (!currentUser) return null;

    const userBets = bets.filter(bet => bet.userId === currentUser.id).sort((a, b) => parseInt(b.id) - parseInt(a.id));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Istoric Analitic</CardTitle>
                <CardDescription>O privire detaliată asupra tuturor pariurilor tale, trecute și prezente.</CardDescription>
            </CardHeader>
            <CardContent>
                <ScrollArea className="h-[calc(100vh-15rem)]">
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4 p-1">
                        {userBets.length > 0 ? userBets.map(bet => {
                             const pariu = pariuri.find(p => p.id === bet.pariuId);
                             if (!pariu) return null;
                             const option = pariu.options[bet.optionIndex];
                             const isWin = pariu.status === 'closed' && pariu.winningOptionIndex === bet.optionIndex;
                             const isLoss = pariu.status === 'closed' && pariu.winningOptionIndex !== bet.optionIndex;
                             const resultAmount = isWin ? (bet.amount * bet.odds) - bet.amount : isLoss ? -bet.amount : null;

                            return (
                                <Card key={bet.id} className={cn('overflow-hidden', isWin && 'win-glow', isLoss && 'loss-glow')}>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-base">{pariu.title}</CardTitle>
                                        <CardDescription>
                                            Pariul tău: <span className="font-semibold text-foreground">{option.text}</span>
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Sumă:</span>
                                            <span>{bet.amount.toFixed(2)} T</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-muted-foreground">Cotă:</span>
                                            <span>{bet.odds.toFixed(2)}</span>
                                        </div>
                                        <Separator/>
                                         <div className="flex justify-between items-center pt-1">
                                            <span className="text-muted-foreground">Rezultat:</span>
                                            <span className={`font-bold ${isWin ? 'text-green-600' : isLoss ? 'text-destructive' : ''}`}>
                                                {resultAmount !== null ? `${resultAmount > 0 ? '+' : ''}${resultAmount.toFixed(2)} T` : 'N/A'}
                                            </span>
                                        </div>
                                    </CardContent>
                                    <CardFooter className="p-0">
                                        {pariu.status === 'open' && <Badge variant="secondary" className="w-full justify-center rounded-none rounded-b-lg h-8"><Hourglass className="mr-1 h-3 w-3"/>Activ</Badge>}
                                        {isWin && <Badge className="w-full justify-center rounded-none rounded-b-lg h-8 bg-green-500/20 text-green-700"><CheckCircle2 className="mr-1 h-3 w-3"/>Câștigat</Badge>}
                                        {isLoss && <Badge variant="destructive" className="w-full justify-center rounded-none rounded-b-lg h-8"><XCircle className="mr-1 h-3 w-3"/>Pierdut</Badge>}
                                    </CardFooter>
                                </Card>
                            )
                        }) : (
                             <div className="text-center h-24 text-muted-foreground flex items-center justify-center">
                                Nu ai plasat niciun pariu încă.
                            </div>
                        )}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader className="sticky top-0 bg-card">
                                <TableRow>
                                    <TableHead>Pariu</TableHead>
                                    <TableHead>Pariul Tău</TableHead>
                                    <TableHead className="text-right">Sumă</TableHead>
                                    <TableHead className="text-right">Cotă</TableHead>
                                    <TableHead className="text-center">Status</TableHead>
                                    <TableHead className="text-right">Rezultat</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {userBets.length > 0 ? userBets.map(bet => {
                                    const pariu = pariuri.find(p => p.id === bet.pariuId);
                                    if (!pariu) return null;
                                    const option = pariu.options[bet.optionIndex];
                                    const isWin = pariu.status === 'closed' && pariu.winningOptionIndex === bet.optionIndex;
                                    const isLoss = pariu.status === 'closed' && pariu.winningOptionIndex !== bet.optionIndex;
                                    const resultAmount = isWin ? (bet.amount * bet.odds) - bet.amount : isLoss ? -bet.amount : null;

                                    return (
                                        <TableRow key={bet.id} className={cn(isWin && 'win-glow', isLoss && 'loss-glow')}>
                                            <TableCell className="font-medium max-w-xs truncate">{pariu.title}</TableCell>
                                            <TableCell>{option.text}</TableCell>
                                            <TableCell className="text-right">{bet.amount.toFixed(2)} T</TableCell>
                                            <TableCell className="text-right">{bet.odds.toFixed(2)}</TableCell>
                                            <TableCell className="text-center">
                                                {pariu.status === 'open' && <Badge variant="secondary"><Hourglass className="mr-1 h-3 w-3"/>Activ</Badge>}
                                                {isWin && <Badge className="bg-green-500/20 text-green-700"><CheckCircle2 className="mr-1 h-3 w-3"/>Câștigat</Badge>}
                                                {isLoss && <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Pierdut</Badge>}
                                            </TableCell>
                                            <TableCell className={`text-right font-bold ${isWin ? 'text-green-600' : isLoss ? 'text-destructive' : ''}`}>
                                                {resultAmount !== null ? `${resultAmount > 0 ? '+' : ''}${resultAmount.toFixed(2)} T` : 'N/A'}
                                            </TableCell>
                                        </TableRow>
                                    );
                                }) : (
                                    <TableRow>
                                        <TableCell colSpan={6} className="text-center h-24 text-muted-foreground">
                                            Nu ai plasat niciun pariu încă.
                                        </TableCell>
                                    </TableRow>
                                )}
                            </TableBody>
                        </Table>
                    </div>
                 </ScrollArea>
            </CardContent>
        </Card>
    );
}
