
'use server';
/**
 * @fileOverview A Genkit flow that acts as a cryptic oracle.
 *
 * - askOracle - A function that provides a cryptic answer to a user's question.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';

export async function askOracle(question: string): Promise<string> {
    return oracleFlow(question);
}

const prompt = ai.definePrompt({
    name: 'oraclePrompt',
    input: { schema: z.string() },
    prompt: `Ești un oracol criptic, înțelept și cu un strop de umor pentru o platformă divină de pariuri numită FaithBet.
Un utilizator a venit la tine în căutare de înțelepciune.
Întrebarea utilizatorului: "{{{input}}}"

Sarcina ta este să oferi un răspuns scurt (1-2 propoziții), profetic și enigmatic. Răspunsul tău trebuie să fie vag, dar intrigant, folosind metafore celeste, biblice sau legate de soartă. Nu oferi un răspuns direct. Fă-l să sune profund, dar și puțin amuzant.

Generează doar răspunsul oracolului, fără niciun text introductiv.`,
});


const oracleFlow = ai.defineFlow(
    {
        name: 'oracleFlow',
        inputSchema: z.string(),
        outputSchema: z.string(),
    },
    async (question) => {
        const response = await prompt(question);
        const output = response.text;
        return output || `Stelele sunt neclare în privința asta... Încearcă din nou când soarta va fi mai limpede.`;
    }
);
