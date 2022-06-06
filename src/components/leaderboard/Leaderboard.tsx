import { Grid, Typography } from "@mui/material";
import React from "react";
import { GridCard, useInterval } from "../common";
import LeaderboardItem from "./LeaderboardItem";

function msToHMS(ms: number) {
  const h = (ms / 3.6e6) | 0;
  const m = ((ms % 3.6e6) / 6e4) | 0;
  const s = ((ms % 6e4) / 1e3) | 0;
  return `${h}:${("" + m).padStart(2, "0")}:${("" + s).padStart(2, "0")}`;
}

interface LeaderboardProps {
  title: string;
  players: {
    place: number;
    name: string;
    accuracy: number;
    wpm: number;
  }[];
}

export default function Leaderboard({ title, players }: LeaderboardProps) {
  const [time, setTime] = React.useState<string>("");

  useInterval(
    () => {
      const date = new Date();
      const easternDate = new Date(
        date.toLocaleString("en-US", {
          timeZone: "America/New_York",
        })
      );
      setTime(
        msToHMS(
          new Date(easternDate).setHours(24, 0, 0, 0) -
            new Date(easternDate).getTime()
        )
      );
    },
    title === "Daily" ? 1000 : null
  );
  return (
    <GridCard textalign="center" sx={{ pt: 5, position: "relative" }}>
      <Typography variant="h3" display="inline" color="secondary">
        {title}
      </Typography>
      {title === "Daily" ? (
        <Typography
          position="absolute"
          variant="h6"
          color="warning.main"
          sx={{ left: 20, top: 20 }}
        >
          {time}
        </Typography>
      ) : null}
      <Typography>Timed, 30 Seconds, Any Text Type</Typography>
      <Typography fontSize="small">(Must be Signed In)</Typography>
      <GridCard sx={{ my: 2 }} color="grey.900">
        <Grid container spacing={0}>
          <Grid item xs={2}>
            <Typography>{"Place"}</Typography>
          </Grid>
          <Grid item xs={6}>
            <Typography>{"Name"}</Typography>
          </Grid>
          <Grid item xs={2}>
            <Typography>{"Accuracy"}</Typography>
          </Grid>
          <Grid item xs={2} position="relative">
            <Typography textAlign="right">{"WPM"}</Typography>
          </Grid>
        </Grid>
      </GridCard>
      {players.map(({ place, name, accuracy, wpm }) => (
        <LeaderboardItem
          key={`${place}_${name}`}
          place={place}
          name={name}
          accuracy={accuracy}
          wpm={wpm}
        />
      ))}
      {/* <LeaderboardItem
        place={1}
        name="lukedamosdflkjslksdj"
        accuracy={104.3}
        wpm={104.3}
      />
      <LeaderboardItem place={2} name="𒐫𒐫𒐫𒐫𒐫" accuracy={104.3} wpm={104.3} />
      <LeaderboardItem place={3} name="luke" accuracy={104.3} wpm={104.3} />
      <LeaderboardItem place={4} name="luke" accuracy={104.3} wpm={104.3} />
      <LeaderboardItem place={5} name="luke" accuracy={104.3} wpm={104.3} /> */}
    </GridCard>
  );
}
