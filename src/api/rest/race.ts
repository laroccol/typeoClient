import axios from "axios";
import API_URL from "../../constants/api";

interface PassageResponse {
  passage: string;
}

export const getPassage = async (type: number): Promise<string> => {
  try {
    const res = await axios.get<PassageResponse>(
      API_URL + `/race/passage?type=${type}`
    );
    return res.data.passage;
  } catch (err) {
    return Promise.reject(err);
  }
};
