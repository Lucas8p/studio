"use client";

import { useState, useEffect } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Skull } from 'lucide-react';

function PactCard() {
    const { addFunds, currentUser, pactControlEnabled } = useApp();
    const [amount, setAmount] = useState<number | ''>(pactControlEnabled ? 666 : 100);
    const { toast } = useToast();

    useEffect(() => {
        if (pactControlEnabled) {
            setAmount(666);
        }
    }, [pactControlEnabled]);

    const handlePact = () => {
        const pactAmount = pactControlEnabled ? 666 : (typeof amount === 'number' ? amount : 0);
        if (pactAmount > 0) {
            addFunds(pactAmount);
        } else {
            toast({ variant: 'destructive', title: 'Ofertă invalidă', description: 'Lordul Întunericului nu se lasă păcălit de sume neînsemnate.' });
        }
    };

    const isPactMade = pactControlEnabled && currentUser?.hasMadePact;

    if (isPactMade) {
        return (
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Pact cu Întunericul</CardTitle>
                </CardHeader>
                <CardContent className="text-center text-muted-foreground">
                    <p>Pactul a fost deja încheiat.</p>
                    <p className="text-sm">Sufletul tău este marcat.</p>
                </CardContent>
            </Card>
        )
    }

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
                            disabled={pactControlEnabled}
                        />
                    </div>
                     {pactControlEnabled && <p className="text-xs text-muted-foreground mt-1">Suma este fixată pentru acest ritual.</p>}
                </div>
                <Button onClick={handlePact} className="w-full" variant="destructive">
                    <Skull className="mr-2 h-4 w-4" />
                    Încheie Pactul
                </Button>
            </CardContent>
        </Card>
    )
}

export default function ProfilePage() {
    return (
        <div className="max-w-md mx-auto">
            <PactCard />
        </div>
    );
}
