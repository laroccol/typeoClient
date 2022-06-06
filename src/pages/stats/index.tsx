import React from "react";
import ReactGA from "react-ga";
import { Grid } from "@mui/material";
import MainStats from "../../components/stats";

export default function Stats() {
  React.useEffect(() => {
    ReactGA.event({
      category: "User",
      action: "Stats Page Visited",
    });
  }, []);
  return (
    <>
      <Grid container spacing={3} marginTop={2}>
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
