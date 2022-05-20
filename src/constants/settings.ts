export const SettingTypes = {
  TEXT_TYPE: 0,
  GAME_INFO: 1,
};

export const GameTypes = {
  NONE: 0,
  TIMED: 1,
  WORDS: 2,
  ERRORS: 3,
};

export const GameTypeNames = ["None", "Timed", "Words", "Errors"];
export const GameTypeAmounts = [
  [],
  [5, 15, 30, 60, 120],
  [5, 10, 20, 50, 100],
  [1, 2, 3, 4, 5],
];

export const TextTypes = {
  PASSAGE: 0,
  TOP_WORDS: 1,
};

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

export const MatchStatus = {
  WAITING_FOR_PLAYERS: "Waiting For Players",
  STARTING: "Starting",
  STARTED: "Started",
  FINISHED: "Finished",
};
