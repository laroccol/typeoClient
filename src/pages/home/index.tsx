import React, { useState, useEffect } from "react";
import { useHistory } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import Grid from "@mui/material/Grid";
import SoloGame from "../../components/game/types/SoloGame";

interface HomeProps {
  location?: {
    state: {
      online?: boolean;
    };
  };
}

export default function Home(props: HomeProps) {
  const { currentUser, logout } = useAuth();
  const [test, setTest] = useState<string>("");
  const history = useHistory();
  console.log(props.location?.state);

  return (
    <Grid container spacing={3}>
      <Grid item xs={1.5}>
        {/* {currentUser.uid} */}
      </Grid>
      <Grid item xs={9}>
        <SoloGame />
      </Grid>
      <Grid item xs={1.5}>
        {/* <Button onClick={logout}>Logout</Button>
        <Button
          onClick={() => {
            UserAPI.sendFriendRequest(
              currentUser,
              "Xp7BBf4GidPtZoDuuFPqC6bo6s73"
            )
              .then((result) => {
                //console.log(result);
              })
              .catch((err) => {
                console.log(err.response?.data);
              });
          }}
        >
          Get Players
        </Button> */}
      </Grid>
    </Grid>
  );
}
