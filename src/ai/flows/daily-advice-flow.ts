'use server';
/**
 * @fileOverview A Genkit flow to generate a "Tip of the Day" with optional audio.
 *
 * - getDailyAdvice - A function that generates a cryptic piece of advice, with or without audio.
 * - DailyAdviceInput - The input type for the getDailyAdvice function.
 * - DailyAdviceOutput - The return type for the getDailyAdvice function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const DailyAdviceInputSchema = z.object({
  generateAudio: z.boolean().optional(),
});
export type DailyAdviceInput = z.infer<typeof DailyAdviceInputSchema>;

const DailyAdviceOutputSchema = z.object({
  text: z.string().describe("The cryptic text advice."),
  audio: z.string().describe("A data URI of the spoken advice in WAV format.").optional(),
});
export type DailyAdviceOutput = z.infer<typeof DailyAdviceOutputSchema>;

export async function getDailyAdvice(input: DailyAdviceInput): Promise<DailyAdviceOutput> {
    return dailyAdviceFlow(input);
}

const textPrompt = ai.definePrompt({
    name: 'dailyAdviceTextPrompt',
    prompt: `Ești un oracol înțelept și plin de umor pentru platforma divină de pariuri InspaiărBet.
Sarcina ta este să oferi un "Sfat al Zilei" scurt (o singură propoziție), criptic și amuzant, potrivit pentru un parior.
Folosește un limbaj inspirat din Biblie, cu aluzii la pilde, proverbe sau profeții, dar adaptează-l la contextul pariurilor.
Fă-l să sune ca o profeție sau un proverb ceresc. Să fie încurajator, dar și puțin misterios.

Generează doar sfatul, fără nicio introducere sau alt text suplimentar.`,
});

async function toWav(
  pcmData: Buffer,
  channels = 1,
  rate = 24000,
  sampleWidth = 2
): Promise<string> {
  return new Promise((resolve, reject) => {
    const writer = new wav.Writer({
      channels,
      sampleRate: rate,
      bitDepth: sampleWidth * 8,
    });

    const bufs: Buffer[] = [];
    writer.on('error', reject);
    writer.on('data', function (d) {
      bufs.push(d);
    });
    writer.on('end', function () {
      resolve(Buffer.concat(bufs).toString('base64'));
    });

    writer.write(pcmData);
    writer.end();
  });
}

const dailyAdviceFlow = ai.defineFlow(
    {
        name: 'dailyAdviceFlow',
        inputSchema: DailyAdviceInputSchema,
        outputSchema: DailyAdviceOutputSchema,
    },
    async (input) => {
        // 1. Generate text
        const textResponse = await textPrompt();
        const textOutput = textResponse.text || `Soarta este indecisă astăzi. Încearcă mai târziu.`;

        // 2. Conditionally generate audio if the flag is true
        if (!input.generateAudio) {
            return { text: textOutput };
        }

        try {
            const { media } = await ai.generate({
                model: 'googleai/gemini-2.5-flash-preview-tts',
                config: {
                    responseModalities: ['AUDIO'],
                    speechConfig: {
                        voiceConfig: {
                            // A deep, grave voice for a wise, Oogway-like feel
                            prebuiltVoiceConfig: { voiceName: 'Algenib' },
                        },
                    },
                },
                prompt: textOutput,
            });

            if (media) {
                const audioBuffer = Buffer.from(
                    media.url.substring(media.url.indexOf(',') + 1),
                    'base64'
                );
                
                const wavBase64 = await toWav(audioBuffer);
                const audioDataUri = 'data:audio/wav;base64,' + wavBase64;

                return {
                    text: textOutput,
                    audio: audioDataUri,
                };
            }
        } catch (error: any) {
            console.error("TTS generation failed for daily advice, returning text only.", error);
        }

        // Return text-only if audio generation fails or returns no data
        return { text: textOutput };
    }
);
