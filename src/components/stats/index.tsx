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

ChartJS.register(TimeScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function MainStats() {
  const [statTimeframe, setStatTimeframe] = React.useState<number>(
    Timeframes.LAST_100
  );
  const [graphTimeframe, setGraphTimeframe] = React.useState<number>(
    Timeframes.LAST_100
  );
  const [tabIndex, setTabIndex] = React.useState<number>(0);
  const [stats, setStats] = React.useState<StatsStructure>({
    averages: { wpm: 0, accuracy: 0, mostMissedCharacter: "None" },
    best: { wpm: 0, accuracy: 0, mostMissedCharacter: "None" },
  });

  const { races, getStats } = useRaceStats(
    statTimeframe > graphTimeframe ? statTimeframe : graphTimeframe
  );

  const theme = useTheme();

  const handleStatTimeframeChange = (event: SelectChangeEvent) => {
    setStatTimeframe(parseInt(event.target.value));
  };

  const handleGraphTimeframeChange = (event: SelectChangeEvent) => {
    setGraphTimeframe(parseInt(event.target.value));
  };

  const handleTabChange = (event: React.SyntheticEvent, value: number) => {
    setTabIndex(value);
  };

  const handleTabChangeIndex = (index: number) => {
    setTabIndex(index);
  };

  React.useEffect(() => {
    setStats(getStats(statTimeframe));
  }, [statTimeframe, races]);

  return (
    <>
      <Box
        sx={{
          borderBottom: 1,
          borderColor: "divider",
          mb: 2,
          width: "100%",
        }}
      >
        <Tabs value={tabIndex} onChange={handleTabChange} textColor="secondary">
          <Tab label="Stats" />
          <Tab label="Graphs" />
        </Tabs>
      </Box>
      <SwipeableViews
        index={tabIndex}
        onChangeIndex={handleTabChangeIndex}
        containerStyle={{
          transition: "transform 0.35s cubic-bezier(0.15, 0.3, 0.25, 1) 0s",
        }}
      >
        <Box>
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
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={2}>
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
          </Grid>
          <Grid item xs={11.5}>
            <Line
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
          </Grid>
        </Grid>
      </SwipeableViews>
    </>
  );
}

const generateGraphDataFromRaces = (
  races: Array<RaceSchema>,
  timeframe: number,
  theme: Theme
) => {
  const graphData = {
    labels: races
      .slice(-timeframe)
      .map((race) => new Date(race.timestamp).getTime()),

    datasets: [
      {
        label: "WPM",
        data: races.map((race) => race.wpm),
        fill: true,
        borderColor: theme.palette.primary.main,
        tension: 0.1,
      },
      {
        label: "Accuracy",
        data: races.map((race) => race.accuracy),
        fill: true,
        borderColor: theme.palette.secondary.main,
        tension: 0.1,
      },
    ],
  };

  return graphData;
};
