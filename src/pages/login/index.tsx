import React, { useState } from "react";
import { Grid } from "@mui/material";

import LoginComponent from "../../components//profile/login";

export default function Login() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <LoginComponent />
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
