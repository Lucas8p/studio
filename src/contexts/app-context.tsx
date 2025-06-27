
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
  description: string;
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
  addPariu: (data: NewPariuData) => void;
  placeBet: (pariuId: string, optionIndex: number, amount: number) => void;
  resolvePariu: (pariuId: string, winningOptionIndex: number) => void;
  addFunds: (amount: number) => void;
  pactControlEnabled: boolean;
  togglePactControl: () => void;
  toggleAdmin: (userId: string) => void;
  deleteUser: (userId: string) => void;
  deletePariu: (pariuId: string) => void;
};

const initialPariuri: Pariu[] = [
  {
    id: '1',
    title: 'Iar ne ține mai mult Gabi Sere la predică?',
    description: "Durata slujbelor devine un joc de noroc. Își va testa Gabi Sere răbdarea turmei sau va arăta o milă neașteptată? Soarta amiezii tale stă în cumpănă.",
    options: [
      { text: 'Mai vreo ora sigur', odds: 4.0 },
      { text: 'Doar 10 minute', odds: 2.5 },
      { text: 'Nu, scăpăm repede', odds: 1.5 }
    ],
    status: 'open',
  },
  {
    id: '2',
    title: 'Cântă Revive și anul ăsta "Voi cânta bunătatea Ta" sau nu?',
    description: "Un imn clasic, o trupă legendară. Vor ceda cei de la Revive ispitei de a reaprinde flacăra nostalgiei sau vor alege o cale nouă, necartografiată? Alege cu înțelepciune.",
    options: [
        { text: 'Da, mai merge forjată umpic', odds: 1.7 },
        { text: 'Nu că s-au plictisit și ei de ea', odds: 2.1 },
    ],
    status: 'open',
  },
  {
    id: '3',
    title: 'Vor ajunge pachețelele de la agapă la toată lumea?',
    description: "O minune modernă a înmulțirii... sau un test de logistică divină. Va reuși comitetul de organizare să satureze mulțimea sau vor rămâne unii flămânzi, meditând la pilda celor cinci pâini și doi pești?",
    options: [
        { text: 'Da, se satură toți și mai rămâne', odds: 1.3 },
        { text: 'Nu, ultimii vor posti', odds: 3.0 }
    ],
    status: 'closed',
    winningOptionIndex: 0,
  }
];

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
      const isAdmin = users.length === 0; // First user is always the primary admin
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
      toast({ title: 'Pact încheiat!', description: `${amount.toFixed(2)} talanți au fost adăugați în cont, cu costul sufletului tău`});
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

  const addPariu = (data: NewPariuData) => {
    const newPariu: Pariu = {
      id: new Date().getTime().toString(),
      title: data.title,
      description: data.description,
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
    
    const userHasBetOnThis = bets.some(b => b.pariuId === pariuId && b.userId === currentUser.id);
    if (userHasBetOnThis) {
      toast({ variant: 'destructive', title: 'Pariu Duplicat', description: 'Ai pariat deja pe acest eveniment.' });
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
    toast({ description: "Pariul a fost plasat, așteaptă și o să vezi cât de mare îți e credința :)" });
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

  const deletePariu = (pariuId: string) => {
    if (!currentUser?.isAdmin) {
      toast({ variant: 'destructive', title: 'Acces Interzis', description: 'Doar administratorii pot șterge pariuri.' });
      return;
    }

    const pariuToDelete = pariuri.find(p => p.id === pariuId);
    if (!pariuToDelete) {
      toast({ variant: 'destructive', title: 'Eroare', description: 'Pariul nu a fost găsit.' });
      return;
    }

    const hasBetsPlaced = bets.some(bet => bet.pariuId === pariuId);
    if (hasBetsPlaced) {
      toast({ variant: 'destructive', title: 'Acțiune Interzisă', description: 'Nu puteți șterge un pariu pe care s-au plasat deja mize. Rezolvați pariul în schimb.' });
      return;
    }

    setPariuri(prev => prev.filter(p => p.id !== pariuId));
    toast({ title: 'Pariu Șters', description: `Pariul "${pariuToDelete.title}" a fost șters cu succes.` });
  };
  
  const balance = currentUser?.balance ?? 0;

  const togglePactControl = () => {
    setPactControlEnabled(prev => !prev);
  }

  const toggleAdmin = (userId: string) => {
    if (!currentUser || currentUser.id !== users[0]?.id) {
        toast({ variant: 'destructive', title: 'Acces Interzis', description: 'Doar administratorul principal poate face această acțiune.' });
        return;
    }
    if (userId === users[0]?.id) {
        toast({ variant: 'destructive', title: 'Acțiune Interzisă', description: 'Nu puteți modifica statutul administratorului principal.' });
        return;
    }
    
    const targetUser = users.find(u => u.id === userId);
    if(targetUser){
        setUsers(users.map(u => u.id === userId ? { ...u, isAdmin: !u.isAdmin } : u));
        toast({ title: 'Statut Modificat', description: `Utilizatorul ${targetUser.id} este acum ${!targetUser.isAdmin ? 'administrator de pariuri' : 'utilizator standard'}.` });
    }
  };

  const deleteUser = (userId: string) => {
    if (!currentUser || currentUser.id !== users[0]?.id) {
        toast({ variant: 'destructive', title: 'Acces Interzis', description: 'Doar administratorul principal poate face această acțiune.' });
        return;
    }
    if (userId === users[0]?.id) {
        toast({ variant: 'destructive', title: 'Acțiune Interzisă', description: 'Nu puteți șterge administratorul principal.' });
        return;
    }
    setBets(prev => prev.filter(b => b.userId !== userId));
    setUsers(prev => prev.filter(u => u.id !== userId));
    toast({ title: 'Utilizator Șters', description: `Utilizatorul ${userId} și pariurile sale au fost șterse.` });
  };


  const value = { users, currentUser, login, logout, appName, setAppName, slogan, setSlogan, balance, pariuri, bets, addPariu, placeBet, resolvePariu, addFunds, pactControlEnabled, togglePactControl, toggleAdmin, deleteUser, deletePariu };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
