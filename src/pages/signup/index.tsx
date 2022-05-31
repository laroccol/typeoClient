import React, { useState } from "react";
import { Grid } from "@mui/material";
import SignupComponent from "../../components/profile/signup";

export default function Signup() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <SignupComponent />
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
