export interface RaceSchema {
  wpm: number;
  accuracy: number;
  mostMissedCharacter: string;
  testType: { name: string; amount?: number };
  timestamp: string;
}
