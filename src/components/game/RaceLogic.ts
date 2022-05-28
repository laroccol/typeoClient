import React from "react";
import * as RaceAPI from "../../api/rest/race";
import { CharacterData } from "../../constants/race";
import { getPassage } from "../../constants/passages";
import { ResultsData, WPMData } from "../../constants/race";
import { GameTypeNames, GameTypes } from "../../constants/settings";
import { useAuth } from "../../contexts/AuthContext";
import { GameSettings } from "../../contexts/GameSettings";
import { useSocketContext } from "../../contexts/SocketContext";
import { useInterval } from "../common";
import { PlayerData } from "./types/FFAGame";
import { CLIENT_RACE_UPDATE_EVENT } from "../../api/sockets/race";

interface RaceInfo {
  startTime: number;
  textAreaText: string;
  words: Array<string>;
}

interface RaceState {
  isRaceRunning: boolean;
  isCorrect: boolean; // Has an error been made and not fixed
  currentCharIndex: number; // The current character the user is on in the passage (Regardless if they are correct or not)
  currentWordIndex: number; // The index of the start of the word the user is currently on (Regardless if they are correct or not)
  correctWordIndex: number; // The index of the start of the word the user is currently on
  errorIndex: number; // The index where the user made an error and must go back to
  wordsTyped: number; // The number of words typed (Regardless if they are correct or not)
  prevInput: string;
  overflowCount: number; // Detect if we have gone past the last character in the passage
  isRaceFinished: boolean;
}

interface StatState {
  wpm: number;
  wpmData: WPMData[];
  characterTrackingData: CharacterData[];
  resultsData: ResultsData;
}

interface RaceLogicProps {
  settings: GameSettings;
  passage?: string;
}

export default function useRaceLogic({ settings, passage }: RaceLogicProps) {
  const { currentUser } = useAuth();
  const { socket } = useSocketContext();

  // Race Info
  const [raceInfo, setRaceInfo] = React.useState<RaceInfo>({
    startTime: 0,
    textAreaText: "",
    words: [],
  }); // The time the current race started

  const [raceState, setRaceState] = React.useState<RaceState>({
    isRaceRunning: false,
    isCorrect: true,
    currentCharIndex: 0,
    currentWordIndex: 0,
    correctWordIndex: 0,
    errorIndex: 0,
    wordsTyped: 0,
    prevInput: "",
    overflowCount: 0,
    isRaceFinished: false,
  });

  // Game Type Specific
  const [amount, setAmount] = React.useState<number>(0);

  // WPM Tracking
  const [statState, setStatState] = React.useState<StatState>({
    wpm: 0,
    wpmData: [],
    characterTrackingData: [],
    resultsData: {
      passage: "",
      dataPoints: [],
      accuracy: 0,
      characters: { correct: 0, incorrect: 0 },
      testType: { name: "" },
    },
  });

  // Error Tracking
  const [errors, setErrors] = React.useState<number>(0);

  useInterval(
    () => {
      UpdateWPM();
      if (settings.gameInfo.type === GameTypes.TIMED) {
        setAmount((prev: number) => {
          if (prev - 1 <= 0) {
            OnEndRace();
            InitializePassage();
            return settings.gameInfo.amount || 0;
          } else {
            return prev - 1;
          }
        });
      }
    },
    raceState.isRaceRunning ? 1000 : null
  );

  const InitializePassage = () => {
    const textType = settings.textType;
    const gameInfo = settings.gameInfo;

    const newPassage = passage || getPassage(textType);
    const newWords = newPassage.split(" ");

    if (gameInfo.type === GameTypes.WORDS) {
      newWords.length = gameInfo.amount || 0;
    }

    setRaceInfo({
      ...raceInfo,
      textAreaText: newWords.join(" ").trim(),
      words: newWords,
    });
  };

  const OnStartRace = () => {
    setRaceInfo({ ...raceInfo, startTime: Date.now() });
    setRaceState({ ...raceState, isRaceRunning: true, isRaceFinished: false });
  };

  const OnEndRace = () => {
    UpdateWPM();
    setRaceState({ ...raceState, isRaceRunning: false, isRaceFinished: true });
    const correctCharacters = raceState.currentCharIndex - errors;
    const accuracy = (correctCharacters / raceState.currentCharIndex) * 100;
    setStatState((prevStatState) => {
      const resultsData = {
        passage: raceInfo.textAreaText,
        dataPoints: prevStatState.wpmData,
        accuracy: accuracy,
        characters: { correct: correctCharacters, incorrect: errors },
        testType: {
          name: GameTypeNames[settings.gameInfo.type],
          amount: settings.gameInfo.amount,
        },
      };

      try {
        RaceAPI.sendRaceData(
          currentUser,
          resultsData,
          prevStatState.characterTrackingData
        );
      } catch (err) {
        console.error(err);
      }

      return {
        wpm: 0,
        characterTrackingData: [],
        wpmData: [],
        resultsData: resultsData,
      };
    });
  };

  const ResetRace = () => {
    setRaceState({
      isRaceRunning: false,
      isCorrect: true,
      currentCharIndex: 0,
      currentWordIndex: 0,
      correctWordIndex: 0,
      errorIndex: 0,
      wordsTyped: 0,
      prevInput: "",
      overflowCount: 0,
      isRaceFinished: false,
    });

    setStatState({
      wpm: 0,
      characterTrackingData: [],
      wpmData: [],
      resultsData: {
        passage: "",
        dataPoints: [],
        accuracy: 0,
        characters: { correct: 0, incorrect: 0 },
        testType: { name: "" },
      },
    });

    setErrors(0);
    setAmount(settings.gameInfo.amount || 0);

    InitializePassage();
  };

  const UpdateWPM = () => {
    const wpm =
      ((raceState.isCorrect
        ? raceState.currentCharIndex
        : raceState.errorIndex) /
        5 /
        (Date.now() - raceInfo.startTime)) *
      60000;
    setStatState((prevStatState) => {
      return {
        ...prevStatState,
        wpm: +wpm.toFixed(1),
        wpmData: [
          ...prevStatState.wpmData,
          { wpm: wpm, timestamp: Date.now() },
        ],
      };
    });
  };

  const OnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = event.target.value;
    // Handle multi-character deletion
    if (raceState.prevInput.length - inputVal.length > 1) {
      const newRaceState = { ...raceState };
      newRaceState.currentCharIndex =
        raceState.currentCharIndex -
        (raceState.prevInput.length - inputVal.length) +
        1;

      if (newRaceState.currentCharIndex - 1 <= raceState.errorIndex)
        newRaceState.isCorrect = true;
      let letterEndIndex =
        raceInfo.words[raceState.wordsTyped].length -
        (raceState.currentCharIndex - raceState.currentWordIndex + 1);
      for (
        let i = raceState.currentCharIndex;
        i >= newRaceState.currentCharIndex;
        i--
      ) {
        if (
          raceInfo.textAreaText[i] === " " &&
          i !== raceState.currentCharIndex
        ) {
          newRaceState.wordsTyped--;
          letterEndIndex = 0;
        } else {
          letterEndIndex++;
        }
      }
      newRaceState.currentWordIndex =
        newRaceState.currentCharIndex -
        (raceInfo.words[newRaceState.wordsTyped].length - letterEndIndex);
      setRaceState(newRaceState);
    } else if (
      // If we have reached the end of the passage and we are correct, end the race
      inputVal === raceInfo.words[raceState.wordsTyped] &&
      raceState.isCorrect &&
      raceState.currentCharIndex >= raceInfo.textAreaText.length - 1
    ) {
      if (settings.online) {
        socket.emit(CLIENT_RACE_UPDATE_EVENT, raceInfo.words.length);
      } else {
        OnEndRace();
      }
    }
  };

  const OnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    const inputRef = event.target as HTMLInputElement;

    const inputVal = inputRef.value;

    if (!raceState.isRaceRunning) {
      OnStartRace();
    }

    const newRaceState = { ...raceState };

    if (key === "Backspace") {
      // We shouldn't be able to go back past the current word we are on
      if (raceState.overflowCount < 1) {
        if (raceState.currentCharIndex > raceState.correctWordIndex) {
          newRaceState.currentCharIndex--;

          // Going back to a new word
          if (raceInfo.textAreaText[raceState.currentCharIndex - 1] === " ") {
            newRaceState.wordsTyped--;
            newRaceState.currentWordIndex =
              raceState.currentCharIndex -
              raceInfo.words[raceState.wordsTyped - 1].length -
              1;
          }
        }
      } else if (raceState.overflowCount === 1) {
        newRaceState.overflowCount = 0;
      } else {
        newRaceState.overflowCount--;
      }

      // If we go back past where an error was made, we have corrected it
      if (raceState.currentCharIndex - 1 <= raceState.errorIndex) {
        newRaceState.isCorrect = true;
      }
    } else {
      // Keys like alt and ctrl should be ignored for now
      if (key.length !== 1 || event.ctrlKey) return;

      if (raceState.isCorrect) {
        // We have misstyped a character
        if (key !== raceInfo.textAreaText.charAt(raceState.currentCharIndex)) {
          newRaceState.errorIndex = raceState.currentCharIndex;
          newRaceState.isCorrect = false;
          setErrors(errors + 1);

          // Increment the word trackers even if we are wrong on a space
          if (
            raceInfo.textAreaText.charAt(raceState.currentCharIndex) === " "
          ) {
            newRaceState.currentWordIndex = raceState.currentCharIndex + 1;
            newRaceState.wordsTyped++;
          }
        }
        // We have successfully typed a character correctly
        else if (raceInfo.words[raceState.wordsTyped].startsWith(inputVal)) {
          if (key === " ") {
            if (settings.online)
              socket.emit(CLIENT_RACE_UPDATE_EVENT, raceState.wordsTyped + 1);
            newRaceState.correctWordIndex = raceState.currentCharIndex + 1;
            newRaceState.currentWordIndex = raceState.currentCharIndex + 1;
            newRaceState.wordsTyped++;
            inputRef.value = "";
            event.preventDefault();
          }
        }
      }
      // If we are not correct
      else {
        // Increment the word trackers even if we are wrong on a space
        if (raceInfo.textAreaText.charAt(raceState.currentCharIndex) === " ") {
          newRaceState.currentWordIndex = raceState.currentCharIndex + 1;
          newRaceState.wordsTyped++;
        }
      }

      // Always increment currentCharIndex if we have typed a letter unless we are at the end of the passage
      if (raceState.currentCharIndex < raceInfo.textAreaText.length - 1) {
        newRaceState.currentCharIndex++;
      } else {
        newRaceState.overflowCount++;
      }
    }

    newRaceState.prevInput = inputVal;
    console.log(newRaceState);
    setRaceState(newRaceState);
  };

  const addCharacterDataPoint = () => {
    if (!raceState.isRaceRunning) return;
    setStatState((prevStatState) => {
      return {
        ...prevStatState,
        characterTrackingData: [
          ...prevStatState.characterTrackingData,
          {
            charIndex: raceState.currentCharIndex,
            isCorrect: raceState.isCorrect,
            timestamp: Date.now(),
          },
        ],
      };
    });
  };

  React.useEffect(() => {
    setAmount(settings.gameInfo.amount || 0);
    ResetRace();
  }, [settings]);

  React.useEffect(() => {
    InitializePassage();
  }, [passage]);

  React.useEffect(() => {
    const gameInfo = settings.gameInfo;
    if (gameInfo.type === GameTypes.ERRORS && gameInfo.amount) {
      setAmount(gameInfo.amount - errors);
    }
  }, [errors]);

  React.useEffect(() => {
    const gameInfo = settings.gameInfo;
    if (gameInfo.type === GameTypes.WORDS && gameInfo.amount) {
      if (raceState.isCorrect) {
        setAmount(gameInfo.amount - raceState.wordsTyped);
      }
    }
  }, [raceState.wordsTyped]);

  React.useEffect(() => {
    addCharacterDataPoint();
  }, [raceState.currentCharIndex]);

  return {
    raceInfo,
    raceState,
    statState,
    amount,
    OnChange,
    OnKeyDown,
    ResetRace,
  };
}
