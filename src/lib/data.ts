import fs from 'fs/promises';
import path from 'path';
import type { User, Pariu, Bet, InitialData, AppSettings } from '@/contexts/app-context';

// Define file paths
const dataDir = path.join(process.cwd(), 'src', 'data');
const usersFilePath = path.join(dataDir, 'users.json');
const pariuriFilePath = path.join(dataDir, 'pariuri.json');
const betsFilePath = path.join(dataDir, 'bets.json');
const settingsFilePath = path.join(dataDir, 'settings.json');


const initialPariuri: Pariu[] = [
  {
    id: '1',
    title: 'Iar ne ține mai mult Gabi Sere la predică?',
    description: "Soarta serii tale... Durata slujbelor devine un joc de noroc. Își va testa Gabi Sere răbdarea turmei sau va arăta o milă neașteptată? Soarta serii tale stă în cumpănă.",
    options: [
      { text: 'Mai vreo ora sigur', odds: 4.0 },
      { text: 'Doar 10 minute', odds: 2.5 },
      { text: 'Nu, scăpăm repede', odds: 1.5 }
    ],
    status: 'open',
    comments: [],
  },
  {
    id: '2',
    title: 'Cântă Revive și anul ăsta "Voi cânta bunătatea Ta" sau nu?',
    description: "Un imn clasic, o trupă legendară. Vor ceda cei de la Revive ispitei de a reaprinde flacăra nostalgiei sau vor alege o cale nouă, necartografiată? Alege cu înțelepciune.",
    options: [
        { text: 'Da, mai merge forjată umpic', odds: 1.7 },
        { text: 'Nu că s-au plictisit și ei de ea', odds: 2.1 },
    ],
    status: 'open',
    comments: [],
  },
  {
    id: '3',
    title: 'Vor ajunge pachețelele de la agapă la toată lumea?',
    description: "O minune modernă a înmulțirii... sau un test de logistică divină. Va reuși comitetul de organizare să satureze mulțimea sau vor rămâne unii flămânzi, meditând la pilda celor cinci pâini și doi pești?",
    options: [
        { text: 'Da, se satură toți și mai rămâne', odds: 1.3 },
        { text: 'Nu, ultimii vor posti', odds: 3.0 }
    ],
    status: 'closed',
    winningOptionIndex: 0,
    comments: [],
  }
];

const initialSettings: AppSettings = {
    appName: 'InspaiărBet',
    slogan: 'Pariază cu inspirație',
    pactControlEnabled: true,
    aiVoiceEnabled: false,
};

// Ensure data directory and files exist
async function ensureFiles() {
    try {
        await fs.mkdir(dataDir, { recursive: true });
        await fs.access(usersFilePath).catch(() => fs.writeFile(usersFilePath, '[]', 'utf8'));
        await fs.access(betsFilePath).catch(() => fs.writeFile(betsFilePath, '[]', 'utf8'));
        await fs.access(pariuriFilePath).catch(() => fs.writeFile(pariuriFilePath, JSON.stringify(initialPariuri, null, 2), 'utf8'));
        await fs.access(settingsFilePath).catch(() => fs.writeFile(settingsFilePath, JSON.stringify(initialSettings, null, 2), 'utf8'));
    } catch (error) {
        console.error("Failed to ensure data files exist:", error);
        // This is a critical error for the app's persistence layer.
        // In a real app, you might want to throw the error to be handled upstream.
        throw new Error("Could not initialize data store.");
    }
}

// Generic read/write functions
async function readData<T>(filePath: string, defaultValue: T): Promise<T> {
    try {
        await ensureFiles();
        const data = await fs.readFile(filePath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist or is corrupted, return default value.
        return defaultValue;
    }
}

async function writeData<T>(filePath: string, data: T): Promise<void> {
    await ensureFiles();
    await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf8');
}

// Exported specific functions
export const getUsers = () => readData<User[]>(usersFilePath, []);
export const saveUsers = (data: User[]) => writeData(usersFilePath, data);

export const getPariuri = () => readData<Pariu[]>(pariuriFilePath, []);
export const savePariuri = (data: Pariu[]) => writeData(pariuriFilePath, data);

export const getBets = () => readData<Bet[]>(betsFilePath, []);
export const saveBets = (data: Bet[]) => writeData(betsFilePath, data);

export const getSettings = () => readData<AppSettings>(settingsFilePath, initialSettings);
export const saveSettings = (data: AppSettings) => writeData(settingsFilePath, data);


export async function getInitialAppData(): Promise<InitialData> {
    const [users, pariuri, bets, settings] = await Promise.all([
        getUsers(),
        getPariuri(),
        getBets(),
        getSettings(),
    ]);

    return {
        users,
        pariuri,
        bets,
        settings
    };
}
