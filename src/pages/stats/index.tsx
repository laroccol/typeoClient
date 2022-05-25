import React from "react";
import { Grid } from "@mui/material";
import MainStats from "../../components/stats";

export default function Stats() {
  return (
    <>
      <Grid container spacing={3} marginTop={10}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <Grid container spacing={3}>
            <MainStats />
          </Grid>
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
    </>
  );
}
