'use server';

import {
  getUsers,
  saveUsers,
  getPariuri,
  savePariuri,
  getBets,
  saveBets,
} from '@/lib/data';
import type {
  User,
  Pariu,
  Bet,
  NewPariuData,
  AchievementID,
  Comment,
} from '@/contexts/app-context';

// --- Helper Functions ---

function checkAndAwardAchievement(
  user: User,
  achievementId: AchievementID
): { user: User; awarded: boolean; name: string | null } {
  if (!user.achievements.includes(achievementId)) {
    const achievementDetails = {
        'NOVICE': "Novicele Credincios",
        'PACT_MAKER': "Semnul Fiarei",
        'PROPHET': "Profetul",
        'JOB': "Iov Modern",
        'STREAK': "Mana Cerească"
    };
    return {
      user: { ...user, achievements: [...user.achievements, achievementId] },
      awarded: true,
      name: achievementDetails[achievementId] || null
    };
  }
  return { user, awarded: false, name: null };
}

function updateBalanceHistory(user: User, newBalance: number): User {
  const newHistoryEntry = { date: new Date().getTime(), balance: newBalance };
  const updatedHistory = [...user.balanceHistory, newHistoryEntry];
  return { ...user, balance: newBalance, balanceHistory: updatedHistory };
}

// --- User Actions ---

export async function loginAction(username: string, password?: string) {
  const users = await getUsers();
  let user = users.find(u => u.id.toLowerCase() === username.toLowerCase());
  const isFirstUser = users.length === 0;
  const isPotentiallyAdmin = user?.isAdmin || (isFirstUser && username.trim() !== '');

  if (isPotentiallyAdmin) {
    const adminPassword = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin123';
    
    if (!user) { // First user ever, they become primary admin
        if (password !== adminPassword) {
            return { success: false, message: 'Parola de administrator este incorectă.' };
        }
       user = { 
          id: username, 
          balance: 1000, 
          isAdmin: true, 
          hasMadePact: false,
          achievements: [],
          balanceHistory: [{ date: new Date().getTime(), balance: 1000 }],
          password: adminPassword
        };
        const updatedUsers = [...users, user];
        await saveUsers(updatedUsers);
        return { success: true, user, message: `Bine ai venit, Administrator Principal ${username}!` };
    } else { // Existing admin user
      if (password !== user.password) {
          return { success: false, message: 'Parola de administrator este incorectă.' };
      }
    }
  } else { // Regular user
    if (!user) {
      const initialBalance = 1000;
      user = { 
        id: username, 
        balance: initialBalance, 
        isAdmin: false, 
        hasMadePact: false,
        achievements: [],
        balanceHistory: [{ date: new Date().getTime(), balance: initialBalance }]
      };
      const updatedUsers = [...users, user];
      await saveUsers(updatedUsers);
      return { success: true, user, message: `Bine ai venit, ${username}!` };
    }
  }
  
  return { success: true, user, message: `Bine ai revenit, ${username}!` };
};

export async function addFundsAction(userId: string, amount: number, pactControlEnabled: boolean) {
    const users = await getUsers();
    const currentUser = users.find(u => u.id === userId);
    if (!currentUser) return { success: false, message: 'Utilizator negăsit.' };

    let updatedUser = { ...currentUser };
    let toastMessage = '';
    let achievementAwarded = null;

    if (pactControlEnabled) {
      if (updatedUser.hasMadePact) {
        return { success: false, message: 'Ai făcut deja pactul o dată. Lăcomia este un păcat.' };
      }
      if (amount !== 666) {
        return { success: false, message: 'Lordul Întunericului acceptă doar ofranda standard de 666 de talanți.' };
      }
      updatedUser = updateBalanceHistory(updatedUser, updatedUser.balance + amount);
      updatedUser.hasMadePact = true;
      const { user: userAfterAchievement, awarded, name } = checkAndAwardAchievement(updatedUser, 'PACT_MAKER');
      updatedUser = userAfterAchievement;
      if (awarded) achievementAwarded = { title: "Realizare Deblocată!", description: `Ai primit realizarea: ${name}`};
      toastMessage = `${amount.toFixed(2)} talanți au fost adăugați în cont, cu costul sufletului tău`;
    } else {
       if (amount <= 0) {
        return { success: false, message: 'Trebuie să oferi o sumă validă.' };
      }
      updatedUser = updateBalanceHistory(updatedUser, updatedUser.balance + amount);
      toastMessage = `${amount.toFixed(2)} talanți au fost adăugați în cont.`;
    }
    
    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);
    await saveUsers(updatedUsers);
    
    return { success: true, message: toastMessage, achievement: achievementAwarded };
}


// --- Pariu Actions ---

export async function addPariuAction(data: NewPariuData) {
    const pariuri = await getPariuri();
    const newPariu: Pariu = {
      id: new Date().getTime().toString(),
      title: data.title,
      description: data.description,
      options: data.options.map(o => ({ text: o.text, odds: parseFloat(o.odds) || 1.0 })),
      status: 'open',
      comments: [],
    };
    const updatedPariuri = [newPariu, ...pariuri];
    await savePariuri(updatedPariuri);
    return { success: true, message: 'Un nou pariu a fost creat și este deschis pentru credincioși.' };
}

export async function placeBetAction(pariuId: string, optionIndex: number, amount: number, userId: string) {
    const [bets, users, pariuri] = await Promise.all([getBets(), getUsers(), getPariuri()]);
    const currentUser = users.find(u => u.id === userId);

    if (!currentUser) return { success: false, message: 'Trebuie să fii conectat pentru a plasa un pariu.' };

    const pariu = pariuri.find(p => p.id === pariuId);
    if (!pariu || pariu.status === 'closed') return { success: false, message: 'Acest pariu nu mai este deschis pentru pariuri.' };
    if (amount > currentUser.balance) return { success: false, message: 'Fonduri Insuficiente. Nu ai suficientă balanță pentru a plasa acest pariu.' };

    const userHasBetOnThis = bets.some(b => b.pariuId === pariuId && b.userId === currentUser.id);
    if (userHasBetOnThis) return { success: false, message: 'Ai pariat deja pe acest eveniment.' };

    let updatedUser = updateBalanceHistory(currentUser, currentUser.balance - amount);
    const { user: userAfterAchievement, awarded, name } = checkAndAwardAchievement(updatedUser, 'NOVICE');
    updatedUser = userAfterAchievement;
    let achievementAwarded = null;
    if (awarded) achievementAwarded = { title: "Realizare Deblocată!", description: `Ai primit realizarea: ${name}`};
    
    const updatedUsers = users.map(u => u.id === userId ? updatedUser : u);

    const newBet: Bet = {
      id: new Date().getTime().toString(),
      pariuId,
      optionIndex,
      amount,
      userId: currentUser.id,
      odds: pariu.options[optionIndex].odds,
      date: new Date().getTime()
    };
    const updatedBets = [...bets, newBet];

    await Promise.all([saveUsers(updatedUsers), saveBets(updatedBets)]);

    return { success: true, message: "Pariul a fost plasat, așteaptă și o să vezi cât de mare îți e credința :)", achievement: achievementAwarded };
}

export async function resolvePariuAction(pariuId: string, winningOptionIndex: number) {
    const [pariuri, bets, initialUsers] = await Promise.all([getPariuri(), getBets(), getUsers()]);
    const pariuToResolve = pariuri.find(p => p.id === pariuId);

    if (!pariuToResolve || pariuToResolve.status === 'closed') return { success: false };

    const updatedPariuri = pariuri.map(p =>
      p.id === pariuId
        ? { ...p, status: 'closed' as const, winningOptionIndex }
        : p
    );

    const betsForThisPariu = bets.filter(b => b.pariuId === pariuId);
    let totalWinnings = 0;
    let updatedUsers = [...initialUsers];
    const achievementsToToast: {userId: string, title: string, description: string}[] = [];

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
                const {user: u, awarded, name} = checkAndAwardAchievement(user, 'PROPHET');
                user = u;
                if(awarded) achievementsToToast.push({ userId: user.id, title: "Realizare Deblocată!", description: `Ai primit realizarea: ${name}`});
            }
        }
        
        const userClosedBets = bets
            .filter(b => b.userId === user.id)
            .map(b => ({ bet: b, pariu: updatedPariuri.find(p => p.id === b.pariuId) }))
            .filter(item => item.pariu && item.pariu.status === 'closed')
            .sort((a, b) => b.bet.date - a.bet.date);

        if (userClosedBets.length >= 3) {
            const last3 = userClosedBets.slice(0, 3);
            if (last3.every(item => item.pariu?.winningOptionIndex === item.bet.optionIndex)) {
                const {user: u, awarded, name} = checkAndAwardAchievement(user, 'STREAK');
                user = u;
                 if(awarded) achievementsToToast.push({ userId: user.id, title: "Realizare Deblocată!", description: `Ai primit realizarea: ${name}`});
            }
        }

        if (userClosedBets.length >= 5) {
             const last5 = userClosedBets.slice(0, 5);
             if (last5.every(item => item.pariu?.winningOptionIndex !== item.bet.optionIndex)) {
                const {user: u, awarded, name} = checkAndAwardAchievement(user, 'JOB');
                user = u;
                 if(awarded) achievementsToToast.push({ userId: user.id, title: "Realizare Deblocată!", description: `Ai primit realizarea: ${name}`});
            }
        }

        updatedUsers[userIndex] = user;
    });
    
    await Promise.all([savePariuri(updatedPariuri), saveUsers(updatedUsers)]);

    let message;
    if (totalWinnings > 0) {
        message = `Diavolul își plătește datoriile! S-au plătit ${totalWinnings.toFixed(2)} talanți câștigătorilor.`;
    } else {
        message = `Rezultatul a fost decis. Nu au existat câștigători de data aceasta.`;
    }
    
    return { success: true, message, achievements: achievementsToToast };
}

export async function deletePariuAction(pariuId: string, currentUserId: string) {
    const [pariuri, bets, users] = await Promise.all([getPariuri(), getBets(), getUsers()]);
    const currentUser = users.find(u => u.id === currentUserId);

    if (!currentUser?.isAdmin) {
      return { success: false, message: 'Doar administratorii pot șterge pariuri.' };
    }

    const pariuToDelete = pariuri.find(p => p.id === pariuId);
    if (!pariuToDelete) {
      return { success: false, message: 'Pariul nu a fost găsit.' };
    }

    const hasBetsPlaced = bets.some(bet => bet.pariuId === pariuId);
    if (hasBetsPlaced) {
      return { success: false, message: 'Nu puteți șterge un pariu pe care s-au plasat deja mize. Rezolvați pariul în schimb.' };
    }
    
    const updatedPariuri = pariuri.filter(p => p.id !== pariuId);
    await savePariuri(updatedPariuri);
    return { success: true, message: `Pariul "${pariuToDelete.title}" a fost șters cu succes.` };
}

export async function addCommentAction(pariuId: string, text: string, userId: string) {
    const pariuri = await getPariuri();
    if (!userId) return { success: false };

    const newComment: Comment = {
      userId,
      text,
      date: new Date().getTime(),
    };

    const updatedPariuri = pariuri.map(p => {
      if (p.id === pariuId) {
        return { ...p, comments: [...p.comments, newComment] };
      }
      return p;
    });

    await savePariuri(updatedPariuri);
    return { success: true };
}


// --- Admin Actions ---

export async function toggleAdminAction(targetUserId: string, currentUserId: string) {
    const users = await getUsers();
    const currentUser = users.find(u => u.id === currentUserId);
    
    if (!currentUser || currentUser.id !== users[0]?.id) {
        return { success: false, message: 'Doar administratorul principal poate face această acțiune.' };
    }
    if (targetUserId === users[0]?.id) {
        return { success: false, message: 'Nu puteți modifica statutul administratorului principal.' };
    }

    let message = '';
    const updatedUsers = users.map(u => {
        if (u.id === targetUserId) {
            const isPromoting = !u.isAdmin;
            message = `Utilizatorul ${u.id} este acum ${isPromoting ? 'administrator de pariuri' : 'utilizator standard'}.`;
            if (isPromoting) {
                return { ...u, isAdmin: true, password: '12345678' };
            }
            const { password, ...demotedUser } = u;
            return { ...demotedUser, isAdmin: false };
        }
        return u;
    });
    
    await saveUsers(updatedUsers);
    return { success: true, message };
}

export async function deleteUserAction(targetUserId: string, currentUserId: string) {
     const [users, bets] = await Promise.all([getUsers(), getBets()]);
     const currentUser = users.find(u => u.id === currentUserId);

    if (!currentUser || currentUser.id !== users[0]?.id) {
        return { success: false, message: 'Doar administratorul principal poate face această acțiune.' };
    }
    if (targetUserId === users[0]?.id) {
        return { success: false, message: 'Nu puteți șterge administratorul principal.' };
    }

    const updatedUsers = users.filter(u => u.id !== targetUserId);
    const updatedBets = bets.filter(b => b.userId !== targetUserId);

    await Promise.all([saveUsers(updatedUsers), saveBets(updatedBets)]);

    return { success: true, message: `Utilizatorul ${targetUserId} și pariurile sale au fost șterse.` };
}

export async function updateAdminPasswordAction(targetUserId: string, newPassword: string, currentUserId: string) {
    const users = await getUsers();
    const currentUser = users.find(u => u.id === currentUserId);
    if (!currentUser || currentUser.id !== users[0]?.id) {
      return { success: false, message: 'Doar administratorul principal poate schimba parole.' };
    }
    
    const updatedUsers = users.map(u => {
      if (u.id === targetUserId && u.isAdmin) {
        return { ...u, password: newPassword };
      }
      return u;
    });
    
    await saveUsers(updatedUsers);
    
    return { success: true, message: `Parola pentru ${targetUserId} a fost schimbată cu succes.` };
}
