import React from "react";
import axios from "axios";
import API_URL from "../../constants/api";
import { CharacterData } from "../../constants/race";
import { ResultsData } from "../../components/game/components/Results";

interface PassageResponse {
  passage: string;
}

export const getPassage = async (type: number): Promise<string> => {
  const res = await axios.get<PassageResponse>(
    API_URL + `/race/passage?type=${type}`
  );
  return res.data.passage;
};

export const sendRaceData = (
  resultsData: ResultsData,
  characterData: Array<CharacterData>
) => {
  return axios.post(API_URL + "/race/statreport", {
    resultsData: resultsData,
    characterData: characterData,
  });
};

export const useRaceStats = () => {
  const [averageWPM, setAverageWPM] = React.useState<number>(0);
};
