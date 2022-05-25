export interface StatsStructure {
  averages: RaceStats;
  best: RaceStats;
}

export interface RaceStats {
  wpm: number;
  accuracy: number;
  mostMissedCharacter: string;
}
