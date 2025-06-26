
"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

export type User = {
  id: string; // username
  balance: number;
  isAdmin: boolean;
  hasMadePact: boolean;
};

export type PariuOption = {
  text: string;
  odds: number;
};

export type Pariu = {
  id: string;
  title: string;
  description: string;
  options: PariuOption[];
  winningOptionIndex?: number;
  status: 'open' | 'closed';
};

export type Bet = {
  id: string;
  pariuId: string;
  optionIndex: number;
  amount: number;
  userId: string;
  odds: number;
};

export type NewPariuData = {
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
  slogan: string;
  setSlogan: (slogan: string) => void;
  balance: number;
  pariuri: Pariu[];
  bets: Bet[];
  addPariu: (data: NewPariuData) => Promise<void>;
  placeBet: (pariuId: string, optionIndex: number, amount: number) => void;
  resolvePariu: (pariuId: string, winningOptionIndex: number) => void;
  addFunds: (amount: number) => void;
  pactControlEnabled: boolean;
  togglePactControl: () => void;
};

const initialPariuri: Pariu[] = [
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
      resolve(`O descriere amuzantă și veselă pentru "${title}" generată de AI-ul nostru sfânt. Acesta ia în considerare toate posibilitățile distractive și adaugă o notă de umor divin pariului.`);
    }, 500);
  });
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pariuri, setPariuri] = useState<Pariu[]>(initialPariuri);
  const [bets, setBets] = useState<Bet[]>([]);
  const [appName, setAppName] = useState('FaithBet');
  const [slogan, setSlogan] = useState('Pariază cu credință');
  const [pactControlEnabled, setPactControlEnabled] = useState(false);
  const { toast } = useToast();

  const login = (username: string) => {
    let user = users.find(u => u.id.toLowerCase() === username.toLowerCase());
    if (!user) {
      const isAdmin = users.length === 0;
      user = { id: username, balance: 1000, isAdmin, hasMadePact: false };
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
    
    if (pactControlEnabled) {
      if (currentUser.hasMadePact) {
        toast({ variant: 'destructive', title: 'Pact deja încheiat', description: 'Ai făcut deja pactul o dată. Lăcomia este un păcat.' });
        return;
      }
      if (amount !== 666) {
        toast({ variant: 'destructive', title: 'Ofertă respinsă', description: 'Lordul Întunericului acceptă doar ofranda standard de 666 de talanți.' });
        return;
      }
      const updatedUser = { ...currentUser, balance: currentUser.balance + amount, hasMadePact: true };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      toast({ title: 'Pact încheiat!', description: `Ai primit ${amount.toFixed(2)} talanți... dar cu ce preț?`});
    } else {
      if (amount <= 0) {
        toast({ variant: 'destructive', title: 'Ofertă invalidă', description: 'Trebuie să oferi o sumă validă.' });
        return;
      }
      const updatedUser = { ...currentUser, balance: currentUser.balance + amount };
      setCurrentUser(updatedUser);
      setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));
      toast({ title: 'Fonduri adăugate!', description: `${amount.toFixed(2)} talanți au fost adăugați în cont.`});
    }
  };

  const addPariu = async (data: NewPariuData) => {
    const description = await generateDescription(data.title);
    const newPariu: Pariu = {
      id: new Date().getTime().toString(),
      title: data.title,
      description: description,
      options: data.options.map(o => ({ text: o.text, odds: parseFloat(o.odds) || 1.0 })),
      status: 'open',
    };
    setPariuri(prev => [newPariu, ...prev]);
  };

  const placeBet = (pariuId: string, optionIndex: number, amount: number) => {
    if (!currentUser) {
        toast({ variant: 'destructive', title: 'Neautorizat', description: 'Trebuie să fii conectat pentru a plasa un pariu.' });
        return;
    }

    const pariu = pariuri.find(p => p.id === pariuId);
    if (!pariu || pariu.status === 'closed') {
        toast({ variant: 'destructive', title: 'Pariuri Închise', description: 'Acest pariu nu mai este deschis pentru pariuri.' });
        return;
    }
    if (amount > currentUser.balance) {
      toast({ variant: 'destructive', title: 'Un Test de Prudență', description: 'Fondurile tale sunt scăzute. Poate un salt de credință mai mic este indicat?' });
      return;
    }

    const updatedUser = { ...currentUser, balance: currentUser.balance - amount };
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === currentUser.id ? updatedUser : u));

    const odds = pariu.options[optionIndex].odds;

    const newBet: Bet = {
      id: new Date().getTime().toString(),
      pariuId,
      optionIndex,
      amount,
      userId: currentUser.id,
      odds
    };
    setBets(prev => [...prev, newBet]);
    toast({ title: 'Pariu Plasat!', description: `Ți-ai pus credința în asta! ${amount} talanți pariați.` });
  };

  const resolvePariu = (pariuId: string, winningOptionIndex: number) => {
    const pariuToResolve = pariuri.find(p => p.id === pariuId);
    if (!pariuToResolve || pariuToResolve.status === 'closed') return;

    const updatedPariuri = pariuri.map(p =>
      p.id === pariuId
        ? { ...p, status: 'closed' as const, winningOptionIndex }
        : p
    );
    setPariuri(updatedPariuri);

    const winningBets = bets.filter(b => b.pariuId === pariuId && b.optionIndex === winningOptionIndex);
    let totalWinnings = 0;
    let updatedUsers = [...users];

    winningBets.forEach(bet => {
        const odds = pariuToResolve.options[bet.optionIndex].odds;
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
            title: 'Pariu Rezolvat',
            description: `Rezultatul a fost decis. Nu au existat câștigători de data aceasta.`
        });
    }
  };
  
  const balance = currentUser?.balance ?? 0;

  const togglePactControl = () => {
    setPactControlEnabled(prev => !prev);
  }

  const value = { users, currentUser, login, logout, appName, setAppName, slogan, setSlogan, balance, pariuri, bets, addPariu, placeBet, resolvePariu, addFunds, pactControlEnabled, togglePactControl };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
