import React from "react";
import { Socket } from "socket.io-client";
import { io } from "socket.io-client";
import API_URL from "../constants/api";
import { useAuth } from "./AuthContext";
import Firebase from "../firebase";

interface S_Context {
  socket: Socket;
}

const initialSocket = io(API_URL, { autoConnect: false });

const SocketContext = React.createContext<S_Context>({ socket: initialSocket });

export function useSocketContext() {
  return React.useContext(SocketContext);
}

export function SocketProvider({ children }: { children: any }) {
  const { currentUser, isLoggedIn } = useAuth();
  const [socket, setSocket] = React.useState<Socket>(initialSocket);

  const value = {
    socket,
  };

  React.useEffect(() => {
    socket.on("connect_error", (err) => {
      console.error(err);
    });

    if (!isLoggedIn) {
      socket.auth = { token: currentUser.uid };
      socket.connect();
      return;
    }

    (currentUser as Firebase.User)
      .getIdToken()
      .then((res) => {
        socket.auth = {
          token: res,
        };

        socket.connect();
      })
      .catch((err) => {
        console.error(err);
      });

    return () => {
      socket.removeAllListeners();
    };
  }, [currentUser]);

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}
