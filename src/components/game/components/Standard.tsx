import React, { useState, useEffect, useRef, useCallback } from "react";
import { styled } from "@mui/material/styles";
import { useHistory } from "react-router-dom";
import Grid from "@mui/material/Grid";
import Card from "@mui/material/Card";
import Button from "@mui/material/Button";
import SpeedProgress from "../feedback/SpeedProgress";
import RestartAltIcon from "@mui/icons-material/RestartAlt";
import {
  StyledTextField,
  ElevatedCard,
  GridCard,
  useInterval,
} from "../../common";
import { Box, CircularProgress, Dialog, Typography } from "@mui/material";
import Follower from "../feedback/Follower";
import WordBox from "./WordBox";
import {
  GameTypes,
  GameTypeNames,
  TextTypes,
} from "../../../constants/settings";
import { CharacterData, WPMData } from "../../../constants/race";
import { GameSettings } from "../../../contexts/GameSettings";
import * as RaceAPI from "../../../api/rest/race";
import { useAuth } from "../../../contexts/AuthContext";
import { CLIENT_RACE_UPDATE_EVENT } from "../../../api/sockets/race";
import { useSocketContext } from "../../../contexts/SocketContext";
import Settings from "./Settings";
import Results, { ResultsData } from "./Results";
import { getPassage } from "../../../constants/passages";

const PREFIX = "MuiStandardGame";

const classes = {
  letter: `${PREFIX}-letter`,
  correct: `${PREFIX}-correct`,
  incorrect: `${PREFIX}-incorrect`,
  incorrect_space: `${PREFIX}-incorrect_space`,
};

// TODO jss-to-styled codemod: The Fragment root was replaced by div. Change the tag if needed.
const Root = styled("div")(({ theme }) => ({
  [`& .${classes.letter}`]: {
    display: "inline-block",
  },

  [`& .${classes.correct}`]: {
    color: "white",
  },

  [`& .${classes.incorrect}`]: {
    color: "red",
    backgroundColor: "rgba(255,0,0,0.25)",
  },

  [`& .${classes.incorrect_space}`]: {
    backgroundColor: "rgba(255,0,0,0.25)",
    outline: `1px solid red`,
  },
}));

const styles = {
  letter: {
    display: "inline-block",
  },
  correct: {
    color: "white",
  },
  incorrect: {},
};

interface Props {
  settings: GameSettings;
  passage?: string;
  testDisabled?: boolean;
}

export default function StandardGame(props: Props) {
  const { currentUser } = useAuth();
  const { socket } = useSocketContext();

  // Race Info
  const [startTime, setStartTime] = useState<number>(0); // The time the current race started
  const [textAreaText, setTextAreaText] = useState<string>("");
  const [words, setWords] = useState<Array<string>>([]); // The array of words the passage used

  // Race State
  const [isRaceRunning, setIsRaceRunning] = useState<boolean>(false);
  const [isCorrect, setIsCorrect] = useState<boolean>(true); // If the user currently has typed an error in the passage

  // Location
  const [currentCharIndex, setCurrentCharIndex] = useState<number>(0); // The current character the user is on in the passage (Regardless if they are correct or not)
  const [currentWordIndex, setCurrentWordIndex] = useState<number>(0); // The index of the start of the word the user is currently on
  const [wordIndex, setWordIndex] = useState<number>(0); // The index of the start of the word the user is currently on (Regardless if they are correct or not)
  const [errorIndex, setErrorIndex] = useState<number>(0); // The index where the user made an error and must go back to
  const [wordsTyped, setWordsTyped] = useState<number>(0);
  const [overflowCount, setOverflowCount] = useState<number>(0);

  // Game Type Specific
  const [amount, setAmount] = useState<number>(0);

  // WPM Tracking
  const [wpm, setWPM] = useState<number>(0);
  const [characterTrackingData, setCharacterTrackingData] = useState<
    Array<CharacterData>
  >([]);
  const [wpmData, setWPMData] = useState<Array<WPMData>>([]);
  const [resultsData, setResultsData] = useState<ResultsData>({
    dataPoints: [],
    accuracy: 0,
    characters: { correct: 0, incorrect: 0 },
    testType: { name: "" },
  });

  // Error Tracking
  const [errors, setErrors] = useState<number>(0);

  // Element Details
  const inputRef = useRef<HTMLInputElement>(null);
  const [prevInput, setPrevInput] = useState<string>("");
  const wbRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const [inputDisabled, setInputDisabled] = useState<boolean>(false);
  const [ccol, setCCOL] = useState<number>(0);
  const [ccot, setCCOT] = useState<number>(0);
  const [ccw, setCCW] = useState<number>(0);

  const [resultsOpen, setResultsOpen] = useState<boolean>(false);

  const history = useHistory();

  const StyledAmountCard = styled(Card)(({ theme }) => ({
    visibility:
      props.settings.gameInfo.type === GameTypes.NONE ? "hidden" : "visible",
    display: "inline-block",
    textAlign: "center",
    padding: "10px",
    paddingLeft: "13px",
    paddingTop: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  }));

  useInterval(
    () => {
      UpdateWPM();
      if (props.settings.gameInfo.type === GameTypes.TIMED) {
        setAmount((prev: number) => {
          if (prev - 1 <= 0) {
            OnEndRace();
            InitializePassage();
            return props.settings.gameInfo.amount || 0;
          } else {
            return prev - 1;
          }
        });
      }
    },
    isRaceRunning ? 1000 : null
  );

  const UpdateWPM = () => {
    const wpm =
      ((isCorrect ? currentCharIndex : errorIndex) /
        5 /
        (Date.now() - startTime)) *
      60000;
    setWPM(+wpm.toFixed(1));
    setWPMData((prev) => {
      console.log(prev);
      return [...prev, { wpm: wpm, timestamp: Date.now() }];
    });
  };

  const InitializePassage = React.useCallback(async () => {
    const textType = props.settings.textType;
    const gameInfo = props.settings.gameInfo;

    const newPassage = props.passage || getPassage(textType);
    const newWords = newPassage.split(" ");
    console.log(props);

    if (gameInfo.type === GameTypes.WORDS) {
      newWords.length = gameInfo.amount || 0;
    }
    setTextAreaText(newWords.join(" ").trim());
    setWords(newWords);
  }, [props.passage, props.settings]);

  const OnStartRace = () => {
    setInputDisabled(false);
    setResultsOpen(false);
    if (inputRef.current) inputRef.current.focus();

    setStartTime(Date.now());

    setIsRaceRunning(true);
  };

  const OnEndRace = () => {
    UpdateWPM();
    setResultsOpen(true);
    const correctCharacters = currentCharIndex - errors;
    const accuracy = (correctCharacters / currentCharIndex) * 100;
    setWPMData((prevWPMData) => {
      const resultsData = {
        dataPoints: prevWPMData,
        accuracy: accuracy,
        characters: { correct: correctCharacters, incorrect: errors },
        testType: {
          name: GameTypeNames[props.settings.gameInfo.type],
          amount: props.settings.gameInfo.amount,
        },
      };
      setResultsData(resultsData);
      try {
        RaceAPI.sendRaceData(resultsData, characterTrackingData);
      } catch (err) {
        console.error(err);
      }
      return [];
    });
    Reset();
  };

  const Reset = () => {
    setIsRaceRunning(false);
    setCurrentCharIndex(0);
    setIsCorrect(true);
    setCurrentWordIndex(0);
    setWordIndex(0);
    setErrorIndex(0);
    setWordsTyped(0);
    setStartTime(0);
    setWPM(0);
    setErrors(0);
    setOverflowCount(0);
    setAmount(props.settings.gameInfo.amount || 0);
    setCharacterTrackingData([]);

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }

    if (wbRef.current) {
      for (const child of wbRef.current.children) {
        for (const c of child.children) {
          c.className = classes.letter;
        }
      }
    }
  };

  const CharStyle = {
    NONE: 0,
    CORRECT: 1,
    INCORRECT: 2,
  };

  const setCharStyle = (
    charStyle: number,
    wordIndex: number,
    index: number
  ) => {
    if (!(wbRef.current && wbRef.current.children[wordIndex])) return;
    const charDiv = wbRef.current.children[wordIndex].children[index];
    switch (charStyle) {
      case CharStyle.NONE:
        charDiv.className = classes.letter;
        break;
      case CharStyle.CORRECT:
        charDiv.classList.add(classes.correct);
        break;
      case CharStyle.INCORRECT:
        if (charDiv.innerHTML === "&nbsp;") {
          charDiv.classList.add(classes.incorrect_space);
        } else {
          charDiv.classList.add(classes.incorrect);
        }
        break;
    }
  };

  const OnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const inputVal = event.target.value;

    // If we have reached the end of the passage and we are correct, end the race
    if (
      inputVal === words[wordsTyped] &&
      isCorrect &&
      currentCharIndex >= textAreaText.length - 1
    ) {
      if (props.settings.online) {
        socket.emit(CLIENT_RACE_UPDATE_EVENT, textAreaText);
      } else {
        OnEndRace();
        InitializePassage();
      }
    }
  };

  const OnKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const key = event.key;

    const inputVal = (event.target as HTMLInputElement).value;
    setPrevInput(inputVal);

    if (!isRaceRunning) {
      if (resultsOpen) return;
      OnStartRace();
    }

    // This is neccessary because the states are not updated before the rest of the code is executed, so this is used to hold the new values (mainly for styling purposes)
    let tempCurrentCharIndex = currentCharIndex;
    let tempWordIndex = wordIndex;
    let tempWordsTyped = wordsTyped;
    let newCharStyle = CharStyle.NONE;
    if (key === "Backspace") {
      // We shouldn't be able to go back past the current word we are on
      if (overflowCount < 1) {
        if (currentCharIndex > currentWordIndex) {
          setCurrentCharIndex((prev) => prev - 1);
          tempCurrentCharIndex--;

          // Going back to a new word
          if (textAreaText.charAt(currentCharIndex - 1) === " ") {
            setWordsTyped((prev) => prev - 1);
            tempWordsTyped--;
            setWordIndex(currentCharIndex - words[wordsTyped - 1].length - 1);
            tempWordIndex = currentCharIndex - words[wordsTyped - 1].length - 1;
          }
        }
      } else if (overflowCount === 1) {
        setOverflowCount(0);
      } else {
        setOverflowCount((prev) => prev - 1);
        newCharStyle = CharStyle.INCORRECT;
      }

      // If we go back past where an error was made, we have corrected it
      if (currentCharIndex - 1 <= errorIndex) {
        setIsCorrect(true);
      }

      setCharStyle(
        newCharStyle,
        tempWordsTyped,
        tempCurrentCharIndex - tempWordIndex
      );
    }

    // Keys like alt and ctrl should be ignored for now
    if (key.length !== 1 || event.ctrlKey) return;

    if (isCorrect) {
      // We have misstyped a character
      if (key !== textAreaText.charAt(currentCharIndex)) {
        setErrorIndex(currentCharIndex);
        setIsCorrect(false);
        setErrors((prev) => prev + 1);
        newCharStyle = CharStyle.INCORRECT;

        // Increment the word trackers even if we are wrong on a space
        if (textAreaText.charAt(currentCharIndex) === " ") {
          setWordIndex(currentCharIndex + 1);
          tempWordIndex++;
          setWordsTyped((prev) => prev + 1);
          tempWordsTyped++;
        }
      }
      // We have successfully typed a word correctly
      else if (words[wordsTyped].startsWith(inputVal)) {
        if (key === " ") {
          if (props.settings.online)
            socket.emit(
              CLIENT_RACE_UPDATE_EVENT,
              textAreaText.substring(0, currentWordIndex)
            );
          setCurrentWordIndex(currentCharIndex + 1);
          tempWordIndex++;
          setWordIndex(currentCharIndex + 1);
          setWordsTyped((prev) => prev + 1);
          tempWordsTyped++;
          if (inputRef.current) inputRef.current.value = "";
          event.preventDefault();
        }

        newCharStyle = CharStyle.CORRECT;
      }
    }
    // If we are not correct
    else {
      // Increment the word trackers even if we are wrong on a space
      if (textAreaText.charAt(currentCharIndex) === " ") {
        setWordIndex(currentCharIndex + 1);
        tempWordIndex++;
        setWordsTyped((prev) => prev + 1);
        tempWordsTyped++;
      }

      newCharStyle = CharStyle.INCORRECT;
    }

    // Always increment currentCharIndex if we have typed a letter unless we are at the end of the passage
    if (currentCharIndex < textAreaText.length - 1) {
      setCurrentCharIndex((prev) => prev + 1);
      tempCurrentCharIndex++;
    } else {
      setOverflowCount((prev) => prev + 1);
    }
    setCharStyle(newCharStyle, wordsTyped, currentCharIndex - wordIndex);
  };

  const updateFollower = () => {
    if (
      wbRef.current &&
      wbRef.current.children[1] &&
      wbRef.current.offsetLeft
    ) {
      const charInfo = wbRef.current.children[wordsTyped].children[
        currentCharIndex - wordIndex
      ] as HTMLDivElement;
      setCCOL(wbRef.current.offsetLeft + charInfo.offsetLeft - 1);
      setCCOT(wbRef.current.offsetTop + charInfo.offsetTop + 2.5);
      setCCW(charInfo.offsetWidth + 3);
    }
  };

  const addCharacterDataPoint = () => {
    if (!isRaceRunning) return;
    setCharacterTrackingData((prev) => {
      return [
        ...prev,
        {
          charIndex: currentCharIndex,
          isCorrect: isCorrect,
          timestamp: Date.now(),
        },
      ];
    });
  };

  useEffect(() => {
    InitializePassage().then(() => {
      const initFollowerInterval = setInterval(() => {
        if (wbRef.current && wbRef.current.children[0]) {
          updateFollower();
          clearInterval(initFollowerInterval);
        }
      }, 100);

      const resizeListener = () => {
        updateFollower();
      };
      // set resize listener
      window.addEventListener("resize", resizeListener);

      // clean up function
      return () => {
        // remove resize listener
        window.removeEventListener("resize", resizeListener);
      };
    });
  }, []);

  useEffect(() => {
    setAmount(props.settings.gameInfo.amount || 0);
    Reset();
    InitializePassage();
  }, [props.settings]);

  useEffect(() => {
    InitializePassage();
  }, [props.passage]);

  useEffect(() => {
    const gameInfo = props.settings.gameInfo;
    if (gameInfo.type === GameTypes.ERRORS && gameInfo.amount) {
      setAmount(gameInfo.amount - errors);
    }
  }, [errors]);

  useEffect(() => {
    const gameInfo = props.settings.gameInfo;
    if (gameInfo.type === GameTypes.WORDS && gameInfo.amount) {
      if (isCorrect) {
        setAmount(gameInfo.amount - wordsTyped);
      }
    }
  }, [wordsTyped]);

  useEffect(() => {
    updateFollower();
    addCharacterDataPoint();
  }, [currentCharIndex]);

  return (
    <Root>
      <Results open={resultsOpen} setOpen={setResultsOpen} data={resultsData} />
      <Grid container spacing={3}>
        {!props.settings.online ? (
          <Grid item xs={10} textAlign="center">
            <StyledAmountCard elevation={15}>
              <Typography variant="h4">{amount}</Typography>
            </StyledAmountCard>
          </Grid>
        ) : null}
        <Grid item xs={props.settings.online ? 12 : 10}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GridCard accent={true}>
                <WordBox words={words} boxRef={wbRef} />
                <Follower ccol={ccol} ccot={ccot} ccw={ccw} />
                <SpeedProgress wpm={wpm} />
              </GridCard>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={10}>
              <GridCard accent={true} sx={{ display: "flex" }}>
                <StyledTextField
                  style={{
                    padding: "10px",
                    flexGrow: 1,
                  }}
                  inputProps={{
                    style: { textAlign: "center" },
                  }}
                  variant="standard"
                  required
                  id="type"
                  fullwidth
                  placeholder="Type Here ..."
                  name="type"
                  fontSize="15pt"
                  autoComplete="off"
                  onKeyDown={OnKeyDown}
                  onChange={OnChange}
                  onFocus={React.useCallback(
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                      (e.target.placeholder = ""),
                    []
                  )}
                  onBlur={React.useCallback(
                    (e: React.ChangeEvent<HTMLInputElement>) =>
                      (e.target.placeholder = "Type Here ..."),
                    []
                  )}
                  disabled={inputDisabled || props.testDisabled}
                  inputRef={inputRef}
                />
                {!props.settings.online ? (
                  <Button onClick={Reset} sx={{ display: "inline-block" }}>
                    <RestartAltIcon />
                  </Button>
                ) : null}
              </GridCard>
            </Grid>
          </Grid>
        </Grid>

        {!props.settings.online ? (
          <Grid item xs={2}>
            <Settings />
          </Grid>
        ) : null}
      </Grid>
    </Root>
  );
}
