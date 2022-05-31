import React from "react";
import SoloGame from "./types/SoloGame";
import FFAGame from "./types/FFAGame";
import {
  JOINED_EXISTING_MATCH_EVENT,
  PLAYER_JOINED_EVENT,
} from "../../api/sockets/matchmaking";
import { Grid, Typography, Card, Button } from "@mui/material";
import Settings from "./components/standardComponents/Settings";
import { useGameSettings } from "../../contexts/GameSettings";
import { io, Socket } from "socket.io-client";
import API_URL from "../../constants/api";
import { useAuth } from "../../contexts/AuthContext";
import Searching from "./components/Searching";
import { LEAVE_QUEUE_EVENT } from "../../api/sockets/matchmaking";
import { useSocketContext } from "../../contexts/SocketContext";
import { useHistory } from "react-router-dom";

interface GameComponentProps {
  online?: boolean;
}

export default function GameComponent(props: GameComponentProps) {
  const { gameSettings } = useGameSettings();
  const { socket } = useSocketContext();
  const history = useHistory();
  console.log(props.online);

  const [online, setOnline] = React.useState<boolean>(props.online || false);
  //const [searching, setSearching] = React.useState<boolean>(false);

  const OnLeaveMatch = () => {
    if (socket) {
      socket.emit(LEAVE_QUEUE_EVENT);
      setOnline(false);
    }
  };

  React.useEffect(() => {
    console.log(props.online);
  }, [props.online]);

  React.useEffect(() => {
    socket.on(PLAYER_JOINED_EVENT, () => {
      setOnline(true);
    });

    socket.on(JOINED_EXISTING_MATCH_EVENT, () => {
      setOnline(true);
    });

    history.replace("/", { online: false });

    return () => {
      socket.removeListener(PLAYER_JOINED_EVENT);
      socket.removeListener(JOINED_EXISTING_MATCH_EVENT);
    };
  }, []);

  return (
    <>
      {online && socket ? (
        <>
          <FFAGame />
          <Button onClick={OnLeaveMatch}>Leave</Button>
          <Button
            onClick={() => {
              console.log(socket);
            }}
          >
            log
          </Button>
        </>
      ) : (
        <>
          <SoloGame />
          {/* <Button onClick={OnFindMatch}>Find Match</Button>
          <Button
            onClick={() => {
              console.log(socket);
            }}
          >
            log
          </Button> */}
        </>
      )}
    </>
  );
}
