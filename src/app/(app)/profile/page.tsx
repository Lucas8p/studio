
"use client";

import { useState, useEffect } from 'react';
import { useApp } from '@/hooks/use-app';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { Baby, BadgeCheck, Eye, Frown, Skull, TrendingUp } from 'lucide-react';
import type { AchievementID } from '@/contexts/app-context';
import type { Icon as LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Area, AreaChart, CartesianGrid, ResponsiveContainer, XAxis, YAxis, Tooltip as ChartTooltip } from 'recharts';
import { ChartConfig, ChartContainer } from '@/components/ui/chart';

const achievementDetails: Record<AchievementID, { name: string, description: string, Icon: LucideIcon }> = {
    'NOVICE': { name: "Novicele Credincios", description: "Ai plasat primul tău pariu. Calea spre glorie a început!", Icon: Baby },
    'PACT_MAKER': { name: "Semnul Fiarei", description: "Ai făcut un pact cu întunericul pentru 666 talanți.", Icon: Skull },
    'PROPHET': { name: "Profetul", description: "Ai câștigat un pariu cu o cotă mai mare de 5. Viziunile tale sunt clare.", Icon: Eye },
    'JOB': { name: "Iov Modern", description: "Ai pierdut 5 pariuri la rând. Răbdarea îți este pusă la încercare.", Icon: Frown },
    'STREAK': { name: "Mana Cerească", description: "Ai câștigat 3 pariuri la rând. Norocul îți surâde!", Icon: TrendingUp }
};

const chartConfig = {
    balance: {
        label: "Balanță",
        color: "hsl(var(--primary))",
    },
} satisfies ChartConfig;

function BalanceChart() {
    const { currentUser } = useApp();
    if (!currentUser || currentUser.balanceHistory.length < 2) {
        return (
             <div className="h-64 flex items-center justify-center text-muted-foreground text-center p-4">
                Date insuficiente pentru a afișa graficul. Istoricul balanței tale va apărea aici după ce vei interacționa mai mult cu platforma.
            </div>
        )
    }
    
    const chartData = currentUser.balanceHistory.map(entry => ({
        date: new Date(entry.date).toLocaleDateString('ro-RO'),
        balance: entry.balance
    }));

    return (
        <ChartContainer config={chartConfig} className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                    <defs>
                        <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0}/>
                        </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border) / 0.5)" />
                    <XAxis dataKey="date" tickLine={false} axisLine={false} tickMargin={8} fontSize={12} />
                    <YAxis tickLine={false} axisLine={false} tickMargin={8} fontSize={12} tickFormatter={(value) => `${value} T`}/>
                    <ChartTooltip
                        cursor={false}
                        content={({ active, payload }) => {
                            if (active && payload && payload.length) {
                                return (
                                <div className="rounded-lg border bg-background p-2 shadow-sm">
                                    <div className="grid grid-cols-2 gap-2">
                                    <div className="flex flex-col">
                                        <span className="text-[0.70rem] uppercase text-muted-foreground">
                                        Balanță
                                        </span>
                                        <span className="font-bold text-foreground">
                                        {payload[0].value} T
                                        </span>
                                    </div>
                                    </div>
                                </div>
                                )
                            }
                            return null
                        }}
                    />
                    <Area type="monotone" dataKey="balance" stroke="hsl(var(--primary))" fillOpacity={1} fill="url(#colorBalance)" />
                </AreaChart>
            </ResponsiveContainer>
        </ChartContainer>
    );
}


function AchievementsCard() {
    const { currentUser } = useApp();
    if (!currentUser) return null;
    
    const allAchievementKeys = Object.keys(achievementDetails) as AchievementID[];

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-headline text-2xl">Realizări Divine</CardTitle>
                <CardDescription>Calea ta pe acest tărâm, marcată de fapte mărețe și încercări de neclintit.</CardDescription>
            </CardHeader>
            <CardContent className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                {allAchievementKeys.map(key => {
                    const achievement = achievementDetails[key];
                    const isUnlocked = currentUser.achievements.includes(key);
                    return (
                        <TooltipProvider key={key} delayDuration={0}>
                            <Tooltip>
                                <TooltipTrigger asChild>
                                    <div className={`flex flex-col items-center justify-center p-4 border rounded-lg aspect-square transition-all ${isUnlocked ? 'border-primary/50 bg-primary/10' : 'opacity-40'}`}>
                                        <achievement.Icon className={`h-10 w-10 mb-2 ${isUnlocked ? 'text-primary' : 'text-muted-foreground'}`}/>
                                        <p className="text-xs text-center font-semibold">{achievement.name}</p>
                                    </div>
                                </TooltipTrigger>
                                <TooltipContent className="max-w-xs">
                                    <p className="font-bold">{achievement.name}</p>
                                    <p>{achievement.description}</p>
                                    {!isUnlocked && <p className="text-xs text-muted-foreground mt-1">(Blocat)</p>}
                                </TooltipContent>
                            </Tooltip>
                        </TooltipProvider>
                    )
                })}
            </CardContent>
        </Card>
    )
}


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
                <CardDescription>Acceptă semnul fiarei pentru a primi bogății instant. Măcar aici să ai bani dacă în viața reală bate vântul în portofel.</CardDescription>
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
                            className="pl-10"
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
        <div className="space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Evoluția Balanței</CardTitle>
                    <CardDescription>Graficul credinței și al prudenței tale financiare.</CardDescription>
                </CardHeader>
                 <CardContent>
                     <BalanceChart />
                 </CardContent>
            </Card>
            <AchievementsCard />
            <div className="max-w-md mx-auto">
              <PactCard />
            </div>
        </div>
    );
}

    