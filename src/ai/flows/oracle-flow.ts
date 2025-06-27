
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
    prompt: `You are a cryptic, wise, and slightly humorous oracle for a divine betting platform called FaithBet.
A user has come to you seeking wisdom.
User's Question: "{{{input}}}"

Your task is to provide a short (1-2 sentences), prophetic, and enigmatic answer. Your response should be vague but intriguing, using celestial, biblical, or fate-related metaphors. Do not give a direct answer. Make it sound profound but also a little funny.

Generate only the oracle's response, with no introductory text.`,
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

    