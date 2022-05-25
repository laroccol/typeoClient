import React from "react";
import axios from "axios";
import { generateAuthHeader } from "..";
import API_URL from "../../constants/api";
import Firebase from "firebase";
import { MockUser, useAuth } from "../../contexts/AuthContext";
import { RaceStats, StatsStructure } from "../../constants/stats";

export const getPlayerStats = async (
  currentUser: Firebase.User | MockUser,
  timeframe: number
): Promise<StatsStructure> => {
  const res = await axios.get(
    API_URL + `/stats/getstats?timeframe=${timeframe}`,
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );

  console.log(res.data);

  return res.data;
};

export const useRaceStats = (timeframe: number) => {
  const { currentUser } = useAuth();
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

  React.useEffect(() => {
    let isMounted = true;
    getPlayerStats(currentUser, timeframe).then(({ averages, best }) => {
      console.log(averages, best);
      if (isMounted) {
        setAverages(averages);
        setBest(best);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [timeframe]);

  return { averages, best };
};
