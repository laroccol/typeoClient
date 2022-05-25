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
} from "@mui/material";
import Select, { SelectChangeEvent } from "@mui/material/Select";
// @ts-expect-error No types for module
import SwipeableViews from "react-swipeable-views";
import { Line } from "react-chartjs-2";
import { GraphData } from "../../constants/graphs";
const graphData: GraphData = {
  labels: ["1", "2", "3", "4"],
  datasets: [
    {
      label: "Test",
      data: [
        { x: "1", y: 2 },
        { x: "2", y: 3 },
        { x: "3", y: 1 },
        { x: "4", y: 2 },
      ],
      fill: true,
      borderColor: "#ffffff",
      tension: 0.1,
    },
  ],
};
export default function MainStats() {
  const [timeframe, setTimeframe] = React.useState<number>(0);
  const [tabIndex, setTabIndex] = React.useState<number>(0);

  const { averages, best } = useRaceStats(timeframe);

  const handleTimeframeChange = (event: SelectChangeEvent) => {
    setTimeframe(parseInt(event.target.value));
  };

  const handleTabChange = (event: React.SyntheticEvent, value: number) => {
    setTabIndex(value);
  };

  const handleTabChangeIndex = (index: number) => {
    setTabIndex(index);
  };

  return (
    <>
      <Box
        sx={{ borderBottom: 1, borderColor: "divider", mb: 2, width: "100%" }}
      >
        <Tabs value={tabIndex} onChange={handleTabChange}>
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
              value={`${timeframe}`}
              onChange={handleTimeframeChange}
            >
              <MenuItem value={0}>All Time</MenuItem>
              <MenuItem value={1}>Last 100 Races</MenuItem>
              <MenuItem value={1}>Last 10 Races</MenuItem>
            </Select>
          </FormControl>
          <StatSection title="Averages" data={averages} />
          <StatSection title="Best Race" data={best} />
        </Box>
        <Grid container spacing={3}>
          <Grid item xs={12}>
            <Line data={graphData} />
          </Grid>
        </Grid>
      </SwipeableViews>
    </>
  );
}
