"use client";

import React, { createContext, useState, ReactNode } from 'react';
import { useToast } from "@/hooks/use-toast";

export type AchievementID = 'NOVICE' | 'PACT_MAKER' | 'PROPHET' | 'JOB' | 'STREAK';

export type User = {
  id: string; // username
  balance: number;
  isAdmin: boolean;
  hasMadePact: boolean;
  achievements: AchievementID[];
  balanceHistory: { date: number; balance: number }[];
};

export type PariuOption = {
  text: string;
  odds: number;
};

export type Comment = {
  userId: string;
  text: string;
  date: number;
};

export type Pariu = {
  id: string;
  title: string;
  description: string;
  options: PariuOption[];
  winningOptionIndex?: number;
  status: 'open' | 'closed';
  comments: Comment[];
};

export type Bet = {
  id: string;
  pariuId: string;
  optionIndex: number;
  amount: number;
  userId: string;
  odds: number;
  date: number;
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
  addComment: (pariuId: string, text: string) => void;
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
    comments: [],
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
    comments: [],
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
    comments: [],
  }
];

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [pariuri, setPariuri] = useState<Pariu[]>(initialPariuri);
  const [bets, setBets] = useState<Bet[]>([]);
  const [appName, setAppName] = useState('InspaiărBet');
  const [slogan, setSlogan] = useState('Pariază cu inspirație');
  const [pactControlEnabled, setPactControlEnabled] = useState(true);
  const { toast } = useToast();

  const updateUser = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setUsers(users.map(u => u.id === updatedUser.id ? updatedUser : u));
  }

  const checkAndAwardAchievement = (user: User, achievementId: AchievementID): User => {
    if (!user.achievements.includes(achievementId)) {
        toast({
            title: "Realizare Deblocată!",
            description: `Ai primit realizarea: ${achievementId}.`
        });
        return { ...user, achievements: [...user.achievements, achievementId] };
    }
    return user;
  };
  
  const updateBalanceHistory = (user: User, newBalance: number): User => {
      const newHistoryEntry = { date: new Date().getTime(), balance: newBalance };
      const updatedHistory = [...user.balanceHistory, newHistoryEntry];
      return { ...user, balance: newBalance, balanceHistory: updatedHistory };
  }

  const login = (username: string) => {
    let user = users.find(u => u.id.toLowerCase() === username.toLowerCase());
    if (!user) {
      const isAdmin = users.length === 0;
      const initialBalance = 1000;
      user = { 
        id: username, 
        balance: initialBalance, 
        isAdmin, 
        hasMadePact: false,
        achievements: [],
        balanceHistory: [{ date: new Date().getTime(), balance: initialBalance }]
      };
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
    
    let updatedUser = { ...currentUser };

    if (pactControlEnabled) {
      if (updatedUser.hasMadePact) {
        toast({ variant: 'destructive', title: 'Pact deja încheiat', description: 'Ai făcut deja pactul o dată. Lăcomia este un păcat.' });
        return;
      }
      if (amount !== 666) {
        toast({ variant: 'destructive', title: 'Ofertă respinsă', description: 'Lordul Întunericului acceptă doar ofranda standard de 666 de talanți.' });
        return;
      }
      updatedUser = updateBalanceHistory(updatedUser, updatedUser.balance + amount);
      updatedUser.hasMadePact = true;
      updatedUser = checkAndAwardAchievement(updatedUser, 'PACT_MAKER');
      toast({ title: 'Pact încheiat!', description: `${amount.toFixed(2)} talanți au fost adăugați în cont, cu costul sufletului tău`});
    } else {
      if (amount <= 0) {
        toast({ variant: 'destructive', title: 'Ofertă invalidă', description: 'Trebuie să oferi o sumă validă.' });
        return;
      }
      updatedUser = updateBalanceHistory(updatedUser, updatedUser.balance + amount);
      toast({ title: 'Fonduri adăugate!', description: `${amount.toFixed(2)} talanți au fost adăugați în cont.`});
    }
    updateUser(updatedUser);
  };

  const addPariu = (data: NewPariuData) => {
    const newPariu: Pariu = {
      id: new Date().getTime().toString(),
      title: data.title,
      description: data.description,
      options: data.options.map(o => ({ text: o.text, odds: parseFloat(o.odds) || 1.0 })),
      status: 'open',
      comments: [],
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
    
    let updatedUser = updateBalanceHistory(currentUser, currentUser.balance - amount);
    updatedUser = checkAndAwardAchievement(updatedUser, 'NOVICE');
    updateUser(updatedUser);

    const odds = pariu.options[optionIndex].odds;

    const newBet: Bet = {
      id: new Date().getTime().toString(),
      pariuId,
      optionIndex,
      amount,
      userId: currentUser.id,
      odds,
      date: new Date().getTime()
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

    const betsForThisPariu = bets.filter(b => b.pariuId === pariuId);
    let totalWinnings = 0;
    let updatedUsers = [...users];

    betsForThisPariu.forEach(bet => {
        const isWin = bet.optionIndex === winningOptionIndex;
        const userIndex = updatedUsers.findIndex(u => u.id === bet.userId);
        if (userIndex === -1) return;

        let user = updatedUsers[userIndex];

        if (isWin) {
            const odds = pariuToResolve.options[bet.optionIndex].odds;
            const winnings = bet.amount * odds;
            totalWinnings += winnings;
            user = updateBalanceHistory(user, user.balance + winnings);

            if (odds > 5) {
                user = checkAndAwardAchievement(user, 'PROPHET');
            }
        }
        
        // Check for streaks
        const userClosedBets = bets
            .filter(b => b.userId === user.id)
            .map(b => {
                const pariu = updatedPariuri.find(p => p.id === b.pariuId);
                return { bet: b, pariu };
            })
            .filter(item => item.pariu && item.pariu.status === 'closed')
            .sort((a, b) => b.bet.date - a.bet.date);

        if (userClosedBets.length >= 3) {
            const last3 = userClosedBets.slice(0, 3);
            if (last3.every(item => item.pariu?.winningOptionIndex === item.bet.optionIndex)) {
                user = checkAndAwardAchievement(user, 'STREAK');
            }
        }

        if (userClosedBets.length >= 5) {
             const last5 = userClosedBets.slice(0, 5);
             if (last5.every(item => item.pariu?.winningOptionIndex !== item.bet.optionIndex)) {
                user = checkAndAwardAchievement(user, 'JOB');
            }
        }

        updatedUsers[userIndex] = user;
    });
    
    setUsers(updatedUsers);

    if (currentUser) {
        const updatedCurrentUser = updatedUsers.find(u => u.id === currentUser.id);
        if (updatedCurrentUser) {
            setCurrentUser(updatedCurrentUser);
        }
    }

    if (totalWinnings > 0) {
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
  
  const addComment = (pariuId: string, text: string) => {
    if (!currentUser) return;

    const newComment: Comment = {
      userId: currentUser.id,
      text,
      date: new Date().getTime(),
    };

    setPariuri(pariuri.map(p => {
      if (p.id === pariuId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    }));
  }

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


  const value = { users, currentUser, login, logout, appName, setAppName, slogan, setSlogan, balance, pariuri, bets, addPariu, placeBet, resolvePariu, addFunds, pactControlEnabled, togglePactControl, toggleAdmin, deleteUser, deletePariu, addComment };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
