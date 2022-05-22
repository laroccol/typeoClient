import React from "react";
import { Socket } from "socket.io-client";
import {
  Grid,
  Button,
  Dialog,
  Box,
  Typography,
  CircularProgress,
  Modal,
} from "@mui/material";
import StandardGame from "../components/Standard";
import RacersBox from "../components/RacersBox";
import {
  DefaultOnlineGameSettings,
  MatchStatus,
} from "../../../constants/settings";
import { useSocketContext } from "../../../contexts/SocketContext";
import {
  JoinQueue,
  JOIN_QUEUE_EVENT,
  PLAYER_JOINED_EVENT,
  PLAYER_LEFT_EVENT,
  MATCH_STARTING_EVENT,
  JOINED_EXISTING_MATCH_EVENT,
  MATCH_STARTED_EVENT,
  MATCH_CANCELED_EVENT,
  LeaveQueue,
} from "../../../api/sockets/matchmaking";

import {
  SERVER_RACE_UPDATE_EVENT,
  RACER_FINISHED_EVENT,
  RACE_COMPLETE_EVENT,
  MatchUpdate,
  RacerFinish,
} from "../../../api/sockets/race";
import { useHistory } from "react-router-dom";
import { GridCard } from "../../common";

export interface PlayerData {
  id: string;
  percentage: number;
  wpm: string;
}

const MATCH_COUTDOWN = 12000;

export default function FFAGame() {
  const [playerData, setPlayerData] = React.useState<Array<PlayerData>>([]);
  const [status, setStatus] = React.useState<MatchStatus>(
    MatchStatus.WAITING_FOR_PLAYERS
  );
  const [countdown, setCountdown] = React.useState<number>(0);
  const [passage, setPassage] = React.useState<string>(" ");
  const [countdownInterval, setCountdownInterval] = React.useState<number>(0);

  const parentRef = React.useRef<HTMLDivElement>(null);

  const { socket } = useSocketContext();
  const history = useHistory();

  const PlayerJoined = (
    player: string,
    players: Array<string>,
    matchPassage: string
  ) => {
    setPassage((prev) => {
      if (prev === " ") {
        return matchPassage;
      }
      return prev;
    });
    setPlayerData(players.map((val) => ({ id: val, percentage: 0, wpm: "0" })));
  };

  const PlayerLeft = (player: string, players: Array<string>) => {
    setPlayerData((prev) => prev.filter((val) => val.id !== player));
  };

  const MatchStarting = () => {
    setStatus(MatchStatus.STARTING);
    setCountdown(MATCH_COUTDOWN / 1000 - 1);
    setCountdownInterval(() => {
      const interval = window.setInterval(() => {
        setCountdown((prev) => {
          if (prev === 0) {
            clearInterval(countdownInterval);
            clearInterval();
            return 0;
          } else {
            return prev - 1;
          }
        });
      }, 1000);
      return interval;
    });
  };

  const JoinedExistingMatch = (time: number) => {
    setCountdown((time - (time % 1000)) / 1000 - 1);
    setTimeout(() => {
      setCountdownInterval(() => {
        const interval = window.setInterval(() => {
          setCountdown((prev) => {
            if (prev === 0) {
              clearInterval(interval);
              return 0;
            } else {
              return prev - 1;
            }
          });
        }, 1000);
        return interval;
      });
    }, time % 1000);
  };

  const MatchCancelled = () => {
    setCountdownInterval((prev) => {
      clearInterval(prev);
      return prev;
    });
    setStatus(MatchStatus.WAITING_FOR_PLAYERS);
  };

  const MatchStarted = () => {
    setCountdownInterval((prev) => {
      clearInterval(prev);
      return prev;
    });
    setStatus(MatchStatus.STARTED);
  };

  const ServerRaceUpdate = (update: MatchUpdate) => {
    if (update) {
      setPlayerData((prev) => {
        const playerIndex = prev.findIndex((val) => val.id === update.id);
        const prevCopy = [...prev];
        prevCopy[playerIndex] = {
          id: update.id,
          percentage: update.percentage,
          wpm: update.wpm.toFixed(1),
        };
        return prevCopy;
      });
    }
  };

  const RacerFinished = (racerFinish: RacerFinish) => {
    if (racerFinish) {
      setPlayerData((prev) => {
        const playerIndex = prev.findIndex((val) => val.id === racerFinish.id);
        const prevCopy = [...prev];
        prevCopy[playerIndex] = {
          id: racerFinish.id,
          percentage: 1,
          wpm: `${racerFinish.place} - ${racerFinish.wpm.toFixed(1)}`,
        };
        return prevCopy;
      });
    }
  };

  const OnLeaveMatch = () => {
    LeaveQueue(socket);
    history.push("/");
  };

  React.useEffect(() => {
    socket.on(PLAYER_JOINED_EVENT, PlayerJoined);
    socket.on(PLAYER_LEFT_EVENT, PlayerLeft);
    socket.on(MATCH_STARTING_EVENT, MatchStarting);
    socket.on(JOINED_EXISTING_MATCH_EVENT, JoinedExistingMatch);
    socket.on(MATCH_CANCELED_EVENT, MatchCancelled);
    socket.on(MATCH_STARTED_EVENT, MatchStarted);
    socket.on(SERVER_RACE_UPDATE_EVENT, ServerRaceUpdate);
    socket.on(RACER_FINISHED_EVENT, RacerFinished);

    JoinQueue(socket);

    return () => {
      socket.removeListener(PLAYER_JOINED_EVENT, PlayerJoined);
      socket.removeListener(PLAYER_LEFT_EVENT, PlayerLeft);
      socket.removeListener(MATCH_STARTING_EVENT, MatchStarting);
      socket.removeListener(JOINED_EXISTING_MATCH_EVENT, JoinedExistingMatch);
      socket.removeListener(MATCH_CANCELED_EVENT, MatchCancelled);
      socket.removeListener(MATCH_STARTED_EVENT, MatchStarted);
      socket.removeListener(SERVER_RACE_UPDATE_EVENT, ServerRaceUpdate);
      socket.removeListener(RACER_FINISHED_EVENT, RacerFinished);

      LeaveQueue(socket);
    };
  }, []);
  return (
    <>
      <Grid
        container
        spacing={3}
        sx={{ marginTop: 5, position: "relative" }}
        ref={parentRef}
      >
        <Dialog
          open={status !== MatchStatus.STARTED}
          container={parentRef.current}
          sx={{ position: "absolute" }}
        >
          <Box textAlign="center" padding={4}>
            {status === MatchStatus.WAITING_FOR_PLAYERS ? (
              <CircularProgress />
            ) : (
              <Typography>{countdown}</Typography>
            )}
            <Typography sx={{ marginTop: 3 }}>{status}</Typography>
            <Button
              variant="outlined"
              sx={{ marginTop: 3 }}
              onClick={() => history.push("/")}
            >
              <Typography>Leave</Typography>
            </Button>
          </Box>
        </Dialog>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <RacersBox racerData={playerData} />
        </Grid>
        <Grid item xs={12}>
          <StandardGame
            passage={passage}
            settings={DefaultOnlineGameSettings}
            testDisabled={status != MatchStatus.STARTED}
          />
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
      {/* <Button onClick={OnLeaveMatch}>Leave</Button> */}
    </>
  );
}
