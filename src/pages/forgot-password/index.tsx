import React, { useState } from "react";
import { Grid } from "@mui/material";
import ForgotPasswordComponent from "../../components/profile/forgot-password";

export default function ForgotPassword() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <ForgotPasswordComponent />
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
