'use server';
/**
 * @fileOverview A Genkit flow to generate a "Tip of the Day".
 *
 * - getDailyAdvice - A function that generates a cryptic piece of advice.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export async function getDailyAdvice(): Promise<string> {
    return dailyAdviceFlow();
}

const prompt = ai.definePrompt({
    name: 'dailyAdvicePrompt',
    prompt: `Ești un oracol înțelept și plin de umor pentru platforma divină de pariuri InspaiărBet.
Sarcina ta este să oferi un "Sfat al Zilei" scurt (o singură propoziție), criptic și amuzant, potrivit pentru un parior.
Folosește un limbaj inspirat din Biblie, cu aluzii la pilde, proverbe sau profeții, dar adaptează-l la contextul pariurilor.
Fă-l să sune ca o profeție sau un proverb ceresc. Să fie încurajator, dar și puțin misterios.

Generează doar sfatul, fără nicio introducere sau alt text suplimentar.`,
});


const dailyAdviceFlow = ai.defineFlow(
    {
        name: 'dailyAdviceFlow',
        inputSchema: z.void(),
        outputSchema: z.string(),
    },
    async () => {
        const response = await prompt();
        const output = response.text;
        return output || `Soarta este indecisă astăzi. Încearcă mai târziu.`;
    }
);
