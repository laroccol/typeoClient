import React, { useContext, useState } from "react";
import { GameTypes, TextTypes } from "../constants/settings";

export interface GameSettings {
  textType: TextTypes;
  gameInfo: {
    type: GameTypes;
    amount?: number;
  };
  online: boolean;
}

interface ContextGameSettings {
  gameSettings: GameSettings;
  setGameSettings: (v: GameSettings) => void;
}

const GameSettingsContext = React.createContext<ContextGameSettings>({
  gameSettings: {
    textType: TextTypes.TOP_WORDS,
    gameInfo: { type: GameTypes.NONE },
    online: false,
  },
  setGameSettings: () => {
    null;
  },
});

export function useGameSettings(): ContextGameSettings {
  return useContext(GameSettingsContext);
}

interface ProviderProps {
  children: any;
}

export function GameSettingsProvider({ children }: ProviderProps) {
  const [gameSettings, setGameSettings] = useState<GameSettings>({
    textType: TextTypes.TOP_WORDS,
    gameInfo: { type: GameTypes.NONE },
    online: false,
  });

  const value = {
    gameSettings,
    setGameSettings,
  };

  return (
    <GameSettingsContext.Provider value={value}>
      {children}
    </GameSettingsContext.Provider>
  );
}
