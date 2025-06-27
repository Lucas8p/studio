
"use client";

import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApp } from '@/hooks/use-app';
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { Textarea } from '@/components/ui/textarea';
import { useState, useEffect } from 'react';
import { PlusCircle, Trash2, Settings, Skull, ShieldCheck, ShieldX, UserX, Sparkles, Wand2 } from 'lucide-react';
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
import type { Pariu } from '@/contexts/app-context';
import { generateBetDescription } from '@/ai/flows/generate-bet-description';
import { generateFullBet } from '@/ai/flows/generate-full-bet-flow';

const formSchema = z.object({
  title: z.string().min(10, {
    message: "Titlul trebuie să aibă cel puțin 10 caractere.",
  }).max(100, {
    message: "Titlul nu trebuie să depășească 100 de caractere.",
  }),
  description: z.string().min(10, {
    message: "Descrierea trebuie să aibă cel puțin 10 caractere.",
  }),
  options: z.array(z.object({
    text: z.string().min(2, "Textul opțiunii trebuie să aibă cel puțin 2 caractere.").max(50, "Textul opțiunii nu trebuie să depășească 50 de caractere."),
    odds: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 1, {
        message: "Cota trebuie să fie un număr mai mare sau egal cu 1.",
    }),
  })).min(2, "Trebuie să oferi cel puțin două opțiuni."),
});

export default function AdminPage() {
  const { pariuri, addPariu, resolvePariu, appName, setAppName, slogan, setSlogan, currentUser, users, toggleAdmin, deleteUser, pactControlEnabled, togglePactControl, deletePariu } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGeneratingDescription, setIsGeneratingDescription] = useState(false);
  const [isGeneratingFullBet, setIsGeneratingFullBet] = useState(false);
  const [generationTheme, setGenerationTheme] = useState('');
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [newName, setNewName] = useState(appName);
  const [newSlogan, setNewSlogan] = useState(slogan);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [pariuToDelete, setPariuToDelete] = useState<Pariu | null>(null);

  const isPrimaryAdmin = currentUser?.id === users[0]?.id;

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      options: [{ text: "", odds: "" }, { text: "", odds: "" }],
    },
  });
  
  useEffect(() => {
    form.reset({
        title: "",
        description: "",
        options: [
            { text: '', odds: (1 + Math.random() * 4).toFixed(2) },
            { text: '', odds: (1 + Math.random() * 4).toFixed(2) },
        ]
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });
  
  const handleGenerateDescription = async () => {
    const title = form.getValues('title');
    const options = form.getValues('options').filter(o => o.text && o.odds); // Filter out empty options
    
    // Trigger validation for title and options to show errors if they are invalid
    const isTitleValid = await form.trigger('title');
    const areOptionsValid = await form.trigger('options');

    if (!isTitleValid || !areOptionsValid || options.length < 2) {
        toast({
            variant: "destructive",
            title: "Date incomplete",
            description: "Te rog completează un titlu și cel puțin două opțiuni valide înainte de a genera descrierea.",
        });
        return;
    }
    
    setIsGeneratingDescription(true);
    try {
        const result = await generateBetDescription({ title, options });
        if (result) {
            form.setValue('description', result, { shouldValidate: true });
        } else {
            toast({ variant: 'destructive', title: 'Generare eșuată', description: 'AI-ul nu a putut genera o descriere. Încearcă din nou.' });
        }
    } catch (error) {
        console.error("Error generating description:", error);
        toast({ variant: 'destructive', title: 'Eroare de la AI', description: 'A apărut o eroare la generarea descrierii.' });
    } finally {
        setIsGeneratingDescription(false);
    }
  };

  const handleGenerateFullBet = async () => {
    if (!generationTheme.trim()) {
        toast({
            variant: "destructive",
            title: "Temă necesară",
            description: "Te rog introdu o temă pentru a genera pariul.",
        });
        return;
    }
    setIsGeneratingFullBet(true);
    try {
        const result = await generateFullBet({ theme: generationTheme });
        if (result) {
            form.reset({
                title: result.title,
                description: result.description,
                options: result.options.map(o => ({
                    text: o.text,
                    odds: o.odds.toFixed(2),
                }))
            });
            toast({ title: 'Pariu Generat!', description: 'Formularul a fost populat cu un nou pariu divin.' });
        } else {
             toast({ variant: 'destructive', title: 'Generare eșuată', description: 'AI-ul nu a putut genera un pariu. Încearcă din nou.' });
        }
    } catch (error) {
        console.error("Error generating full bet:", error);
        toast({ variant: 'destructive', title: 'Eroare de la AI', description: 'A apărut o eroare la generarea pariului.' });
    } finally {
        setIsGeneratingFullBet(false);
    }
  };

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    addPariu(values);
    toast({
      title: "S-a scris!",
      description: "Un nou pariu a fost creat și este deschis pentru credincioși.",
    });
    form.reset({
      title: "",
      description: "",
      options: [
        { text: "", odds: (1 + Math.random() * 4).toFixed(2) }, 
        { text: "", odds: (1 + Math.random() * 4).toFixed(2) }
      ],
    });
    setIsSubmitting(false);
  }

  const handleResolve = (pariuId: string) => {
    const winningIndexStr = selections[pariuId];
    if (winningIndexStr === undefined) {
        toast({ variant: "destructive", title: "Nicio selecție", description: "Te rog selectează o opțiune câștigătoare." });
        return;
    }
    const winningIndex = parseInt(winningIndexStr, 10);
    resolvePariu(pariuId, winningIndex);
    toast({ title: "Pariu Rezolvat!", description: "Rezultatul a fost decis și câștigătorii (dacă există) au fost plătiți." });
  };

  const handleSettingsSave = () => {
    if (newName.trim()) {
        setAppName(newName.trim());
    }
    if (newSlogan.trim()) {
        setSlogan(newSlogan.trim());
    }
    toast({ title: "Setări salvate", description: `Numele și sloganul platformei au fost actualizate.` });
  };
  
  const handlePactToggle = () => {
    togglePactControl();
    toast({
      title: `Modul Pact a fost ${!pactControlEnabled ? 'activat' : 'dezactivat'}`,
      description: !pactControlEnabled ? 'Utilizatorii pot face pactul o singură dată pentru 666 talanți.' : 'Utilizatorii pot adăuga fonduri liber.'
    })
  }
  
  const handleDeleteUser = () => {
      if (userToDelete) {
          deleteUser(userToDelete);
          setUserToDelete(null);
      }
  }

  const handleDeletePariu = () => {
    if (pariuToDelete) {
        deletePariu(pariuToDelete.id);
        setPariuToDelete(null);
    }
  }

  const openPariuri = pariuri.filter(p => p.status === 'open');

  if (!currentUser?.isAdmin) {
    return (
      <div className="flex items-center justify-center h-full">
        <Card className="max-w-md text-center">
            <CardHeader>
                <CardTitle>Acces Interzis</CardTitle>
                <CardDescription>Nu aveți permisiunea de a vizualiza această pagină.</CardDescription>
            </CardHeader>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Rezolvă Pariuri Deschise</CardTitle>
          <CardDescription>Selectează opțiunea câștigătoare pentru a închide pariurile și a plăti câștigătorii.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {openPariuri.length > 0 ? openPariuri.map((pariu, index) => (
            <div key={pariu.id}>
              <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-4 p-4 border rounded-lg">
                <p className="font-medium flex-1 truncate">{pariu.title}</p>
                <div className="flex flex-col sm:flex-row items-stretch gap-2">
                  <Select onValueChange={(value) => setSelections(prev => ({ ...prev, [pariu.id]: value }))}>
                    <SelectTrigger className="w-full sm:w-[250px]">
                      <SelectValue placeholder="Selectează opțiunea câștigătoare" />
                    </SelectTrigger>
                    <SelectContent>
                      {pariu.options.map((option, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {option.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleResolve(pariu.id)} disabled={!selections[pariu.id]}>
                    Rezolvă
                  </Button>
                   <Button variant="ghost" size="icon" onClick={() => setPariuToDelete(pariu)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                </div>
              </div>
              {index < openPariuri.length - 1 && <Separator className="my-6"/>}
            </div>
          )) : (
            <p className="text-muted-foreground text-center">Niciun pariu nu este deschis pentru rezolvare în acest moment.</p>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl flex items-center gap-2"><Wand2 /> Generare Automată de Pariuri</CardTitle>
          <CardDescription>
            Introdu o temă simplă, iar inteligența artificială va crea un pariu complet: titlu, descriere și opțiuni cu cote.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-2">
            <Input 
              placeholder="ex: Tabăra de vară de la munte"
              value={generationTheme}
              onChange={(e) => setGenerationTheme(e.target.value)}
              disabled={isGeneratingFullBet}
            />
            <Button onClick={handleGenerateFullBet} disabled={isGeneratingFullBet || !generationTheme.trim()} className="w-full sm:w-auto">
              {isGeneratingFullBet ? 'Se invocă muza...' : 'Generează Pariu'}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Adaugă Pariu Nou</CardTitle>
          <CardDescription>
            Creează un nou pariu distractiv cu multiple opțiuni și cote, sau folosește generatorul de mai sus.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Titlu Pariu</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ex., Vor fi noile culori ale robelor corului un succes ceresc?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
               <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center justify-between mb-2">
                        <FormLabel>Descriere</FormLabel>
                        <Button type="button" variant="outline" size="sm" onClick={handleGenerateDescription} disabled={isGeneratingDescription}>
                            {isGeneratingDescription ? 'Se generează...' : <><Sparkles className="mr-2 h-4 w-4" /> Generează cu AI</>}
                        </Button>
                    </div>
                    <FormControl>
                      <Textarea rows={4} placeholder="Descrie pariul într-un mod captivant sau generează automat folosind AI." {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <FormLabel>Opțiuni</FormLabel>
                <FormDescription className="mb-2">Adaugă cel puțin două opțiuni cu cotele respective.</FormDescription>
                <div className="space-y-4">
                  {fields.map((field, index) => (
                    <div key={field.id} className="flex flex-col sm:flex-row items-start gap-2">
                      <FormField
                        control={form.control}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem className="w-full sm:flex-1">
                            <FormControl>
                              <Input placeholder={`Text Opțiune ${index + 1}`} {...field} />
                            </FormControl>
                             <FormMessage />
                          </FormItem>
                        )}
                      />
                       <FormField
                        control={form.control}
                        name={`options.${index}.odds`}
                        render={({ field }) => (
                          <FormItem className="w-full sm:w-24">
                            <FormControl>
                              <Input type="number" placeholder="Cote" {...field} step="0.1" />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <Button type="button" variant="ghost" size="icon" onClick={() => remove(index)} disabled={fields.length <= 2}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
                 <FormMessage>{form.formState.errors.options?.message}</FormMessage>
              </div>

              <div className="flex justify-between items-center">
                <Button type="button" variant="outline" onClick={() => append({ text: "", odds: (1 + Math.random() * 4).toFixed(2) })}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adaugă Opțiune
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Se adaugă...' : 'Adaugă Pariu'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {isPrimaryAdmin && (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline text-2xl">Gestiune Utilizatori</CardTitle>
                    <CardDescription>Promovează, retrogradează sau șterge utilizatori.</CardDescription>
                </CardHeader>
                <CardContent>
                     <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Utilizator</TableHead>
                                <TableHead>Rol</TableHead>
                                <TableHead className="text-right">Acțiuni</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {users.map(user => (
                                <TableRow key={user.id}>
                                    <TableCell className="font-medium truncate">{user.id}</TableCell>
                                    <TableCell>
                                        {user.id === users[0].id 
                                            ? <Badge variant="destructive">Admin Principal</Badge> 
                                            : user.isAdmin ? <Badge variant="secondary">Admin Pariuri</Badge> : <Badge variant="outline">Utilizator</Badge>}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        {user.id !== currentUser.id && (
                                            <div className="flex flex-col sm:flex-row gap-2 justify-end">
                                                <Button size="sm" variant="outline" onClick={() => toggleAdmin(user.id)}>
                                                    {user.isAdmin ? <ShieldX /> : <ShieldCheck />}
                                                    <span className="hidden md:inline">{user.isAdmin ? 'Retrogradează' : 'Promovează'}</span>
                                                </Button>
                                                <Button size="sm" variant="destructive" onClick={() => setUserToDelete(user.id)}>
                                                    <UserX />
                                                    <span className="hidden md:inline">Șterge</span>
                                                </Button>
                                            </div>
                                        )}
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
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
                <CardTitle className="font-headline text-2xl">Controlul Pactului</CardTitle>
                <CardDescription>Gestionează modul în care utilizatorii pot adăuga fonduri.</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="flex items-center space-x-4 rounded-md border p-4">
                    <Skull />
                    <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">Mod Pact Unic (666 Talanți)</p>
                        <p className="text-sm text-muted-foreground">
                            Dacă este activat, fiecare utilizator poate face pactul o singură dată pentru a primi exact 666 talanți.
                        </p>
                    </div>
                    <Switch
                        checked={pactControlEnabled}
                        onCheckedChange={handlePactToggle}
                    />
                </div>
            </CardContent>
          </Card>
        </>
      )}

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

       <AlertDialog open={!!pariuToDelete} onOpenChange={(open) => !open && setPariuToDelete(null)}>
        <AlertDialogContent>
            <AlertDialogHeader>
            <AlertDialogTitle>Ești absolut sigur?</AlertDialogTitle>
            <AlertDialogDescription>
                Această acțiune nu poate fi anulată. Acest lucru va șterge definitiv pariul
                <span className="font-bold"> "{pariuToDelete?.title}"</span>.
                <br/><br/>
                Nu puteți șterge un pariu pe care s-au plasat deja mize.
            </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setPariuToDelete(null)}>Anulează</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeletePariu} className="bg-destructive hover:bg-destructive/90">
                Da, șterge pariul
            </AlertDialogAction>
            </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
