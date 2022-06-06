import React from "react";
import axios from "axios";
import { generateAuthHeader } from "..";
import Firebase from "firebase";
import { GuestUser, useAuth } from "../../contexts/AuthContext";
import { RaceStats, StatsStructure, Timeframes } from "../../constants/stats";
import { RaceSchema } from "../../constants/schemas/race";
import { unstable_batchedUpdates } from "react-dom";

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
  });
  const [best, setBest] = React.useState<RaceStats>({
    wpm: 0,
    accuracy: 0,
    mostMissedCharacter: "a",
  });

  const [largestTimeframe, setLargestTimeframe] = React.useState<number>(0);

  const getStats = (inTimeframe: number) => {
    return getRaceStatsFromRaces(races.slice(-inTimeframe));
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
    getPlayerStats(currentUser, timeframe).then(({ races }) => {
      if (isMounted) {
        setRaces(races.reverse());
      }
    });

    return () => {
      isMounted = false;
    };
  }, [timeframe]);

  return { races, getStats };
};

const getRaceStatsFromRaces = (races: Array<RaceStats>) => {
  const averages: RaceStats = {
    wpm: 0,
    accuracy: 0,
    mostMissedCharacter: "None",
  };

  let best: RaceStats = {
    wpm: 0,
    accuracy: 0,
    mostMissedCharacter: "None",
  };

  const mostMissedCharacterMap = new Map<string, number>();
  let maxMissedCharacterCount = 0;

  for (const race of races) {
    if (race.wpm > best.wpm) {
      const { wpm, accuracy, mostMissedCharacter } = race;
      best = { wpm, accuracy, mostMissedCharacter };
    }
    averages.wpm += race.wpm;
    averages.accuracy += race.accuracy;

    const missedCharacter = race.mostMissedCharacter;
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

  averages.wpm /= races.length || 1;
  averages.accuracy /= races.length | 1;

  if (averages.mostMissedCharacter === " ")
    averages.mostMissedCharacter = "Space";

  return { averages, best };
};
