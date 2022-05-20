import React from "react";
import { GridCard } from "../../common";
import { Grid } from "@mui/material";
import {
  calculateWPMColor,
  LinearProgressWithLabel,
} from "../feedback/SpeedProgress";
import { PlayerData } from "../types/FFAGame";

interface RacersBoxProps {
  racerData: Array<PlayerData>;
}

export default function RacersBox({ racerData }: RacersBoxProps) {
  return (
    <GridCard accent={true}>
      {racerData.map((racer) => {
        return (
          <Grid key={racer.id} container spacing={0}>
            <Grid item xs={2}>
              {racer.id.substring(0, 8)}
            </Grid>
            <Grid item xs={10}>
              <LinearProgressWithLabel
                label={racer.wpm}
                value={racer.percentage * 100}
                fillColor={calculateWPMColor(parseInt(racer.wpm))}
              />
            </Grid>
          </Grid>
        );
      })}
    </GridCard>
  );
}
