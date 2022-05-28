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
  logout: () => Promise<void>;
  isLoggedIn: boolean;
  resetPassword: (email: string) => Promise<void>;
  updateEmail: (email: string) => Promise<void>;
  updatePassword: (password: string) => Promise<void>;
}

const instanceOfFireBaseUser = (object: any): object is FireBase.User => {
  return object.email !== "null";
};

const AuthContext = React.createContext<Auth>({
  currentUser: { displayName: null, email: "null", uid: "null" },
  login: () => Promise.reject(null),
  signup: () => Promise.reject(null),
  logout: () => Promise.reject(),
  isLoggedIn: false,
  resetPassword: () => Promise.reject(),
  updateEmail: () => Promise.reject(),
  updatePassword: () => Promise.reject(),
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
      await createUser(creds.user, username);
    }
    return creds;
  };

  const login = (
    email: string,
    password: string
  ): Promise<FireBase.auth.UserCredential> => {
    return auth.signInWithEmailAndPassword(email, password);
  };

  const logout = (): Promise<void> => {
    return auth.signOut().then(() => {
      setIsLoggedIn(false);
    });
  };

  const resetPassword = (email: string): Promise<void> => {
    return auth.sendPasswordResetEmail(email);
  };

  const updateEmail = (email: string): Promise<void> => {
    if (instanceOfFireBaseUser(currentUser)) {
      return currentUser.updateEmail(email);
    }

    return Promise.reject("Invalid User");
  };

  const updatePassword = (password: string): Promise<void> => {
    if (instanceOfFireBaseUser(currentUser)) {
      return currentUser.updatePassword(password);
    }

    return Promise.reject("Invalid User");
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
  }, [currentUser]);

  const value: Auth = {
    currentUser,
    isLoggedIn,
    login,
    signup,
    logout,
    resetPassword,
    updateEmail,
    updatePassword,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
