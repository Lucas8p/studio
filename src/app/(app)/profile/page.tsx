
"use client";

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skull, CheckCircle2, XCircle, Hourglass } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

function PactCard() {
    const { addFunds } = useApp();
    const [amount, setAmount] = useState<number | ''>(666);
    const { toast } = useToast();

    const handlePact = () => {
        if (typeof amount === 'number' && amount > 0) {
            addFunds(amount);
            toast({ title: 'Pact încheiat!', description: `Ai primit ${amount.toFixed(2)} talanți... dar cu ce preț?`});
        } else {
            toast({ variant: 'destructive', title: 'Ofertă invalidă', description: 'Lordul Întunericului nu se lasă păcălit de sume neînsemnate.' });
        }
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Pact cu Întunericul</CardTitle>
                <CardDescription>Vinde o bucată din sufletul tău pentru avere și putere de pariere nelimitată.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div>
                    <label htmlFor="amount" className="text-sm font-medium text-muted-foreground">Valoarea sufletului tău</label>
                    <div className="relative mt-1">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">T</span>
                        <Input
                            id="amount"
                            type="number"
                            placeholder="ex., 666"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                            className="pl-8"
                            min="1"
                        />
                    </div>
                </div>
                <Button onClick={handlePact} className="w-full" variant="destructive">
                    <Skull className="mr-2 h-4 w-4" />
                    Încheie Pactul
                </Button>
            </CardContent>
        </Card>
    )
}

function HistoryTab() {
    const { bets, scenarios, currentUser } = useApp();
    if (!currentUser) return null;

    const userBets = bets.filter(bet => bet.userId === currentUser.id).sort((a, b) => parseInt(b.id) - parseInt(a.id));

    return (
        <Card>
            <CardHeader>
                <CardTitle>Istoric Analitic</CardTitle>
                <CardDescription>O privire detaliată asupra tuturor pariurilor tale, trecute și prezente.</CardDescription>
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Scenariu</TableHead>
                            <TableHead>Pariul Tău</TableHead>
                            <TableHead className="text-right">Sumă</TableHead>
                            <TableHead className="text-right">Cotă</TableHead>
                            <TableHead className="text-center">Status</TableHead>
                            <TableHead className="text-right">Rezultat</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {userBets.length > 0 ? userBets.map(bet => {
                            const scenario = scenarios.find(s => s.id === bet.scenarioId);
                            if (!scenario) return null;
                            const option = scenario.options[bet.optionIndex];
                            const isWin = scenario.status === 'closed' && scenario.winningOptionIndex === bet.optionIndex;
                            const isLoss = scenario.status === 'closed' && scenario.winningOptionIndex !== bet.optionIndex;
                            const resultAmount = isWin ? (bet.amount * bet.odds) - bet.amount : isLoss ? -bet.amount : null;

                            return (
                                <TableRow key={bet.id}>
                                    <TableCell className="font-medium max-w-xs truncate">{scenario.title}</TableCell>
                                    <TableCell>{option.text}</TableCell>
                                    <TableCell className="text-right">{bet.amount.toFixed(2)} T</TableCell>
                                    <TableCell className="text-right">{bet.odds.toFixed(2)}</TableCell>
                                    <TableCell className="text-center">
                                        {scenario.status === 'open' && <Badge variant="secondary"><Hourglass className="mr-1 h-3 w-3"/>Activ</Badge>}
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
            </CardContent>
        </Card>
    );
}


export default function ProfilePage() {
    return (
        <div className="max-w-4xl mx-auto">
             <Tabs defaultValue="pact">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="pact">Pact cu Întunericul</TabsTrigger>
                    <TabsTrigger value="history">Istoric Analitic</TabsTrigger>
                </TabsList>
                <TabsContent value="pact" className="mt-4">
                    <div className="max-w-md mx-auto">
                        <PactCard />
                    </div>
                </TabsContent>
                <TabsContent value="history" className="mt-4">
                   <HistoryTab />
                </TabsContent>
            </Tabs>
        </div>
    );
}
