
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { useApp } from '@/hooks/use-app';
import { BettingCard } from '@/components/betting-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { CheckCircle2, XCircle, Hourglass, Skull, Sparkles, Wand2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getDailyAdvice, type DailyAdviceOutput, type DailyAdviceInput } from '@/ai/flows/daily-advice-flow';
import { Skeleton } from '@/components/ui/skeleton';


function DailyAdviceCard() {
  const [dailyAdvice, setDailyAdvice] = useState<DailyAdviceOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasAsked, setHasAsked] = useState(false);

  const handleGetAdvice = async () => {
    setIsLoading(true);
    setHasAsked(true);
    setDailyAdvice(null);
    try {
      // @ts-ignore
      const isSlowConnection = navigator.connection && ['slow-2g', '2g'].includes(navigator.connection.effectiveType);
      const input: DailyAdviceInput = { generateAudio: !isSlowConnection };
      const result = await getDailyAdvice(input);
      setDailyAdvice(result);
    } catch (error) {
      console.error("Error getting daily advice:", error);
      setDailyAdvice({
        text: "Spiritele sunt tulburi... O eroare neașteptată a întrerupt viziunea.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="border-accent/30 bg-accent/10">
      <CardHeader>
        <CardTitle className="flex items-center justify-center gap-2 text-center font-headline text-lg text-accent">
          <Wand2 className="h-5 w-5" />
          Sfatul Zilei
        </CardTitle>
      </CardHeader>
      <CardContent className="text-center space-y-4">
        {!hasAsked ? (
           <Button variant="outline" onClick={handleGetAdvice} className="bg-background/50">
              <Sparkles className="mr-2 h-4 w-4" />
              Primește îndrumare divină
            </Button>
        ) : isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-5 w-3/4 mx-auto" />
            <Skeleton className="h-10 w-full mx-auto" />
          </div>
        ) : dailyAdvice && (
          <>
            <p className="italic text-foreground/90">&ldquo;{dailyAdvice.text}&rdquo;</p>
            {dailyAdvice.audio && (
                <audio controls autoPlay className="w-full mx-auto">
                    <source src={dailyAdvice.audio} type="audio/wav" />
                    Browser-ul tău nu suportă elementul audio.
                </audio>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

function PactAdvertisement() {
  const { currentUser, pactControlEnabled } = useApp();

  if (!pactControlEnabled || !currentUser || currentUser.hasMadePact) {
    return null;
  }

  return (
    <Card className="bg-destructive/5 border-destructive/20 shadow-lg shadow-destructive/10">
      <CardHeader className="flex-row items-center gap-4 pb-4">
        <Skull className="h-12 w-12 flex-shrink-0 text-destructive animate-pulse" />
        <div>
          <CardTitle className="font-headline text-xl text-destructive">O Ofertă de Nerefuzat</CardTitle>
          <CardDescription className="text-destructive/80">Fonduri limitate? Acceptă semnul fiarei și încheie un pact pentru avere instantanee.</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="pb-4">
         <Button asChild className="w-full" variant="destructive">
            <Link href="/profile">
                <Skull className="mr-2 h-4 w-4" />
                Primește 666 T
            </Link>
        </Button>
      </CardContent>
    </Card>
  );
}

function FaithAdvertisement() {
  return (
    <Card className="border-primary/30 bg-primary/10">
      <CardHeader className="flex-row items-center gap-4 pb-4">
        <Sparkles className="h-8 w-8 flex-shrink-0 text-primary animate-pulse" />
        <div>
          <CardTitle className="text-lg text-primary">Un Test de Credință</CardTitle>
          <CardDescription className="text-primary/80">
            Domnul este cu tine, viteazule! Testează-ți credința și norocul cu un pariu la cele mai bune cote cerești de pe piață.
          </CardDescription>
        </div>
      </CardHeader>
    </Card>
  );
}

export default function HomePage() {
  const { pariuri, bets, currentUser } = useApp();

  const userBets = currentUser ? bets.filter(bet => bet.userId === currentUser.id) : [];
  const openPariuri = pariuri.filter(p => p.status === 'open');

  const activeUserBetsData = userBets
    .map(bet => {
      const pariu = pariuri.find(p => p.id === bet.pariuId);
      return pariu && pariu.status === 'open' ? { bet, pariu } : null;
    })
    .filter(Boolean);

  const pastUserBetsData = userBets
    .map(bet => {
      const pariu = pariuri.find(p => p.id === bet.pariuId);
      return pariu && pariu.status === 'closed' ? { bet, pariu } : null;
    })
    .filter(Boolean)
    .sort((a, b) => parseInt(b.bet.id) - parseInt(a.bet.id));

  const availableItems: React.ReactNode[] = [];
  const betCards = openPariuri.map(pariu => <BettingCard key={pariu.id} pariu={pariu} />);
  
  availableItems.push(<DailyAdviceCard key="daily-advice" />);

  if (betCards.length > 0) {
    betCards.splice(1, 0, <PactAdvertisement key="pact-ad" />);

    if(betCards.length > 4) {
      betCards.splice(4, 0, <FaithAdvertisement key="faith-ad" />);
    } else {
      betCards.push(<FaithAdvertisement key="faith-ad" />);
    }

    availableItems.push(...betCards);
  } else {
    availableItems.push(<PactAdvertisement key="pact-ad" />);
    availableItems.push(<FaithAdvertisement key="faith-ad" />);
    availableItems.push(
      <div key="empty-msg" className="flex items-center justify-center h-64 text-center text-muted-foreground md:col-span-1 xl:col-span-2 2xl:col-span-3">
        Cartea pariurilor este momentan goală. Spiritul va oferi noi oportunități în curând. Reveniți mai târziu!
      </div>
    );
  }
    
  return (
    <Tabs defaultValue="available" className="w-full">
      <TabsList className="grid h-auto w-full grid-cols-1 sm:h-10 sm:grid-cols-3">
        <TabsTrigger value="available">Pariuri Disponibile</TabsTrigger>
        <TabsTrigger value="active">Pariurile Mele Active</TabsTrigger>
        <TabsTrigger value="past">Istoric Pariuri</TabsTrigger>
      </TabsList>

      <TabsContent value="available">
        <ScrollArea className="h-[calc(100vh-12rem)]">
          <div className="p-1 pt-4">
             <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
              {availableItems}
            </div>
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="active">
        <ScrollArea className="h-[calc(100vh-12rem)]">
           <div className="p-1 pt-4">
            {activeUserBetsData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                Nu aveți niciun pariu activ. Plasați un pariu din secțiunea "Pariuri Disponibile".
              </div>
            ) : (
             <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                {activeUserBetsData.map(({ bet, pariu }) => (
                  <Card key={bet.id}>
                    <CardHeader>
                      <CardTitle className="font-headline text-lg leading-tight">{pariu.title}</CardTitle>
                      <CardDescription className="pt-2">Pariul tău: <span className="font-bold text-primary-foreground">{pariu.options[bet.optionIndex].text}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Suma pariată: <span className="font-bold text-primary-foreground">{bet.amount} T</span></div>
                        <div className="text-muted-foreground">Cotă: <span className="font-bold text-primary-foreground">{bet.odds.toFixed(2)}</span></div>
                    </CardContent>
                     <CardFooter>
                         <Badge variant="secondary" className="w-full justify-center">
                            <Hourglass className="mr-2 h-4 w-4" />
                            În desfășurare
                        </Badge>
                     </CardFooter>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
      
      <TabsContent value="past">
         <ScrollArea className="h-[calc(100vh-12rem)]">
           <div className="p-1 pt-4">
            {pastUserBetsData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                Nu aveți pariuri încheiate.
              </div>
            ) : (
             <div className="grid gap-6 md:grid-cols-1 xl:grid-cols-2 2xl:grid-cols-3">
                {pastUserBetsData.map(({ bet, pariu }) => {
                  const isWin = pariu.winningOptionIndex === bet.optionIndex;
                  const winnings = bet.amount * bet.odds;
                  return (
                    <Card key={bet.id} className={cn('transition-all', isWin ? 'win-glow' : 'loss-glow')}>
                      <CardHeader>
                        <CardTitle className="font-headline text-lg leading-tight">{pariu.title}</CardTitle>
                        <CardDescription className="pt-2">Pariul tău: <span className="font-bold text-primary-foreground">{pariu.options[bet.optionIndex].text}</span></CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">Suma pariată: <span className="font-bold text-primary-foreground">{bet.amount} T</span></div>
                          <div className="text-muted-foreground">Rezultat: <span className={cn('font-bold', isWin ? 'text-green-500' : 'text-destructive')}>{isWin ? `+${(winnings - bet.amount).toFixed(2)}` : `-${bet.amount.toFixed(2)}`} T</span></div>
                      </CardContent>
                      <CardFooter>
                        {isWin ? (
                            <Badge className="w-full justify-center bg-green-500/20 text-green-700 hover:bg-green-500/30">
                                <CheckCircle2 className="mr-2 h-4 w-4" />
                                Câștigat
                            </Badge>
                        ) : (
                            <Badge variant="destructive" className="w-full justify-center">
                                <XCircle className="mr-2 h-4 w-4" />
                                Pierdut
                            </Badge>
                        )}
                      </CardFooter>
                    </Card>
                  )
                })}
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>
    </Tabs>
  );
}
