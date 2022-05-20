import React from "react";
import { styled } from "@mui/material/styles";
import PropTypes from "prop-types";
import LinearProgress from "@mui/material/LinearProgress";
import Typography from "@mui/material/Typography";
import Grid from "@mui/material/Grid";

const PREFIX = "SpeedProgress";

interface LPWLProps {
  label: number | string;
  value: number;
  fillColor: string;
}

export function LinearProgressWithLabel(props: LPWLProps) {
  const classes = {
    colorPrimary: `${PREFIX}-colorPrimary`,
    barColorPrimary: `${PREFIX}-barColorPrimary`,
  };

  const Root = styled(Grid)({
    [`& .${classes.colorPrimary}`]: {
      background: "white",
    },
    [`& .${classes.barColorPrimary}`]: {
      background: props.fillColor,
      borderRight: "1px solid black",
    },
  });

  return (
    <Root>
      <Grid container spacing={3} alignItems="center">
        <Grid item xs={10}>
          <LinearProgress
            variant="determinate"
            {...props}
            classes={{
              colorPrimary: classes.colorPrimary,
              barColorPrimary: classes.barColorPrimary,
            }}
          />
        </Grid>
        <Grid item xs={2}>
          <Typography variant="h5" color="textSecondary">
            {props.label}
          </Typography>
        </Grid>
      </Grid>
    </Root>
  );
}

LinearProgressWithLabel.propTypes = {
  /**
   * The value of the progress indicator for the determinate and buffer variants.
   * Value between 0 and 100.
   */
  value: PropTypes.number.isRequired,
};

interface SpeedProgressProps {
  wpm: number;
  sidePadding?: number;
}

export default function SpeedProgress({
  wpm,
  sidePadding,
}: SpeedProgressProps) {
  const StyledRoot = styled("div")(() => ({
    width: "100%",
    padding: `0px ${sidePadding}`,
  }));
  return (
    <StyledRoot>
      <Grid container spacing={3}>
        <Grid item xs={2}></Grid>
        <Grid item xs={8}>
          <LinearProgressWithLabel
            label={wpm}
            value={clamp((wpm / 200) * 100, 0, 100)}
            fillColor={calculateWPMColor(wpm)}
          />
        </Grid>
        <Grid item xs={2}></Grid>
      </Grid>
    </StyledRoot>
  );
}

export function calculateWPMColor(wpm: number): string {
  const red = wpm * 3;
  const green = wpm > 100 ? 255 - (wpm - 100) ** 1.203 : 255;
  return `rgb(${red},${green},0)`;
}

function clamp(num: number, min: number, max: number): number {
  return num <= min ? min : num >= max ? max : num;
}
