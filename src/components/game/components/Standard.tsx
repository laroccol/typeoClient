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
import WordBox from "./standardComponents/WordBox";
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
import Settings from "./standardComponents/Settings";
import Results from "./standardComponents/Results";
import { ResultsData } from "../../../constants/race";
import { getPassage } from "../../../constants/passages";
import { PlayerData } from "../types/FFAGame";
import useRaceLogic from "../RaceLogic";

const usePrevious = (value: any): any => {
  const ref = useRef<any>();
  useEffect(() => {
    ref.current = value;
  });
  return ref.current;
};

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

interface StandardGameProps {
  settings: GameSettings;
  passage?: string;
  testDisabled?: boolean;
  playerData?: Array<PlayerData>;
}

export default function StandardGame({
  settings,
  passage,
  testDisabled,
  playerData,
}: StandardGameProps) {
  const { currentUser } = useAuth();
  const {
    raceInfo,
    raceState,
    statState,
    amount,
    OnChange,
    OnKeyDown,
    ResetRace,
  } = useRaceLogic({
    settings,
    passage,
  });

  const prevRaceState = usePrevious(raceState);
  // Element Details
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [prevInput, setPrevInput] = React.useState<string>("");
  const wbRef = React.useRef<HTMLDivElement>(null);
  const followerRef = React.useRef<HTMLDivElement>(null);
  const [inputDisabled, setInputDisabled] = React.useState<boolean>(false);
  const [ccol, setCCOL] = React.useState<number>(0);
  const [ccot, setCCOT] = React.useState<number>(0);
  const [ccw, setCCW] = React.useState<number>(0);

  const history = useHistory();

  const StyledAmountCard = styled(Card)(({ theme }) => ({
    visibility:
      settings.gameInfo.type === GameTypes.NONE ? "hidden" : "visible",
    display: "inline-block",
    textAlign: "center",
    padding: "10px",
    paddingLeft: "13px",
    paddingTop: "15px",
    backgroundColor: "rgba(255, 255, 255, 0.15)",
  }));

  const Reset = () => {
    ResetRace();

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
    if (!charDiv) return;
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

  const updateFollower = () => {
    if (
      wbRef.current &&
      wbRef.current.children[1] &&
      wbRef.current.offsetLeft
    ) {
      const charInfo = wbRef.current.children[raceState.wordsTyped].children[
        raceState.currentCharIndex - raceState.currentWordIndex
      ] as HTMLDivElement;
      if (!charInfo) return;
      setCCOL(wbRef.current.offsetLeft + charInfo?.offsetLeft - 1);
      setCCOT(wbRef.current.offsetTop + charInfo?.offsetTop + 2.5);
      setCCW(charInfo?.offsetWidth + 3);
    }
  };

  useEffect(() => {
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

    if (inputRef.current) {
      inputRef.current.value = "";
      inputRef.current.focus();
    }

    // clean up function
    return () => {
      // remove resize listener
      window.removeEventListener("resize", resizeListener);
    };
  }, []);

  React.useEffect(() => {
    if (raceState.isRaceFinished) {
      if (inputRef.current) inputRef.current.value = "";
    }
  }, [raceState.isRaceFinished]);

  useEffect(() => {
    updateFollower();

    const prevCurrentCharIndex = prevRaceState?.currentCharIndex || 0;
    const prevCurrentWordIndex = prevRaceState?.currentWordIndex || 0;
    const prevWordsTyped = prevRaceState?.wordsTyped || 0;
    const characterDifference =
      raceState.currentCharIndex - prevCurrentCharIndex;
    if (characterDifference === 1) {
      setCharStyle(
        raceState.isCorrect ? CharStyle.CORRECT : CharStyle.INCORRECT,
        prevWordsTyped,
        prevCurrentCharIndex - prevCurrentWordIndex
      );
    } else if (characterDifference === -1) {
      setCharStyle(
        CharStyle.NONE,
        raceState.wordsTyped,
        raceState.currentCharIndex - raceState.currentWordIndex
      );
    } else if (characterDifference < -1) {
      let currentWordsTyped = raceState.wordsTyped;
      let letterIndex = raceState.currentCharIndex - raceState.currentWordIndex;
      for (let i = raceState.currentCharIndex; i < prevCurrentCharIndex; i++) {
        setCharStyle(CharStyle.NONE, currentWordsTyped, letterIndex);
        if (raceInfo.textAreaText[i] === " ") {
          currentWordsTyped++;
          letterIndex = 0;
        } else {
          letterIndex++;
        }
      }
    }
  }, [raceState.currentCharIndex, raceState.isCorrect]);

  React.useEffect(() => {
    if (!testDisabled) Reset();
  }, [testDisabled]);

  React.useEffect(() => {
    updateFollower();
  }, [playerData?.length]);

  return (
    <Root>
      {currentUser.uid}
      <Results
        open={raceState.isRaceFinished}
        setOpen={Reset}
        data={statState.resultsData}
      />
      <Grid container spacing={3}>
        {!settings.online ? (
          <Grid item xs={10} textAlign="center">
            <StyledAmountCard elevation={15}>
              <Typography variant="h4">{amount}</Typography>
            </StyledAmountCard>
          </Grid>
        ) : null}
        <Grid item xs={settings.online ? 12 : 10}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <GridCard accent={true}>
                <WordBox words={raceInfo.words} boxRef={wbRef} />
                <Follower ccol={ccol} ccot={ccot} ccw={ccw} />
                {playerData
                  ? playerData.map((player) => {
                      if (player.id === currentUser.uid) return null;
                      const { col, cot, cw } = calculateFollowerPosition(
                        player.percentage,
                        raceInfo.words,
                        wbRef
                      );
                      return (
                        <Follower
                          key={player.id}
                          ccol={col}
                          ccot={cot}
                          ccw={cw}
                        />
                      );
                    })
                  : null}
                <SpeedProgress wpm={statState.wpm} />
              </GridCard>
            </Grid>
            <Grid item xs={1}></Grid>
            <Grid item xs={10}>
              <GridCard accent={true} sx={{ display: "flex" }}>
                <StyledTextField
                  style={{
                    padding: "10px",
                    flexGrow: 1,
                    backgroundColor: raceState.isCorrect ? "inherit" : "red",
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
                  disabled={inputDisabled || testDisabled}
                  inputRef={inputRef}
                />
                {!settings.online ? (
                  <Button onClick={Reset} sx={{ display: "inline-block" }}>
                    <RestartAltIcon />
                  </Button>
                ) : null}
              </GridCard>
            </Grid>
          </Grid>
        </Grid>

        {!settings.online ? (
          <Grid item xs={2}>
            <Settings />
          </Grid>
        ) : null}
      </Grid>
    </Root>
  );
}

const calculateFollowerPosition = (
  percentage: number,
  passageArray: Array<string>,
  wordBoxRef: React.RefObject<HTMLDivElement>
): { col: number; cot: number; cw: number } => {
  if (
    wordBoxRef.current &&
    wordBoxRef.current.children[1] &&
    wordBoxRef.current.offsetLeft
  ) {
    let wordIndex = Math.ceil(percentage * wordBoxRef.current.children.length);
    let charIndex = 0;
    if (wordIndex === passageArray.length) {
      wordIndex = passageArray.length - 1;
      charIndex = passageArray[wordIndex].length - 1;
    }
    if (!wordBoxRef.current.children[wordIndex])
      return { col: 0, cot: 0, cw: 0 };
    const charInfo = wordBoxRef.current.children[wordIndex].children[
      charIndex
    ] as HTMLDivElement;

    return {
      col: wordBoxRef.current.offsetLeft + charInfo.offsetLeft - 1,
      cot: wordBoxRef.current.offsetTop + charInfo.offsetTop + 2.5,
      cw: charInfo.offsetWidth + 3,
    };
  }
  return { col: 0, cot: 0, cw: 0 };
};
