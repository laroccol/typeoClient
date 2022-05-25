import React from "react";
import axios from "axios";
import API_URL from "../../constants/api";
import { CharacterData } from "../../constants/race";
import { ResultsData } from "../../constants/race";
import { RaceStats } from "../../constants/stats";
import { generateAuthHeader } from "..";
import Firebase from "firebase";
import { MockUser } from "../../contexts/AuthContext";

interface PassageResponse {
  passage: string;
}

export const getPassage = async (type: number): Promise<string> => {
  const res = await axios.get<PassageResponse>(
    API_URL + `/race/passage?type=${type}`
  );
  return res.data.passage;
};

export const sendRaceData = async (
  currentUser: Firebase.User | MockUser,
  resultsData: ResultsData,
  characterData: Array<CharacterData>
) => {
  return axios.post(
    API_URL + "/race/statreport",
    {
      resultsData: resultsData,
      characterData: characterData,
    },
    { withCredentials: true, headers: await generateAuthHeader(currentUser) }
  );
};
