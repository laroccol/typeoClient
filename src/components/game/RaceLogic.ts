import React from "react";
import * as RaceAPI from "../../api/rest/race";
import { CharacterData } from "../../constants/race";
import { getPassage } from "../../constants/passages";
import { ResultsData, WPMData } from "../../constants/race";
import {
  GameTypeNames,
  GameTypes,
  TextTypeNames,
} from "../../constants/settings";
import { useAuth } from "../../contexts/AuthContext";
import { GameSettings } from "../../contexts/GameSettings";
import { useSocketContext } from "../../contexts/SocketContext";
import { useInterval } from "../common";
import { CLIENT_RACE_UPDATE_EVENT } from "../../api/sockets/race";

interface RaceInfo {
  startTime: number;
  textAreaText: string;
  words: Array<string>;
}

interface RaceStatus {
  isRaceRunning: boolean;
  isRaceFinished: boolean;
}

interface RaceState {
  isCorrect: boolean; // Has an error been made and not fixed
  currentCharIndex: number; // The current character the user is on in the passage (Regardless if they are correct or not)
  currentWordIndex: number; // The index of the start of the word the user is currently on (Regardless if they are correct or not)
  correctWordIndex: number; // The index of the start of the word the user is currently on
  errorIndex: number; // The index where the user made an error and must go back to
  wordsTyped: number; // The number of words typed (Regardless if they are correct or not)
  prevInput: string;
  overflowCount: number; // Detect if we have gone past the last character in the passage
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
  testDisabled?: boolean;
  setResultsDataProp?: (data: ResultsData) => void;
}

export default function useRaceLogic({
  settings,
  passage,
  testDisabled,
  setResultsDataProp,
}: RaceLogicProps) {
  const { currentUser } = useAuth();
  const { socket } = useSocketContext();

  // Race Info
  const [raceInfo, setRaceInfo] = React.useState<RaceInfo>({
    startTime: 0,
    textAreaText: "",
    words: [],
  }); // The time the current race started

  const [raceStatus, setRaceStatus] = React.useState<RaceStatus>({
    isRaceRunning: false,
    isRaceFinished: false,
  });

  const [raceState, setRaceState] = React.useState<RaceState>({
    isCorrect: true,
    currentCharIndex: 0,
    currentWordIndex: 0,
    correctWordIndex: 0,
    errorIndex: 0,
    wordsTyped: 0,
    prevInput: "",
    overflowCount: 0,
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
      startTime: 0,
      dataPoints: [],
      accuracy: 0,
      characters: { correct: 0, incorrect: 0, total: 0 },
      testType: { name: "", textType: "" },
    },
  });

  const [errors, setErrors] = React.useState<number>(0);

  useInterval(
    () => {
      UpdateWPM();
      if (settings.gameInfo.type === GameTypes.TIMED) {
        setAmount((prev: number) => {
          return prev - 1;
        });
      }
    },
    raceStatus.isRaceRunning ? 1000 : null
  );

  const InitializePassage = () => {
    const textType = settings.textType;
    const gameInfo = settings.gameInfo;

    const newPassage = passage || getPassage(textType);
    const newWords = newPassage.split(" ");

    if (gameInfo.type === GameTypes.WORDS) {
      newWords.length = gameInfo.amount || 0;
      newWords.length -= newWords.length - 2;
    }

    setRaceInfo({
      ...raceInfo,
      textAreaText: newWords.join(" ").trim(),
      words: newWords,
    });
  };

  const OnStartRace = () => {
    setRaceInfo({ ...raceInfo, startTime: Date.now() });
    setRaceStatus({ isRaceRunning: true, isRaceFinished: false });
  };

  const OnEndRace = () => {
    UpdateWPM();
    setRaceStatus({ isRaceRunning: false, isRaceFinished: true });
    const correctCharacters = raceState.currentCharIndex - errors;
    const accuracy = (correctCharacters / raceState.currentCharIndex) * 100;
    setStatState((prevStatState) => {
      const resultsData = {
        passage: raceInfo.textAreaText,
        startTime: raceInfo.startTime,
        dataPoints: prevStatState.wpmData,
        accuracy: accuracy,
        characters: {
          correct: correctCharacters,
          incorrect: errors,
          total: raceState.currentCharIndex,
        },
        testType: {
          name: GameTypeNames[settings.gameInfo.type],
          amount: settings.gameInfo.amount,
          textType: TextTypeNames[settings.textType],
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
        ...prevStatState,
        resultsData: resultsData,
      };
    });
  };

  const ResetRace = (shouldRaceStart: boolean) => {
    setRaceInfo({ ...raceInfo, startTime: 0 });
    setRaceStatus({ isRaceRunning: false, isRaceFinished: false });
    setRaceState({
      isCorrect: true,
      currentCharIndex: 0,
      currentWordIndex: 0,
      correctWordIndex: 0,
      errorIndex: 0,
      wordsTyped: 0,
      prevInput: "",
      overflowCount: 0,
    });

    setStatState({
      wpm: 0,
      characterTrackingData: [],
      wpmData: [],
      resultsData: {
        passage: "",
        startTime: 0,
        dataPoints: [],
        accuracy: 0,
        characters: { correct: 0, incorrect: 0, total: 0 },
        testType: { name: "", textType: "" },
      },
    });

    setErrors(0);
    setAmount(settings.gameInfo.amount || 0);

    if (shouldRaceStart) OnStartRace();
    else InitializePassage();
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
      newRaceState.overflowCount = Math.max(
        0,
        newRaceState.overflowCount -
          (raceState.prevInput.length - inputVal.length) +
          1
      );

      if (newRaceState.overflowCount > 0) {
        setRaceState(newRaceState);
        return;
      }

      newRaceState.currentCharIndex =
        raceState.currentCharIndex -
        (raceState.prevInput.length - inputVal.length) +
        1 +
        raceState.overflowCount;

      if (newRaceState.currentCharIndex - 1 <= raceState.errorIndex)
        newRaceState.isCorrect = true;
      let letterEndIndex =
        raceInfo.words[raceState.wordsTyped].length -
        (raceState.currentCharIndex - raceState.currentWordIndex + 1);

      console.log(raceState.currentCharIndex, newRaceState.currentCharIndex);
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
    }
    if (
      // If we have reached the end of the passage and we are correct, end the race
      inputVal === raceInfo.words[raceState.wordsTyped] &&
      raceState.isCorrect &&
      raceState.currentCharIndex >= raceInfo.textAreaText.length - 1
    ) {
      if (settings.online) {
        socket.emit(
          CLIENT_RACE_UPDATE_EVENT,
          raceState.currentCharIndex + 1,
          raceState.wordsTyped + 1
        );
      }
      OnEndRace();
    }
  };

  const OnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;
    const inputRef = event.target as HTMLInputElement;

    const inputVal = inputRef.value;
    if (!raceStatus.isRaceRunning && !raceStatus.isRaceFinished) {
      if (!settings.online) OnStartRace();
    }

    if (raceStatus.isRaceFinished) return;

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
              socket.emit(
                CLIENT_RACE_UPDATE_EVENT,
                raceState.currentCharIndex + 1,
                raceState.wordsTyped + 1
              );
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
    setRaceState(newRaceState);
  };

  const addCharacterDataPoint = () => {
    if (!raceStatus.isRaceRunning) return;
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
    if (testDisabled === false) {
      OnStartRace();
    }
  }, [testDisabled]);

  React.useEffect(() => {
    console.log(amount);
    if (settings.gameInfo.type !== GameTypes.NONE && amount <= 0) {
      OnEndRace();
    }
  }, [amount]);

  React.useEffect(() => {
    if (setResultsDataProp) setResultsDataProp(statState.resultsData);
  }, [statState.resultsData]);

  React.useEffect(() => {
    addCharacterDataPoint();
  }, [raceState.currentCharIndex]);

  return {
    raceInfo,
    raceStatus,
    raceState,
    statState,
    amount,
    OnChange,
    OnKeyDown,
    ResetRace,
  };
}
