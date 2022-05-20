import React from "react";
import { Grid, Typography, Card, Button, IconButton } from "@mui/material";
import StandardGame from "../components/Standard";
import Settings from "../components/Settings";
import { useGameSettings } from "../../../contexts/GameSettings";
import { styled } from "@mui/system";
import { io, Socket } from "socket.io-client";
import API_URL from "../../../constants/api";
import { useAuth } from "../../../contexts/AuthContext";
import Searching from "../components/Searching";

export default function SoloGame() {
  const { gameSettings } = useGameSettings();

  return <StandardGame settings={gameSettings} />;
}
