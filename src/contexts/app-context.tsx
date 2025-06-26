
"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

export type ScenarioOption = {
  text: string;
  odds: number;
};

export type Scenario = {
  id: string;
  title: string;
  description: string;
  options: ScenarioOption[];
  winningOptionIndex?: number;
  status: 'open' | 'closed';
};

export type Bet = {
  id: string;
  scenarioId: string;
  optionIndex: number;
  amount: number;
};

export type NewScenarioData = {
  title: string;
  options: { text: string; odds: string }[];
};

type AppContextType = {
  balance: number;
  scenarios: Scenario[];
  bets: Bet[];
  addScenario: (data: NewScenarioData) => Promise<void>;
  placeBet: (scenarioId: string, optionIndex: number, amount: number) => void;
  resolveScenario: (scenarioId: string, winningOptionIndex: number) => void;
  addFunds: (amount: number) => void;
};

const initialScenarios: Scenario[] = [
  {
    id: '1',
    title: 'Se vor vinde primele prăjiturile cu lămâie la târgul de prăjituri al bisericii?',
    description: 'Târgul anual de prăjituri a sosit! Agnes aduce legendarele ei prăjituri cu lămâie, dar și brioșele magnifice ale Marthei sunt pe masă. Tensiunea este palpabilă. Unde se va îndrepta prima dată congregația?',
    options: [
      { text: 'Da, prăjiturile cu lămâie!', odds: 1.8 },
      { text: 'Nu, brioșele vor câștiga!', odds: 2.2 }
    ],
    status: 'open',
  },
  {
    id: '2',
    title: 'Va depăși predica Pastorului John 15 minute?',
    description: 'Pastorul John este cunoscut pentru predicile sale pasionale și uneori lungi. A promis să fie scurt duminica aceasta, dar duhul s-ar putea să-l miște. Se va ține de program?',
    options: [
        { text: 'Da, pregătiți-vă pentru prelungiri!', odds: 1.5 },
        { text: 'Nu, va fi concis!', odds: 2.5 },
        { text: 'Exact 15 minute!', odds: 5.0 }
    ],
    status: 'open',
  },
  {
    id: '3',
    title: 'Va reuși spălătoria auto a grupului de tineri să curețe un tractor noroios?',
    description: 'Grupul de tineri spală mașini pentru caritate. Fermierul McGregor tocmai a sosit cu tractorul său acoperit de noroi. Poate exuberanța lor tinerească să învingă această provocare colosală de curățenie?',
    options: [
        { text: 'Da, ei au puterea!', odds: 1.3 },
        { text: 'Nu, noroiul este veșnic!', odds: 3.0 }
    ],
    status: 'closed',
    winningOptionIndex: 0,
  }
];

// Mock AI function
const generateDescription = async (title: string): Promise<string> => {
  return new Promise(resolve => {
    setTimeout(() => {
      resolve(`O descriere amuzantă și veselă pentru "${title}" generată de AI-ul nostru sfânt. Acesta ia în considerare toate posibilitățile distractive și adaugă o notă de umor divin scenariului.`);
    }, 500);
  });
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [balance, setBalance] = useState(1000);
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios);
  const [bets, setBets] = useState<Bet[]>([]);
  const { toast } = useToast();

  const addFunds = (amount: number) => {
    if (amount > 0) {
      setBalance(prev => prev + amount);
      toast({
        title: 'Fonduri Adăugate!',
        description: `S-au adăugat cu succes ${amount.toFixed(2)} $ în balanța ta.`
      });
    }
  };

  const addScenario = async (data: NewScenarioData) => {
    const description = await generateDescription(data.title);
    const newScenario: Scenario = {
      id: new Date().getTime().toString(),
      title: data.title,
      description: description,
      options: data.options.map(o => ({ text: o.text, odds: parseFloat(o.odds) || 1.0 })),
      status: 'open',
    };
    setScenarios(prev => [newScenario, ...prev]);
  };

  const placeBet = (scenarioId: string, optionIndex: number, amount: number) => {
    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario || scenario.status === 'closed') {
        toast({ variant: 'destructive', title: 'Pariuri Închise', description: 'Acest scenariu nu mai este deschis pentru pariuri.' });
        return;
    }
    if (amount > balance) {
      toast({ variant: 'destructive', title: 'Un Test de Prudență', description: 'Fondurile tale sunt scăzute. Poate un salt de credință mai mic este indicat?' });
      return;
    }

    setBalance(prev => prev - amount);
    const newBet: Bet = {
      id: new Date().getTime().toString(),
      scenarioId,
      optionIndex,
      amount
    };
    setBets(prev => [...prev, newBet]);
    toast({ title: 'Pariu Plasat!', description: `Ți-ai pus credința în asta! ${amount} $ pariați.` });
  };

  const resolveScenario = (scenarioId: string, winningOptionIndex: number) => {
    const scenarioToResolve = scenarios.find(s => s.id === scenarioId);
    if (!scenarioToResolve || scenarioToResolve.status === 'closed') return;

    // Update scenario status
    const updatedScenarios = scenarios.map(s =>
      s.id === scenarioId
        ? { ...s, status: 'closed' as const, winningOptionIndex }
        : s
    );
    setScenarios(updatedScenarios);

    // Payout winners
    const winningBets = bets.filter(b => b.scenarioId === scenarioId && b.optionIndex === winningOptionIndex);
    let totalWinnings = 0;
    
    winningBets.forEach(bet => {
        const odds = scenarioToResolve.options[bet.optionIndex].odds;
        const winnings = bet.amount * odds;
        totalWinnings += winnings;
        // In a real app, you'd credit individual users. Here, we credit the single user's balance.
        setBalance(prev => prev + winnings);
    });

    if (winningBets.length > 0) {
        toast({
            title: 'Aleluia! Câștiguri Plătite!',
            description: `S-au plătit ${totalWinnings.toFixed(2)} $ câștigătorilor credincioși.`
        });
    } else {
        toast({
            title: 'Scenariu Rezolvat',
            description: `Rezultatul a fost decis. Nu au fost plasate pariuri câștigătoare pe acest rezultat.`
        });
    }
  };

  const value = { balance, scenarios, bets, addScenario, placeBet, resolveScenario, addFunds };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
