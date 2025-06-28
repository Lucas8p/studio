
"use client";

import { useApp } from '@/hooks/use-app';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { useState } from 'react';
import { Settings, Skull, ShieldCheck, ShieldX, UserX, KeyRound, MessageSquareQuote, AlertTriangle, Coins, Undo2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Badge } from '@/components/ui/badge';
import type { User } from '@/contexts/app-context';

export default function AdminSettingsPage() {
  const { 
    currentUser, 
    users, 
    appName, setAppName, slogan, setSlogan,
    pactControlEnabled, togglePactControl, 
    aiVoiceEnabled, toggleAiVoice,
    toggleAdmin, deleteUser, updateAdminPassword,
    updateUserBalance, resetPact, fullReset
  } = useApp();
  
  const { toast } = useToast();
  
  const [newName, setNewName] = useState(appName);
  const [newSlogan, setNewSlogan] = useState(slogan);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [mainAdminPassword, setMainAdminPassword] = useState('');
  const [otherAdminId, setOtherAdminId] = useState('');
  const [otherAdminPassword, setOtherAdminPassword] = useState('');
  const [balanceInputs, setBalanceInputs] = useState<Record<string, string>>({});


  const isPrimaryAdmin = currentUser?.id === users[0]?.id;

  const handleSettingsSave = () => {
    if (newName.trim()) setAppName(newName.trim());
    if (newSlogan.trim()) setSlogan(newSlogan.trim());
    toast({ title: "Setări salvate", description: `Numele și sloganul platformei au fost actualizate.` });
  };
  
  const handleDeleteUser = () => {
      if (userToDelete) {
          deleteUser(userToDelete);
          setUserToDelete(null);
      }
  }

  const handleChangeMainAdminPassword = () => {
    if (!mainAdminPassword.trim() || !currentUser) {
        toast({ variant: 'destructive', title: 'Parolă Invalidă', description: 'Introduceți o parolă validă.' });
        return;
    }
    updateAdminPassword(currentUser.id, mainAdminPassword);
    setMainAdminPassword('');
  }

  const handleChangeOtherAdminPassword = () => {
    if (!otherAdminId || !otherAdminPassword.trim()) {
        toast({ variant: 'destructive', title: 'Date Incomplete', description: 'Selectați un administrator și introduceți o parolă validă.' });
        return;
    }
    updateAdminPassword(otherAdminId, otherAdminPassword);
    setOtherAdminId('');
    setOtherAdminPassword('');
  }

  const handleBalanceChange = (userId: string, value: string) => {
    setBalanceInputs(prev => ({ ...prev, [userId]: value }));
  };

  const handleSaveBalance = (user: User) => {
    const newBalanceStr = balanceInputs[user.id];
    if (newBalanceStr === undefined || newBalanceStr === '') {
        setBalanceInputs(prev => ({...prev, [user.id]: user.balance.toString()}));
        return;
    }
    const newBalance = parseFloat(newBalanceStr);
    if (!isNaN(newBalance) && newBalance >= 0) {
        updateUserBalance(user.id, newBalance);
    } else {
        toast({ variant: 'destructive', title: 'Balanță invalidă', description: 'Introduceți o valoare numerică validă.' });
        setBalanceInputs(prev => ({...prev, [user.id]: user.balance.toString()}));
    }
  };
  
  const handleFullReset = () => {
    fullReset();
    setIsResetDialogOpen(false);
  }

  const otherAdmins = users.filter(u => u.isAdmin && u.id !== currentUser?.id);


  if (!isPrimaryAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md text-center">
            <CardHeader>
                <CardTitle>Acces Interzis</CardTitle>
                <CardDescription>Doar administratorul principal poate accesa această pagină.</CardDescription>
            </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Gestiune Utilizatori</CardTitle>
                    <CardDescription>Promovează, retrogradează sau șterge utilizatori. Modifică balanțele și anulează pacturi.</CardDescription>
                </CardHeader>
                <CardContent>
                    {/* Mobile View */}
                    <div className="md:hidden space-y-4">
                        {users.map(user => (
                            <Card key={user.id} className="w-full">
                                <CardHeader>
                                    <div className="flex justify-between items-start gap-4">
                                        <div className="space-y-1">
                                            <CardTitle className="truncate max-w-48 text-lg">{user.id}</CardTitle>
                                            <CardDescription>
                                                {user.id === users[0].id 
                                                    ? <Badge variant="destructive">Admin Principal</Badge> 
                                                    : user.isAdmin ? <Badge variant="secondary">Admin Pariuri</Badge> : <Badge variant="outline">Utilizator</Badge>}
                                            </CardDescription>
                                        </div>
                                        {user.hasMadePact && (
                                            <Button size="sm" variant="ghost" className="text-amber-500 shrink-0" onClick={() => resetPact(user.id)}>
                                                <Undo2 className="mr-2 h-4 w-4" /> Anulează Pact
                                            </Button>
                                        )}
                                    </div>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div>
                                        <Label htmlFor={`balance-${user.id}`} className="text-xs">Balanță</Label>
                                        <div className="flex items-center gap-2">
                                            <Input
                                                id={`balance-${user.id}`}
                                                type="number"
                                                className="h-9"
                                                placeholder={user.balance.toFixed(2)}
                                                value={balanceInputs[user.id] ?? user.balance.toFixed(2)}
                                                onChange={(e) => handleBalanceChange(user.id, e.target.value)}
                                            />
                                            <Button size="sm" variant="outline" className="h-9" onClick={() => handleSaveBalance(user)}>
                                                <Coins className="h-4 w-4" />
                                            </Button>
                                        </div>
                                    </div>
                                    {user.id !== currentUser?.id && (
                                        <div>
                                            <Label className="text-xs">Acțiuni Administrative</Label>
                                            <div className="flex flex-col gap-2 mt-1">
                                                <Button size="sm" variant="outline" onClick={() => toggleAdmin(user.id)}>
                                                    {user.isAdmin ? <ShieldX className="mr-2 h-4 w-4"/> : <ShieldCheck className="mr-2 h-4 w-4"/>}
                                                    {user.isAdmin ? 'Retrogradează' : 'Promovează'}
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => setUserToDelete(user.id)}>
                                                    <UserX className="mr-2 h-4 w-4"/>
                                                    Șterge utilizator
                                                </Button>
                                            </div>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Desktop View */}
                    <div className="hidden md:block">
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Utilizator</TableHead>
                                    <TableHead>Balanță</TableHead>
                                    <TableHead>Rol</TableHead>
                                    <TableHead className="text-right">Acțiuni</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {users.map(user => (
                                    <TableRow key={user.id}>
                                        <TableCell className="font-medium truncate max-w-24 sm:max-w-none">{user.id}</TableCell>
                                        <TableCell>
                                            <div className="flex items-center gap-2">
                                                <Input
                                                    type="number"
                                                    className="w-28 h-8"
                                                    placeholder={user.balance.toFixed(2)}
                                                    value={balanceInputs[user.id] ?? user.balance.toFixed(2)}
                                                    onChange={(e) => handleBalanceChange(user.id, e.target.value)}
                                                />
                                                <Button size="sm" variant="outline" className="h-8" onClick={() => handleSaveBalance(user)}>
                                                    <Coins className="h-4 w-4" />
                                                </Button>
                                            </div>
                                        </TableCell>
                                        <TableCell>
                                            {user.id === users[0].id 
                                                ? <Badge variant="destructive">Admin Principal</Badge> 
                                                : user.isAdmin ? <Badge variant="secondary">Admin Pariuri</Badge> : <Badge variant="outline">Utilizator</Badge>}
                                        </TableCell>
                                        <TableCell className="text-right">
                                            <div className="flex flex-col lg:flex-row gap-2 justify-end items-end lg:items-center">
                                                {user.hasMadePact && (
                                                     <Button size="sm" variant="ghost" className="text-amber-500" onClick={() => resetPact(user.id)}>
                                                        <Undo2 className="h-4 w-4 lg:mr-2" />
                                                        <span className="hidden lg:inline">Anulează Pact</span>
                                                    </Button>
                                                )}
                                                {user.id !== currentUser?.id && (
                                                    <>
                                                        <Button size="sm" variant="outline" onClick={() => toggleAdmin(user.id)}>
                                                            {user.isAdmin ? <ShieldX className="h-4 w-4 lg:mr-2"/> : <ShieldCheck className="h-4 w-4 lg:mr-2"/>}
                                                            <span className="hidden lg:inline">{user.isAdmin ? 'Retrogradează' : 'Promovează'}</span>
                                                        </Button>
                                                        <Button size="sm" variant="destructive" onClick={() => setUserToDelete(user.id)}>
                                                            <UserX className="h-4 w-4 lg:mr-2"/>
                                                            <span className="hidden lg:inline">Șterge</span>
                                                        </Button>
                                                    </>
                                                )}
                                            </div>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                </CardContent>
            </Card>

            <Card>
              <CardHeader>
                  <CardTitle className="font-headline text-2xl">Management Parole</CardTitle>
                  <CardDescription>
                      Schimbați parolele pentru conturile de administrator.
                      <span className="font-bold text-destructive/80 block mt-1">Notă: Acesta este un sistem simplificat pentru prototip. Nu utilizați parole reale.</span>
                  </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                  <div>
                      <Label htmlFor="mainAdminPassword">Parola Administratorului Principal</Label>
                      <div className="flex gap-2 mt-1">
                          <Input
                              id="mainAdminPassword"
                              type="password"
                              placeholder="Parolă nouă"
                              value={mainAdminPassword}
                              onChange={(e) => setMainAdminPassword(e.target.value)}
                          />
                          <Button onClick={handleChangeMainAdminPassword} disabled={!mainAdminPassword.trim()}>
                              <KeyRound className="mr-2 h-4 w-4" /> Salvează
                          </Button>
                      </div>
                  </div>

                  {otherAdmins.length > 0 && (
                      <>
                          <Separator />
                          <div>
                              <Label>Parolele Celorlalți Administratori</Label>
                              <div className="flex flex-col sm:flex-row gap-2 mt-1">
                                  <Select onValueChange={setOtherAdminId} value={otherAdminId}>
                                      <SelectTrigger>
                                          <SelectValue placeholder="Selectează un admin" />
                                      </SelectTrigger>
                                      <SelectContent>
                                          {otherAdmins.map(admin => (
                                              <SelectItem key={admin.id} value={admin.id}>{admin.id}</SelectItem>
                                          ))}
                                      </SelectContent>
                                  </Select>
                                  <Input
                                      type="password"
                                      placeholder="Parolă nouă pentru adminul selectat"
                                      value={otherAdminPassword}
                                      onChange={(e) => setOtherAdminPassword(e.target.value)}
                                      disabled={!otherAdminId}
                                  />
                              </div>
                               <Button onClick={handleChangeOtherAdminPassword} disabled={!otherAdminId || !otherAdminPassword.trim()} className="mt-2 w-full sm:w-auto">
                                    <KeyRound className="mr-2 h-4 w-4" /> Schimbă Parola
                                </Button>
                          </div>
                      </>
                  )}
              </CardContent>
            </Card>

           <Card>
              <CardHeader>
                <CardTitle className="font-headline text-2xl">Setări Generale</CardTitle>
                <CardDescription>
                    Modifică numele și sloganul platformei.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                  <div className="space-y-2">
                      <Label htmlFor="appName">Numele Platformei</Label>
                      <Input
                        id="appName"
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                      />
                  </div>
                   <div className="space-y-2">
                      <Label htmlFor="appSlogan">Sloganul Platformei</Label>
                      <Input
                        id="appSlogan"
                        value={newSlogan}
                        onChange={(e) => setNewSlogan(e.target.value)}
                      />
                  </div>
                  <Button onClick={handleSettingsSave}>
                      <Settings className="mr-2 h-4 w-4" />
                      Salvează Setările
                  </Button>
              </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="font-headline text-2xl">Setări Avansate</CardTitle>
              <CardDescription>Gestionează funcționalitățile speciale ale platformei.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center space-x-4 rounded-md border p-4">
                  <MessageSquareQuote />
                  <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Voce AI pentru Oracol & Sfatul Zilei</p>
                      <p className="text-sm text-muted-foreground">
                          Activează/dezactivează generarea audio pentru răspunsurile AI.
                      </p>
                       <p className="text-xs text-amber-500">
                          Atenție: Această funcție utilizează API-ul Google AI (TTS) și poate fi supusă limitelor planului gratuit sau poate genera costuri.
                      </p>
                  </div>
                  <Switch
                      checked={aiVoiceEnabled}
                      onCheckedChange={toggleAiVoice}
                  />
              </div>
              <div className="flex items-center space-x-4 rounded-md border p-4">
                  <Skull />
                  <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium leading-none">Mod Pact Unic (666 Talanți)</p>
                      <p className="text-sm text-muted-foreground">
                          Dacă este activat, fiecare utilizator poate face pactul o singură dată.
                      </p>
                  </div>
                  <Switch
                      checked={pactControlEnabled}
                      onCheckedChange={togglePactControl}
                  />
              </div>
            </CardContent>
          </Card>

           <Card className="border-destructive/50">
                <CardHeader>
                    <CardTitle className="font-headline text-2xl text-destructive flex items-center gap-2"><AlertTriangle/>Zonă de Pericol</CardTitle>
                    <CardDescription>Acțiunile de aici sunt permanente și nu pot fi anulate.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row justify-between items-center rounded-lg border border-destructive/20 p-4">
                        <div>
                            <h4 className="font-semibold">Resetare Totală a Platformei</h4>
                            <p className="text-sm text-muted-foreground">Acest lucru va șterge TOȚI utilizatorii (cu excepția dvs.), TOATE pariurile și TOATE mizele, readucând platforma la starea inițială.</p>
                        </div>
                        <Button variant="destructive" onClick={() => setIsResetDialogOpen(true)} className="mt-2 sm:mt-0">
                            Resetează Platforma
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </>
      
      <AlertDialog open={!!userToDelete} onOpenChange={(open) => !open && setUserToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
            <AlertDialogDescription>
                Această acțiune nu poate fi anulată. Acest lucru va șterge definitiv utilizatorul 
                <span className="font-bold"> {userToDelete} </span> 
                și toate datele asociate (inclusiv pariurile).
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
                Da, șterge utilizatorul
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
            <AlertDialogContent>
                <AlertDialogHeader>
                <AlertDialogTitle>Ești absolut, absolut sigur?</AlertDialogTitle>
                <AlertDialogDescription>
                    Această acțiune va reseta întreaga platformă. TOATE datele vor fi pierdute ireversibil, cu excepția contului tău de administrator principal. E ca și cum ai da foc la întreaga arhivă cerească.
                </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                <AlertDialogCancel>Anulează</AlertDialogCancel>
                <AlertDialogAction onClick={handleFullReset} className="bg-destructive hover:bg-destructive/90">
                    Da, înțeleg, resetează totul
                </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    </div>
  );
}

