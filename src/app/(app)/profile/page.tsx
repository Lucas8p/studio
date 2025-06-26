
"use client";

import { useState } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skull } from 'lucide-react';

export default function ProfilePage() {
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
        <div className="max-w-md mx-auto">
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
        </div>
    );
}
