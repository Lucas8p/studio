
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
import { useState } from 'react';
import { PlusCircle, Trash2 } from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';

const formSchema = z.object({
  title: z.string().min(10, {
    message: "Titlul trebuie să aibă cel puțin 10 caractere.",
  }).max(100, {
    message: "Titlul nu trebuie să depășească 100 de caractere.",
  }),
  options: z.array(z.object({
    text: z.string().min(2, "Textul opțiunii trebuie să aibă cel puțin 2 caractere.").max(50, "Textul opțiunii nu trebuie să depășească 50 de caractere."),
    odds: z.string().refine((val) => !isNaN(parseFloat(val)) && parseFloat(val) >= 1, {
        message: "Cota trebuie să fie un număr mai mare sau egal cu 1.",
    }),
  })).min(2, "Trebuie să oferi cel puțin două opțiuni."),
});

export default function AdminPage() {
  const { scenarios, addScenario, resolveScenario } = useApp();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selections, setSelections] = useState<Record<string, string>>({});

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      options: [{ text: "", odds: "" }, { text: "", odds: "" }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "options"
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    await addScenario(values);
    toast({
      title: "S-a scris!",
      description: "Un nou scenariu a fost creat și este deschis pentru pariuri voioase.",
    });
    form.reset({
      title: "",
      options: [{ text: "", odds: "" }, { text: "", odds: "" }],
    });
    setIsSubmitting(false);
  }

  const handleResolve = (scenarioId: string) => {
    const winningIndexStr = selections[scenarioId];
    if (winningIndexStr === undefined) {
        toast({ variant: "destructive", title: "Nicio selecție", description: "Te rog selectează o opțiune câștigătoare." });
        return;
    }
    const winningIndex = parseInt(winningIndexStr, 10);
    resolveScenario(scenarioId, winningIndex);
    toast({ title: "Scenariu Rezolvat!", description: "Rezultatul a fost decis și câștigătorii (dacă există) au fost plătiți." });
  };

  const openScenarios = scenarios.filter(s => s.status === 'open');

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Adaugă Scenariu Nou</CardTitle>
          <CardDescription>
            Creează un nou scenariu distractiv cu multiple opțiuni și cote. O descriere amuzantă va fi generată de AI.
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
                    <FormLabel>Titlu Scenariu</FormLabel>
                    <FormControl>
                      <Textarea placeholder="ex., Vor fi noile culori ale robelor corului un succes ceresc?" {...field} />
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
                    <div key={field.id} className="flex items-start gap-2">
                      <FormField
                        control={form.control}
                        name={`options.${index}.text`}
                        render={({ field }) => (
                          <FormItem className="flex-1">
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
                          <FormItem className="w-24">
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
                <Button type="button" variant="outline" onClick={() => append({ text: "", odds: "" })}>
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Adaugă Opțiune
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Se adaugă...' : 'Adaugă Scenariu cu AI'}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="font-headline text-2xl">Rezolvă Scenarii Deschise</CardTitle>
          <CardDescription>Selectează opțiunea câștigătoare pentru a închide pariurile și a plăti câștigătorii.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {openScenarios.length > 0 ? openScenarios.map((scenario, index) => (
            <div key={scenario.id}>
              <div className="flex justify-between items-center gap-4 p-4 border rounded-lg">
                <p className="font-medium flex-1">{scenario.title}</p>
                <div className="flex items-center gap-2">
                  <Select onValueChange={(value) => setSelections(prev => ({ ...prev, [scenario.id]: value }))}>
                    <SelectTrigger className="w-[250px]">
                      <SelectValue placeholder="Selectează opțiunea câștigătoare" />
                    </SelectTrigger>
                    <SelectContent>
                      {scenario.options.map((option, idx) => (
                        <SelectItem key={idx} value={String(idx)}>
                          {option.text}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Button onClick={() => handleResolve(scenario.id)} disabled={!selections[scenario.id]}>
                    Rezolvă
                  </Button>
                </div>
              </div>
              {index < openScenarios.length - 1 && <Separator className="my-6"/>}
            </div>
          )) : (
            <p className="text-muted-foreground text-center">Niciun scenariu nu este deschis pentru rezolvare în acest moment.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
