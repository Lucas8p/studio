
"use client";

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Banknote } from 'lucide-react';

export default function ProfilePage() {
    const { addFunds } = useApp();
    const [amount, setAmount] = useState<number | ''>(100);
    const { toast } = useToast();

    const handleAddFunds = () => {
        if (typeof amount === 'number' && amount > 0) {
            addFunds(amount);
            toast({ title: 'Fonduri Adăugate!', description: `Ai adăugat cu succes ${amount.toFixed(2)} $ în contul tău.`});
        } else {
            toast({ variant: 'destructive', title: 'Sumă Invalidă', description: 'Te rog introdu un număr pozitiv.' });
        }
    };

    return (
        <div className="max-w-md mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Adaugă Fonduri în Portofel</CardTitle>
                    <CardDescription>Alimentează-ți balanța pentru a continua să plasezi pariuri binecuvântate.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div>
                        <label htmlFor="amount" className="text-sm font-medium text-muted-foreground">Sumă</label>
                        <div className="relative mt-1">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
                            <Input
                                id="amount"
                                type="number"
                                placeholder="ex., 100"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
                                className="pl-7"
                                min="1"
                            />
                        </div>
                    </div>
                    <Button onClick={handleAddFunds} className="w-full">
                        <Banknote className="mr-2 h-4 w-4" />
                        Adaugă Fonduri
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
