import React from "react";
import ReactDOM from "react-dom";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import Router from "./Router";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import CssBaseline from "@mui/material/CssBaseline";
import { GameSettingsProvider } from "./contexts/GameSettings";
import { SocketProvider } from "./contexts/SocketContext";
import { SnackbarProvider } from "notistack";
import ChatBox from "./components/chat/ChatBox";

const theme = createTheme({
  palette: {
    mode: "dark",
    primary: {
      main: "#ffffff",
      light: "#eb1c24",
      dark: "#eb1c24",
    },
    secondary: {
      main: "#ffffff",
      light: "#ffffff",
      dark: "#ffffff",
      // second: "#e25048",
      // third: "#8fcf39",
      // highlight: "rgba(255,0,0,0.8)",
    },
    error: {
      main: "#eb1c24",
      light: "#ff0000",
      dark: "#ff0000",
    },
    background: {
      default: "#37474f",
      paper: "#263238",
      //incorrect: "rgba(255,0,0,0.25)",
    },
    //solid: {
    //main: "#ff0000",
    //},
    text: {
      secondary: "#999ea3",
    },
    //textColor: {
    //none: "#999ea3",
    //correct: "#ffffff",
    //incorrect: "#ff0000",
    // },
  },
  typography: {
    fontFamily: ['"Overpass"', "sans-serif"].join(","),
    body1: {
      letterSpacing: "0.1rem",
    },
  },
});
ReactDOM.render(
  <AuthProvider>
    <SocketProvider>
      <ThemeProvider theme={theme}>
        <GameSettingsProvider>
          <CssBaseline />
          <SnackbarProvider
            maxSnack={3}
            anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          >
            <Router />
            {/* <ChatBox /> */}
          </SnackbarProvider>
        </GameSettingsProvider>
      </ThemeProvider>
    </SocketProvider>
  </AuthProvider>,
  document.getElementById("root")
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
//reportWebVitals();
