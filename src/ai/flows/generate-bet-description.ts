'use server';
/**
 * @fileOverview A Genkit flow to generate a funny description for a new bet.
 *
 * - generateBetDescription - A function that generates a description for a bet.
 * - GenerateBetDescriptionInput - The input type for the generateBetDescription function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateBetDescriptionInputSchema = z.object({
  title: z.string().describe('The title of the bet.'),
  options: z.array(z.object({
      text: z.string(),
      odds: z.string(),
  })).describe('The options for the bet.')
});
export type GenerateBetDescriptionInput = z.infer<typeof GenerateBetDescriptionInputSchema>;

export async function generateBetDescription(input: GenerateBetDescriptionInput): Promise<string> {
    return generateBetDescriptionFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateBetDescriptionPrompt',
    input: { schema: GenerateBetDescriptionInputSchema },
    prompt: `Ești un cronicar ceresc plin de înțelepciune și umor pentru o casă de pariuri divină numită InspireBet.
    
Sarcina ta este să scrii o descriere scurtă (2-3 propoziții), captivantă și plină de speranță pentru un nou pariu, bazată pe titlul și opțiunile acestuia.
Descrierea ar trebui să fie plină de umor fin, referințe biblice subtile, aluzii la mântuire, credință și providență. Fă-o să sune ca o încercare de credință unde voința divină se manifestă.

Titlul pariului: {{{title}}}

Opțiunile de pariere sunt:
{{#each options}}
- {{this.text}} (Cota: {{this.odds}})
{{/each}}

Generează doar textul descrierii, fără nicio introducere sau alt text suplimentar.`,
});


const generateBetDescriptionFlow = ai.defineFlow(
    {
        name: 'generateBetDescriptionFlow',
        inputSchema: GenerateBetDescriptionInputSchema,
        outputSchema: z.string(),
    },
    async (input) => {
        const response = await prompt(input);
        const output = response.text;
        return output || `O descriere misterioasă pentru "${input.title}" se va dezvălui în curând...`;
    }
);
