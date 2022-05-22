import {
  Divider,
  Grid,
  Box,
  Typography,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import React from "react";
import { GridCard } from "../../common";
import StatCard from "../components/StatCard";
import Select, { SelectChangeEvent } from "@mui/material/Select";

interface StatSectionProps {
  data: Array<{ title: string; stat: number }>;
  timeFrame: string;
  setTimeFrame: any;
  title: string;
}

export default function StatSection({
  data,
  timeFrame,
  setTimeFrame,
  title,
}: StatSectionProps) {
  const handleChange = (event: SelectChangeEvent) => {
    setTimeFrame(event.target.value);
  };

  return (
    <>
      <GridCard>
        <Box paddingBottom={2}>
          <Typography variant="h5" display="inline-block">
            {title}
          </Typography>
          <FormControl variant="standard" sx={{ mx: 5, minWidth: 200 }}>
            <InputLabel id="averages-timeframe-label">Timeframe</InputLabel>
            <Select
              label="Timeframe"
              labelId="averages-timeframe-label"
              value={timeFrame}
              onChange={handleChange}
            >
              <MenuItem value={0}>All Time</MenuItem>
              <MenuItem value={1}>Last 10 Days</MenuItem>
            </Select>
          </FormControl>
          <Divider />
        </Box>
        <Grid container spacing={3}>
          {data.map(({ title, stat }) => (
            <Grid
              zeroMinWidth
              key={`${title}_${stat}`}
              item
              xs={12}
              sm={12}
              md={6}
              lg={4}
              xl={2.5}
            >
              <StatCard title={title} stat={stat} />
            </Grid>
          ))}
        </Grid>
      </GridCard>
    </>
  );
}
