import React from "react";
import StandardGame from "../components/Standard";
import { useGameSettings } from "../../../contexts/GameSettings";

export default function SoloGame() {
  const { gameSettings } = useGameSettings();

  return <StandardGame settings={gameSettings} />;
}
