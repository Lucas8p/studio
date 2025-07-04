'use server';
/**
 * @fileOverview A Genkit flow that acts as a cryptic oracle and provides an optional audio response.
 *
 * - askOracle - A function that provides a cryptic answer (text and optional audio) to a user's question.
 * - OracleInput - The input type for the askOracle function.
 * - OracleOutput - The return type for the askOracle function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

const OracleInputSchema = z.object({
  question: z.string().describe("The user's question for the oracle."),
  generateAudio: z.boolean().optional(),
});
export type OracleInput = z.infer<typeof OracleInputSchema>;

const OracleOutputSchema = z.object({
  text: z.string().describe("The cryptic text response from the oracle."),
  audio: z.string().describe("A data URI of the spoken response in WAV format.").optional(),
});
export type OracleOutput = z.infer<typeof OracleOutputSchema>;

export async function askOracle(input: OracleInput): Promise<OracleOutput> {
  return oracleFlow(input);
}

const textPrompt = ai.definePrompt({
    name: 'oracleTextPrompt',
    input: { schema: z.string() },
    prompt: `Ești un oracol criptic, înțelept și cu un strop de umor pentru o platformă divină de pariuri numită InspaiărBet.
Un utilizator a venit la tine în căutare de înțelepciune.
Întrebarea utilizatorului: "{{{input}}}"

Sarcina ta este să oferi un răspuns scurt (1-2 propoziții), profetic și enigmatic. Răspunsul tău trebuie să fie vag, dar intrigant, folosind metafore celeste, biblice sau legate de soartă. Nu oferi un răspuns direct. Fă-l să sune profund, dar și puțin amuzant.

Generează doar răspunsul oracolului, fără niciun text introductiv.`,
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

const oracleFlow = ai.defineFlow(
    {
        name: 'oracleFlow',
        inputSchema: OracleInputSchema,
        outputSchema: OracleOutputSchema,
    },
    async (input) => {
        const { question } = input;

        // 1. Generate the text response
        const textResponse = await textPrompt(question);
        const textOutput = textResponse.text || `Stelele sunt neclare în privința asta... Încearcă din nou când soarta va fi mai limpede.`;
        
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
                            // A deeper, more mysterious voice for the oracle
                            prebuiltVoiceConfig: { voiceName: 'Umbriel' },
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
            console.error("TTS generation failed for oracle, returning text only.", error);
        }

        // Return text-only if audio generation fails or returns no data
        return { text: textOutput };
    }
);
