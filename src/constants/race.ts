export interface CharacterData {
  charIndex: number;
  isCorrect: boolean;
  timestamp: number;
  multiCharacterDelete?: number;
}

export interface WPMData {
  wpm: number;
  timestamp: number;
}

export interface ResultsData {
  passage: string;
  startTime: number;
  dataPoints: Array<WPMData>;
  accuracy: number;
  characters: { correct: number; incorrect: number; total: number };
  testType: { name: string; amount?: number; textType: string };
}
