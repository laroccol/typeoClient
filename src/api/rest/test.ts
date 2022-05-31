import axios from "axios";
import API_URL from "../../constants/api";
import Firebase from "firebase";
import { generateAuthHeader } from "../";
import { GuestUser } from "../../contexts/AuthContext";

export const getTestData = async (currentUser: Firebase.User | GuestUser) => {
  const res = await axios.get(API_URL + "/test", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });
  return JSON.stringify(res.data);
};
