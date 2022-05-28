export enum SettingTypes {
  TEXT_TYPE,
  GAME_INFO,
}

export enum GameTypes {
  NONE,
  TIMED,
  WORDS,
  ERRORS,
}

export const GameTypeNames = ["None", "Timed", "Words", "Errors"];
export const GameTypeAmounts = [
  [],
  [5, 15, 30, 60, 120],
  [5, 10, 20, 50, 100],
  [1, 2, 3, 4, 5],
];

export enum TextTypes {
  PASSAGE,
  TOP_WORDS,
}

export const TextTypeNames = ["Passage", "Top Words"];

export const DefaultGameSettings = {
  textType: TextTypes.PASSAGE,
  gameInfo: { type: GameTypes.NONE },
  online: false,
};

export const DefaultOnlineGameSettings = {
  textType: TextTypes.PASSAGE,
  gameInfo: { type: GameTypes.NONE },
  online: true,
};

export enum MatchStatus {
  WAITING_FOR_PLAYERS = "Waiting For Players",
  STARTING = "Starting",
  STARTED = "Started",
  FINISHED = "Finished",
}
