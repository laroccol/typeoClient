import Firebase from "firebase";
import { GuestUser } from "../contexts/AuthContext";

export const generateAuthHeader = async (
  currentUser: Firebase.User | GuestUser
) => {
  if (currentUser.email === "null") return null;
  const token = await (currentUser as Firebase.User).getIdToken();
  return {
    "Content-Type": "application/json",
    authorization: `Bearer ${token}`,
  };
};
