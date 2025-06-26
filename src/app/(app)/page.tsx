
"use client";

import { useApp } from '@/hooks/use-app';
import { BettingCard } from '@/components/betting-card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, XCircle, Hourglass } from 'lucide-react';

export default function HomePage() {
  const { scenarios, bets, currentUser } = useApp();

  const userBets = currentUser ? bets.filter(bet => bet.userId === currentUser.id) : [];
  const openScenarios = scenarios.filter(s => s.status === 'open');

  const activeUserBetsData = userBets
    .map(bet => {
      const scenario = scenarios.find(s => s.id === bet.scenarioId);
      return scenario && scenario.status === 'open' ? { bet, scenario } : null;
    })
    .filter(Boolean);

  const pastUserBetsData = userBets
    .map(bet => {
      const scenario = scenarios.find(s => s.id === bet.scenarioId);
      return scenario && scenario.status === 'closed' ? { bet, scenario } : null;
    })
    .filter(Boolean)
    .sort((a, b) => parseInt(b.bet.id) - parseInt(a.bet.id));
    
  return (
    <Tabs defaultValue="available" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="available">Pariuri Disponibile</TabsTrigger>
        <TabsTrigger value="active">Pariurile Mele Active</TabsTrigger>
        <TabsTrigger value="past">Istoric Pariuri</TabsTrigger>
      </TabsList>

      <TabsContent value="available">
        <ScrollArea className="h-[calc(100vh-10rem)]">
          <div className="p-1 pt-4">
            {openScenarios.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                Cartea scenariilor este momentan goală. Spiritul va oferi noi oportunități în curând. Reveniți mai târziu!
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {openScenarios.map(scenario => (
                  <BettingCard key={scenario.id} scenario={scenario} />
                ))}
              </div>
            )}
          </div>
        </ScrollArea>
      </TabsContent>

      <TabsContent value="active">
        <ScrollArea className="h-[calc(100vh-10rem)]">
           <div className="p-1 pt-4">
            {activeUserBetsData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                Nu aveți niciun pariu activ. Plasați un pariu din secțiunea "Pariuri Disponibile".
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {activeUserBetsData.map(({ bet, scenario }) => (
                  <Card key={bet.id}>
                    <CardHeader>
                      <CardTitle className="font-headline text-lg leading-tight">{scenario.title}</CardTitle>
                      <CardDescription className="pt-2">Pariul tău: <span className="font-bold text-primary-foreground">{scenario.options[bet.optionIndex].text}</span></CardDescription>
                    </CardHeader>
                    <CardContent className="flex items-center justify-between text-sm">
                        <div className="text-muted-foreground">Suma pariată: <span className="font-bold text-primary-foreground">{bet.amount} talanți</span></div>
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
         <ScrollArea className="h-[calc(100vh-10rem)]">
           <div className="p-1 pt-4">
            {pastUserBetsData.length === 0 ? (
              <div className="flex items-center justify-center h-64 text-center text-muted-foreground">
                Nu aveți pariuri încheiate.
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
                {pastUserBetsData.map(({ bet, scenario }) => {
                  const isWin = scenario.winningOptionIndex === bet.optionIndex;
                  const winnings = bet.amount * bet.odds;
                  return (
                    <Card key={bet.id} className={isWin ? 'border-green-500/50' : 'border-destructive/50'}>
                      <CardHeader>
                        <CardTitle className="font-headline text-lg leading-tight">{scenario.title}</CardTitle>
                        <CardDescription className="pt-2">Pariul tău: <span className="font-bold text-primary-foreground">{scenario.options[bet.optionIndex].text}</span></CardDescription>
                      </CardHeader>
                      <CardContent className="flex items-center justify-between text-sm">
                          <div className="text-muted-foreground">Suma pariată: <span className="font-bold text-primary-foreground">{bet.amount} talanți</span></div>
                          <div className="text-muted-foreground">Rezultat: <span className={isWin ? 'text-green-600 font-bold' : 'text-destructive font-bold'}>{isWin ? `+${(winnings - bet.amount).toFixed(2)}` : `-${bet.amount.toFixed(2)}`} talanți</span></div>
                      </CardContent>
                      <CardFooter>
                        {isWin ? (
                            <Badge className="w-full justify-center bg-green-500/20 text-green-700 hover:bg-green-500/30 border-green-500/50">
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
