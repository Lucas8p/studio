
"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useApp } from '@/hooks/use-app';
import type { Pariu } from '@/contexts/app-context';
import { HandCoins } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface BettingCardProps {
  pariu: Pariu;
}

export function BettingCard({ pariu }: BettingCardProps) {
  const { placeBet, balance } = useApp();
  const [amount, setAmount] = useState<number | ''>('');
  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();

  const handlePlaceBet = () => {
    if (selectedOption === null) {
      toast({ variant: 'destructive', title: 'Nicio opțiune selectată', description: 'Te rog alege un rezultat pe care să pariezi.' });
      return;
    }
    if (amount === '' || amount <= 0) {
      toast({ variant: 'destructive', title: 'Sumă invalidă', description: 'Te rog introdu o sumă validă pentru a paria.' });
      return;
    }
    if (amount > balance) {
       toast({ variant: 'destructive', title: 'Fonduri Insuficiente', description: 'Nu ai suficientă balanță pentru a plasa acest pariu.' });
      return;
    }
    
    setIsProcessing(true);
    try {
        placeBet(pariu.id, selectedOption, amount);
        setSelectedOption(null);
        setAmount('');
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <Card className="flex flex-col relative overflow-hidden transition-all hover:shadow-lg">
      <CardHeader>
        <CardTitle className="font-headline text-lg leading-tight">{pariu.title}</CardTitle>
        <CardDescription className="pt-2">{pariu.description}</CardDescription>
      </CardHeader>
      <CardContent className="flex-grow space-y-4">
        <div className="grid grid-cols-2 gap-2">
          {pariu.options.map((option, index) => (
            <Button
              key={index}
              variant={selectedOption === index ? 'default' : 'secondary'}
              onClick={() => setSelectedOption(index)}
              className="h-auto py-2 whitespace-normal text-sm flex-col"
              disabled={isProcessing}
            >
              <span>{option.text}</span>
              <span className="text-xs opacity-80">(Cotă: {option.odds.toFixed(2)})</span>
            </Button>
          ))}
        </div>
      </CardContent>
      <CardFooter className="flex items-center gap-2">
        <div className="relative flex-grow">
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">$</span>
          <Input
            type="number"
            placeholder="Sumă Pariu"
            value={amount}
            onChange={(e) => setAmount(e.target.value === '' ? '' : parseFloat(e.target.value))}
            className="pl-6"
            disabled={isProcessing}
            min="1"
          />
        </div>
        <Button onClick={handlePlaceBet} disabled={isProcessing}>
          <HandCoins className="mr-2 h-4 w-4" />
          {isProcessing ? 'Se plasează...' : 'Plasează Pariu'}
        </Button>
      </CardFooter>
    </Card>
  );
}
