
"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

export type User = {
  id: string; // username
  balance: number;
  isAdmin: boolean;
};

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
  userId: string;
};

export type NewScenarioData = {
  title: string;
  options: { text: string; odds: string }[];
};

type AppContextType = {
  users: User[];
  currentUser: User | null;
  login: (username: string) => void;
  logout: () => void;
  appName: string;
  setAppName: (name: string) => void;
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
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [scenarios, setScenarios] = useState<Scenario[]>(initialScenarios);
  const [bets, setBets] = useState<Bet[]>([]);
  const [appName, setAppName] = useState('FaithBet');
  const { toast } = useToast();

  const login = (username: string) => {
    let user = users.find(u => u.id.toLowerCase() === username.toLowerCase());
    if (!user) {
      const isAdmin = users.length === 0;
      user = { id: username, balance: 1000, isAdmin };
      setUsers(prev => [...prev, user!]);
      toast({ title: `Bine ai venit, ${username}!`, description: "Contul tău a fost creat." });
    } else {
      toast({ title: `Bine ai revenit, ${username}!` });
    }
    setCurrentUser(user);
  };

  const logout = () => {
    setCurrentUser(null);
  };

  const addFunds = (amount: number) => {
    if (!currentUser) return;
    if (amount > 0) {
      const updatedUser = { ...currentUser, balance: currentUser.balance + amount };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
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
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Neautorizat', description: 'Trebuie să fii conectat pentru a plasa un pariu.' });
        return;
    }

    const scenario = scenarios.find(s => s.id === scenarioId);
    if (!scenario || scenario.status === 'closed') {
        toast({ variant: 'destructive', title: 'Pariuri Închise', description: 'Acest scenariu nu mai este deschis pentru pariuri.' });
        return;
    }
    if (amount > currentUser.balance) {
      toast({ variant: 'destructive', title: 'Un Test de Prudență', description: 'Fondurile tale sunt scăzute. Poate un salt de credință mai mic este indicat?' });
      return;
    }

    const updatedUser = { ...currentUser, balance: currentUser.balance - amount };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

    const newBet: Bet = {
      id: new Date().getTime().toString(),
      scenarioId,
      optionIndex,
      amount,
      userId: currentUser.id
    };
    setBets(prev => [...prev, newBet]);
    toast({ title: 'Pariu Plasat!', description: `Ți-ai pus credința în asta! ${amount} talanți pariați.` });
  };

  const resolveScenario = (scenarioId: string, winningOptionIndex: number) => {
    const scenarioToResolve = scenarios.find(s => s.id === scenarioId);
    if (!scenarioToResolve || scenarioToResolve.status === 'closed') return;

    const updatedScenarios = scenarios.map(s =>
      s.id === scenarioId
        ? { ...s, status: 'closed' as const, winningOptionIndex }
        : s
    );
    setScenarios(updatedScenarios);

    const winningBets = bets.filter(b => b.scenarioId === scenarioId && b.optionIndex === winningOptionIndex);
    let totalWinnings = 0;
    let updatedUsers = [...users];

    winningBets.forEach(bet => {
        const odds = scenarioToResolve.options[bet.optionIndex].odds;
        const winnings = bet.amount * odds;
        totalWinnings += winnings;

        const winnerIndex = updatedUsers.findIndex(u => u.id === bet.userId);
        if (winnerIndex !== -1) {
            updatedUsers[winnerIndex] = {
                ...updatedUsers[winnerIndex],
                balance: updatedUsers[winnerIndex].balance + winnings
            };
        }
    });
    
    setUsers(updatedUsers);

    if (currentUser) {
        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        if (updatedCurrentUser) {
            setCurrentUser(updatedCurrentUser);
        }
    }

    if (winningBets.length > 0) {
        toast({
            title: 'Diavolul își plătește datoriile!',
            description: `S-au plătit ${totalWinnings.toFixed(2)} talanți câștigătorilor.`
        });
    } else {
        toast({
            title: 'Scenariu Rezolvat',
            description: `Rezultatul a fost decis. Nu au existat câștigători de data aceasta.`
        });
    }
  };
  
  const balance = currentUser?.balance ?? 0;

  const value = { users, currentUser, login, logout, appName, setAppName, balance, scenarios, bets, addScenario, placeBet, resolveScenario, addFunds };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
