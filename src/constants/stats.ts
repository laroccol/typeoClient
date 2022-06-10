export interface StatsStructure {
  averages: RaceStats;
  best: RaceStats;
}

export interface RaceStats {
  wpm: number;
  accuracy: number;
  mostMissedCharacter?: string;
  characterSpeed?: number[];
  missedTwoLetterSequences?: {
    [x: string]: number;
  };
}

export enum Timeframes {
  ALL_TIME = 1000,
  LAST_100 = 100,
  LAST_50 = 50,
  LAST_25 = 25,
  LAST_10 = 10,
}
