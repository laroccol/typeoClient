import React from "react";
import { Box, Button, Tooltip, Typography } from "@mui/material";
import { calculateWPMColor } from "../../game/feedback/SpeedProgress";
import { GridCard } from "../../common";

interface StatKeyboardProps {
  data: number[];
  title: string;
}

export default function StatKeyboard({ data, title }: StatKeyboardProps) {
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
        title={keySpeed ? `WPM: ${keySpeed.toFixed(1)}` : "None"}
        placement="top"
      >
        <Button
          variant="outlined"
          color="secondary"
          id={keyboardKey}
          sx={{
            minHeight: 50,
            minWidth: 50,
            m: 1,
            textTransform: "none",
            borderColor: keySpeed
              ? calculateKeySpeedColor(keySpeed, min, max)
              : "inherit",
            backgroundColor: keySpeed
              ? calculateKeySpeedBackgroundColor(keySpeed, min, max)
              : "inherit",
            "&:hover": {
              backgroundColor: keySpeed
                ? calculateKeySpeedBackgroundColor(keySpeed, min, max)
                : "inherit",
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
    <GridCard sx={{ my: 3, textAlign: "center" }}>
      <Typography variant="h5" p={2}>
        {title}
      </Typography>
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
    </GridCard>
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
  return `rgb(${red},${green},80)`;
}

export function calculateKeySpeedBackgroundColor(
  wpm: number,
  min: number,
  max: number
): string {
  const percentage = (wpm - min) / (max - min);
  const red = (1 - percentage) * 255 + 50;
  const green = percentage * 255 + 50;
  return `rgba(${red},${green},100, 0.4)`;
}

function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num;
}
