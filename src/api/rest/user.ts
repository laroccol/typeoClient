import axios from "axios";
import Firebase from "firebase";
import { GuestUser } from "../../contexts/AuthContext";
import { generateAuthHeader } from "..";

export const createUser = async (
  currentUser: Firebase.User | GuestUser,
  username: string
) => {
  return await axios.post(
    "/user/user-create",
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
  currentUser: Firebase.User | GuestUser,
  uid: string
) => {
  return await axios.post(
    "/user/friend_request",
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
  currentUser: Firebase.User | GuestUser,
  uid: string
) => {
  return await axios.post(
    "/user/accept_request",
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
  currentUser: Firebase.User | GuestUser,
  uid: string
) => {
  return await axios.post(
    "/user/decline_request",
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
  currentUser: Firebase.User | GuestUser
) => {
  const res = await axios.get("/user/friend_requests", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });
  return res.data;
};

export interface Friend {
  uid: string;
  username: string;
}

export const getFriends = async (currentUser: Firebase.User | GuestUser) => {
  const res = await axios.get("/user/friends", {
    withCredentials: true,
    headers: await generateAuthHeader(currentUser),
  });
  return res.data;
};
