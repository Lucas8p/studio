
"use client";

import { useApp } from '@/hooks/use-app';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

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
                                    <TableRow key={bet.id}>
                                        <TableCell className="font-medium max-w-xs truncate">{pariu.title}</TableCell>
                                        <TableCell>{option.text}</TableCell>
                                        <TableCell className="text-right">{bet.amount.toFixed(2)} talanți</TableCell>
                                        <TableCell className="text-right">{bet.odds.toFixed(2)}</TableCell>
                                        <TableCell className="text-center">
                                            {pariu.status === 'open' && <Badge variant="secondary"><Hourglass className="mr-1 h-3 w-3"/>Activ</Badge>}
                                            {isWin && <Badge className="bg-green-500/20 text-green-700"><CheckCircle2 className="mr-1 h-3 w-3"/>Câștigat</Badge>}
                                            {isLoss && <Badge variant="destructive"><XCircle className="mr-1 h-3 w-3"/>Pierdut</Badge>}
                                        </TableCell>
                                        <TableCell className={`text-right font-bold ${isWin ? 'text-green-600' : isLoss ? 'text-destructive' : ''}`}>
                                            {resultAmount !== null ? `${resultAmount > 0 ? '+' : ''}${resultAmount.toFixed(2)} talanți` : 'N/A'}
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
                 </ScrollArea>
            </CardContent>
        </Card>
    );
}
