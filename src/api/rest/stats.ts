import React from "react";
import axios from "axios";
import { generateAuthHeader } from "..";
import Firebase from "firebase";
import { GuestUser, useAuth } from "../../contexts/AuthContext";
import { RaceStats, StatsStructure, Timeframes } from "../../constants/stats";
import { RaceSchema } from "../../constants/schemas/race";
import { unstable_batchedUpdates } from "react-dom";
import { CharacterData } from "../../constants/race";

export const getPlayerStats = async (
  currentUser: Firebase.User | GuestUser,
  timeframe: number
): Promise<{ races: Array<RaceSchema> }> => {
  const res = await axios.get(`/stats/getstats?timeframe=${timeframe}`, {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });

  return res.data;
};

export const useRaceStats = (timeframe: number) => {
  const { currentUser } = useAuth();
  const [races, setRaces] = React.useState<Array<RaceSchema>>([]);
  const [averages, setAverages] = React.useState<RaceStats>({
    wpm: 0,
    accuracy: 0,
    mostMissedCharacter: "a",
    characterSpeed: new Array(26).fill(0),
    missedTwoLetterSequences: {},
  });
  const [best, setBest] = React.useState<RaceStats>({
    wpm: 0,
    accuracy: 0,
  });

  const [largestTimeframe, setLargestTimeframe] = React.useState<number>(0);

  const getStats = (
    statsTimeframe: number,
    keySpeedTimeframe: number,
    missedSequenceTimeframe: number
  ) => {
    return getRaceStatsFromRaces(
      races,
      statsTimeframe,
      keySpeedTimeframe,
      missedSequenceTimeframe
    );
  };

  React.useEffect(() => {
    if (
      largestTimeframe === Timeframes.ALL_TIME ||
      timeframe <= largestTimeframe
    )
      return;
    setLargestTimeframe(timeframe);
    console.log("Calling API", timeframe);
    let isMounted = true;
    getPlayerStats(currentUser, Timeframes.ALL_TIME).then(({ races }) => {
      if (isMounted) {
        setRaces(races.reverse());
      }
    });

    return () => {
      isMounted = false;
    };
  }, []);

  return { races, getStats };
};

const getRaceStatsFromRaces = (
  races: RaceSchema[],
  statTimeframe = Timeframes.ALL_TIME,
  keySpeedTimeframe = Timeframes.ALL_TIME,
  missedSequenceTimeframe = Timeframes.ALL_TIME
) => {
  const averages: RaceStats = {
    wpm: 0,
    accuracy: 0,
    mostMissedCharacter: "None",
    characterSpeed: [],
    missedTwoLetterSequences: {},
  };

  let best: RaceStats = {
    wpm: 0,
    accuracy: 0,
  };

  const statRaces = races.slice(-statTimeframe);

  const mostMissedCharacterMap = new Map<string, number>();
  let maxMissedCharacterCount = 0;

  for (const race of statRaces) {
    if (race.wpm > best.wpm) {
      const { wpm, accuracy } = race;
      best = { wpm, accuracy };
    }

    averages.wpm += race.wpm;
    averages.accuracy += race.accuracy;

    // Most Missed Character Calculation
    const missedCharacter = getMosedMissedCharacter(
      race.characterDataPoints,
      race.passage
    );
    if (missedCharacter !== "None") {
      const newCharacterCount =
        (mostMissedCharacterMap.get(missedCharacter) || 0) + 1;
      mostMissedCharacterMap.set(missedCharacter, newCharacterCount);

      if (newCharacterCount > maxMissedCharacterCount) {
        averages.mostMissedCharacter = missedCharacter;
        maxMissedCharacterCount = newCharacterCount;
      }
    }
  }

  const keySpeedRaces = races.slice(-keySpeedTimeframe);

  let averageCharacterSpeed = new Array(26).fill(0);
  const averageCharacterSpeedCount = new Array(26).fill(0);

  for (const race of keySpeedRaces) {
    // Character Speed Calculation
    const characterSpeed = getCharacterSpeed(race.characterDataPoints);
    if (characterSpeed) {
      for (const [index, keySpeed] of characterSpeed.entries()) {
        if (keySpeed !== 0) {
          averageCharacterSpeed[index] += keySpeed;
          averageCharacterSpeedCount[index]++;
        }
      }
    }
  }

  const missedSequenceRaces = races.slice(-missedSequenceTimeframe);

  const missedTwoLetterSequences = {};

  for (const race of missedSequenceRaces) {
    // Missed Sequences
    getMissedCharacterSequences(
      missedTwoLetterSequences,
      race.characterDataPoints,
      race.passage
    );
  }

  averages.wpm /= statRaces.length || 1;
  averages.accuracy /= statRaces.length | 1;

  if (averages.mostMissedCharacter === " ")
    averages.mostMissedCharacter = "Space";

  averageCharacterSpeed = averageCharacterSpeed.map(
    (speed, index) => speed / (averageCharacterSpeedCount[index] || 1)
  );

  averages.characterSpeed = averageCharacterSpeed;

  averages.missedTwoLetterSequences = missedTwoLetterSequences;

  return { averages, best };
};

export const getMosedMissedCharacter = (
  characterDataPoints: CharacterData[],
  passage: string
) => {
  let mostMissedCharacter = "None";
  if (!characterDataPoints) return mostMissedCharacter;

  const characterMap = new Map<string, number>();
  let maxCount = 0;
  let compoundError = false;
  for (const element of characterDataPoints) {
    if (!element.isCorrect && !compoundError) {
      const character = passage[element.charIndex - 1];
      const newCharacterCount = (characterMap.get(character) || 0) + 1;
      characterMap.set(character, newCharacterCount);

      if (newCharacterCount > maxCount) {
        mostMissedCharacter = character;
        maxCount = newCharacterCount;
      }
    } else if (element.isCorrect && compoundError) {
      compoundError = false;
    }
  }

  return mostMissedCharacter;
};

export const getCharacterSpeed = (characterDataPoints: CharacterData[]) => {
  const characterSpeeds = new Array(26).fill(0);
  if (!characterDataPoints) return characterSpeeds;

  const characterCount = new Array(26).fill(0);
  for (const [index, dataPoint] of characterDataPoints.entries()) {
    if (
      index === 0 ||
      !/^[a-z]$/.test(dataPoint.character) ||
      !dataPoint.isCorrect
    )
      continue;
    let prevCorrect = -1;
    for (let i = index - 1; i >= 0; i--) {
      if (characterDataPoints[i].isCorrect) {
        prevCorrect = i;
        break;
      }
    }
    if (prevCorrect === -1) continue;
    const timeBetweenKeys =
      dataPoint.timestamp - characterDataPoints[prevCorrect].timestamp;
    const charSpeed = 0.2 / (timeBetweenKeys / 60000);
    const charIndex = dataPoint.character.charCodeAt(0) - 97;
    characterCount[charIndex]++;
    characterSpeeds[charIndex] =
      characterSpeeds[charIndex] +
      (charSpeed - characterSpeeds[charIndex]) / characterCount[charIndex];
  }
  return characterSpeeds;
};

export const getMissedCharacterSequences = (
  missedSequences: { [x: string]: number },
  characterDataPoints: CharacterData[],
  passage: string
) => {
  if (!characterDataPoints) return missedSequences;
  for (const [index, dataPoint] of characterDataPoints.entries()) {
    if (index === 0) continue;
    if (!dataPoint.isCorrect && characterDataPoints[index - 1].isCorrect) {
      const sequence = `${characterDataPoints[index - 1].character}${
        passage[dataPoint.charIndex]
      }`;
      if (sequence in missedSequences) missedSequences[sequence]++;
      else missedSequences[sequence] = 1;
    }
  }

  return missedSequences;
};
