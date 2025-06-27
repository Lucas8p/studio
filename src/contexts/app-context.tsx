
"use client";

import React, { createContext, useState, ReactNode, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { useRouter } from 'next/navigation';
import { 
  loginAction, 
  addFundsAction,
  addPariuAction,
  placeBetAction,
  resolvePariuAction,
  deletePariuAction,
  addCommentAction,
  toggleAdminAction,
  deleteUserAction,
  updateAdminPasswordAction,
  updateSettingsAction,
} from '@/app/actions';

export type AchievementID = 'NOVICE' | 'PACT_MAKER' | 'PROPHET' | 'JOB' | 'STREAK';

export type User = {
  id: string; // username
  balance: number;
  isAdmin: boolean;
  hasMadePact: boolean;
  achievements: AchievementID[];
  balanceHistory: { date: number; balance: number }[];
  password?: string;
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

export type AppSettings = {
  appName: string;
  slogan: string;
  pactControlEnabled: boolean;
  aiVoiceEnabled: boolean;
};

export type InitialData = {
  users: User[];
  pariuri: Pariu[];
  bets: Bet[];
  settings: AppSettings;
};


type AppContextType = {
  users: User[];
  currentUser: User | null;
  isLoading: boolean;
  login: (username: string, password?: string) => Promise<boolean>;
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
  aiVoiceEnabled: boolean;
  toggleAiVoice: () => void;
  toggleAdmin: (userId: string) => void;
  deleteUser: (userId: string) => void;
  deletePariu: (pariuId: string) => void;
  addComment: (pariuId: string, text: string) => void;
  updateAdminPassword: (userId: string, newPassword: string) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children, initialData }: { children: ReactNode, initialData: InitialData }) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [users, setUsers] = useState<User[]>(initialData.users);
  const [pariuri, setPariuri] = useState<Pariu[]>(initialData.pariuri);
  const [bets, setBets] = useState<Bet[]>(initialData.bets);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<AppSettings>(initialData.settings);


  useEffect(() => {
    setIsLoading(true);

    setUsers(initialData.users);
    setPariuri(initialData.pariuri);
    setBets(initialData.bets);
    setSettings(initialData.settings);

    const storedUserId = sessionStorage.getItem('currentUser');
    if (storedUserId) {
      const user = initialData.users.find(u => u.id === storedUserId);
      if (user) {
        setCurrentUser(user);
      } else {
        sessionStorage.removeItem('currentUser');
        setCurrentUser(null);
      }
    } else {
      setCurrentUser(null);
    }

    setIsLoading(false);
  }, [initialData]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const result = await updateSettingsAction(newSettings);
    if (result.success) {
      toast({ title: 'Setări salvate', description: result.message });
      router.refresh(); 
    } else {
      toast({ variant: 'destructive', title: 'Eroare', description: result.message });
    }
  };

  const setAppName = (name: string) => updateSettings({ appName: name });
  const setSlogan = (slogan: string) => updateSettings({ slogan });
  const togglePactControl = () => updateSettings({ pactControlEnabled: !settings.pactControlEnabled });
  const toggleAiVoice = () => updateSettings({ aiVoiceEnabled: !settings.aiVoiceEnabled });

  const login = async (username: string, password?: string): Promise<boolean> => {
    const result = await loginAction(username, password);
    if (result.success) {
      setCurrentUser(result.user);
      sessionStorage.setItem('currentUser', result.user.id);
      toast({ title: result.message });
      router.push('/');
      return true;
    } else {
      toast({ variant: 'destructive', title: 'Autentificare Eșuată', description: result.message });
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    sessionStorage.removeItem('currentUser');
    router.push('/login');
  };

  const addFunds = async (amount: number) => {
    if (!currentUser) return;
    const result = await addFundsAction(currentUser.id, amount);
    if (result.success) {
      toast({ title: 'Succes!', description: result.message });
      if (result.achievement) {
          toast(result.achievement);
      }
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Eroare', description: result.message });
    }
  };
  
  const addPariu = async (data: NewPariuData) => {
    const result = await addPariuAction(data);
    if (result.success) {
      toast({ title: "S-a scris!", description: result.message });
      router.refresh();
    }
  };

  const placeBet = async (pariuId: string, optionIndex: number, amount: number) => {
    if (!currentUser) return;
    const result = await placeBetAction(pariuId, optionIndex, amount, currentUser.id);
    if (result.success) {
      toast({ description: result.message });
      if (result.achievement) {
          toast(result.achievement);
      }
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Eroare Pariu', description: result.message });
    }
  };

  const resolvePariu = async (pariuId: string, winningOptionIndex: number) => {
    const result = await resolvePariuAction(pariuId, winningOptionIndex);
    if (result.success) {
      toast({ title: "Pariu Rezolvat!", description: result.message });
      result.achievements.forEach(ach => {
          if (ach.userId === currentUser?.id) {
              toast({ title: ach.title, description: ach.description });
          }
      });
      router.refresh();
    }
  };
  
  const deletePariu = async (pariuId: string) => {
    if (!currentUser) return;
    const result = await deletePariuAction(pariuId, currentUser.id);
    if (result.success) {
      toast({ title: 'Pariu Șters', description: result.message });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Eroare', description: result.message });
    }
  };
  
  const addComment = async (pariuId: string, text: string) => {
    if (!currentUser) return;
    const result = await addCommentAction(pariuId, text, currentUser.id);
    if (result.success) {
      router.refresh();
    }
  };
  
  const toggleAdmin = async (userId: string) => {
    if (!currentUser) return;
    const result = await toggleAdminAction(userId, currentUser.id);
     if (result.success) {
      toast({ title: 'Statut Modificat', description: result.message });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Eroare', description: result.message });
    }
  }
  
  const deleteUser = async (userId: string) => {
    if (!currentUser) return;
    const result = await deleteUserAction(userId, currentUser.id);
     if (result.success) {
      toast({ title: 'Utilizator Șters', description: result.message });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Eroare', description: result.message });
    }
  }

  const updateAdminPassword = async (userId: string, newPassword: string) => {
    if (!currentUser) return;
    const result = await updateAdminPasswordAction(userId, newPassword, currentUser.id);
    if (result.success) {
      toast({ title: 'Parolă Actualizată!', description: result.message });
      router.refresh();
    } else {
      toast({ variant: 'destructive', title: 'Eroare', description: result.message });
    }
  }

  const balance = currentUser ? currentUser.balance : 0;
  
  const value = { 
      users, currentUser, isLoading, login, logout, 
      appName: settings.appName, setAppName, 
      slogan: settings.slogan, setSlogan, 
      balance, pariuri, bets, addPariu, placeBet, resolvePariu, addFunds,
      pactControlEnabled: settings.pactControlEnabled, togglePactControl, 
      aiVoiceEnabled: settings.aiVoiceEnabled, toggleAiVoice, 
      toggleAdmin, deleteUser, deletePariu, addComment, updateAdminPassword 
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}
