import React, { useState } from "react";
import { Grid } from "@mui/material";
import UpdateProfileComponent from "../../components/profile/update-profile";

export default function UpdateProfile() {
  return (
    <Grid container spacing={3}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <UpdateProfileComponent />
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
