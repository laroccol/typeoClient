import React from "react";
import { useRaceStats } from "../../api/rest/stats";
import StatSection from "./components/StatSection";
import {
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Box,
  Tabs,
  Tab,
  useTheme,
  Theme,
  Typography,
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
// @ts-expect-error No types for module
import SwipeableViews from "react-swipeable-views";
import { Line } from "react-chartjs-2";
import { GraphData } from "../../constants/graphs";
import { RaceSchema } from "../../constants/schemas/race";
import {
  Chart as ChartJS,
  CategoryScale,
  TimeScale,
  TimeSeriesScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { RaceStats, StatsStructure, Timeframes } from "../../constants/stats";
import { useAuth } from "../../contexts/AuthContext";
import { GridCard } from "../common";
import StatKeyboard from "./components/StatKeyboard";
import MissedSequences from "./components/MissedSequences";

ChartJS.register(TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MainStats() {
  const [statTimeframe, setStatTimeframe] = React.useState<number>(
    Timeframes.LAST_100
  );
  const [graphTimeframe, setGraphTimeframe] = React.useState<number>(
    Timeframes.LAST_100
  );
  const [keySpeedTimeframe, setKeySpeedTimeframe] = React.useState<number>(
    Timeframes.LAST_100
  );

  const [missedSequenceTimeframe, setMissedSequenceTimeframe] =
    React.useState<number>(Timeframes.LAST_100);

  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const [stats, setStats] = React.useState<StatsStructure>({
    averages: {
      wpm: 0,
      accuracy: 0,
      mostMissedCharacter: "None",
      characterSpeed: [],
    },
    best: {
      wpm: 0,
      accuracy: 0,
    },
  });

  const { races, getStats } = useRaceStats(
    Math.max(
      statTimeframe,
      graphTimeframe,
      keySpeedTimeframe,
      missedSequenceTimeframe
    )
  );

  const { isLoggedIn, currentUser } = useAuth();
  const theme = useTheme();

  const handleStatTimeframeChange = (event: SelectChangeEvent) => {
    setStatTimeframe(parseInt(event.target.value));
  };

  const handleGraphTimeframeChange = (event: SelectChangeEvent) => {
    setGraphTimeframe(parseInt(event.target.value));
  };

  const handleKeySpeedTimeframeChange = (event: SelectChangeEvent) => {
    setKeySpeedTimeframe(parseInt(event.target.value));
  };

  const handleMissedSequenceTimeframeChange = (event: SelectChangeEvent) => {
    setMissedSequenceTimeframe(parseInt(event.target.value));
  };

  const handleTabChange = (event: React.SyntheticEvent, value: number) => {
    setTabIndex(value);
  };

  const handleTabChangeIndex = (index: number) => {
    setTabIndex(index);
  };

  React.useEffect(() => {
    setStats(
      getStats(statTimeframe, keySpeedTimeframe, missedSequenceTimeframe)
    );
  }, [statTimeframe, keySpeedTimeframe, missedSequenceTimeframe, races]);

  if (!isLoggedIn)
    return (
      <>
        <Box sx={{ textAlign: "center", width: "100%", mt: 20 }}>
          <Typography variant="h2" color="secondary">
            You must be logged in to see stats
          </Typography>
          <Typography variant="h2" color="warning.main" mt={5}>
            Guest Stats Coming Soon
          </Typography>
        </Box>
      </>
    );

  return (
    <>
      <Grid container spacing={3}>
        <Grid item xs={6}>
          <FormControl variant="standard" sx={{ minWidth: 200 }}>
            <InputLabel id="averages-timeframe-label">Timeframe</InputLabel>
            <Select
              label="Timeframe"
              labelId="averages-timeframe-label"
              value={`${statTimeframe}`}
              onChange={handleStatTimeframeChange}
            >
              <MenuItem value={Timeframes.ALL_TIME}>All Time</MenuItem>
              <MenuItem value={Timeframes.LAST_100}>Last 100 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_50}>Last 50 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_25}>Last 25 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_10}>Last 10 Races</MenuItem>
            </Select>
          </FormControl>
          <StatSection title="Averages" data={stats?.averages} />
          <StatSection title="Best Race" data={stats?.best} />
          {stats?.averages.missedTwoLetterSequences ? (
            <>
              <FormControl variant="standard" sx={{ minWidth: 200 }}>
                <InputLabel id="missedsequence-timeframe-label">
                  Timeframe
                </InputLabel>
                <Select
                  label="Timeframe"
                  labelId="missedsequence-timeframe-label"
                  value={`${keySpeedTimeframe}`}
                  onChange={handleMissedSequenceTimeframeChange}
                >
                  <MenuItem value={Timeframes.ALL_TIME}>All Time</MenuItem>
                  <MenuItem value={Timeframes.LAST_100}>
                    Last 100 Races
                  </MenuItem>
                  <MenuItem value={Timeframes.LAST_50}>Last 50 Races</MenuItem>
                  <MenuItem value={Timeframes.LAST_25}>Last 25 Races</MenuItem>
                  <MenuItem value={Timeframes.LAST_10}>Last 10 Races</MenuItem>
                </Select>
              </FormControl>
              <MissedSequences
                missedSequences={stats.averages.missedTwoLetterSequences}
              />
            </>
          ) : null}
        </Grid>
        <Grid item xs={6}>
          <FormControl variant="standard" sx={{ minWidth: 200 }}>
            <InputLabel id="averages-timeframe-label">Timeframe</InputLabel>
            <Select
              label="Timeframe"
              labelId="averages-timeframe-label"
              value={`${graphTimeframe}`}
              onChange={handleGraphTimeframeChange}
            >
              <MenuItem value={Timeframes.ALL_TIME}>All Time</MenuItem>
              <MenuItem value={Timeframes.LAST_100}>Last 100 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_50}>Last 50 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_25}>Last 25 Races</MenuItem>
              <MenuItem value={Timeframes.LAST_10}>Last 10 Races</MenuItem>
            </Select>
          </FormControl>
          <Line
            style={{ paddingBottom: 20 }}
            data={generateGraphDataFromRaces(races, graphTimeframe, theme)}
            options={{
              scales: {
                xAxes: {
                  type: "time",
                  ticks: {
                    maxTicksLimit: 30,
                  },
                },
                yAxes: {
                  ticks: {
                    maxTicksLimit: 20,
                  },
                },
              },
            }}
          />
          {stats?.averages.characterSpeed ? (
            <>
              <FormControl variant="standard" sx={{ minWidth: 200 }}>
                <InputLabel id="keyspeed-timeframe-label">Timeframe</InputLabel>
                <Select
                  label="Timeframe"
                  labelId="keyspeed-timeframe-label"
                  value={`${keySpeedTimeframe}`}
                  onChange={handleKeySpeedTimeframeChange}
                >
                  <MenuItem value={Timeframes.ALL_TIME}>All Time</MenuItem>
                  <MenuItem value={Timeframes.LAST_100}>
                    Last 100 Races
                  </MenuItem>
                  <MenuItem value={Timeframes.LAST_50}>Last 50 Races</MenuItem>
                  <MenuItem value={Timeframes.LAST_25}>Last 25 Races</MenuItem>
                  <MenuItem value={Timeframes.LAST_10}>Last 10 Races</MenuItem>
                </Select>
              </FormControl>
              <StatKeyboard
                data={stats.averages.characterSpeed}
                title="Key Speed"
              />
            </>
          ) : null}
        </Grid>
      </Grid>
    </>
  );
}

const generateGraphDataFromRaces = (
  races: Array<RaceSchema>,
  timeframe: number,
  theme: Theme
) => {
  const filteredRaces = races.filter((race) => race.wpm > 3);
  const graphData = {
    labels: filteredRaces
      .slice(-timeframe)
      .map((race) => new Date(race.timestamp).getTime()),

    datasets: [
      {
        label: "WPM",
        data: filteredRaces.map((race) => race.wpm),
        fill: true,
        borderColor: theme.palette.primary.main,
        tension: 0.1,
      },
      {
        label: "Accuracy",
        data: filteredRaces.map((race) => race.accuracy),
        fill: true,
        borderColor: theme.palette.secondary.main,
        tension: 0.1,
      },
    ],
  };

  return graphData;
};
