'use server';
/**
 * @fileOverview A Genkit flow that acts as a cryptic oracle and provides an audio response.
 *
 * - askOracle - A function that provides a cryptic answer (text and audio) to a user's question.
 * - OracleOutput - The return type for the askOracle function.
 */
import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import wav from 'wav';

// Define output schema
const OracleOutputSchema = z.object({
  text: z.string().describe("The cryptic text response from the oracle."),
  audio: z.string().describe("A data URI of the spoken response in WAV format."),
});
export type OracleOutput = z.infer<typeof OracleOutputSchema>;

export async function askOracle(question: string): Promise<OracleOutput> {
  return oracleFlow(question);
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
        inputSchema: z.string(),
        outputSchema: OracleOutputSchema,
    },
    async (question) => {
        // 1. Generate the text response
        const textResponse = await textPrompt(question);
        const textOutput = textResponse.text || `Stelele sunt neclare în privința asta... Încearcă din nou când soarta va fi mai limpede.`;

        // 2. Generate the audio response from the text
        const { media } = await ai.generate({
            model: 'googleai/gemini-2.5-flash-preview-tts',
            config: {
                responseModalities: ['AUDIO'],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Umbriel' }, // A deeper, more mysterious voice
                    },
                },
            },
            prompt: textOutput,
        });

        if (!media) {
            throw new Error('TTS media generation failed.');
        }

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
);
