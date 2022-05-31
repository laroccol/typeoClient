import React, { useContext, useState, useEffect } from "react";
import FireBase, { auth } from "../firebase";
import { createUser } from "../api/rest/user";
import { v4 as uuidv4 } from "uuid";

export interface GuestUser {
  displayName: string | null;
  email: string;
  uid: string;
}

interface Auth {
  currentUser: FireBase.User | GuestUser;
  login: (
    email: string,
    password: string
  ) => Promise<FireBase.auth.UserCredential | null>;
  signup: (
    email: string,
    username: string,
    password: string
  ) => Promise<FireBase.auth.UserCredential | null>;
  updateProfile: (email: string, username: string) => void;
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  resetPassword: (email: string) => Promise<void>;
}

const instanceOfFireBaseUser = (object: any): object is FireBase.User => {
  return object.email !== "null";
};

const AuthContext = React.createContext<Auth>({
  currentUser: { displayName: null, email: "null", uid: "null" },
  login: () => Promise.reject(null),
  signup: () => Promise.reject(null),
  updateProfile: () => null,
  logout: () => Promise.reject(),
  isLoggedIn: false,
  resetPassword: () => Promise.reject(),
});

export function useAuth(): Auth {
  return useContext(AuthContext);
}

interface AuthProviderProps {
  children: any;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [currentUser, setCurrentUser] = React.useState<
    FireBase.User | GuestUser
  >({
    displayName: null,
    email: "null",
    uid: uuidv4(),
  });
  const [isLoggedIn, setIsLoggedIn] = React.useState<boolean>(false);
  const [loading, setLoading] = React.useState<boolean>(true);

  const signup = async (
    email: string,
    username: string,
    password: string
  ): Promise<FireBase.auth.UserCredential> => {
    const creds = await auth.createUserWithEmailAndPassword(email, password);
    if (creds && creds.user) {
      await creds.user.updateProfile({
        displayName: username,
      });
    }
    return creds;
  };

  const login = (
    email: string,
    password: string
  ): Promise<FireBase.auth.UserCredential> => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const updateProfile = async (email: string, username: string) => {
    if (isLoggedIn) {
      if (email !== currentUser.email) {
        await (currentUser as FireBase.User).updateEmail(email);
      }
      if (username !== currentUser.displayName) {
        await (currentUser as FireBase.User).updateProfile({
          displayName: username,
        });
      }
    }
  };

  const logout = async (): Promise<void> => {
    await auth.signOut();
    setIsLoggedIn(false);
  };

  const resetPassword = (email: string): Promise<void> => {
    return auth.sendPasswordResetEmail(email);
  };

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        setCurrentUser(user);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  auth.onAuthStateChanged((user) => {
    if (user) {
      setCurrentUser(user);
    }
  });

  React.useEffect(() => {
    setIsLoggedIn(instanceOfFireBaseUser(currentUser));
    console.log("ASDFJKLASDFKJ");
  }, [currentUser]);

  const value: Auth = {
    currentUser,
    isLoggedIn,
    login,
    signup,
    updateProfile,
    logout,
    resetPassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
