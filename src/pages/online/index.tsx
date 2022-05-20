import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Grid from "@mui/material/Grid";
import FFAGame from "../../components/game/types/FFAGame";

export default function Online() {
  const { currentUser, logout } = useAuth();
  const [test, setTest] = useState<string>("");
  const history = useHistory();

  return (
    <Grid container spacing={3}>
      <Grid item xs={2}></Grid>
      <Grid item xs={8}>
        <FFAGame />
      </Grid>
      <Grid item xs={2}></Grid>
    </Grid>
  );
}
