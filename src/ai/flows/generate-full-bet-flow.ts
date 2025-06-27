'use server';
/**
 * @fileOverview A Genkit flow to generate a full, ready-to-use bet based on a theme.
 *
 * - generateFullBet - A function that generates a complete bet object.
 * - GenerateFullBetInput - The input type for the generateFullBet function.
 * - GenerateFullBetOutput - The return type for the generateFullBet function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

const GenerateFullBetInputSchema = z.object({
  theme: z.string().describe('The theme for the bet.'),
});
export type GenerateFullBetInput = z.infer<typeof GenerateFullBetInputSchema>;

const GenerateFullBetOutputSchema = z.object({
  title: z.string().describe("A catchy, fun title for the bet (max 100 characters)."),
  description: z.string().describe("A funny, hopeful, and thematic description for the bet (2-3 sentences)."),
  options: z.array(z.object({
      text: z.string().describe("The text for the betting option (max 50 characters)."),
      odds: z.number().describe("A numeric odd value, e.g., 2.5. It should be between 1.1 and 10.0."),
  })).min(2).max(4).describe('An array of 2 to 4 betting options with balanced odds.'),
});
export type GenerateFullBetOutput = z.infer<typeof GenerateFullBetOutputSchema>;

export async function generateFullBet(input: GenerateFullBetInput): Promise<GenerateFullBetOutput> {
    return generateFullBetFlow(input);
}

const prompt = ai.definePrompt({
    name: 'generateFullBetPrompt',
    input: { schema: GenerateFullBetInputSchema },
    output: { schema: GenerateFullBetOutputSchema },
    prompt: `Ești un maestru de ceremonii ceresc, plin de creativitate și umor, pentru casa de pariuri divine "InspaiărBet".
    
Sarcina ta este să creezi un pariu complet, de la zero, bazat pe o temă dată de administrator. Pariul trebuie să fie amuzant, tematic și gata de publicat.

Tema dată: {{{theme}}}

Trebuie să generezi:
1.  **Titlu:** Un titlu captivant, scurt și plin de spirit pentru pariu.
2.  **Descriere:** O descriere de 2-3 propoziții care să explice pariul într-un mod plin de speranță și umor, cu aluzii subtile la credință, soartă sau minuni.
3.  **Opțiuni:** Între 2 și 4 opțiuni de pariere plauzibile și amuzante. Fiecare opțiune trebuie să aibă o cotă numerică realistă. Asigură-te că există un echilibru între cote (ex: o opțiune favorită cu cotă mai mică și altele cu cote mai mari).

Generează doar obiectul JSON conform schemei de output. Nu adăuga niciun alt text.`,
});


const generateFullBetFlow = ai.defineFlow(
    {
        name: 'generateFullBetFlow',
        inputSchema: GenerateFullBetInputSchema,
        outputSchema: GenerateFullBetOutputSchema,
    },
    async (input) => {
        const { output } = await prompt(input);
        if (!output) {
            throw new Error('AI failed to generate a bet.');
        }
        return output;
    }
);
