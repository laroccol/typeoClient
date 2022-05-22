import React from "react";
import Averages from "../../components/stats/Averages";
import { Grid } from "@mui/material";
import Bests from "../../components/stats/Bests";

export default function Stats() {
  return (
    <>
      <Grid container spacing={3} marginTop={10}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Averages />
            </Grid>
            <Grid item xs={12}>
              <Bests />
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
    </>
  );
}
