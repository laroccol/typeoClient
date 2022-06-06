import React from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import { calculateWPMColor } from "../../game/feedback/SpeedProgress";

export default function StatKeyboard({ data }: { data: number[] }) {
  const filteredData = data.filter((wpm) => wpm !== 0);
  const min = Math.min(...filteredData);
  const max = Math.max(...filteredData);
  const KeyboardButton = ({
    keyboardKey,
    children,
  }: {
    keyboardKey: string;
    children?: any;
  }) => {
    const keySpeed = data[keyboardKey.charCodeAt(0) - 97];
    return (
      <Tooltip
        title={keySpeed === 0 ? "None" : `WPM: ${keySpeed.toFixed(1)}`}
        placement="top"
      >
        <Button
          variant="outlined"
          color="secondary"
          id={keyboardKey}
          sx={{
            minHeight: 65,
            minWidth: 65,
            m: 1,
            textTransform: "none",
            backgroundColor:
              keySpeed === 0
                ? "inherit"
                : calculateKeySpeedColor(keySpeed, min, max),
            "&:hover": {
              backgroundColor:
                keySpeed === 0
                  ? "inherit"
                  : calculateKeySpeedColor(keySpeed, min, max),
              opacity: 0.8,
            },
          }}
        >
          <Typography>{keyboardKey}</Typography>
        </Button>
      </Tooltip>
    );
  };

  return (
    <Box mb={50} textAlign="center">
      <Box>
        <KeyboardButton keyboardKey="q" />
        <KeyboardButton keyboardKey="w" />
        <KeyboardButton keyboardKey="e" />
        <KeyboardButton keyboardKey="r" />
        <KeyboardButton keyboardKey="t" />
        <KeyboardButton keyboardKey="y" />
        <KeyboardButton keyboardKey="u" />
        <KeyboardButton keyboardKey="i" />
        <KeyboardButton keyboardKey="o" />
        <KeyboardButton keyboardKey="p" />
      </Box>
      <Box>
        <KeyboardButton keyboardKey="a" />
        <KeyboardButton keyboardKey="s" />
        <KeyboardButton keyboardKey="d" />
        <KeyboardButton keyboardKey="f" />
        <KeyboardButton keyboardKey="g" />
        <KeyboardButton keyboardKey="h" />
        <KeyboardButton keyboardKey="j" />
        <KeyboardButton keyboardKey="k" />
        <KeyboardButton keyboardKey="l" />
      </Box>
      <Box>
        <KeyboardButton keyboardKey="z" />
        <KeyboardButton keyboardKey="x" />
        <KeyboardButton keyboardKey="c" />
        <KeyboardButton keyboardKey="v" />
        <KeyboardButton keyboardKey="b" />
        <KeyboardButton keyboardKey="n" />
        <KeyboardButton keyboardKey="m" />
      </Box>
    </Box>
  );
}

export function calculateKeySpeedColor(
  wpm: number,
  min: number,
  max: number
): string {
  const percentage = (wpm - min) / (max - min);
  const red = (1 - percentage) * 255 + 50;
  const green = percentage * 255 + 50;
  return `rgb(${red},${green},50)`;
}

function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num;
}
