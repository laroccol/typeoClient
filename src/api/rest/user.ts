import axios from "axios";
import API_URL from "../../constants/api";
import Firebase from "firebase";
import { MockUser } from "../../contexts/AuthContext";
import { generateAuthHeader } from "..";

const PREFIX = `${API_URL}/user/`;

export const createUser = async (
  currentUser: Firebase.User | MockUser,
  username: string
) => {
  return await axios.post(
    PREFIX + "user-create",
    {
      username: username,
    },
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );
};

export const sendFriendRequest = async (
  currentUser: Firebase.User | MockUser,
  uid: string
) => {
  return await axios.post(
    PREFIX + "friend_request",
    {
      uid: uid,
    },
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );
};

export const acceptFriendRequest = async (
  currentUser: Firebase.User | MockUser,
  uid: string
) => {
  return await axios.post(
    PREFIX + "accept_request",
    {
      uid: uid,
    },
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );
};

export const declineFriendRequest = async (
  currentUser: Firebase.User | MockUser,
  uid: string
) => {
  return await axios.post(
    PREFIX + "decline_request",
    {
      uid: uid,
    },
    {
      withCredentials: true,
      headers: await generateAuthHeader(currentUser),
    }
  );
};

export const getFriendRequests = async (
  currentUser: Firebase.User | MockUser
) => {
  const res = await axios.get(PREFIX + "friend_requests", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });
  return res.data;
};

export interface Friend {
  uid: string;
  username: string;
}

export const getFriends = async (currentUser: Firebase.User | MockUser) => {
  const res = await axios.get(PREFIX + "friends", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });
  return res.data;
};
